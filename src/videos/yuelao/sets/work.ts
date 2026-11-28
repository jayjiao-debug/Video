// WORK (place "work", island x 200): 林小满's open-plan office floor in a Chinese city, a winter afternoon (14:00,
// grey-white daylight through the glass wall behind her). The back wall (-z) is floor-to-ceiling glass on thin mullions,
// a painted skyline outside (far card, NOINK, unlit). Her desk in the middle (WORK.desk), her low swivel chair behind it
// (WORK.chair: its back on the -z side), the floor at WORK.tie and between the desk and the lens kept clear (the camera
// goes down to 0.5 m there and looks under the desk at her feet: real legs, no panel on the +x half, a star base).
// Round her: rows of empty desks with dark monitors, carpet tiles, strip lights, the sprint whiteboard on the -x wall,
// a wall clock, a water dispenser, the slogan on the +x wall. No +z wall (it is behind the lens, never seen).
// PARAMS
//   glow  0..1  her laptop's cool light on her side of the desk (glow cards, a pool, the point light)
//   late  0..1  0 = afternoon; 1 = evening: deep blue sky with lit windows, only the strips over her desk on, the floor
//               dim, the clock at 21:30; the figures' light follows (cast)
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { ceilQuad, wallQuad, plasterTex } from "../../romeo/sets/parts/b_common";
import { farCard } from "../../../kit/sets/okit";
import { ISLAND, WORK as D } from "../places";
import { maker, boxG, paint, rng, css, mix, blotch, NOINK, glowCard, lightPool, levelQuad, bar, FONT, lightRig, V, flatFace } from "./common";

const X0 = ISLAND.work;
const FILL: EnvSpec = { frame: "world", stops: [[-90, [0.3, 0.31, 0.35]], [0, [0.58, 0.6, 0.66]], [90, [0.68, 0.72, 0.8]]], boxes: [{ az: 180, el: 20, rot: 0, w: 40, h: 24, soft: 18, col: [1.0, 1.04, 1.12] }] };
const DAY_CAST = { key: [-0.35, 0.72, 0.6], tint: [0.95, 0.97, 1.0], tintK: 0.5, gain: 1.0, shade: [0.98, 0.97, 1.36], shadeK: 0.42, broad: 0.2, sheen: 0.12 };
const LATE_CAST = { key: [0.05, 0.85, 0.52], tint: [0.88, 0.92, 1.0], tintK: 0.62, gain: 0.86, shade: [1.0, 0.92, 1.6], shadeK: 0.5, broad: 0.3, sheen: 0.22 };
const LOOK: PlaceLook = {
  bg: "#7d8aa0",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.6, color: "#2a2c3a" },
  cast: flatFace({ grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.92, 1.0], wrap: [30, 60], edge: 0.14, bodySat: 0.13, lift: 0.03, contactLen: 0.3, ...DAY_CAST, ...BAKED_LIGHT }) as unknown as CastLight,
  fill: FILL, bloom: 0.35,
};
const PARAMS: Record<string, ParamValue> = { glow: 1, late: 0 };

/** where things stand on her desk (local) */
const DK = { x: D.desk.x, z: D.desk.z, top: D.desk.top, x0: D.desk.x - D.desk.w / 2, x1: D.desk.x + D.desk.w / 2, z0: D.desk.z - D.desk.d / 2, z1: D.desk.z + D.desk.d / 2 };
/** the laptop: its base centre on the desk, the hinge (on the +z side: the screen faces her), the lid's tilt back */
export const LAPTOP = { x: D.desk.x, z: D.desk.z - 0.21, w: 0.3, d: 0.2, lid: 0.2, tilt: 0.26 };
const lidTop = DK.top + 0.012 + LAPTOP.lid * Math.cos(LAPTOP.tilt);   // 0.825
void lidTop;
/** the side desks: column centres (x) and row centres (z) */
const SIDE_X = [-3.45, -1.95, 2.2, 3.7], SIDE_Z = [-2.05, -0.35, 1.35, 3.05];
/** the ceiling strips: columns and rows; the ones over her desk stay on at night */
const STRIP_X = [-3.6, -1.8, 0, 1.8, 3.6], STRIP_Z = [-2.3, -1.0, 0.3, 1.6, 2.9];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ===================================================================================================== paint
const carpetTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(201), n = 2, s = W / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    g.fillStyle = css(mix("#6c788b", r() < 0.5 ? "#5f6b7e" : "#77839a", 0.25 + 0.3 * r())); g.fillRect(i * s, j * s, s, s);
    const across = (i + j) % 2 === 0;   // quarter-turned tiles
    g.strokeStyle = css("#4f5a6c", 0.16); g.lineWidth = 2;
    for (let k = 4; k < s; k += 7) { g.beginPath(); if (across) { g.moveTo(i * s, j * s + k); g.lineTo(i * s + s, j * s + k); } else { g.moveTo(i * s + k, j * s); g.lineTo(i * s + k, j * s + s); } g.stroke(); }
    for (let k = 0; k < 4; k++) blotch(g, i * s + s * r(), j * s + s * r(), s * (0.15 + 0.2 * r()), r() < 0.5 ? "#566174" : "#8592a8", 0.08);
  }
  g.strokeStyle = css("#47505f", 0.45); g.lineWidth = 3;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, H); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(W, i * s); g.stroke(); }
}, true);
const ceilTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(202); g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 300; i++) { g.fillStyle = css("#9fa4ad", 0.25); g.fillRect(W * r(), H * r(), 2, 2); }
  g.strokeStyle = css("#9ca1aa", 0.9); g.lineWidth = 5;
  for (const p of [0, W / 2, W]) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, H); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(W, p); g.stroke(); }
}, true);
/** the laptop's lid back: brushed grey, stickers (a cat, a "bug", 能跑就行) */
const lidTex = () => paint(512, 340, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#b6bcc6"); gr.addColorStop(1, "#9ea5b0"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // a plain logo dot in the middle
  g.fillStyle = css("#d7dbe1", 0.8); g.beginPath(); g.arc(W / 2, H / 2, 20, 0, 7); g.fill();
  // the cat
  const cx = 130, cy = 110; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(cx, cy, 58, 0, 7); g.fill();
  g.fillStyle = "#f2a64a"; g.beginPath(); g.arc(cx, cy + 6, 44, 0, 7); g.fill();
  g.beginPath(); g.moveTo(cx - 40, cy - 14); g.lineTo(cx - 34, cy - 58); g.lineTo(cx - 8, cy - 34); g.fill();
  g.beginPath(); g.moveTo(cx + 40, cy - 14); g.lineTo(cx + 34, cy - 58); g.lineTo(cx + 8, cy - 34); g.fill();
  g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(cx - 16, cy + 2, 6, 0, 7); g.arc(cx + 16, cy + 2, 6, 0, 7); g.fill();
  g.strokeStyle = "#2a2a30"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 8, cy + 20); g.quadraticCurveTo(cx, cy + 27, cx, cy + 18); g.quadraticCurveTo(cx, cy + 27, cx + 8, cy + 20); g.stroke();
  // the bug
  const bx = 370, by = 230; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(bx, by, 78, 62, 0, 0, 7); g.fill();
  g.strokeStyle = "#2a2a30"; g.lineWidth = 5;
  for (const s of [-1, 1]) for (const k of [-18, 2, 22]) { g.beginPath(); g.moveTo(bx + s * 20, by + k); g.lineTo(bx + s * 44, by + k - 8); g.stroke(); }
  g.fillStyle = "#3a8f5c"; g.beginPath(); g.ellipse(bx, by + 4, 24, 32, 0, 0, 7); g.fill();
  g.fillStyle = "#2a2a30"; g.beginPath(); g.arc(bx, by - 32, 12, 0, 7); g.fill();
  g.fillStyle = "#2a2a30"; g.font = `bold 30px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BUG", bx, by + 46);
  // 能跑就行
  g.save(); g.translate(360, 82); g.rotate(-0.08); g.fillStyle = "#2f4a7a"; g.fillRect(-82, -26, 164, 52);
  g.fillStyle = "#ffffff"; g.font = `bold 34px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("能跑就行", 0, 2); g.restore();
});
/** her screen (seen only from her side): an editor */
const codeTex = () => paint(256, 170, (g, W, H) => {
  const r = rng(205); g.fillStyle = "#1d2433"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#2a3346"; g.fillRect(0, 0, 40, H);
  const cols = ["#7fb4ff", "#c3e88d", "#f78c6c", "#c792ea", "#d0d6e0"];
  for (let y = 8; y < H - 6; y += 9) { let x = 48 + 8 * Math.floor(r() * 4); const n = 1 + Math.floor(r() * 4); for (let k = 0; k < n; k++) { const w = 12 + 40 * r(); g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y, w, 4); x += w + 6; } }
});
/** the sprint board */
const boardTex = () => paint(1024, 560, (g, W, H) => {
  const r = rng(207); g.fillStyle = "#f2f3f1"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) blotch(g, W * r(), H * r(), 120, "#c9ccd4", 0.12);   // old ghosts of wiped marker
  g.strokeStyle = "#3a4a6a"; g.lineWidth = 4; g.fillStyle = "#3a4a6a"; g.font = `bold 34px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  const cols = ["待办", "进行中", "测试", "完成"], top = 150, cw = (W - 40) / 4;
  cols.forEach((c, i) => { const x = 20 + i * cw; g.fillText(c, x + cw / 2, top - 26); if (i) { g.beginPath(); g.moveTo(x, top - 50); g.lineTo(x + (r() - 0.5) * 6, H - 20); g.stroke(); } });
  g.beginPath(); g.moveTo(20, top - 4); g.lineTo(W - 20, top + 2); g.stroke();
  const notes = ["#ffe066", "#ffb3c1", "#9be3f0", "#b8f2a0", "#ffd08a"], counts = [7, 5, 3, 1];
  counts.forEach((n, i) => {
    for (let k = 0; k < n; k++) {
      const x = 20 + i * cw + 20 + (k % 2) * (cw / 2 - 6) + (r() - 0.5) * 8, y = top + 16 + Math.floor(k / 2) * 92 + (r() - 0.5) * 8, s = cw / 2 - 30;
      g.save(); g.translate(x + s / 2, y + s * 0.45); g.rotate((r() - 0.5) * 0.12);
      g.fillStyle = css("#000000", 0.12); g.fillRect(-s / 2 + 3, -s * 0.4 + 4, s, s * 0.8);
      g.fillStyle = notes[Math.floor(r() * notes.length)]; g.fillRect(-s / 2, -s * 0.4, s, s * 0.8);
      g.strokeStyle = css("#3a3a48", 0.75); g.lineWidth = 3;
      for (let l = 0; l < 3; l++) { g.beginPath(); g.moveTo(-s / 2 + 10, -s * 0.22 + l * 18); g.lineTo(-s / 2 + 10 + (s - 24) * (0.5 + 0.5 * r()), -s * 0.22 + l * 18 + (r() - 0.5) * 3); g.stroke(); }
      g.restore();
    }
  });
  // the scrawl, red marker, a little crooked
  g.save(); g.translate(W * 0.36, 58); g.rotate(-0.035);
  g.fillStyle = "#c8282e"; g.font = `bold 66px ${FONT}`; g.textAlign = "left"; g.textBaseline = "middle";
  const a = "上线倒计时 ", b = "3", c = " 天", wa = g.measureText(a).width, wb = g.measureText(b).width, wc = g.measureText(c).width, x0 = -(wa + wb + wc) / 2;
  g.fillText(a, x0, 0); g.fillText(b, x0 + wa, 0); g.fillText(c, x0 + wa + wb, 0);
  g.strokeStyle = "#c8282e"; g.lineWidth = 6; g.beginPath(); g.ellipse(x0 + wa + wb / 2, 2, wb / 2 + 20, 42, 0, 0, 7); g.stroke(); g.restore();
  g.textAlign = "center";
  g.fillStyle = "#c8282e"; g.font = `bold 48px ${FONT}`; g.fillText("!!!", W * 0.74, 58);
  g.fillStyle = "#3a4a6a"; g.font = `28px ${FONT}`; g.textAlign = "right"; g.fillText("Sprint 23", W - 34, 50);
});
const sloganTex = () => paint(1024, 360, (g, W, H) => {
  g.clearRect(0, 0, W, H); g.fillStyle = "#2f4470"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold 112px ${FONT}`;
  g.fillText("今天不努力", W / 2, H * 0.27); g.fillText("明天努力找工作", W / 2, H * 0.73);
});
const clockTex = () => paint(256, 256, (g, S) => {
  g.fillStyle = "#f6f6f2"; g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 2, 0, 7); g.fill();
  g.strokeStyle = "#2a2e38"; g.lineCap = "round";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.lineWidth = i % 3 ? 5 : 10; g.beginPath(); g.moveTo(S / 2 + Math.sin(a) * S * 0.36, S / 2 - Math.cos(a) * S * 0.36); g.lineTo(S / 2 + Math.sin(a) * S * 0.44, S / 2 - Math.cos(a) * S * 0.44); g.stroke(); }
});
const streakTex = () => paint(512, 256, (g, W, H) => {
  g.clearRect(0, 0, W, H); const r = rng(209);
  for (let i = 0; i < 5; i++) { const x = W * r(); const gr = g.createLinearGradient(x, 0, x + 80, H); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40 + 60 * r(), 0); g.lineTo(x + 140, H); g.lineTo(x + 80, H); g.fill(); }
});
// v6 (Jay's note on v5 f3421, "props merging into table"): the desks get a pale oak top so the white things on them
// stand off it, every prop gets a soft contact shadow, and the cups and the pot get printed sides.
/** the desks' tops: pale oak veneer, the grain running along the desk, a darker edge band */
const oakTex = () => paint(1024, 512, (g, W, H) => {
  const r = rng(241);
  g.fillStyle = "#d9bb8f"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) { const y = r() * H, h = 24 + 70 * r(); g.fillStyle = css(r() < 0.5 ? "#c9a675" : "#e6cba3", 0.4); g.fillRect(0, y, W, h); }
  for (let i = 0; i < 4; i++) {
    // flat-sawn figure: nested arches
    const cx = W * (0.12 + 0.25 * i + 0.06 * r()), cy = H * (0.2 + 0.6 * r());
    g.strokeStyle = css("#a98051", 0.2); g.lineWidth = 1.6;
    for (let j = 0; j < 6; j++) { g.beginPath(); g.ellipse(cx, cy, 120 + j * 24, 16 + j * 8, 0, Math.PI, Math.PI * 2); g.stroke(); }
  }
  for (let i = 0; i < 80; i++) {
    // the grain: long gentle waves along the desk
    const y0 = r() * H, a = 2 + 6 * r(), k = 0.004 + 0.01 * r(), ph = r() * 7;
    g.strokeStyle = css(r() < 0.7 ? "#b38b5b" : "#9b7545", 0.16 + 0.22 * r()); g.lineWidth = 0.8 + 1.5 * r();
    g.beginPath();
    for (let x = 0; x <= W; x += 16) { const y = y0 + a * Math.sin(x * k + ph) + 2.5 * Math.sin(x * k * 3.1 + ph * 2); if (x === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
  }
  g.fillStyle = css("#9c7546", 0.55); g.fillRect(0, 0, W, 7); g.fillRect(0, H - 7, W, 7); g.fillRect(0, 0, 7, H); g.fillRect(W - 7, 0, 7, H);
});
/** a soft contact shadow: dark in the middle, gone at the rim */
const contactTex = () => paint(128, 128, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  gr.addColorStop(0, "rgba(34,26,24,0.7)"); gr.addColorStop(0.5, "rgba(34,26,24,0.45)"); gr.addColorStop(1, "rgba(34,26,24,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});
/** her mug's print: a sleeping cat's face on the side toward the room (u 0.5), a pink rim stripe */
const mugTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = "#f4f0e7"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e58a98"; g.fillRect(0, 9, W, 7);
  const cx = W * 0.5, cy = H * 0.56, ink = "#3b3431";
  g.fillStyle = ink;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 27, cy - 12); g.lineTo(cx + s * 22, cy - 38); g.lineTo(cx + s * 6, cy - 23); g.closePath(); g.fill(); }
  g.fillStyle = "#f4f0e7"; g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, 31, 25, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.lineWidth = 4; g.lineCap = "round";
  for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 12, cy - 3, 6, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
  g.fillStyle = "#e58a98"; g.beginPath(); g.arc(cx, cy + 7, 3.6, 0, Math.PI * 2); g.fill();
  g.lineWidth = 2.4;
  for (const s of [-1, 1]) for (const k of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 17, cy + 9 + k * 3); g.lineTo(cx + s * 42, cy + 6 + k * 8); g.stroke(); }
  g.fillStyle = "rgba(229,138,152,0.55)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 19, cy + 6, 6, 3.5, 0, 0, Math.PI * 2); g.fill(); }
});
/** the instant-noodle cup's print: cream, a red band with a white bowl and steam, a gold starburst */
const noodleTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = "#f5f0e4"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#d8442e"; g.fillRect(0, H * 0.3, W, H * 0.42);
  g.fillStyle = "#f2c14e"; g.fillRect(0, H * 0.27, W, H * 0.04); g.fillRect(0, H * 0.71, W, H * 0.04);
  const cx = W * 0.5, cy = H * 0.52;
  g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(cx, cy + 2, 20, 11, 0, 0, Math.PI); g.fill(); g.fillRect(cx - 21, cy - 1, 42, 4);
  g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.lineCap = "round";
  for (const s of [-8, 0, 8]) { g.beginPath(); g.moveTo(cx + s, cy - 6); g.bezierCurveTo(cx + s - 5, cy - 12, cx + s + 5, cy - 16, cx + s, cy - 22); g.stroke(); }
  g.fillStyle = "#f2c14e"; g.beginPath();
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, rr = i % 2 ? 9 : 16; g.lineTo(cx + 46 + Math.cos(a) * rr, cy - 6 + Math.sin(a) * rr); }
  g.closePath(); g.fill();
});
/** the plant pot's glaze: off-white, dark speckles, a blue line under the rim */
const potTex = () => paint(256, 128, (g, W, H) => {
  const r = rng(251);
  g.fillStyle = "#ece7dc"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#4f6f9a"; g.fillRect(0, H * 0.14, W, 4); g.fillRect(0, H * 0.2, W, 2);
  for (let i = 0; i < 160; i++) { g.fillStyle = css(r() < 0.7 ? "#6b5a4a" : "#9a8a76", 0.35 + 0.4 * r()); g.beginPath(); g.arc(W * r(), H * r(), 0.6 + 1.4 * r(), 0, Math.PI * 2); g.fill(); }
});
/** a tent calendar's page: 十一月 on a red band, the dates, one ringed in red */
const calTex = () => paint(160, 120, (g, W, H) => {
  g.fillStyle = "#f7f4ec"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#d8442e"; g.fillRect(0, 0, W, H * 0.26);
  g.fillStyle = "#ffffff"; g.font = `900 ${Math.round(H * 0.18)}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("十一月", W / 2, H * 0.135);
  g.fillStyle = "#6a6f7a";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) g.fillRect(W * (0.08 + c * 0.125), H * (0.36 + r * 0.155), W * 0.07, H * 0.08);
  g.strokeStyle = "#d8442e"; g.lineWidth = 4; g.beginPath(); g.ellipse(W * (0.115 + 5 * 0.125), H * (0.4 + 3 * 0.155), W * 0.075, H * 0.085, 0, 0, Math.PI * 2); g.stroke();
});

// ===================================================================================================== the skyline
type Tower = { layer: number; x: number; w: number; top: number; base: number; col: number; style: number; crown: number; seed: number };
const towers = (): Tower[] => {
  const r = rng(211), out: Tower[] = [];
  const layers = [{ n: 60, w: [2, 5], h: [0.5, 5], base: -4 }, { n: 34, w: [3, 7], h: [2, 9], base: -12 }, { n: 12, w: [5, 9], h: [5, 13], base: -26 }];
  layers.forEach((L, li) => { for (let i = 0; i < L.n; i++) out.push({ layer: li, x: -44 + 88 * r(), w: L.w[0] + (L.w[1] - L.w[0]) * r(), top: L.h[0] + (L.h[1] - L.h[0]) * r(), base: L.base, col: r(), style: Math.floor(r() * 3), crown: Math.floor(r() * 4), seed: Math.floor(r() * 1e6) }); });
  return out;
};
const skyPaint = (night: boolean) => (g: CanvasRenderingContext2D, k: { W: number; H: number; px: (x: number) => number; py: (y: number) => number; s: number }) => {
  const { W, H, py, s } = k, px = (x: number) => k.px(X0 + x);
  const sky = night ? ["#101a36", "#1f2d55", "#33447a"] : ["#7f8da6", "#97a3b8", "#aab3c2"];
  const gr = g.createLinearGradient(0, 0, 0, py(0)); gr.addColorStop(0, sky[0]); gr.addColorStop(0.7, sky[1]); gr.addColorStop(1, sky[2]); g.fillStyle = gr; g.fillRect(0, 0, W, py(0));
  // the haze and the city floor below the horizon
  const gg = g.createLinearGradient(0, py(0), 0, H); gg.addColorStop(0, night ? "#2a365c" : "#9aa3b3"); gg.addColorStop(1, night ? "#151c33" : "#7b8597"); g.fillStyle = gg; g.fillRect(0, py(0), W, H - py(0));
  if (!night) { const r = rng(212); for (let i = 0; i < 9; i++) blotch(g, W * r(), py(8 + 18 * r()), W * (0.06 + 0.08 * r()), "#b4bcc9", 0.18); }
  else { const r = rng(213); for (let i = 0; i < 200; i++) { g.fillStyle = css(r() < 0.7 ? "#f3d38a" : "#e8eefc", 0.5 + 0.4 * r()); g.fillRect(W * r(), py(-1 - 20 * r()), 2, 2); } }
  const pal = night
    ? [["#2a3558", "#24304f"], ["#1d2745", "#202b4a"], ["#151d36", "#192240"]]
    : [["#a0abbd", "#99a5b8"], ["#8794aa", "#7f8ca3"], ["#6c7a92", "#64728a"]];
  for (const t of towers()) {
    const r = rng(t.seed), c = pal[t.layer][t.col < 0.5 ? 0 : 1], x0 = px(t.x - t.w / 2), x1 = px(t.x + t.w / 2), y0 = py(t.top), y1 = py(t.base);
    g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (t.crown === 1) g.fillRect(x0 + (x1 - x0) * 0.3, y0 - 1.5 * s, (x1 - x0) * 0.4, 1.5 * s);
    if (t.crown === 2) { g.fillRect(px(t.x) - 0.08 * s, y0 - 4 * s, 0.16 * s, 4 * s); if (night) { g.fillStyle = "#ff5a4a"; g.beginPath(); g.arc(px(t.x), y0 - 4 * s, 0.25 * s, 0, 7); g.fill(); } }
    // its lit edge (the grey day from the upper left) and the facade
    g.fillStyle = css(night ? "#3a4670" : "#c2c9d4", night ? 0.35 : 0.35); g.fillRect(x0, y0, (x1 - x0) * 0.12, y1 - y0);
    const fw = 1.1 * s * (t.layer === 2 ? 1 : 0.7), fh = 0.95 * s * (t.layer === 2 ? 1 : 0.7);
    if (t.style === 0) {   // ribbon windows
      for (let y = y0 + fh * 0.6; y < y1; y += fh) { g.fillStyle = css(night ? "#0e1428" : "#55627a", night ? 0.5 : 0.18); g.fillRect(x0 + 2, y, x1 - x0 - 4, fh * 0.42); }
    } else {               // a grid
      for (let y = y0 + fh * 0.5; y < y1; y += fh) for (let x = x0 + fw * 0.3; x < x1 - fw * 0.4; x += fw) { g.fillStyle = css(night ? "#0e1428" : t.style === 1 ? "#5a677f" : "#b8c0cc", night ? 0.45 : 0.16); g.fillRect(x, y, fw * 0.6, fh * 0.55); }
    }
    if (night) {
      const p = 0.1 + 0.22 * r();
      for (let y = y0 + fh * 0.5; y < y1; y += fh) for (let x = x0 + fw * 0.3; x < x1 - fw * 0.4; x += fw) if (r() < p) { g.fillStyle = css(r() < 0.8 ? "#f6d58c" : "#dfe8ff", 0.7 + 0.3 * r()); g.fillRect(x, y, fw * 0.6, fh * 0.55); }
    }
  }
};

// ===================================================================================================== build
const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "work";
  const Mk = maker(K, group), X = (x: number) => X0 + x;
  // own materials (their env share and colour follow `late`, without touching the kit's shared cache)
  const lit: [THREE.MeshPhysicalMaterial, number, THREE.Color][] = [], cache = new Map<string, THREE.MeshPhysicalMaterial>();
  const M = (c: string, rough = 0.85, map: THREE.Texture | null = null) => {
    const key = `${c}|${rough}|${map ? map.uuid : ""}`; let m = cache.get(key);
    if (!m) { m = Mk.own(c, { rough, map }); cache.set(key, m); lit.push([m, m.envMapIntensity, m.color.clone()]); }
    return m;
  };
  const mFloor = M("#ffffff", 0.95, carpetTex()), mCeil = M("#ffffff", 0.95, ceilTex()), mWall = M("#ffffff", 0.95, plasterTex(215, "#d2d5da", "#b7bcc5", "#e4e6ea"));
  const mMull = M("#5d6470", 0.5), mMetal = M("#8a909a", 0.45), mDeskTop = M("#ffffff", 0.62, oakTex()), mDark = M("#2b2f38", 0.5), mScreenOff = M("#161a22", 0.3);
  // contact shadows (one material per strength); names end in "contact" so the checkers pass over them
  const contactMap = contactTex(), mContact = new Map<number, THREE.MeshBasicMaterial>();
  const contact = (x: number, z: number, rx: number, rz: number, y: number, a = 1, yaw = 0) => {
    let m = mContact.get(a);
    if (!m) { m = Mk.basic("#ffffff", { map: contactMap, transparent: true, opacity: a }); m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; mContact.set(a, m); }
    const s = Mk.mesh("work.contact", new THREE.PlaneGeometry(2 * rx, 2 * rz).rotateX(-Math.PI / 2).rotateY(yaw).translate(X(x), y + 0.0012, z), m, { cast: false, receive: false, noink: true });
    s.renderOrder = 2;
  };
  const mSeat = M("#3c4558", 0.9), mChrome = M("#a6acb5", 0.35), mPaper = M("#f1efe8", 0.9), mPed = M("#c6c9cf", 0.6);

  // ============================================================================================ the shell
  Mk.mesh("work.floor", levelQuad(X(D.x0), X(D.x1), D.z0, D.z1, 0, (x, z) => [x, -z]), mFloor, { cast: false });
  Mk.mesh("work.ceiling", ceilQuad(X(D.x0), X(D.x1), D.z0, D.z1, D.h, (x, z) => [x / 1.2, z / 1.2]), mCeil);
  Mk.mesh("work.wall.w", wallQuad([X(D.x0), D.z1], [X(D.x0), D.z0], 0, D.h, 3), mWall);
  Mk.mesh("work.wall.e", wallQuad([X(D.x1), D.z0], [X(D.x1), D.z1], 0, D.h, 3), mWall);
  // skirting on the side walls
  Mk.mesh("work.skirt", boxG(X(D.x0), X(D.x0 + 0.02), 0, 0.08, D.z0, D.z1), mMull); Mk.mesh("work.skirt", boxG(X(D.x1 - 0.02), X(D.x1), 0, 0.08, D.z0, D.z1), mMull);
  // the glass wall: sill, head, mullions every 1.25 m, a transom high up
  const zw = D.z0;
  Mk.mesh("work.glass.sill", boxG(X(D.x0), X(D.x1), 0, 0.07, zw - 0.06, zw + 0.03), mMull);
  Mk.mesh("work.glass.head", boxG(X(D.x0), X(D.x1), D.h - 0.12, D.h, zw - 0.06, zw + 0.03), mMull);
  Mk.mesh("work.glass.transom", boxG(X(D.x0), X(D.x1), 2.42, 2.46, zw - 0.04, zw + 0.01), mMull);
  for (let x = D.x0 + 1.25; x < D.x1 - 0.1; x += 1.25) Mk.mesh("work.glass.mullion", boxG(X(x - 0.025), X(x + 0.025), 0.07, D.h - 0.12, zw - 0.06, zw + 0.03), mMull);
  // a faint sheen on the glass
  const sheen = (() => { const m = Mk.mesh("work.glass.sheen", new THREE.PlaneGeometry(D.x1 - D.x0, D.h).translate(X(0), D.h / 2, zw - 0.01), Mk.basic("#e8eef8", { map: streakTex(), additive: true, opacity: 0.06 }), { cast: false, receive: false, noink: true }); m.renderOrder = 3; return m.material as THREE.MeshBasicMaterial; })();
  // outside: the city, day under night
  const dayCard = farCard(X(-45), X(45), -30, 40, -40, 2048, 1600, skyPaint(false)); dayCard.name = "work.city.day"; group.add(dayCard);
  const nightCard = farCard(X(-45), X(45), -30, 40, -39.5, 2048, 1600, skyPaint(true)); nightCard.name = "work.city.night"; group.add(nightCard);
  const mNight = nightCard.material as THREE.MeshBasicMaterial; mNight.transparent = true; mNight.depthWrite = false; nightCard.renderOrder = -49;

  // ============================================================================================ the ceiling strips
  const stripG = (x: number, z: number) => new THREE.BoxGeometry(0.1, 0.012, 1.16).translate(X(x), D.h - 0.034, z);
  const herStrip = (x: number, z: number) => x === 0 && (z === -1.0 || z === -2.3);
  {
    const P = new Part(K);
    for (const x of STRIP_X) for (const z of STRIP_Z) P.add(mMetal, new THREE.BoxGeometry(0.16, 0.03, 1.26).translate(X(x), D.h - 0.015, z), 0.004);
    P.into(group, "work.strips.housing", { cast: false, receive: false });
  }
  const mStripHer = Mk.basic("#f4f7ff"), mStripRest = Mk.basic("#f4f7ff");
  const mergeG = (gs: THREE.BufferGeometry[]) => { const out = new THREE.BufferGeometry(), pos: number[] = []; for (const g of gs) { const q = g.toNonIndexed(); pos.push(...(q.attributes.position.array as Float32Array)); } out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); out.computeVertexNormals(); return out; };
  const her: THREE.BufferGeometry[] = [], rest: THREE.BufferGeometry[] = [];
  for (const x of STRIP_X) for (const z of STRIP_Z) (herStrip(x, z) ? her : rest).push(stripG(x, z));
  Mk.mesh("work.strips.her", mergeG(her), mStripHer, { cast: false, receive: false, noink: true });
  Mk.mesh("work.strips.rest", mergeG(rest), mStripRest, { cast: false, receive: false, noink: true });

  // ============================================================================================ furniture
  const P = new Part(K), R = (yaw: number, x: number, y: number, z: number) => new THREE.Matrix4().makeRotationY(yaw).setPosition(X(x), y, z);
  /** a desk: top, four legs, a rail under the back edge (the underside stays open) */
  const desk = (x: number, z: number, w: number, d: number, top: number) => {
    P.add(mDeskTop, boxG(X(x - w / 2), X(x + w / 2), top - 0.028, top, z - d / 2, z + d / 2), 0.005);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const lx = x + sx * (w / 2 - 0.05), lz = z + sz * (d / 2 - 0.05); P.add(mMetal, boxG(X(lx - 0.018), X(lx + 0.018), 0, top - 0.028, lz - 0.018, lz + 0.018), 0.004); }
    P.add(mMetal, boxG(X(x - w / 2 + 0.05), X(x + w / 2 - 0.05), top - 0.09, top - 0.028, z - d / 2 + 0.04, z - d / 2 + 0.065), 0.004);
    contact(x, z, w * 0.56, d * 0.62, 0, 0.42);
  };
  /** a low swivel chair: seat (top at `top`), its back on the -z side, a column, a five-star base on casters */
  const chair = (x: number, z: number, top: number, yaw = 0) => {
    const m = R(yaw, x, 0, z);
    P.add(mSeat, new THREE.BoxGeometry(0.36, 0.06, 0.34).translate(0, top - 0.03, 0), 0.005, m);
    P.add(mSeat, new THREE.BoxGeometry(0.34, 0.34, 0.05).rotateX(-0.1).translate(0, top + 0.24, -0.2), 0.005, m);
    P.add(mDark, new THREE.BoxGeometry(0.05, 0.16, 0.025).translate(0, top + 0.03, -0.19), 0.004, m);
    P.add(mChrome, new THREE.CylinderGeometry(0.022, 0.022, top - 0.12, 10).translate(0, 0.06 + (top - 0.12) / 2, 0), 0.004, m);
    P.add(mDark, new THREE.CylinderGeometry(0.035, 0.045, 0.04, 12).translate(0, 0.075, 0), 0.004, m);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3, ex = Math.sin(a) * 0.24, ez = Math.cos(a) * 0.24;
      P.add(mDark, new THREE.BoxGeometry(0.03, 0.022, 0.24).translate(0, 0, 0.12).rotateY(a).translate(0, 0.06, 0), 0.004, m);
      P.add(mDark, new THREE.SphereGeometry(0.022, 8, 6).translate(ex, 0.022, ez), 0.003, m);
    }
  };
  /** a monitor on a stand (screen facing -z in its own frame) */
  const monitor = (x: number, z: number, top: number, yaw: number, w: number, h: number, face: THREE.Material) => {
    const m = R(yaw, x, top, z);
    P.add(mDark, new THREE.BoxGeometry(w, h, 0.022).translate(0, 0.11 + h / 2, 0), 0.005, m);
    P.add(face, new THREE.PlaneGeometry(w - 0.02, h - 0.02).rotateY(Math.PI).translate(0, 0.11 + h / 2, -0.0115), 0, m);
    P.add(mDark, new THREE.BoxGeometry(0.035, 0.13, 0.02).translate(0, 0.075, 0.03), 0.004, m);
    P.add(mDark, new THREE.BoxGeometry(0.16, 0.012, 0.11).translate(0, 0.006, 0.01), 0.004, m);
  };

  // ---- the empty desks
  {
    const r = rng(221), mBinder = [M("#3e6ea8", 0.7), M("#c7a24a", 0.7), M("#5c8a6a", 0.7)];
    for (const sx of SIDE_X) for (const sz of SIDE_Z) {
      desk(sx, sz, 1.5, 0.7, DK.top);
      monitor(sx + (r() - 0.5) * 0.2, sz + 0.12, DK.top, (r() - 0.5) * 0.2, 0.42, 0.26, mScreenOff);
      chair(sx + (r() - 0.5) * 0.2, sz - 0.47, D.chair.top, (r() - 0.5) * 0.4);
      if (r() < 0.6) P.add(mPaper, new THREE.BoxGeometry(0.2, 0.03 + 0.05 * r(), 0.15).translate(X(sx - 0.45), DK.top + 0.03, sz - 0.1), 0.004, undefined);
      if (r() < 0.5) P.add(mBinder[Math.floor(r() * 3)], new THREE.BoxGeometry(0.05, 0.22, 0.2).translate(X(sx + 0.55), DK.top + 0.11, sz + 0.15), 0.004);
      if (r() < 0.4) P.add(M("#e9e6df", 0.6), new THREE.CylinderGeometry(0.03, 0.028, 0.07, 12).translate(X(sx + 0.3), DK.top + 0.035, sz - 0.15), 0.004);
    }
  }

  // ---- her desk, chair and clutter
  desk(DK.x, DK.z, D.desk.w, D.desk.d, DK.top);
  P.add(mPed, boxG(X(DK.x0 + 0.04), X(DK.x0 + 0.42), 0.02, DK.top - 0.06, DK.z0 + 0.06, DK.z1 - 0.06), 0.005);   // drawer pedestal, -x end only
  for (const y of [0.18, 0.36, 0.5]) P.add(mDark, boxG(X(DK.x0 + 0.15), X(DK.x0 + 0.31), y, y + 0.012, DK.z0 + 0.045, DK.z0 + 0.06), 0.002);
  chair(D.chair.x, D.chair.z, D.chair.top, 0);
  contact(D.chair.x, D.chair.z, 0.3, 0.3, 0, 0.6);
  // THE LAPTOP: base, lid hinged on the +z side and tilted back, its back toward the lens
  {
    const L = LAPTOP, mAlu = M("#a9b0bb", 0.4), hinge = L.z + L.d / 2;
    contact(L.x, L.z, L.w * 0.6, L.d * 0.62, DK.top, 0.75);
    P.add(mAlu, new THREE.BoxGeometry(L.w, 0.012, L.d).translate(X(L.x), DK.top + 0.006, L.z), 0.004);
    P.add(mDark, new THREE.PlaneGeometry(L.w - 0.04, L.d * 0.5).rotateX(-Math.PI / 2).translate(X(L.x), DK.top + 0.0125, L.z + 0.01), 0);   // keys
    const lm = new THREE.Matrix4().makeRotationX(L.tilt).setPosition(X(L.x), DK.top + 0.012, hinge);
    P.add(mAlu, new THREE.BoxGeometry(L.w, L.lid, 0.008).translate(0, L.lid / 2, -0.004), 0.004, lm);
    P.add(M("#ffffff", 0.5, lidTex()), new THREE.PlaneGeometry(L.w - 0.012, L.lid - 0.012).translate(0, L.lid / 2, 0.0006), 0, lm);
    P.add(Mk.basic("#ffffff", { map: codeTex() }), new THREE.PlaneGeometry(L.w - 0.02, L.lid - 0.03).rotateY(Math.PI).translate(0, L.lid / 2 + 0.005, -0.0086), 0, lm);
  }
  // the second monitor to her right (-x), turned toward her; its screen lit
  monitor(-0.47, DK.z + 0.17, DK.top, -0.5, 0.4, 0.24, Mk.basic("#5a7fb0"));
  contact(-0.47, DK.z + 0.18, 0.1, 0.075, DK.top, 0.8, -0.5);
  // sticky notes: on the monitor's top edge hanging down its back, a fan on the desk
  {
    const r = rng(231), cols = ["#ffe066", "#ffb3c1", "#9be3f0", "#b8f2a0"];
    for (let i = 0; i < 3; i++) {
      const m = R(-0.5, -0.47, DK.top, DK.z + 0.17), x = -0.14 + i * 0.12;
      P.add(M(cols[i % 4], 0.9), new THREE.BoxGeometry(0.06, 0.06, 0.002).rotateZ((r() - 0.5) * 0.3).translate(x, 0.11 + 0.24 - 0.025, 0.0125), 0.002, m);
    }
    for (let i = 0; i < 4; i++) P.add(M(cols[(i + 1) % 4], 0.9), new THREE.BoxGeometry(0.065, 0.002, 0.065).rotateY((r() - 0.5) * 0.8).translate(X(0.3 + 0.07 * i), DK.top + 0.001 + 0.0021 * i, DK.z1 - 0.07 - 0.02 * r()), 0.002);
  }
  // the mug (a sleeping cat, coffee to the brim), the instant-noodle cup with its lid peeled and a fork, a tent calendar
  // (her phone is not part of the set: it is the prop "xmPhone", lying face down by her left hand in scene E)
  {
    const mMug = M("#ffffff", 0.5, mugTex()), mx = 0.41, mz = DK.z - 0.24;
    P.add(mMug, new THREE.CylinderGeometry(0.035, 0.032, 0.085, 20).rotateY(Math.PI).translate(X(mx), DK.top + 0.0425, mz), 0.004);
    P.add(M("#f4f0e7", 0.5), new THREE.TorusGeometry(0.022, 0.007, 6, 12).rotateY(Math.PI / 2).translate(X(mx + 0.038), DK.top + 0.045, mz), 0.003);
    P.add(M("#4a2f22", 0.3), new THREE.CircleGeometry(0.03, 18).rotateX(-Math.PI / 2).translate(X(mx), DK.top + 0.0857, mz), 0);
    contact(mx, mz, 0.05, 0.05, DK.top, 0.9);
    const nx = 0.47, nz = DK.z + 0.02, cup = new THREE.CylinderGeometry(0.048, 0.034, 0.1, 20, 1, true).rotateY(Math.PI).translate(X(nx), DK.top + 0.05, nz);
    P.add(M("#ffffff", 0.7, noodleTex()), cup, 0.004);
    P.add(M("#e8e2d2", 0.7), new THREE.CircleGeometry(0.034, 14).rotateX(-Math.PI / 2).translate(X(nx), DK.top + 0.002, nz), 0);
    P.add(M("#4c3a2a", 0.9), new THREE.CircleGeometry(0.046, 18).rotateX(-Math.PI / 2).translate(X(nx), DK.top + 0.09, nz), 0);
    P.add(M("#c9ccd2", 0.4), new THREE.CircleGeometry(0.05, 18, 0, Math.PI).rotateX(-Math.PI / 2 + 1.1).translate(X(nx), DK.top + 0.1 + 0.02, nz - 0.02), 0.003);
    P.add(M("#f3efe6", 0.6), bar(V(X(nx + 0.01), DK.top + 0.07, nz), V(X(nx + 0.04), DK.top + 0.17, nz + 0.02), 0.004, 0.004, 5), 0.002);
    contact(nx, nz, 0.058, 0.058, DK.top, 0.9);
    // the tent calendar: two leaves leaning on each other, the page toward the room
    const cm = R(0.25, -0.29, DK.top, DK.z - 0.2), mCal = M("#ffffff", 0.8, calTex());
    P.add(mCal, new THREE.PlaneGeometry(0.11, 0.085).rotateX(-0.3).translate(0, 0.04, 0.013), 0.002, cm);
    P.add(M("#f7f4ec", 0.8), new THREE.PlaneGeometry(0.11, 0.085).rotateY(Math.PI).rotateX(0.3).translate(0, 0.04, -0.013), 0.002, cm);
    P.add(M("#3a3f4a", 0.5), new THREE.CylinderGeometry(0.004, 0.004, 0.112, 8).rotateZ(Math.PI / 2).translate(0, 0.081, 0), 0.002, cm);
    contact(-0.29, DK.z - 0.2, 0.07, 0.045, DK.top, 0.7, 0.25);
  }
  // the half-dead plant: a white pot, a few upright green leaves, brown ones hanging over the rim
  {
    const px = 0.6, pz = DK.z1 - 0.1, mPot = M("#ffffff", 0.6, potTex()), mGreen = M("#5f8a4e", 0.8), mBrown = M("#9a7a4a", 0.9), mSoil = M("#3d2f25", 0.95);
    P.add(mPot, new THREE.CylinderGeometry(0.055, 0.042, 0.1, 18).translate(X(px), DK.top + 0.05, pz), 0.004);
    P.add(mSoil, new THREE.CircleGeometry(0.048, 18).rotateX(-Math.PI / 2).translate(X(px), DK.top + 0.1006, pz), 0);
    contact(px, pz, 0.072, 0.072, DK.top, 0.9);
    // green leaves stand up out of the soil; the brown ones bend over the rim from its edge (never through the pot)
    const leaf = (m: THREE.Material, len: number, pitch: number, yaw: number, rim = 0) => {
      const g = new THREE.SphereGeometry(1, 10, 6).scale(0.018, len / 2, 0.006).translate(0, len / 2, 0).rotateX(pitch).rotateY(yaw)
        .translate(X(px) + rim * Math.sin(yaw), DK.top + 0.1, pz + rim * Math.cos(yaw));
      P.add(m, g, 0.002);
    };
    leaf(mGreen, 0.15, 0.15, 0.4); leaf(mGreen, 0.13, 0.3, 2.2); leaf(mGreen, 0.12, 0.25, -1.4);
    leaf(mBrown, 0.075, 1.75, 1.0, 0.05); leaf(mBrown, 0.07, 1.9, -2.4, 0.05);
    for (const [dx, dz] of [[0.08, 0.035], [0.1, -0.02]]) P.add(mBrown, new THREE.SphereGeometry(1, 8, 4).scale(0.02, 0.003, 0.009).rotateY(dx * 10).translate(X(px + dx), DK.top + 0.003, pz + dz), 0.002);
  }
  // the desk lamp, back LEFT (v6: it stood in front of 月老 and crossed him in the close shot), its head over her side
  const lampAt = V(X(-0.66), DK.top, DK.z0 + 0.12), lampHead = V(X(-0.54), DK.top + 0.31, DK.z0 + 0.23);
  {
    const mL = M("#e7e3da", 0.5);
    P.add(mL, new THREE.CylinderGeometry(0.05, 0.055, 0.015, 16).translate(lampAt.x, lampAt.y + 0.0075, lampAt.z), 0.004);
    const elbow = V(X(-0.7), DK.top + 0.23, DK.z0 + 0.1);
    P.add(mL, bar(V(lampAt.x, lampAt.y + 0.01, lampAt.z), elbow, 0.007, 0.007, 6), 0.003);
    P.add(mL, bar(elbow, lampHead, 0.007, 0.007, 6), 0.003);
    P.add(mL, new THREE.ConeGeometry(0.045, 0.07, 14, 1, true).rotateZ(0.5).translate(lampHead.x, lampHead.y - 0.02, lampHead.z), 0.004);
    contact(-0.66, DK.z0 + 0.12, 0.07, 0.07, DK.top, 0.85);
  }
  // a waste bin by her desk's -x end
  P.add(M("#596274", 0.7), new THREE.CylinderGeometry(0.1, 0.085, 0.26, 14, 1, true).translate(X(DK.x0 - 0.18), 0.13, DK.z - 0.05), 0.004);
  P.add(mPaper, new THREE.IcosahedronGeometry(0.05, 0).translate(X(DK.x0 - 0.16), 0.24, DK.z - 0.06), 0.003);
  contact(DK.x0 - 0.18, DK.z - 0.05, 0.14, 0.14, 0, 0.7);

  // ---- the water dispenser (-x wall, toward the lens)
  {
    const wx = D.x0 + 0.25, wz = 1.7, mW = M("#eef0f2", 0.5);
    P.add(mW, boxG(X(wx - 0.15), X(wx + 0.15), 0, 0.9, wz - 0.15, wz + 0.15), 0.005);
    P.add(M("#8fb7dc", 0.2), new THREE.CylinderGeometry(0.12, 0.12, 0.38, 18).translate(X(wx), 1.12, wz), 0.005);
    P.add(M("#8fb7dc", 0.2), new THREE.CylinderGeometry(0.04, 0.08, 0.06, 14).translate(X(wx), 0.91, wz), 0.003);
    P.add(mDark, boxG(X(wx + 0.15), X(wx + 0.16), 0.45, 0.7, wz - 0.12, wz + 0.12), 0.002);
    P.add(M("#c94040", 0.5), boxG(X(wx + 0.15), X(wx + 0.19), 0.6, 0.63, wz - 0.07, wz - 0.03), 0.002);
    P.add(M("#4070c0", 0.5), boxG(X(wx + 0.15), X(wx + 0.19), 0.6, 0.63, wz + 0.03, wz + 0.07), 0.002);
  }
  // ---- the whiteboard (-x wall) with its frame and tray, the clock above it
  const WB = { z: -0.4, y: 1.45, w: 2.2, h: 1.2 };
  {
    const x = D.x0 + 0.015;
    P.add(mMetal, boxG(X(D.x0), X(D.x0 + 0.025), WB.y - WB.h / 2 - 0.03, WB.y + WB.h / 2 + 0.03, WB.z - WB.w / 2 - 0.03, WB.z + WB.w / 2 + 0.03), 0.004);
    P.add(mMetal, boxG(X(D.x0), X(D.x0 + 0.07), WB.y - WB.h / 2 - 0.05, WB.y - WB.h / 2 - 0.03, WB.z - 0.6, WB.z + 0.6), 0.003);
    P.add(M("#c8282e", 0.5), new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8).rotateX(Math.PI / 2).translate(X(D.x0 + 0.04), WB.y - WB.h / 2 - 0.02, WB.z + 0.2), 0.002);
    P.add(M("#2a3a8a", 0.5), new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8).rotateX(Math.PI / 2).translate(X(D.x0 + 0.04), WB.y - WB.h / 2 - 0.02, WB.z + 0.36), 0.002);
    Mk.mesh("work.board", new THREE.PlaneGeometry(WB.w, WB.h).rotateY(Math.PI / 2).translate(X(x + 0.012), WB.y, WB.z), M("#ffffff", 0.6, boardTex()), { cast: false, noink: true });
  }
  const CLK = { z: -0.4, y: 2.45, r: 0.16 };
  P.add(mDark, new THREE.CylinderGeometry(CLK.r + 0.015, CLK.r + 0.015, 0.04, 28).rotateZ(Math.PI / 2).translate(X(D.x0 + 0.02), CLK.y, CLK.z), 0.004);
  Mk.mesh("work.clock.face", new THREE.CircleGeometry(CLK.r, 28).rotateY(Math.PI / 2).translate(X(D.x0 + 0.042), CLK.y, CLK.z), Mk.basic("#e9eaea", { map: clockTex() }), { cast: false, receive: false, noink: true });
  const hand = (len: number, w: number) => { const m = Mk.mesh("work.clock.hand", new THREE.BoxGeometry(0.004, len, w).translate(0, len / 2 - 0.015, 0), Mk.basic("#22262e"), { cast: false, receive: false, noink: true }); m.position.set(X(D.x0 + 0.048), CLK.y, CLK.z); return m; };
  const hHour = hand(CLK.r * 0.55, 0.014), hMin = hand(CLK.r * 0.85, 0.009);
  // ---- the slogan (+x wall)
  { const m = Mk.mesh("work.slogan", new THREE.PlaneGeometry(2.6, 0.92).rotateY(-Math.PI / 2).translate(X(D.x1 - 0.01), 1.95, -0.3), M("#ffffff", 0.7, sloganTex()), { cast: false, receive: false, noink: true }); (m.material as THREE.MeshPhysicalMaterial).transparent = true; (m.material as THREE.MeshPhysicalMaterial).alphaTest = 0.3; }
  P.into(group, "work.dressing", { cast: true, receive: true });

  // ============================================================================================ glows and light
  // her laptop's light: a cool haze rising between the screen and her, a pool on the desk on her side
  const lapGlow = glowCard(0.26, "#9cc2ff", 0.16); lapGlow.position.set(X(LAPTOP.x), DK.top + 0.2, LAPTOP.z - 0.25); lapGlow.name = "work.laptop.glow"; group.add(lapGlow);
  const lapPool = lightPool(V(X(LAPTOP.x), DK.top + 0.0015, LAPTOP.z - 0.22), V(0, 1, 0), 0.6, 0.38, "#8fb6ff", 0.45); group.add(lapPool);
  // the desk lamp: bulb glow, a warm pool on the desk
  const bulb = glowCard(0.07, "#ffd8a0", 0.8); bulb.position.copy(lampHead).add(V(0.01, -0.05, 0.005)); bulb.name = "work.lamp.glow"; group.add(bulb);
  const lampPool = lightPool(V(X(-0.42), DK.top + 0.0016, DK.z0 + 0.3), V(0, 1, 0), 0.5, 0.36, "#ffcf98", 0.28); group.add(lampPool);
  // at night: the strip over her desk lays a pool on the floor round her desk
  const nightPool = lightPool(V(X(0), 0.0015, DK.z - 0.2), V(0, 1, 0), 3.2, 2.6, "#dfe6f4", 0); group.add(nightPool);
  const Lr = lightRig(group, { dir: [0.25, 0.55, -0.8], k: 1.2, col: "#e9eef7", at: [X(0), 0, 0], half: 8, hemi: ["#dfe4ee", "#6d7280", 1.3], point: { col: "#9cc2ff", k: 1.5, at: [X(LAPTOP.x), DK.top + 0.2, LAPTOP.z - 0.2], dist: 1.8 } });
  Lr.key.shadow.bias = -0.0006;
  const LAP = V(X(LAPTOP.x), DK.top + 0.2, LAPTOP.z - 0.2), OVER = V(X(0), D.h - 0.25, DK.z - 0.1);
  const cLap = new THREE.Color("#9cc2ff"), cOver = new THREE.Color("#eef2ff"), cKeyDay = new THREE.Color("#e9eef7"), cKeyNight = new THREE.Color("#3a4c80");
  const hSkyDay = new THREE.Color("#dfe4ee"), hSkyNight = new THREE.Color("#3a4468"), hGrDay = new THREE.Color("#6d7280"), hGrNight = new THREE.Color("#1e2130");
  const tintNight = new THREE.Color("#7f8aa8"), stripOff = new THREE.Color("#5c6272"), stripOn = new THREE.Color("#f4f7ff"), white = new THREE.Color("#ffffff");

  let glow = 1, late = 0;
  const apply = () => {
    mNight.opacity = late; sheen.opacity = 0.06 * (1 - 0.7 * late); nightCard.visible = late > 0.001;
    mStripRest.color.copy(stripOn).lerp(stripOff, late);
    Lr.key.intensity = lerp(1.2, 0.12, late); Lr.key.color.copy(cKeyDay).lerp(cKeyNight, late);
    Lr.hemi.intensity = lerp(1.3, 0.55, late); Lr.hemi.color.copy(hSkyDay).lerp(hSkyNight, late); Lr.hemi.groundColor.copy(hGrDay).lerp(hGrNight, late);
    const tint = white.clone().lerp(tintNight, late);
    for (const [m, e, c] of lit) { m.envMapIntensity = e * lerp(1, 0.35, late); m.color.copy(c).multiply(tint); }
    // the point light: the laptop's glow by day, the strip over her desk at night (weighted between the two)
    const kL = 1.5 * glow, kO = 9 * late, k = kL + kO;
    Lr.point.intensity = k;
    if (k > 1e-4) { Lr.point.position.copy(LAP).multiplyScalar(kL / k).addScaledVector(OVER, kO / k); Lr.point.color.copy(cLap).multiplyScalar(kL / k).add(cOver.clone().multiplyScalar(kO / k)); }
    Lr.point.distance = lerp(1.8, 4.5, late * kO / Math.max(1e-4, k));
    (lapGlow.material as THREE.MeshBasicMaterial).opacity = 0.16 * glow;
    (lapPool.material as THREE.MeshBasicMaterial).opacity = 0.45 * glow * (1 + 0.4 * late);
    (lampPool.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.2 * late;
    (nightPool.material as THREE.MeshBasicMaterial).opacity = 0.16 * late; nightPool.visible = late > 0.001;
    const min = 14 * 60 + 450 * late;
    hMin.rotation.x = -((min % 60) / 60) * Math.PI * 2; hHour.rotation.x = -(((min / 60) % 12) / 12) * Math.PI * 2;
  };
  apply();

  return {
    group,
    view(c: THREE.Vector3) { bulb.rotation.set(0, Math.atan2(c.x - bulb.position.x, c.z - bulb.position.z), 0); },
    setParam(name: string, v: ParamValue) {
      if (name === "glow") glow = clamp01(Number(v));
      else if (name === "late") late = clamp01(Number(v));
      apply();
    },
    cast(): Partial<CastLight> {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(DAY_CAST) as (keyof typeof DAY_CAST)[]) {
        const a = DAY_CAST[k], b = LATE_CAST[k];
        o[k] = Array.isArray(a) ? (a as number[]).map((x, i) => lerp(x, (b as number[])[i], late)) : lerp(a as number, b as number, late);
      }
      return flatFace(o, 0.1 * late) as Partial<CastLight>;
    },
  };
};
export const WORK_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };

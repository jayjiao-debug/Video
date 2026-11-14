// THE PINES (place "pines", island x 400): night on the lake path through the pine wood (惠州西湖), the grave under the
// six-pillared pavilion (六如亭) (PLAN 1, 8F). WP2b's set; the exports are the contract of sets/index.ts: PINES_LOOK,
// PINES_PARAMS, buildPines(K) -> { group, view, animate, setParam }; plus pinesLight() (below) for the shots. Every place
// number is layout/pines.ts (PINES_SET, PINES); its header has the plan.
//
// WHAT THERE IS (her lens looks -z along the path; the lake is east = screen right, and wraps round behind the pavilion)
//   - the ground: pine needles in a blue-grey moonlight, moss, a few pale stones; the PATH (pale packed earth, the
//     brightest band on the ground) cut into it from the lens side to the pavilion's steps; grass tufts along it;
//   - THE PINES: leaning inked trunks with plated bark and the classic layered needle pads (flattened clumps at the
//     branch ends), dark shrubs at their feet; the side toward the lake kept low (the moon stays in view);
//   - THE LAKE: its water 0.3 m under a stony bank with reed clumps, slow ripples, the moon's silver glitter path from
//     behind the pavilion out to the far shore; the far shore painted on a NOINK panorama (low hills, the 泗洲塔
//     pagoda, the 苏堤 causeway with its bridge, a few warm town windows), the pine wood all round on the land side;
//   - THE PAVILION 六如亭: a hexagonal stone platform two steps up, six slim dark red pillars, painted lintels, a
//     hexagonal tiled roof curving up at its six corners, a gourd finial; under it THE GRAVE: a small grassy mound on
//     a stone ring and a rounded stele (an unreadable worn inscription), a stone incense pot with wild flowers;
//   - THE SKY: a blue mid-tone night (never black), a few stars, a wide glow round THE BIG MOON (7.5 degrees) high over
//     the pavilion's right shoulder as seen from the path;
//   - the place's one point light IS THE LANTERN's warm glow (params glow, glowX / glowY / glowZ): the shot sets it on
//     the lantern every frame; the figures' warm light comes from pinesLight() (setPlace's light option).
// INK / FLICKER: needles, moss, path, stones, bark plates, tiles and the far shore are PAINT; inked geometry is chunky
// (trunks 25-40 cm, pads, pillars 17 cm, the roof, the platform, rocks); reeds, tufts, glitter, glows, the moon, the
// panorama and the sky are NOINK; the small grave things are a props-kit Part. Seeded painting only; animate and
// setParam are pure functions of their arguments. NIGHT IS A BLUE MID-TONE.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { PINES_SET as S, PINES, PX } from "../layout/pines";
import type { PlaceLook, ParamValue } from "./index";
import { maker, lathe, bar, shade, levelShape, rockG, glowSprite, wrapBlotch, Part, NOINK } from "./parts/common";
import { strandField, type Strand } from "./parts/strands";
import { blobG, bentLimb, panoramaRing } from "./parts/town";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.22, 0.25, 0.32]], [-10, [0.27, 0.3, 0.4]], [6, [0.36, 0.41, 0.56]], [40, [0.32, 0.37, 0.52]], [90, [0.28, 0.32, 0.46]]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.78, 0.85, 1.0] }],
};
/** MOONLIGHT: a cool soft key from the front right (the figures' light is a cheat: lit from the lens side, so faces read),
 *  a blue mid-tone fill; the lantern adds warm (pinesLight) */
export const PINES_LOOK: PlaceLook = {
  bg: "#34466e",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.8, color: "#1e2438" },
  cast: {
    key: [0.42, 0.55, 0.72], tint: [0.8, 0.87, 1.0], tintK: 0.7, gain: 0.9, grad: 0.24, bodyGrad: 0.16, sideTint: [0.85, 0.88, 1.0],
    shade: [1.0, 0.95, 1.75], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.28, bodySat: 0.12, sheen: 0.1, lift: 0.03, contactLen: 0.25,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.45,
};
/** the per-frame dressing: moon 0..1 (the moonlight: the key, the moon disc, the glitter), glow 0..1 (the lantern's warm
 *  light) at the world point glowX / glowY / glowZ (default: at his hand height in front of PINES.su) */
export const PINES_PARAMS: Record<string, ParamValue> = { moon: 1, glow: 0, glowX: PINES.su.x - 0.25, glowY: 0.9, glowZ: PINES.su.z + 0.3 };

type V3L = THREE.Vector3 | [number, number, number];
const v3 = (p: V3L) => (Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p);
/** THE LANTERN'S WARM LIGHT ON A FIGURE (for the shot: w.setPlace("pines", { light: pinesLight({ glow, lantern, head }) })):
 *  the figure's key turns toward the lantern and warms the closer the lantern is to `head` (his head's world point:
 *  his mark + about 1.3 m), by `glow` (0..1, the same as the param). Far from the lantern: the moonlight unchanged. */
export const pinesLight = (o: { glow: number; lantern: V3L; head: V3L }): Partial<CastLight> => {
  const base = PINES_LOOK.cast, L = v3(o.lantern), Hd = v3(o.head), d = L.distanceTo(Hd);
  const w = Math.max(0, Math.min(1, o.glow)) * (1 / (1 + (d / 1.1) ** 2));
  const toL = L.clone().sub(Hd).normalize(), k0 = new THREE.Vector3(...base.key).normalize();
  const key = k0.lerp(toL, Math.min(0.85, w * 1.2)).normalize();
  const mixA = (a: number[], b: number[], k: number) => a.map((x, i) => x + (b[i] - x) * k) as [number, number, number];
  return {
    key: [key.x, key.y, key.z], tint: mixA(base.tint, [1.0, 0.74, 0.5], w), tintK: base.tintK + (0.86 - base.tintK) * w,
    gain: base.gain + 0.07 * w, shade: mixA(base.shade ?? [1, 0.95, 1.75], [1.06, 0.94, 1.36], w),
  };
};

const COL = {
  ground: "#4a5a6e", groundLo: "#3e4c5e", groundHi: "#5c6c82", needle: "#6a7488", moss: "#4c6460", stone: "#8a92a6",
  path: "#7c86a2", pathLo: "#68728e", pathHi: "#929ab6",
  bark: "#5c4c58", barkLo: "#463a46", barkHi: "#76687a", pad: ["#2e4a5c", "#36566a", "#2a4456"], padHi: "#4a6e84", shrub: "#2c4250",
  lake: "#3c5a8e", lakeLo: "#30497a", lakeHi: "#5a7ab0", glitter: "#f2ead0", bank: "#3e4656", rock: "#6a7286", rockLo: "#525a6c",
  reed: "#3c5048", reedTip: "#8a9a76",
  pillar: "#8e4842", pillarLo: "#6e3632", lintel: "#7a3a34", teal: "#3e6a70", gold: "#c8a860", tile: "#4a5266", tileLo: "#3a4152", ridge: "#363c4c",
  under: "#6a5048", plat: "#8a92a4", platLo: "#6e7688", mound: "#4e5e58", moundHi: "#5e7064", stele: "#9aa0ae", steleLo: "#7e8494",
  moon: "#f8f0d2", moonLo: "#e4d8b0", moonGlow: "#9fb2f0", flower: "#e8ecf4",
};
/** the night sky by elevation (degrees): a blue mid-tone, lighter at the horizon (moonlit haze) */
const SKY: SkyStops = [[-10, "#3a4a72"], [0, "#5a6c98"], [5, "#4e6090"], [18, "#40528a"], [40, "#344680"], [90, "#2c3c70"]];
const G = S.ground, PV = S.pavilion, M = S.moon;
const azR = (M.az * Math.PI) / 180, elR = (M.el * Math.PI) / 180;
const MOON_DIR = new THREE.Vector3(Math.sin(azR) * Math.cos(elR), Math.sin(elR), -Math.cos(azR) * Math.cos(elR));
/** the eye the moon is placed for (between the path cameras: the parallax over 10 m is 3 degrees) */
const EYE = new THREE.Vector3(PX + 0.2, 1.5, -2.5);
const PATH = PINES.path, HALFW = S.pathW / 2;
const PLAT_FRONT = PV.z + PV.plat.r * Math.cos(Math.PI / 6);
/** distance of (x, z) from the path's centre line (its polyline, continued to his mark before the steps) */
const LINE = [...PATH.map((p) => [p.x, p.z] as [number, number]), [PINES.su.x, PINES.su.z] as [number, number]];
const pathDist = (x: number, z: number) => {
  let best = Infinity;
  for (let i = 0; i + 1 < LINE.length; i++) {
    const [ax, az] = LINE[i], [bx, bz] = LINE[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    best = Math.min(best, Math.hypot(x - ax - u * dx, z - az - u * dz));
  }
  return best;
};
/** is (x, z) on the land (the -x side of the shore line)? */
const onLand = (x: number, z: number) => {
  const sh = S.shore;
  for (let i = 0; i + 1 < sh.length; i++) {
    const [ax, az] = sh[i], [bx, bz] = sh[i + 1];
    if ((z <= az && z >= bz) || (z >= az && z <= bz)) { const u = (z - az) / (bz - az || 1e-6), xs = ax + u * (bx - ax); return x < xs; }
  }
  return z < sh[sh.length - 1][1] ? x < sh[sh.length - 1][0] : x < sh[0][0];
};
/** distance from (x, z) to the shore line */
const shoreDist = (x: number, z: number) => {
  let best = Infinity;
  const sh = S.shore;
  for (let i = 0; i + 1 < sh.length; i++) {
    const [ax, az] = sh[i], [bx, bz] = sh[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    best = Math.min(best, Math.hypot(x - ax - u * dx, z - az - u * dz));
  }
  return best;
};

// ---------------------------------------------------------------------------------------------------- the paintings
/** pine-needle ground (a 4 m tile): blue-grey, darker and lighter patches, needle strokes, moss, small stones */
const groundTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(401);
  g.fillStyle = COL.ground; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 70 * r(), r() < 0.5 ? COL.groundLo : COL.groundHi, 0.35);
  for (let i = 0; i < 14; i++) wrapBlotch(g, W, H, W * r(), H * r(), 20 + 40 * r(), COL.moss, 0.45);
  g.lineCap = "round";
  for (let i = 0; i < 1400; i++) { const x = W * r(), y = H * r(), a = r() * 6.28, l = 5 + 7 * r(); g.strokeStyle = css(r() < 0.6 ? COL.needle : COL.groundLo, 0.55); g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 26; i++) { const x = W * r(), y = H * r(), rr = 3 + 5 * r(); g.fillStyle = css(COL.stone, 0.8); g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, r() * 3, 0, 7); g.fill(); g.fillStyle = css(COL.groundLo, 0.6); g.fillRect(x - rr, y + rr * 0.5, rr * 2, 2); }
}, true);
/** the path (u across its width, v along 3 m): pale packed earth, worn darker in the middle and at the edges, pebbles */
const pathTex = () => paint(256, 512, (g, W, H) => {
  const r = rng(403);
  g.fillStyle = COL.path; g.fillRect(0, 0, W, H);
  const ex = g.createLinearGradient(0, 0, W, 0); ex.addColorStop(0, css(COL.ground, 0.9)); ex.addColorStop(0.12, css(COL.pathLo, 0.5)); ex.addColorStop(0.3, "rgba(0,0,0,0)"); ex.addColorStop(0.7, "rgba(0,0,0,0)"); ex.addColorStop(0.88, css(COL.pathLo, 0.5)); ex.addColorStop(1, css(COL.ground, 0.9));
  g.fillStyle = ex; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, W * (0.2 + 0.6 * r()), H * r(), 14 + 30 * r(), r() < 0.5 ? COL.pathHi : COL.pathLo, 0.3);
  for (let i = 0; i < 160; i++) { const x = W * (0.1 + 0.8 * r()), y = H * r(), rr = 1.5 + 3 * r(); g.fillStyle = css(r() < 0.5 ? COL.pathHi : COL.pathLo, 0.8); g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { const x = W * (r() < 0.5 ? 0.05 * r() : 1 - 0.05 * r()), y = H * r(); g.strokeStyle = css(COL.needle, 0.6); g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 * (r() - 0.5), y + 6 * (r() - 0.5)); g.stroke(); }
}, true);
/** bark: vertical plates with dark cracks (wraps round) */
const barkTex = () => paint(128, 256, (g, W, H) => {
  const r = rng(405);
  g.fillStyle = COL.bark; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const x = W * r(), y = H * r(), w = 10 + 14 * r(), h = 14 + 20 * r(); g.fillStyle = css(r() < 0.5 ? COL.barkHi : COL.bark, 0.7); g.fillRect(x, y, w, h); g.strokeStyle = css(COL.barkLo, 0.9); g.lineWidth = 2; g.strokeRect(x, y, w, h); }
}, true);
/** the needle pads' skin: dark teal with lighter needle tufts */
const padTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(407);
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) { const x = W * r(), y = H * r(); g.strokeStyle = r() < 0.5 ? "rgba(170,200,215,0.5)" : "rgba(90,110,120,0.5)"; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.35; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); g.stroke(); } }
}, true);
/** the lake: deep blue, slow ripple strokes (repeats, 8 m) */
const waterTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(409);
  g.fillStyle = COL.lake; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 24; i++) wrapBlotch(g, W, H, W * r(), H * r(), 40 + 70 * r(), r() < 0.5 ? COL.lakeLo : COL.lakeHi, 0.25);
  g.lineCap = "round";
  for (let i = 0; i < 80; i++) { const x = W * r(), y = H * r(), w = 16 + 34 * r(); g.strokeStyle = css(COL.lakeHi, 0.5); g.lineWidth = 2.5; for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 5, x + dx + w / 2, y + dy); g.stroke(); } }
}, true);
/** the moon's glitter: broken horizontal dashes densest along the middle (u across, v along; repeats in v) */
const glitterTex = () => paint(256, 512, (g, W, H) => {
  const r = rng(411);
  g.clearRect(0, 0, W, H);
  for (let i = 0; i < 170; i++) { const u = 0.5 + (r() + r() + r() - 1.5) * 0.42, y = H * r(), w = (8 + 36 * r()) * (1 - Math.abs(u - 0.5) * 1.4); g.fillStyle = css(COL.glitter, 0.5 + 0.5 * r()); g.fillRect(W * u - w / 2, y, w, 2.5 + 2 * r()); }
}, true);
/** roof tiles (u along the eave, v up the slope): rows of tile ridges running up, courses across */
const tileTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = COL.tile; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { const x = (i + 0.5) * W / 8; const gr = g.createLinearGradient(x - W / 16, 0, x + W / 16, 0); gr.addColorStop(0, COL.tileLo); gr.addColorStop(0.5, shade(COL.tile, 0.18)); gr.addColorStop(1, COL.tileLo); g.fillStyle = gr; g.fillRect(x - W / 16, 0, W / 8, H); }
  g.fillStyle = "rgba(30,34,46,0.45)"; for (let y = 0; y < H; y += H / 6) g.fillRect(0, y, W, 3);
}, true);
/** the stele's face: worn grey stone, a frame, a column of unreadable characters */
const steleTex = () => paint(128, 200, (g, W, H) => {
  const r = rng(413);
  g.fillStyle = COL.stele; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 20; i++) blotch(g, W * r(), H * r(), 10 + 20 * r(), r() < 0.5 ? COL.steleLo : "#b4bac6", 0.3);
  g.strokeStyle = "rgba(70,74,88,0.6)"; g.lineWidth = 3; g.strokeRect(12, 20, W - 24, H - 32);
  g.strokeStyle = "rgba(60,64,78,0.7)"; g.lineWidth = 3.5; g.lineCap = "round";
  for (let i = 0; i < 6; i++) { const cy = 40 + i * 24; for (let k = 0; k < 3; k++) { const a = r() < 0.5 ? 0 : Math.PI / 2, l = 8 + 8 * r(); g.beginPath(); g.moveTo(W / 2 - Math.cos(a) * l / 2 + (r() - 0.5) * 8, cy - Math.sin(a) * l / 2 + (r() - 0.5) * 8); g.lineTo(W / 2 + Math.cos(a) * l / 2, cy + Math.sin(a) * l / 2); g.stroke(); } }
});
/** the moon's face: pale gold, soft maria, a lighter rim */
const moonTex = () => paint(256, 256, (g, W) => {
  const r = rng(415), c = W / 2;
  g.clearRect(0, 0, W, W);
  g.save(); g.beginPath(); g.arc(c, c, c - 2, 0, 7); g.clip();
  g.fillStyle = COL.moon; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 7; i++) blotch(g, c + (r() - 0.5) * W * 0.6, c + (r() - 0.5) * W * 0.6, 18 + 30 * r(), COL.moonLo, 0.75);
  const gr = g.createRadialGradient(c, c, c * 0.7, c, c, c); gr.addColorStop(0, "rgba(255,255,240,0)"); gr.addColorStop(1, "rgba(255,255,240,0.5)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
  g.restore();
});

// ---------------------------------------------------------------------------------------------------- geometry
/** the path's outline (left edge forward, right edge back) as [x, z] points, from its first point to his mark */
const pathOutline = (): [number, number][] => {
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < LINE.length; i++) {
    const p = LINE[i], a = LINE[Math.max(0, i - 1)], b = LINE[Math.min(LINE.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const nx = -dz, nz = dx, w = i === LINE.length - 1 ? HALFW + 0.25 : HALFW;
    L.push([p[0] + nx * w, p[1] + nz * w]); R.push([p[0] - nx * w, p[1] - nz * w]);
  }
  // round the end at the steps: widen to the step's width
  return [...L, ...R.reverse()];
};
/** the path ribbon (the hole's fill): one strip along LINE, u across, v = metres along / 3 */
const pathRibbon = () => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let along = 0;
  for (let i = 0; i < LINE.length; i++) {
    const p = LINE[i], a = LINE[Math.max(0, i - 1)], b = LINE[Math.min(LINE.length - 1, i + 1)];
    if (i) along += Math.hypot(p[0] - LINE[i - 1][0], p[1] - LINE[i - 1][1]);
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const nx = -dz, nz = dx, w = i === LINE.length - 1 ? HALFW + 0.25 : HALFW;
    pos.push(p[0] + nx * w, 0, p[1] + nz * w, p[0] - nx * w, 0, p[1] - nz * w); uv.push(0, along / 3, 1, along / 3);
    if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // make sure it faces up
  const n = g.attributes.normal as THREE.BufferAttribute; if (n.getY(0) < 0) { const ix = g.index!.array as Uint16Array | Uint32Array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.computeVertexNormals(); }
  return g;
};
/** THE PAVILION ROOF: six curved sectors from the eave (radius R at its corners, height y0) up to the apex (y1), the
 *  corners lifted (the up-turned eaves); returns [top surface, underside] geometries and the six corner curves */
const roofG = (cx: number, cz: number, R: number, y0: number, y1: number) => {
  const NU = 10, NV = 12, lift = 0.32, a0 = Math.PI / 6;
  const at = (k: number, u: number, v: number) => {
    // u 0..1 along the eave from corner k to corner k+1, v 0 (eave) .. 1 (apex)
    const ta = a0 + (k * Math.PI) / 3, tb = a0 + ((k + 1) * Math.PI) / 3;
    const pa = [Math.sin(ta) * R, Math.cos(ta) * R], pb = [Math.sin(tb) * R, Math.cos(tb) * R];
    const ex = pa[0] + (pb[0] - pa[0]) * u, ez = pa[1] + (pb[1] - pa[1]) * u;
    const sag = 1 - 0.06 * Math.sin(Math.PI * u);                       // the eave line bows in a little between corners
    const rx = ex * sag * (1 - v), rz = ez * sag * (1 - v);
    const corner = Math.pow(Math.abs(2 * u - 1), 4);
    const y = y0 + (y1 - y0) * Math.pow(v, 1.7) + lift * corner * Math.pow(1 - v, 3);
    return new THREE.Vector3(cx + rx, y, cz + rz);
  };
  const build = (down: number, flip: boolean) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let k = 0; k < 6; k++) {
      const base = pos.length / 3;
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const p = at(k, i / NU, j / NV); pos.push(p.x, p.y - down, p.z); uv.push((i / NU) * R * 1.1, (j / NV) * 2.2); }
      for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
        const a = base + j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
        if (flip) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  const top = build(0, false), under = build(0.06, true);
  // make the top face up (the winding above may face either way: test one normal)
  const n = top.attributes.normal as THREE.BufferAttribute;
  if (n.getY(Math.floor(n.count / 2)) < 0) { top.index!.array.reverse(); top.computeVertexNormals(); under.index!.array.reverse(); under.computeVertexNormals(); }
  const corners = Array.from({ length: 6 }, (_, k) => Array.from({ length: 9 }, (_, j) => at(k, 0, j / 8)));
  return { top, under, corners };
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildPines(K: Kit) {
  const group = new THREE.Group(); group.name = "set-pines";
  const Mk = maker(K, group);

  // ===================================================================================================== the ground
  {
    const sh = S.shore;
    const land: [number, number][] = [[PX - 140, 140], [sh[0][0], 140], ...sh, [sh[sh.length - 1][0] - 3, -140], [PX - 140, -140]];
    const gm = groundTex(); gm.repeat.set(0.25, 0.25);
    Mk.mesh("pines.ground", levelShape(land, [pathOutline()], 0, 1), Mk.tex(gm, 0.95), { cast: false });
    Mk.mesh("pines.path", pathRibbon(), Mk.tex(pathTex(), 0.9), { cast: false });
    // the bank: a skirt down from the ground to under the water along the shore (double-sided), rocks along it
    const pos: number[] = [];
    for (let i = 0; i + 1 < sh.length; i++) { const [ax, az] = sh[i], [bx, bz] = sh[i + 1]; pos.push(ax, 0.01, az, bx, 0.01, bz, bx, S.lake.y - 0.1, bz, ax, 0.01, az, bx, S.lake.y - 0.1, bz, ax, S.lake.y - 0.1, az); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); bg.computeVertexNormals();
    Mk.mesh("pines.bank", bg, Mk.K.flat(COL.bank, { rough: 0.95, side: THREE.DoubleSide }), { cast: false });
    const B = new Batch(), mR = [Mk.flat(COL.rock, 0.9), Mk.flat(COL.rockLo, 0.9)], r = rng(421);
    for (let i = 0; i + 1 < sh.length; i++) {
      const [ax, az] = sh[i], [bx, bz] = sh[i + 1], len = Math.hypot(bx - ax, bz - az);
      for (let s = 0; s < len; s += 0.9 + 0.8 * r()) {
        const u = s / len, x = ax + (bx - ax) * u, z = az + (bz - az) * u;
        if (Math.abs(z) > 40) continue;
        const sz = 0.3 + 0.35 * r();
        B.add(mR[r() < 0.5 ? 0 : 1], rockG(430 + i * 50 + Math.round(s * 3), sz * 1.4, sz * 0.8, sz, 1, 0.05).rotateY(r() * 3).translate(x + (r() - 0.3) * 0.3, S.lake.y + 0.12, z));
      }
    }
    // a few big rocks on the land (none on the path or near her lens)
    for (const [x, z, s] of [[PX - 2.6, 1.8, 0.8], [PX + 2.4, -2.6, 0.7], [PX - 1.9, -7.4, 0.9], [PX + 2.7, 4.6, 0.6]] as [number, number, number][]) B.add(mR[0], rockG(470 + Math.round(x * 3), s * 1.3, s * 0.8, s, 2, 0.06).rotateY(x).translate(x, 0, z));
    B.flush(group, "pines.rocks");
  }

  // ===================================================================================================== THE LAKE
  const waterMap = waterTex(); waterMap.repeat.set(1 / 8, 1 / 8);
  const glitter = glitterTex();
  let glitterMesh: THREE.Mesh;
  {
    const wy = S.lake.y;
    const g = new THREE.CircleGeometry(150, 64).rotateX(-Math.PI / 2).translate(PX, wy, -3);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i), -p.getZ(i));
    Mk.mesh("pines.lake", g, Mk.tex(waterMap, 0.3), { cast: false });
    // THE MOON'S GLITTER: a strip on the water along the moon's azimuth from the path's end out to the far shore
    const dir = new THREE.Vector2(MOON_DIR.x, MOON_DIR.z).normalize();
    let s0 = 0; for (let s = 2; s < 60; s += 0.25) { const x = EYE.x + dir.x * s, z = EYE.z + dir.y * s; if (!onLand(x, z) && shoreDist(x, z) > 0.6) { s0 = s; break; } }
    const s1 = 130, len = s1 - s0, mid = (s0 + s1) / 2;
    const gg = new THREE.PlaneGeometry(1, len, 1, 1).rotateX(-Math.PI / 2);
    // widen toward the far end (perspective: a path of light that opens out)
    const gp = gg.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < gp.count; i++) { const zz = gp.getZ(i), k = (zz + len / 2) / len; gp.setX(i, gp.getX(i) * (2.2 + 5 * (1 - k))); }
    gg.rotateY(Math.atan2(-dir.x, -dir.y)).translate(EYE.x + dir.x * mid, wy + 0.01, EYE.z + dir.y * mid);
    glitterMesh = new THREE.Mesh(gg, Mk.basic(COL.glitter, { map: glitter, additive: true, opacity: 0.8 }));
    glitterMesh.name = "pines.lake.glitter"; glitterMesh.layers.set(NOINK); glitterMesh.renderOrder = 4; group.add(glitterMesh);
    (glitterMesh.material as THREE.MeshBasicMaterial).map!.repeat.set(1, len / 5);
  }

  // ===================================================================================================== reeds, tufts
  const strands: Strand[] = [];
  {
    const r = rng(441), sh = S.shore;
    for (let i = 0; i + 1 < sh.length; i++) {
      const [ax, az] = sh[i], [bx, bz] = sh[i + 1], len = Math.hypot(bx - ax, bz - az);
      for (let s = 0.5; s < len; s += 2.2 + 2.5 * r()) {
        const u = s / len, cx = ax + (bx - ax) * u, cz = az + (bz - az) * u;
        if (Math.abs(cz) > 30) continue;
        for (let c = 0; c < 10; c++) {
          const x = cx + (r() - 0.2) * 0.9, z = cz + (r() - 0.5) * 0.9, y0 = onLand(x, z) ? 0 : S.lake.y, h = 0.8 + 0.6 * r(), ph = r() * 6.28;
          for (let b = 0; b < 4; b++) { const la = r() * 6.28, root = new THREE.Vector3(x, y0, z); strands.push({ root, tip: root.clone().add(new THREE.Vector3(Math.cos(la) * 0.15, h * (0.6 + 0.4 * r()), Math.sin(la) * 0.15)), w: 0.04, c0: COL.reed, c1: COL.reedTip, ph: ph + b * 0.3, amp: 0.1, face: r() * 3 }); }
        }
      }
    }
    // grass tufts along the path's edges (never on it)
    const tuft = (x: number, z: number, h: number) => { const ph = r() * 6.28; for (let b = 0; b < 5; b++) { const la = r() * 6.28, root = new THREE.Vector3(x + 0.05 * (r() - 0.5), 0, z + 0.05 * (r() - 0.5)); strands.push({ root, tip: root.clone().add(new THREE.Vector3(Math.cos(la) * 0.07, h * (0.6 + 0.4 * r()), Math.sin(la) * 0.07)), w: 0.03, c0: COL.groundLo, c1: COL.moss, ph, amp: 0.04, seg: 2, face: r() * 3 }); } };
    for (let i = 0; i < 260; i++) {
      const x = PX - 5 + 9 * r(), z = -8 + 18 * r(), d = pathDist(x, z);
      if (d < HALFW + 0.08 || d > HALFW + 1.2 || !onLand(x, z)) continue;
      if (Math.hypot(x - PV.x, z - PV.z) < PV.plat.r + 0.6) continue;
      tuft(x, z, 0.16 + 0.14 * r());
    }
  }
  const field = strandField(Mk, strands, "pines.reeds");
  group.add(field.mesh);

  // ===================================================================================================== THE PINES
  {
    const B = new Batch(), bark = Mk.tex(barkTex(), 0.9), pt = padTex(), pads = COL.pad.map((c) => Mk.K.flat(c, { map: pt, rough: 0.95 })), shrub = Mk.flat(COL.shrub, 0.95);
    const r = rng(451);
    const moonLine = (x: number, z: number) => {
      // keep the moon's sight line clear from the path cameras (the trees between the path and the lake stay low)
      const dx = x - EYE.x, dz = z - EYE.z, d = Math.hypot(dx, dz), az = (Math.atan2(dx, -dz) * 180) / Math.PI;
      return d > 2 && Math.abs(az - M.az) < 14;
    };
    let n = 0;
    for (let tries = 0; tries < 900 && n < 46; tries++) {
      const x = PX - 22 + 26 * r(), z = -24 + 40 * r();
      if (!onLand(x, z) || shoreDist(x, z) < 1.2) continue;
      if (pathDist(x, z) < HALFW + 1.1) continue;
      if (Math.hypot(x - PV.x, z - PV.z) < PV.roofR + 1.4) continue;
      if (x > PX + 1.2 && z < 3) continue;                                          // the lake side ahead stays open
      if (moonLine(x, z)) continue;
      n++;
      const h = 6 + 4 * r(), lean = new THREE.Vector3((r() - 0.5) * 1.2, 0, (r() - 0.5) * 0.8);
      const base = new THREE.Vector3(x, -0.15, z), top = new THREE.Vector3(x, h, z).add(lean);
      for (const gq of bentLimb(base, top, 0.2 + 0.06 * r(), 0.1, new THREE.Vector3((r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6))) B.add(bark, gq);
      // branches with needle pads at their ends, the pads in tiers (the classic pine)
      const nb = 3 + Math.floor(r() * 3);
      for (let b = 0; b < nb; b++) {
        const k = 0.45 + 0.5 * (b / nb) + 0.05 * r(), at = base.clone().lerp(top, k), a = r() * 6.28, len = (1.6 - 0.6 * (b / nb)) * (0.8 + 0.4 * r());
        const end = at.clone().add(new THREE.Vector3(Math.cos(a) * len, 0.3 + 0.4 * r(), Math.sin(a) * len));
        B.add(bark, bar(at, end, 0.075, 0.05, 8));
        const pr = 0.9 + 0.5 * r() - 0.25 * (b / nb);
        B.add(pads[b % 3], blobG(460 + n * 10 + b, 1, 0.22).scale(pr * 1.3, pr * 0.42, pr * 1.1).translate(end.x, end.y + 0.12, end.z));
      }
      B.add(pads[n % 3], blobG(470 + n, 1, 0.22).scale(1.5, 0.55, 1.3).translate(top.x, top.y + 0.2, top.z));
      if (r() < 0.6) B.add(shrub, blobG(480 + n, 1, 0.3).scale(0.7 + 0.4 * r(), 0.45, 0.6 + 0.3 * r()).translate(x + (r() - 0.5) * 1.2, 0.2, z + (r() - 0.5) * 1.2));
    }
    // low shrubs on the lake side (they never reach the moon)
    for (let i = 0; i < 14; i++) {
      const x = PX + 1.6 + 1.6 * r(), z = -6 + 14 * r();
      if (!onLand(x, z) || shoreDist(x, z) < 0.5 || pathDist(x, z) < HALFW + 0.6) continue;
      B.add(shrub, blobG(490 + i, 1, 0.3).scale(0.6 + 0.3 * r(), 0.4 + 0.15 * r(), 0.5 + 0.3 * r()).translate(x, 0.18, z));
    }
    B.flush(group, "pines.trees");
  }

  // ===================================================================================================== THE PAVILION
  {
    const P0 = new THREE.Vector3(PV.x, 0, PV.z), plat = PV.plat;
    const stone = Mk.flat(COL.plat, 0.9), stoneLo = Mk.flat(COL.platLo, 0.9);
    Mk.mesh("pines.pavilion.platform", new THREE.CylinderGeometry(plat.r, plat.r + 0.04, plat.top, 6, 1, false, Math.PI / 6).translate(P0.x, plat.top / 2, P0.z), [stoneLo, stone, stoneLo]);
    const st = S.steps;
    Mk.mesh("pines.pavilion.step", new THREE.BoxGeometry(st.w, st.rise, st.depth + 0.05).translate(P0.x, st.rise / 2, PLAT_FRONT + st.depth / 2 - 0.025), stone);
    // six pillars on small bases, the lintel ring
    const pm = Mk.flat(COL.pillar, 0.55), lm = Mk.flat(COL.lintel, 0.6), teal = Mk.flat(COL.teal, 0.7);
    const corner = (k: number, rr: number) => { const a = Math.PI / 6 + (k * Math.PI) / 3; return new THREE.Vector3(P0.x + Math.sin(a) * rr, 0, P0.z + Math.cos(a) * rr); };
    for (let k = 0; k < 6; k++) {
      const c = corner(k, PV.r);
      Mk.mesh(`pines.pavilion.pillar${k}`, new THREE.CylinderGeometry(PV.pillarR, PV.pillarR * 1.08, PV.eave - plat.top - 0.02, 14).translate(c.x, plat.top + (PV.eave - plat.top) / 2 - 0.01, c.z), pm);
      Mk.mesh(`pines.pavilion.base${k}`, new THREE.CylinderGeometry(0.13, 0.15, 0.1, 12).translate(c.x, plat.top + 0.05, c.z), stoneLo);
      const d = corner(k + 1, PV.r), mid = c.clone().lerp(d, 0.5), len = c.distanceTo(d), yaw = Math.atan2(d.x - c.x, d.z - c.z);
      Mk.mesh(`pines.pavilion.lintel${k}`, new THREE.BoxGeometry(0.12, 0.2, len + 0.1).rotateY(yaw).translate(mid.x, PV.eave - 0.22, mid.z), lm);
      Mk.mesh(`pines.pavilion.band${k}`, new THREE.BoxGeometry(0.13, 0.07, len - 0.1).rotateY(yaw).translate(mid.x, PV.eave - 0.4, mid.z), teal);
    }
    // the roof, its corner ridges with their curls, the finial
    const R = roofG(P0.x, P0.z, PV.roofR, PV.eave, PV.top);
    Mk.mesh("pines.pavilion.roof", R.top, Mk.tex(tileTex(), 0.8));
    Mk.mesh("pines.pavilion.roof.under", R.under, Mk.flat(COL.under, 0.85), { cast: false });
    const ridge = Mk.flat(COL.ridge, 0.7);
    for (const cv of R.corners) {
      for (let j = 0; j + 1 < cv.length; j++) Mk.mesh("pines.pavilion.ridge", bar(cv[j].clone().setY(cv[j].y + 0.04), cv[j + 1].clone().setY(cv[j + 1].y + 0.04), 0.06, 0.055, 8), ridge);
      const tip = cv[0], dir = tip.clone().sub(P0).setY(0).normalize();
      Mk.mesh("pines.pavilion.curl", bar(tip.clone().setY(tip.y + 0.04), tip.clone().addScaledVector(dir, 0.18).setY(tip.y + 0.26), 0.06, 0.035, 8), ridge);
    }
    Mk.mesh("pines.pavilion.finial", lathe([[0, 0], [0.16, 0], [0.18, 0.06], [0.1, 0.12], [0.14, 0.2], [0.15, 0.28], [0.1, 0.36], [0.04, 0.4], [0.035, 0.52], [0, 0.56]], 16).translate(P0.x, PV.top - 0.04, P0.z), Mk.flat(COL.gold, 0.5));
    // THE GRAVE: a stone ring, the grassy mound, the stele, a stone incense pot and wild flowers
    const Md = S.mound, y0 = plat.top;
    Mk.mesh("pines.grave.ring", new THREE.CylinderGeometry(Md.r + 0.08, Md.r + 0.1, 0.12, 24).translate(P0.x, y0 + 0.06, P0.z), stoneLo);
    const moundTex = paint(256, 128, (g, W, H) => { const r = rng(491); g.fillStyle = COL.mound; g.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { g.strokeStyle = css(r() < 0.5 ? COL.moundHi : "#3e4c48", 0.7); g.lineWidth = 1.5; const x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 5); g.stroke(); } }, true);
    Mk.mesh("pines.grave.mound", new THREE.SphereGeometry(Md.r, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, Md.h / Md.r, 1).translate(P0.x, y0 + 0.1, P0.z), Mk.tex(moundTex, 0.95));
    const Sl = S.stele, sz = P0.z + Md.r + 0.08;
    const sg = new THREE.Shape([new THREE.Vector2(-Sl.w / 2, 0), new THREE.Vector2(Sl.w / 2, 0), new THREE.Vector2(Sl.w / 2, Sl.h - Sl.w / 2)]);
    sg.absarc(0, Sl.h - Sl.w / 2, Sl.w / 2, 0, Math.PI, false); sg.lineTo(-Sl.w / 2, 0);
    const steleG = new THREE.ExtrudeGeometry(sg, { depth: Sl.d, bevelEnabled: false, curveSegments: 12 }).translate(0, 0, -Sl.d / 2);
    { const p = steleG.attributes.position as THREE.BufferAttribute, uv = steleG.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / Sl.w + 0.5, p.getY(i) / Sl.h); }
    Mk.mesh("pines.grave.stele", steleG.translate(P0.x, y0 + 0.08, sz), Mk.tex(steleTex(), 0.9));
    Mk.mesh("pines.grave.steleBase", new THREE.BoxGeometry(Sl.w + 0.16, 0.1, Sl.d + 0.14).translate(P0.x, y0 + 0.05, sz), stoneLo);
    const Q = new Part(K), potM = Mk.flat(COL.steleLo, 0.9), fl = Mk.flat(COL.flower, 0.7), stem = Mk.flat("#4e6a5a", 0.9);
    Q.add(potM, lathe([[0, 0], [0.09, 0], [0.11, 0.08], [0.1, 0.12], [0.0, 0.11]], 16).translate(P0.x, y0, sz + 0.24), 0.005);
    const r = rng(493);
    for (let i = 0; i < 6; i++) { const a = r() * 6.28, d = 0.06 * r(), x = P0.x + 0.28 + Math.cos(a) * d, z = sz + 0.2 + Math.sin(a) * d, h = 0.18 + 0.1 * r(); Q.add(stem, new THREE.CylinderGeometry(0.008, 0.008, h, 5).translate(x, y0 + h / 2, z), 0); Q.add(fl, new THREE.IcosahedronGeometry(0.028, 0).translate(x, y0 + h, z), 0.004); }
    Q.into(group, "pines.grave.things");
  }

  // ===================================================================================================== the far view
  {
    const ring = panoramaRing(PX, -3, 140, -2, 46, 4096, 1024, 1.5, (g: G2, k) => {
      g.clearRect(0, 0, k.W, k.H);
      const r = rng(497), hz = k.row(0), rowAt = (el: number) => k.row(el);
      // a soft moonlit haze along the horizon
      const hg = g.createLinearGradient(0, rowAt(6), 0, rowAt(-1)); hg.addColorStop(0, "rgba(120,140,190,0)"); hg.addColorStop(1, "rgba(120,140,190,0.45)"); g.fillStyle = hg; g.fillRect(0, rowAt(6), k.W, rowAt(-1) - rowAt(6));
      // the far shore across the lake (az -20 .. 170): low hills, the pagoda, the causeway, warm windows
      const range = (a0: number, a1: number, base: number, amp: number, col: string, f: number, ph: number) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(k.col(a0), rowAt(-1));
        for (let a = a0; a <= a1; a += 1) { const e = base + amp * (0.55 + 0.3 * Math.sin(a * f + ph) + 0.15 * Math.sin(a * f * 2.7 + ph * 2)); g.lineTo(k.col(a), rowAt(e)); }
        g.lineTo(k.col(a1), rowAt(-1)); g.closePath(); g.fill();
      };
      range(-25, 175, 1.6, 2.4, "#3e507c", 0.06, 1.2); range(-25, 175, 0.7, 1.3, "#34466e", 0.11, 0.4);
      // the pagoda (泗洲塔) on a hill at az 52: tiers narrowing up
      { const a = 52, x = k.col(a), w = (2.2 / 140) * (180 / Math.PI) * (k.W / 360); let y = rowAt(2.2);
        for (let t = 0; t < 7; t++) { const ww = w * (1 - t * 0.09), hh = (k.row(0) - k.row(0.55)); g.fillStyle = "#2c3a60"; g.fillRect(x - ww / 2, y - hh, ww, hh); g.fillRect(x - ww * 0.75, y - hh - 3, ww * 1.5, 4); y -= hh + 3; }
        g.fillRect(x - 1.5, y - 14, 3, 14); }
      // the causeway (苏堤) low across the water with a humped bridge, a few willows on it
      { const a0 = 70, a1 = 128, y = rowAt(0.12);
        g.fillStyle = "#2e3e66"; g.fillRect(k.col(a0), y - 3, k.col(a1) - k.col(a0), 5);
        const bx = k.col(98); g.strokeStyle = "#2e3e66"; g.lineWidth = 4; g.beginPath(); g.arc(bx, y + 6, 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
        for (let i = 0; i < 9; i++) { const x = k.col(a0 + 3 + i * 6.3); g.fillStyle = "#2a3a5e"; g.beginPath(); g.ellipse(x, y - 9, 9, 8, 0, 0, 7); g.fill(); } }
      // warm windows of the town along the far shore
      for (let i = 0; i < 26; i++) { const a = 80 + 70 * r(), x = k.col(a), y = rowAt(0.4 + 0.6 * r()); blotch(g, x, y, 6, "#ffb868", 0.55); g.fillStyle = "#ffd49a"; g.fillRect(x - 1.5, y - 1.5, 3, 3); }
      // the pine wood all round on the land side (az 170 .. 350): a low dark understorey, then pine silhouettes (a
      // leaning trunk, flat layered needle pads), two depths
      for (const [col, base, n] of [["#33456a", 5.5, 60], ["#2a3a5c", 3.4, 80]] as [string, number, number][]) {
        g.fillStyle = col;
        g.beginPath(); g.moveTo(k.col(166), rowAt(-1));
        for (let a = 166; a <= 352; a += 0.5) g.lineTo(k.col(a), rowAt(base * 0.32 * (0.8 + 0.2 * Math.sin(a * 0.7) + 0.15 * Math.sin(a * 2.3))));
        g.lineTo(k.col(352), rowAt(-1)); g.closePath(); g.fill();
        for (let i = 0; i < n; i++) {
          const a = 168 + 182 * r(), x = k.col(a), e = base * (0.6 + 0.6 * r()), top = rowAt(e), foot = rowAt(0), hgt = foot - top, lean = (r() - 0.5) * hgt * 0.35;
          g.strokeStyle = col; g.lineWidth = 3 + 3 * r(); g.beginPath(); g.moveTo(x, foot); g.quadraticCurveTo(x + lean * 0.2, foot - hgt * 0.5, x + lean, top + hgt * 0.12); g.stroke();
          const pads = 3 + Math.floor(r() * 3);
          for (let p = 0; p < pads; p++) { const u = p / pads, px = x + lean * (1 - u * 0.6) + (r() - 0.5) * hgt * 0.5, py = top + hgt * (0.08 + u * 0.55), pw = hgt * (0.22 + 0.2 * r()) * (1.15 - u * 0.4), ph = pw * 0.32; g.beginPath(); g.ellipse(px, py, pw, ph, 0, Math.PI, 0); g.fill(); g.fillRect(px - pw, py - 0.5, 2 * pw, ph * 0.45); }
        }
      }
      void hz;
    });
    ring.name = "pines.far"; (ring.material as THREE.MeshBasicMaterial).transparent = true; group.add(ring);
    // the sky dome: a few stars, the wide glow round the moon
    const mu = 0.75 - M.az / 360;
    group.add(skyDome(new THREE.Vector3(PX, 0, -3), SKY, (g, W, H) => {
      const r = rng(499), elY = (el: number) => (H * (90 - el)) / 180;
      for (let i = 0; i < 260; i++) { const x = W * r(), el = 10 + 80 * Math.sqrt(r()), y = elY(el), s = r(); const dx = Math.min(Math.abs(x - W * mu), W - Math.abs(x - W * mu)); if (Math.hypot(dx, y - elY(M.el)) < 220) continue; g.fillStyle = css(s < 0.85 ? "#d8e0ff" : "#fff2c8", 0.4 + 0.5 * r()); g.beginPath(); g.arc(x, y, s < 0.9 ? 1.3 : 2.2, 0, 7); g.fill(); }
      blotch(g, W * mu, elY(M.el), 420, "#6a7cba", 0.5); blotch(g, W * mu, elY(M.el), 200, "#8c9ad0", 0.5); blotch(g, W * mu, elY(M.el), 90, "#b8c2e8", 0.5);
    }));
  }
  const moonR = M.dist * Math.tan(((M.deg / 2) * Math.PI) / 180);
  const moonAt = EYE.clone().addScaledVector(MOON_DIR, M.dist);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(moonR, 48), new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, fog: false, depthWrite: false }));
  moon.name = "pines.moon"; moon.layers.set(NOINK); moon.renderOrder = -55; moon.position.copy(moonAt); moon.lookAt(EYE); group.add(moon);
  const halo = glowSprite(moonR * 3.0, COL.moonGlow, 0.45); halo.name = "pines.moon.halo"; halo.renderOrder = -56; halo.position.copy(moonAt).addScaledVector(MOON_DIR, 2); halo.lookAt(EYE); group.add(halo);

  // ===================================================================================================== the light
  const L = lightRig(group, { dir: [0.5, 0.62, 0.6], k: 1.3, col: "#c4d2ff", at: [PX + 0.5, 0, -2], half: 12, hemi: ["#7a8cc0", "#34405a", 1.7], point: { col: "#ffb060", k: 0, at: [PINES.su.x - 0.25, 0.9, PINES.su.z + 0.3], dist: 6 } });
  L.point.decay = 1.6;
  let clock = 0, moonK = 1;
  const pose = (t: number) => {
    field.update(t, 1);
    waterMap.offset.set(0.01 * Math.sin(t * 0.2), -t * 0.01);
    glitter.offset.set(0, -t * 0.05);
    (glitterMesh.material as THREE.MeshBasicMaterial).opacity = moonK * (0.72 + 0.08 * Math.sin(t * 1.3));
  };
  const setMoon = (k: number) => {
    moonK = k;
    L.key.intensity = 1.3 * (0.35 + 0.65 * k); L.hemi.intensity = 1.5 + 0.2 * k;
    (moon.material as THREE.MeshBasicMaterial).opacity = 0.3 + 0.7 * k; (halo.material as THREE.MeshBasicMaterial).opacity = 0.45 * k;
  };
  setMoon(1); pose(0);
  return {
    group,
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      const n = Number(v);
      if (name === "moon") { setMoon(Math.max(0, Math.min(1, n))); pose(clock); }
      else if (name === "glow") L.point.intensity = 1.8 * Math.max(0, Math.min(1, n));
      else if (name === "glowX") L.point.position.x = n;
      else if (name === "glowY") L.point.position.y = n;
      else if (name === "glowZ") L.point.position.z = n;
    },
  };
}
// (mix is kept for future colour work)
void mix;

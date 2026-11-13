// THE NIGHT (place "night", island x 400): a garden path by the pond 兰池 at night (PLAN 1, 7F). WP2's set; the exports
// are the contract of sets/index.ts: NIGHT_LOOK, NIGHT_PARAMS, buildNight(K) -> { group, view, animate, setParam }.
// Every place-number is layout/night.ts NIGHT_SET (colours, painting and small proportions live here).
//
// WHAT THERE IS (the camera looks -z along the path; the pond is east = screen right)
//   - the path: moonlit pale flags with a darker border, the brightest band on the ground, leading the eye to -z;
//   - the lawn: dark blue-green grass with lighter moonlit patches and tiny pale flowers, tufts along the path edges;
//   - THE POND: its water 22 cm down inside an earth bank, bank stones round the rim, lotus pads and two pink buds,
//     slow ripples, THE MOON'S GLITTER PATH laid on the water under the moon as seen from the stand, a warm glint of
//     the far lantern; reed beds between the path and the water (the bandits' cover: no reed within `clear` of a
//     bandit mark), more on the far bank, all swaying, with brown cattail heads; fireflies over the reeds;
//   - THE ROCK she ducks behind: a big lumpy slate-blue boulder with lichen, two small ones at its foot;
//   - two lantern posts with a paper lantern on a short bracket (warm point lights, glows; they never overhang the path);
//   - willows (inked trunks, swaying hanging strands), dark round trees in the middle distance;
//   - the far view: a painted card of the palace (wall, gate towers, halls with a few warm windows) under hills; the
//     night sky (deep blue, stars, a faint milky band, a glow round the moon) and the big toon moon over the pond.
// INK / FLICKER: reeds, strands, tufts, pads, glitter, glows, fireflies, the moon and the card are NOINK; inked
// geometry is chunky (the rock, bank stones >= 25 cm, posts 10 cm, trunks). Seeded painting only; animate / setParam
// are pure functions of their arguments.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, skyDome, farCard, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { NIGHT_SET as S, NIGHT, NIGHT_STAND, NX } from "../layout/night";
import type { PlaceLook, ParamValue } from "./index";
import { strandField, type Strand } from "./parts/strands";
import { maker, boxG, levelQuad, levelShape, ellipsePts, rockG, rockFit, bar, addLantern, glowSprite, faceY, flagsTex, wrapBlotch, Part, NOINK } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.18, 0.19, 0.22]], [-10, [0.22, 0.24, 0.29]], [6, [0.3, 0.32, 0.4]], [40, [0.28, 0.3, 0.4]], [90, [0.25, 0.27, 0.36]]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.8, 0.86, 1.0] }],
};
/** MOONLIGHT: a cool soft key from the moon, deep blue shade, the gain down (the figures are not lit like day) */
export const NIGHT_LOOK: PlaceLook = {
  bg: "#141a2e",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 2.2, color: "#18181f" },
  cast: {
    key: [0.3, 0.55, 0.78], tint: [0.82, 0.88, 1.0], tintK: 0.7, gain: 0.82, grad: 0.24, bodyGrad: 0.16, sideTint: [0.85, 0.88, 1.0],
    shade: [1.0, 0.95, 1.9], shadeK: 0.45, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.12, sheen: 0.1, lift: 0, contactLen: 0.2,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.45,
};
/** the per-frame dressing: moon 0..1 (the moonlight's strength: the key, the moon's glow, the glitter on the water) */
export const NIGHT_PARAMS: Record<string, ParamValue> = { moon: 1 };

const COL = {
  grass: "#30463f", grassLo: "#263834", grassHi: "#44604f", flower: "#c8d4f0",
  path: "#8c94aa", pathLo: "#6c7488", grout: "#465068", border: "#5c6478",
  bank: "#3a3634", water: "#24365a", waterLo: "#1c2a48", waterHi: "#45608e", pad: "#3c7a5a", padLo: "#2e6248", bud: "#f08aa8",
  stone: "#646a7a", stoneLo: "#4e5464", rock: "#6c7590", lichen: "#9ab08a",
  reed: "#34482e", reedTip: "#94a862", cattail: "#6a4632", willow: "#2f5a48", willowTip: "#5e8a64", bark: "#3e3438",
  post: "#4a3830", lantern: "#ffc070", lanternCap: "#2e2a30", tassel: "#c8322c", glow: "#ffaa50",
  moon: "#f8f0cc", moonLo: "#e4d8a8", moonGlow: "#9fb0ff", glitter: "#ffe8a8", firefly: "#d8ff8a",
  tree: "#1e3236", treeLo: "#18282c",
};
/** the night sky by elevation (degrees) */
const SKY: SkyStops = [[-10, "#22263a"], [0, "#444c6c"], [6, "#3c4464"], [18, "#323850"], [40, "#292e44"], [90, "#22263a"]];
const G = S.ground, PA = S.path, PO = S.pond, R = S.rock, M = S.moon;
const kx0 = PA.x - PA.w / 2, kx1 = PA.x + PA.w / 2;
const inPond = (x: number, z: number, grow = 0) => Math.hypot((x - PO.x) / (PO.rx + grow), (z - PO.z) / (PO.rz + grow)) < 1;
/** her eyes at the stand, and the moon's direction from them */
const EYE = new THREE.Vector3(...NIGHT_STAND.cam.pos);
const azR = (M.az * Math.PI) / 180, elR = (M.el * Math.PI) / 180;
const MOON_DIR = new THREE.Vector3(Math.sin(azR) * Math.cos(elR), Math.sin(elR), -Math.cos(azR) * Math.cos(elR));

// ---------------------------------------------------------------------------------------------------- the paintings
/** the lawn, one 4 m tile: dark grass, moonlit patches, blade strokes, tiny pale flowers */
const lawnTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(201);
  g.fillStyle = COL.grass; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 70 * r(), r() < 0.5 ? COL.grassLo : COL.grassHi, 0.35);
  for (let i = 0; i < 900; i++) {
    const x = W * r(), y = H * r(), l = 4 + 6 * r();
    g.strokeStyle = css(r() < 0.5 ? COL.grassHi : COL.grassLo, 0.55); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - l); g.stroke();
  }
  for (let i = 0; i < 40; i++) { g.fillStyle = css(COL.flower, 0.8); const x = W * r(), y = H * r(); for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(x + 2.2 * Math.cos(k * 1.57), y + 2.2 * Math.sin(k * 1.57), 1.6, 0, 7); g.fill(); } }
}, true);
/** the path, one tile across its whole width (u across, v along 2 m): a border of long kerb stones on both sides and
 *  flags in a running bond between */
const pathTex = () => {
  const inner = flagsTex({ seed: 203, base: COL.path, grout: COL.grout, nx: 3, ny: 3, bond: true, mottle: ["#c8d0e8", "#2c3448"], lip: 0.22, px: 512 });
  const img = inner.image as HTMLCanvasElement;
  return paint(512, 512, (g, W, H) => {
    const b = W * 0.09;
    g.drawImage(img, b, 0, W - 2 * b, H);
    for (const x of [0, W - b]) {
      g.fillStyle = COL.grout; g.fillRect(x, 0, b, H);
      for (let j = 0; j < 2; j++) { g.fillStyle = shadeOf(COL.border, j ? 0.04 : -0.03); g.fillRect(x + 3, j * H / 2 + 3, b - 6, H / 2 - 6); g.fillStyle = "rgba(220,228,250,0.18)"; g.fillRect(x + 3, j * H / 2 + 3, b - 6, 4); }
    }
  }, true);
};
const shadeOf = (hex: string, k: number) => css(mix(hex, k > 0 ? "#ffffff" : "#000000", Math.abs(k)));
/** the pond's water (repeats, 6 m): deep blue, paler ripple rings and strokes */
const waterTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(205);
  g.fillStyle = COL.water; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 20; i++) wrapBlotch(g, W, H, W * r(), H * r(), 40 + 60 * r(), r() < 0.5 ? COL.waterLo : COL.waterHi, 0.3);
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = W * r(), y = H * r(), w = 14 + 30 * r();
    g.strokeStyle = css(COL.waterHi, 0.55); g.lineWidth = 2.5;
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { g.beginPath(); g.moveTo(x + dx - w / 2, y + dy); g.quadraticCurveTo(x + dx, y + dy - 5, x + dx + w / 2, y + dy); g.stroke(); }
  }
}, true);
/** the moon's glitter: broken horizontal dashes, densest along the middle (u across the strip, v along it; repeats in v) */
const glitterTex = () => paint(256, 512, (g, W, H) => {
  const r = rng(207);
  g.clearRect(0, 0, W, H);
  for (let i = 0; i < 150; i++) {
    const u = 0.5 + (r() + r() + r() - 1.5) * 0.42, y = H * r(), w = (8 + 34 * r()) * (1 - Math.abs(u - 0.5) * 1.4);
    g.fillStyle = css(COL.glitter, 0.55 + 0.45 * r()); g.fillRect(W * u - w / 2, y, w, 2.5 + 2 * r());
  }
}, true);
/** the rock: slate blue with lighter planes and lichen */
const rockTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(209);
  g.fillStyle = COL.rock; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, W * r(), H * r(), 10 + 30 * r(), r() < 0.5 ? "#8c94aa" : COL.stoneLo, 0.5);
  for (let i = 0; i < 160; i++) { g.fillStyle = css(r() < 0.5 ? "#b8c0d0" : "#3a4050", 0.6); g.fillRect(W * r(), H * r(), 2, 2); }
  for (let i = 0; i < 26; i++) wrapBlotch(g, W, H, W * r(), H * r(), 4 + 9 * r(), COL.lichen, 0.7);
  g.strokeStyle = "rgba(40,44,58,0.5)"; g.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 * (r() - 0.5), y + 24 * r()); g.lineTo(x + 40 * (r() - 0.5), y + 40 * r()); g.stroke(); }
}, true);
/** the moon's face: pale gold, a few soft maria, a lighter rim */
const moonTex = () => paint(256, 256, (g, W) => {
  const r = rng(211), c = W / 2;
  g.clearRect(0, 0, W, W);
  g.save(); g.beginPath(); g.arc(c, c, c - 2, 0, 7); g.clip();
  g.fillStyle = COL.moon; g.fillRect(0, 0, W, W);
  for (let i = 0; i < 7; i++) blotch(g, c + (r() - 0.5) * W * 0.6, c + (r() - 0.5) * W * 0.6, 18 + 30 * r(), COL.moonLo, 0.8);
  for (let i = 0; i < 9; i++) { const x = c + (r() - 0.5) * W * 0.7, y = c + (r() - 0.5) * W * 0.7, rr = 4 + 8 * r(); g.strokeStyle = css(COL.moonLo, 0.9); g.lineWidth = 2; g.beginPath(); g.arc(x, y, rr, 0, 7); g.stroke(); }
  const gr = g.createRadialGradient(c, c, c * 0.7, c, c, c); gr.addColorStop(0, "rgba(255,255,240,0)"); gr.addColorStop(1, "rgba(255,255,240,0.5)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
  g.restore();
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildNight(K: Kit) {
  const group = new THREE.Group(); group.name = "night";
  const Mk = maker(K, group);

  // =================================================================================================== the ground
  const pondOutline = ellipsePts(PO.x, PO.z, PO.rx, PO.rz, 72, 0.035, 5);
  {
    // the lawn round the path and the pond (holes, never stacked layers)
    const pathHole: [number, number][] = [[kx0, PA.z1], [kx1, PA.z1], [kx1, PA.z0], [kx0, PA.z0]];
    Mk.mesh("night.ground", levelShape([[G.x0, G.z1], [G.x1, G.z1], [G.x1, G.z0], [G.x0, G.z0]], [pathHole, pondOutline], 0, 4), Mk.tex(lawnTex(), 0.95), { cast: false });
    Mk.mesh("night.path", levelQuad(kx0, kx1, PA.z0, PA.z1, 0, (x, z) => [(x - kx0) / PA.w, -z / 2]), Mk.tex(pathTex(), 0.9), { cast: false });
    // the lawn runs on beyond the ground's edge to the far card (one plain colour)
    Mk.mesh("night.ground.far", levelQuad(G.x0 - 60, G.x1 + 60, -70, G.z0, 0), Mk.flat(COL.grassLo, 0.95), { cast: false });
  }

  // =================================================================================================== THE POND
  const waterMap = waterTex(); waterMap.repeat.set(1, 1);
  const glitter = glitterTex(); glitter.wrapS = THREE.ClampToEdgeWrapping;
  let glitterMesh: THREE.Mesh, glintMesh: THREE.Mesh;
  {
    const wy = -PO.depth;
    const water = levelShape(ellipsePts(PO.x, PO.z, PO.rx + 0.3, PO.rz + 0.3, 72), [], wy, 6);
    Mk.mesh("night.pond.water", water, Mk.tex(waterMap, 0.35), { cast: false });
    // the earth bank: a ring wall from the lawn down past the water (double-sided: whichever way it faces, it is lit)
    const pos: number[] = [];
    for (let i = 0; i < pondOutline.length; i++) {
      const [ax, az] = pondOutline[i], [bx, bz] = pondOutline[(i + 1) % pondOutline.length];
      pos.push(ax, 0, az, bx, 0, bz, bx, wy - 0.06, bz, ax, 0, az, bx, wy - 0.06, bz, ax, wy - 0.06, az);
    }
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); bg.computeVertexNormals();
    Mk.mesh("night.pond.bank", bg, Mk.K.flat(COL.bank, { rough: 0.95, side: THREE.DoubleSide }), { cast: false });
    // bank stones round the rim (not where the reeds stand, not at the path)
    const P = new Part(K), mS = Mk.flat(COL.stone, 0.9), mSL = Mk.flat(COL.stoneLo, 0.9), r = rng(213);
    for (let i = 0; i < pondOutline.length; i += 3) {
      const [x, z] = pondOutline[i];
      if (S.reeds.some(([rx, rz, rr]) => Math.hypot(x - rx, z - rz) < rr * 0.8)) continue;
      if (NIGHT.bandits.some((b) => Math.hypot(x - b.x, z - b.z) < 0.9)) continue;
      const s = 0.28 + 0.22 * r();
      P.add(r() < 0.5 ? mS : mSL, rockG(300 + i, s * 1.3, s * 0.7, s, 1, 0.06).rotateY(r() * 3).translate(x, wy + 0.08, z), 0.012);
    }
    P.into(group, "night.pond.stones");
    // lotus pads and two buds
    const Pl = new Part(K), pad = Mk.flat(COL.pad, 0.8), padLo = Mk.flat(COL.padLo, 0.8), bud = Mk.flat(COL.bud, 0.6);
    const pads: [number, number, number][] = [[PO.x - 1.6, PO.z + 2.2, 0.32], [PO.x - 1.1, PO.z + 2.9, 0.24], [PO.x - 2.0, PO.z - 1.0, 0.3], [PO.x - 1.4, PO.z - 1.7, 0.22], [PO.x + 0.8, PO.z + 4.2, 0.3], [PO.x - 2.5, PO.z + 0.6, 0.26], [PO.x + 1.5, PO.z - 3.4, 0.3], [PO.x - 0.5, PO.z - 4.6, 0.28]];
    pads.forEach(([x, z, s], i) => {
      Pl.add(i % 2 ? pad : padLo, new THREE.CircleGeometry(s, 20, 0.35, Math.PI * 2 - 0.5).rotateX(-Math.PI / 2).rotateY(i * 1.7).translate(x, wy + 0.025, z), 0);
      if (i === 0 || i === 4) Pl.add(bud, new THREE.ConeGeometry(0.07, 0.2, 7).translate(x + 0.15, wy + 0.13, z + 0.05), 0.006);
    });
    Pl.into(group, "night.pond.lotus", { cast: false });
    // THE MOON'S GLITTER: a strip on the water along the moon's azimuth from her eyes at the stand, where it crosses
    // the pond (its length clipped to the water by the pond's extent along that line)
    const dir = new THREE.Vector2(MOON_DIR.x, MOON_DIR.z).normalize();
    let s0 = 0, s1 = 0;
    for (let s = 2; s < 40; s += 0.1) { const x = EYE.x + dir.x * s, z = EYE.z + dir.y * s; if (inPond(x, z, -0.5)) { if (!s0) s0 = s; s1 = s; } }
    const len = Math.max(1, s1 - s0), mid = (s0 + s1) / 2, wGl = 0.9;
    const gGeo = new THREE.PlaneGeometry(wGl, len).rotateX(-Math.PI / 2).rotateY(Math.atan2(-dir.x, -dir.y)).translate(EYE.x + dir.x * mid, wy + 0.012, EYE.z + dir.y * mid);
    glitterMesh = new THREE.Mesh(gGeo, Mk.basic(COL.glitter, { map: glitter, additive: true, opacity: 0.85 }));
    glitterMesh.name = "night.pond.glitter"; glitterMesh.layers.set(NOINK); glitterMesh.renderOrder = 4; group.add(glitterMesh);
    (glitterMesh.material as THREE.MeshBasicMaterial).map!.repeat.set(1, len / 3);
    // the far lantern's warm glint on the water (toward her eyes)
    const L2 = S.lanterns[1], gx = Math.max(L2[0] + 0.9, PO.x - Math.sqrt(Math.max(0, 1 - ((L2[1] - PO.z) / PO.rz) ** 2)) * PO.rx + 0.5);
    const glint = glitterTex();
    glintMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 2.2).rotateX(-Math.PI / 2).rotateY(Math.atan2(EYE.x - gx, EYE.z - L2[1])).translate(gx, wy + 0.014, L2[1] + 0.8), Mk.basic("#ffb060", { map: glint, additive: true, opacity: 0.7 }));
    glintMesh.name = "night.pond.glint"; glintMesh.layers.set(NOINK); glintMesh.renderOrder = 4; group.add(glintMesh);
  }

  // =================================================================================================== reeds, tufts, willows
  const strands: Strand[] = [];
  {
    const r = rng(215);
    // the reed beds
    for (const [cx, cz, rr] of S.reeds) {
      const n = Math.round(rr * rr * 34);
      for (let c = 0; c < n; c++) {
        const a = r() * Math.PI * 2, d = rr * Math.sqrt(r()), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (x < kx1 + 0.3) continue;
        if (NIGHT.bandits.some((b) => Math.hypot(x - b.x, z - b.z) < S.clear)) continue;
        const y0 = inPond(x, z, 0.15) ? -PO.depth : 0, ph = r() * 6.28, h = 1.1 + 0.6 * r();
        for (let b = 0; b < 6; b++) {
          const lean = 0.12 + 0.2 * r(), la = r() * 6.28, hh = h * (0.6 + 0.4 * r());
          const root = new THREE.Vector3(x + 0.04 * (r() - 0.5), y0, z + 0.04 * (r() - 0.5));
          strands.push({ root, tip: root.clone().add(new THREE.Vector3(Math.cos(la) * lean, hh, Math.sin(la) * lean)), w: 0.045, c0: COL.reed, c1: COL.reedTip, ph: ph + b * 0.2, amp: 0.12, face: r() * 3 });
        }
        if (r() < 0.45) {                                                    // a cattail: a thin stem and a brown head
          const root = new THREE.Vector3(x, y0, z), top = root.clone().add(new THREE.Vector3(0.05, h * 1.05, 0.02));
          strands.push({ root, tip: top, w: 0.012, c0: COL.reed, c1: COL.reedTip, ph, amp: 0.12, seg: 4, face: 0.5 });
          strands.push({ root: top.clone().add(new THREE.Vector3(0, -0.22, 0)), tip: top.clone().add(new THREE.Vector3(0, -0.04, 0)), w: 0.05, c0: COL.cattail, c1: COL.cattail, ph, amp: 0.0, seg: 1, face: 1.3 });
        }
      }
    }
    // grass tufts along both path edges and round the rock and the lantern posts
    const tuft = (x: number, z: number, h: number) => {
      const ph = r() * 6.28;
      for (let b = 0; b < 5; b++) { const la = r() * 6.28, root = new THREE.Vector3(x + 0.05 * (r() - 0.5), 0, z + 0.05 * (r() - 0.5)); strands.push({ root, tip: root.clone().add(new THREE.Vector3(Math.cos(la) * 0.08, h * (0.6 + 0.4 * r()), Math.sin(la) * 0.08)), w: 0.03, c0: COL.grassLo, c1: COL.grassHi, ph, amp: 0.04, seg: 2, face: r() * 3 }); }
    };
    for (let z = PA.z1 - 0.3; z > -24; z -= 0.55 + 0.5 * r()) {
      if (r() < 0.75) tuft(kx0 - 0.08 - 0.25 * r(), z, 0.22 + 0.15 * r());
      const xe = kx1 + 0.08 + 0.25 * r();
      if (r() < 0.75 && !NIGHT.bandits.some((b) => Math.hypot(xe - b.x, z - b.z) < S.clear) && !inPond(xe, z, 0.2)) tuft(xe, z, 0.22 + 0.15 * r());
    }
    for (let i = 0; i < 9; i++) { const a = r() * 6.28; tuft(R.x + Math.cos(a) * (R.w * 0.55), R.z + Math.sin(a) * (R.d * 0.55), 0.3); }
  }
  // willows: inked trunks, hanging strands
  {
    const P = new Part(K), bark = Mk.flat(COL.bark, 0.9), r = rng(217);
    for (const [wx, wz] of S.willows) {
      const base = new THREE.Vector3(wx, 0, wz), top = base.clone().add(new THREE.Vector3(0.6 * (r() - 0.5), 3.6, 0.4 * (r() - 0.5)));
      P.add(bark, bar(base.clone().setY(-0.1), top, 0.26, 0.17, 10), 0.03);
      const arms: THREE.Vector3[] = [];
      for (let a = 0; a < 5; a++) {
        const an = (a / 5) * 6.28 + r(), e = top.clone().add(new THREE.Vector3(Math.cos(an) * (1.3 + 0.6 * r()), 0.8 + 0.6 * r(), Math.sin(an) * (1.1 + 0.5 * r())));
        P.add(bark, bar(top.clone().add(new THREE.Vector3(0, -0.4, 0)), e, 0.11, 0.06, 8), 0.02); arms.push(e);
      }
      arms.push(top.clone().add(new THREE.Vector3(0, 1.4, 0)));
      // the hanging strands: from points round each arm's end, down nearly to the ground
      for (const e of arms) for (let s = 0; s < 26; s++) {
        const an = r() * 6.28, d = 0.9 * Math.sqrt(r()), root = e.clone().add(new THREE.Vector3(Math.cos(an) * d, 0.2 * (r() - 0.5), Math.sin(an) * d));
        const L = 2.2 + 1.8 * r();
        strands.push({ root, tip: root.clone().add(new THREE.Vector3(0.1 * (r() - 0.5), -L, 0.1 * (r() - 0.5))), w: 0.14, c0: COL.willow, c1: COL.willowTip, ph: r() * 6.28, amp: 0.3, seg: 4, face: r() * 3 });
      }
    }
    P.into(group, "night.willows");
  }
  const field = strandField(Mk, strands, "night.reeds");
  group.add(field.mesh);

  // =================================================================================================== THE ROCK
  {
    const mR = Mk.tex(rockTex(), 0.9);
    Mk.mesh("night.rock", rockFit(219, R.w, R.h, R.d, 2, 0.08).translate(R.x, 0, R.z), mR);
    Mk.mesh("night.rock.small", rockG(221, 0.6, 0.42, 0.5, 1, 0.05).translate(R.x - 0.55, 0, R.z + 0.75), mR);
    Mk.mesh("night.rock.small", rockG(223, 0.42, 0.3, 0.38, 1, 0.05).translate(R.x + 0.2, 0, R.z - 0.75), mR);
  }

  // =================================================================================================== the lanterns
  const glows: THREE.Mesh[] = [], lights: THREE.PointLight[] = [];
  {
    const P = new Part(K), post = Mk.flat(COL.post, 0.85), lm = { paper: Mk.basic(COL.lantern), cap: Mk.flat(COL.lanternCap, 0.5), tassel: Mk.flat(COL.tassel, 0.8) };
    const H = S.lanternH, lh = 0.46;
    for (const [x, z] of S.lanterns) {
      const out = x < PA.x ? -1 : 1, lx = x + out * 0.3;                    // the bracket turns AWAY from the path
      P.add(post, boxG(x - 0.05, x + 0.05, -0.05, H + 0.32, z - 0.05, z + 0.05), 0.012);
      P.add(post, boxG(x - 0.09, x + 0.09, H + 0.3, H + 0.36, z - 0.09, z + 0.09), 0.01);
      P.add(post, boxG(Math.min(x, lx) - 0.02, Math.max(x, lx) + 0.02, H + 0.12, H + 0.17, z - 0.025, z + 0.025), 0.008);
      P.add(post, boxG(x - 0.12, x + 0.12, -0.02, 0.1, z - 0.12, z + 0.12), 0.01);
      addLantern(P, lm, lx, H + 0.02, z, lh, 0.1);
      const gl = glowSprite(0.5, COL.glow, 0.42); gl.position.set(lx, H - lh * 0.48, z); gl.name = "night.lantern.glow"; group.add(gl); glows.push(gl);
      const pl = new THREE.PointLight("#ffb060", 0, 7, 2); pl.position.set(lx, H - lh * 0.5, z); group.add(pl); lights.push(pl);
    }
    P.into(group, "night.lanterns", { cast: false });
  }

  // =================================================================================================== the middle distance
  {
    const B = new Batch(), mT = [Mk.flat(COL.tree, 0.95), Mk.flat(COL.treeLo, 0.95)], r = rng(225);
    const crown = new THREE.IcosahedronGeometry(1, 3);
    for (let i = 0; i < 26; i++) {
      const west = i % 2 === 0, x = west ? NX - 6 - 22 * r() : NX + 12 + 16 * r(), z = -24 - 30 * r(), h = 3 + 3 * r();
      if (!west && Math.abs(x - (EYE.x + MOON_DIR.x / -MOON_DIR.z * (EYE.z - z))) < 6) continue;   // never under the moon
      B.add(mT[i % 2], crown.clone().scale(h * 0.6, h * 0.55, h * 0.6).translate(x, h * 0.75, z));
      B.add(mT[1], new THREE.CylinderGeometry(0.15, 0.2, h * 0.5, 6).translate(x, h * 0.25, z));
    }
    B.flush(group, "night.far.trees", false, false);
    group.children.filter((c) => c.name === "night.far.trees").forEach((c) => c.layers.set(NOINK));
  }

  // =================================================================================================== the far view
  {
    const Z = G.z0 - 9, x0 = NX - 90, x1 = NX + 90, y0 = -1, y1 = 22;
    const card = farCard(x0, x1, y0, y1, Z, 2048, Math.round(2048 * (y1 - y0) / (x1 - x0)), (g: G2, k) => {
      g.clearRect(0, 0, k.W, k.H);
      const r = rng(227), py = k.py, px = k.px;
      // hills behind (two ranges, a little lighter than the sky's foot)
      const hills = (col: string, base: number, amp: number, f: number, ph: number) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(0, k.H);
        for (let i = 0; i <= 80; i++) { const x = x0 + (x1 - x0) * i / 80; g.lineTo(px(x), py(base + amp * (0.6 * Math.sin(x * f + ph) + 0.4 * Math.sin(x * f * 2.3 + ph * 2)))); }
        g.lineTo(k.W, k.H); g.closePath(); g.fill();
      };
      hills("#30395e", 9, 4, 0.05, 1.2); hills("#2a3352", 5.5, 2.5, 0.09, 0.3);
      // THE PALACE: a long wall, gate towers, hall roofs with up-turned eaves, warm windows
      const dark = "#20263e", mid = "#262c48", win = "#ffb860";
      g.fillStyle = dark; g.fillRect(0, py(3.2), k.W, py(y0) - py(3.2));
      for (let x = x0; x < x1; x += 1.6) g.fillRect(px(x), py(3.7), px(x + 0.9) - px(x), py(3.2) - py(3.7));
      const hall = (cx: number, w: number, h: number, roofH: number, tiers: number, lit: number) => {
        g.fillStyle = mid; g.fillRect(px(cx - w / 2), py(h), px(cx + w / 2) - px(cx - w / 2), py(3.2) - py(h));
        for (let t = 0; t < tiers; t++) {
          const yb = h + t * roofH * 1.1, ww = w * (1.25 - t * 0.22);
          g.fillStyle = dark; g.beginPath();
          g.moveTo(px(cx - ww / 2 - 1.2), py(yb + 0.6)); g.quadraticCurveTo(px(cx - ww / 2), py(yb), px(cx - ww * 0.3), py(yb + roofH * 0.7));
          g.lineTo(px(cx + ww * 0.3), py(yb + roofH * 0.7)); g.quadraticCurveTo(px(cx + ww / 2), py(yb), px(cx + ww / 2 + 1.2), py(yb + 0.6));
          g.lineTo(px(cx + ww / 2), py(yb - 0.2)); g.lineTo(px(cx - ww / 2), py(yb - 0.2)); g.closePath(); g.fill();
          if (t < tiers - 1) { g.fillStyle = mid; g.fillRect(px(cx - ww * 0.32), py(yb + roofH * 1.1), px(cx + ww * 0.32) - px(cx - ww * 0.32), py(yb + roofH * 0.6) - py(yb + roofH * 1.1)); }
        }
        for (let i = 0; i < lit; i++) { const wx = cx - w * 0.38 + (w * 0.76) * r(); g.fillStyle = css(win, 0.9); g.fillRect(px(wx), py(h - 0.6), Math.max(3, px(wx + 0.7) - px(wx)), py(h - 1.6) - py(h - 0.6)); }
      };
      // keep the tall pieces off the moon's line (x near the moon's foot on the card)
      const moonX = EYE.x + (MOON_DIR.x / -MOON_DIR.z) * (EYE.z - Z);
      const halls: [number, number, number, number, number, number][] = [[NX - 52, 12, 7, 2.2, 1, 2], [NX - 30, 9, 9, 2.4, 2, 2], [NX - 14, 14, 7.5, 2.4, 1, 3], [NX + 30, 10, 10, 2.5, 3, 2], [NX + 50, 16, 7, 2.2, 1, 3], [NX + 72, 8, 8.5, 2.2, 2, 1]];
      for (const h of halls) if (Math.abs(h[0] - moonX) > h[1] / 2 + 8) hall(...h);
      hall(moonX + 1, 10, 5.2, 1.6, 1, 2);                                  // a low hall under the moon
      // trees in front of the wall
      for (let i = 0; i < 60; i++) { const x = x0 + (x1 - x0) * r(), rr = 1.2 + 1.6 * r(); g.fillStyle = r() < 0.5 ? "#1a2034" : "#1e263c"; g.beginPath(); g.ellipse(px(x), py(1.5 + rr * 0.5), rr * k.s, rr * 0.8 * k.s, 0, 0, 7); g.fill(); }
      g.fillStyle = "#1a2034"; g.fillRect(0, py(1.2), k.W, k.H - py(1.2));
      // far lanterns along the wall
      for (let i = 0; i < 12; i++) { const x = x0 + (x1 - x0) * r(); blotch(g, px(x), py(4.2), 8, "#ffb060", 0.6); g.fillStyle = "#ffd090"; g.fillRect(px(x) - 2, py(4.4), 4, 5); }
    });
    (card.material as THREE.MeshBasicMaterial).transparent = true;
    card.name = "night.far"; group.add(card);
  }
  // THE SKY: the dome (stars, a faint milky band, the glow round the moon) and the moon itself
  {
    const mu = 0.75 - M.az / 360;
    group.add(skyDome(new THREE.Vector3(NX, 0, 0), SKY, (g, W, H) => {
      const r = rng(229), elY = (el: number) => H * (90 - el) / 180;
      // the milky band: a soft diagonal haze
      for (let i = 0; i < 60; i++) { const u = r(), el = 30 + 40 * u + 8 * (r() - 0.5); blotch(g, W * (0.55 + 0.35 * u), elY(el), 40 + 40 * r(), "#525c88", 0.18); }
      // stars: small dots, a few with a cross glint (none under 6 degrees)
      for (let i = 0; i < 700; i++) {
        const x = W * r(), el = 6 + 84 * Math.sqrt(r()), y = elY(el), s = r();
        g.fillStyle = css(s < 0.85 ? "#cfd8ff" : "#fff2c8", 0.5 + 0.5 * r()); g.beginPath(); g.arc(x, y, s < 0.9 ? 1.2 : 2.2, 0, 7); g.fill();
        if (s > 0.97) { g.strokeStyle = "rgba(240,244,255,0.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.stroke(); }
      }
      // the moon's glow on the dome
      blotch(g, W * mu, elY(M.el), 150, "#7280b8", 0.45); blotch(g, W * mu, elY(M.el), 60, "#b0b8e0", 0.4);
    }));
  }
  const moonR = M.dist * Math.tan((M.deg / 2) * Math.PI / 180);
  const moonAt = EYE.clone().addScaledVector(MOON_DIR, M.dist);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(moonR, 48), new THREE.MeshBasicMaterial({ map: moonTex(), transparent: true, fog: false, depthWrite: false }));
  moon.name = "night.sky.moon"; moon.layers.set(NOINK); moon.renderOrder = -60; moon.position.copy(moonAt); moon.lookAt(EYE); group.add(moon);
  const halo = glowSprite(moonR * 3.2, COL.moonGlow, 0.5); halo.name = "night.sky.moon.glow"; halo.renderOrder = -61; halo.position.copy(moonAt).addScaledVector(MOON_DIR, 2); halo.lookAt(EYE); group.add(halo);

  // =================================================================================================== fireflies
  const FN = 36, ff = new Float32Array(FN * 3), ffBase: [number, number, number, number][] = [];
  {
    const r = rng(231);
    for (let i = 0; i < FN; i++) { const p = S.reeds[i % S.reeds.length], a = r() * 6.28, d = p[2] * (0.4 + 0.9 * r()); ffBase.push([p[0] + Math.cos(a) * d, 0.5 + 1.2 * r(), p[1] + Math.sin(a) * d, r() * 6.28]); }
  }
  const ffGeo = new THREE.BufferGeometry(); ffGeo.setAttribute("position", new THREE.BufferAttribute(ff, 3));
  const dot = paint(64, 64, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,255,220,1)"); gr.addColorStop(0.3, "rgba(220,255,140,0.7)"); gr.addColorStop(1, "rgba(200,255,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); });
  const flies = new THREE.Points(ffGeo, new THREE.PointsMaterial({ map: dot, color: COL.firefly, size: 0.12, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  flies.name = "night.fireflies"; flies.layers.set(NOINK); flies.frustumCulled = false; flies.renderOrder = 5; group.add(flies);

  // =================================================================================================== the light
  const L = lightRig(group, { dir: [0.6, 0.65, -0.25], k: 1.2, col: "#c8d0f0", at: [NX, 0, -4], half: 10, hemi: ["#5a6280", "#2a2e34", 1.5], point: { col: "#98a4d8", k: 1.0, at: [NX - 0.7, 1.5, 2.1], dist: 3.5 } });

  let clock = 0, moonK = 1;
  const pose = (t: number) => {
    field.update(t, 1);
    waterMap.offset.set(0.01 * Math.sin(t * 0.2), -t * 0.012);
    glitter.offset.set(0, -t * 0.06);
    const gm = glitterMesh.material as THREE.MeshBasicMaterial; gm.opacity = moonK * (0.75 + 0.1 * Math.sin(t * 1.7));
    (glintMesh.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.08 * Math.sin(t * 2.3);
    // the lanterns breathe a little (smooth, +-6 %: never a flash)
    lights.forEach((l, i) => { l.intensity = 2.6 * (1 + 0.06 * Math.sin(t * 2.1 + i * 2) + 0.03 * Math.sin(t * 5.3 + i)); });
    glows.forEach((gl, i) => { (gl.material as THREE.MeshBasicMaterial).opacity = 0.4 + 0.03 * Math.sin(t * 2.1 + i * 2); });
    for (let i = 0; i < FN; i++) {
      const [x, y, z, p] = ffBase[i];
      ff[i * 3] = x + 0.5 * Math.sin(t * 0.4 + p); ff[i * 3 + 1] = y + 0.25 * Math.sin(t * 0.7 + p * 1.3); ff[i * 3 + 2] = z + 0.5 * Math.cos(t * 0.33 + p * 0.7);
    }
    (ffGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (flies.material as THREE.PointsMaterial).opacity = 0.75 + 0.25 * Math.sin(t * 1.9);
  };
  const setMoon = (k: number) => {
    moonK = k;
    L.key.intensity = 1.2 * (0.3 + 0.7 * k); L.hemi.intensity = 1.2 + 0.3 * k;
    (halo.material as THREE.MeshBasicMaterial).opacity = 0.5 * k;
    (moon.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.5 * k;
  };
  setMoon(1); pose(0);
  return {
    group,
    view(cam: THREE.Vector3) { for (const gl of glows) faceY(gl, cam); },
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "moon") { setMoon(Math.max(0, Math.min(1, Number(v)))); pose(clock); }
    },
  };
}

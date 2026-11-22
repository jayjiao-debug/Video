// THE GROVE (place "grove", island x = ISLAND.grove): scene 1, Sunday dawn, the sycamore grove west of Verona: the
// film's FIRST FRAME. Romeo hugs the big sycamore and bawls; his crumpled love poems lie all round him.
//
// WHAT THERE IS (her lens looks -z at the tree; east = -x = frame left, where the sun comes up)
//   - THE BIG SYCAMORE at (0, -1.2): a hug-height trunk r 0.35 (its front face at z -0.85) with a root flare and five
//     buttress roots (none toward the camera, where he stands), plane-tree bark (cream, olive, grey and brown
//     patches), a fork at 2.6 m into three limbs and a high crown; one LOW BRANCH reaches out to the frame's upper left
//     with hanging leaf sprays;
//   - THE GROVE: a dozen more sycamore trunks from 3 to 14 m back, fading into MIST BANKS (drifting cards between the
//     rows); a painted far ring of pale trunks and canopy; a dawn sky (peach at the horizon, pale grey-green up) with
//     the SUN'S GLOW low at the left (az -55); soft SUN SHAFTS slanting down to the right between the trunks;
//   - THE GROUND: dewy olive grass (paint: strokes, dew specks, clover, fallen leaves), a worn earth path from the
//     right front behind the tree to the back left, grass tufts and FERNS round the trunk feet;
//   - HIS POEMS: 9 crumpled paper balls and 4 loose curled pages on the grass round him (props-kit Parts).
// PARAM pages 0..1: the loose pages lift off the grass and flutter a little (he flings his arm). Default 0.
// LIGHT: a low warm sun from the left and a little behind (long shadows to the right front), a pale sky fill.
// INK / FLICKER: bark patches, grass, dew, leaves on the ground are PAINT; inked geometry is chunky (trunks, roots,
// limbs, crown blobs); mist, shafts, fronds, tufts, sky and the far ring are NOINK; paper is a Part with its own hull.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, blotch, skyDome, Batch, groundG, type SkyStops } from "../../../kit/sets/okit";
import { ISLAND } from "../places";
import {
  maker, lathe, bar, blobG, bentLimb, panoramaRing, strandField, wrapBlotch, mistCard, lightShaft, paperBallG, paperTex, pageG, pageTex,
  frondField, fernTex, leafClusterTex, crossCardsG, Part, NOINK, type Strand, type Frond,
} from "./parts/a_util";

const X0 = ISLAND.grove;
const TREE = { x: X0, z: -1.2, r: 0.35 };
/** the sun: bearing (0 = -z, 90 = +x) and elevation, degrees */
const SUN_AZ = -55, SUN_EL = 22;
const azR = (SUN_AZ * Math.PI) / 180, elR = (SUN_EL * Math.PI) / 180;
const SUN: [number, number, number] = [Math.sin(azR) * Math.cos(elR), Math.sin(elR), -Math.cos(azR) * Math.cos(elR)];

const COL = {
  grass: "#7f8c52", grassHi: "#a2a866", grassLo: "#5f6e44", earth: "#a48e68", earthLo: "#8a7656", dew: "#f6f2e2",
  leafFall: ["#b58a4e", "#a07a46", "#c4a060", "#8e7a4a"],
  bark: "#ddd3ba", barkPatch: ["#b8b294", "#a8a487", "#c6bc9f", "#a3a68a", "#a8977a", "#bfb59a"], barkLine: "#6a604e",
  leaf: ["#6f8a48", "#7e9a52", "#8fa65a", "#5e7a40"], leafLine: "#2e3424", crown: "#93a866", crownLo: "#7f9658",
  fern: "#7a9a4c", fernHi: "#94ae5c", tuft0: "#7f8c52", tuft1: "#c2c27e",
  mist: "#f3e8d6", sun: "#ffd28e", far: "#d9d2c0",
};
const SKY: SkyStops = [[-10, "#d9cbb4"], [0, "#f1dcc0"], [5, "#f0e0ca"], [14, "#e2ded0"], [32, "#cdd5cf"], [60, "#bccacb"], [90, "#b2c2c4"]];

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.28, 0.2]], [-5, [0.5, 0.46, 0.36]], [10, [0.72, 0.66, 0.56]], [45, [0.66, 0.68, 0.64]], [90, [0.6, 0.64, 0.64]]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.98, 0.88, 0.74] }],
};
export const GROVE_LOOK: PlaceLook = {
  bg: "#ece0cc",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.5, color: "#3a3224" },
  cast: {
    key: [-0.7, 0.42, 0.58], tint: [1.0, 0.88, 0.74], tintK: 0.6, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0],
    shade: [1.06, 0.95, 1.26], shadeK: 0.42, wrap: [40, 70], edge: 0.14, broad: 0.22, bodySat: 0.14, sheen: 0.18, lift: 0.04, contactLen: 0.5,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.5,
};
export const GROVE_PARAMS: Record<string, ParamValue> = { pages: 0 };

// ---------------------------------------------------------------------------------------------------- paintings
/** plane-tree bark: a pale cream skin with irregular flaking patches of olive, grey and brown (wraps round; u round
 *  the trunk, v up) */
const barkTex = (seed: number) => paint(512, 512, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = COL.bark; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, W * r(), H * r(), 40 + 60 * r(), r() < 0.5 ? "#e6dec8" : "#c4b99c", 0.3);
  // flaking patches: small, soft-edged, close in value to the cream skin (olive, grey, a little brown)
  for (let i = 0; i < 150; i++) {
    const cx = W * r(), cy = H * r(), rx = 7 + 20 * r(), ry = rx * (0.7 + 0.9 * r()), n = 8, col = COL.barkPatch[Math.floor(r() * COL.barkPatch.length)];
    const pts: [number, number][] = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, rr = 0.6 + 0.55 * r(); pts.push([Math.cos(a) * rx * rr, Math.sin(a) * ry * rr]); }
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) {
      if (cx + dx + rx < -2 || cx + dx - rx > W + 2 || cy + dy + ry < -2 || cy + dy - ry > H + 2) continue;
      g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(cx + dx + px, cy + dy + py) : g.moveTo(cx + dx + px, cy + dy + py))); g.closePath();
      g.fillStyle = css(col, 0.75); g.fill(); g.strokeStyle = css(COL.barkLine, 0.16); g.lineWidth = 1.5; g.stroke();
    }
  }
  // fine horizontal lenticels
  g.strokeStyle = css(COL.barkLine, 0.18); g.lineWidth = 1.4;
  for (let i = 0; i < 120; i++) { const x = W * r(), y = H * r(), l = 5 + 8 * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 2); g.stroke(); }
}, true);
/** the crown's skin: leaf shapes on green (tiles) */
const crownTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(131);
  g.fillStyle = "#e6eedc"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    const x = W * r(), y = H * r(), s = 6 + 6 * r(), v = 0.78 + 0.3 * r();
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) {
      if (x + dx < -20 || x + dx > W + 20 || y + dy < -20 || y + dy > H + 20) continue;
      g.save(); g.translate(x + dx, y + dy); g.rotate(r() * 6.28); g.beginPath();
      for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + (k / 10 - 0.5) * 3.6, rr = k % 2 === 0 ? s : s * 0.5; if (k) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fillStyle = css([255 * v * 0.88, 255 * v, 255 * v * 0.8]); g.fill(); g.strokeStyle = "rgba(60,70,50,0.18)"; g.lineWidth = 1.2; g.stroke(); g.restore();
    }
  }
}, true);

// ---------------------------------------------------------------------------------------------------- the place
const buildGrove = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "grove";
  const Mk = maker(K, group);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ============================================================================================ the ground
  const GS = 14, GCX = X0, GCZ = -2.5, GPX = 3072;
  const gtex = paint(GPX, GPX, (g, S) => {
    const r = rng(101), px = (x: number) => ((x - GCX) / GS + 0.5) * S, pz = (z: number) => ((z - GCZ) / GS + 0.5) * S, s = S / GS;
    g.fillStyle = COL.grass; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 160; i++) blotch(g, S * r(), S * r(), s * (0.4 + 1.4 * r()), r() < 0.5 ? COL.grassHi : COL.grassLo, 0.22);
    // the worn path: right front, behind the tree's right, to the back left
    const path: [number, number][] = [[X0 + 4.5, 4.4], [X0 + 2.6, 1.6], [X0 + 1.5, -1.0], [X0 + 0.7, -3.2], [X0 - 0.8, -5.6], [X0 - 2.8, -9.4]];
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.filter = `blur(${Math.round(s * 0.12)}px)`;
    g.strokeStyle = css(COL.earthLo, 0.55); g.lineWidth = s * 0.95; g.beginPath(); path.forEach(([x, z], i) => (i ? g.lineTo(px(x), pz(z)) : g.moveTo(px(x), pz(z)))); g.stroke();
    g.strokeStyle = css(COL.earth, 0.8); g.lineWidth = s * 0.62; g.stroke();
    g.restore();
    // darker earth round the trunk foot (roots, shade)
    blotch(g, px(TREE.x), pz(TREE.z), s * 1.1, "#5a5838", 0.55);
    // grass strokes everywhere (short, upright-ish, two tones)
    g.lineCap = "round";
    for (let i = 0; i < 70000; i++) {
      const x = S * r(), y = S * r(), l = s * (0.025 + 0.03 * r()), a = -Math.PI / 2 + (r() - 0.5) * 0.9;
      g.strokeStyle = css(r() < 0.5 ? COL.grassHi : COL.grassLo, 0.35); g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    // clover and tiny flowers
    for (let i = 0; i < 2600; i++) { const x = S * r(), y = S * r(); g.fillStyle = r() < 0.7 ? "rgba(240,236,214,0.75)" : "rgba(236,214,120,0.7)"; g.beginPath(); g.arc(x, y, 1.4 + 1.2 * r(), 0, 7); g.fill(); }
    // fallen sycamore leaves, more round the big tree
    for (let i = 0; i < 1300; i++) {
      const near = r() < 0.45, x = near ? px(TREE.x + (r() - 0.5) * 5) : S * r(), y = near ? pz(TREE.z + (r() - 0.5) * 5) : S * r(), ss = s * (0.03 + 0.03 * r());
      g.save(); g.translate(x, y); g.rotate(r() * 6.28); g.beginPath();
      for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + (k / 10 - 0.5) * 3.6, rr = k % 2 === 0 ? ss : ss * 0.5; if (k) g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fillStyle = css(COL.leafFall[Math.floor(r() * 4)], 0.85); g.fill(); g.strokeStyle = "rgba(80,60,40,0.4)"; g.lineWidth = 1.2; g.stroke(); g.restore();
    }
    // dew: pale specks
    for (let i = 0; i < 9000; i++) { const x = S * r(), y = S * r(); g.fillStyle = css(COL.dew, 0.35 + 0.4 * r()); g.fillRect(x, y, 1.6, 1.6); }
  });
  {
    const geo = groundG(GCX, GCZ, GS, 300);
    const mat = Mk.tex(gtex, 0.95);
    // the edge colour runs on: the texture is clamped, its border pixels are grass-coloured
    Mk.mesh("grove.ground", geo, mat, { cast: false });
  }

  // ============================================================================================ THE BIG SYCAMORE
  const barkM = Mk.tex(barkTex(111), 0.9), barkM2 = Mk.tex(barkTex(113), 0.9);
  const crownMat = K.flat(COL.crown, { map: crownTex(), rough: 0.95 }), crownMatLo = K.flat(COL.crownLo, { map: crownTex(), rough: 0.95 });
  {
    const B = new Batch();
    const prof: [number, number][] = [[0.66, -0.05], [0.56, 0.06], [0.46, 0.22], [0.395, 0.45], [0.362, 0.8], [0.352, 1.2], [0.348, 1.7], [0.345, 2.2], [0.36, 2.55], [0.4, 2.8], [0.2, 3.0]];
    const trunk = lathe(prof, 28);
    { const uv = trunk.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * 2.2); }
    B.add(barkM, trunk.translate(TREE.x, 0, TREE.z));
    // buttress roots (none toward +z, where he stands)
    for (const [deg, len] of [[150, 0.95], [200, 1.0], [262, 0.9], [322, 1.05], [18, 0.95]] as [number, number][]) {
      const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      B.add(barkM, bar(V(TREE.x + 0.25 * c, 0.3, TREE.z + 0.25 * s), V(TREE.x + len * c, -0.04, TREE.z + len * s), 0.16, 0.05, 12));
    }
    // the fork: three limbs up into the crown
    const fork = V(TREE.x, 2.75, TREE.z);
    const limbs: [THREE.Vector3, THREE.Vector3][] = [[V(TREE.x - 1.7, 6.6, TREE.z - 1.3), V(-0.3, 0, 0.2)], [V(TREE.x + 0.3, 7.6, TREE.z - 1.6), V(0.2, 0, 0)], [V(TREE.x + 1.8, 6.3, TREE.z - 0.5), V(0.25, 0, 0.2)]];
    for (const [end, bow] of limbs) {
      for (const gq of bentLimb(fork.clone().add(V(0, -0.15, 0)), end, 0.24, 0.11, bow)) B.add(barkM, gq);
      // two branches off each limb, crown blobs at their ends
      for (let k = 0; k < 2; k++) {
        const at = fork.clone().lerp(end, 0.55 + 0.25 * k), tip = at.clone().add(V((end.x - fork.x) * 0.6 + (k ? 1 : -1) * 0.8, 1.2, (k ? 0.6 : -0.6)));
        B.add(barkM, bar(at, tip, 0.09, 0.05, 10));
        B.add(k ? crownMat : crownMatLo, blobG(120 + k + Math.round(end.x * 10), 2, 0.22).scale(1.5, 1.0, 1.3).translate(tip.x, tip.y + 0.3, tip.z));
      }
      B.add(crownMat, blobG(127 + Math.round(end.z * 10), 2, 0.2).scale(1.9, 1.3, 1.6).translate(end.x, end.y + 0.5, end.z));
    }
    // THE LOW BRANCH out to the upper left of the opening frame
    const b0 = V(TREE.x - 0.28, 2.0, TREE.z + 0.08), b1 = V(TREE.x - 1.0, 2.3, TREE.z + 0.5), b2 = V(TREE.x - 1.9, 2.45, TREE.z + 0.8);
    B.add(barkM2, bar(b0, b1, 0.12, 0.085, 12)); B.add(barkM2, bar(b1, b2, 0.085, 0.05, 10));
    B.flush(group, "grove.sycamore");
  }
  // the low branch's foliage: crossed leaf-cluster cards (NOINK, alpha-tested, painted outlines), hanging below it
  const leafMats = [0, 1].map((i) => { const m = K.M.paint({ color: "#ffffff", map: leafClusterTex("maple", i ? ["#7a9a4e", "#6c8c46", "#88a656"] : ["#6e8e48", "#7f9c50", "#5f7e40"], "#b4c070", COL.leafLine, 151 + i), roughness: 0.9, specular: 0.2, envMapIntensity: 0.5, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial; m.alphaTest = 0.5; m.emissive.set("#1e2412"); return m; });
  {
    const B = new Batch(), r = rng(153);
    const along = (u: number) => V(TREE.x - 0.28 - 1.62 * u, 2.0 + 0.45 * u, TREE.z + 0.08 + 0.72 * u);
    for (let i = 0; i < 14; i++) {
      const u = 0.28 + 0.72 * (i / 13) + (r() - 0.5) * 0.05, p = along(u).add(V((r() - 0.5) * 0.2, -0.12 - 0.25 * r(), (r() - 0.5) * 0.3)), sz = 0.45 + 0.3 * r();
      for (const gq of crossCardsG(p, sz, r() * 3, 1.15)) B.add(leafMats[i % 2], gq);
    }
    // and a few clusters high round the fork (the wide view)
    for (let i = 0; i < 10; i++) { const a = r() * 6.28, p = V(TREE.x + Math.cos(a) * (0.6 + 0.8 * r()), 3.2 + 1.8 * r(), TREE.z + Math.sin(a) * (0.5 + 0.6 * r())); for (const gq of crossCardsG(p, 0.6 + 0.3 * r(), r() * 3)) B.add(leafMats[i % 2], gq); }
    B.flush(group, "grove.leaves", false, true);
    group.children.filter((c) => c.name === "grove.leaves").forEach((c) => c.layers.set(NOINK));
  }

  // ============================================================================================ THE GROVE'S OTHER TREES
  // the near ones are geometry (up to ~6 m back); everything further is PAINT on layered cards (below) so that no ink
  // line is drawn on a trunk deep in the mist
  {
    const B = new Batch();
    const trees: [number, number, number][] = [[-2.7, -3.9, 0.27], [2.3, -4.7, 0.3], [3.7, -2.6, 0.25], [-1.5, -5.6, 0.22], [-5.6, -3.4, 0.32], [5.8, -5.2, 0.3], [-3.6, 1.6, 0.3], [4.0, 2.2, 0.3]];
    const r = rng(161);
    for (const [dx, z, rad] of trees) {
      const x = X0 + dx, h = 9 + 3 * r();
      const prof: [number, number][] = [[rad * 1.7, -0.05], [rad * 1.25, 0.25], [rad * 1.05, 0.7], [rad, 2], [rad * 0.85, h * 0.6], [rad * 0.6, h]];
      const tg = lathe(prof, 18); { const uv = tg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.5, uv.getY(i) * h / 1.6); }
      B.add(r() < 0.5 ? barkM : barkM2, tg.translate(x, 0, z));
      const top = V(x, h, z);
      for (let k = 0; k < 3; k++) {
        const a = r() * 6.28, at = V(x, h * (0.5 + 0.12 * k), z), tip = at.clone().add(V(Math.cos(a) * 1.4, 1.3, Math.sin(a) * 1.4));
        B.add(barkM, bar(at, tip, rad * 0.35, rad * 0.18, 8));
        B.add(k % 2 ? crownMat : crownMatLo, blobG(170 + k + Math.round(z * 7), 1, 0.22).scale(1.6, 1.1, 1.4).translate(tip.x, tip.y + 0.4, tip.z));
      }
      B.add(crownMat, blobG(180 + Math.round(dx * 9), 1, 0.2).scale(2.0, 1.4, 1.8).translate(top.x, top.y + 0.6, top.z));
    }
    B.flush(group, "grove.trees");
  }
  // THE PAINTED ROWS: unlit NOINK cards, each a row of trunks under a canopy with undergrowth at their feet, paler and
  // mistier with depth, warmed toward the sun (frame left); their outlines are paint, pale
  const treeCard = (o: { z: number; x0: number; x1: number; y1: number; W: number; trunk: string; rim: string; shadow: string; canopy: string; under: string; mist: number; n: number; seed: number; w: [number, number]; haze: number }) => {
    const H = Math.round(o.W * (o.y1 + 0.2) / (o.x1 - o.x0));
    const tex = paint(o.W, H, (g) => {
      const r = rng(o.seed), s = o.W / (o.x1 - o.x0), px = (x: number) => (x - o.x0) * s, py = (y: number) => (o.y1 - y) * s;
      g.clearRect(0, 0, o.W, H);
      // soft canopy masses up top (they fade out with the card's top)
      for (let i = 0; i < 70; i++) blotch(g, o.W * r(), py(7 + (o.y1 - 7) * r()), s * (1.5 + 2 * r()), o.canopy, 0.5);
      // trunks: shadow side, body, the sun's rim on the left, a pale painted outline
      for (let i = 0; i < o.n; i++) {
        const xm = o.x0 + (o.x1 - o.x0) * ((i + 0.2 + 0.6 * r()) / o.n), w = (o.w[0] + (o.w[1] - o.w[0]) * r()) * s, lean = (r() - 0.5) * 0.6 * s, x = px(xm), top = py(o.y1 + 1), foot = py(0) + 4;
        const body = (k0: number, k1: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2 + w * k0 - w * 0.25, foot); g.lineTo(x - w / 2 + w * k1 + w * 0.25, foot); g.lineTo(x - w / 2 + w * k1 + lean, top); g.lineTo(x - w / 2 + w * k0 + lean, top); g.closePath(); g.fill(); };
        body(0, 1, o.trunk); body(0.55, 1, o.shadow); body(0, 0.22, o.rim);
        g.strokeStyle = css(o.shadow, 0.6); g.lineWidth = Math.max(1.5, s * 0.025);
        g.beginPath(); g.moveTo(x - w / 2 - w * 0.25, foot); g.lineTo(x - w / 2 + lean, top); g.moveTo(x + w / 2 + w * 0.25, foot); g.lineTo(x + w / 2 + lean, top); g.stroke();
        // a limb or two up into the canopy
      }
      // undergrowth along the ground
      for (let i = 0; i < 70; i++) { const x = o.W * r(), rad = s * (0.3 + 0.5 * r()); g.fillStyle = css(o.under, 0.95); g.beginPath(); g.ellipse(x, py(0.15), rad * 1.4, rad, 0, Math.PI, 0); g.fill(); g.fillRect(x - rad * 1.4, py(0.15), rad * 2.8, py(0) - py(0.15) + 6); }
      // the mist rising from the ground, then the sun's haze from the left (over what is painted only)
      g.globalCompositeOperation = "source-atop";
      const mg = g.createLinearGradient(0, py(0), 0, py(4.5)); mg.addColorStop(0, css(COL.mist, o.mist)); mg.addColorStop(1, css(COL.mist, o.mist * 0.15));
      g.fillStyle = mg; g.fillRect(0, 0, o.W, H);
      const hg = g.createLinearGradient(px(-10), 0, px(5), 0); hg.addColorStop(0, css("#ffd896", o.haze)); hg.addColorStop(0.5, css("#fde0b0", o.haze * 0.45)); hg.addColorStop(1, css("#fbe6c8", 0));
      g.fillStyle = hg; g.fillRect(0, 0, o.W, H);
      // the top and the two ends fade out (no edge anywhere)
      g.globalCompositeOperation = "destination-in";
      const tg = g.createLinearGradient(0, py(o.y1), 0, py(4.5)); tg.addColorStop(0, "rgba(0,0,0,0)"); tg.addColorStop(1, "rgba(0,0,0,1)");
      g.fillStyle = tg; g.fillRect(0, 0, o.W, H);
      const eg = g.createLinearGradient(0, 0, o.W, 0); eg.addColorStop(0, "rgba(0,0,0,0)"); eg.addColorStop(0.08, "rgba(0,0,0,1)"); eg.addColorStop(0.92, "rgba(0,0,0,1)"); eg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = eg; g.fillRect(0, 0, o.W, H);
      g.globalCompositeOperation = "source-over";
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.x1 - o.x0, o.y1 + 0.2).translate((o.x0 + o.x1) / 2 + X0, (o.y1 - 0.2) / 2, o.z), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
    m.layers.set(NOINK); m.renderOrder = -40 - Math.round(-o.z); m.name = "grove.row"; m.castShadow = m.receiveShadow = false;
    group.add(m);
  };
  treeCard({ z: -7.2, x0: -16, x1: 16, y1: 13, W: 4096, trunk: "#948f74", rim: "#f2d698", shadow: "#7c7e68", canopy: "#7f8e5e", under: "#6e7c52", mist: 0.3, n: 14, seed: 162, w: [0.4, 0.62], haze: 0.7 });
  treeCard({ z: -10.5, x0: -20, x1: 20, y1: 15, W: 3072, trunk: "#aca68c", rim: "#f4dcaa", shadow: "#9a9a82", canopy: "#9aa47c", under: "#8e9476", mist: 0.45, n: 16, seed: 163, w: [0.45, 0.65], haze: 0.72 });
  treeCard({ z: -15, x0: -26, x1: 26, y1: 18, W: 2048, trunk: "#c4bea4", rim: "#f6e2b8", shadow: "#b6b49c", canopy: "#b6ba9a", under: "#b2b298", mist: 0.55, n: 18, seed: 164, w: [0.5, 0.75], haze: 0.75 });

  // ============================================================================================ ferns and grass
  const fernMat = K.M.paint({ color: "#ffffff", map: fernTex(COL.fern, COL.fernHi, "#2e3a22"), roughness: 0.9, specular: 0.2, envMapIntensity: 0.5, side: THREE.DoubleSide }) as THREE.MeshPhysicalMaterial;
  fernMat.alphaTest = 0.5;
  const fronds: Frond[] = [];
  {
    const r = rng(171);
    const clumps: [number, number, number][] = [[-0.78, -1.05, 1], [0.72, -1.2, 1], [-1.55, -0.55, 0.9], [1.45, -1.95, 1.1], [-1.1, 0.55, 0.8], [1.25, 0.45, 0.85], [-2.3, -2.4, 1.1], [2.4, -0.4, 1]];
    for (const [cx, cz, k] of clumps) {
      const n = 8 + Math.floor(r() * 3), a0 = r() * 6.28;
      for (let i = 0; i < n; i++) fronds.push({ root: V(X0 + cx + (r() - 0.5) * 0.08, 0, cz + (r() - 0.5) * 0.08), dir: a0 + (i / n) * 6.28 + (r() - 0.5) * 0.4, out: (0.42 + 0.22 * r()) * k, up: (0.32 + 0.12 * r()) * k, droop: 0.05 + 0.08 * r(), w: 0.17 * k, ph: r() * 6.28, tilt: 0.3 });
    }
  }
  const fernField = frondField(fernMat, fronds, "grove.ferns");
  group.add(fernField.mesh);
  const strands: Strand[] = [];
  {
    const r = rng(181);
    const clear = (x: number, z: number) => Math.hypot(x - X0, z + 0.5) > 0.55 && Math.hypot(x - X0 - 0.15, z + 0.35) > 0.5 && Math.hypot(x - TREE.x, z - TREE.z) > 0.55;
    for (let i = 0; i < 420; i++) {
      const x = X0 - 2.6 + 5.2 * r(), z = -3.4 + 6 * r();
      if (!clear(x, z)) continue;
      const h = 0.1 + 0.12 * r(), ph = r() * 6.28;
      for (let b = 0; b < 5; b++) { const la = r() * 6.28, root = V(x + 0.05 * (r() - 0.5), 0, z + 0.05 * (r() - 0.5)); strands.push({ root, tip: root.clone().add(V(Math.cos(la) * 0.05, h * (0.6 + 0.4 * r()), Math.sin(la) * 0.05)), w: 0.022, c0: COL.tuft0, c1: COL.tuft1, ph, amp: 0.03, seg: 2, face: r() * 3 }); }
    }
  }
  const tufts = strandField(Mk, strands, "grove.tufts");
  (tufts.mesh.material as THREE.MeshPhysicalMaterial).emissive.set("#3c3e22");
  group.add(tufts.mesh);

  // ============================================================================================ HIS POEMS
  const paperM = [0, 1, 2].map((i) => { const m = K.M.paint({ color: "#ffffff", map: paperTex(191 + i), roughness: 0.8, specular: 0.2, envMapIntensity: 0.9 }) as THREE.MeshPhysicalMaterial; m.emissive.set("#4a4234"); return m; });
  {
    const P = new Part(K), r = rng(195);
    const balls: [number, number, number][] = [[-0.42, -0.28, 0.062], [0.38, -0.68, 0.058], [-0.27, -0.02, 0.055], [0.56, -0.12, 0.065], [-0.6, -0.8, 0.058], [0.24, 0.14, 0.06], [0.72, -0.9, 0.052], [-0.06, 0.32, 0.058], [0.98, 0.22, 0.062], [-0.88, -0.2, 0.058], [0.47, 0.5, 0.055], [-0.3, -0.66, 0.06], [-0.48, -0.5, 0.05], [0.33, -0.86, 0.05]];
    balls.forEach(([x, z, rad], i) => {
      const g = paperBallG(200 + i, rad).rotateY(r() * 6.28).rotateX((r() - 0.5) * 0.6).translate(X0 + x, rad * 0.8, z);
      P.add(paperM[i % 3], g, 0.003);
    });
    P.into(group, "grove.poems");
  }
  // the loose pages: each its own group (param pages lifts them)
  type Page = { g: THREE.Group; y0: number; lift: number; ph: number; rx: number; rz: number };
  const pages: Page[] = [];
  {
    const r = rng(205);
    const list: [number, number, number, number, number][] = [[-0.36, 0.2, 0.6, 0.03, 0.01], [0.62, -0.38, -0.9, 0.04, -0.008], [-0.72, 0.24, 2.2, 0.025, 0.012], [0.28, -0.98, 1.4, 0.035, 0.01]];
    list.forEach(([x, z, yaw, curl, cup], i) => {
      const pg = new THREE.Group(); pg.name = `grove.page${i}`;
      const P = new Part(K);
      P.add(K.flat("#ffffff", { map: pageTex(210 + i), rough: 0.85 }), pageG(0.15, 0.21, curl, cup), 0.003);
      P.into(pg, `grove.page${i}.paper`);
      pg.position.set(X0 + x, 0.0, z); pg.rotation.y = yaw;
      group.add(pg);
      pages.push({ g: pg, y0: 0, lift: 0.18 + 0.2 * r(), ph: r() * 6.28, rx: (r() - 0.5) * 0.9, rz: (r() - 0.5) * 0.9 });
    });
  }

  // ============================================================================================ mist, shafts, far view, sky
  const mists = [
    mistCard({ x0: X0 - 5, x1: X0 + 5, y0: -0.05, y1: 1.5, z: -2.5, col: COL.mist, sun: COL.sun, warm: 0.7, a: 0.28, seed: 11 }),
    mistCard({ x0: X0 - 8, x1: X0 + 7, y0: -0.05, y1: 2.6, z: -4.3, col: COL.mist, sun: COL.sun, warm: 0.75, a: 0.36, seed: 12 }),
    mistCard({ x0: X0 - 10, x1: X0 + 10, y0: -0.05, y1: 3.8, z: -6.6, col: COL.mist, sun: COL.sun, warm: 0.75, a: 0.4, seed: 13 }),
    mistCard({ x0: X0 - 14, x1: X0 + 12, y0: -0.05, y1: 5.5, z: -9.8, col: COL.mist, sun: COL.sun, warm: 0.65, a: 0.5, seed: 14 }),
    mistCard({ x0: X0 - 18, x1: X0 + 16, y0: -0.05, y1: 8, z: -14.2, col: COL.mist, sun: COL.sun, warm: 0.7, a: 0.6, seed: 15 }),
  ];
  for (const m of mists) group.add(m.mesh);
  const toSun = new THREE.Vector3(...SUN);
  const shafts = ([[-1.0, -2.7, 0.9, 1.5, 0.16], [-2.2, -4.6, 1.2, 2.0, 0.2], [0.9, -3.8, 0.8, 1.4, 0.14], [-3.6, -6.4, 1.5, 2.4, 0.18], [2.4, -6.2, 1.1, 1.8, 0.12]] as [number, number, number, number, number][])
    .map(([x, z, w, w2, a], i) => { const foot = V(X0 + x, 0, z); return lightShaft(foot.clone().addScaledVector(toSun, 9), foot, w, w2, "#ffe4b4", a, i * 1.7); });
  for (const s of shafts) group.add(s.mesh);
  {
    const ring = panoramaRing(X0, -2, 32, -1, 34, 4096, 1024, 1.5, (g, k) => {
      g.clearRect(0, 0, k.W, k.H);
      const r = rng(221), foot = k.row(0);
      // the far grove: pale trunks (fainter toward the sun), a soft canopy band high up
      for (const [col, n, a] of [["#cfc6b0", 70, 0.55], ["#bdb69e", 50, 0.7]] as [string, number, number][]) {
        for (let i = 0; i < n; i++) {
          const az = 360 * r(), x = k.col(az), d = Math.min(Math.abs(az - (SUN_AZ + 360)), Math.abs(az - SUN_AZ)), sunK = Math.max(0, 1 - d / 70);
          const w = 6 + 10 * r(), top = k.row(30);
          g.fillStyle = css(col, a * (1 - 0.75 * sunK)); g.fillRect(x - w / 2, top, w, foot - top + 4);
        }
      }
      // canopy masses up top
      for (let i = 0; i < 160; i++) { const x = k.W * r(), y = k.row(18 + 14 * r()); blotch(g, x, y, 60 + 80 * r(), r() < 0.5 ? "#a8b090" : "#98a284", 0.35); }
      // a low undergrowth band, misty
      const ug = g.createLinearGradient(0, k.row(3), 0, foot + 6); ug.addColorStop(0, "rgba(160,166,128,0)"); ug.addColorStop(1, "rgba(150,156,116,0.55)"); g.fillStyle = ug; g.fillRect(0, k.row(3), k.W, foot + 6 - k.row(3));
      // the sun's haze over it all (warm, round the sun's bearing)
      blotch(g, k.col(SUN_AZ), k.row(SUN_EL), k.W * 0.16, "#ffe6bc", 0.8); blotch(g, k.col(SUN_AZ), k.row(SUN_EL), k.W * 0.07, "#fff2d8", 0.9);
      // and a general mist veil near the ground
      const mg = g.createLinearGradient(0, k.row(10), 0, foot); mg.addColorStop(0, "rgba(243,232,214,0)"); mg.addColorStop(1, "rgba(243,232,214,0.75)"); g.fillStyle = mg; g.fillRect(0, k.row(10), k.W, foot - k.row(10) + 2);
    });
    ring.name = "grove.far"; (ring.material as THREE.MeshBasicMaterial).transparent = true; group.add(ring);
    const mu = 0.75 - SUN_AZ / 360;
    group.add(skyDome(new THREE.Vector3(X0, 0, -2), SKY, (g, W, H) => {
      const elY = (el: number) => (H * (90 - el)) / 180, sx = W * (mu % 1);
      for (const dx of [-W, 0, W]) { blotch(g, sx + dx, elY(SUN_EL), 520, "#ffe2b0", 0.7); blotch(g, sx + dx, elY(SUN_EL), 200, "#fff0d0", 0.9); blotch(g, sx + dx, elY(SUN_EL), 60, "#fffaf0", 1); }
    }));
  }
  void NOINK;

  // ============================================================================================ the light
  lightRig(group, { dir: SUN, k: 4.4, col: "#ffc98c", at: [X0, 0, -2.2], half: 9, hemi: ["#d8dcd6", "#6a6444", 0.95] });

  let clock = 0, pagesK = 0;
  const posePages = (t: number) => {
    for (const p of pages) {
      const k = pagesK, f = 0.6 + 0.4 * Math.sin(t * 2.3 + p.ph);
      p.g.position.y = p.y0 + k * p.lift * f;
      p.g.rotation.x = k * p.rx * (0.7 + 0.3 * Math.sin(t * 3.1 + p.ph));
      p.g.rotation.z = k * p.rz * (0.7 + 0.3 * Math.cos(t * 2.7 + p.ph));
    }
  };
  const pose = (t: number) => {
    for (const m of mists) m.drift(t);
    for (const s of shafts) s.breathe(t);
    fernField.update(t, 0.015); tufts.update(t, 1);
    posePages(t);
  };
  pose(0);
  return {
    group,
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "pages") { pagesK = Math.max(0, Math.min(1, Number(v))); posePages(clock); }
    },
  };
};

export const GROVE: PlaceDef = { look: GROVE_LOOK, params: GROVE_PARAMS, build: buildGrove };

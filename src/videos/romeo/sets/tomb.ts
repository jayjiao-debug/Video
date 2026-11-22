// THE TOMB (place "tomb", island x = ISLAND.tomb): scenes 8 and 9, the Capulet vault before dawn: the film's quiet,
// emotional scene. Beautiful but restrained.
//
// WHAT THERE IS (her lens looks -z at the bier; local x, z round the island)
//   - A LOW VAULTED CRYPT 4.8 m wide (walls x +-2.4) and 6 m deep (z -3..3): ashlar walls, a segmental stone barrel
//     vault (spring y 1.75, crown y 2.85) on four transverse ribs and their pilasters, arched NICHES in both side walls
//     (a stone urn, a bunch of dried flowers);
//   - THE BACK WALL (z -3): the CAPULET ARMS above her head end (a plain heraldic shield: a dull dark red field, a muted
//     gold chevron and three roundels; NO cross anywhere), the left TORCH in its iron bracket, and the arched mouth of
//     THE STAIR: seven worn steps up into the dark to a plank door whose edges glow with the pale before-dawn light;
//   - THE BIER at the centre: a plain stone slab (top y 0.62, x -1..1, z -1.6..-0.8) on a plinth, a pale linen cloth
//     over it hanging down both long sides; Juliet lies on it, Romeo kneels at its front side;
//   - the right TORCH on the right wall near the front (off the main frames: the warm key on the bier's front); DUST motes drifting slowly through the torchlight;
//   - THE FLOOR: big worn flagstones, quiet (soft mottle, thin soft joints, a few hairline cracks, dust toward the
//     walls), painted at ~850 px/m so that scene 9's floor camera (lying at "shardFloor") holds up close.
// LIGHT (the room's shell casts no shadow: the key would be shut out by the vault): the left torch is the place's point light (gentle flicker), the right torch is the warm key from the right,
// a dim violet fill keeps the shadows deep but never black; the door's cold glow is paint and a soft additive card.
// INK / FLICKER: joints, cracks, block faces are PAINT; inked geometry is chunky (walls, vault, ribs 12 cm proud,
// pilasters, steps, bier); the shield, the torches and brackets, the urn and the flowers are props-kit Parts (NOINK
// + hull); flames, glows and dust are NOINK. animate(t) is the flicker and the dust only.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { BAKED_LIGHT, type PlaceDef } from "../../../kit/day/sets";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig, paint, rng, css, blotch, Batch, makeFlame, glowCard } from "../../../kit/sets/okit";
import { ISLAND } from "../places";
import { maker, lathe, bar, shade, wrapBlotch, glowSprite, dustMotes, shieldPath, tileUV, Part, NOINK, shadeHex } from "./parts/a_util";

const X0 = ISLAND.tomb;
const RW = 2.4, ZB = -3.0, ZF = 3.0, SPRING = 1.75, CROWN = 2.85;
const VC = (CROWN * CROWN - SPRING * SPRING - RW * RW) / (2 * (CROWN - SPRING)), VR = CROWN - VC, VA = Math.asin(RW / VR);
/** the vault's height over x */
const vaultY = (x: number) => VC + Math.sqrt(Math.max(0, VR * VR - x * x));
const BIER = { x0: -1.0, x1: 1.0, z0: -1.6, z1: -0.8, top: 0.62 };
const STAIR = { x0: 0.55, x1: 1.65, spring: 1.5, n: 7, rise: 0.18, run: 0.3 };
const STAIR_CX = (STAIR.x0 + STAIR.x1) / 2, STAIR_R = (STAIR.x1 - STAIR.x0) / 2;
const TORCH_L = new THREE.Vector3(X0 - 1.95, 1.35, ZB + 0.02), TORCH_R = new THREE.Vector3(X0 + RW - 0.02, 1.25, 0.55);

const COL = {
  wall: "#6a6462", wallLo: "#5a5452", joint: "#3e3a3c", vault: "#5e5856", floor: "#8c847e", floorLo: "#78716c", grout: "#5c5654",
  bier: "#a0968a", bierLo: "#8a8076", cloth: "#e6dfd0", clothLo: "#cfc6b4", iron: "#3a3438", ironHi: "#5a5258", wood: "#5e4636", rag: "#4a3a30",
  red: "#6e2a2c", gold: "#b8964a", shieldRim: "#8a8078", door: "#4e3e34", dawn: "#c8d0dc", urn: "#8a7e70", dried: "#b8a07a", driedHead: "#d8c8a8",
};
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.16, 0.13, 0.13]], [-10, [0.2, 0.17, 0.17]], [10, [0.24, 0.21, 0.24]], [60, [0.2, 0.18, 0.22]], [90, [0.18, 0.16, 0.2]]],
  boxes: [{ az: 160, el: 35, rot: 0, w: 30, h: 16, soft: 14, col: [0.7, 0.6, 0.52] }],
};
export const TOMB_LOOK: PlaceLook = {
  bg: "#16121a",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.8, color: "#140e14" },
  cast: {
    key: [0.62, 0.52, 0.58], tint: [1.0, 0.82, 0.64], tintK: 0.72, gain: 0.86, grad: 0.24, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
    shade: [1.05, 0.92, 1.42], shadeK: 0.46, wrap: [30, 62], edge: 0.14, broad: 0.32, bodySat: 0.12, sheen: 0.28, lift: 0.02, contactLen: 0.15,
    ...BAKED_LIGHT,
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.6,
};
export const TOMB_PARAMS: Record<string, ParamValue> = {};

// ---------------------------------------------------------------------------------------------------- paintings
/** ashlar (u along the wall, v up; a tile of `size` m): courses of blocks, each its own tone, soft joints */
const ashlarTex = (seed: number, base: string, bw: number, bh: number, px = 1024) => paint(px, px, (g, W, H) => {
  const r = rng(seed), rows = Math.round(1 / bh), ch = H / rows;
  g.fillStyle = COL.joint; g.fillRect(0, 0, W, H);
  for (let j = 0; j < rows; j++) {
    let x = -W * ((j * 0.37) % 1) * bw;
    while (x < W) {
      const w = W * bw * (0.75 + 0.5 * r()), jt = Math.max(3, W * 0.005);
      g.fillStyle = shade(base, (r() - 0.5) * 0.16);
      const draw = (ox: number) => { g.fillRect(x + ox + jt / 2, j * ch + jt / 2, w - jt, ch - jt); };
      draw(0); if (x + w > W) draw(-W);
      for (let k = 0; k < 3; k++) { const bx = x + w * r(), by = j * ch + ch * r(); blotch(g, bx, by, ch * (0.3 + 0.4 * r()), r() < 0.5 ? shadeHex(base, 0.12) : shadeHex(base, -0.14), 0.25); }
      g.fillStyle = "rgba(255,240,220,0.06)"; g.fillRect(x + jt / 2, j * ch + jt / 2, w - jt, ch * 0.1);
      x += w;
    }
  }
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), W * (0.05 + 0.08 * r()), r() < 0.5 ? "#2a2224" : "#a89888", 0.08);
}, true);
/** THE FLOOR: irregular big flags over a 2.4 m tile, quiet tones, soft thin joints, hairline cracks, fine grain */
const floorTex = () => paint(2048, 2048, (g, W, H) => {
  const r = rng(801), s = W / 2.4;
  g.fillStyle = COL.grout; g.fillRect(0, 0, W, H);
  // rows of flags of varying length (0.5..0.9 m) and two row heights, wrapping in u
  const rowsH = [0.62, 0.58, 0.6, 0.6], jt = s * 0.012;
  let y = 0;
  for (const rh of rowsH) {
    const hh = rh * s; let x = -s * 0.3 * r();
    while (x < W) {
      const w = s * (0.5 + 0.4 * r());
      const flag = (ox: number) => {
        const x0 = x + ox + jt / 2, y0 = y + jt / 2, fw = w - jt, fh = hh - jt;
        g.fillStyle = shade(COL.floor, (r() - 0.5) * 0.1); g.fillRect(x0, y0, fw, fh);
        g.save(); g.beginPath(); g.rect(x0, y0, fw, fh); g.clip();
        for (let k = 0; k < 6; k++) blotch(g, x0 + fw * r(), y0 + fh * r(), fh * (0.25 + 0.4 * r()), r() < 0.5 ? shadeHex(COL.floor, 0.1) : COL.floorLo, 0.22);
        // worn, slightly lighter centre; darker rim
        const gr = g.createRadialGradient(x0 + fw / 2, y0 + fh / 2, fh * 0.1, x0 + fw / 2, y0 + fh / 2, fw * 0.7); gr.addColorStop(0, "rgba(255,245,230,0.05)"); gr.addColorStop(1, "rgba(30,24,26,0.12)"); g.fillStyle = gr; g.fillRect(x0, y0, fw, fh);
        // a hairline crack now and then
        if (r() < 0.35) { g.strokeStyle = "rgba(44,36,38,0.45)"; g.lineWidth = 1.6; g.beginPath(); let cx = x0 + fw * r(), cy = y0; g.moveTo(cx, cy); for (let q = 0; q < 6; q++) { cx += (r() - 0.5) * fw * 0.2; cy += fh / 6; g.lineTo(cx, cy); } g.stroke(); }
        g.restore();
      };
      flag(0); if (x + w > W) flag(-W);
      x += w;
    }
    y += hh;
  }
  // fine grain over everything (tiny specks), soft
  for (let i = 0; i < 40000; i++) { const v = r() < 0.5 ? "rgba(240,228,214,0.07)" : "rgba(30,24,28,0.09)"; g.fillStyle = v; g.fillRect(W * r(), H * r(), 2, 2); }
}, true);
/** the pale linen (u across, v along): soft tone, faint weave stripes, folds */
const clothTex = () => paint(512, 256, (g, W, H) => {
  const r = rng(811);
  g.fillStyle = COL.cloth; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) blotch(g, W * r(), H * r(), 40 + 50 * r(), r() < 0.5 ? "#f4eee2" : COL.clothLo, 0.3);
  // soft fold shading running across (the cloth's hang)
  for (let i = 0; i < 9; i++) { const x = W * ((i + 0.5 + (r() - 0.5) * 0.4) / 9), gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.45, "rgba(255,252,244,0.25)"); gr.addColorStop(0.6, "rgba(150,140,120,0.16)"); gr.addColorStop(1, "rgba(150,140,120,0)"); g.fillStyle = gr; g.fillRect(x - 22, 0, 44, H); }
  // a woven border band along both long edges
  g.fillStyle = "rgba(170,150,110,0.55)"; g.fillRect(0, H * 0.04, W, H * 0.025); g.fillRect(0, H * 0.93, W, H * 0.025);
});

// ---------------------------------------------------------------------------------------------------- the place
const buildTomb = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "tomb";
  const Mk = maker(K, group);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(X0 + x, y, z);
  const wallM = Mk.tex(ashlarTex(821, COL.wall, 0.26, 0.14), 0.92), vaultM = Mk.tex(ashlarTex(823, COL.vault, 0.2, 0.1), 0.92);
  const ribM = Mk.tex(ashlarTex(825, shade(COL.wall, 0.06), 0.5, 0.5, 512), 0.9), stepM = Mk.tex(ashlarTex(827, "#786e66", 0.6, 0.5, 512), 0.9);

  // ============================================================================================ floor
  {
    const ft = floorTex();
    const geo = new THREE.PlaneGeometry(RW * 2 + 0.4, ZF - ZB + 0.4).rotateX(-Math.PI / 2).translate(X0, 0, (ZB + ZF) / 2);
    const p = geo.attributes.position as THREE.BufferAttribute, uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - X0) / 2.4, -p.getZ(i) / 2.4);
    Mk.mesh("tomb.floor", geo, Mk.tex(ft, 0.93), { cast: false });
  }
  // ============================================================================================ walls (with the niches and the stair mouth)
  const walls: { mesh: THREE.Object3D; side: "L" | "R" | "F" }[] = [];
  {
    const T = 0.45, NICHES = [-1.95, 0.15];
    const sideWall = (sgn: number) => {
      // the outline in (z, y): floor to the vault's spring + a little, with arched niche holes
      const sh = new THREE.Shape([new THREE.Vector2(ZB - 0.2, 0), new THREE.Vector2(ZF + 0.2, 0), new THREE.Vector2(ZF + 0.2, SPRING + 0.25), new THREE.Vector2(ZB - 0.2, SPRING + 0.25)]);
      for (const nz of NICHES) { const h = new THREE.Path(); h.moveTo(nz - 0.36, 0.62); h.lineTo(nz + 0.36, 0.62); h.lineTo(nz + 0.36, 1.18); h.absarc(nz, 1.18, 0.36, 0, Math.PI, false); h.lineTo(nz - 0.36, 0.62); sh.holes.push(h); }
      const g = new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: false, curveSegments: 16 });
      // shape (z, y), extrusion along +z -> world: x = sgn * (RW + extrusion), y, z = shape x
      const p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) { const sz = p.getX(i), sy = p.getY(i), e = p.getZ(i); p.setXYZ(i, X0 + sgn * (RW + e), sy, sz); }
      if (sgn > 0) { const idx = g.index; if (idx) { for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i + 1); idx.setX(i + 1, idx.getX(i + 2)); idx.setX(i + 2, a); } } else { for (let i = 0; i < p.count; i += 3) { const ax = p.getX(i + 1), ay = p.getY(i + 1), az = p.getZ(i + 1); p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2)); p.setXYZ(i + 2, ax, ay, az); } } }
      g.computeVertexNormals();
      const m = Mk.mesh(`tomb.wall${sgn < 0 ? "L" : "R"}`, tileUV(g, 1.8), wallM, { cast: false });
      walls.push({ mesh: m, side: sgn < 0 ? "L" : "R" });
      // the niches' backs and floors
      for (const nz of NICHES) {
        Mk.mesh("tomb.niche.back", new THREE.BoxGeometry(0.1, 1.0, 0.85).translate(X0 + sgn * (RW + T - 0.12), 1.08, nz), wallM, { cast: false });
      }
    };
    sideWall(-1); sideWall(1);
    // the back wall: the lunette under the vault with the stair's arched mouth
    const pts: THREE.Vector2[] = [new THREE.Vector2(-RW - 0.2, 0), new THREE.Vector2(RW + 0.2, 0), new THREE.Vector2(RW + 0.2, SPRING + 0.25)];
    for (let i = 0; i <= 24; i++) { const x = RW - (2 * RW * i) / 24; pts.push(new THREE.Vector2(x, vaultY(x) + 0.12)); }
    pts.push(new THREE.Vector2(-RW - 0.2, SPRING + 0.25));
    const bsh = new THREE.Shape(pts), mouth = new THREE.Path();
    mouth.moveTo(STAIR.x0, 0); mouth.lineTo(STAIR.x1, 0); mouth.lineTo(STAIR.x1, STAIR.spring); mouth.absarc(STAIR_CX, STAIR.spring, STAIR_R, 0, Math.PI, false); mouth.lineTo(STAIR.x0, 0);
    bsh.holes.push(mouth);
    const bg = new THREE.ExtrudeGeometry(bsh, { depth: 0.45, bevelEnabled: false, curveSegments: 16 }).translate(X0, 0, ZB - 0.45);
    Mk.mesh("tomb.wallB", tileUV(bg, 1.8), wallM, { cast: false });
    // the front wall (behind her lens: view() hides it when she stands beyond it)
    const fg = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map((v) => new THREE.Vector2(v.x, v.y))), { depth: 0.45, bevelEnabled: false }).translate(X0, 0, ZF);
    walls.push({ mesh: Mk.mesh("tomb.wallF", tileUV(fg, 1.8), wallM, { cast: false }), side: "F" });
  }
  // ============================================================================================ the vault and its ribs
  {
    const N = 40, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const a = -VA + (2 * VA * i) / N, x = VR * Math.sin(a), y = VC + VR * Math.cos(a), arc = VR * (a + VA);
      for (const z of [ZB - 0.1, ZF + 0.1]) { pos.push(X0 + x, y, z); uv.push(arc / 1.8, z / 1.8); }
      if (i < N) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    // the normals must face down into the room
    const n = g.attributes.normal as THREE.BufferAttribute; if (n.getY(N) > 0) { g.setIndex(idx.map((_, k) => idx[k - (k % 3) + [0, 2, 1][k % 3]])); g.computeVertexNormals(); }
    Mk.mesh("tomb.vault", g, vaultM, { cast: false });
    // ribs (12 cm deep, 26 cm wide) and their pilasters
    const B = new Batch();
    for (const rz of [ZB + 0.13, -1.0, 1.0, ZF - 0.13]) {
      const loop: THREE.Vector2[] = [];
      const ring = new THREE.Shape();
      for (let i = 0; i <= 32; i++) { const a = -VA + (2 * VA * i) / 32; loop.push(new THREE.Vector2(VR * Math.sin(a), VC + VR * Math.cos(a))); }
      ring.moveTo(loop[0].x, loop[0].y); for (const v of loop) ring.lineTo(v.x, v.y);
      for (let i = 32; i >= 0; i--) { const a = -VA + (2 * VA * i) / 32; ring.lineTo((VR - 0.13) * Math.sin(a), VC + (VR - 0.13) * Math.cos(a)); }
      B.add(ribM, tileUV(new THREE.ExtrudeGeometry(ring, { depth: 0.26, bevelEnabled: false, curveSegments: 4 }).translate(X0, 0, rz - 0.13), 0.6));
      for (const sgn of [-1, 1]) B.add(ribM, tileUV(new THREE.BoxGeometry(0.14, SPRING + 0.02, 0.32).translate(X0 + sgn * (RW - 0.06), (SPRING + 0.02) / 2, rz), 0.6));
    }
    B.flush(group, "tomb.ribs", false, true);
  }
  // ============================================================================================ the stair up to the door
  {
    const B = new Batch(), z0 = ZB - 0.45;
    for (let k = 0; k < STAIR.n; k++) B.add(stepM, tileUV(new THREE.BoxGeometry(STAIR.x1 - STAIR.x0, STAIR.rise * (k + 1), STAIR.run + 0.01).translate(X0 + STAIR_CX, (STAIR.rise * (k + 1)) / 2, z0 - STAIR.run * (k + 0.5)), 0.6));
    const zEnd = z0 - STAIR.run * STAIR.n, land = STAIR.rise * STAIR.n;
    B.add(stepM, tileUV(new THREE.BoxGeometry(STAIR.x1 - STAIR.x0, land, 0.6).translate(X0 + STAIR_CX, land / 2, zEnd - 0.3), 0.6));
    // the tunnel's side walls and its sloping ceiling
    const len = z0 - (zEnd - 0.6);
    for (const sx of [STAIR.x0 - 0.15, STAIR.x1 + 0.15]) B.add(wallM, tileUV(new THREE.BoxGeometry(0.3, 3.6, len).translate(X0 + sx, 1.8, (z0 + zEnd - 0.6) / 2), 1.8));
    const ceil = new THREE.BoxGeometry(STAIR.x1 - STAIR.x0 + 0.6, 0.25, len + 0.4).rotateX(-Math.atan2(land, len)).translate(X0 + STAIR_CX, STAIR.spring + STAIR_R + 0.12 + land / 2, (z0 + zEnd - 0.6) / 2);
    B.add(wallM, tileUV(ceil, 1.8));
    B.add(wallM, tileUV(new THREE.BoxGeometry(STAIR.x1 - STAIR.x0 + 0.6, 3.6, 0.3).translate(X0 + STAIR_CX, 1.8, zEnd - 0.75), 1.8));
    B.flush(group, "tomb.stair", false, true);
    // the plank door at the top, its edges glowing with the cold dawn (paint + an additive card)
    const doorTex = paint(256, 512, (g, W, H) => {
      g.fillStyle = COL.dawn; g.fillRect(0, 0, W, H);
      const inset = 10; g.fillStyle = COL.door; g.beginPath(); g.moveTo(inset, H); g.lineTo(inset, H * 0.3); g.quadraticCurveTo(W / 2, -H * 0.02, W - inset, H * 0.3); g.lineTo(W - inset, H); g.closePath(); g.fill();
      g.fillStyle = "rgba(30,22,20,0.6)"; for (let i = 1; i < 5; i++) g.fillRect((W * i) / 5 - 2, H * 0.12, 4, H);
      g.fillStyle = "#2e2828"; g.fillRect(inset, H * 0.42, W - 2 * inset, 12); g.fillRect(inset, H * 0.8, W - 2 * inset, 12);
    });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(STAIR.x1 - STAIR.x0 - 0.1, 1.75).translate(X0 + STAIR_CX, land + 0.875, zEnd - 0.59), new THREE.MeshBasicMaterial({ map: doorTex, fog: false }));
    door.layers.set(NOINK); door.name = "tomb.door"; group.add(door);
    const dg = glowSprite(1.0, "#9aa8c0", 0.18); dg.position.set(X0 + STAIR_CX, land + 0.9, zEnd - 0.4); dg.name = "tomb.door.glow"; group.add(dg);
  }
  // ============================================================================================ THE BIER and its cloth
  {
    const B = new Batch(), bm = Mk.tex(ashlarTex(831, COL.bier, 1, 1, 512), 0.88), blo = Mk.tex(ashlarTex(833, COL.bierLo, 1, 1, 512), 0.9);
    const cx = (BIER.x0 + BIER.x1) / 2, cz = (BIER.z0 + BIER.z1) / 2, L = BIER.x1 - BIER.x0, D = BIER.z1 - BIER.z0;
    B.add(blo, tileUV(new THREE.BoxGeometry(L + 0.12, 0.1, D + 0.12).translate(X0 + cx, 0.05, cz), 0.8));
    B.add(bm, tileUV(new THREE.BoxGeometry(L - 0.16, 0.42, D - 0.16).translate(X0 + cx, 0.1 + 0.21, cz), 0.8));
    B.add(blo, tileUV(new THREE.BoxGeometry(L - 0.06, 0.06, D - 0.06).translate(X0 + cx, 0.52 + 0.01, cz), 0.8));
    B.add(bm, tileUV(new THREE.BoxGeometry(L, 0.08, D).translate(X0 + cx, BIER.top - 0.04, cz), 0.8));
    B.flush(group, "tomb.bier");
    // the cloth: a sheet over the top, hanging down both long sides with soft folds, a little over the ends
    const nx = 48, nz = 26, CL = L + 0.08, hang = 0.24, half = D / 2 + 0.005, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const span = 2 * (half + hang);
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / nz, x = -CL / 2 + CL * u, s = -span / 2 + span * v, a = Math.abs(s);
      let y = BIER.top + 0.006, z = s;
      if (a > half) { const d = a - half; z = Math.sign(s) * (half + 0.012 + 0.02 * Math.sin(d * 9)); y = BIER.top + 0.006 - d; const fold = (0.022 * Math.sin(x * 7.3 + (s > 0 ? 0 : 1.3)) + 0.012 * Math.sin(x * 17 + 0.7)) * Math.min(1, d / hang); y += 0.03 * Math.sin(x * 3.1 + (s > 0 ? 0.4 : 2.0)) * Math.min(1, d / hang); z += Math.sign(s) * (fold + 0.015); }
      else { const e = Math.max(0, Math.abs(x) - (CL / 2 - 0.05)); y -= e * 0.4; }
      pos.push(X0 + cx + x, y, cz + z); uv.push(u, v);
      if (i < nx && j < nz) { const b = j * (nx + 1) + i; idx.push(b, b + nx + 1, b + 1, b + 1, b + nx + 1, b + nx + 2); }
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); cg.setIndex(idx); cg.computeVertexNormals();
    if ((cg.attributes.normal as THREE.BufferAttribute).getY(Math.round((nz / 2) * (nx + 1) + nx / 2)) < 0) { cg.setIndex(idx.map((_, k) => idx[k - (k % 3) + [0, 2, 1][k % 3]])); cg.computeVertexNormals(); }
    const cm = K.M.paint({ color: "#ffffff", map: clothTex(), roughness: 0.85, specular: 0.15, envMapIntensity: 0.5, side: THREE.DoubleSide });
    Mk.mesh("tomb.cloth", cg, cm, { cast: false });
  }
  // ============================================================================================ THE CAPULET ARMS (a plain shield, no cross)
  {
    const face = paint(256, 320, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      shieldPath(g, W / 2, 8, W - 16, H - 16); g.fillStyle = COL.red; g.fill();
      g.save(); shieldPath(g, W / 2, 8, W - 16, H - 16); g.clip();
      for (let i = 0; i < 10; i++) blotch(g, W * ((i * 0.37) % 1), H * ((i * 0.61) % 1), 40, i % 2 ? "#7e3234" : "#5e2426", 0.3);
      // the chevron (an inverted V), muted gold, and three gold roundels
      g.fillStyle = COL.gold; g.beginPath(); g.moveTo(8, H * 0.78); g.lineTo(W / 2, H * 0.36); g.lineTo(W - 8, H * 0.78); g.lineTo(W - 8, H * 0.94); g.lineTo(W / 2, H * 0.52); g.lineTo(8, H * 0.94); g.closePath(); g.fill();
      for (const [x, y] of [[W * 0.27, H * 0.24], [W * 0.73, H * 0.24], [W * 0.5, H * 0.8]]) { g.beginPath(); g.arc(x, y, W * 0.07, 0, 7); g.fill(); g.strokeStyle = "rgba(60,40,20,0.6)"; g.lineWidth = 3; g.stroke(); }
      g.restore();
      shieldPath(g, W / 2, 8, W - 16, H - 16); g.strokeStyle = COL.shieldRim; g.lineWidth = 12; g.stroke();
      g.strokeStyle = "#2a2226"; g.lineWidth = 3; g.stroke();
    });
    const P = new Part(K), w = 0.5, h = 0.62;
    // the shield's outline as a shape, a thin slab, face painted (uv from x, y)
    const sh = new THREE.Shape(); const N = 24;
    sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, -h * 0.45);
    for (let i = 1; i <= N; i++) { const t = i / N; const x = (1 - t) * (1 - t) * (w / 2) + 2 * (1 - t) * t * (w / 2) + t * t * 0, y = (1 - t) * (1 - t) * (-h * 0.45) + 2 * (1 - t) * t * (-h * 0.85) + t * t * (-h); sh.lineTo(x, y); }
    for (let i = 1; i <= N; i++) { const t = i / N; const x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * (-w / 2) + t * t * (-w / 2), y = (1 - t) * (1 - t) * (-h) + 2 * (1 - t) * t * (-h * 0.85) + t * t * (-h * 0.45); sh.lineTo(x, y); }
    sh.lineTo(-w / 2, 0);
    const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false, curveSegments: 4 });
    const p = sg.attributes.position as THREE.BufferAttribute, u = sg.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < u.count; i++) u.setXY(i, (p.getX(i) + w / 2) / w * (240 / 256) + 8 / 256, 1 - (-(p.getY(i)) / h * (304 / 320) + 8 / 320));
    const faceM = K.flat("#ffffff", { map: face, rough: 0.7 });
    P.add(faceM, sg.translate(X0 - 1.0, 2.2, ZB + 0.005), 0.006);
    P.into(group, "tomb.arms");
  }
  // ============================================================================================ the torches
  type Torch = { flame: ReturnType<typeof makeFlame>; halo: THREE.Mesh };
  const torches: Torch[] = [];
  {
    const P = new Part(K), iron = K.flat(COL.iron, { rough: 0.6 }), ironHi = K.flat(COL.ironHi, { rough: 0.5 }), wood = K.flat(COL.wood, { rough: 0.85 }), rag = K.flat(COL.rag, { rough: 0.95 });
    const torch = (at: THREE.Vector3, out: THREE.Vector3, ph: number) => {
      // the wall plate, the arm out 0.22 m, the ring; the shaft leaning out, the wrapped head, the flame on it
      const plate = at.clone(), ring = at.clone().addScaledVector(out, 0.22).add(new THREE.Vector3(0, 0.05, 0));
      P.add(iron, new THREE.BoxGeometry(out.z !== 0 ? 0.14 : 0.04, 0.26, out.z !== 0 ? 0.04 : 0.14).translate(plate.x, plate.y, plate.z), 0.006);
      P.add(iron, bar(plate.clone().add(new THREE.Vector3(0, -0.08, 0)), ring, 0.022, 0.022, 10), 0.005);
      P.add(iron, bar(plate.clone().add(new THREE.Vector3(0, 0.1, 0)), ring.clone().add(new THREE.Vector3(0, 0.02, 0)), 0.016, 0.016, 10), 0.005);
      P.add(ironHi, new THREE.TorusGeometry(0.05, 0.016, 8, 16).rotateX(Math.PI / 2).translate(ring.x, ring.y, ring.z), 0.005);
      const lean = out.clone().multiplyScalar(0.12), foot = ring.clone().add(new THREE.Vector3(0, -0.2, 0)).sub(lean), head = ring.clone().add(new THREE.Vector3(0, 0.26, 0)).add(lean);
      P.add(wood, bar(foot, head, 0.026, 0.032, 10), 0.005);
      P.add(rag, bar(head.clone().add(new THREE.Vector3(0, -0.02, 0)), head.clone().add(new THREE.Vector3(0, 0.11, 0)), 0.048, 0.05, 12), 0.006);
      const fl = makeFlame(0.24, ph); fl.group.position.copy(head).add(new THREE.Vector3(0, 0.1, 0)); group.add(fl.group);
      const halo = glowCard(0.55, "#ffb060", 0.32); halo.position.copy(head).add(new THREE.Vector3(0, 0.2, 0)).addScaledVector(out, -0.05); group.add(halo);
      torches.push({ flame: fl, halo });
    };
    torch(TORCH_L, new THREE.Vector3(0, 0, 1), 0);
    torch(TORCH_R, new THREE.Vector3(-1, 0, 0), 2.1);
    P.into(group, "tomb.torches");
    torches[1].halo.rotation.y = -Math.PI / 2 + 0.6;
  }
  // ============================================================================================ niche things: an urn, dried flowers
  {
    const P = new Part(K), urn = K.flat(COL.urn, { rough: 0.8 }), stem = K.flat(COL.dried, { rough: 0.9 }), head = K.flat(COL.driedHead, { rough: 0.85 });
    P.add(urn, lathe([[0, 0], [0.09, 0], [0.1, 0.03], [0.07, 0.08], [0.12, 0.2], [0.11, 0.3], [0.07, 0.36], [0.08, 0.4], [0, 0.4]], 18).translate(X0 - RW - 0.22, 0.62, -1.95), 0.006);
    P.add(urn, lathe([[0, 0], [0.08, 0], [0.09, 0.03], [0.06, 0.07], [0.1, 0.16], [0.09, 0.24], [0.06, 0.28], [0, 0.28]], 18).translate(X0 + RW + 0.22, 0.62, -1.95), 0.006);
    // dried flowers lying in the left front niche, and a few by the bier's foot (for the floor camera)
    const r = rng(851);
    const bunch = (x: number, y: number, z: number, yaw: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = yaw + (r() - 0.5) * 0.5, l = 0.22 + 0.1 * r(), b = new THREE.Vector3(x, y + 0.012, z), t = b.clone().add(new THREE.Vector3(Math.cos(a) * l, 0.01 + 0.02 * r(), Math.sin(a) * l));
        P.add(stem, bar(b, t, 0.006, 0.005, 6), 0.003);
        P.add(head, new THREE.IcosahedronGeometry(0.022 + 0.01 * r(), 1).scale(1, 0.7, 1).translate(t.x, t.y + 0.01, t.z), 0.004);
      }
    };
    bunch(X0 - RW - 0.25, 0.62, 0.15, 0.3, 6);
    P.into(group, "tomb.things");
  }
  // ============================================================================================ dust, light
  const dust = dustMotes(80, { x0: X0 - 2.1, x1: X0 + 1.4, y0: 0.4, y1: 2.5, z0: -2.7, z1: 0.6 }, "#ffd8a8", 0.014, 0.55, 861);
  group.add(dust.points);
  const L = lightRig(group, {
    dir: [0.62, 0.55, 0.56], k: 1.0, col: "#ffd0a2", at: [X0, 0, -1.0], half: 5, hemi: ["#4c4860", "#242026", 0.9],
    // (the left torch's light sits a little out from the wall toward the bier: the wall behind it does not burn out)
    point: { col: "#ffb676", k: 7, at: [TORCH_L.x + 0.35, TORCH_L.y + 0.5, TORCH_L.z + 0.85], dist: 7 },
  });
  L.point.decay = 1.7;
  let fk = 1;
  const pose = (t: number) => {
    for (const tr of torches) tr.flame.animate(t);
    const a = torches[0].flame.level(t), b = torches[1].flame.level(t);
    L.point.intensity = 7 * a; L.key.intensity = 1.0 * b; fk = (a + b) / 2;
    torches.forEach((tr, i) => { (tr.halo.material as THREE.MeshBasicMaterial).opacity = 0.32 * (i ? b : a); });
    dust.update(t);
  };
  pose(0);
  return {
    group,
    view(c: THREE.Vector3) {
      for (const w of walls) w.mesh.visible = w.side === "F" ? c.z < ZF - 0.05 : w.side === "L" ? c.x > X0 - RW + 0.05 : c.x < X0 + RW - 0.05;
    },
    animate(t: number) { pose(t); },
    cast() { return { gain: 0.86 * (0.98 + 0.02 * fk) }; },
  };
};

export const TOMB: PlaceDef = { look: TOMB_LOOK, params: TOMB_PARAMS, build: buildTomb };

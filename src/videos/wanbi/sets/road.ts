// THE ROAD 传舍后门 (place "road", island x 80), DUSK. WP3's set (it replaced the WP1b block-out with the same exports:
// buildRoad(K) -> { group, view(camPos), animate(t) } and ROAD_LOOK). Every number is layout/road.ts ROAD_SET.
//
// WHAT THERE IS (both cameras look north, -z; west = screen LEFT):
//   - THE SKY: the kit's dome (by elevation only, for the whip pans) and in front of it, behind everything the two
//     cameras see, ONE high-resolution painted card (400 m out): orange at the horizon, rose, mauve, deep violet by 6
//     deg, a warm glow round the setting sun (west, left), a few soft lilac and peach cloud streaks. roadFar is a 13 deg
//     lens, so the dome alone (5.7 texels a degree) would be a blur there;
//   - THE SUN: a disc with a glow card, setting into the ridge at the LEFT edge of roadFar (placed from that camera's
//     frame, layout ROAD_SET.sun). Only the far camera sees it (view): in roadGate it would stand between the envoy's and
//     the servant's heads, brighter than the jade (BIBLE 2.1: the jade is the brightest thing in its frames);
//   - THE MOON: a pale disc at roadFar 80/18 (77/28 in roadGate), both cameras;
//   - far hills on one painted card (low, lavender and blue-violet; they sink to a plain where the sun sets);
//   - the low RIDGE of the long shot: a long smooth mound with a flat top at y 0.9 and its path painted along z -14
//     (NOINK like Hongmen's hills: a long far silhouette against the sky would be a crawling dashed line);
//   - the ground: dusky earth with the PATH painted on it (from the gate past the figures' feet, out of roadGate's
//     right edge, on toward the ridge), grass tufts and stones painted; the mesh ends in front of the hills card;
//   - the guesthouse WALL: rammed earth in painted layers (夯土), a grey-violet tiled coping, and the small wooden GATE
//     (two posts, a lintel, two shut leaves, a little tiled hood). No lantern, no torch;
//   - a low warm key from the WEST (screen left, the camera's left front) and a violet hemisphere.
// Colour: warm earth and orange low, violet high; the figures' teal and brown read against both.
// INK / FLICKER RULES (sets/okit.ts): far things are paint on NOINK cards; inked pieces are chunky (posts 14 cm,
// boards 5 cm) and stand 2 cm proud or well clear; the earth layers, tiles, planks and studs are paint. Seeded only.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import { lightRig, skyDome, farCard, paint, blotch, mottle, soft, groundTex, skyAt, rng, css, mix, NOINK, V, type G2 } from "../../../kit/sets/okit";
import { ROAD_SET as S, ROAD_CAMS, RX } from "../layout/road";
import type { Cam } from "../layout";
import { W as FW, H as FH } from "../story";
import type { CastLight } from "../../group/kit/cast";
import type { PlaceLook } from "./index";

const ROAD_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.22, 0.18, 0.24]], [-8, [0.3, 0.24, 0.32]], [6, [0.52, 0.38, 0.42]], [40, [0.36, 0.3, 0.5]], [90, [0.26, 0.24, 0.46]]],
  boxes: [{ az: 160, el: 12, rot: 0, w: 40, h: 14, soft: 14, col: [1.0, 0.62, 0.38] }],
};
/** DUSK: a low warm key from the WEST (screen left), deep violet shade */
export const ROAD_LOOK: PlaceLook = {
  bg: "#3b2f58",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.9, color: "#20182e" },
  cast: {
    key: [-0.78, 0.36, 0.5], tint: [1.0, 0.76, 0.56], tintK: 0.8, gain: 0.9, grad: 0.22, bodyGrad: 0.16, sideTint: [0.86, 0.84, 1.0],
    shade: [1.02, 0.88, 1.7], shadeK: 0.45, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.1, lift: 0, contactLen: 0.3,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: ROAD_FILL,
};

const COL = {
  ground: "#a8886c", groundHi: "#b6967a", groundLo: "#967760", path: "#d2b492", pathLo: "#bea07e", tuft: "#7e7852", tuftLo: "#6c6248", stone: "#a49aa6",
  earth: "#ccaa80", earthHi: "#d8b88e", earthLo: "#bc9a70", earthLine: "#a2805c",
  tile: "#6c6472", tileHi: "#837b88", tileLo: "#4e4856", wood: "#73523a", woodLo: "#5c412e", stud: "#3e3438",
  ridge: "#a08490", ridgeHi: "#ae929c", ridgeLo: "#90767f", ridgePath: "#c4a698",
  hillFar: "#a690b8", hillFarWarm: "#c49aa6", hillNear: "#8873a3", hillNearLo: "#7a6798",
};

// ---------------------------------------------------------------------------------------------------- helpers
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
/** uv in metres / `tile` by each face's normal: front and back (x, y), the ends (z, y), top and bottom (x, z); for
 *  repeating textures */
const tileUV = <T extends THREE.BufferGeometry>(g: T, tile: number, tileY = tile): T => {
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    const a = ax > 0.5 ? p.getZ(i) : p.getX(i), b = ay > 0.5 ? p.getZ(i) : p.getY(i);
    uv[2 * i] = a / tile; uv[2 * i + 1] = b / tileY;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
/** the direction through the screen point (sx, sy) (0..1, from the top left) of a camera (no roll) */
const rayOf = (c: Cam, sx: number, sy: number) => {
  const p = V(...c.pos), f = V(...c.look).sub(p).normalize(), r = f.clone().cross(V(0, 1, 0)).normalize(), u = r.clone().cross(f);
  const ty = Math.tan((c.fov * Math.PI) / 360), tx = (ty * FW) / FH;
  return f.addScaledVector(r, (2 * sx - 1) * tx).addScaledVector(u, (1 - 2 * sy) * ty).normalize();
};
/** a blotch drawn again across the edges of a repeating tile */
const wrapBlotch = (g: G2, W: number, H: number, x: number, y: number, r: number, col: string, a: number) => {
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blotch(g, x + dx, y + dy, r, col, a);
};

// ---------------------------------------------------------------------------------------------------- the paintings
/** rammed earth, repeating every 2 m: 16 rammed layers (each its own tone, a darker line between, gently wavy), the
 *  formwork's faint upright joints every metre, pebbles, damp at the foot is in the wall's own geometry colour */
const EARTH_TILE = 2.0;
const earthTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(71), n = 16, lh = H / n;
  for (let i = 0; i < n; i++) { g.fillStyle = css(mix(COL.earth, i % 2 ? COL.earthHi : COL.earthLo, 0.3 + 0.5 * r())); g.fillRect(0, i * lh, W, lh + 1); }
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), 20 + 50 * r(), r() < 0.5 ? COL.earthHi : COL.earthLo, 0.18);
  g.strokeStyle = css(COL.earthLine, 0.4); g.lineWidth = 2.5;
  for (let i = 0; i < n; i++) {
    const y0 = i * lh, k = 1 + Math.floor(r() * 3), ph = r() * 6.28, a = 1.5 + 2 * r();
    g.beginPath(); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + a * Math.sin((x / W) * 6.2832 * k + ph)); g.stroke();
  }
  g.fillStyle = css(COL.earthLine, 0.25); g.fillRect(0, 0, 3, H); g.fillRect(W / 2, 0, 3, H);
  for (let i = 0; i < 160; i++) { g.fillStyle = css(r() < 0.5 ? "#d0b088" : "#7e6044", 0.5); g.beginPath(); g.arc(W * r(), H * r(), 1.5 + 2 * r(), 0, 7); g.fill(); }
}, true);
/** the coping's tiles: rounded ribs every 0.2 m (repeating along x) */
const tileTex = () => paint(128, 64, (g, W, H) => {
  g.fillStyle = COL.tile; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, css(COL.tileLo, 0.9)); gr.addColorStop(0.2, css(COL.tileHi, 0.5)); gr.addColorStop(0.5, css(COL.tile, 0)); gr.addColorStop(0.85, css(COL.tileLo, 0.4)); gr.addColorStop(1, css(COL.tileLo, 0.9));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}, true);
/** one gate leaf: four upright planks, two rows of iron studs, a ring on the inner edge (canvas = the leaf) */
const leafTex = (inner: 1 | -1) => paint(160, 608, (g, W, H) => {
  const r = rng(inner > 0 ? 73 : 74), n = 4, pw = W / n;
  for (let i = 0; i < n; i++) { g.fillStyle = css(mix(COL.wood, COL.woodLo, 0.2 + 0.5 * r())); g.fillRect(i * pw, 0, pw, H); g.fillStyle = css(COL.woodLo, 0.9); g.fillRect(i * pw, 0, 3, H); }
  g.strokeStyle = css(COL.woodLo, 0.4); g.lineWidth = 2;
  for (let i = 0; i < 10; i++) { const x = W * r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 5, H * 0.3, x - 5, H * 0.6, x, H); g.stroke(); }
  for (const yy of [0.18, 0.5, 0.82]) { g.fillStyle = css(COL.woodLo, 0.8); g.fillRect(0, H * yy - 10, W, 20); for (let x = pw / 2; x < W; x += pw) { g.fillStyle = COL.stud; g.beginPath(); g.arc(x, H * yy, 6, 0, 7); g.fill(); } }
  const rx = inner > 0 ? W - 22 : 22; g.strokeStyle = COL.stud; g.lineWidth = 5; g.beginPath(); g.arc(rx, H * 0.55, 13, 0, 7); g.stroke();
});
/** the ground: earth, the path, tufts and stones (okit groundTex: the square round (cx, cz)) */
const groundPaint = () => {
  const Gd = S.ground;
  return groundTex(Gd.cx, Gd.cz, Gd.size, 2048, COL.ground, (g, k) => {
    const r = rng(77);
    mottle(g, k.S, 78, COL.groundHi, COL.groundLo, 90, 0.2);
    // the path: a soft light band, a darker worn middle and two faint ruts
    const P = S.path.pts, line = (w: number, col: string, a: number, blur: number) => soft(g, blur, () => {
      g.strokeStyle = css(col, a); g.lineWidth = w * k.s; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); P.forEach((p, i) => (i ? g.lineTo(k.px(p.x), k.pz(p.z)) : g.moveTo(k.px(p.x), k.pz(p.z)))); g.stroke();
    });
    line(S.path.w * 1.25, COL.path, 0.55, 10);
    line(S.path.w * 0.85, COL.path, 0.9, 4);
    line(S.path.w * 0.3, COL.pathLo, 0.5, 6);
    // tufts of dry grass and a few stones, kept off the path and the figures' marks
    const nearPath = (x: number, z: number) => P.some((p, i) => i > 0 && segDist(x, z, P[i - 1].x, P[i - 1].z, p.x, p.z) < S.path.w * 0.8);
    for (let i = 0; i < 260; i++) {
      const x = Gd.cx - Gd.size * 0.46 + Gd.size * 0.92 * r(), z = Gd.cz - Gd.size * 0.46 + Gd.size * 0.92 * r();
      if (nearPath(x, z) || (z > -2.0 && z < 0.4 && x > 78.2 && x < 80.8)) continue;
      const rr = (0.12 + 0.25 * r()) * k.s;
      blotch(g, k.px(x), k.pz(z), rr, r() < 0.6 ? COL.tuft : COL.tuftLo, 0.55);
    }
    for (let i = 0; i < 70; i++) { const x = Gd.cx - 8 + 16 * r(), z = Gd.cz - 8 + 16 * r(); g.fillStyle = css(COL.stone, 0.7); g.beginPath(); g.ellipse(k.px(x), k.pz(z), (0.03 + 0.05 * r()) * k.s, (0.02 + 0.03 * r()) * k.s, r() * 3, 0, 7); g.fill(); }
  });
};
const segDist = (x: number, z: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
};
/** the ridge seen from above: dusky grass, its path along z (canvas top = the back foot) */
const ridgeTex = () => {
  const R = S.ridge, w = R.mx1 - R.mx0, d = R.zFoot0 - R.zFoot1;
  return paint(2048, Math.round(2048 * d / w), (g, W, H) => {
    g.fillStyle = COL.ridge; g.fillRect(0, 0, W, H);
    const r = rng(80);
    for (let i = 0; i < 160; i++) blotch(g, W * r(), H * r(), 8 + 20 * r(), r() < 0.5 ? COL.ridgeHi : COL.ridgeLo, 0.3);
    const pz = (z: number) => ((z - R.zFoot1) / d) * H, s = W / w;
    soft(g, 3, () => { g.fillStyle = COL.ridgePath; g.fillRect(0, pz(R.z - R.pathW / 2), W, R.pathW * s); });
  });
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildRoad(K: Kit) {
  const group = new THREE.Group(); group.name = "road";
  const mat = (c: string, map: THREE.Texture | null = null) => K.flat(map ? "#ffffff" : c, { rough: 0.9, map });
  const mesh = (name: string, geo: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], cast = true, into: THREE.Object3D = group) => {
    const o = new THREE.Mesh(geo, m); o.name = name; o.castShadow = cast; o.receiveShadow = true; into.add(o); return o;
  };
  const far = ROAD_CAMS.roadFar, farPos = V(...far.pos);

  // ---- the sky: the dome (by elevation, for the whip pans) and the painted card in front of it
  group.add(skyDome(V(RX, 0, 0), S.sky));
  const sunDir = rayOf(far, S.sun.sx, S.sun.sy), sunPos = farPos.clone().addScaledVector(sunDir, S.sun.dist);
  {
    const Ck = S.skyCard, cw = Ck.x1 - Ck.x0, ch = Ck.y1 - Ck.y0, D = -Ck.z;
    // where the sun's line from the card's eye point meets the card
    const e = V(RX, Ck.eye, 0), sOn = e.clone().add(sunPos.clone().sub(e).multiplyScalar(Ck.z / sunPos.z));
    const t = paint(2048, Math.round(2048 * ch / cw), (g, W, H) => {
      const px = (x: number) => ((x - Ck.x0) / cw) * W, py = (y: number) => (1 - (y - Ck.y0) / ch) * H, s = W / cw;
      for (let y = 0; y < H; y++) { const wy = Ck.y1 - ((y + 0.5) / H) * ch, el = (Math.atan2(wy - Ck.eye, D) * 180) / Math.PI; g.fillStyle = css(skyAt(S.sky, el)); g.fillRect(0, y, W, 1); }
      // the sun's glow: wide and low, warm (west = left)
      g.save(); g.translate(px(sOn.x), py(sOn.y)); g.scale(1.8, 0.75);
      const R = 9 * (Math.PI / 180) * D * s, gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, "rgba(255,214,140,0.85)"); gr.addColorStop(0.25, "rgba(255,186,120,0.45)"); gr.addColorStop(0.6, "rgba(246,160,120,0.15)"); gr.addColorStop(1, "rgba(240,150,120,0)");
      g.fillStyle = gr; g.fillRect(-R, -R, 2 * R, 2 * R); g.restore();
      // soft cloud streaks: peach near the sun, lilac further right and higher
      const r = rng(81), deg = (a: number) => Math.tan((a * Math.PI) / 180) * D;
      for (let i = 0; i < 9; i++) {
        const az = -9 + 22 * r(), el = 1.6 + 6 * r(), x = RX + deg(az), y = Ck.eye + deg(el), len = (3 + 5 * r()) * (Math.PI / 180) * D * s;
        const warm = Math.max(0, 1 - Math.hypot(az + 3, el) / 10), col = mix("#b896c4", "#f6bc98", warm);
        g.save(); g.translate(px(x), py(y)); g.scale(1, 0.09 + 0.05 * r());
        const cg = g.createRadialGradient(0, 0, 0, 0, 0, len); cg.addColorStop(0, css(col, 0.4)); cg.addColorStop(0.6, css(col, 0.18)); cg.addColorStop(1, css(col, 0));
        g.fillStyle = cg; g.fillRect(-len, -len, 2 * len, 2 * len); g.restore();
      }
    });
    const card = mesh("road.sky.card", new THREE.PlaneGeometry(cw, ch).translate((Ck.x0 + Ck.x1) / 2, (Ck.y0 + Ck.y1) / 2, Ck.z), new THREE.MeshBasicMaterial({ map: t, depthWrite: false, fog: false }), false);
    card.layers.set(NOINK); card.renderOrder = -90; card.receiveShadow = false; card.frustumCulled = false;
  }
  // ---- the sun (far cameras only) and the moon: unlit discs, never outlined
  const sun = new THREE.Group(); sun.name = "road.sky.sun"; group.add(sun);
  {
    const rS = S.sun.dist * Math.tan((S.sun.deg * Math.PI) / 180);
    const d = new THREE.Mesh(new THREE.CircleGeometry(rS, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.55, 1.0, 0.52), fog: false }));
    d.name = "road.sky.sun.disc"; d.layers.set(NOINK); sun.add(d);
    const gT = paint(128, 128, (g, Sz) => { const gr = g.createRadialGradient(Sz / 2, Sz / 2, 0, Sz / 2, Sz / 2, Sz / 2); gr.addColorStop(0, "rgba(255,226,160,0.9)"); gr.addColorStop(0.18, "rgba(255,200,130,0.55)"); gr.addColorStop(0.5, "rgba(255,170,110,0.18)"); gr.addColorStop(1, "rgba(255,160,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, Sz, Sz); });
    const h = new THREE.Mesh(new THREE.PlaneGeometry(rS * 9, rS * 9), new THREE.MeshBasicMaterial({ map: gT, transparent: true, depthWrite: false, fog: false }));
    h.name = "road.sky.sun.glow"; h.position.z = -4; h.layers.set(NOINK); sun.add(h);
    sun.position.copy(sunPos); sun.lookAt(farPos);
  }
  {
    const mo = S.moon, rM = mo.dist * Math.tan((mo.deg * Math.PI) / 360);
    const mT = paint(256, 256, (g, Sz) => {
      const c = Sz / 2, R = Sz * 0.46;
      blotch(g, c, c, Sz / 2, [236, 228, 255], 0.22);
      g.fillStyle = "#efe7d6"; g.beginPath(); g.arc(c, c, R, 0, 7); g.fill();
      const r = rng(83);
      for (let i = 0; i < 6; i++) { const a = r() * 6.28, d = R * 0.55 * r(); blotch(g, c + Math.cos(a) * d, c + Math.sin(a) * d, R * (0.16 + 0.16 * r()), "#d6cdca", 0.35); }
      g.strokeStyle = "rgba(255,250,240,0.6)"; g.lineWidth = 3; g.beginPath(); g.arc(c, c, R - 2, 0, 7); g.stroke();
    });
    const m = mesh("road.sky.moon", new THREE.PlaneGeometry(rM * 2 / 0.92, rM * 2 / 0.92), new THREE.MeshBasicMaterial({ map: mT, transparent: true, depthWrite: false, fog: false }), false);
    m.layers.set(NOINK); m.receiveShadow = false;
    m.position.copy(farPos).addScaledVector(rayOf(far, mo.sx, mo.sy), mo.dist); m.lookAt(farPos);
  }

  // ---- the far hills: low, painted; they sink to a plain where the sun sets
  {
    const Hl = S.hills, eye = farPos, dist = eye.z - Hl.z;
    const sunX = eye.x + (sunPos.x - eye.x) * (dist / (eye.z - sunPos.z));
    /** a hill top on the card (m) at x: el above the ridge line in roadFar = (h - eye.y) / dist rad */
    const dip = (x: number) => 1 - 0.92 * Math.exp(-(((x - sunX) / 2.6) ** 2));
    const card = farCard(Hl.x0, Hl.x1, Hl.y0, Hl.y1, Hl.z, 2048, 340, (g, k) => {
      const top = (x: number, base: number, amp: number, f: number, ph: number) => base * dip(x) + amp * dip(x) * (0.55 + 0.3 * Math.sin(x * f + ph) + 0.15 * Math.sin(x * f * 2.7 + ph * 1.7));
      const layer = (base: number, amp: number, f: number, ph: number, col: (x: number) => string) => {
        for (let px = 0; px < k.W; px += 2) { const x = Hl.x0 + (px / k.W) * (Hl.x1 - Hl.x0); g.fillStyle = col(x); g.fillRect(px, k.py(top(x, base, amp, f, ph)), 2, k.H); }
      };
      // the far range: lavender, warmer toward the sun; the near range: blue-violet
      layer(1.9, 1.5, 0.21, 1.3, (x) => css(mix(COL.hillFar, COL.hillFarWarm, Math.max(0, 1 - Math.abs(x - sunX) / 12))));
      layer(0.9, 1.1, 0.33, 4.1, (x) => css(mix(COL.hillNear, COL.hillNearLo, 0.5 + 0.5 * Math.sin(x * 0.9))));
      g.fillStyle = css(COL.hillNearLo); g.fillRect(0, k.py(0.15), k.W, k.H);
    });
    // the card is clear above the hills: blend it (okit's farCard is opaque), after the moon and the sun's glow, which
    // it covers where a hill stands in front of them
    const cm = card.material as THREE.MeshBasicMaterial; cm.transparent = true; cm.depthWrite = false; card.renderOrder = 1;
    card.name = "road.far"; group.add(card);
  }

  // ---- the ground (the path painted on it); it ends in front of the hills card
  {
    const Gd = S.ground, x0 = RX - 40, x1 = RX + 40, z0 = Gd.zFar, z1 = 30;
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - Gd.cx) / Gd.size + 0.5, 0.5 - (p.getZ(i) - Gd.cz) / Gd.size);
    mesh("road.ground", g, mat("", groundPaint()), false);
  }

  // ---- the ridge: a long smooth mound, its top flat at y 0.9 (NOINK, lit)
  {
    const R = S.ridge, prof: [number, number][] = [], sm = (x: number) => x * x * (3 - 2 * x);
    for (let i = 0; i <= 8; i++) prof.push([R.zFoot0 + (R.zTop0 - R.zFoot0) * (i / 8), -0.05 + (R.y + 0.05) * sm(i / 8)]);
    for (let i = 0; i <= 8; i++) prof.push([R.zTop1 + (R.zFoot1 - R.zTop1) * (i / 8), R.y - (R.y + 0.05) * sm(i / 8)]);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [], d = R.zFoot0 - R.zFoot1;
    prof.forEach(([z, y]) => { for (const x of [R.mx0, R.mx1]) { pos.push(x, y, z); uv.push((x - R.mx0) / (R.mx1 - R.mx0), 1 - (z - R.zFoot1) / d); } });
    for (let i = 0; i + 1 < prof.length; i++) { const a = 2 * i, b = a + 1, c = a + 2, e = a + 3; idx.push(a, b, e, a, e, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = mesh("road.ridge", g, mat("", ridgeTex()), false); m.layers.set(NOINK);
  }

  // ---- the guesthouse wall: rammed earth with a tiled coping, the gate (posts, lintel, two shut leaves, a hood)
  {
    const Wl = S.wall, G = S.gate, P = G.post, g0 = G.x - G.w / 2, g1 = G.x + G.w / 2, zb = Wl.z - Wl.t, mE = mat("", earthTex()), mT = mat("", tileTex());
    const earth = (k: string, x0: number, x1: number, y0: number, y1: number) => mesh("road.wall" + k, tileUV(boxG(x0, x1, y0, y1, zb, Wl.z), EARTH_TILE), mE);
    earth("", Wl.x0, g0 - P, 0, Wl.h); earth("[2]", g1 + P, Wl.x1, 0, Wl.h); earth("[3]", g0 - P, g1 + P, G.h + P, Wl.h);
    const cp = Wl.cap;
    mesh("road.wall.cap", tileUV(boxG(Wl.x0 - cp.over, Wl.x1 + cp.over, Wl.h - 0.01, Wl.h + cp.h, zb - cp.over, Wl.z + cp.over), 0.2, 0.2), mT);
    const mW = mat(COL.wood), zp1 = Wl.z + 0.02;
    mesh("road.gate.post", boxG(g0 - P, g0, 0, G.h + P, zb - 0.01, zp1), mW);
    mesh("road.gate.post[2]", boxG(g1, g1 + P, 0, G.h + P, zb - 0.01, zp1), mW);
    mesh("road.gate.lintel", boxG(g0 - P - 0.04, g1 + P + 0.04, G.h, G.h + P, zb - 0.01, zp1 + 0.01), mW);
    const zl = Wl.z - Wl.t / 2;
    for (const [k, x0, x1, inner] of [["", g0, G.x - 0.005, 1], ["[2]", G.x + 0.005, g1, -1]] as [string, number, number, 1 | -1][]) {
      const lf = new THREE.Mesh(boxG(x0, x1, 0.02, G.h, zl - 0.025, zl + 0.025), [mW, mW, mW, mW, mat("", leafTex(inner)), mW]);
      lf.name = "road.gate.leaf" + k; lf.castShadow = lf.receiveShadow = true; group.add(lf);
    }
    // the little hood over the gate: two tiled slopes and a ridge beam (5 cm boards: chunky)
    const Hd = G.hood, zc = Wl.z - Wl.t / 2, run = Hd.out + Wl.t / 2, drop = Hd.ridge - Hd.y, ang = Math.atan2(drop, run), len = Math.hypot(run, drop) + 0.04;
    for (const [k, s] of [["", 1], ["[2]", -1]] as [string, number][]) {
      const gS = new THREE.BoxGeometry(Hd.w, 0.05, len).rotateX(s * ang).translate(G.x, (Hd.y + Hd.ridge) / 2 + 0.02, zc + s * run / 2);
      mesh("road.gate.hood" + k, tileUV(gS, 0.2, 0.2), mT);
    }
    mesh("road.gate.hood.ridge", boxG(G.x - Hd.w / 2 - 0.05, G.x + Hd.w / 2 + 0.05, Hd.ridge - 0.02, Hd.ridge + 0.08, zc - 0.06, zc + 0.06), mat(COL.tileLo));
  }

  lightRig(group, { dir: [-0.85, 0.32, 0.42], k: 1.7, col: "#ffb47a", at: [RX - 0.3, 0, -1.2], half: 5.0, hemi: ["#8a78b8", "#3a2c38", 0.95] });

  return {
    group,
    /** no walls to hide out here; the setting sun shows only to the far camera (roadFar) */
    view(camPos: THREE.Vector3) { sun.visible = camPos.z > S.sun.farZ; },
    /** the dusk does not move in a 4-second scene: nothing animates (a pure function of t) */
    animate(t: number) { void t; },
  };
}
export type RoadSet = ReturnType<typeof buildRoad>;

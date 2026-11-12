// THE NIGHT PLACES of the Hongmen film, and Liu Bang's camp by night and by day, built from layout.ts with the
// outdoor kit (okit.ts):
//   buildNightX   "nightX"          lines 5, 6: a corner of Xiang Yu's quarters at night (CAMS.nightX, nightXin)
//   buildLiuCamp  "nightL" / "dayL" line 7 (night) and line 20 (day): in front of Liu Bang's own tent
//                                   (CAMS.campNight, campDay, campDayIn). Built TWICE (night = true / false): the
//                                   night picture has its own materials, sky, fire and light.
// NIGHT, in one second: a deep BLUE sky with a moon and stars (painted cards), a warm fire or lamp with its pool of
// light, and figures that stay fully lit (their own light: NIGHT_CAST). Never murky: the darkest surface is still a
// colour, not black.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import type { CastLight } from "../../group/kit/cast";
import * as L from "../layout";
import {
  V, PAL, Batch, boxG, limb, tile, uvXY, hipRoofG, flatOf, paint, clothTex, planksTex, makeFlame, glowCard, fireBasketG, skyDome, skyAt, farCard,
  groundG, groundTex, mottle, soft, shape, blotch, css, mix, toHex, lightRig, SUN_DIR, rng, FONT, clamp, type G2, type SkyStops,
} from "./okit";
import { type Built, BAKED, DAY_CAST, DAY_AO, DAY_BG, DAY_SKY, cloud, hills, fasciaTex, roofTex, bannerPole, bannerMat } from "./outdoor";

// =====================================================================================================================
// looks
// =====================================================================================================================
export const NIGHT_SKY: SkyStops = [[-8, "#3a4c8e"], [4, "#31427f"], [26, "#222f68"], [60, "#19234f"], [90, "#151d44"]];
export const NIGHT_BG = "#2b3a75";
/** the figures at night: a warm key from the fire's side of the lens, a deep violet shade; gain under 1 so that reds
 *  and whites do not blow out in front of the dark (the cast sheets' night light) */
export const NIGHT_CAST = {
  key: [0.2, 0.5, 0.84], tint: [1.0, 0.86, 0.68], tintK: 0.75, gain: 0.86, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
  shade: [1.05, 0.9, 1.8], shadeK: 0.45, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.1, lift: 0, contactLen: 0.2, ...BAKED,
} as unknown as CastLight;
export const NIGHT_AO = { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 2.2, color: "#141230" };
export const NIGHT_LOOKS = {
  nightX: { bg: NIGHT_BG, ao: NIGHT_AO, cast: NIGHT_CAST },
  nightL: { bg: NIGHT_BG, ao: NIGHT_AO, cast: NIGHT_CAST },
  dayL: { bg: DAY_BG, ao: DAY_AO, cast: DAY_CAST },
};

/** stars and a crescent moon on a painted night card */
export const stars = (g: G2, x0: number, y0: number, x1: number, y1: number, n: number, seed: number, s = 1) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), rad = s * (1.1 + 1.6 * r() * r()), a = 0.55 + 0.45 * r();
    g.fillStyle = css([236, 240, 255], a); g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
  }
};
export const moon = (g: G2, x: number, y: number, r: number, sky: string) => {
  blotch(g, x, y, r * 3.2, [170, 190, 255], 0.3);
  g.fillStyle = "#fbf3cf"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = sky; g.beginPath(); g.arc(x + r * 0.42, y - r * 0.22, r * 0.88, 0, 7); g.fill();
};
/** a camp at night on a painted card: dark tents with a pale edge, torch points with a warm halo. Between x0 and x1
 *  (px), feet on `base` (px), tents `h` px high */
const nightCamp = (g: G2, x0: number, x1: number, base: number, h: number, seed: number, tentCol: string, edge: string) => {
  const r = rng(seed), n = Math.max(2, Math.round((x1 - x0) / (h * 1.9)));
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((i + 0.5 + 0.3 * (r() - 0.5)) / n) * (x1 - x0), w = h * (1.5 + 0.5 * r()), hh = h * (0.8 + 0.35 * r());
    shape(g, [[cx - w / 2, base], [cx + w / 2, base], [cx + w / 2, base - hh * 0.5], [cx + w * 0.2, base - hh], [cx - w * 0.2, base - hh], [cx - w / 2, base - hh * 0.5]], tentCol, edge, Math.max(1.5, h * 0.05));
  }
  for (let i = 0; i < n; i++) {
    if (r() < 0.35) continue;
    const x = x0 + ((i + 1) / n) * (x1 - x0) - h * 0.2, y = base - h * 0.42;
    blotch(g, x, y, h * 0.8, [255, 170, 80], 0.5);
    g.fillStyle = "#ffe2a0"; g.beginPath(); g.arc(x, y, Math.max(1.6, h * 0.07), 0, 7); g.fill();
  }
};

// =====================================================================================================================
// shared furniture
// =====================================================================================================================
/** a low lacquer table (案): a black body, a red top with a black edge and a gold line, two end boards for legs (open
 *  toward the sitter and away from him: the seated robe goes under it). T = a layout Seat's table. */
export const lacquerTable = (into: THREE.Object3D, M: Mats, T: { at: THREE.Vector3; w: number; d: number; h: number; ry: number }) => {
  const flat = flatOf(M), g = new THREE.Group(); g.position.set(T.at.x, 0, T.at.z); g.rotation.y = T.ry; g.name = "table";
  const mLac = flat(PAL.lacquer, null, 0.5);
  const tTop = paint(256, 128, (c, W, H) => {
    c.fillStyle = "#34303c"; c.fillRect(0, 0, W, H);
    c.fillStyle = "#b5362c"; c.fillRect(12, 12, W - 24, H - 24);
    c.strokeStyle = "#e2b03a"; c.lineWidth = 3; c.strokeRect(20, 20, W - 40, H - 40);
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(T.w, 0.05, T.d), [mLac, mLac, flat("#ffffff", tTop, 0.45), mLac, mLac, mLac]);
  top.position.y = T.h - 0.025; top.castShadow = top.receiveShadow = true; g.add(top);
  for (const s of [-1, 1]) { const leg = new THREE.Mesh(boxG(s * (T.w / 2 - 0.05) - 0.03, s * (T.w / 2 - 0.05) + 0.03, 0, T.h - 0.04, -T.d / 2 + 0.03, T.d / 2 - 0.03), mLac); leg.castShadow = leg.receiveShadow = true; g.add(leg); }
  into.add(g);
  return g;
};
/** a woven seat pad with a dark bound edge */
export const seatPad = (into: THREE.Object3D, M: Mats, at: THREE.Vector3, facing: number) => {
  const flat = flatOf(M);
  const tMat = paint(256, 192, (c, W, H) => {
    const r = rng(7), q = 16;
    for (let y = 0; y < H / q; y++) for (let x = 0; x < W / q; x++) { const v = 196 + 36 * r(); c.fillStyle = css([v, v * 0.88, v * 0.62]); c.fillRect(x * q, y * q, q, q); c.strokeStyle = "rgba(110,84,50,0.5)"; c.lineWidth = 1.5; c.beginPath(); if ((x + y) % 2) { c.moveTo(x * q, y * q + q / 2); c.lineTo(x * q + q, y * q + q / 2); } else { c.moveTo(x * q + q / 2, y * q); c.lineTo(x * q + q / 2, y * q + q); } c.stroke(); }
    c.strokeStyle = "#6a3a30"; c.lineWidth = 20; c.strokeRect(10, 10, W - 20, H - 20);
  });
  const mSide = flat("#7a5a3c");
  const m = new THREE.Mesh(new THREE.BoxGeometry(L.PAD.w, L.PAD.h, L.PAD.d), [mSide, mSide, flat("#ffffff", tMat, 0.9), mSide, mSide, mSide]);
  m.position.set(at.x, L.PAD.h / 2, at.z); m.rotation.y = facing; m.castShadow = m.receiveShadow = true; m.name = "pad"; into.add(m);
  return m;
};

// =====================================================================================================================
// NIGHT_X: a corner of Xiang Yu's quarters (lines 5, 6)
// =====================================================================================================================
// The two cameras look DOWN at a two-shot: what they see of the room is a 2 m wide piece of the back wall up to
// 1.85 m, the rug and the table. So the night is told by three things inside that small piece: the lamp's warm pool
// on the table and the wall behind the two heads; the cool dark of the cloth away from it; and, at the right edge
// behind the informer (he came in from there), the tent's doorway with the flap tied back: a deep blue sky, a
// crescent moon, the camp's torches far below.
export function buildNightX(M: Mats): Built & { setLamp(k: number): void } {
  const group = new THREE.Group(); group.name = "nightX"; group.visible = false;
  const flat = flatOf(M), B = new Batch(), NC = new Batch();
  const N = L.NIGHT_X, nx = N.at.x, st = N.seat, wz = N.wallZ, lp = N.lamp;
  const DOOR = { x0: nx + 0.45, x1: nx + 1.6, h: 2.15 };

  // ---- the floor: one mesh, one painting: reed mats, the wine-red felt rug with its border; outside the wall, earth
  const FC = { x: nx, z: 1, size: 12 };
  const tFloor = groundTex(FC.x, FC.z, FC.size, 2048, "#7d6c58", (g, k) => {
    const r = rng(3);
    // reed mats, 1.2 m wide strips
    for (let i = -5; i < 5; i++) { const v = 0.92 + 0.14 * r(); g.fillStyle = css([126 * v, 110 * v, 88 * v]); g.fillRect(k.px(nx + i * 1.2), k.pz(wz), 1.2 * k.s + 1, 7 * k.s); g.fillStyle = "rgba(60,46,40,0.55)"; g.fillRect(k.px(nx + i * 1.2) - 2, k.pz(wz), 4, 7 * k.s); }
    g.fillStyle = "#4a4a66"; g.fillRect(0, 0, k.S, k.pz(wz));                                                  // outside, at night
    const R = N.rug, x0 = k.px(R.x0), x1 = k.px(R.x1), z0 = k.pz(R.z0), z1 = k.pz(R.z1), b = 0.16 * k.s;
    g.fillStyle = "#2c3350"; g.fillRect(x0, z0, x1 - x0, z1 - z0);
    g.fillStyle = "#4a6488"; g.fillRect(x0 + b * 0.35, z0 + b * 0.35, x1 - x0 - b * 0.7, z1 - z0 - b * 0.7);
    g.strokeStyle = "#d0a244"; g.lineWidth = b * 0.22; g.strokeRect(x0 + b, z0 + b, x1 - x0 - 2 * b, z1 - z0 - 2 * b);
    g.fillStyle = "#3f5878"; g.fillRect(x0 + b * 1.5, z0 + b * 1.5, x1 - x0 - 3 * b, z1 - z0 - 3 * b);
    for (let i = 0; i < 30; i++) blotch(g, x0 + (x1 - x0) * r(), z0 + (z1 - z0) * r(), 0.5 * k.s, r() < 0.5 ? [86, 116, 150] : [48, 70, 100], 0.16);
  });
  const floor = new THREE.Mesh(groundG(FC.x, FC.z, FC.size, 60), flat("#ffffff", tFloor, 0.95)); floor.receiveShadow = true; floor.name = "nightX.floor"; group.add(floor);

  // ---- the back wall (cloth, with the doorway) and the left wall: single sheets, they do not cast
  const WH = N.wallH + 1.6, WT = 1.2;                                                  // one cloth width = 1.2 m = one tile
  const tWall = paint(512, 1024, (g, W, H) => {
    const r = rng(11);
    g.fillStyle = "#e6e6ea"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) blotch(g, W * r(), H * r(), W * (0.2 + 0.25 * r()), [176, 176, 190], 0.2);
    for (const x of [0.28, 0.66]) { const gr = g.createLinearGradient(W * x - 30, 0, W * x + 30, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.45, "rgba(255,255,255,0.22)"); gr.addColorStop(0.6, "rgba(120,120,150,0.2)"); gr.addColorStop(1, "rgba(120,120,150,0)"); g.fillStyle = gr; g.fillRect(W * x - 30, 0, 60, H); }
    g.fillStyle = "rgba(60,50,80,0.5)"; g.fillRect(0, 0, 4, H); g.fillRect(W - 4, 0, 4, H);
    // a woven band at 1.55 m: gold lozenges on the camp's purple (four to a cloth width)
    const y0 = H * (1 - 1.66 / WH), y1 = H * (1 - 1.5 / WH), bh = y1 - y0;
    g.fillStyle = "#b9a0ee"; g.fillRect(0, y0, W, bh);
    g.fillStyle = "#f0cf78"; for (let i = 0; i < 4; i++) { const cx = (W * (i + 0.5)) / 4; shape(g, [[cx, y0 + bh * 0.14], [cx + bh * 0.62, y0 + bh / 2], [cx, y1 - bh * 0.14], [cx - bh * 0.62, y0 + bh / 2]], "#f0cf78"); }
    g.fillStyle = "rgba(60,44,90,0.8)"; g.fillRect(0, y0 - 3, W, 5); g.fillRect(0, y1 - 2, W, 5);
  }, true);
  const mWall = flat("#474068", tWall, 0.95);
  const wallPiece = (x0: number, x1: number, y0: number, y1: number) => {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0).translate((x0 + x1) / 2, (y0 + y1) / 2, wz), p = g.attributes.position as THREE.BufferAttribute, a = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < a.count; i++) a.setXY(i, (p.getX(i) - N.wallX) / WT, p.getY(i) / WH);
    NC.add(mWall, g);
  };
  wallPiece(N.wallX, DOOR.x0, 0, WH); wallPiece(DOOR.x1, nx + 4.2, 0, WH); wallPiece(DOOR.x0, DOOR.x1, DOOR.h, WH);
  { const g = new THREE.PlaneGeometry(6.5, WH).rotateY(Math.PI / 2).translate(N.wallX, WH / 2, wz + 3.25); NC.add(mWall, tile(g, 6.5 / WT, 1)); }
  // the flap, tied back: a roll of cloth standing at the doorway's left edge, a cord round it (paint)
  const tRoll = paint(64, 256, (g, W, H) => { g.fillStyle = "#e9e4d2"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(150,140,120,0.35)"; for (let i = 0; i < 5; i++) g.fillRect(W * (0.1 + 0.2 * i), 0, 3, H); g.fillStyle = "#d0a244"; g.fillRect(0, H * 0.42, W, H * 0.045); g.fillStyle = "rgba(70,50,40,0.8)"; g.fillRect(0, H * 0.415, W, 3); g.fillRect(0, H * 0.462, W, 3); });
  B.add(flat("#8f84a8", tRoll, 0.9), new THREE.CylinderGeometry(0.15, 0.19, DOOR.h + 0.1, 16, 1, false).translate(DOOR.x0 + 0.02, (DOOR.h + 0.1) / 2, wz + 0.02));

  // ---- the night outside the doorway: one painted card
  {
    const x0 = DOOR.x0 - 1.0, x1 = DOOR.x1 + 1.4, y0 = -0.3, y1 = 2.9, hz = 0.55;
    group.add(farCard(x0, x1, y0, y1, wz - 2.6, 768, 768, (g, k) => {
      const gr = g.createLinearGradient(0, 0, 0, k.py(hz));
      gr.addColorStop(0, "#1a2558"); gr.addColorStop(1, "#40559c");
      g.fillStyle = gr; g.fillRect(0, 0, k.W, k.py(hz));
      stars(g, 0, 0, k.W, k.py(hz + 0.25), 46, 5, 1.1);
      moon(g, k.px(DOOR.x0 + 0.43), k.py(1.16), 0.14 * k.s, "#22306a");
      g.fillStyle = "#2c3a70"; g.fillRect(0, k.py(hz), k.W, k.H);
      shape(g, [[0, k.py(hz)], [k.W * 0.3, k.py(hz + 0.16)], [k.W * 0.62, k.py(hz + 0.05)], [k.W, k.py(hz + 0.2)], [k.W, k.py(hz)]], "#2c3a70");
      nightCamp(g, 0, k.W, k.py(hz - 0.08), 0.2 * k.s, 9, "#27325f", "#46578f");
      nightCamp(g, -20, k.W + 20, k.py(hz - 0.26), 0.3 * k.s, 12, "#232c55", "#4a5b96");
    }));
  }

  // ---- his seat: the pad, the low table, the bronze lamp on it
  seatPad(group, M, st.top, st.facing);
  lacquerTable(group, M, st.table);
  const mBronze = flat("#c79a3e", null, 0.5), fy = lp.at.y + lp.flame;
  B.add(mBronze, new THREE.LatheGeometry([[0.004, 0], [0.075, 0], [0.078, 0.012], [0.03, 0.03], [0.021, 0.05], [0.021, 0.105], [0.035, 0.125], [0.085, 0.158], [0.088, 0.17], [0.06, 0.17], [0.03, 0.15], [0.004, 0.15]].map(([a, b]) => new THREE.Vector2(a, b)), 20).translate(lp.at.x, lp.at.y, lp.at.z));
  const flame = makeFlame(0.105, 0.7); flame.group.position.set(lp.at.x, fy - 0.045, lp.at.z); group.add(flame.group);
  const glow = glowCard(0.42, "#ffb060", 0.42); glow.position.set(lp.at.x, fy + 0.02, lp.at.z - 0.06); group.add(glow);

  B.flush(group, "nightX.static"); NC.flush(group, "nightX.walls", false, true);
  const K = 4.6;
  const rig = lightRig(group, { dir: [0.2, 0.6, 0.78], k: 0.75, col: "#a9b4f0", at: [nx, 0, 0], half: 4.5, hemi: ["#8c96d8", "#4a3c50", 0.5], point: { col: "#ffb870", k: K, at: [lp.at.x, fy + 0.22, lp.at.z + 0.32], dist: 6.5 } });
  let duck = 1;
  return {
    group, tris: B.tris + NC.tris,
    /** the flame's size for this frame (1 = normal; a shot may duck it on the slam). Reset by the set's reset(). */
    setLamp(k: number) { duck = k; },
    animate(t) {
      flame.animate(t); flame.group.scale.setScalar(duck);
      const lv = flame.level(t) * (0.55 + 0.45 * duck);
      rig.point.intensity = K * lv; (glow.material as THREE.MeshBasicMaterial).opacity = 0.42 * lv;
    },
  };
}

// =====================================================================================================================
// NIGHT_L / DAY_L: in front of Liu Bang's own tent (line 7 by night, line 20 by day)
// =====================================================================================================================
// WHOSE CAMP: a tent of undyed cloth under a RED roof, a red base band, a red banner with 刘. The walls are NOT red
// on purpose: Liu Bang (all red), his red guards and the informer (dark crimson) stand in front of them, and the pale
// door flap is right behind the informer's head by day and behind Liu Bang's by night (lit from inside).
export function buildLiuCamp(M: Mats, night: boolean): Built {
  const group = new THREE.Group(); group.name = night ? "campL.night" : "campL.day"; group.visible = false;
  const flat = flatOf(M), B = new Batch(), NC = new Batch();
  const N = L.NIGHT_L, T = N.tent, DR = N.door, F = N.fire, Pl = N.pole, lx = N.at.x;
  const eye = L.CAMS.campNight.pos, anim: ((t: number) => void)[] = [];

  // ---- ground: beaten earth, worn pale in front of the door
  const GC = { x: lx, z: 2, size: 44 };
  const tG = groundTex(GC.x, GC.z, GC.size, 2048, PAL.earth, (g, k) => {
    mottle(g, k.S, 31, PAL.earthHi, PAL.earthLo, 70, 0.14);
    soft(g, 30, () => { g.fillStyle = css(PAL.earthHi, 0.8); g.beginPath(); g.ellipse(k.px(lx + 0.4), k.pz(T.z + 3.4), 5.5 * k.s, 3.2 * k.s, 0, 0, 7); g.fill(); });
    if (night) soft(g, 34, () => { g.fillStyle = "rgba(255,196,120,0.5)"; g.beginPath(); g.ellipse(k.px(F.at.x), k.pz(F.at.z + 0.5), 2.4 * k.s, 1.7 * k.s, 0, 0, 7); g.fill(); });
  });
  const ground = new THREE.Mesh(groundG(GC.x, GC.z, GC.size), flat(night ? "#cfc8c8" : "#ffffff", tG, 0.95)); ground.receiveShadow = true; ground.name = "campL.ground"; group.add(ground);

  // ---- sky and the far card (above the roof: a strip of sky, the moon and stars at night)
  const SKY = night ? NIGHT_SKY : DAY_SKY;
  group.add(skyDome(V(lx, 0, 0), SKY));
  const CZ = -42, Dc = eye[2] - CZ, ey = eye[1];
  group.add(farCard(lx - 32, lx + 32, -1, 31, CZ, 2048, 1024, (g, k) => {
    for (let y = 0; y < k.H; y++) { const yw = 31 - (32 * (y + 0.5)) / k.H; g.fillStyle = css(skyAt(SKY, (Math.atan2(yw - ey, Dc) * 180) / Math.PI)); g.fillRect(0, y, k.W, 1); }
    if (night) {
      stars(g, 0, 0, k.W, k.py(4), 150, 17, 1.25);
      moon(g, k.px(lx + 6.6), k.py(12.4), 1.0 * k.s, toHex(skyAt(SKY, 13.5)));
      hills(g, 0, k.W, k.py(ey), 3.2 * k.s, 23, "#2c3a74", null, 4);
      g.fillStyle = "#2a3568"; g.fillRect(0, k.py(ey), k.W, k.H);
    } else {
      cloud(g, k.px(lx - 9), k.py(12), 7 * k.s, 2); cloud(g, k.px(lx + 11), k.py(15), 8 * k.s, 6);
      hills(g, 0, k.W, k.py(ey), 3.2 * k.s, 23, toHex(mix("#8fa8cc", "#dbe8f4", 0.45)), null, 4);
      g.fillStyle = toHex(mix(PAL.earthHi, "#dbe8f4", 0.4)); g.fillRect(0, k.py(ey), k.W, k.H);
    }
  }));

  // ---- the tent: a front wall with the door painted on it, a low hip roof with a red scalloped fascia
  const x0 = T.x - T.w / 2, x1 = T.x + T.w / 2, RIDGE = Math.min(T.ridge, 3.0), DEPTH = 2 * (T.z - T.ridgeZ), FH = 0.3;
  const tFront = paint(2048, 704, (g, W, H) => {
    const r = rng(41), sx = W / T.w, sy = H / T.eaves, X = (x: number) => (x - x0) * sx, Y = (y: number) => H - y * sy;
    g.fillStyle = PAL.lWall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), 150 + 150 * r(), r() < 0.5 ? "#e9d9b4" : "#c7b188", 0.2);
    for (let i = 1; i < 8; i++) { const x = (W * i) / 8 + 20 * (r() - 0.5); const gr = g.createLinearGradient(x - 26, 0, x + 26, 0); gr.addColorStop(0, "rgba(255,250,230,0)"); gr.addColorStop(0.45, "rgba(255,250,230,0.3)"); gr.addColorStop(0.6, "rgba(150,120,90,0.22)"); gr.addColorStop(1, "rgba(150,120,90,0)"); g.fillStyle = gr; g.fillRect(x - 26, 0, 52, H); }
    // the valance under the eaves (paint: a band standing proud of the wall would be an ink sliver): red, gold scallops
    g.fillStyle = PAL.lRoofLo; g.fillRect(0, 0, W, FH * sy);
    g.fillStyle = PAL.gold; g.fillRect(0, 0, W, 0.045 * sy); for (let x = 0.2; x < T.w; x += 0.4) { g.beginPath(); g.arc(x * sx, 0.045 * sy, 0.13 * sx, 0, Math.PI); g.fill(); }
    g.fillStyle = css(PAL.inkLine, 0.85); g.fillRect(0, FH * sy - 3, W, 6);
    // the red band along the foot, a gold line over it
    g.fillStyle = PAL.lRoof; g.fillRect(0, Y(0.34), W, H - Y(0.34)); g.fillStyle = PAL.gold; g.fillRect(0, Y(0.37), W, 0.03 * sy);
    g.fillStyle = css(PAL.inkLine, 0.85); g.fillRect(0, Y(0.38), W, 5);
    // the door: a paler flap in a red binding, a slit down its middle, two toggles; by night the lamp inside shines through
    const dl = X(DR.at.x - DR.w / 2), dr = X(DR.at.x + DR.w / 2), dt = Y(DR.h), bw = 0.085 * sx;
    g.fillStyle = PAL.lRoof; g.fillRect(dl - bw, dt - bw, dr - dl + 2 * bw, H - dt + bw);
    if (night) { const gr = g.createLinearGradient(0, dt, 0, H); gr.addColorStop(0, "#ffd58c"); gr.addColorStop(0.55, "#ffe6b0"); gr.addColorStop(1, "#f0b870"); g.fillStyle = gr; } else g.fillStyle = "#f1e6c6";
    g.fillRect(dl, dt, dr - dl, H - dt);
    for (let i = 0; i < 3; i++) { const x = dl + (dr - dl) * (0.2 + 0.3 * i); const gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,0.28)"); gr.addColorStop(1, "rgba(160,120,80,0.0)"); g.fillStyle = gr; g.fillRect(x - 22, dt, 44, H - dt); }
    g.strokeStyle = css(PAL.inkLine, 0.9); g.lineWidth = 6; g.lineJoin = "round";
    g.strokeRect(dl, dt, dr - dl, H - dt + 10); g.strokeRect(dl - bw, dt - bw, dr - dl + 2 * bw, H - dt + bw + 10);
    g.beginPath(); g.moveTo((dl + dr) / 2, dt); g.lineTo((dl + dr) / 2, H); g.stroke();
    for (const y of [1.25, 0.7]) { g.fillStyle = PAL.lDark; g.fillRect((dl + dr) / 2 - 0.09 * sx, Y(y) - 0.022 * sy, 0.18 * sx, 0.044 * sy); g.strokeStyle = css(PAL.inkLine, 0.9); g.lineWidth = 4; g.strokeRect((dl + dr) / 2 - 0.09 * sx, Y(y) - 0.022 * sy, 0.18 * sx, 0.044 * sy); }
  });
  const mFront = flat("#ffffff", tFront, 0.92), mSide = flat(PAL.lWallLo, clothTex(43, { seams: 2 }), 0.92);
  B.add(mFront, new THREE.PlaneGeometry(T.w, T.eaves).translate(T.x, T.eaves / 2, T.z));
  B.add(mSide, boxG(x0, x1, 0, T.eaves - 0.02, T.z - DEPTH, T.z - 0.06));
  const rl = (T.w - DEPTH * 0.9) / 2, R = hipRoofG(x0, x1, T.z - DEPTH, T.z, T.eaves, RIDGE, T.x - rl, T.x + rl, T.ridgeZ);
  B.add(flat(PAL.lRoof, roofTex(45), 0.9), tile(R.front, 5, 1)); B.add(flat(PAL.lRoofLo), R.rest);

  // ---- the fire basket between the two marks (behind them); by day it is cold
  const fb = fireBasketG(F.h, F.r), mIron = flat(PAL.iron, null, 0.6);
  B.add(mIron, fb.legs.translate(F.at.x, 0, F.at.z)); B.add(mIron, fb.bowl.translate(F.at.x, 0, F.at.z));
  const mLog = flat(night ? "#5a3c2c" : "#4e4038");
  for (const [a, tilt] of [[0.3, 0.5], [2.4, 0.45], [4.4, 0.55]] as [number, number][]) B.add(mLog, limb(V(F.at.x - Math.cos(a) * 0.15, F.h - 0.08, F.at.z - Math.sin(a) * 0.15), V(F.at.x + Math.cos(a) * 0.17, F.h + 0.02 + tilt * 0.22, F.at.z + Math.sin(a) * 0.17), 0.05, 0.045, 8));
  let fire: ReturnType<typeof makeFlame> | null = null, glow: THREE.Mesh | null = null;
  if (night) {
    fire = makeFlame(0.62, 0.2); fire.group.position.set(F.at.x, F.h - 0.02, F.at.z); group.add(fire.group);
    glow = glowCard(1.25, "#ff9a48", 0.34); glow.position.set(F.at.x, F.h + 0.3, F.at.z - 0.3); group.add(glow);
  }

  // ---- the red banner on its pole
  anim.push(bannerPole(B, group, flat(PAL.woodLo), bannerMat(M, "l", 2.9, 0.64), Pl.at.x, Pl.at.z, Pl.h, 0.72, 2.1, 0.9, { side: 0.5 }).animate);

  B.flush(group, "campL.static"); NC.flush(group, "campL.nocast", false, true);
  const KF = 5.2;
  const rig = night
    ? lightRig(group, { dir: [-0.35, 0.6, 0.72], k: 0.95, col: "#aab6f4", at: [lx + 0.3, 0, -1], half: 7, hemi: ["#8a96dc", "#4c4460", 0.55], point: { col: "#ffac68", k: KF, at: [F.at.x, F.h + 0.55, F.at.z + 0.55], dist: 9 } })
    : lightRig(group, { dir: SUN_DIR, k: 2.4, col: "#ffe9c8", at: [lx + 0.3, 0, -1], half: 7, hemi: ["#ffffff", "#ffffff", 0.5] });
  return {
    group, tris: B.tris + NC.tris,
    animate(t) {
      for (const a of anim) a(t);
      if (fire && glow) { fire.animate(t); const lv = fire.level(t); rig.point.intensity = KF * lv; (glow.material as THREE.MeshBasicMaterial).opacity = 0.34 * lv; }
    },
  };
}

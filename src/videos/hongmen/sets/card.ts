// THE SAND TABLE of the Hongmen film (place "card", lines 3-4; CAMS.card3, card4, card4XY), built from layout.ts
// (CARD) with the outdoor kit (okit.ts). A pale board of sand that runs to the horizon under a paper-coloured sky,
// with ink-wash mountains far away: a MAP the real figures stand on as giant pieces.
//   LINE 3 (CARD.city): the capital's gate as a chest-high model: ONE grey solid (the wall, its battlements and the
//     gate tower's body are one extruded outline with one painting on the front, so there is no ledge and no second
//     surface anywhere), a slate hip roof. All of it grey: the red flag (a prop) is the only
//     colour. The battlements leave the wall's right end clear: CARD.city.socket is a free spot of the wall top.
//   LINE 4 (CARD.versus): two blocks of pawns, ONE PAWN = 10,000 MEN: 4 x 10 charcoal ones with purple helmets on a
//     lavender field under a purple 项 standard, 2 x 5 red ones on a pale red field under a red 刘 standard.
//     setArmies(rows40, rows10): how many ROWS of each block stand (front row first); the fractional part is the newest
//     row falling in from 0.5 m; null = the whole block stands. A pure function of its arguments.
// The contract of sets/index.ts: ONE group with the meshes AND the three lights; animate(t) is a pure function of t.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import * as L from "../layout";
import {
  V, PAL, Batch, boxG, hipRoofG, extrudeXY, uvXY, flatOf, paint, skyDome, skyAt, farCard, groundG, groundTex, mottle, soft, blotch, css, mix, toHex, lightRig, SUN_DIR, rng, clamp,
  type SkyStops, type G2,
} from "./okit";
import { type Built, pawnG, pawnHeadTex, bannerPole, bannerMat, hills, roofTex, DAY_CAST } from "./outdoor";

/** the paper sky by elevation (degrees) */
export const CARD_SKY: SkyStops = [[-6, "#ecdfba"], [3, "#eee2c0"], [24, "#f2e9cf"], [90, "#f5eedb"]];
export const CARD_BG = "#eee2c0";
export const CARD_AO = { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#3a3040" };
export const CARD_LOOK = { bg: CARD_BG, ao: CARD_AO, cast: DAY_CAST };

const SAND = "#d8c797", STONE = "#a7a299", STONE_LO = "#8d8982", SLATE = "#4a4f5e", CHARCOAL = "#4a4f5e", RED = "#c8322c", SKIN = "#f6d9bd";

export type CardSet = Built & {
  /** how many rows stand: (rows of the 40 block, 0..10; rows of the 10 block, 0..5); a fraction = the newest row in
   *  the air (it falls from 0.5 m and squashes on landing for half a row); null = the whole block */
  setArmies(rows40: number | null, rows10: number | null): void;
};

export function buildCard(M: Mats): CardSet {
  const group = new THREE.Group(); group.name = "card"; group.visible = false;
  const flat = flatOf(M), B = new Batch();
  const K = L.CARD, C = K.city, Wl = C.wall, A40 = K.versus.army40, A10 = K.versus.army10, KX = (K.board.x0 + K.board.x1) / 2 - 3;
  const fieldOf = (a: typeof A40, padX: number) => ({ x0: a.at.x - ((a.cols - 1) / 2) * a.dx - padX, x1: a.at.x + ((a.cols - 1) / 2) * a.dx + padX, z1: a.at.z + 0.42, z0: a.at.z - (a.rows - 1) * a.dz - 0.42 });
  const F40 = fieldOf(A40, 0.36), F10 = fieldOf(A10, 0.36);

  // ---- the board: sand with soft tone, the two camps' fields, the road out of the capital's gate
  const GC = { x: KX + 3, z: -4, size: 26 };
  const tG = groundTex(GC.x, GC.z, GC.size, 2048, SAND, (g, k) => {
    mottle(g, k.S, 91, "#e6d8ac", "#c9b684", 90, 0.14);
    const r = rng(93);
    const rr = (x0: number, z0: number, x1: number, z1: number, rad: number) => { g.beginPath(); g.roundRect(k.px(x0), k.pz(z0), (x1 - x0) * k.s, (z1 - z0) * k.s, rad * k.s); };
    const field = (f: typeof F40, fill: string, line: string) => {
      soft(g, 0.05 * k.s, () => { g.fillStyle = css(fill, 0.9); rr(f.x0, f.z0, f.x1, f.z1, 0.16); g.fill(); });
      for (let i = 0; i < 14; i++) blotch(g, k.px(f.x0 + (f.x1 - f.x0) * r()), k.pz(f.z0 + (f.z1 - f.z0) * r()), (0.25 + 0.3 * r()) * k.s, mix(fill, "#ffffff", 0.5), 0.22);
      // the field's border: a broad soft line (a thin hard one crawls where the board is seen at a low angle)
      soft(g, 0.012 * k.s, () => { g.strokeStyle = css(line, 0.7); g.lineWidth = 0.075 * k.s; rr(f.x0 + 0.08, f.z0 + 0.08, f.x1 - 0.08, f.z1 - 0.08, 0.11); g.stroke(); });
    };
    field(F40, "#cbbedb", "#7d5fb4");
    field(F10, "#eec0b0", "#c4493f");
    // the road: out of the gate's arch toward the viewer, a little wider as it comes
    const ax = Wl.at.x, az = Wl.at.z + Wl.d / 2;
    soft(g, 0.06 * k.s, () => {
      g.fillStyle = css("#eadfb9", 0.95);
      g.beginPath(); g.moveTo(k.px(ax - 0.26), k.pz(az)); g.lineTo(k.px(ax + 0.26), k.pz(az)); g.lineTo(k.px(ax + 0.6), k.pz(az + 9)); g.lineTo(k.px(ax - 0.6), k.pz(az + 9)); g.closePath(); g.fill();
    });
    // the wall's line on the map, running on to the left of the model
    soft(g, 0.03 * k.s, () => { g.fillStyle = css("#b5ab95", 0.8); g.fillRect(k.px(ax - Wl.w / 2 - 6), k.pz(Wl.at.z - 0.14), 6 * k.s, 0.28 * k.s); });
  });
  const ground = new THREE.Mesh(groundG(GC.x, GC.z, GC.size), flat("#ffffff", tG, 0.95)); ground.receiveShadow = true; ground.name = "card.ground"; group.add(ground);

  // ---- the sky and the far view: paper, with two ranges of ink-wash mountains on the horizon
  group.add(skyDome(V(KX, 0, 0), CARD_SKY));
  const CZ = -104, ey = 1.48, Dc = 3.5 - CZ, far = (c: string, kk: number) => css(mix(c, CARD_BG, kk));
  group.add(farCard(KX - 70, KX + 76, -3, 70, CZ, 2048, 1024, (g, k) => {
    for (let y = 0; y < k.H; y++) { const yw = 70 - (73 * (y + 0.5)) / k.H; g.fillStyle = css(skyAt(CARD_SKY, (Math.atan2(yw - ey, Dc) * 180) / Math.PI)); g.fillRect(0, y, k.W, 1); }
    hills(g, 0, k.W, k.py(ey), 15 * k.s, 95, far("#b9b7a6", 0.45), null, 6);
    hills(g, 0, k.W, k.py(ey), 8 * k.s, 96, far("#c2b48a", 0.35), null, 9);
    const gr = g.createLinearGradient(0, k.py(ey), 0, k.py(-3));
    gr.addColorStop(0, far("#e4d6ab", 0.2)); gr.addColorStop(1, far("#e0d1a4", 0));
    g.fillStyle = gr; g.fillRect(0, k.py(ey), k.W, k.H);
  }));

  // ---- the capital's gate: the wall, its battlements and the tower's body are ONE solid with one painting
  const x0 = Wl.at.x - Wl.w / 2, x1 = Wl.at.x + Wl.w / 2, zf = Wl.at.z + Wl.d / 2, zb = Wl.at.z - Wl.d / 2, h = Wl.h;
  const tx0 = Wl.at.x - 0.2 - C.tower.w / 2, tx1 = tx0 + C.tower.w, th = h + C.tower.h, mh = h + 0.14, TOP = th;
  // the outline, counter-clockwise: the right end of the wall top stays flat (the flag's socket), two merlons, the tower, one merlon
  const outline: [number, number][] = [
    [x0, 0], [x1, 0], [x1, h], [x1 - 0.24, h], [x1 - 0.24, mh], [x1 - 0.34, mh], [x1 - 0.34, h], [x1 - 0.42, h], [x1 - 0.42, mh], [x1 - 0.52, mh], [x1 - 0.52, h],
    [tx1, h], [tx1, th], [tx0, th], [tx0, h], [x0 + 0.11, h], [x0 + 0.11, mh], [x0, mh],
  ];
  const TW = 1632, TH = Math.round((TW * TOP) / Wl.w);
  const tWall = paint(TW, TH, (g: G2, W, H) => {
    const r = rng(97), sx = W / Wl.w, sy = H / TOP, X = (x: number) => (x - x0) * sx, Y = (y: number) => H - y * sy;
    g.fillStyle = STONE; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), 60 + 90 * r(), r() < 0.5 ? "#b6b1a8" : "#98948c", 0.25);
    // stone courses: broad soft joints (0.125 m courses), a darker foot, a paler coping under the battlements
    g.strokeStyle = css(STONE_LO, 0.55); g.lineWidth = 0.012 * sx; g.lineCap = "round";
    for (let c = 1; c < 8; c++) {
      const y = c * 0.125; g.beginPath(); g.moveTo(0, Y(y)); g.lineTo(W, Y(y)); g.stroke();
      for (let q = 0; q < 8; q++) { const x = x0 + (q + (c % 2) * 0.5 + 0.1 * (r() - 0.5)) * 0.25; g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x), Y(y - 0.125)); g.stroke(); }
    }
    g.fillStyle = css(STONE_LO, 0.55); g.fillRect(0, Y(0.1), W, 0.1 * sy);
    g.fillStyle = css("#c2bdb3", 0.9); g.fillRect(0, Y(h + 0.14), W, 0.2 * sy);
    // the arch: a dark reveal, two plank doors with bronze studs (no red: the flag is the only red thing here)
    const aw = C.arch.w, ah = C.arch.h, ax = Wl.at.x;
    const arch = (w: number, hh: number) => { g.beginPath(); g.moveTo(X(ax - w / 2), Y(0)); g.lineTo(X(ax - w / 2), Y(hh - w / 2)); g.arc(X(ax), Y(hh - w / 2), (w / 2) * sx, Math.PI, 0); g.lineTo(X(ax + w / 2), Y(0)); g.closePath(); };
    g.fillStyle = "#c9c4ba"; arch(aw + 0.12, ah + 0.06); g.fill();
    g.fillStyle = "#3c3936"; arch(aw, ah); g.fill();
    g.save(); arch(aw - 0.05, ah - 0.025); g.clip();
    g.fillStyle = "#6a5b4c"; g.fillRect(X(ax - aw / 2), Y(ah), aw * sx, ah * sy);
    g.fillStyle = "#3c3936"; g.fillRect(X(ax) - 0.008 * sx, Y(ah), 0.016 * sx, ah * sy);
    g.fillStyle = "#b89a5c";
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.beginPath(); g.arc(X(ax + s * (0.07 + j * 0.085)), Y(0.12 + i * 0.13), 0.016 * sx, 0, 7); g.fill(); }
    g.restore();
    // the tower's body above the wall top: pale plaster between dark posts, a row of window slots, a dark sill
    g.fillStyle = "#cfc9ba"; g.fillRect(X(tx0), Y(th), (tx1 - tx0) * sx, (th - h) * sy);
    g.fillStyle = SLATE; g.fillRect(X(tx0), Y(h + 0.07), (tx1 - tx0) * sx, 0.07 * sy);
    for (let i = 0; i <= 4; i++) { const x = tx0 + (i / 4) * (tx1 - tx0 - 0.05); g.fillRect(X(x), Y(th), 0.05 * sx, (th - h) * sy); }
    g.fillStyle = "#3c3936";
    for (let i = 0; i < 4; i++) { const x = tx0 + 0.05 + (i + 0.5) * ((tx1 - tx0 - 0.05) / 4) - 0.025; g.fillRect(X(x - 0.045), Y(h + 0.36), 0.09 * sx, 0.17 * sy); }
  });
  const gateG = uvXY(extrudeXY(outline, zb, zf), x0, x1, 0, TOP);
  const gate = new THREE.Mesh(gateG, flat("#ffffff", tWall, 0.9)); gate.castShadow = gate.receiveShadow = true; gate.name = "card.gate"; group.add(gate);
  // the tower's roof: slate, hipped, overhanging 0.13 m, sunk 1 cm into the body
  const mRoof = flat(SLATE, roofTex(99), 0.85), mRoofF = flat(toHex(mix(SLATE, "#ffffff", 0.1)), roofTex(99), 0.85);
  { const o = 0.13, R = hipRoofG(tx0 - o, tx1 + o, zb - o, zf + o, th - 0.01, th + C.tower.roof, tx0 + 0.2, tx1 - 0.2, Wl.at.z); B.add(mRoofF, R.front); B.add(mRoof, R.rest); }

  // ---- the two camps' standards (a pole with a cross bar, the banner hanging from it) beside their blocks
  const mPole = flat(PAL.woodDark), mX = bannerMat(M, "x", 1.8), mL = bannerMat(M, "l", 1.8);
  const banners = [
    bannerPole(B, group, mPole, mX, F40.x0 - 0.1, A40.at.z - 2.3, 2.5, 0.52, 0.94, 0.4, { r: 0.04, amp: 0.035 }),
    bannerPole(B, group, mPole, mL, F10.x1 + 0.3, A10.at.z - 1.3, 2.2, 0.44, 0.8, 2.1, { r: 0.04, amp: 0.035 }),
  ];
  B.flush(group, "card.static");

  // ---- the armies: one group per ROW (its pawns' bodies in one mesh, their heads in another), built round the row's
  // own centre so that a row can fall and squash
  const headTex = (body: string, helmet: string) => pawnHeadTex(toHex(mix(SKIN, body, 0.15)), helmet);
  const block = (a: typeof A40, body: string, helmet: string, name: string) => {
    const mBody = flat(body), mHead = flat("#ffffff", headTex(body, helmet), 0.8), rows: THREE.Group[] = [];
    for (let rw = 0; rw < a.rows; rw++) {
      const BR = new Batch(), row = new THREE.Group(); row.name = `${name}.row${rw}`; row.position.set(a.at.x, 0, a.at.z - rw * a.dz);
      for (let i = 0; i < a.cols; i++) { const p = pawnG((i - (a.cols - 1) / 2) * a.dx, 0); BR.add(mBody, p.body); BR.add(mHead, p.head); }
      BR.flush(row, name); B.tris += BR.tris; group.add(row); rows.push(row);
    }
    return rows;
  };
  const rows40 = block(A40, CHARCOAL, "#5a3a9a", "card.army40"), rows10 = block(A10, RED, "#8a1f1c", "card.army10");
  const pose = (rows: THREE.Group[], n: number | null) => rows.forEach((row, i) => {
    const k = n === null ? 99 : n - i;
    row.visible = k > 0;
    const u = clamp(k), sq = k >= 1 && k < 1.5 ? 1 : 0;
    row.position.y = 0.5 * (1 - u * u);
    row.scale.set(1 + 0.05 * sq, 1 - 0.14 * sq, 1 + 0.05 * sq);
  });
  const setArmies = (a: number | null, b: number | null) => { pose(rows40, a); pose(rows10, b); };
  setArmies(null, null);

  lightRig(group, { dir: SUN_DIR, k: 2.2, col: "#fff1dc", at: [KX + 3, 0, -2], half: 9.5, hemi: ["#ffffff", "#ffffff", 0.5] });
  const animate = (t: number) => { for (const b of banners) b.animate(t); };
  animate(0);
  return { group, animate, tris: B.tris, setArmies };
}

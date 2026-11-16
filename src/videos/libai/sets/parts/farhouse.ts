// THE FAR HOUSE (WP2a, for WP2b's river place, G): a low-detail copy of the yard's house on 白鹤峰 as seen from the
// river far below (about 90 m off: some 70 px wide at 540): the cream walls with the timber frame painted, the grey
// gable roof out over the veranda, the dark door with the board's gold patch, the fence line with the red gate, the
// lychee tree's crown with red dots, a few bamboo clumps behind, and THE LANTERN: a warm dot under the eave
// (setLantern 0..1: its glow).
// ORIGIN = the yard's middle on the plateau (layout/yard.ts YX, y 0, z 0), FACING +z (the river side): place it with
// group.position / rotation.y (e.g. at layout/river.ts RIVER_SET.house, turned toward the river camera). Everything is
// NOINK, flat-coloured, unshadowed (no ink lines or flicker at that distance); the numbers are the yard's own
// (YARD_SET, YARD), so the copy matches the set.
import * as THREE from "three";
import type { Kit } from "../../../../kit/props/kit";
import { NOINK, paint } from "../../../../kit/sets/okit";
import { YARD_SET as S, YARD, YX } from "../../layout/yard";
import { glowSprite } from "./common";
import { blobG } from "./town";

export type FarHouse = { group: THREE.Group; setLantern(k: number): void };

export function makeFarHouse(K: Kit): FarHouse {
  const group = new THREE.Group(); group.name = "far-house";
  const fl = (c: string) => K.flat(c, { rough: 0.9 });
  const add = (g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], name = "far-house") => { const x = new THREE.Mesh(g, m); x.name = name; x.layers.set(NOINK); x.castShadow = false; x.receiveShadow = false; group.add(x); return x; };
  const Hs = S.house, x0 = Hs.x0 - YX, x1 = Hs.x1 - YX, w = x1 - x0, d = Hs.z1 - Hs.z0, zF = Hs.z1, zE = Hs.eave.z, zB = Hs.z0 - (zE - zF), zM = (zE + zB) / 2;
  // the walls (a box) with the front painted: the timber frame, the door, the two windows, the board's gold patch
  const front = paint(256, 96, (g, W, H) => {
    const m = W / w, X = (x: number) => (x - x0) * m, Y = (y: number) => H - y * m;
    g.fillStyle = "#f2e8d0"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#a8a49a"; g.fillRect(0, Y(0.32), W, 0.32 * m);
    g.fillStyle = "#c89a64"; for (const x of [-3.92, -3.0, -1.02, 1.02, 3.0, 3.92]) g.fillRect(X(x) - 0.09 * m, 0, 0.18 * m, H); g.fillRect(0, Y(2.9), W, 0.18 * m);
    g.fillStyle = "#6a4a34"; g.fillRect(X(S.door.x - YX - S.door.w / 2), Y(S.door.h), S.door.w * m, S.door.h * m);
    g.fillStyle = "#e8d8b0"; for (const wx of S.windows.x) g.fillRect(X(wx - YX - S.windows.w / 2), Y(S.windows.y1), S.windows.w * m, (S.windows.y1 - S.windows.y0) * m);
    g.fillStyle = "#3a2c22"; g.fillRect(X(-S.board.w / 2), Y(S.board.y + S.board.h / 2), S.board.w * m, S.board.h * m);
    g.fillStyle = "#ecc462"; g.fillRect(X(-S.board.w / 2) + 3, Y(S.board.y + S.board.h / 2) + 3, S.board.w * m - 6, S.board.h * m - 6);
  });
  const wallH = 3.5, walls = fl("#efe2c6");
  add(new THREE.BoxGeometry(w, wallH, d).translate((x0 + x1) / 2, wallH / 2, (Hs.z0 + Hs.z1) / 2), [walls, walls, walls, walls, K.flat("#ffffff", { map: front, rough: 0.9 }), walls]);
  // the roof: two slopes (front out over the veranda) and the gable triangles
  const roof = fl("#6e7380"), o = 0.45, yE = Hs.eave.y, yR = Hs.ridge;
  const slope = (za: number, zb: number) => {
    const g = new THREE.BufferGeometry(), P = [[x0 - o, yE, za], [x1 + o, yE, za], [x1 + o, yR, zb], [x0 - o, yR, zb]];
    g.setAttribute("position", new THREE.Float32BufferAttribute(P.flat(), 3)); g.setIndex(za > zb ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]); g.computeVertexNormals(); return g;
  };
  add(slope(zE, zM), roof); add(slope(zB, zM), roof);
  add(new THREE.BoxGeometry(w + 2 * o, 0.22, 0.28).translate((x0 + x1) / 2, yR + 0.05, zM), fl("#565a66"));
  for (const x of [x0, x1]) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([x, wallH, Hs.z0, x, wallH, Hs.z1, x, yR - 0.1, zM], 3)); g.setIndex(x < 0 ? [0, 1, 2] : [0, 2, 1]); g.computeVertexNormals(); add(g, walls); }
  for (const x of S.veranda.posts) add(new THREE.CylinderGeometry(0.1, 0.1, S.veranda.beam[1], 6).translate(x - YX, S.veranda.beam[1] / 2, S.veranda.z), fl("#c89a64"));
  // the fence line and the red gate
  const F = S.fence, fence = fl("#a88a62");
  add(new THREE.BoxGeometry(F.x1 - F.x0, 0.9, 0.08).translate((F.x0 + F.x1) / 2 - YX, 0.55, F.z), fence);
  for (const x of [F.x0, F.x1]) add(new THREE.BoxGeometry(0.08, 0.9, F.z - Hs.z1).translate(x - YX, 0.55, (F.z + Hs.z1) / 2), fence);
  const gx = S.gate.x - YX; add(new THREE.BoxGeometry(S.gate.w + 0.6, 0.3, 0.3).translate(gx, 2.2, F.z + 0.01), fl("#9a4a36")); for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.18, 2.2, 0.18).translate(gx + (s * (S.gate.w + 0.2)) / 2, 1.1, F.z + 0.01), fl("#9a4a36"));
  // the lychee tree (a few blobs, red dots painted on) and bamboo clumps behind the house
  const dots = paint(128, 128, (g, W) => { g.fillStyle = "#4e8a48"; g.fillRect(0, 0, W, W); g.fillStyle = "#d8343a"; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(((i * 37) % 128), ((i * 61) % 128), 3.2, 0, 7); g.fill(); } }, true);
  const crown = K.flat("#ffffff", { map: dots, rough: 0.9 }), L = S.lychee, lx = L.x - YX;
  add(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 6).translate(lx, 1.1, L.z), fl("#6a5444"));
  for (const [dx, y, dz, r] of [[0, 4.4, 0, 2.2], [1.4, 3.8, 0.8, 1.5], [-1.3, 3.9, 0.6, 1.5]] as [number, number, number, number][]) add(blobG(901 + dx * 10, 1, 0.2).scale(r, r * 0.75, r).translate(lx + dx, y, L.z + dz), crown);
  const bamboo = fl("#6a9a58");
  for (const [x, z, r, h] of [[-5, -12.5, 2.4, 8.4], [-1, -13.5, 2.8, 9.2], [3.5, -13, 2.6, 8.8], [7, -11.8, 2.0, 7.4]] as [number, number, number, number][]) add(blobG(911 + x, 1, 0.25).scale(r, h / 2, r).translate(x, h / 2, z), bamboo);
  // THE LANTERN: a warm dot under the eave (YARD.lantern) and its glow
  const Lp = YARD.lantern, lamp = new THREE.MeshBasicMaterial({ color: "#ff9a50", fog: false });
  add(new THREE.SphereGeometry(0.22, 10, 8).translate(Lp.x - YX, Lp.y - 0.25, Lp.z + 0.1), lamp, "far-house.lantern");
  const glow = glowSprite(1.6, "#ffb070", 0.7); glow.position.set(Lp.x - YX, Lp.y - 0.25, Lp.z + 0.4); group.add(glow);
  return {
    group,
    setLantern(k: number) { const s = Math.max(0, Math.min(1, k)); lamp.color.set("#ff9a50").multiplyScalar(0.35 + 0.65 * s); (glow.material as THREE.MeshBasicMaterial).opacity = 0.7 * s; },
  };
}

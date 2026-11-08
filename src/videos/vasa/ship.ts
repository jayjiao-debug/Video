// The cartoon Vasa: hull lofted from halfW(x, y), stepped decks, bulkheads, a carved stern, three masts with furled
// sails, rigging, flags. Everything sits in one group in ship-local metres (bow at +x, river side +z, water at y = 0);
// world.ts places the group at (0, 0, ZS) and rolls it about the x axis through ROLL_Y.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad } from "./build";
import { ctex, rep, beam, planksHD } from "./paint";
import { twoTone } from "./shade";
import { NOINK } from "./ink";
import { halfW, deckY, sheerY, HALF_BEAM } from "./story";

const KEEL = -4.6, X0 = -20, X1 = 20;
const HULL_V0 = KEEL, HULL_V1 = 14; // texture v spans keel .. 14 m

// ---------------- painted textures ----------------
const INK = "#1b1216";
const PORTS_X = [-13.8, -11.3, -8.8, -6.3, -3.8, -1.3, 1.2, 3.7, 6.2, 8.7, 11.2];
const PORT_ROWS = [1.55, 3.85]; // lower and upper gun deck port centres (m above water)
const hullTex = (rows: number) => ctex(`vasaHull${rows}`, 4096, 1434, (g, r) => {
  const W = 4096, H = 1434, X = (x: number) => ((x - X0) / (X1 - X0)) * W, Y = (y: number) => H - ((y - HULL_V0) / (HULL_V1 - HULL_V0)) * H;
  const ppm = W / (X1 - X0);
  // planking: warm dark brown with lighter strakes
  g.fillStyle = "#6b4528"; g.fillRect(0, 0, W, H);
  for (let y = HULL_V0; y < HULL_V1; y += 0.32) {
    g.fillStyle = r() < 0.5 ? "#73492b" : "#623e24";
    g.fillRect(0, Y(y + 0.32), W, 0.32 * ppm - 2);
    g.fillStyle = "rgba(30,15,10,0.55)"; g.fillRect(0, Y(y) - 2, W, 3);
    // butt joints
    for (let x = X0 + r() * 4; x < X1; x += 3 + r() * 3) g.fillRect(X(x), Y(y + 0.32), 3, 0.32 * ppm);
  }
  // below the waterline: dark tarred bottom
  g.fillStyle = "#3b2f2a"; g.fillRect(0, Y(0.05), W, H - Y(0.05));
  g.fillStyle = "#2a201d"; g.fillRect(0, Y(0.05), W, 6);
  // wales: thick dark bands
  for (const y of [0.5, 2.7, 5.0]) { g.fillStyle = "#3e2716"; g.fillRect(0, Y(y + 0.22), W, 0.22 * ppm); g.fillStyle = INK; g.fillRect(0, Y(y + 0.22), W, 4); g.fillRect(0, Y(y), W, 4); }
  // upper works: red with a gold band and gold scrolls
  g.fillStyle = "#a8322a"; g.fillRect(0, 0, W, Y(5.35));
  g.fillStyle = "#d9a93a"; g.fillRect(0, Y(5.75), W, 0.22 * ppm); g.fillStyle = INK; g.fillRect(0, Y(5.75), W, 3); g.fillRect(0, Y(5.53), W, 3);
  for (let x = -19; x < 18; x += 1.6) {
    const cx = X(x), cy = Y(7.4);
    g.strokeStyle = "#e3b84a"; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, 0.42 * ppm, 0.2, Math.PI * 1.6); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 0.42 * ppm + 5, 0.2, Math.PI * 1.6); g.stroke();
  }
  for (const y of [9.4, 11.4]) { g.fillStyle = "#d9a93a"; g.fillRect(0, Y(y + 0.16), W, 0.16 * ppm); g.fillStyle = INK; g.fillRect(0, Y(y + 0.16), W, 3); }
  // gun ports
  const s = 0.78 * ppm;
  for (const [ri, py] of PORT_ROWS.entries()) for (const px of PORTS_X) {
    const x = X(px) - s / 2, y = Y(py) - s / 2, open = ri < rows;
    if (open) {
      g.fillStyle = "#120c0c"; g.fillRect(x, y, s, s);
      g.fillStyle = "#2b2b30"; g.beginPath(); g.ellipse(x + s / 2, y + s / 2, s * 0.22, s * 0.22, 0, 0, 7); g.fill(); // muzzle
      g.fillStyle = "#c23a2e"; g.fillRect(x - 4, y - s * 0.95, s + 8, s * 0.82); // lid swung up
      g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(x - 4, y - s * 0.95, s + 8, s * 0.82);
      g.fillStyle = "#e3b84a"; g.beginPath(); g.arc(x + s / 2, y - s * 0.55, s * 0.18, 0, 7); g.fill();
    } else {
      g.fillStyle = "#c23a2e"; g.fillRect(x, y, s, s);
      g.fillStyle = "#e3b84a"; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.2, 0, 7); g.fill(); // lion mask, simplified
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.2, 0, 7); g.stroke();
    }
    g.strokeStyle = "#d9a93a"; g.lineWidth = 10; g.strokeRect(x - 6, y - 6, s + 12, s + 12);
    g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(x - 11, y - 11, s + 22, s + 22);
  }
  // stern windows on the quarter
  for (const [wx, wy] of [[-18.2, 9.9], [-16.8, 9.9], [-18.2, 11.9], [-16.8, 11.9]]) {
    g.fillStyle = "#e3b84a"; g.fillRect(X(wx) - 0.5 * ppm, Y(wy) - 0.45 * ppm, ppm, 0.9 * ppm);
    g.fillStyle = "#28344a"; g.fillRect(X(wx) - 0.38 * ppm, Y(wy) - 0.33 * ppm, 0.76 * ppm, 0.66 * ppm);
    g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(X(wx) - 0.5 * ppm, Y(wy) - 0.45 * ppm, ppm, 0.9 * ppm);
  }
});
/** the carved stern (transom): red, gold frames, windows, the royal arms, two lions */
const sternTex = () => ctex("vasaStern", 1024, 1400, (g) => {
  const W = 1024, H = 1400;
  g.fillStyle = "#a8322a"; g.fillRect(0, 0, W, H);
  const gold = (x: number, y: number, w: number, h: number) => { g.fillStyle = "#d9a93a"; g.fillRect(x, y, w, h); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(x, y, w, h); };
  // frames
  gold(0, 1180, W, 40); gold(0, 860, W, 34); gold(0, 520, W, 34); gold(0, 150, W, 30);
  // window rows
  for (const y of [940, 600]) for (let i = 0; i < 5; i++) {
    const x = 90 + i * 180;
    gold(x, y, 120, 180); g.fillStyle = "#28344a"; g.fillRect(x + 18, y + 18, 84, 144);
    g.strokeStyle = "#d9a93a"; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 60, y + 18); g.lineTo(x + 60, y + 162); g.moveTo(x + 18, y + 90); g.lineTo(x + 102, y + 90); g.stroke();
  }
  // royal arms: blue shield with three crowns, gold mantling
  g.fillStyle = "#e3b84a"; g.beginPath(); g.ellipse(W / 2, 330, 260, 150, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.fillStyle = "#2a5aa8"; g.beginPath(); g.moveTo(W / 2 - 110, 220); g.lineTo(W / 2 + 110, 220); g.lineTo(W / 2 + 110, 360); g.quadraticCurveTo(W / 2, 470, W / 2 - 110, 360); g.closePath(); g.fill(); g.stroke();
  for (const [x, y] of [[W / 2 - 50, 270], [W / 2 + 50, 270], [W / 2, 350]]) {
    g.fillStyle = "#f2c94c"; g.beginPath(); g.moveTo(x - 30, y + 18); g.lineTo(x - 30, y - 8); g.lineTo(x - 15, y + 4); g.lineTo(x, y - 14); g.lineTo(x + 15, y + 4); g.lineTo(x + 30, y - 8); g.lineTo(x + 30, y + 18); g.closePath(); g.fill();
    g.lineWidth = 4; g.stroke();
  }
  // lions either side
  for (const s of [-1, 1]) {
    const x = W / 2 + s * 360;
    g.fillStyle = "#e3b84a"; g.beginPath(); g.ellipse(x, 330, 70, 110, 0, 0, 7); g.fill(); g.lineWidth = 6; g.stroke();
    g.beginPath(); g.ellipse(x, 230, 56, 50, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(x - 18, 222, 7, 0, 7); g.arc(x + 18, 222, 7, 0, 7); g.fill();
  }
  // top cresting scrolls
  for (let i = 0; i < 7; i++) { const x = 70 + i * 147; g.strokeStyle = "#e3b84a"; g.lineWidth = 16; g.beginPath(); g.arc(x, 90, 42, Math.PI, 2 * Math.PI); g.stroke(); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x, 90, 50, Math.PI, 2 * Math.PI); g.stroke(); }
});
const bulkTex = (key: string) => ctex(key, 1024, 256, (g) => {
  g.fillStyle = "#a8322a"; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#d9a93a"; g.fillRect(0, 0, 1024, 22); g.fillStyle = INK; g.fillRect(0, 22, 1024, 4);
  for (const x of [300, 680]) { g.fillStyle = "#5a3820"; g.fillRect(x, 70, 80, 186); g.strokeStyle = "#d9a93a"; g.lineWidth = 8; g.strokeRect(x, 70, 80, 186); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - 5, 65, 90, 196); }
});
export const swedenFlag = () => ctex("swedenFlag", 512, 320, (g) => {
  g.fillStyle = "#2b63b5"; g.fillRect(0, 0, 512, 320);
  g.fillStyle = "#f6cc33"; g.fillRect(150, 0, 56, 320); g.fillRect(0, 132, 512, 56);
  // swallow tail: cut a triangle out of the fly end
  g.globalCompositeOperation = "destination-out"; g.beginPath(); g.moveTo(512, 0); g.lineTo(512, 320); g.lineTo(380, 160); g.closePath(); g.fill();
  g.globalCompositeOperation = "source-over";
});

// ---------------- geometry ----------------
/** the hull side as a lofted grid (one side; mirrored for the other) */
const hullSide = (side: 1 | -1) => {
  const NX = 96, NY = 26, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NX; i++) {
    const x = X0 + ((X1 - X0) * i) / NX, top = sheerY(x);
    for (let j = 0; j <= NY; j++) {
      const y = KEEL + ((top - KEEL) * j) / NY, w = halfW(x, Math.min(y, 14));
      pos.push(x, y, side * w);
      uv.push((x - X0) / (X1 - X0), (y - HULL_V0) / (HULL_V1 - HULL_V0));
    }
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
    const a = i * (NY + 1) + j, b = (i + 1) * (NY + 1) + j, c = b + 1, d = a + 1;
    if (side > 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** inner face of the bulwark above a deck (so the rail has a thickness the ink can see) */
const bulwarkInner = (side: 1 | -1) => {
  const NX = 96, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NX; i++) {
    const x = X0 + 0.3 + ((X1 - 0.6 - X0) * i) / NX, y0 = deckY(x), y1 = sheerY(x), w = halfW(x, y1) - 0.18;
    pos.push(x, y0, side * w, x, y1, side * w);
    uv.push(x / 3, 0, x / 3, (y1 - y0) / 3);
  }
  for (let i = 0; i < NX; i++) { const a = i * 2, b = a + 2, c = a + 3, d = a + 1; if (side > 0) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** v3: a flat end face that follows the hull section at x from y0 to y1, facing -x (dir -1, the stern) or +x;
 *  uv: u across (0 at +z), v up */
const endFace = (x: number, y0: number, y1: number, dir: 1 | -1, n = 24) => {
  const pos: number[] = [], uv: number[] = [], nrm: number[] = [];
  const at = (j: number) => { const y = y0 + ((y1 - y0) * j) / n; return { y, w: halfW(x, Math.min(y, 14)), v: j / n }; };
  for (let j = 0; j < n; j++) {
    const A = at(j), B = at(j + 1);
    const p = [[x, A.y, A.w], [x, A.y, -A.w], [x, B.y, -B.w], [x, A.y, A.w], [x, B.y, -B.w], [x, B.y, B.w]];
    const t = [[0, A.v], [1, A.v], [1, B.v], [0, A.v], [1, B.v], [0, B.v]];
    const order = dir < 0 ? [0, 2, 1, 3, 5, 4] : [0, 1, 2, 3, 4, 5];
    for (const k of order) { pos.push(...p[k]); uv.push(...t[k]); nrm.push(dir, 0, 0); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
};
/** v3: the cap along the top of the bulwark (outer skin to inner face), so the rail reads solid from above */
const railCap = (side: 1 | -1) => {
  const NX = 160, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NX; i++) {
    const x = X0 + ((X1 - X0) * i) / NX, y = sheerY(x), wo = halfW(x, Math.min(y, 14)), wi = Math.max(0, wo - 0.2);
    pos.push(x, y, side * wo, x, y, side * wi);
    uv.push(x / 3, 0, x / 3, 0.1);
  }
  for (let i = 0; i < NX; i++) { const a = i * 2, b = a + 2, c = a + 3, d = a + 1; if (side > 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** v3: the flat bottom along the keel (the two sides stop 0.7 m apart there) */
const keelStrip = () => {
  const NX = 96, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NX; i++) { const x = X0 + ((X1 - X0) * i) / NX, w = halfW(x, KEEL); pos.push(x, KEEL, -w, x, KEEL, w); uv.push(i / NX, 0, i / NX, 0.02); }
  for (let i = 0; i < NX; i++) { const a = i * 2, b = a + 2, c = a + 3, d = a + 1; idx.push(a, b, c, a, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** flat deck at height y between x0 and x1 */
const deck = (x0: number, x1: number, y: number) => {
  const NX = 40, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NX; i++) {
    const x = x0 + ((x1 - x0) * i) / NX, w = Math.max(0.05, halfW(x, y) - 0.15);
    pos.push(x, y, -w, x, y, w);
    uv.push(x / 6, -w / 6, x / 6, w / 6);
  }
  for (let i = 0; i < NX; i++) { const a = i * 2, b = a + 2, c = a + 3, d = a + 1; idx.push(a, d, c, a, c, b); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const cyl = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1 = r0, seg = 10) => {
  const g = new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), seg);
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1));
  return g.applyMatrix4(m);
};

export type Mast = { x: number; top: number; yards: [number, number][] }; // yards: [height, half length]
export const MASTS: Mast[] = [
  { x: 11.5, top: 40, yards: [[17, 8.5], [28, 6], [36, 3.6]] },
  { x: 0.8, top: 49, yards: [[19, 10], [32, 7], [43, 4.2]] },
  { x: -12.5, top: 33, yards: [[18, 6], [27, 4]] },
];

export class Ship {
  group = new THREE.Group();
  flags: { m: THREE.Mesh; w: number; h: number; base: THREE.Vector3; k: number }[] = [];
  private hullMats: THREE.Material[];
  /** barrels behind each open port: [row][port][side] */
  guns: THREE.Mesh[][][] = [];
  sails: { m: THREE.Mesh; w: number; h: number }[] = [];
  private hulls: THREE.Mesh[] = [];
  cannons: THREE.Group[] = [];
  constructor() {
    const G = this.group, b = new Batch();
    this.hullMats = [0, 1, 2].map((n) => lam(`vasaHull${n}M`, () => ({ map: hullTex(n) })));
    for (const m of this.hullMats) { const t = (m as THREE.MeshLambertMaterial).map!; t.anisotropy = 16; t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; }
    const closed = this.hullMats[0];
    for (const s of [1, -1] as const) {
      const h = new THREE.Mesh(hullSide(s), closed); h.castShadow = true; h.receiveShadow = true; this.hulls.push(h); G.add(h);
    }
    const red = lam("vasaRed", () => ({ color: "#a8322a" })), gold = lam("vasaGold", () => ({ color: "#d9a93a" })), dark = lam("vasaDark", () => ({ color: "#4a3020" }));
    const wood = lam("wood", () => ({ map: beam() }));
    const deckM = lam("planksHD", () => ({ map: planksHD() }));
    for (const s of [1, -1] as const) { b.add(bulwarkInner(s), red); b.add(railCap(s), red); }
    // decks
    b.add(deck(-19.6, -15, 10.5), deckM); b.add(deck(-15, -8, 8.0), deckM); b.add(deck(-8, 10, 5.5), deckM); b.add(deck(10, 19.3, 7.0), deckM);
    // bulkheads (deck steps), painted with doors
    const bulk = lam("vasaBulk", () => ({ map: bulkTex("vasaBulkT") }));
    for (const [x, y0, y1, face] of [[-15, 8.0, 10.5, 1], [-8, 5.5, 8.0, 1], [10, 5.5, 7.0, -1]] as const) {
      const w = halfW(x, y1) - 0.15;
      b.add(face > 0 ? quad(V(x, y0, w), V(x, y0, -w), V(x, y1, -w), V(x, y1, w)) : quad(V(x, y0, -w), V(x, y0, w), V(x, y1, w), V(x, y1, -w)), bulk);
      // rail along the step edge
      b.add(boxGeo(V(x - 0.12, y1, -w), V(x + 0.12, y1 + 0.9, w)), gold);
    }
    // the transom (stern face): v3 follows the hull section all the way down and faces aft (v2's faced the bow, so
    // from astern it was culled and the stern looked open)
    const ys0 = 2.0, ys1 = sheerY(X0);
    b.add(endFace(X0, ys0, ys1, -1), lam("vasaStern", () => ({ map: sternTex() })));
    b.add(endFace(X0, KEEL, ys0, -1), dark);
    b.add(keelStrip(), dark);
    const tw1 = halfW(X0, ys1);
    // stern top cresting + lanterns
    b.add(boxGeo(V(X0 - 0.2, ys1, -tw1 * 0.85), V(X0 + 0.6, ys1 + 0.9, tw1 * 0.85)), gold);
    for (const z of [-2.6, 0, 2.6]) { b.add(cyl(V(X0 + 0.3, ys1 + 0.9, z), V(X0 + 0.3, ys1 + 2.2, z), 0.32, 0.18), gold); }
    // beakhead + figurehead lion
    b.add(cyl(V(19.2, 6.4, 0), V(25.5, 8.6, 0), 0.6, 0.25, 8), red);
    b.add(cyl(V(24.8, 8.3, 0), V(26.2, 9.6, 0), 0.75, 0.55, 10), gold); // lion body, simplified
    b.add(new THREE.SphereGeometry(0.7, 12, 10), gold, new THREE.Matrix4().makeTranslation(26.4, 10.2, 0));
    // bowsprit
    b.add(cyl(V(17, 8.2, 0), V(33, 14.5, 0), 0.38, 0.2), wood);
    // masts, tops, yards with furled sails
    const sail = lam("vasaSail", () => ({ color: "#efe3c6" }));
    // ropes: hemp brown, thin, and kept out of the ink pass (as solid black ink they slashed across close shots)
    const rig = lam("vasaRope", () => ({ color: "#8a6a47" }));
    for (const m of MASTS) {
      const base = deckY(m.x);
      b.add(cyl(V(m.x, base - 1, 0), V(m.x, m.top * 0.62, 0), 0.55, 0.45), wood);
      b.add(cyl(V(m.x, m.top * 0.58, 0), V(m.x, m.top, 0), 0.32, 0.16), wood);
      const tg = new THREE.CylinderGeometry(1.5, 1.2, 0.5, 14); b.add(tg, dark, new THREE.Matrix4().makeTranslation(m.x, m.top * 0.6, 0));
      for (const [y, hl] of m.yards) {
        b.add(cyl(V(m.x + 0.6, y, -hl), V(m.x + 0.6, y, hl), 0.2, 0.2, 8), wood);
        b.add(cyl(V(m.x + 0.75, y - 0.35, -hl * 0.92), V(m.x + 0.75, y - 0.35, hl * 0.92), 0.38, 0.38, 10), sail);
      }
      // shrouds: from the rail either side up to the top
      for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
        const x = m.x - 1.2 + k * 0.8, y = sheerY(x) - 0.1, w = halfW(x, y) + 0.1;
        b.add(cyl(V(x, y, s * w), V(m.x, m.top * 0.6, s * 1.3), 0.028, 0.028, 5), rig);
      }
    }
    // stays between the mast tops and to the bowsprit
    b.add(cyl(V(MASTS[0].x, MASTS[0].top * 0.6, 0), V(31, 13.6, 0), 0.038, 0.038, 5), rig);
    b.add(cyl(V(MASTS[1].x, MASTS[1].top * 0.6, 0), V(MASTS[0].x, deckY(MASTS[0].x) + 1, 0), 0.038, 0.038, 5), rig);
    b.add(cyl(V(MASTS[2].x, MASTS[2].top * 0.6, 0), V(MASTS[1].x, deckY(MASTS[1].x) + 1, 0), 0.038, 0.038, 5), rig);
    // capstan and a hatch grating in the waist
    b.add(cyl(V(-6.6, 5.5, 0), V(-6.6, 6.5, 0), 0.6, 0.5, 12), wood);
    b.build(G);
    G.traverse((o) => { if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material === rig) o.layers.set(NOINK); });
    // two deck guns lashed at the river-side rail (one breaks loose on the worst roll)
    const gunM = twoTone(new THREE.MeshPhongMaterial({ color: "#2c2d33", specular: "#777", shininess: 50 }), 0.15);
    for (const x of [4.0, -2.5]) {
      const gp = new THREE.Group();
      const car = new THREE.Mesh(boxGeo(V(-0.55, 0, -0.45), V(0.55, 0.45, 0.45)), dark); car.castShadow = true;
      const tube = new THREE.Mesh(cyl(V(0, 0.65, -0.6), V(0, 0.65, 1.0), 0.24, 0.17, 12), gunM); tube.castShadow = true;
      for (const s of [-1, 1]) for (const zz of [-0.32, 0.32]) {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12).rotateX(Math.PI / 2).rotateY(Math.PI / 2), dark);
        wh.position.set(s * 0.6, 0.2, zz); gp.add(wh);
      }
      gp.add(car, tube);
      gp.position.set(x, 5.5, HALF_BEAM - 1.6);
      this.cannons.push(gp); G.add(gp);
    }
    // gun barrels behind every port (hidden until run out)
    for (const py of PORT_ROWS) {
      const row: THREE.Mesh[][] = [];
      for (const px of PORTS_X) {
        const pair: THREE.Mesh[] = [];
        for (const sd of [1, -1]) {
          const w = halfW(px, py);
          const m = new THREE.Mesh(cyl(V(px, py, sd * (w - 0.6)), V(px, py, sd * (w + 0.75)), 0.2, 0.15, 10), gunM);
          m.userData.side = sd; m.visible = false; m.castShadow = true;
          pair.push(m); G.add(m);
        }
        row.push(pair);
      }
      this.guns.push(row);
    }
    // set sails under the lower two yards of the fore and main masts (hidden unless sailing)
    const sailM = lam("vasaSailSet", () => ({ color: "#f1e6cc", side: THREE.DoubleSide }));
    for (const m of MASTS.slice(0, 2)) for (const [yy, hl] of m.yards.slice(0, 2)) {
      const w = hl * 1.85, h = yy < 25 ? yy - deckY(m.x) - 3.2 : 10.5;
      const g = new THREE.PlaneGeometry(w, h, 10, 8).translate(0, -h / 2, 0);
      const sm = new THREE.Mesh(g, sailM);
      sm.rotation.y = Math.PI / 2; // plane faces +x (the bow); local +z bulge -> +x
      sm.position.set(m.x + 1.0, yy - 0.2, 0);
      sm.visible = false; sm.castShadow = true;
      this.sails.push({ m: sm, w, h }); G.add(sm);
    }
    // flags: the big swallow-tailed ensign at the stern, pennants on the mast tops
    const fm = lam("swedenFlagM", () => ({ map: swedenFlag(), side: THREE.DoubleSide, alphaTest: 0.5 }));
    const staffTop = V(X0 - 0.8, sheerY(X0) + 7.5, 0);
    const staff = new THREE.Mesh(cyl(V(X0 - 0.4, sheerY(X0) - 1, 0), staffTop, 0.12, 0.08), wood); staff.castShadow = true; G.add(staff);
    this.addFlag(fm, staffTop.clone().add(V(0, -0.2, 0)), 6.0, 3.75, -1);
    const pen = lam("vasaPennant", () => ({ map: pennantTex(), side: THREE.DoubleSide, alphaTest: 0.5 }));
    for (const m of MASTS) this.addFlag(pen, V(m.x, m.top + 0.2, 0), 9, 1.2, -1, 0.6);
    G.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }
  private addFlag(mat: THREE.Material, top: THREE.Vector3, w: number, h: number, dir: number, k = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 16, 1), mat);
    m.frustumCulled = false; m.castShadow = true;
    this.flags.push({ m, w, h, base: top, k });
    this.group.add(m);
  }
  setPorts(rows: number) { for (const h of this.hulls) h.material = this.hullMats[Math.max(0, Math.min(2, Math.round(rows)))]; }
  /** gun barrels: out(row, port index) = 0 (hidden inside) .. 1 (run out through the port) */
  setGuns(out: (row: number, i: number) => number) {
    this.guns.forEach((row, ri) => row.forEach((pair, i) => {
      const k = out(ri, i);
      for (const m of pair) { m.visible = k > 0.01; m.position.z = (m.userData.side as number) * (k - 1) * 1.3; }
    }));
  }
  /** set sails: k = 0 (furled, hidden) .. 1; billow = how full the wind makes them */
  setSails(k: number, billow = 1) {
    for (const s of this.sails) {
      s.m.visible = k > 0.02;
      const p = s.m.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const u = (i % 11) / 10, v = Math.floor(i / 11) / 8; // u 0..1 across, v 0 (yard) .. 1 (foot)
        const bul = billow * s.h * 0.16 * Math.sin(Math.PI * v) * (1 - (2 * u - 1) ** 2 * 0.7) * k;
        p.setXYZ(i, (u - 0.5) * s.w, -v * s.h * k, bul);
      }
      p.needsUpdate = true; s.m.geometry.computeVertexNormals();
    }
  }
  /** wave the flags; hoist = 0 (down on deck, hidden) .. 1 (at the top) */
  poseFlags(t: number, hoist = 1) {
    for (const f of this.flags) {
      const p = f.m.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        const u = (i % 17) / 16, y = i < 17 ? 0.5 : -0.5;
        p.setXYZ(i, -u * f.w, y * f.h + 0.06 * f.h * u * Math.sin(t * 4 - u * 3), 0.12 * f.h * f.k * u * Math.sin(t * 5.5 - u * 5 + f.base.x));
      }
      p.needsUpdate = true; f.m.geometry.computeVertexNormals();
      f.m.visible = hoist > 0.02;
      f.m.position.set(f.base.x, f.base.y - f.h / 2 - (1 - hoist) * 8, f.base.z);
      f.m.scale.set(Math.max(0.05, hoist), 1, 1);
    }
  }
}
const pennantTex = () => ctex("vasaPennant", 512, 64, (g) => {
  g.beginPath(); g.moveTo(0, 0); g.lineTo(512, 28); g.lineTo(512, 36); g.lineTo(0, 64); g.closePath(); g.clip();
  g.fillStyle = "#2b63b5"; g.fillRect(0, 0, 512, 64); g.fillStyle = "#f6cc33"; g.fillRect(0, 26, 512, 12);
});
export { rep };

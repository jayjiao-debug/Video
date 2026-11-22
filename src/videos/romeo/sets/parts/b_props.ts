// SMALL SET DRESSING of the hall, the cell and the bedroom (set builder B): bottles, jars, jugs, bowls, food, herb
// bunches, masks, books. All are props-kit Parts (NOINK + their own hull outline, b_common header), built in place
// (world coordinates) into a Part the caller owns. Seeded, no random numbers.
import * as THREE from "three";
import { Part, lathe, rng, paint, css, mix, type G2 } from "./b_common";

/** a glass bottle: round body, shoulder, neck, a cork; h = its height */
export const bottle = (P: Part, m: { glass: THREE.Material; cork: THREE.Material }, x: number, y: number, z: number, h: number, r: number, kind = 0) => {
  const nr = Math.max(0.012, r * 0.32);
  const prof: [number, number][] = kind === 1
    ? [[0.001, 0], [r * 0.9, 0.002], [r, h * 0.12], [r, h * 0.3], [r * 0.8, h * 0.48], [nr, h * 0.68], [nr, h * 0.86], [nr * 1.25, h * 0.9]]     // flask: round
    : kind === 2
      ? [[0.001, 0], [r, 0.002], [r, h * 0.62], [r * 0.7, h * 0.72], [nr, h * 0.78], [nr, h * 0.88], [nr * 1.3, h * 0.9]]                        // square-shouldered
      : [[0.001, 0], [r * 0.95, 0.002], [r, h * 0.4], [r * 0.62, h * 0.6], [nr, h * 0.72], [nr, h * 0.86], [nr * 1.3, h * 0.9]];               // classic
  P.add(m.glass, lathe(prof, 14).translate(x, y, z), 0.004);
  P.add(m.cork, new THREE.CylinderGeometry(nr * 1.05, nr * 0.95, h * 0.12, 10).translate(x, y + h * 0.94, z), 0.003);
};
/** a stoneware jar with a lid knob */
export const jar = (P: Part, m: { body: THREE.Material; lid: THREE.Material }, x: number, y: number, z: number, h: number, r: number) => {
  P.add(m.body, lathe([[0.001, 0], [r * 0.8, 0.002], [r, h * 0.3], [r * 0.95, h * 0.75], [r * 0.7, h * 0.88], [r * 0.72, h * 0.95]], 16).translate(x, y, z), 0.004);
  P.add(m.lid, lathe([[0.001, 0], [r * 0.78, 0], [r * 0.7, 0.03], [r * 0.25, 0.045], [r * 0.25, 0.07], [0.001, 0.075]], 14).translate(x, y + h * 0.94, z), 0.003);
};
/** a jug with a handle */
export const jug = (P: Part, mat: THREE.Material, x: number, y: number, z: number, h: number, r: number, yaw = 0) => {
  P.add(mat, lathe([[0.001, 0], [r * 0.75, 0.002], [r, h * 0.35], [r * 0.85, h * 0.7], [r * 0.6, h * 0.85], [r * 0.72, h], [r * 0.62, h * 1.0]], 16).translate(x, y, z), 0.004);
  const hp = new THREE.TorusGeometry(h * 0.22, Math.max(0.012, r * 0.14), 6, 12, Math.PI).rotateZ(-Math.PI / 2).translate(r * 0.85, h * 0.6, 0).rotateY(yaw).translate(x, y, z);
  P.add(mat, hp, 0.003);
};
/** a shallow bowl (no hull inside: only the outside profile) with balls of fruit in it */
export const fruitBowl = (P: Part, m: { bowl: THREE.Material; fruit: THREE.Material[] }, x: number, y: number, z: number, r: number, seed: number) => {
  P.add(m.bowl, lathe([[0.001, 0], [r * 0.5, 0], [r * 0.55, 0.02], [r, r * 0.4], [r * 0.96, r * 0.42], [0.001, r * 0.15]], 18).translate(x, y, z), 0.004);
  const q = rng(seed), fr = r * 0.34;
  const spots: [number, number, number][] = [[0, 0, 0.35], [0.45, 0.2, 0.25], [-0.42, 0.25, 0.25], [0.1, -0.45, 0.25], [-0.2, -0.3, 0.6], [0.25, 0.1, 0.62]];
  spots.forEach(([dx, dz, dy], i) => P.add(m.fruit[i % m.fruit.length], new THREE.SphereGeometry(fr * (0.85 + 0.25 * q()), 12, 9).translate(x + dx * r, y + r * dy + fr * 0.6, z + dz * r), 0.004));
};
/** a round loaf (or a long one) */
export const loaf = (P: Part, mat: THREE.Material, x: number, y: number, z: number, s: number, long = false, yaw = 0) => {
  const g = new THREE.SphereGeometry(s, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(long ? 1.9 : 1, 0.62, 1).rotateY(yaw).translate(x, y, z);
  P.add(mat, g, 0.004);
};
/** a pewter plate */
export const plate = (P: Part, mat: THREE.Material, x: number, y: number, z: number, r: number) =>
  P.add(mat, lathe([[0.001, 0], [r * 0.65, 0], [r, 0.014], [r * 0.98, 0.02], [0.001, 0.012]], 20).translate(x, y, z), 0.003);
/** a roast fowl on a platter */
export const roast = (P: Part, m: { meat: THREE.Material; plate: THREE.Material }, x: number, y: number, z: number, s: number, yaw = 0) => {
  P.add(m.plate, lathe([[0.001, 0], [s * 1.5, 0], [s * 2.0, 0.02], [s * 1.95, 0.03], [0.001, 0.02]], 22).scale(1.25, 1, 1).rotateY(yaw).translate(x, y, z), 0.003);
  P.add(m.meat, new THREE.SphereGeometry(s, 16, 12).scale(1.35, 0.8, 1).rotateY(yaw).translate(x, y + s * 0.62, z), 0.004);
  for (const sd of [-1, 1]) {
    const a = new THREE.Vector3(s * 0.9, s * 0.5, sd * s * 0.45).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    P.add(m.meat, new THREE.SphereGeometry(s * 0.38, 10, 8).scale(1.6, 0.8, 0.9).rotateY(yaw).translate(x + a.x, y + a.y, z + a.z), 0.004);
  }
};
/** A BUNCH OF DRYING HERBS hanging head down from a beam at (x, yTop, z): string, a tied stem bundle, a leafy cone */
export const herbBunch = (P: Part, m: { leaf: THREE.Material; stem: THREE.Material; string: THREE.Material; bloom?: THREE.Material }, x: number, yTop: number, z: number, len: number, seed: number) => {
  const q = rng(seed), r = 0.05 + 0.03 * q();
  P.add(m.string, new THREE.CylinderGeometry(0.006, 0.006, 0.12, 6).translate(x, yTop - 0.06, z), 0.003);
  P.add(m.stem, new THREE.CylinderGeometry(0.018, 0.02, 0.08, 8).translate(x, yTop - 0.15, z), 0.003);
  // head down: the tied stems narrow at the top, the leafy heads fanning out into a round bottom (a teardrop)
  const y0 = yTop - 0.19, cone = lathe([[0.001, -len], [r * 0.55, -len * 0.97], [r * 0.95, -len * 0.85], [r, -len * 0.7], [r * 0.7, -len * 0.4], [0.024, -len * 0.08], [0.02, 0]], 10).translate(x, y0, z);
  // a little lumpiness (leaf tufts)
  const p = cone.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const k = 1 + 0.2 * Math.sin(p.getY(i) * 37 + seed) * Math.sin(Math.atan2(p.getZ(i) - z, p.getX(i) - x) * 3 + seed); p.setX(i, x + (p.getX(i) - x) * k); p.setZ(i, z + (p.getZ(i) - z) * k); }
  cone.computeVertexNormals();
  P.add(m.leaf, cone, 0.004);
  if (m.bloom) for (let k = 0; k < 5; k++) { const a = k * 1.3 + seed, rr = r * (0.5 + 0.3 * q()); P.add(m.bloom, new THREE.SphereGeometry(0.02, 8, 6).translate(x + Math.cos(a) * rr, y0 - len * (0.86 + 0.08 * q()), z + Math.sin(a) * rr), 0.003); }
};
/** a book (lying): cover box and page block */
export const book = (P: Part, m: { cover: THREE.Material; pages: THREE.Material }, x: number, y: number, z: number, w: number, d: number, h: number, yaw: number) => {
  P.shell([[m.cover, new THREE.BoxGeometry(w, h, d).rotateY(yaw).translate(x, y + h / 2, z)], [m.pages, new THREE.BoxGeometry(w - 0.012, h * 0.8, d - 0.01).translate(0.008, 0, 0).rotateY(yaw).translate(x, y + h / 2, z)]], 0.004);
};

/** A CARNIVAL MASK's face (painted): field colour, the eye holes, trim, a few painted curls */
export const maskTex = (field: string, trim: string, seed: number) => paint(256, 160, (g: G2, W, H) => {
  const r = rng(seed);
  g.fillStyle = field; g.fillRect(0, 0, W, H);
  g.fillStyle = css(mix(field, "#ffffff", 0.25), 0.5); g.beginPath(); g.ellipse(W * 0.5, H * 0.3, W * 0.42, H * 0.18, 0, 0, Math.PI * 2); g.fill();
  // eye holes (dark almonds)
  g.fillStyle = "#2b2630";
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W * (0.5 + s * 0.2), H * 0.48, W * 0.11, H * 0.12, s * 0.25, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = trim; g.lineWidth = 7;
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(W * (0.5 + s * 0.2), H * 0.48, W * 0.14, H * 0.17, s * 0.25, 0, Math.PI * 2); g.stroke(); }
  g.lineWidth = 5; g.beginPath();
  for (let i = 0; i < 3; i++) { const cx = W * (0.25 + 0.25 * i), cy = H * (0.16 + 0.05 * r()); g.moveTo(cx - 14, cy); g.quadraticCurveTo(cx, cy - 16, cx + 14, cy); }
  g.stroke();
  g.strokeStyle = "#2b2630"; g.lineWidth = 6; g.strokeRect(0, 0, W, H);
});
/** a half mask: a thin lens-shaped solid (a squashed ball), the face painted on its front (planar uv); faces +z, then
 *  tilted back by pitch (pi/2 = lying face up) and turned by yaw, at (x, y, z) */
export const mask = (P: Part, face: THREE.Material, x: number, y: number, z: number, s: number, yaw: number, pitch: number) => {
  const g = new THREE.SphereGeometry(s, 18, 12).scale(1, 0.62, 0.26);
  const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, 0.5 + p.getX(i) / (2 * s), 0.5 + p.getY(i) / (1.24 * s));
  g.rotateX(-pitch).rotateY(yaw).translate(x, y, z);
  P.add(face, g, 0.004);
};

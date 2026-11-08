// Backtest props: detailed, outlined, textured stand-ins for the reference's game-asset style (cannon on a truck
// carriage, bucket, rope coil, barrels, bulwark with gunports, mast with shrouds and ratlines, sail).
// Every mesh casts and receives the sun's shadow; world materials are the film's two-tone Lambert (shade.ts).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { twoTone } from "../vasa/shade";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));

// ---------------- canvas textures ----------------
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = true) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};
/** vertical wood staves / planks with grain: base colour, plank count, seam colour */
export const staves = (base: string, n: number, seam: string, w = 512, h = 512) => canvasTex(w, h, (g) => {
  const c = new THREE.Color(base);
  for (let i = 0; i < n; i++) {
    const k = 0.9 + 0.2 * rnd(), x0 = (i * w) / n, x1 = ((i + 1) * w) / n;
    g.fillStyle = `#${c.clone().multiplyScalar(k).getHexString()}`; g.fillRect(x0, 0, x1 - x0, h);
    for (let j = 0; j < 9; j++) { // grain lines
      const x = x0 + (x1 - x0) * rnd();
      g.strokeStyle = `rgba(60,30,10,${0.06 + 0.08 * rnd()})`; g.lineWidth = 1 + 2 * rnd();
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) g.lineTo(x + 3 * Math.sin(y * 0.02 + j), y);
      g.stroke();
    }
    g.fillStyle = "rgba(255,240,210,0.12)"; g.fillRect(x0 + 2, 0, 3, h); // lit edge
    g.fillStyle = seam; g.fillRect(x1 - 3, 0, 3, h);
  }
});
/** painted planks running horizontally (bulwark inner face) */
export const paintedPlanks = (base: string, rows: number, joints = 3) => canvasTex(512, 512, (g) => {
  const c = new THREE.Color(base);
  for (let i = 0; i < rows; i++) {
    const y0 = (i * 512) / rows, k = 0.94 + 0.12 * rnd();
    const grd = g.createLinearGradient(0, y0, 0, y0 + 512 / rows);
    grd.addColorStop(0, `#${c.clone().multiplyScalar(k * 1.08).getHexString()}`);
    grd.addColorStop(1, `#${c.clone().multiplyScalar(k * 0.92).getHexString()}`);
    g.fillStyle = grd; g.fillRect(0, y0, 512, 512 / rows);
    g.fillStyle = "rgba(40,10,5,0.55)"; g.fillRect(0, y0 + 512 / rows - 3, 512, 3);
    for (let j = 0; j < joints; j++) { g.fillStyle = "rgba(40,10,5,0.35)"; g.fillRect(512 * rnd(), y0, 2, 512 / rows); }
  }
});
export const ropeTex = () => canvasTex(256, 64, (g) => {
  g.fillStyle = "#c9a574"; g.fillRect(0, 0, 256, 64);
  for (let x = -64; x < 320; x += 16) { g.strokeStyle = "#8f6a3e"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 32, 0); g.stroke(); }
  g.fillStyle = "rgba(255,240,200,0.25)"; g.fillRect(0, 18, 256, 8);
});
export const clothTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = "#f1e7d0"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 64) { g.fillStyle = "rgba(150,120,80,0.25)"; g.fillRect(x, 0, 3, 512); }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(120,90,60,${0.03 * rnd()})`; g.fillRect(512 * rnd(), 512 * rnd(), 30, 2); }
});
/** stylised metal matcap: cool grey body, a broad soft key highlight top-left, a thin rim */
export const metalMatcap = () => canvasTex(256, 256, (g) => {
  const grd = g.createRadialGradient(100, 90, 4, 128, 128, 128);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(0.22, "#eef1f5"); grd.addColorStop(0.55, "#c4cad3");
  grd.addColorStop(0.85, "#8e96a2"); grd.addColorStop(1, "#6c7480");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
  const r2 = g.createRadialGradient(170, 190, 2, 170, 190, 60);
  r2.addColorStop(0, "rgba(200,215,235,0.55)"); r2.addColorStop(1, "rgba(200,215,235,0)");
  g.fillStyle = r2; g.fillRect(0, 0, 256, 256);
}, false);

/** painted gunmetal: light grey body, broad soft highlight, cool rim (reference barrels read painted, not chrome) */
export const gunMatcap = () => canvasTex(256, 256, (g) => {
  const grd = g.createRadialGradient(100, 88, 4, 128, 128, 128);
  grd.addColorStop(0, "#f2f4f6"); grd.addColorStop(0.1, "#dfe4e8"); grd.addColorStop(0.3, "#aab1b9"); grd.addColorStop(0.55, "#8b939b");
  grd.addColorStop(0.82, "#5d646d"); grd.addColorStop(1, "#454b53");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
  const r2 = g.createRadialGradient(178, 196, 2, 178, 196, 70);
  r2.addColorStop(0, "rgba(185,200,220,0.6)"); r2.addColorStop(1, "rgba(185,200,220,0)");
  g.fillStyle = r2; g.fillRect(0, 0, 256, 256);
}, false);

/** cannonball iron: near-black with one small tight highlight */
export const ballMatcap = () => canvasTex(256, 256, (g) => {
  const grd = g.createRadialGradient(92, 80, 1, 128, 128, 128);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(0.06, "#e8edf2"); grd.addColorStop(0.13, "#3d424a"); grd.addColorStop(0.6, "#1f2329"); grd.addColorStop(1, "#131519");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
}, false);

// ---------------- helpers ----------------
const lathe = (prof: [number, number][], seg = 40) => new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => { const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; return o; };
const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return g;
};
/** thin cylinder between two points */
const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 6) => {
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r, r, d.length(), seg, 1, true);
  g.translate(0, d.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
};

// ---------------- the cannon ----------------
export type Cannon = { group: THREE.Group; barrel: THREE.Group; muzzle: THREE.Object3D; carriage: THREE.Group };
/** 24-pounder on a truck carriage; barrel along +x, breech at x = -0.9, muzzle at x = 1.35, bore axis at y = 0.7 */
export const cannon = (metal: THREE.Material, wood: THREE.Material, dark: THREE.Material, iron: THREE.Material, mark?: THREE.Material): Cannon => {
  const group = new THREE.Group(), barrel = new THREE.Group(), carriage = new THREE.Group();
  const prof: [number, number][] = [
    [0.0, 0.0], [0.17, 0.0], [0.205, 0.03], [0.215, 0.07], [0.215, 0.13], [0.2, 0.15], [0.196, 0.16],   // base ring
    [0.19, 0.78], [0.208, 0.79], [0.208, 0.84], [0.183, 0.86],                                          // first reinforce
    [0.172, 1.38], [0.186, 1.39], [0.186, 1.43], [0.163, 1.45],                                         // second reinforce
    [0.142, 2.07], [0.158, 2.1], [0.176, 2.15], [0.176, 2.21], [0.16, 2.235], [0.085, 2.235], [0.075, 2.2], [0.07, 1.9],
  ];
  const b = mesh(lathe(prof, 48), metal);
  const bore = mesh(new THREE.CircleGeometry(0.072, 24), dark, false); bore.position.y = 1.95; bore.rotation.x = -Math.PI / 2;
  const knob = mesh(new THREE.SphereGeometry(0.075, 20, 14), metal); knob.position.y = -0.11;
  const neck = mesh(lathe([[0.0, -0.06], [0.05, -0.06], [0.045, 0.0], [0.0, 0.0]], 20), metal);
  const trun = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.56, 20), metal); trun.rotation.x = Math.PI / 2; trun.position.y = 0.95;
  // touch hole on TOP of the breech (lathe -x is world up once the axis is laid along +x), with a raised vent field
  const vent = mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.03, 12), dark); vent.position.set(-0.2, 0.24, 0); vent.rotation.z = Math.PI / 2;
  const ventF = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.022, 18), metal); ventF.position.set(-0.192, 0.24, 0); ventF.rotation.z = Math.PI / 2;
  const axis = new THREE.Group(); axis.add(b, bore, knob, neck, trun, ventF, vent);
  if (mark) { // engraved date along the top of the barrel, between the vent and the first reinforce
    const th = (3 * Math.PI) / 2 - 0.3, tl = 0.9;
    const dec = new THREE.Mesh(new THREE.CylinderGeometry(0.1935, 0.1925, 0.34, 16, 1, true, th - tl / 2, tl), mark);
    dec.position.y = 0.52; dec.renderOrder = 1; axis.add(dec);
  }
  axis.rotation.z = -Math.PI / 2; axis.position.x = -0.95; // y-up lathe -> +x
  barrel.add(axis);
  barrel.position.y = 0.7; barrel.rotation.z = 0.03;
  // carriage: two stepped cheeks, transoms, axletrees, four trucks (wheels) with iron hubs, quoin under the breech
  const sh = new THREE.Shape([[-0.62, 0.12], [0.55, 0.12], [0.55, 0.62], [0.24, 0.62], [0.24, 0.53], [-0.06, 0.53], [-0.06, 0.44], [-0.34, 0.44], [-0.34, 0.35], [-0.62, 0.35]].map(([x, y]) => new THREE.Vector2(x, y)));
  const cheekG = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
  for (const z of [0.2, -0.28]) { const c = mesh(cheekG, wood); c.position.z = z; carriage.add(c); }
  carriage.add(mesh(box(0.3, 0.2, -0.22, 0.52, 0.5, 0.22), wood));      // front transom
  carriage.add(mesh(box(-0.5, 0.12, -0.22, -0.3, 0.3, 0.22), wood));   // rear transom
  carriage.add(mesh(box(-0.6, 0.12, -0.2, 0.5, 0.18, 0.2), wood));     // bed
  carriage.add(mesh(box(-0.62, 0.28, -0.12, -0.2, 0.38, 0.12), wood)); // quoin
  for (const [x, r] of [[0.36, 0.15], [-0.42, 0.13]] as const) {
    carriage.add(mesh(box(x - 0.06, 0.08, -0.42, x + 0.06, 0.2, 0.42), wood)); // axletree
    for (const s of [1, -1]) {
      const w = mesh(new THREE.CylinderGeometry(r, r, 0.085, 28), wood); w.rotation.x = Math.PI / 2; w.position.set(x, r, s * 0.36);
      const rim = mesh(new THREE.TorusGeometry(r - 0.006, 0.012, 6, 28), iron); rim.position.set(x, r, s * 0.405);
      const hub = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.11, 14), iron); hub.rotation.x = Math.PI / 2; hub.position.set(x, r, s * 0.38);
      carriage.add(w, rim, hub);
    }
  }
  // iron straps along the cheek feet and bolt heads through the cheeks
  for (const s of [1, -1]) {
    const zf = s * 0.291;
    carriage.add(mesh(box(-0.62, 0.12, zf - 0.006, 0.55, 0.16, zf + 0.006), iron));
    carriage.add(mesh(box(0.24, 0.58, zf - 0.006, 0.55, 0.62, zf + 0.006), iron));
    for (const [bx, by] of [[-0.52, 0.24], [-0.2, 0.24], [0.12, 0.24], [0.44, 0.24], [-0.52, 0.31], [0.44, 0.5], [0.12, 0.42], [-0.2, 0.36]]) {
      const bh = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.014, 10), iron); bh.rotation.x = Math.PI / 2; bh.position.set(bx, by, zf + s * 0.008); carriage.add(bh);
    }
  }
  // iron cap squares over the trunnions + ring bolts
  for (const z of [0.24, -0.24]) {
    carriage.add(mesh(box(0.22, 0.62, z - 0.05, 0.42, 0.68, z + 0.05), iron));
    const ring = mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 14), iron); ring.position.set(-0.55, 0.3, z * 1.3); carriage.add(ring);
  }
  group.add(carriage, barrel);
  const muzzle = new THREE.Object3D(); muzzle.position.set(1.36, 0, 0); barrel.add(muzzle);
  return { group, barrel, muzzle, carriage };
};

// ---------------- small props ----------------
export const bucket = (wood: THREE.Material, iron: THREE.Material, water: THREE.Material, sponge: THREE.Material) => {
  const g = new THREE.Group();
  const outer = lathe([[0.0, 0.0], [0.15, 0.0], [0.155, 0.01], [0.185, 0.32], [0.19, 0.33]], 36);
  const inner = lathe([[0.17, 0.33], [0.142, 0.03], [0.0, 0.03]], 36);
  g.add(mesh(outer, wood), mesh(inner, wood));
  for (const y of [0.06, 0.26]) { const r = 0.153 + (0.035 * y) / 0.32; const t = mesh(new THREE.TorusGeometry(r, 0.011, 6, 36), iron); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); }
  const w = mesh(new THREE.CircleGeometry(0.165, 32), water, false); w.rotation.x = -Math.PI / 2; w.position.y = 0.27; g.add(w);
  const s = mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), sponge); s.position.set(0.03, 0.285, 0.02); s.rotation.y = 0.5; g.add(s);
  return g;
};
export const ropeCoil = (m: THREE.Material) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 420; i++) { const a = i * 0.075, r = 0.06 + 0.2 * (i / 420); pts.push(V(r * Math.cos(a), 0.022 + 0.004 * Math.sin(i * 0.3), r * Math.sin(a))); }
  pts.push(V(0.4, 0.02, 0.1), V(0.7, 0.02, 0.3));
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.022, 7, false);
  const top: THREE.Vector3[] = [];
  for (let i = 0; i <= 260; i++) { const a = i * 0.08 + 1, r = 0.08 + 0.13 * (i / 260); top.push(V(r * Math.cos(a), 0.062, r * Math.sin(a))); }
  const g2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(top), 500, 0.02, 7, false);
  return mesh(mergeGeometries([g, g2])!, m);
};
export const barrel = (wood: THREE.Material, iron: THREE.Material, h = 0.85, r = 0.3) => {
  const g = new THREE.Group(), prof: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const y = (i / 12) * h; prof.push([r * (0.84 + 0.16 * Math.sin((Math.PI * i) / 12)), y]); }
  g.add(mesh(lathe([[0, 0], ...prof, [0, h]], 36), wood));
  for (const y of [0.1, 0.3, 0.7, 0.9]) {
    const rr = r * (0.84 + 0.16 * Math.sin(Math.PI * y)) + 0.006, t = mesh(new THREE.TorusGeometry(rr, 0.014, 6, 36), iron);
    t.rotation.x = Math.PI / 2; t.position.y = y * h; g.add(t);
  }
  return g;
};
export const ballPile = (metal: THREE.Material, wood: THREE.Material) => {
  const g = new THREE.Group();
  g.add(mesh(box(-0.32, 0, -0.32, 0.32, 0.08, 0.32), wood));
  const sg = new THREE.SphereGeometry(0.075, 16, 12);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const s = mesh(sg, metal); s.position.set(-0.16 + 0.16 * i, 0.155, -0.16 + 0.16 * j); g.add(s); }
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const s = mesh(sg, metal); s.position.set(-0.08 + 0.16 * i, 0.27, -0.08 + 0.16 * j); g.add(s); }
  const s = mesh(sg, metal); s.position.set(0, 0.385, 0); g.add(s);
  return g;
};

// ---------------- ship parts ----------------
/** bulwark along x = X (inner face toward -x) from z0 to z1, with gunports (centre z, width) */
export const bulwark = (X: number, z0: number, z1: number, ports: number[], red: THREE.Material, rail: THREE.Material, dark: THREE.Material) => {
  const g = new THREE.Group(), H = 1.0, T = 0.14, pw = 0.62, py0 = 0.36, py1 = 0.9;
  ports = [...ports].sort((a, b) => a - b); // segments are built between consecutive cuts, so ports must be in order
  const cuts = [z0, ...ports.flatMap((p) => [p - pw / 2, p + pw / 2]), z1];
  for (let i = 0; i < cuts.length; i += 2) g.add(mesh(box(X, 0, cuts[i], X + T, H, cuts[i + 1]), red));
  for (const p of ports) {
    g.add(mesh(box(X, 0, p - pw / 2, X + T, py0, p + pw / 2), red));      // sill
    g.add(mesh(box(X, py1, p - pw / 2, X + T, H, p + pw / 2), red));      // lintel
    g.add(mesh(box(X - 0.03, py0 - 0.04, p - pw / 2 - 0.05, X + 0.01, py0, p + pw / 2 + 0.05), rail)); // port frame
  }
  g.add(mesh(box(X - 0.06, H, z0, X + T + 0.06, H + 0.08, z1), rail));   // cap rail
  for (let z = z0 + 0.6; z < z1; z += 1.25) if (!ports.some((p) => Math.abs(z - p) < pw / 2 + 0.12)) g.add(mesh(box(X - 0.08, 0, z - 0.06, X, H, z + 0.06), dark));
  return g;
};
/** mast + shrouds/ratlines to the bulwark at x = X (z span around the mast) */
export const mastRig = (mx: number, mz: number, X: number, mastM: THREE.Material, iron: THREE.Material, ropeM: THREE.Material) => {
  const g = new THREE.Group(), top = 14;
  g.add(mesh(new THREE.CylinderGeometry(0.13, 0.19, top, 20).translate(mx, top / 2, mz), mastM));
  for (const y of [1.2, 2.6, 4.0]) { const h = mesh(new THREE.TorusGeometry(0.185, 0.02, 6, 24), iron); h.rotation.x = Math.PI / 2; h.position.set(mx, y, mz); g.add(h); }
  const geos: THREE.BufferGeometry[] = [], n = 5, head = V(mx + 0.15, top - 1.2, mz);
  const feet = Array.from({ length: n }, (_, i) => V(X + 0.05, 1.05, mz - 0.8 + (1.6 * i) / (n - 1)));
  const dead: THREE.BufferGeometry[] = [];
  for (const f of feet) {
    const d = head.clone().sub(f).normalize(), up1 = f.clone().addScaledVector(d, 0.42), lo1 = f.clone().addScaledVector(d, 0.1);
    geos.push(rod(up1, head, 0.016));
    for (const c of [lo1, up1]) { const dg = new THREE.CylinderGeometry(0.065, 0.065, 0.045, 16); dg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(1, 0, 0))); dg.translate(c.x, c.y, c.z); dead.push(dg); }
    for (const o of [-0.035, 0, 0.035]) geos.push(rod(lo1.clone().add(V(0, 0, o)), up1.clone().add(V(0, 0, o)), 0.006, 4)); // lanyard
    geos.push(rod(V(X + 0.12, 0.55, f.z), lo1, 0.012, 4)); // chain plate down the bulwark
  }
  for (let y = 1.45; y < top - 2.5; y += 0.42) {
    const k = (y - 1.05) / (head.y - 1.05), p = feet.map((f) => f.clone().lerp(head, k));
    for (let i = 0; i < n - 1; i++) geos.push(rod(p[i], p[i + 1], 0.01, 4));
  }
  g.add(mesh(mergeGeometries(dead)!, iron, false));
  g.add(mesh(mergeGeometries(geos)!, ropeM, false));
  return g;
};
/** a bellied sail hanging from a yard: width w, drop h, centre (x, y, z), facing +-x */
export const sail = (cx: number, cy: number, cz: number, w: number, h: number, m: THREE.Material, yardM: THREE.Material) => {
  const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h, 24, 16), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.55 * Math.cos((x / w) * Math.PI) * (0.4 + 0.6 * (0.5 - y / h))); }
  geo.computeVertexNormals();
  const s = mesh(geo, m); s.position.set(cx, cy, cz); // plane spans x (athwartships), bellies toward +z
  const yard = mesh(new THREE.CylinderGeometry(0.07, 0.07, w * 1.1, 12), yardM); yard.rotation.z = Math.PI / 2; yard.position.set(cx, cy + h / 2 + 0.05, cz);
  g.add(s, yard);
  return g;
};

// ---------------- set dressing (second pass: the props the reference shows and we lacked) ----------------
/** rammer + sheepskin sponge on long staves, leaning together against the rail; feet at the origin, tops toward +x */
export const rammerPair = (pole: THREE.Material, head: THREE.Material, fleece: THREE.Material) => {
  const g = new THREE.Group(), L = 2.25;
  const one = (z: number, lean: number, top: THREE.Mesh) => {
    const r = new THREE.Group();
    r.add(mesh(new THREE.CylinderGeometry(0.02, 0.024, L, 10).translate(0, L / 2, 0), pole), top);
    r.position.z = z; r.rotation.z = -lean; r.rotation.x = z * 0.25; g.add(r);
  };
  one(-0.07, 0.25, (() => { const m = mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.17, 20).translate(0, L + 0.07, 0), head); return m; })());
  one(0.08, 0.22, (() => { const m = mesh(new THREE.CapsuleGeometry(0.068, 0.2, 6, 16).translate(0, L + 0.12, 0), fleece); return m; })());
  return g;
};
/** shot garland: a notched plank on the deck holding a row of balls */
export const shotRack = (wood: THREE.Material, ball: THREE.Material, n = 6) => {
  const g = new THREE.Group(), w = 0.17 * n;
  g.add(mesh(box(-0.1, 0, -w / 2, 0.1, 0.09, w / 2), wood));
  const sg = new THREE.SphereGeometry(0.075, 16, 12);
  for (let i = 0; i < n; i++) { const b = mesh(sg, ball); b.position.set(0, 0.145, -w / 2 + 0.085 + i * 0.17); g.add(b); }
  return g;
};
/** iron ring bolt on the bulwark face (normal -x) with a wooden tackle block hanging from it */
export const ringBlock = (iron: THREE.Material, wood: THREE.Material) => {
  const g = new THREE.Group();
  const ring = mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 14), iron); ring.rotation.y = Math.PI / 2; g.add(ring);
  const blk = mesh(new THREE.CapsuleGeometry(0.04, 0.06, 4, 10), wood); blk.scale.set(1, 1, 0.6); blk.position.set(-0.03, -0.07, 0); g.add(blk);
  return g;
};
/** rope between two points with a sag (rebuilt per frame for the recoiling gun) */
export const ropeSpan = (a: THREE.Vector3, b: THREE.Vector3, sag: number, r = 0.016) => {
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
  return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 16, r, 6, false);
};
/** flag on a staff: returns the group and a function that waves the cloth for time t */
export const flag = (tex: THREE.Texture, staffM: THREE.Material, h = 2.6, fw = 1.15, fh = 0.72) => {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.025, 0.035, h, 10).translate(0, h / 2, 0), staffM));
  const knob = mesh(new THREE.SphereGeometry(0.05, 12, 8), staffM); knob.position.y = h + 0.03; g.add(knob);
  const geo = new THREE.PlaneGeometry(fw, fh, 20, 8); geo.translate(fw / 2, h - fh / 2 - 0.05, 0);
  const base = Float32Array.from(geo.attributes.position.array as Float32Array);
  const m = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }); const cloth = new THREE.Mesh(geo, m); cloth.castShadow = true; g.add(cloth);
  const wave = (t: number) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], k = x / fw;
      p.setZ(i, (0.15 + 0.85 * k) * (0.2 * Math.sin(x * 6.5 - t * 12) + 0.07 * Math.sin(y * 5 + x * 4 - t * 8)));
      p.setY(i, y - 0.06 * k * k);
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  wave(0);
  return { group: g, wave };
};
/** Swedish flag (Vasa sailed under it) */
export const swedishFlag = () => canvasTex(256, 160, (g) => {
  g.fillStyle = "#1f5fae"; g.fillRect(0, 0, 256, 160);
  g.fillStyle = "#f7c531"; g.fillRect(80, 0, 32, 160); g.fillRect(0, 64, 256, 32);
}, false);
/** engraved year for the barrel decal: dark letters with a light lower lip, reading along the barrel */
export const yearTex = (txt: string) => canvasTex(256, 512, (g) => {
  g.clearRect(0, 0, 256, 512);
  g.translate(128, 256); g.rotate(-Math.PI / 2);
  g.font = "bold 84px serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "rgba(255,255,255,0.28)"; g.fillText(txt, 0, 4);
  g.fillStyle = "rgba(55,60,68,0.55)"; g.fillText(txt, 0, 0);
}, false);

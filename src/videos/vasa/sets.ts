// The two interiors: the palace hall (the king's portrait niche, the inquiry table, the designer's empty chair, a
// painted heaven on the ceiling) and the table top with the roly-poly toy (不倒翁). Each set is its own group at the
// origin; world.ts shows one set per shot. Units are metres; the hall floor and the table top are at y = 0.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad } from "./build";
import { ctex, beam, planksHD } from "./paint";
import { twoTone } from "./shade";
import { Pen } from "./toon";

const INK = "#1b1216";
const cyl = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1 = r0, seg = 12) => {
  const g = new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), seg);
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1));
  return g.applyMatrix4(m);
};
const glow = (r: number, g: number, b: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

// ---------------- painted textures ----------------
const damask = () => ctex("hallDamask", 1024, 1024, (g, r) => {
  g.fillStyle = "#7a2630"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 4) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.03})`; g.fillRect(0, y, 1024, 2); }
  const p = new Pen(g);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const x = 128 + i * 256 + (j % 2) * 128, y = 128 + j * 256;
    p.poly([[x, y - 70], [x + 42, y], [x, y + 70], [x - 42, y]], "#b8893a", 0);
    p.poly([[x, y - 40], [x + 22, y], [x, y + 40], [x - 22, y]], "#8c2f38", 0);
    p.ell(x, y, 8, 8, "#d9a93a", 0);
  }
});
const wainscot = () => ctex("hallWainscot", 1024, 512, (g, r) => {
  g.fillStyle = "#5a3820"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 4; i++) {
    const x = 20 + i * 256;
    g.fillStyle = "#6b4528"; g.fillRect(x, 60, 216, 380);
    g.strokeStyle = "#3a2414"; g.lineWidth = 10; g.strokeRect(x, 60, 216, 380);
    g.strokeStyle = "#8a5e38"; g.lineWidth = 4; g.strokeRect(x + 18, 78, 180, 344);
    for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(30,15,8,${0.1 + r() * 0.1})`; g.fillRect(x + r() * 216, 60 + r() * 380, 2 + r() * 60, 2); }
  }
  g.fillStyle = "#d9a93a"; g.fillRect(0, 0, 1024, 22); g.fillStyle = INK; g.fillRect(0, 22, 1024, 4);
});
const fresco = () => ctex("hallFresco", 1024, 1024, (g, r) => {
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 560);
  gr.addColorStop(0, "#fff6d8"); gr.addColorStop(0.25, "#ffe7a6"); gr.addColorStop(0.55, "#8fc0ec"); gr.addColorStop(1, "#4f8bd6");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  const p = new Pen(g);
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2, d = 300 + r() * 120, x = 512 + Math.cos(a) * d, y = 512 + Math.sin(a) * d;
    for (let n = 0; n < 4; n++) p.ell(x + (n - 1.5) * 34, y + Math.sin(n * 2.1) * 14, 46 + r() * 20, 34 + r() * 10, "#fbf6ee", 0);
  }
  // sun rays from the centre
  g.globalAlpha = 0.25;
  for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; g.fillStyle = "#fff3c4"; g.beginPath(); g.moveTo(512, 512); g.arc(512, 512, 520, a, a + 0.09); g.fill(); }
  g.globalAlpha = 1;
  g.strokeStyle = "#d9a93a"; g.lineWidth = 36; g.strokeRect(18, 18, 988, 988);
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(38, 38, 948, 948);
});
const curtain = () => ctex("niche", 512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 0);
  for (let i = 0; i <= 8; i++) gr.addColorStop(i / 8, i % 2 ? "#26402e" : "#35573f");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
});
const plaster = () => ctex("plaster", 1024, 1024, (g, r) => {
  g.fillStyle = "#e9d7b5"; g.fillRect(0, 0, 1024, 1024);
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(150,110,70,${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 30, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
  // a faded map of the Baltic pinned to the wall
  g.fillStyle = "#f3e6c8"; g.fillRect(560, 160, 380, 300); g.strokeStyle = "#8a6a44"; g.lineWidth = 6; g.strokeRect(560, 160, 380, 300);
  g.fillStyle = "#b9c9b0"; g.beginPath(); g.moveTo(600, 420); g.bezierCurveTo(640, 260, 760, 220, 820, 190); g.lineTo(900, 190); g.bezierCurveTo(860, 300, 760, 360, 720, 440); g.closePath(); g.fill();
});
// v2 set dressing: Swedish banners, a red runner, a ship painting, a bright window with a light shaft, candle halos
const banner = () => ctex("hallBanner", 256, 768, (g) => {
  g.fillStyle = "#1f4f9a"; g.fillRect(0, 0, 256, 700);
  g.beginPath(); g.moveTo(0, 700); g.lineTo(128, 768); g.lineTo(256, 700); g.fill();
  g.fillStyle = "#e6b93f"; g.fillRect(0, 0, 256, 26); g.fillRect(18, 40, 8, 640); g.fillRect(230, 40, 8, 640);
  const crown = (x: number, y: number, k: number) => {
    g.beginPath(); g.moveTo(x - 40 * k, y + 22 * k); g.lineTo(x - 46 * k, y - 18 * k); g.lineTo(x - 22 * k, y); g.lineTo(x, y - 30 * k);
    g.lineTo(x + 22 * k, y); g.lineTo(x + 46 * k, y - 18 * k); g.lineTo(x + 40 * k, y + 22 * k); g.closePath(); g.fill();
  };
  crown(128, 250, 1.4); crown(80, 400, 1.0); crown(176, 400, 1.0);
});
const runner = () => ctex("hallRunner", 256, 1024, (g, r) => {
  g.fillStyle = "#7c2324"; g.fillRect(0, 0, 256, 1024);
  for (let y = 0; y < 1024; y += 3) { g.fillStyle = `rgba(60,10,10,${0.05 + r() * 0.08})`; g.fillRect(0, y, 256, 2); }
  g.fillStyle = "#e0b04a"; g.fillRect(14, 0, 10, 1024); g.fillRect(232, 0, 10, 1024);
  g.fillStyle = "#6e1c1e"; g.fillRect(30, 0, 6, 1024); g.fillRect(220, 0, 6, 1024);
});
const shipPainting = () => ctex("shipPainting", 512, 384, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#f2c98a"); gr.addColorStop(0.55, "#e6a774"); gr.addColorStop(0.56, "#4f6f9a"); gr.addColorStop(1, "#2c4466");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 384);
  g.fillStyle = "#4a2a20"; g.beginPath(); g.moveTo(150, 200); g.lineTo(370, 200); g.lineTo(340, 240); g.lineTo(175, 240); g.closePath(); g.fill();
  g.fillStyle = "#3a2018"; for (const x of [210, 260, 310]) g.fillRect(x, 70, 6, 132);
  g.fillStyle = "#f6ead0"; for (const [x, w] of [[190, 46], [240, 52], [292, 44]] as const) { g.fillRect(x, 90, w, 40); g.fillRect(x + 4, 140, w - 8, 36); }
});
const windowTex = () => ctex("hallWindow", 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#fff7dc"); gr.addColorStop(1, "#ffd99a");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "#3a2414"; g.fillRect(0, 0, 256, 14); g.fillRect(0, 498, 256, 14); g.fillRect(0, 0, 14, 512); g.fillRect(242, 0, 14, 512);
  g.fillRect(121, 0, 14, 512); for (const y of [128, 256, 384]) g.fillRect(0, y - 5, 256, 10);
});
const shaftTex = () => ctex("lightShaft", 128, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(255,226,160,0.55)"); gr.addColorStop(1, "rgba(255,226,160,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 512);
  const gx = g.createLinearGradient(0, 0, 128, 0); gx.addColorStop(0, "rgba(0,0,0,1)"); gx.addColorStop(0.2, "rgba(0,0,0,0)"); gx.addColorStop(0.8, "rgba(0,0,0,0)"); gx.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = gx; g.fillRect(0, 0, 128, 512);
});
const haloTex = () => ctex("candleHalo", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,214,140,0.9)"); gr.addColorStop(0.3, "rgba(255,180,90,0.35)"); gr.addColorStop(1, "rgba(255,150,60,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const tableTop = () => ctex("deskTop", 2048, 1024, (g, r) => {
  g.fillStyle = "#8a5a34"; g.fillRect(0, 0, 2048, 1024);
  for (let y = 0; y < 1024; y += 3) { g.fillStyle = `rgba(${60 + r() * 30},${30 + r() * 15},10,${0.08 + r() * 0.1})`; g.fillRect(0, y, 2048, 1 + r() * 3); }
  for (let k = 0; k < 4; k++) { g.fillStyle = "rgba(40,20,8,0.35)"; g.fillRect(0, 250 * k + 240, 2048, 6); }
});

// ---------------- the hall ----------------
export const NICHE = { x0: -0.72, x1: 0.72, y0: 2.2, y1: 3.65, z: -6, back: -6.9 };
export const DESIGNER_CHAIR: [number, number, number] = [-4.4, 0, -1.6]; // v3: out in the open beside the table end (story.ts DCH)
export const buildHall = () => {
  const G = new THREE.Group(), b = new Batch();
  const floor = lam("planksHD", () => ({ map: planksHD() }));
  const wallM = lam("hallDamaskM", () => ({ map: damask() })), wainM = lam("hallWainM", () => ({ map: wainscot() }));
  const gold = lam("vasaGold", () => ({ color: "#d9a93a" })), dark = lam("vasaDark", () => ({ color: "#4a3020" }));
  const wood = lam("wood", () => ({ map: beam() }));
  const baize = lam("baize", () => ({ color: "#2f5a3c" }));
  const W0 = -7, W1 = 7, Z0 = -6, Z1 = 7, H = 5.6;
  // v3: floor, walls and ceiling overlap 5 cm at every corner and the back wall is a grid with shared corners (no edge
  // ends in the middle of another): v2's T-junctions let single pixels of the empty background through the seams above
  // the niche, and the ink pass outlined each one as a flickering black dot
  const E = 0.05;
  b.add(quad(V(W0 - E, 0, Z1 + E), V(W1 + E, 0, Z1 + E), V(W1 + E, 0, Z0 - E), V(W0 - E, 0, Z0 - E), 4, 4), floor);
  // back wall around the niche (damask above the wainscot); uv from world position so the pattern runs on across cells
  const { x0, x1, y0, y1, back } = NICHE;
  const XS = [W0 - E, x0, x1, W1 + E], YS = [-E, 1.2, y0, y1, H + E];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
    if (i === 1 && j === 2) continue; // the niche opening
    const xa = XS[i], xb = XS[i + 1], ya = YS[j], yb = YS[j + 1], wain = j === 0;
    const U = (x: number) => (wain ? (x - W0) / 3.4 : (x - W0) / 2.2), Vv = (y: number) => (wain ? y / 1.2 : (y - 1.2) / 2.2);
    b.add(quad(V(xa, ya, Z0), V(xb, ya, Z0), V(xb, yb, Z0), V(xa, yb, Z0), U(xb), Vv(yb), U(xa), Vv(ya)), wain ? wainM : wallM);
  }
  // the niche: dark green backdrop and side faces
  const nicheM = lam("nicheM", () => ({ map: curtain() }));
  // v3: the backdrop spans exactly the side faces (it used to run 1.6 m lower, so the side faces ended mid-edge and
  // the seam cracked open into single black dots)
  b.add(quad(V(x0, y0, back), V(x1, y0, back), V(x1, y1, back), V(x0, y1, back)), nicheM);
  b.add(quad(V(x0, y0, Z0), V(x0, y0, back), V(x0, y1, back), V(x0, y1, Z0)), nicheM);
  b.add(quad(V(x1, y0, back), V(x1, y0, Z0), V(x1, y1, Z0), V(x1, y1, back)), nicheM);
  b.add(quad(V(x0, y1, Z0), V(x0, y1, back), V(x1, y1, back), V(x1, y1, Z0)), nicheM);
  b.add(quad(V(x0, y0, back), V(x0, y0, Z0), V(x1, y0, Z0), V(x1, y0, back)), dark); // sill
  // gilded frame
  // v3: deep (0.35 m; at 0.12 m its depth step sat right on the ink threshold and the outline flickered) and built as
  // one closed ring: a 3x3 front grid minus the opening, sides split at the same vertices. v2 used four boxes whose
  // edges ended in the middle of each other's edges; the cracks showed the hidden faces inside as flickering dots
  const fw = 0.16, fz = 0.35, zf = Z0 + fz;
  const FX = [x0 - fw, x0, x1, x1 + fw], FY = [y0 - fw, y0, y1, y1 + fw];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== 1 || j !== 1)
    b.add(quad(V(FX[i], FY[j], zf), V(FX[i + 1], FY[j], zf), V(FX[i + 1], FY[j + 1], zf), V(FX[i], FY[j + 1], zf)), gold);
  for (let k = 0; k < 3; k++) {
    const ya = FY[k], yb = FY[k + 1], xa = FX[k], xb = FX[k + 1];
    b.add(quad(V(FX[0], ya, Z0), V(FX[0], ya, zf), V(FX[0], yb, zf), V(FX[0], yb, Z0)), gold); // outer left
    b.add(quad(V(FX[3], ya, zf), V(FX[3], ya, Z0), V(FX[3], yb, Z0), V(FX[3], yb, zf)), gold); // outer right
    b.add(quad(V(xa, FY[3], zf), V(xb, FY[3], zf), V(xb, FY[3], Z0), V(xa, FY[3], Z0)), gold); // outer top
    b.add(quad(V(xa, FY[0], Z0), V(xb, FY[0], Z0), V(xb, FY[0], zf), V(xa, FY[0], zf)), gold); // outer bottom
  }
  b.add(quad(V(x0, y0, zf), V(x0, y0, Z0), V(x0, y1, Z0), V(x0, y1, zf)), gold); // inner left
  b.add(quad(V(x1, y0, Z0), V(x1, y0, zf), V(x1, y1, zf), V(x1, y1, Z0)), gold); // inner right
  b.add(quad(V(x0, y1, Z0), V(x1, y1, Z0), V(x1, y1, zf), V(x0, y1, zf)), gold); // inner top
  b.add(quad(V(x0, y0, zf), V(x1, y0, zf), V(x1, y0, Z0), V(x0, y0, Z0)), gold); // inner bottom
  b.add(new THREE.SphereGeometry(0.16, 12, 8), gold, new THREE.Matrix4().makeTranslation(0, y1 + fw + 0.12, Z0 + fz / 2));
  // side walls
  for (const x of [W0, W1]) {
    const s = x < 0 ? 1 : -1;
    const q = (ya: number, yb: number, m: THREE.Material, tv: number) => b.add(s > 0
      ? quad(V(x, ya, Z1 + E), V(x, ya, Z0 - E), V(x, yb, Z0 - E), V(x, yb, Z1 + E), (Z1 - Z0) / 2.2, tv)
      : quad(V(x, ya, Z0 - E), V(x, ya, Z1 + E), V(x, yb, Z1 + E), V(x, yb, Z0 - E), (Z1 - Z0) / 2.2, tv), m);
    q(-E, 1.2, wainM, 1); q(1.2, H + E, wallM, (H - 1.2) / 2.2);
  }
  // ceiling: beams around a painted heaven
  const fres = lam("frescoM", () => ({ map: fresco() }));
  const ceil = lam("ceilM", () => ({ color: "#e8dcc4" }));
  const CX = [W0 - E, -2.4, 2.4, W1 + E], CZ = [Z0 - E, -5.0, -0.2, Z1 + E];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const xa = CX[i], xb = CX[i + 1], za = CZ[j], zb = CZ[j + 1], mid = i === 1 && j === 1;
    b.add(quad(V(xa, H, za), V(xb, H, za), V(xb, H, zb), V(xa, H, zb)), mid ? fres : ceil);
  }
  for (let z = Z0 + 0.5; z < Z1; z += 1.6) if (z < -5.2 || z > -0.1) b.add(boxGeo(V(W0, H - 0.3, z), V(W1, H, z + 0.3)), wood);
  b.add(boxGeo(V(-2.55, H - 0.25, -5.15), V(2.55, H, -5.0)), gold); b.add(boxGeo(V(-2.55, H - 0.25, -0.2), V(2.55, H, -0.05)), gold);
  b.add(boxGeo(V(-2.55, H - 0.25, -5.15), V(-2.4, H, -0.05)), gold); b.add(boxGeo(V(2.4, H - 0.25, -5.15), V(2.55, H, -0.05)), gold);
  // the inquiry table with green baize, legs
  b.add(boxGeo(V(-3, 0.74, -3.1), V(3, 0.8, -1.9)), baize);
  b.add(boxGeo(V(-3.05, 0.66, -3.15), V(3.05, 0.74, -1.85)), dark);
  for (const x of [-2.8, 2.8]) for (const z of [-3.0, -2.0]) b.add(boxGeo(V(x - 0.06, 0, z - 0.06), V(x + 0.06, 0.66, z + 0.06)), dark);
  // chairs behind the table (the commission is away)
  const chair = (x: number, z: number, red = true) => {
    const seat = red ? lam("vasaRed", () => ({ color: "#a8322a" })) : dark;
    b.add(boxGeo(V(x - 0.28, 0.45, z - 0.28), V(x + 0.28, 0.52, z + 0.28)), seat);
    b.add(boxGeo(V(x - 0.28, 0.52, z - 0.32), V(x + 0.28, 1.45, z - 0.24)), seat);
    b.add(boxGeo(V(x - 0.3, 1.45, z - 0.33), V(x + 0.3, 1.52, z - 0.23)), gold);
    for (const dx of [-0.24, 0.24]) for (const dz of [-0.24, 0.24]) b.add(boxGeo(V(x + dx - 0.03, 0, z + dz - 0.03), V(x + dx + 0.03, 0.45, z + dz + 0.03)), dark);
  };
  for (const x of [-1.6, 0, 1.6]) chair(x, -3.75);
  chair(DESIGNER_CHAIR[0], DESIGNER_CHAIR[2], false);
  // banners either side of the niche, a red runner down the middle, a ship painting and a window on the side walls
  const banM = lam("hallBannerM", () => ({ map: banner(), side: THREE.DoubleSide }));
  for (const x of [-2.3, 2.3]) {
    b.add(quad(V(x - 0.45, 1.5, Z0 + 0.04), V(x + 0.45, 1.5, Z0 + 0.04), V(x + 0.45, 4.6, Z0 + 0.04), V(x - 0.45, 4.6, Z0 + 0.04)), banM);
    b.add(cyl(V(x - 0.55, 4.62, Z0 + 0.08), V(x + 0.55, 4.62, Z0 + 0.08), 0.035), gold);
  }
  const runM = lam("hallRunnerM", () => ({ map: runner() }));
  b.add(quad(V(-0.95, 0.006, Z1), V(0.95, 0.006, Z1), V(0.95, 0.006, Z0), V(-0.95, 0.006, Z0), 1, 4), runM);
  const pm = lam("shipPaintingM", () => ({ map: shipPainting() }));
  b.add(quad(V(W0 + 0.03, 1.9, -1.0), V(W0 + 0.03, 1.9, -3.4), V(W0 + 0.03, 3.7, -3.4), V(W0 + 0.03, 3.7, -1.0)), pm);
  b.add(boxGeo(V(W0, 1.8, -3.5), V(W0 + 0.1, 1.9, -0.9)), gold); b.add(boxGeo(V(W0, 3.7, -3.5), V(W0 + 0.1, 3.8, -0.9)), gold);
  b.add(boxGeo(V(W0, 1.8, -3.5), V(W0 + 0.1, 3.8, -3.4)), gold); b.add(boxGeo(V(W0, 1.8, -1.0), V(W0 + 0.1, 3.8, -0.9)), gold);
  b.build(G);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), new THREE.MeshBasicMaterial({ map: windowTex(), toneMapped: false }));
  win.rotation.y = -Math.PI / 2; win.position.set(W1 - 0.02, 2.9, -2.4); G.add(win);
  // the window's light shaft falling across the room, and soft halos round every flame (both never inked)
  const shaftM = new THREE.MeshBasicMaterial({ map: shaftTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
  for (const dz of [-0.35, 0, 0.35]) {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 6.5), shaftM);
    sh.position.set(W1 - 2.6, 1.6, -2.4 + dz); sh.rotation.set(0, Math.PI / 2, -0.75); sh.layers.set(3); sh.renderOrder = 5; G.add(sh);
  }
  G.userData.halos = [] as THREE.Mesh[];
  // candles on the table and the chandelier: emissive flames (they bloom)
  const wax = lam("wax", () => ({ color: "#f3ead6" })), flameM = glow(3.2, 2.0, 0.7);
  const cb = new Batch();
  const candle = (x: number, y: number, z: number, h = 0.22) => {
    cb.add(cyl(V(x, y, z), V(x, y + h, z), 0.025), wax);
    cb.add(cyl(V(x, y - 0.02, z), V(x, y + 0.02, z), 0.06), gold);
  };
  for (const x of [-2.2, -0.6, 0.6, 2.2]) candle(x, 0.8, -2.5);
  candle(DESIGNER_CHAIR[0] + 0.36, 0, DESIGNER_CHAIR[2] + 0.18, 0.9);
  const ring = new THREE.TorusGeometry(0.9, 0.05, 8, 32).rotateX(Math.PI / 2).translate(0, 4.4, -2.6);
  cb.add(ring, gold);
  cb.add(cyl(V(0, 4.4, -2.6), V(0, H, -2.6), 0.03), gold);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; candle(Math.cos(a) * 0.9, 4.45, -2.6 + Math.sin(a) * 0.9, 0.16); }
  cb.build(G);
  const flames: [number, number, number][] = [];
  for (const x of [-2.2, -0.6, 0.6, 2.2]) flames.push([x, 0.8 + 0.22, -2.5]);
  flames.push([DESIGNER_CHAIR[0] + 0.36, 0.9, DESIGNER_CHAIR[2] + 0.18]);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; flames.push([Math.cos(a) * 0.9, 4.45 + 0.16, -2.6 + Math.sin(a) * 0.9]); }
  const fg = new THREE.ConeGeometry(0.022, 0.08, 8).translate(0, 0.05, 0);
  const haloM = new THREE.SpriteMaterial({ map: haloTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  for (const [x, y, z] of flames) {
    const m = new THREE.Mesh(fg, flameM); m.position.set(x, y, z); G.add(m);
    const h = new THREE.Sprite(haloM); h.position.set(x, y + 0.05, z); h.scale.setScalar(y > 2 ? 0.55 : 0.4); h.layers.set(3); G.add(h);
  }
  G.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.material !== flameM && m.material !== shaftM && m !== win) { o.castShadow = true; o.receiveShadow = true; } });
  return G;
};

// ---------------- the table and the toy ----------------
const toyTex = () => ctex("budaoweng", 1024, 512, (g) => {
  // u wraps around (face at u = .5), v: 0 at the bottom .. 1 at the crown (canvas y flipped)
  const Y = (v: number) => 512 - v * 512;
  g.fillStyle = "#c8302c"; g.fillRect(0, 0, 1024, 512);
  // gold carving bands and scrolls on the body (like the ship's stern)
  g.fillStyle = "#e3b84a"; g.fillRect(0, Y(0.16), 1024, 10); g.fillRect(0, Y(0.5), 1024, 12);
  g.strokeStyle = "#e3b84a"; g.lineWidth = 9;
  for (let x = 40; x < 1024; x += 128) { g.beginPath(); g.arc(x, Y(0.33), 34, 0.3, Math.PI * 1.7); g.stroke(); }
  // the head: white face, black hair cap
  g.fillStyle = "#1e1a22"; g.fillRect(0, 0, 1024, Y(0.86));
  g.fillStyle = "#f6e7d4"; g.beginPath(); g.ellipse(512, Y(0.71), 150, 64, 0, 0, 7); g.fill();
  g.fillStyle = INK;
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(512 + s * 50, Y(0.74), 11, 16, 0, 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(512, Y(0.69), 30, 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = "rgba(230,90,90,0.55)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(512 + s * 95, Y(0.68), 22, 12, 0, 0, 7); g.fill(); }
});
export const TOY = { R: 0.05, H: 0.15 };
/** v3: upside down it rolls on its round head (radius 0.033) and comes to rest on its side with body and head both on
 *  the table: tilt 1.298 rad from upright (v2 pivoted on the crown point, so the body sank into the table) */
export const TOY_FALL = { th: Math.acos(0.017 / 0.063), t0: 52.55, k: 0.03, w: 3.2, r: 0.033, top: 0.146 };
export const toyLandT = () => TOY_FALL.t0 + Math.acosh(TOY_FALL.th / TOY_FALL.k) / TOY_FALL.w;
export type Toy = { group: THREE.Group; body: THREE.Mesh; mat: THREE.MeshLambertMaterial; weight: THREE.Mesh; inner: THREE.Group };
const toyProfile = () => {
  const pts: THREE.Vector2[] = [], R = TOY.R, r = 0.033, hc = 0.113;
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * (Math.PI * 0.8); pts.push(new THREE.Vector2(Math.max(0.0005, R * Math.cos(a)), R + R * Math.sin(a))); }
  const neckY = 0.088;
  pts.push(new THREE.Vector2(0.03, neckY));
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + 0.55 + (i / 12) * (Math.PI - 0.55); pts.push(new THREE.Vector2(Math.max(0.0005, r * Math.cos(a)), hc + r * Math.sin(a))); }
  return pts;
};
export const buildTable = (): { group: THREE.Group; toy: Toy } => {
  const G = new THREE.Group(), b = new Batch();
  const top = lam("deskTopM", () => ({ map: tableTop() }));
  b.add(quad(V(-1.2, 0, 0.8), V(1.6, 0, 0.8), V(1.6, 0, -0.62), V(-1.2, 0, -0.62), 1, 1), top);
  const wallM = lam("plasterM", () => ({ map: plaster() }));
  b.add(quad(V(-1.2, -0.02, -0.62), V(1.6, -0.02, -0.62), V(1.6, 1.5, -0.62), V(-1.2, 1.5, -0.62)), wallM);
  // books and a brass lamp
  const cols = ["#2f4f8a", "#8c3b4a", "#5d7a3a", "#b5653f"];
  cols.forEach((c, i) => b.add(boxGeo(V(0.2, i * 0.035, -0.5 + (i % 2) * 0.01), V(0.42 - i * 0.015, (i + 1) * 0.035 - 0.003, -0.32 - (i % 2) * 0.02)), lam("book" + c, () => ({ color: c }))));
  const brass = lam("vasaGold", () => ({ color: "#d9a93a" }));
  b.add(cyl(V(-0.38, 0, -0.4), V(-0.38, 0.02, -0.4), 0.07), brass);
  b.add(cyl(V(-0.38, 0.02, -0.4), V(-0.38, 0.3, -0.4), 0.008), brass);
  b.add(new THREE.ConeGeometry(0.09, 0.09, 24, 1, true).translate(-0.38, 0.33, -0.4), lam("lampShade", () => ({ color: "#2f5a3c", side: THREE.DoubleSide })));
  b.build(G);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), glow(3, 2.3, 1.2)); bulb.position.set(-0.38, 0.29, -0.4); G.add(bulb);
  // the toy: lathe body (red and gold, painted face), a lead weight inside the bottom for the x-ray beat
  const mat = twoTone(new THREE.MeshLambertMaterial({ map: toyTex(), transparent: true, opacity: 1 }));
  const body = new THREE.Mesh(new THREE.LatheGeometry(toyProfile(), 48), mat);
  body.rotation.y = Math.PI; body.castShadow = true; body.receiveShadow = true;
  const weight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), glow(2.6, 1.2, 0.35));
  weight.position.set(0, 0.034, 0); weight.visible = false;
  const inner = new THREE.Group(); inner.add(body, weight);
  const group = new THREE.Group(); group.add(inner);
  G.add(group);
  G.traverse((o) => { if ((o as THREE.Mesh).isMesh && o !== bulb && o !== weight) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: G, toy: { group, body, mat, weight, inner } };
};

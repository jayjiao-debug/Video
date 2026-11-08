// Backtest B: rebuild of "Why Sailors Carried Storm Oil" 0.0-2.67 s with the upgraded kit.
// One continuous camera: medium close-up of the chef tipping a copper pot over the rail, crane down the hull
// following the oil stream to the splash, hold, then a fast swing along the hull that reveals the pirate ship.
// Word-by-word captions. Chef = the film's 2D card (chef hat, no drawn arms: 3D arms reach the pot handles);
// everything else is 3D, including the splash crown, droplets and foam.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, NOINK, noInkFallback } from "../vasa/ink";
import { Kick } from "../vasa/Kick";
import { LensBlur } from "../vasa/lensblur";
import { GradeEffect, GradeParams } from "../vasa/grade";
import { TONE, CHAR } from "../vasa/shade";
import { LIGHTS } from "../vasa/lights";
import { Pool, Actor } from "../vasa/cast";
import { bodyFront, Pen, Outfit } from "../vasa/toon";
import * as P from "./props";

export const OIL_FRAMES = 81;
const FPS = 30;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const easeIO = (x: number) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: THREE.Vector3, b: THREE.Vector3, t: number) => a.clone().lerp(b, t);

// ---------------- assets ----------------
type Tex = { deck: THREE.Texture; pano: THREE.Texture; enemy: THREE.Texture; isl: THREE.Texture };
const loadTex = async (): Promise<Tex> => {
  const L = new THREE.TextureLoader();
  const [deck, panoImg, enemyImg, islImg] = await Promise.all(["bt/deck_planks.jpg", "bt/sea_pano.jpg", "bt/enemy_ship.png", "bt/islands_pano.jpg"].map((u) => L.loadAsync(staticFile(u))));
  const im = islImg.image as HTMLImageElement, cv = document.createElement("canvas"); cv.width = im.width; cv.height = im.height;
  const g2 = cv.getContext("2d")!; g2.drawImage(im, 0, 0);
  g2.globalCompositeOperation = "destination-in";
  const gr = g2.createLinearGradient(0, 0, cv.width, 0);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.3, "rgba(0,0,0,1)"); gr.addColorStop(0.9, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g2.fillStyle = gr; g2.fillRect(0, 0, cv.width, cv.height);
  const gv = g2.createLinearGradient(0, 0, 0, cv.height); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(0.3, "rgba(0,0,0,1)"); gv.addColorStop(1, "rgba(0,0,0,1)");
  g2.fillStyle = gv; g2.fillRect(0, 0, cv.width, cv.height);
  const isl = new THREE.CanvasTexture(cv);
  // sky + open sea only (left half of the plate, mirrored): the rocks come from the island arc ahead
  const pim = panoImg.image as HTMLImageElement, pc = document.createElement("canvas"); pc.width = pim.width; pc.height = pim.height;
  const pg = pc.getContext("2d")!, hw = pim.width / 2;
  pg.drawImage(pim, 0, 0, hw, pim.height, 0, 0, hw, pim.height);
  pg.save(); pg.translate(pim.width, 0); pg.scale(-1, 1); pg.drawImage(pim, 0, 0, hw, pim.height, 0, 0, hw, pim.height); pg.restore();
  pg.globalCompositeOperation = "multiply";
  const sky = pg.createLinearGradient(0, 0, 0, pim.height * 0.62);
  sky.addColorStop(0, "#3d6fe6"); sky.addColorStop(0.55, "#9db8f4"); sky.addColorStop(1, "#ffffff");
  pg.fillStyle = sky; pg.fillRect(0, 0, pim.width, pim.height * 0.62); pg.globalCompositeOperation = "source-over";
  const pano = new THREE.CanvasTexture(pc);
  // pirate ship: recolour the pale sails orange (bright, low-saturation pixels), keep everything else
  const eim = enemyImg.image as HTMLImageElement, ec = document.createElement("canvas"); ec.width = eim.width; ec.height = eim.height;
  const eg = ec.getContext("2d")!; eg.drawImage(eim, 0, 0);
  const px = eg.getImageData(0, 0, ec.width, ec.height), d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (d[i + 3] > 10 && mx > 170 && mx - mn < 60) { const k = mx / 255; d[i] = Math.round(244 * k); d[i + 1] = Math.round(118 * k * k); d[i + 2] = Math.round(38 * k); }
  }
  eg.putImageData(px, 0, 0);
  const enemy = new THREE.CanvasTexture(ec);
  for (const t of [deck, pano, enemy, isl]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }
  deck.wrapS = deck.wrapT = THREE.RepeatWrapping;
  pano.wrapS = THREE.MirroredRepeatWrapping;
  const font = new FontFace("BtCap", `url(${staticFile("bt/nunito900.ttf")})`);
  await font.load(); (document.fonts as any).add(font);
  return { deck, pano, enemy, isl };
};

// ---------------- character ----------------
const CHEF: Outfit = { jacket: "#f3f1ec", pants: "#2e3550", boots: "#2b2522", hat: "chef", buttons: "#c9ced6", build: "adult", skin: "#ffffff" };
const CHEF_AT = V(-0.22, 4.2, -0.05);

// ---------------- camera ----------------
type Cam = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };
/** pot pose: base on the rail, turned toward camera-left (+z), tipped 0.9 rad; LIP = pour point, DIR = pour direction */
const POT = V(0.45, 4.95, 0), POT_YAW = -0.53, POT_K = 0.62;
const DIR = V(Math.cos(POT_YAW), 0, -Math.sin(POT_YAW));
const LIP = POT.clone().add(DIR.clone().multiplyScalar(0.5 * POT_K)).add(V(0, -0.04 * POT_K, 0));
const FALL_T = Math.sqrt((2 * LIP.y) / 9.8), POUR_V = 0.5;
const HIT = V(LIP.x + POUR_V * FALL_T * DIR.x, 0, LIP.z + POUR_V * FALL_T * DIR.z);
type CamK = { f: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
/** MCU on the chef -> fast crane down the stream, swinging aft so the hull rakes away -> low on the splash ->
 *  swing to look forward along the hull and dolly toward the pirate ship */
const KEYS: CamK[] = [
  { f: 0, pos: [3.1, 5.6, -0.2], look: [-0.2, 5.36, 0.05], fov: 40 },
  { f: 18, pos: [2.7, 5.5, -0.75], look: [-0.2, 5.3, 0.05], fov: 42 },
  { f: 26, pos: [2.3, 3.9, -1.3], look: [0.4, 4.3, 0.2], fov: 56 },
  { f: 36, pos: [2.9, 0.9, -2.6], look: [1.0, 1.1, 0.6], fov: 66 },
  { f: 50, pos: [3.2, 0.82, -2.9], look: [1.1, 0.95, 0.9], fov: 66 },
  { f: 62, pos: [3.3, 0.82, -2.6], look: [1.15, 1.0, 1.6], fov: 66 },
  { f: 68, pos: [2.9, 0.86, -0.9], look: [1.3, 1.8, 10], fov: 64 },
  { f: 74, pos: [2.5, 0.92, 1.2], look: [1.4, 2.5, 22], fov: 62 },
  { f: 80, pos: [2.4, 1.0, 6.0], look: [1.0, 3.4, 34], fov: 62 },
];
/** Fritsch-Carlson monotone cubic through (t, y) keys: smooth, and never overshoots or backs up between keys */
const monotone = (ts: number[], ys: number[]) => {
  const n = ts.length, d: number[] = [], m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (ts[i + 1] - ts[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] * (ts[i + 1] - ts[i]) + d[i] * (ts[i] - ts[i - 1])) / (ts[i + 1] - ts[i - 1]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i];
    if (a < 0) m[i] = 0; if (b < 0) m[i + 1] = 0;
    const h = a * a + b * b; if (h > 9) { const k = 3 / Math.sqrt(h); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (t: number) => {
    let i = 0; while (i < n - 2 && t > ts[i + 1]) i++;
    const hh = ts[i + 1] - ts[i], u = clamp01((t - ts[i]) / hh), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * hh * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * hh * m[i + 1];
  };
};
const CH = (() => {
  const ts = KEYS.map((k) => k.f), ch = (fn: (k: CamK) => number) => monotone(ts, KEYS.map(fn));
  return [0, 1, 2].map((j) => ch((k) => k.pos[j])).concat([0, 1, 2].map((j) => ch((k) => k.look[j])), [ch((k) => k.fov)]);
})();
const camAt = (f: number): Cam => ({ pos: V(CH[0](f), CH[1](f), CH[2](f)), look: V(CH[3](f), CH[4](f), CH[5](f)), fov: CH[6](f) });
/** Dutch roll (rad): leans in on the cook, swings the other way on the drop, levels out on the reveal */
const rollAt = (f: number) => 0.045 - 0.075 * ease((f - 8) / 32) + 0.03 * ease((f - 60) / 16);

// ---------------- geometry helpers ----------------
/** hull outer face x at station z: straight run, curving in to the bow past z = 24 */
const hullX = (z: number) => (z > 22 ? -3.6 * Math.pow(Math.min(1, (z - 22) / 12), 2) : 0); // bow closes to the centreline at z = 34
/** section: the side bellies out to 0.45 m at y = 2.2 and tumbles home to ~0.05 m at the rail */
const XO = (y: number) => 0.6 * Math.max(0, 1 - ((y - 2.2) / 2.8) ** 2);
const XOd = (y: number) => (Math.abs(y - 2.2) < 2.8 ? -0.6 * 2 * (y - 2.2) / (2.8 * 2.8) : 0);
/** outward surface normal of the side at height y */
const hullN = (y: number) => V(1, -XOd(y), 0).normalize();
/** a horizontal strip of the hull side between heights y0..y1 (rows every 0.2 m so it follows the section), standing
 *  proud by dx, with top/bottom lips when proud */
const strip = (y0: number, y1: number, dx: number, mat: THREE.Material, vScale = 2.4) => {
  const zs: number[] = []; for (let z = -40; z <= 34.01; z += 0.4) zs.push(z);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const sheet = (ys: number[], xa: (y: number) => number) => {
    const s0 = pos.length / 3, n = ys.length;
    zs.forEach((z) => { for (const y of ys) { pos.push(hullX(z) + xa(y), y, z); uv.push(z / 6, y / vScale); } });
    for (let i = 0; i < zs.length - 1; i++) for (let k = 0; k < n - 1; k++) {
      const a = s0 + i * n + k, b = a + 1, c = a + n, d = c + 1;
      idx.push(a, b, c, b, d, c); // outward (+x) facing
    }
  };
  const rows = Math.max(1, Math.ceil((y1 - y0) / 0.2)), ys = Array.from({ length: rows + 1 }, (_, k) => y0 + ((y1 - y0) * k) / rows);
  sheet(ys, (y) => XO(y) + dx);
  if (dx > 0) {
    // lips: thin horizontal faces from the hull to the proud face (two vertices per station at the same y)
    const lip = (y: number, up: boolean) => {
      const s0 = pos.length / 3;
      zs.forEach((z) => { const hx = hullX(z) + XO(y); pos.push(hx, y, z, hx + dx, y, z); uv.push(z / 6, 0, z / 6, 0.02); });
      for (let i = 0; i < zs.length - 1; i++) { const a = s0 + 2 * i; if (up) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); else idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    };
    lip(y1, true); lip(y0, false);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
  return m;
};
/** a round bar between two points */
const bar = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
  const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.castShadow = true;
  return m;
};
/** foam: white blobs on transparent, tiling along u */
const foamTex = (w: number, h: number, seed: number, band: boolean) => P.canvasTex(w, h, (g) => {
  g.clearRect(0, 0, w, h);
  let sd = seed; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  for (let i = 0; i < (band ? 120 : 90); i++) {
    const x = r() * w, y = band ? h * (0.15 + 0.55 * r() * r()) : h / 2, rr = band ? 6 + 16 * r() : 0;
    if (band) { g.fillStyle = `rgba(255,255,255,${(0.7 + 0.3 * r()).toFixed(2)})`; g.beginPath(); g.ellipse(x, y, rr * 1.8, rr * 0.7, 0, 0, Math.PI * 2); g.fill(); }
  }
  if (!band) { // ring of foam around the splash
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = w * (0.18 + 0.26 * r()), rr = 8 + 22 * r();
      g.fillStyle = `rgba(255,255,255,${(0.75 + 0.25 * r()).toFixed(2)})`; g.beginPath(); g.ellipse(cx + d * Math.cos(a), cy + d * Math.sin(a), rr, rr * 0.8, a, 0, Math.PI * 2); g.fill(); }
  }
});

/** long horizontal hull planks: 8 rows over the texture, rare butt joints, seam + lit edge per row (1024 px = 6 m) */
const hullPlanks = (base: string) => P.canvasTex(1024, 512, (g) => {
  const c = new THREE.Color(base); let sd = 11; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
  const rows = 8, h = 512 / rows;
  for (let i = 0; i < rows; i++) {
    const y0 = i * h, k = 0.86 + 0.2 * r();
    g.fillStyle = `#${c.clone().multiplyScalar(k).getHexString()}`; g.fillRect(0, y0, 1024, h);
    for (let j = 0; j < 5; j++) { g.fillStyle = `rgba(90,20,10,${0.05 + 0.06 * r()})`; g.fillRect(0, y0 + h * r(), 1024, 1 + 2 * r()); }
    g.fillStyle = "rgba(255,220,190,0.18)"; g.fillRect(0, y0 + 2, 1024, 3);
    g.fillStyle = "rgba(45,8,4,0.75)"; g.fillRect(0, y0 + h - 5, 1024, 5);
    for (let j = 0; j < 3; j++) { g.fillStyle = `rgba(40,10,5,${0.06 + 0.06 * r()})`; g.fillRect(1024 * r(), y0, 60 + 200 * r(), h); } // grime patches
    const jx = 1024 * r(); g.fillStyle = "rgba(60,12,6,0.45)"; g.fillRect(jx, y0, 3, h);
  }
});
const goldMatcap = () => P.canvasTex(256, 256, (g) => {
  const grd = g.createRadialGradient(96, 84, 4, 128, 128, 128);
  grd.addColorStop(0, "#fffbe0"); grd.addColorStop(0.25, "#ffe08a"); grd.addColorStop(0.6, "#e6aa32"); grd.addColorStop(0.88, "#a8701a"); grd.addColorStop(1, "#6e4610");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
}, false);
const copperMatcap = () => P.canvasTex(256, 256, (g) => {
  const grd = g.createRadialGradient(96, 84, 4, 128, 128, 128);
  grd.addColorStop(0, "#ffe2c0"); grd.addColorStop(0.25, "#f2a868"); grd.addColorStop(0.6, "#c86a30"); grd.addColorStop(0.9, "#7e3a16"); grd.addColorStop(1, "#4e220c");
  g.fillStyle = grd; g.beginPath(); g.arc(128, 128, 128, 0, Math.PI * 2); g.fill();
}, false);

// ---------------- world ----------------
class OilWorld {
  root = new THREE.Group(); pool = new Pool();
  chef: Actor; rings: THREE.Mesh[] = []; stream: THREE.Mesh; streamMat: THREE.MeshBasicMaterial; pot = new THREE.Group();
  crown: THREE.Mesh; oilS: THREE.Mesh; splat: THREE.Mesh[] = []; enemyFoam: THREE.Mesh; drops: THREE.Mesh[] = []; tips: THREE.Mesh[] = []; foam: THREE.Mesh; arms: THREE.Mesh[] = []; hands: THREE.Mesh[] = []; armMat: THREE.MeshBasicMaterial;
  sun: THREE.DirectionalLight; waterMat: THREE.ShaderMaterial; enemy: THREE.Mesh;
  constructor(T: Tex) {
    const R = this.root;
    // --- materials
    const red = P.lam({ map: hullPlanks("#a2261a"), side: THREE.DoubleSide });
    const cream = P.lam({ color: "#f1e3c2", side: THREE.DoubleSide });
    const wale = P.lam({ color: "#3d261a", side: THREE.DoubleSide });
    const railW = P.lam({ map: P.staves("#d08a45", 3, "rgba(90,40,10,0.45)", 256, 256) });
    const teal = P.lam({ map: P.paintedPlanks("#2f8a86", 5, 0) });
    const deckT = T.deck.clone(); deckT.needsUpdate = true; deckT.repeat.set(7 / 2, 50 / 2);
    const deck = P.lam({ map: deckT });
    const mastM = P.lam({ map: P.staves("#a8703c", 2, "rgba(60,30,10,0.3)", 128, 512) });
    const iron = P.lam({ color: "#34363c" });
    const rigM = P.lam({ color: "#4a3426" });
    const gold = new THREE.MeshMatcapMaterial({ matcap: goldMatcap() });
    const glass = new THREE.MeshBasicMaterial({ color: "#16233a" });
    const copper = new THREE.MeshMatcapMaterial({ matcap: copperMatcap() });
    const potIn = new THREE.MeshMatcapMaterial({ matcap: P.metalMatcap(), side: THREE.DoubleSide });
    const oil = new THREE.MeshBasicMaterial({ color: "#e8d65c", side: THREE.DoubleSide });
    // --- hull side (outer face at x = hullX(z)), waterline y = 0, deck 4.2, rail 5.05
    R.add(strip(-0.02, 0.16, 0.03, wale)); // dark waterline strake (stops at the waterline: the see-through sea would show its lower edge as an ink line)
    R.add(strip(0.16, 2.85, 0, red));
    R.add(strip(2.85, 3.1, 0.07, wale));
    R.add(strip(3.1, 4.2, 0, cream));
    R.add(strip(4.2, 4.32, 0.05, wale));
    R.add(strip(4.32, 4.8, 0.02, red));
    // cap rail
    { const g = new THREE.BoxGeometry(0.34, 0.1, 62); g.translate(-0.08, 4.85, -9); const m = new THREE.Mesh(g, railW); m.castShadow = m.receiveShadow = true; R.add(m); }
    R.add(strip(4.8, 4.92, 0.1, railW)); // rail moulding that follows the bow
    // inner bulwark face + deck + far bulwark
    { const g = new THREE.PlaneGeometry(62, 0.6); g.rotateY(-Math.PI / 2); g.translate(-0.2, 4.2 + 0.3, -9); R.add(new THREE.Mesh(g, teal)); }
    { const g = new THREE.PlaneGeometry(7, 50); g.rotateX(-Math.PI / 2); g.translate(-3.7, 4.2, -15); const m = new THREE.Mesh(g, deck); m.receiveShadow = true; R.add(m); }
    { const g = new THREE.BoxGeometry(0.16, 1.0, 50); g.translate(-7.1, 4.7, -15); const m = new THREE.Mesh(g, teal); m.castShadow = m.receiveShadow = true; R.add(m);
      const c = new THREE.BoxGeometry(0.34, 0.1, 50); c.translate(-7.1, 5.24, -15); R.add(new THREE.Mesh(c, railW)); }
    // portholes: gold rings with dark glass, upper row in the cream band, lower row in the red planks
    const ringG = new THREE.TorusGeometry(0.21, 0.055, 12, 36), glassG = new THREE.CircleGeometry(0.2, 32), hiG = new THREE.CircleGeometry(0.07, 16);
    const hiM = new THREE.MeshBasicMaterial({ color: "#8fb3d8" });
    for (const [y, z0, step] of [[3.65, -25.1, 3.2]] as [number, number, number][]) {
      for (let z = z0; z < 20; z += step) {
        if ([-12.5, 12].some((mz) => Math.abs(z - mz) < 1.45)) continue; // keep clear of the chainplates
        const x = hullX(z) + XO(y), n = hullN(y), at = (o: THREE.Object3D, k: number) => { o.position.set(x, y, z).addScaledVector(n, k); o.lookAt(o.position.clone().add(n)); };
        const r = new THREE.Mesh(ringG, gold); at(r, 0.04); r.castShadow = true; R.add(r);
        const gl = new THREE.Mesh(glassG, glass); at(gl, 0.012); R.add(gl);
        const hi = new THREE.Mesh(hiG, hiM); at(hi, 0.02); hi.position.y += 0.09; hi.position.z += 0.09; R.add(hi);
      }
    }
    // mast + shrouds down to the rail (rig on the NOINK layer: thin painted lines, no heavy outlines)
    const rigG = new THREE.Group(); rigG.position.y = 4.2;
    const rig = P.mastRig(-2.6, -1.2, -7.0, mastM, iron, rigM); // mast right behind the chef; its shrouds go to the far rail so nothing crosses him
    rig.children[rig.children.length - 1].layers.set(NOINK); rigG.add(rig);
    const rig2 = P.mastRig(-2.6, -12.5, 0.25, mastM, iron, rigM); rig2.children[rig2.children.length - 1].layers.set(NOINK); rigG.add(rig2);
    const rig3 = P.mastRig(-2.6, 12, 0.25, mastM, iron, rigM); rig3.children[rig3.children.length - 1].layers.set(NOINK); rigG.add(rig3);
    { const cloth = P.lam({ map: P.clothTex(), side: THREE.DoubleSide });
      for (const sl of [P.sail(-2.6, 5.6, 12.3, 5.4, 3.6, cloth, mastM), P.sail(-2.6, 9.0, 12.35, 4.4, 2.6, cloth, mastM)]) { sl.traverse((o) => { o.castShadow = false; }); rigG.add(sl); } }
    R.add(rigG);
    const deadM = P.lam({ color: "#4a2d1c" });
    for (const mz of [-12.5, 12]) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 2.1).translate(0.26, 4.5, mz), railW); ch.castShadow = ch.receiveShadow = true; R.add(ch);
      for (let i = 0; i < 5; i++) {
        const z = mz - 0.8 + 0.4 * i;
        const de = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 18).rotateZ(Math.PI / 2).translate(0.34, 4.62, z), deadM); de.castShadow = true; R.add(de);
        R.add(bar(V(XO(3.1) + 0.08, 3.1, z), V(0.36, 4.5, z), 0.018, iron));   // chainplate from the wale to the channel
        R.add(bar(V(0.31, 4.68, z), V(0.3, 5.26, z), 0.012, rigM));             // lanyard up to the shroud
      }
    }
    // copper pot, tipped out over the rail
    {
      const prof: [number, number][] = [[0, 0], [0.25, 0], [0.29, 0.03], [0.3, 0.3], [0.32, 0.33], [0.3, 0.335], [0.28, 0.05], [0, 0.05]];
      const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40), copper); body.castShadow = true;
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.27, 0.27, 36, 1, true).translate(0, 0.19, 0), potIn);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.025, 10, 40).rotateX(Math.PI / 2).translate(0, 0.335, 0), gold);
      this.oilS = new THREE.Mesh(new THREE.BufferGeometry(), oil); this.oilS.layers.set(NOINK);
      for (const s of [-1, 1]) { const hg = new THREE.TorusGeometry(0.07, 0.02, 8, 20, Math.PI).rotateZ(Math.PI / 2).rotateY((s * Math.PI) / 2).translate(0, 0.22, s * 0.295); this.pot.add(new THREE.Mesh(hg, iron)); }
      this.pot.add(body, inner, rim, this.oilS);
      this.pot.rotation.z = -0.9; this.pot.scale.setScalar(POT_K);
      const yaw = new THREE.Group(); yaw.position.copy(POT); yaw.rotation.y = POT_YAW; yaw.add(this.pot);
      R.add(yaw);
    }
    // oil stream (rebuilt per frame)
    this.streamMat = new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float k = abs(dot(normalize(vN), normalize(vV))); vec3 edge = vec3(0.86,0.7,0.12), core = vec3(1.0,0.95,0.5); vec3 c = mix(edge, core, smoothstep(0.15, 0.75, k)); c = mix(c, vec3(1.0,0.98,0.85), smoothstep(0.9, 0.99, k) * 0.6); gl_FragColor = vec4(pow(c, vec3(2.2)), 1.0); }",
    }) as unknown as THREE.MeshBasicMaterial;
    this.stream = new THREE.Mesh(new THREE.BufferGeometry(), this.streamMat); this.stream.castShadow = false; this.stream.layers.set(NOINK); R.add(this.stream);
    // splash crown: a ring of petals standing on the water (rebuilt per frame), droplets, flat foam
    this.crown = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })); this.crown.layers.set(NOINK); R.add(this.crown);
    const dg = new THREE.SphereGeometry(1, 10, 8), dm = new THREE.MeshBasicMaterial({ color: "#ffffff" }), dmG = new THREE.MeshBasicMaterial({ color: "#f2cf52" });
    for (let i = 0; i < 30; i++) { const d = new THREE.Mesh(dg, i % 3 ? dm : dmG); d.layers.set(NOINK); R.add(d); this.drops.push(d); }
    for (let i = 0; i < 20; i++) { const d = new THREE.Mesh(dg, i % 3 ? dm : dmG); d.layers.set(NOINK); R.add(d); this.tips.push(d); }
    { // irregular cel splat: blue-grey edge, white foam sheet, gold slick on top
      const blob = (seed: number, amp: number) => { const sh = new THREE.Shape(); for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2;
          const r = 1 + amp * (0.6 * Math.sin(3 * a + seed) + 0.4 * Math.sin(7 * a + 2 * seed) + 0.25 * Math.sin(13 * a + 3 * seed));
          if (i) sh.lineTo(r * Math.cos(a), r * Math.sin(a)); else sh.moveTo(r * Math.cos(a), r * Math.sin(a)); }
        return new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2); };
      const g1 = blob(1.3, 0.12), g2 = blob(4.1, 0.16);
      for (const [g, col, y, ro, op] of [[g1, "#86c2dc", 0.006, -0.45, 1], [g1, "#f4fbff", 0.009, -0.4, 1], [g2, "#e6bb3a", 0.012, -0.35, 0.9]] as [THREE.BufferGeometry, string, number, number, number][]) {
        const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false }));
        m.position.set(HIT.x, y, HIT.z); m.layers.set(NOINK); m.renderOrder = ro; R.add(m); this.splat.push(m);
      } }
    this.foam = new THREE.Mesh(new THREE.CircleGeometry(1.05, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: foamTex(512, 512, 7, false), transparent: true, depthWrite: false }));
    this.foam.position.set(HIT.x, 0.015, HIT.z); this.foam.layers.set(NOINK); this.foam.renderOrder = 0; R.add(this.foam);
    { const ft = foamTex(1024, 128, 5, true); ft.wrapS = THREE.RepeatWrapping; ft.repeat.set(12, 1);
      const fg = new THREE.PlaneGeometry(72, 0.5).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(XO(0) + 0.22, 0.012, -4.2);
      const fl = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false })); fl.layers.set(NOINK); fl.renderOrder = 0; R.add(fl); }
    this.armMat = new THREE.MeshBasicMaterial({ color: "#3b3737" });
    for (let i = 0; i < 2; i++) { const a = new THREE.Mesh(new THREE.BufferGeometry(), this.armMat); R.add(a); this.arms.push(a);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), new THREE.MeshBasicMaterial({ color: "#1d1b1b" })); R.add(h); this.hands.push(h); }
    // sea
    this.waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uScroll: { value: new THREE.Vector2() }, uStreak: { value: P.canvasTex(512, 512, (g) => {
        g.clearRect(0, 0, 512, 512);
        let s = 3; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
        for (let i = 0; i < 70; i++) { const x = r() * 512, y = r() * 512, w = 20 + 50 * r(); g.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * r()})`; g.beginPath(); g.ellipse(x, y, w, 2.2, 0, 0, Math.PI * 2); g.fill(); }
      }) } },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform vec2 uScroll; uniform sampler2D uStreak; varying vec3 vW;
        void main(){ float d = length(vW.xz - cameraPosition.xz);
          vec3 nearC = vec3(0.16,0.66,0.86), farC = vec3(0.12,0.52,0.78);
          vec3 c = mix(nearC, farC, smoothstep(6.0, 160.0, d));
          float s = texture2D(uStreak, vW.zx / 7.0 + uScroll).a * (1.0 - smoothstep(15.0, 80.0, d));
          float s2 = texture2D(uStreak, vW.zx / 19.0 + uScroll * 0.5 + 0.37).a * (1.0 - smoothstep(50.0, 220.0, d)) * 0.6;
          c = mix(c, vec3(0.88,0.97,1.0), clamp(s + s2, 0.0, 1.0) * 0.42);
          float hull = smoothstep(2.4, 0.2, vW.x) * step(vW.z, 6.0); c *= 1.0 - 0.18 * hull; // hull shadow band on the water
          float a = 1.0 - smoothstep(170.0, 420.0, d);
          gl_FragColor = vec4(pow(c, vec3(2.2)), a); }`,
    });
    const sea = new THREE.Mesh(new THREE.CircleGeometry(600, 96).rotateX(-Math.PI / 2), this.waterMat);
    sea.layers.set(NOINK); sea.renderOrder = -1; R.add(sea);
    // ripple rings at the splash
    const rm = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.8, depthWrite: false });
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 48).rotateX(-Math.PI / 2), rm.clone()); m.position.set(HIT.x, 0.02, HIT.z); m.layers.set(NOINK); this.rings.push(m); R.add(m); }
    // backdrop: sea panorama + sea-stack island arc ahead along +z, pirate ship card in front of it
    const Rc = 650, Hc = (Math.PI * Rc) / (2016 / 864), hz = 0.323;
    const cyl = new THREE.CylinderGeometry(Rc, Rc, Hc, 128, 1, true);
    const uv = cyl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 2);
    const plate = new THREE.Mesh(cyl, new THREE.MeshBasicMaterial({ map: T.pano, side: THREE.BackSide, fog: false, depthWrite: false }));
    plate.position.y = 3 - hz * Hc + Hc / 2; plate.rotation.y = Math.PI * 0.3; plate.layers.set(NOINK); plate.renderOrder = -2; R.add(plate);
    { const Ri = 600, arc = (70 * Math.PI) / 180, Hi = (Ri * arc) / (2016 / 864), hzi = 0.30;
      const ig = new THREE.CylinderGeometry(Ri, Ri, Hi, 64, 1, true, -arc / 2 + 0.12, arc);
      const iu = ig.attributes.uv; for (let i = 0; i < iu.count; i++) iu.setX(i, 1 - iu.getX(i));
      const ip = new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ map: T.isl, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true }));
      ip.position.y = 3 - hzi * Hi + Hi / 2; ip.layers.set(NOINK); ip.renderOrder = -1.5; R.add(ip); }
    this.enemy = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T.enemy, alphaTest: 0.5, fog: false }));
    this.enemy.scale.set(14 * (770 / 835), 14, 1); this.enemy.position.set(6.5, 7 - 0.84, 38); this.enemy.layers.set(NOINK); R.add(this.enemy);
    { const ft = foamTex(1024, 128, 9, true); const fm = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false }));
      fm.position.set(6.5, 0.02, 38.4); fm.scale.set(1.17, 1, 1); fm.layers.set(NOINK); R.add(fm); this.enemyFoam = fm; }
    // light
    const L = LIGHTS.day;
    this.sun = new THREE.DirectionalLight("#fff1dc", 3.0); this.sun.position.set(9, 12, 7); this.sun.target.position.set(0, 3, 0);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    const sc = this.sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 0.5; sc.far = 40;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
    R.add(this.sun, this.sun.target, new THREE.HemisphereLight("#dcecff", "#b49a78", 0.5));
    TONE.uLitCol.value.set(1.55, 1.42, 1.2); TONE.uShadeCol.value.set(0.6, 0.53, 0.5); TONE.uShadeLift.value.set(0.012, 0.01, 0.014);
    TONE.uLambert.value = 0.45; TONE.uSideK.value = L.sideK; TONE.uTerm.value = 0.25; TONE.uSat.value = 0.98;
    CHAR.uCharTint.value.set(1.0, 0.98, 0.96); CHAR.uCharShade.value = 0.88; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(0.92, 0.9, 0.96);
    this.chef = new Actor(R);
  }

  /** the falling ribbon: parabola from the lip to the water, thinning as it speeds up, with a slow wobble */
  buildStream(f: number, lip: THREE.Vector3, inward: THREE.Vector3) {
    const N = 48, RS = 8, pts: THREE.Vector3[] = [], rad: number[] = [];
    const T = Math.sqrt((2 * lip.y) / 9.8), vx = (HIT.x - lip.x) / T, vz = (HIT.z - lip.z) / T;
    // two lead-in rings under the oil surface inside the pot, so the stream wells up and over the rim
    for (const k of [0.07, 0.03]) { pts.push(lip.clone().addScaledVector(inward, k).add(V(0, -0.012 - 0.1 * k, 0))); rad.push(0.026); }
    for (let i = 0; i <= N; i++) {
      const s = i / N, y = lip.y * (1 - s), t = Math.sqrt((2 * (lip.y - y)) / 9.8);
      const wob = 0.012 * Math.sin(s * 11 - f * 0.6) * s;
      pts.push(V(lip.x + vx * t + wob, y, lip.z + vz * t - wob * 0.6));
      rad.push((0.019 * Math.pow(1 - s, 1.3) + 0.011) * (1 + 0.14 * Math.sin(s * 31 - f * 1.3)));
    }
    const pos: number[] = [], idx: number[] = [];
    const M = pts.length - 1;
    for (let i = 0; i <= M; i++) {
      const c = pts[i], d = (i < M ? pts[i + 1].clone().sub(c) : c.clone().sub(pts[i - 1])).normalize();
      const n1 = new THREE.Vector3(0, 0, 1).cross(d).normalize(), n2 = d.clone().cross(n1).normalize();
      for (let j = 0; j < RS; j++) { const a = (j / RS) * Math.PI * 2; const o = n1.clone().multiplyScalar(Math.cos(a) * rad[i]).add(n2.clone().multiplyScalar(Math.sin(a) * rad[i])); pos.push(c.x + o.x, c.y + o.y, c.z + o.z); }
    }
    for (let i = 0; i < M; i++) for (let j = 0; j < RS; j++) { const a = i * RS + j, b = i * RS + ((j + 1) % RS), c = a + RS, d = b + RS; idx.push(a, c, b, b, c, d); }
    const g = this.stream.geometry as THREE.BufferGeometry;
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  }

  /** splash crown: petals round the impact grow and collapse on a 10-frame cycle (each with its own phase), droplets
   *  fly out on ballistic arcs */
  buildCrown(f: number) {
    const N = 20, pos: number[] = [], col: number[] = [], base = new THREE.Color("#bfe8f5"), tipW = new THREE.Color("#ffffff"), tipG = new THREE.Color("#f6d965");
    const rnd = (i: number, k: number) => { const h = Math.sin((i + 1) * k) * 43758.5453; return h - Math.floor(h); };
    for (let i = 0; i < N; i++) {
      const ph = ((f / 12) + rnd(i, 12.9)) % 1, H = ease((f - 26) / 12) * (0.34 + 0.3 * rnd(i, 78.2)) * Math.pow(Math.sin(Math.PI * ph), 0.6), tipC = i % 3 ? tipW : tipG;
      const tip = this.tips[i]; tip.visible = false;
      if (H < 0.02) continue;
      const a = (i / N) * Math.PI * 2 + 0.3 * rnd(i, 4.1), r0 = 0.17 + 0.16 * ph, r1 = r0 + 0.1 + 0.28 * ph, w = 0.13;
      const ca = Math.cos(a), sa = Math.sin(a), tx = -sa, tz = ca;
      const P0 = [HIT.x + ca * r0 - tx * w, 0.01, HIT.z + sa * r0 - tz * w], P1 = [HIT.x + ca * r0 + tx * w, 0.01, HIT.z + sa * r0 + tz * w];
      const P2 = [HIT.x + ca * r1, H, HIT.z + sa * r1];
      pos.push(...P0, ...P1, ...P2); col.push(base.r, base.g, base.b, base.r, base.g, base.b, tipC.r, tipC.g, tipC.b);
      tip.position.set(P2[0], P2[1] + 0.03, P2[2]); tip.scale.setScalar(0.035 + 0.015 * rnd(i, 5.1));
    }
    // a low skirt ring so the crown has a body at the waterline
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * Math.PI * 2, a1 = ((i + 1) / 24) * Math.PI * 2, rr = 0.22, hh = 0.13 + 0.03 * Math.sin(f * 0.9 + i);
      const q = (a: number, y: number) => [HIT.x + Math.cos(a) * rr, y, HIT.z + Math.sin(a) * rr];
      pos.push(...q(a0, 0.01), ...q(a1, 0.01), ...q(a1, hh), ...q(a0, 0.01), ...q(a1, hh), ...q(a0, hh));
      for (let k = 0; k < 6; k++) col.push(1, 1, 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    (this.crown.geometry as THREE.BufferGeometry).dispose(); this.crown.geometry = g;
    this.drops.forEach((d, i) => {
      const T = 0.45 + 0.2 * rnd(i, 3.7), t = (((f / FPS) + T * rnd(i, 9.1)) % T);
      const a = rnd(i, 21.3) * Math.PI * 2, vh = 0.7 + 1.1 * rnd(i, 5.5), vy = 2.0 + 1.4 * rnd(i, 7.7);
      const y = vy * t - 4.9 * t * t;
      d.visible = y > 0.01; d.position.set(HIT.x + Math.cos(a) * (0.12 + vh * t), y, HIT.z + Math.sin(a) * (0.12 + vh * t));
      d.scale.setScalar(0.026 + 0.022 * rnd(i, 2.2));
    });
    this.foam.rotation.y = f * 0.01;
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const c = camAt(f);
    cam.position.copy(c.pos); cam.up.set(0, 1, 0); cam.lookAt(c.look); cam.rotateZ(rollAt(f)); cam.fov = c.fov; cam.near = 0.05; cam.far = 2000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    this.pot.rotation.z = -0.9 - 0.04 * Math.sin(f * 0.21) - 0.05 * ease(f / 30);
    this.pot.updateMatrixWorld(true);
    { // level oil surface: world-horizontal plane through the lowest rim point, clipped to the pot's inside
      const up = V(0, 1, 0).transformDirection(new THREE.Matrix4().copy(this.pot.matrixWorld).invert());
      const rho = Math.hypot(up.x, up.z), c0 = 0.335 * up.y - 0.3 * rho - 0.006;
      let poly: THREE.Vector3[] = [];
      for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2, x = 0.276 * Math.cos(a), z = 0.276 * Math.sin(a); poly.push(V(x, (c0 - up.x * x - up.z * z) / up.y, z)); }
      const clip = (P: THREE.Vector3[], keep: (v: THREE.Vector3) => number) => { const out: THREE.Vector3[] = [];
        P.forEach((A, i) => { const Bv = P[(i + 1) % P.length], a = keep(A), b = keep(Bv); if (a >= 0) out.push(A); if (a * b < 0) out.push(A.clone().lerp(Bv, a / (a - b))); }); return out; };
      poly = clip(clip(poly, (v) => v.y - 0.055), (v) => 0.33 - v.y);
      const pos: number[] = [], ctr = poly.reduce((acc, v) => acc.add(v), V(0, 0, 0)).multiplyScalar(1 / Math.max(1, poly.length));
      poly.forEach((A, i) => { const Bv = poly[(i + 1) % poly.length]; pos.push(ctr.x, ctr.y, ctr.z, A.x, A.y, A.z, Bv.x, Bv.y, Bv.z); });
      (this.oilS.geometry as THREE.BufferGeometry).dispose(); const og = new THREE.BufferGeometry(); og.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); this.oilS.geometry = og;
      const lipL = V((-0.3 * up.x) / rho, 0.335, (-0.3 * up.z) / rho), lip = this.pot.localToWorld(lipL.clone());
      const inward = this.pot.localToWorld(V(0, 0.335, 0)).sub(lip); inward.y = 0; inward.normalize();
      this.buildStream(f, lip, inward);
    }
    this.buildCrown(f);
    this.waterMat.uniforms.uScroll.value.set(f * 0.0012, f * 0.0008);
    // ripple rings: expanding, fading, staggered
    const rs = 0.4 + 0.95 * Math.pow(clamp01((f - 28) / 40), 0.8); // the splat spreads as the oil keeps coming
    this.splat.forEach((m, i) => { const k = i === 0 ? rs + 0.07 : i === 1 ? rs : 0.66 * rs; m.scale.set(k, 1, k); m.rotation.y = 0.004 * f * (i === 2 ? -1 : 1); });
    this.foam.scale.setScalar((rs * 1.12) / 1.05);
    this.rings.forEach((m, i) => { const u = ((f / 24) + i / 3) % 1; const s = rs * (1.02 + 0.45 * u); m.scale.set(s, 1, s); (m.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - u); });
    // chef card faces the camera (yaw only); its arms are 3D tubes from the shoulders to the pot handles
    const blink = Math.abs((f % 55) - 30) < 2 ? 1 : 0;
    this.chef.r = this.pool.req(`chef|${blink}|smug`, 900, 1500, 1.5, (p) => bodyFront(p, CHEF, { mode: "stand", expr: "smug", blink: blink ? 1 : 0, look: -0.7, seed: 12, noArms: true, facing: -1 }));
    this.chef.mesh.visible = true; this.chef.mesh.position.copy(CHEF_AT);
    this.chef.mesh.rotation.set(0, Math.atan2(c.pos.x - CHEF_AT.x, c.pos.z - CHEF_AT.z), 0); this.chef.mesh.updateMatrixWorld(true);
    this.pot.updateMatrixWorld(true);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const sh = this.chef.mesh.localToWorld(V(s * 0.13, 1.08, -0.03));
      const upL = V(0, 1, 0).transformDirection(new THREE.Matrix4().copy(this.pot.matrixWorld).invert()), rh = Math.hypot(upL.x, upL.z);
      // right hand on the near ring handle; left hand on the top of the rim, where the camera can see it tip the pot
      const hd = s > 0 ? this.pot.localToWorld(V(0, 0.22, -0.37)) : this.pot.localToWorld(V((0.36 * upL.x) / rh, 0.35, (0.36 * upL.z) / rh));
      const el = sh.clone().lerp(hd, 0.5).add(V(0, -0.14, 0));
      (this.arms[i].geometry as THREE.BufferGeometry).dispose();
      this.arms[i].geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(sh, el, hd), 12, 0.02, 8, false);
      this.hands[i].position.copy(hd);
    }
    this.pool.flush();
    this.chef.bind();
    this.enemy.position.y = 7 - 0.84 + 0.12 * Math.sin(f * 0.16); this.enemy.lookAt(c.pos.x, this.enemy.position.y, c.pos.z); this.enemy.rotateZ(0.025 * Math.sin(f * 0.12));
    this.enemyFoam.scale.x = 1.17 * (1 + 0.06 * Math.sin(f * 0.16 + 1));
    // focus distance along the view axis to the look point
    return c.pos.distanceTo(c.look) > 30 ? 12 : c.pos.distanceTo(c.look);
  }
}

// ---------------- render ----------------
const GRADE_OIL: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.83, 0.945, 1], sat: [0.95, 0.97, 0.95], tintS: [0.012, 0.004], tintM: [0, 0], tintH: [0.006, 0.002], vig: [0.16, 0.42] };
const Inner: React.FC<{ T: Tex }> = ({ T }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new OilWorld(T), [T]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.35, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_OIL, 1),
  }), [camera, scene]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  scene.background = new THREE.Color("#0c52de");
  const focus = world.update(f, camera as THREE.PerspectiveCamera);
  noInkFallback(world.root);
  fx.lens.focus = focus; fx.lens.cInf = f < 22 ? 1.2 : 3;
  return (<><primitive object={world.root} dispose={null} />{(getInputProps() as any).nopost ? null : post}<Kick /></>);
};

const WORDS: [number, number, string][] = [[0, 4, "He"], [4, 12, "poured"], [12, 25, "cooking"], [25, 32, "oil"], [32, 37, "into"], [37, 53, "the sea"], [53, 59, "with"], [59, 71, "a pirate"], [71, 80, "ship"], [80, 99, "so"]];
const Caption: React.FC<{ f: number }> = ({ f }) => {
  const w = WORDS.find(([a, b]) => f >= a && f < b);
  if (!w) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center", fontFamily: "BtCap", fontSize: 82, color: "#fff",
      WebkitTextStroke: "16px #111", paintOrder: "stroke fill", letterSpacing: 1, textShadow: "0 6px 0 rgba(0,0,0,0.3)" }}>{w[2]}</div>
  );
};

export const BtOil: React.FC = () => {
  const f = useCurrentFrame();
  const [T, setT] = useState<Tex | null>(null);
  const [h] = useState(() => delayRender("oil textures"));
  useEffect(() => { loadTex().then((x) => { setT(x); continueRender(h); }); }, [h]);
  if (!T) return null;
  return (
    <AbsoluteFill style={{ background: "#8cc4ee" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 44, near: 0.05, far: 2000 }}>
        <Inner T={T} />
      </ThreeCanvas>
      <Caption f={f} />
    </AbsoluteFill>
  );
};

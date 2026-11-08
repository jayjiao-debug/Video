// Backtest A: rebuild of "Levels of Pirate Cannonballs" 0.0-2.2 s with the upgraded kit.
// Shot A (0-1.7 s): fast low orbit round a cannon on deck (officer, gunner, bucket, rope, ball pile pass close to the
// lens), ending behind the gun looking out to sea; the gun fires at 1.47 s (blast, recoil, smoke, camera kick).
// Shot B (1.7-2.2 s): the ball skims over the sea toward an enemy ship, speed streaks on the water.
// Word-by-word captions on top. Characters are the film's 2D cards; props are new detailed meshes; the sea and the
// distance are a painted backdrop plate.
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
import { Pool, Actor, Fx, SU } from "../vasa/cast";
import { bodyFront, frontHand, Pen, Outfit, Expr, INK, fxContact } from "../vasa/toon";
import * as P from "./props";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export const BT_FRAMES = 66;
const FPS = 30;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const FIRE = 36, CUT = 53;
/** the hero gun sits run out at its port */
const RUN1 = 0.05;
const runX = (_f: number) => RUN1;
/** crew marks on deck: gunner at the breech, officer forward by the rail */
const OFF_AT: [number, number] = [0.9, 0.8], GUN_AT: [number, number] = [-1.05, 0.72];
/** touch hole on the gun, behind the trunnions (gun-local) */
const VENT = V(-0.716, 0.885, 0);

// ---------------- assets ----------------
type Tex = { deck: THREE.Texture; pano: THREE.Texture; enemy: THREE.Texture; isl: THREE.Texture };
const loadTex = async (): Promise<Tex> => {
  const L = new THREE.TextureLoader();
  const [deck, panoImg, enemy, islImg] = await Promise.all(["bt/deck_planks.jpg", "bt/sea_pano.jpg", "bt/enemy_ship.png", "bt/islands_pano.jpg"].map((u) => L.loadAsync(staticFile(u))));
  // island plate: soft alpha fade on the left/right edges so it melts into the sea panorama behind it
  const im = islImg.image as HTMLImageElement, cv = document.createElement("canvas"); cv.width = im.width; cv.height = im.height;
  const g2 = cv.getContext("2d")!; g2.drawImage(im, 0, 0);
  g2.globalCompositeOperation = "destination-in";
  const gr = g2.createLinearGradient(0, 0, cv.width, 0);
  gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.3, "rgba(0,0,0,1)"); gr.addColorStop(0.9, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
  g2.fillStyle = gr; g2.fillRect(0, 0, cv.width, cv.height);
  const gv = g2.createLinearGradient(0, 0, 0, cv.height); gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(0.3, "rgba(0,0,0,1)"); gv.addColorStop(1, "rgba(0,0,0,1)");
  g2.fillStyle = gv; g2.fillRect(0, 0, cv.width, cv.height);
  const isl = new THREE.CanvasTexture(cv);
  const pim = panoImg.image as HTMLImageElement, pc = document.createElement("canvas"); pc.width = pim.width; pc.height = pim.height;
  const pg = pc.getContext("2d")!, hw = pim.width / 2;
  pg.drawImage(pim, 0, 0, hw, pim.height, 0, 0, hw, pim.height);
  pg.save(); pg.translate(pim.width, 0); pg.scale(-1, 1); pg.drawImage(pim, 0, 0, hw, pim.height, 0, 0, hw, pim.height); pg.restore();
  { const H = pim.height, hy = (1 - 0.323) * H;
    pg.globalCompositeOperation = "multiply";
    const top = pg.createLinearGradient(0, 0, 0, hy); top.addColorStop(0, "rgba(90,150,230,0.8)"); top.addColorStop(0.55, "rgba(150,195,245,0.4)"); top.addColorStop(1, "rgba(255,255,255,0)");
    pg.fillStyle = top; pg.fillRect(0, 0, pim.width, hy);
    pg.globalCompositeOperation = "screen";
    const glow = pg.createLinearGradient(0, hy - 0.22 * H, 0, hy + 0.01 * H); glow.addColorStop(0, "rgba(255,190,140,0)"); glow.addColorStop(0.75, "rgba(255,190,140,0.5)"); glow.addColorStop(1, "rgba(255,205,165,0.2)");
    pg.fillStyle = glow; pg.fillRect(0, hy - 0.22 * H, pim.width, 0.23 * H);
    pg.globalCompositeOperation = "source-over"; }
  const pano = new THREE.CanvasTexture(pc);
  for (const t of [deck, pano, enemy, isl]) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; }
  deck.wrapS = deck.wrapT = THREE.RepeatWrapping;
  pano.wrapS = THREE.MirroredRepeatWrapping;
  const font = new FontFace("BtCap", `url(${staticFile("bt/nunito900.ttf")})`);
  await font.load(); (document.fonts as any).add(font);
  return { deck, pano, enemy, isl };
};

// ---------------- characters ----------------
const OFFICER: Outfit = { jacket: "#2d5cb3", pants: "#283048", boots: "#1d1a1e", hat: "wide", cap: "#1e1c22", buttons: "#e8c45a", build: "adult", skin: "#ffffff" };
const GUNNER: Outfit = { jacket: "#f7f6f2", stripes: "#2f57ad", pants: "#2e3550", boots: "#3b2e26", hat: "cap", cap: "#d03a2c", build: "adult", moustache: "#3a2618", skin: "#ffffff" };

// ---------------- effect drawings ----------------
const bumpy = (cx: number, cy: number, r: number, n: number, amp: number, ph: number): [number, number][] =>
  Array.from({ length: n * 6 }, (_, i) => { const a = (i / (n * 6)) * Math.PI * 2, k = 1 + amp * Math.max(0, Math.cos(a * n + ph)) ** 0.6; return [cx + r * k * Math.cos(a), cy + r * k * Math.sin(a) * 0.86]; });
const lerpC = (c0: string, c1: string, k: number) => {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(c0), B = h(c1);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
/** muzzle fireball on a 600x600 canvas, s = 0..1 through its life: rotating yellow spike star behind a cel-shaded
 *  cloud (red-orange rim, orange, yellow, hot core) that swells fast and then collapses into the smoke; short spark
 *  streaks fly out early on */
const blast = (p: Pen, s: number) => {
  const g = p.g, c = 300, fr = (x: number) => x - Math.floor(x);
  const up = 1 - Math.pow(1 - Math.min(1, s / 0.22), 3), grow = 1 + 0.25 * clamp01((s - 0.25) / 0.65);
  const down = s > 0.88 ? 1 - (s - 0.88) / 0.12 : 1;
  const R = 125 * (0.35 + 0.65 * up) * grow * Math.max(0, down);
  if (R < 4) return;
  if (s < 0.32) { // the flash: an irregular star, gone after a few frames
    const n = 9, pts: [number, number][] = [], rot = 0.25 + s * 0.9;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + rot + (i % 2 ? 0 : 0.12 * Math.sin(i * 5.1));
      const r = i % 2 ? R * 0.9 : R * (1.25 + 0.45 * Math.abs(Math.sin(i * 2.3 + 0.7)));
      pts.push([c + r * Math.cos(a), c + r * Math.sin(a)]);
    }
    g.lineJoin = "round"; g.fillStyle = "#ffd23f"; g.strokeStyle = "#ef8a22"; g.lineWidth = 7;
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke();
  }
  if (s > 0.04 && s < 0.7) { // flung debris flecks
    g.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const h = fr(Math.sin(i * 91.7) * 43758.5), a = i * 0.53 + h * 0.4 + 0.2, d0 = R * (1.0 + 0.6 * s + 0.2 * h), d1 = d0 + 14 + 14 * h;
      g.strokeStyle = i % 3 ? "#ff9a2a" : "#ffd447"; g.lineWidth = 6 + 3 * h;
      g.beginPath(); g.moveTo(c + d0 * Math.cos(a), c + d0 * Math.sin(a)); g.lineTo(c + d1 * Math.cos(a), c + d1 * Math.sin(a)); g.stroke();
    }
  }
  const puffs: [number, number, number][] = [[0, 0, 1], [-0.62, 0.18, 0.66], [0.6, 0.22, 0.62], [-0.25, -0.55, 0.62], [0.38, -0.5, 0.58], [0.05, 0.58, 0.56], [-0.66, -0.34, 0.48], [0.7, -0.15, 0.45]];
  const jit = (i: number) => 0.08 * Math.sin(i * 4.7 + s * 6);
  const lobes = (k: number, ox: number, oy: number, pad: number) => { g.beginPath(); puffs.forEach(([dx, dy, kk], i) => { const x = c + (dx + jit(i)) * R * 0.92 + ox, y = c + (dy + jit(i + 3)) * R * 0.92 + oy, r = R * kk * 0.78 * k + pad; if (r <= 0) return; g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); }); };
  const ball = (x: number, y: number, r: number) => { // small detached fire ball, three tones
    g.fillStyle = "#d9481a"; g.beginPath(); g.arc(x, y, r + 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f2702a"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ffc83a"; g.beginPath(); g.arc(x - r * 0.2, y - r * 0.22, r * 0.62, 0, Math.PI * 2); g.fill();
  };
  if (s > 0.12) for (const [ang, dist, kk] of [[-2.3, 1.25, 0.2], [0.5, 1.35, 0.16], [2.6, 1.2, 0.14]] as const) { const d = R * (dist + 0.35 * s); ball(c + d * Math.cos(ang), c + d * Math.sin(ang), R * kk); }
  g.fillStyle = "#d9481a"; lobes(1, 0, 0, 7); g.fill();               // ink-ish rim
  g.fillStyle = "#f0862a"; lobes(1, 0, 0, 0); g.fill();               // outer tone
  g.fillStyle = "#ffa22e"; lobes(0.84, -0.08 * R, -0.08 * R, 0); g.fill(); // mid tone
  g.fillStyle = "#ffc83a"; lobes(0.6, -0.18 * R, -0.2 * R, 0); g.fill();  // body
  g.fillStyle = "#fff2a6"; // highlight lobes toward the light, off-centre and uneven
  for (const [dx, dy, kk] of [[-0.42, -0.4, 0.26], [-0.12, -0.52, 0.18], [-0.55, -0.1, 0.16]] as const) { g.beginPath(); g.arc(c + dx * R, c + dy * R, kk * R, 0, Math.PI * 2); g.fill(); }
};
/** opaque cel smoke puff on a 400x400 canvas: white lobes with a grey underside and a thin grey outline; s = 0..1 makes
 *  the lobes drift apart and pop away one by one, smallest first (no transparency, so it never washes out what is behind it) */
const smoke = (p: Pen, s: number) => {
  const g = p.g, k = 1 - 0.35 * s * s;
  const lobes: [number, number, number][] = [[0, 0, 88], [-62, 22, 62], [64, 18, 60], [-28, -50, 58], [34, -46, 54], [8, 50, 52]];
  const L = lobes.filter((_, i) => s < 0.95 - 0.07 * i).map(([x, y, r]) => [200 + x * (1 + 0.12 * s), 205 + y * (1 + 0.1 * s), r * k] as [number, number, number]);
  g.fillStyle = "#9c968f"; for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r + 5, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#d9d5cf"; for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#fbfaf7"; for (const [x, y, r] of L) { g.beginPath(); g.arc(x - r * 0.16, y - r * 0.2, r * 0.82, 0, Math.PI * 2); g.fill(); }
};
/** sparks spitting from the touch hole, 300x300 canvas */
const sparks = (p: Pen, st: number) => {
  const g = p.g; g.lineCap = "round";
  for (let i = 0; i < 14; i++) {
    const h = Math.sin((i + 1) * 37.7 + st * 11.3) * 43758.5, r = h - Math.floor(h);
    const a = Math.PI * (0.15 + 0.7 * r), d0 = 10 + 20 * r, d1 = d0 + 40 + 80 * ((r * 7.3) % 1);
    g.strokeStyle = i % 3 ? "#ffd84a" : "#ff8c2a"; g.lineWidth = 5 + 4 * (1 - r);
    g.beginPath(); g.moveTo(150 + d0 * Math.cos(a), 230 - d0 * Math.sin(a)); g.lineTo(150 + d1 * Math.cos(a), 230 - d1 * Math.sin(a)); g.stroke();
  }
};
/** white spray thrown back from where the ball skims the water, 600x360 canvas, st = 0..3 jitter: a V of streaks toward
 *  the lens plus loose droplets, all inside the canvas */
const spray = (p: Pen, st: number) => {
  const g = p.g; g.lineCap = "round";
  const H = (i: number, k: number) => { const h = Math.sin((i + 1) * k + st * 13.1) * 43758.5; return h - Math.floor(h); };
  for (let i = 0; i < 16; i++) {
    const r = H(i, 91.7), r2 = H(i, 17.3), side = i % 2 ? 1 : -1;
    const a = (12 + 62 * r) * Math.PI / 180, d0 = 10 + 10 * r2, d1 = d0 + 50 + 110 * r2;
    g.strokeStyle = `rgba(250,254,255,${(0.8 + 0.2 * r).toFixed(2)})`; g.lineWidth = 3 + 4 * (1 - r2);
    g.beginPath(); g.moveTo(300 + side * d0 * Math.cos(a), 300 - d0 * Math.sin(a)); g.lineTo(300 + side * d1 * Math.cos(a), 300 - d1 * Math.sin(a)); g.stroke();
    if (i % 2 === 0) { const dd = d1 + 14 + 20 * r; g.fillStyle = "#f6fdff"; g.beginPath(); g.arc(300 + side * dd * Math.cos(a), 300 - dd * Math.sin(a), 3.5 + 3.5 * r2, 0, Math.PI * 2); g.fill(); }
  }
  g.fillStyle = "rgba(245,253,255,0.95)"; g.beginPath(); g.ellipse(300, 302, 40, 8, 0, 0, Math.PI * 2); g.fill();
};

// ---------------- camera ----------------
type CamK = { t: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
const SHOT_A: CamK[] = [
  { t: 0 / 30, pos: [1.45, 1.75, -2.6], look: [-0.5, 0.85, 2.2], fov: 64 },
  { t: 10 / 30, pos: [-0.3, 1.75, -2.95], look: [-0.2, 1.0, 1.2], fov: 65 },
  { t: 20 / 30, pos: [-2.23, 2.28, -3.15], look: [0.09, 1.15, 0.27], fov: 64 },
  { t: 28 / 30, pos: [-4.3, 2.45, -2.2], look: [-0.6, 1.35, 0.25], fov: 62 },
  { t: 36 / 30, pos: [-3.3, 2.25, -0.95], look: [-0.2, 1.3, 0.35], fov: 60 },
  { t: 42 / 30, pos: [-2.2, 1.9, -0.5], look: [1.8, 1.1, 0.3], fov: 62 },
  { t: 47 / 30, pos: [-0.75, 1.74, -0.3], look: [5.0, 1.0, 0.45], fov: 64 },
  { t: 53 / 30, pos: [0.2, 2.3, -0.32], look: [9.0, -0.6, 1.5], fov: 64 },
];
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const sampleKeys = (K: CamK[], t: number) => {
  let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++;
  const u = clamp01((t - K[i].t) / (K[i + 1].t - K[i].t));
  const g = (j: number) => K[Math.max(0, Math.min(K.length - 1, j))];
  const pick = (f: (k: CamK) => number) => cr(f(g(i - 1)), f(g(i)), f(g(i + 1)), f(g(i + 2)), u);
  return { pos: V(pick((k) => k.pos[0]), pick((k) => k.pos[1]), pick((k) => k.pos[2])), look: V(pick((k) => k.look[0]), pick((k) => k.look[1]), pick((k) => k.look[2])), fov: pick((k) => k.fov) };
};
/** ball flight: x along the shot, start at the port */
const ballX = (t: number) => 8 + 70 * (t - CUT / FPS);

// ---------------- world ----------------
class BtWorld {
  root = new THREE.Group(); pool = new Pool();
  cannons: P.Cannon[] = []; officer: Actor; gunner: Actor; fxBlast: Fx; fxJet: Fx; fxSmoke: Fx[] = [];
  fxPuff: Fx; fxSpray: Fx; fxSparks: Fx; linstock: THREE.Mesh; match: THREE.Mesh; arms: THREE.Mesh[] = []; hands: THREE.Mesh[] = []; dropped: THREE.Mesh; blobs: Fx[] = []; wake: THREE.Mesh[] = []; sun: THREE.DirectionalLight; ball: THREE.Mesh; streaks: THREE.Mesh[] = []; waterMat: THREE.ShaderMaterial; enemy: THREE.Mesh;
  breech: THREE.Mesh[] = []; ropeMat!: THREE.Material; flagWave: (t: number) => void = () => {}; wisp!: Fx;
  constructor(T: Tex) {
    const R = this.root;
    // materials
    const deckT = T.deck.clone(); deckT.needsUpdate = true; deckT.repeat.set(7.7 / 2.0, 28 / 2.0);
    const deck = P.lam({ map: deckT });
    const red = P.lam({ map: P.paintedPlanks("#c4462e", 6, 0) });
    const railM = P.lam({ map: P.staves("#9b5a2e", 4, "rgba(50,20,5,0.6)") });
    const dark = P.lam({ color: "#5a2a1c" });
    const woodCar = P.lam({ map: P.staves("#d66a32", 3, "rgba(90,30,8,0.45)", 256, 256) });
    const iron = P.lam({ color: "#50535c" });
    const metal = new THREE.MeshMatcapMaterial({ matcap: P.gunMatcap(), color: "#ffffff" });
    const bore = new THREE.MeshBasicMaterial({ color: "#111216" });
    const bucketW = P.lam({ map: P.staves("#a8743f", 10, "rgba(60,30,10,0.5)", 256, 256) });
    const water = new THREE.MeshBasicMaterial({ color: "#5fc4dd" });
    const sponge = P.lam({ color: "#f2c94c" });
    const ropeM = P.lam({ map: (() => { const t = P.ropeTex(); t.repeat.set(30, 1); return t; })() });
    const rigM = P.lam({ color: "#4a3426" });
    const mastM = P.lam({ map: P.staves("#9a6236", 2, "rgba(60,30,10,0.3)", 128, 512) });
    const cloth = P.lam({ map: P.clothTex(), side: THREE.DoubleSide });
    const barrelW = P.lam({ map: P.staves("#a9703c", 12, "rgba(60,30,10,0.55)", 256, 256) });
    const ballM = new THREE.MeshMatcapMaterial({ matcap: P.metalMatcap(), color: "#4a4e57" });
    const poleM = P.lam({ map: P.staves("#b98a55", 2, "rgba(60,30,10,0.3)", 64, 256) });
    const headM = P.lam({ color: "#7a4a28" }), fleeceM = P.lam({ color: "#efe3c6" });
    const markM = new THREE.MeshBasicMaterial({ map: P.yearTex("1628"), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    this.ropeMat = ropeM;
    // deck, bulwarks, rig
    const dg = new THREE.PlaneGeometry(7.7, 28); dg.rotateX(-Math.PI / 2); dg.translate(-6 + 7.7 / 2, 0, -16 + 14);
    const dm = new THREE.Mesh(dg, deck); dm.receiveShadow = true; R.add(dm);
    R.add(P.bulwark(1.65, -16, 12, [0, -3.3, 3.1, 6.4], red, railM, dark));
    const far = P.bulwark(5.9, -12, 16, [3.0, -3.4], red, railM, dark); far.rotation.y = Math.PI; R.add(far); // rotated: ports land at z = -3.0, 3.4
    const bow = P.bulwark(0, -1.7, 6, [], red, railM, dark); bow.rotation.y = -Math.PI / 2; bow.position.z = 11.86; R.add(bow); // closes the deck end
    const rigF = P.mastRig(-2.1, 6.2, 1.65, mastM, iron, rigM); rigF.children[rigF.children.length - 1].layers.set(NOINK); R.add(rigF);
    for (const sl of [P.sail(-2.1, 6.8, 6.45, 6.2, 4.0, cloth, mastM), P.sail(-2.1, 10.6, 6.5, 5.0, 2.8, cloth, mastM)]) { sl.traverse((o) => { o.castShadow = false; }); R.add(sl); }
    const rig = P.mastRig(-0.25, -4.2, 1.65, mastM, iron, rigM); rig.children[rig.children.length - 1].layers.set(NOINK); R.add(rig);
    for (const sl of [P.sail(-0.25, 8.6, -4.0, 6.5, 4.6, cloth, mastM), P.sail(-0.25, 12.6, -4.05, 5.2, 3.0, cloth, mastM)]) { sl.traverse((o) => { o.castShadow = false; }); R.add(sl); }
    // the two guns
    for (const z of [0, 3.1, -3.3]) {
      const c = P.cannon(metal, woodCar, bore, iron, markM); c.group.position.set(0.05, 0, z); R.add(c.group); this.cannons.push(c);
      c.group.traverse((o) => { if ((o as THREE.Mesh).material === markM) o.layers.set(NOINK); });
      // ring bolts + tackle blocks either side of the port, breeching rope to the cheeks and round the cascabel
      for (const s of [1, -1]) { const rb = P.ringBlock(iron, headM); rb.position.set(1.63, 0.5, z + s * 0.72); R.add(rb); }
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BufferGeometry(), ropeM); m.castShadow = true; m.receiveShadow = true; m.userData.z = z; R.add(m); this.breech.push(m); }
    }
    // far-side guns (port battery), pointing -x
    for (const z of [-3.0, 3.4]) { const c = P.cannon(metal, woodCar, bore, iron); c.group.rotation.y = Math.PI; c.group.position.set(-4.3, 0, z); R.add(c.group); }
    const bk = P.bucket(bucketW, iron, water, sponge); bk.position.set(-0.7, 0, -0.95); R.add(bk);
    const rc = P.ropeCoil(ropeM); rc.position.set(-1.65, 0, -1.4); rc.rotation.y = 0.6; R.add(rc);
    const bp = P.ballPile(ballM, woodCar); bp.position.set(-2.6, 0, 1.7); R.add(bp);
    // second pass set dressing: rammer/sponge pairs on the rail, shot garlands, a second rope coil, the ensign
    for (const z of [-0.98, 2.35]) { const rp = P.rammerPair(poleM, headM, fleeceM); rp.position.set(1.3, 0, z); rp.rotation.y = z < 0 ? -0.69 : 0.45; R.add(rp); }
    for (const z of [1.55, 4.6]) { const sr = P.shotRack(woodCar, ballM); sr.position.set(1.47, 0, z); R.add(sr); }
    const rc2 = P.ropeCoil(ropeM); rc2.position.set(0.55, 0, -1.05); rc2.rotation.y = 2.4; R.add(rc2);
    { const fl = P.flag(P.swedishFlag(), poleM, 3.4); fl.group.position.set(1.42, 0, 3.75); fl.group.rotation.y = -0.4; R.add(fl.group); this.flagWave = fl.wave; }
    for (const [x, z, s] of [[-3.3, -1.6, 1], [-3.0, -2.3, 0.9], [-3.8, -2.0, 1.05]]) { const b = P.barrel(barrelW, iron, 0.85 * s, 0.3 * s); b.position.set(x, 0, z); b.rotation.y = x; R.add(b); }
    // sea: big disk below the deck, painted colours by distance, fading into the backdrop plate
    this.waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uT: { value: 0 }, uWhite: { value: 0 }, uScroll: { value: new THREE.Vector2() }, uStreak: { value: P.canvasTex(512, 512, (g) => {
        g.clearRect(0, 0, 512, 512);
        for (let i = 0; i < 70; i++) { const x = Math.random() * 512, y = Math.random() * 512, w = 20 + 50 * Math.random(); g.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * Math.random()})`; g.beginPath(); g.ellipse(x, y, w, 2.2, 0, 0, Math.PI * 2); g.fill(); }
      }) } },
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform float uT; uniform float uWhite; uniform vec2 uScroll; uniform sampler2D uStreak; varying vec3 vW;
        void main(){ float d = length(vW.xz - cameraPosition.xz);
          vec3 nearC = vec3(0.13,0.62,0.72), farC = vec3(0.10,0.50,0.70);
          vec3 c = mix(nearC, farC, smoothstep(10.0, 160.0, d)); c = mix(c, vec3(0.08, 0.52, 0.66), 1.2 * uWhite);
          float s = texture2D(uStreak, vW.xz / 9.0 + uScroll).a * (1.0 - smoothstep(20.0, 90.0, d));
          float s2 = texture2D(uStreak, vW.zx / 23.0 + uScroll * 0.5 + 0.37).a * (1.0 - smoothstep(60.0, 220.0, d)) * 0.6;
          c = mix(c, mix(vec3(0.05,0.36,0.52), vec3(0.85,0.97,1.0), uWhite), clamp(s + s2, 0.0, 1.0) * mix(0.45, 0.7, uWhite));
          float a = 1.0 - smoothstep(170.0, 420.0, d);
          gl_FragColor = vec4(pow(c, vec3(2.2)), a); }`,
    });
    const sea = new THREE.Mesh(new THREE.CircleGeometry(600, 96).rotateX(-Math.PI / 2), this.waterMat);
    sea.position.y = -2.4; sea.layers.set(NOINK); sea.renderOrder = -1; R.add(sea);
    // painted backdrop plate on a cylinder (mirrored repeat twice round), horizon at eye level
    const Rc = 650, Hc = (Math.PI * Rc) / (2016 / 864), hz = 0.323;
    const cyl = new THREE.CylinderGeometry(Rc, Rc, Hc, 128, 1, true);
    const uv = cyl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 2);
    const plate = new THREE.Mesh(cyl, new THREE.MeshBasicMaterial({ map: T.pano, side: THREE.BackSide, fog: false, depthWrite: false }));
    plate.position.y = 1.5 - hz * Hc + Hc / 2; plate.rotation.y = Math.PI * 0.62; plate.layers.set(NOINK); plate.renderOrder = -2; R.add(plate);
    // sea-stack islands: a 70-degree arc of painted plate dead ahead (+x), behind the enemy ship
    { const Ri = 600, arc = (50 * Math.PI) / 180, Hi = (Ri * arc) / (2016 / 864), hzi = 0.30;
      const ig = new THREE.CylinderGeometry(Ri, Ri, Hi, 64, 1, true, Math.PI / 2 - arc / 2, arc);
      const iu = ig.attributes.uv; for (let i = 0; i < iu.count; i++) iu.setX(i, 1 - iu.getX(i));
      const ip = new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ map: T.isl, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true }));
      ip.position.y = 1.5 - hzi * Hi + Hi / 2; ip.layers.set(NOINK); ip.renderOrder = -1.5; R.add(ip); }
    // enemy ship (painted card) far out to starboard
    this.enemy = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T.enemy, alphaTest: 0.5, fog: false }));
    this.enemy.scale.set(11.2 * (770 / 835), 11.2, 1); this.enemy.position.set(100, -2.4 + 11.2 * 0.45, 0.5); this.enemy.layers.set(NOINK); R.add(this.enemy);
    // ball + water streaks for shot B
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), new THREE.MeshMatcapMaterial({ matcap: P.ballMatcap(), color: "#ffffff" })); R.add(this.ball);
    const sm = new THREE.MeshBasicMaterial({ color: "#eafcff", transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 46; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), sm);
      const h = Math.sin(i * 12.9898) * 43758.5453, r = h - Math.floor(h), h2 = Math.sin(i * 78.233) * 12345.678, r2 = h2 - Math.floor(h2);
      const zz = (r2 - 0.5) * 7 * (1 + i / 30); m.position.set(4 + i * 2.6 + 2 * r, -2.38, zz + Math.sign(zz || 1) * 1.0); m.scale.set(2.5 + 4 * r, 1, 0.035 + 0.03 * r2);
      m.layers.set(NOINK); m.visible = false; this.streaks.push(m); R.add(m);
    }
    // light: one shadow-casting sun, the film's two-tone constants (day preset)
    const L = LIGHTS.day;
    this.sun = new THREE.DirectionalLight("#fff1dc", 3.0); this.sun.position.set(-5, 7.5, 4.5); this.sun.target.position.set(0, 0, -1);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    const sc = this.sun.shadow.camera; sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 0.5; sc.far = 30;
    this.sun.shadow.bias = -0.0004; this.sun.shadow.normalBias = 0.02;
    R.add(this.sun, this.sun.target, new THREE.HemisphereLight("#dcecff", "#b49a78", 0.5));
    TONE.uLitCol.value.set(1.55, 1.42, 1.2); TONE.uShadeCol.value.set(0.6, 0.53, 0.5); TONE.uShadeLift.value.set(0.012, 0.01, 0.014);
    TONE.uLambert.value = 0.45; TONE.uSideK.value = L.sideK; TONE.uTerm.value = 0.25; TONE.uSat.value = 0.88;
    CHAR.uCharTint.value.set(1.0, 1.0, 1.0); CHAR.uCharShade.value = 0.95; CHAR.uGrad.value = L.charGrad; CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(0.97, 0.97, 1.0);
    this.officer = new Actor(R); this.gunner = new Actor(R);
    this.fxBlast = new Fx(R); this.fxJet = new Fx(R);
    for (let i = 0; i < 3; i++) this.fxSmoke.push(new Fx(R));
    this.fxPuff = new Fx(R); this.fxSpray = new Fx(R); this.fxSparks = new Fx(R);
    this.linstock = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1, 8), P.lam({ color: "#8a5a32" })); R.add(this.linstock);
    this.match = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffb03a" })); R.add(this.match);
    { const am = new THREE.MeshBasicMaterial({ color: "#3b3737" }), hm = new THREE.MeshBasicMaterial({ color: "#1d1b1b" });
      for (let i = 0; i < 2; i++) { const a = new THREE.Mesh(new THREE.BufferGeometry(), am); R.add(a); this.arms.push(a); const h = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), hm); R.add(h); this.hands.push(h); } }
    this.dropped = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), ballM); this.dropped.castShadow = true; R.add(this.dropped);
    for (let i = 0; i < 2; i++) this.blobs.push(new Fx(R));
    this.wisp = new Fx(R);
    { const wt = P.canvasTex(64, 512, (g2) => { g2.clearRect(0, 0, 64, 512); const gr = g2.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g2.fillStyle = gr; g2.fillRect(26, 0, 12, 512); });
      const wm = new THREE.MeshBasicMaterial({ map: wt, transparent: true, depthWrite: false, opacity: 0.6 });
      for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 9).rotateX(-Math.PI / 2).translate(0, 0, 0), wm); m.layers.set(NOINK); m.visible = false; m.userData.side = sd; this.wake.push(m); R.add(m); } }
  }

  update(f: number, cam: THREE.PerspectiveCamera) {
    const t = f / FPS, shotB = f >= CUT;
    // --- gun 0 fires: recoil + blast + smoke
    const g = this.cannons[0], a = (f - FIRE) / FPS;
    const rec = a < 0 ? 0 : 0.6 * (1 - Math.exp(-a * 18)) - 0.06 * Math.max(0, 1 - Math.exp(-(a - 0.15) * 6)) * (a > 0.15 ? 1 : 0);
    g.group.position.x = runX(f) - rec;
    // breeching ropes: bolt -> cheek (sag pulls out of it as the gun recoils) -> round the cascabel
    for (let i = 0; i < this.breech.length; i++) {
      const m = this.breech[i], z = m.userData.z as number, ci = Math.floor(i / 4), j = i % 4, sd = j < 2 ? 1 : -1;
      const gx = this.cannons[ci].group.position.x, rk = ci === 0 ? rec / 0.6 : 0;
      const bolt = V(1.6, 0.47, z + sd * 0.72), cheek = V(gx - 0.1, 0.4, z + sd * 0.305), casc = V(gx - 1.06, 0.68, z + sd * 0.05);
      m.geometry.dispose(); m.geometry = j % 2 === 0 ? P.ropeSpan(bolt, cheek, 0.22 * (1 - rk) + 0.02) : P.ropeSpan(cheek, casc, 0.03);
      m.visible = !shotB;
    }
    this.flagWave(t);
    // --- camera
    let pos: THREE.Vector3, look: THREE.Vector3, fov: number, focus: number;
    if (!shotB) {
      const k = sampleKeys(SHOT_A, t); pos = k.pos; look = k.look; fov = k.fov;
      if (a >= 0) { const s = Math.exp(-a * 9) * 0.05; pos.add(V(s * Math.sin(f * 2.1), s * Math.cos(f * 2.7), s * Math.sin(f * 1.7))); }
      focus = pos.distanceTo(V(0.2, 0.8, 0));
    } else {
      const bx = ballX(t);
      pos = V(bx - 3.0, -1.85, 0.05); look = V(bx + 25, -1.85 - 25 * Math.tan(0.084), 0); fov = 58 - 22 * Math.pow(clamp01((f - CUT) / 13), 1.4);
      focus = 3.2;
    }
    cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.fov = fov; cam.near = 0.05; cam.far = 2000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    // --- ball + streaks
    this.ball.visible = shotB;
    if (shotB) { const bx = ballX(t); this.ball.position.set(bx, -2.27 + 0.022 * Math.sin(t * 37), 0.07 * Math.sin(t * 6.5 + 0.4)); this.ball.rotation.z = -t * 40; }
    // V wake trailing the skimming ball
    this.wake.forEach((m) => {
      m.visible = shotB; if (!shotB) return;
      const sd = m.userData.side as number, ang = 0.2 * sd;
      m.rotation.set(0, -Math.PI / 2 + ang, 0); // plane length along the track, opaque end at the ball
      m.position.set(this.ball.position.x - 4.5 * Math.cos(ang) - 0.05, -2.39, this.ball.position.z + 4.5 * Math.sin(ang));
    });
    const scroll = shotB ? (t - CUT / FPS) * 6 : t * 0.02;
    this.waterMat.uniforms.uWhite.value = shotB ? 0.45 : 0;
    this.waterMat.uniforms.uScroll.value.set(scroll * 0.0, -scroll * 0.4);
    for (const s of this.streaks) s.visible = shotB && s.position.x - pos.x > 7; // never right under the lens
    // --- characters (camera-facing cards)
    const blink = (k: number) => (Math.abs(((f + k) % 70) - 2) < 2 ? 1 : 0);
    const shock = a > 0.02;
    const place = (act: Actor, key: string, o: Outfit, x: number, z: number, opts: Parameters<typeof bodyFront>[2]) => {
      const draw = (p: Pen) => bodyFront(p, o, opts);
      act.r = this.pool.req(key, 900, 1500, 1.5, draw);
      act.mesh.visible = !shotB; act.mesh.position.set(x, 0, z);
      act.mesh.rotation.set(0, Math.atan2(pos.x - x, pos.z - z), 0); act.mesh.scale.set(1, 1, 1);
    };
    const bob = Math.round(4 * Math.sin(t * 5)) / 4;
    // officer: holds a ball until he claps his hands over his ears for the shot; the ball drops at his feet
    const oEars = f >= FIRE - 6, oBall = !oEars;
    const oe: Expr = oEars ? "wince" : f >= FIRE - 16 ? "nervous" : "stern"; // worried glance at the gun before he covers up
    const oLook = f < 25 ? 0.35 : -0.3;
    place(this.officer, `off|${oe}|${blink(0)}|${bob}|${oEars}|${oBall}|${oLook}`, OFFICER, OFF_AT[0], OFF_AT[1],
      { mode: "stand", expr: oe, blink: oEars ? 0 : blink(0), look: oLook, seed: 4, phase: bob, ears: oEars, hold: oBall, ball: oBall });
    this.dropped.visible = !shotB && oEars;
    if (oEars) { const dt = Math.min(1, (f - (FIRE - 6)) / 5); this.dropped.position.set(OFF_AT[0] + 0.12, 0.11 + 0.75 * (1 - dt * dt), OFF_AT[1] - 0.22); }
    // gunner: arm out toward the gun holding a 3D linstock; he lowers its lit tip onto the vent to fire, then lifts it
    const ge: Expr = shock || f >= FIRE - 3 ? "wince" : f < FIRE - 12 ? "stern" : "nervous"; // flinches as the vent catches
    const gOpts = { mode: "stand" as const, expr: ge, blink: shock ? 0 : blink(31), look: -0.3, seed: 9, noArms: true, phase: -bob };
    place(this.gunner, `gun|${ge}|${blink(31)}|na`, GUNNER, GUN_AT[0], GUN_AT[1], gOpts);
    { const fk = ease((f - (FIRE - 3)) / 3) * (1 - ease((f - (FIRE + 10)) / 10));
      const vc = VENT.clone().add(g.group.position).applyMatrix4(cam.matrixWorldInverse), gc = V(GUN_AT[0], 1.0, GUN_AT[1]).applyMatrix4(cam.matrixWorldInverse);
      this.gunner.mesh.rotation.z = (vc.x > gc.x ? 1 : -1) * 0.22 * fk; // top away from the vent
      this.gunner.mesh.scale.set(1 + 0.03 * fk, 1 - 0.045 * fk, 1); }
    {
      this.gunner.mesh.updateMatrixWorld(true); g.group.updateMatrixWorld(true);
      const k = ease((f - (FIRE - 14)) / 10), back = ease((f - (FIRE + 2)) / 9);
      // rear hand in front of his body on the gun side; it eases back toward him after the shot
      const Hr = this.gunner.mesh.localToWorld(V(-0.13 + 0.03 * back, 0.98 + 0.06 * back, 0.16 - 0.06 * back));
      const vent = g.group.localToWorld(VENT.clone()).add(V(0, 0.03, 0));
      const ventPre = V(RUN1 + VENT.x, VENT.y + 0.03, VENT.z);
      const Lf = ventPre.distanceTo(Hr); // fixed reach: the tip lands exactly on the vent, the shaft never stretches
      const dDown = vent.clone().sub(Hr).normalize(), dUp = V(0.25, 1, -0.2).normalize(), dBack = V(0.12, 1, -0.32).normalize();
      const dir = dUp.clone().lerp(dDown, k).lerp(dBack, back).normalize();
      const tip = Hr.clone().addScaledVector(dir, Lf), butt = Hr.clone().addScaledVector(dir, -0.25), Hf = Hr.clone().addScaledVector(dir, 0.3);
      this.linstock.visible = this.match.visible = !shotB;
      this.linstock.position.copy(tip).add(butt).multiplyScalar(0.5); this.linstock.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      this.linstock.scale.set(1, tip.distanceTo(butt), 1); this.match.position.copy(tip);
      // the slow match smoulders: flicker + a thin wisp curling off the tip until the vent takes it
      this.match.scale.setScalar(1 + 0.2 * Math.sin(f * 2.3) * Math.sin(f * 0.7 + 1));
      (this.match.material as THREE.MeshBasicMaterial).color.set(f % 4 < 2 ? "#ffb03a" : "#ffd36b");
      const wp = (f % 14) / 14; this.wisp.mesh.visible = false;
      if (this.wisp.mesh.visible) {
        const st = Math.round(wp * 16) / 16; this.wisp.r = this.pool.req(`smoke|${st}`, 400, 400, 1, (p) => smoke(p, st)); this.wisp.use(false);
        this.wisp.mesh.position.copy(tip).add(V(0.03 * wp, 0.07 + 0.24 * wp, 0)); this.wisp.mesh.quaternion.copy(cam.quaternion);
        const sz = 0.07 + 0.13 * wp; this.wisp.mesh.scale.set(sz, sz, 1);
      }
      // left shoulder (gun side) takes the front grip, right shoulder the rear grip
      [Hf, Hr].forEach((hd, i) => {
        const sh = this.gunner.mesh.localToWorld(V(i ? 0.19 : -0.19, 1.1, 0.01));
        const el = sh.clone().lerp(hd, 0.5).add(V(0, -0.12, 0));
        (this.arms[i].geometry as THREE.BufferGeometry).dispose();
        this.arms[i].geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(sh, el, hd), 12, 0.02, 8, false);
        this.arms[i].visible = this.hands[i].visible = !shotB; this.hands[i].position.copy(hd);
      });
    }
    // soft contact shadows under both cards
    [[OFF_AT, this.officer], [GUN_AT, this.gunner]].forEach(([at, act], i) => {
      const b = this.blobs[i], xz = at as [number, number];
      b.r = this.pool.req(`blob|contact|#7d7166`, 128, 128, 1, (p) => fxContact(p, "#7d7166"));
      b.mesh.visible = !shotB; b.mesh.position.set(xz[0], 0.015, xz[1]); b.mesh.rotation.set(-Math.PI / 2, 0, 0); b.mesh.scale.set(0.55, 0.36, 1);
      void act;
    });
    // --- blast + smoke (camera-facing), centred just outside the port so the bulwark frames it
    const mz = V(RUN1 + 1.36, 0.7, 0); // the port, independent of the recoil
    const sB = a / 0.6;
    this.fxBlast.mesh.visible = !shotB && a >= 0 && sB < 1;
    if (this.fxBlast.mesh.visible) {
      const st = Math.round(sB * 18) / 18;
      this.fxBlast.r = this.pool.req(`blast|${st}`, 600, 600, 1, (p) => blast(p, st));
      this.fxBlast.use(true);
      this.fxBlast.mesh.position.copy(mz).add(V(0.55 + 0.75 * Math.min(1, sB * 1.6), 0.05 + 0.3 * Math.min(1, sB * 1.6), 0));
      this.fxBlast.mesh.quaternion.copy(cam.quaternion); const sz = 2.0; this.fxBlast.mesh.scale.set(sz, sz, 1);
    }
    // flame tongue filling the gun port, so the blast reads as coming out of our gun
    this.fxJet.mesh.visible = !shotB && a >= 0 && sB < 0.95;
    if (this.fxJet.mesh.visible) {
      const st = Math.round(Math.min(0.85, sB * 1.15 + 0.08) * 18) / 18;
      this.fxJet.r = this.pool.req(`blast|${st}`, 600, 600, 1, (p) => blast(p, st)); this.fxJet.use(true);
      this.fxJet.mesh.position.set(RUN1 + 1.36 + 0.55, 0.66, 0); this.fxJet.mesh.quaternion.copy(cam.quaternion); this.fxJet.mesh.scale.set(1.25, 1.25, 1);
    }
    this.fxSmoke.forEach((e, i) => {
      const u = (a - 0.3 - 0.05 * i) / 1.5; e.mesh.visible = !shotB && u > 0 && u < 1;
      if (!e.mesh.visible) return;
      const st = Math.round(u * 20) / 20;
      e.r = this.pool.req(`smoke|${st}`, 400, 400, 1, (p) => smoke(p, st)); e.use(false);
      e.mesh.position.copy(mz).add(V(2.5 + 2.4 * u + 0.45 * i, 0.45 + 0.9 * u + 0.25 * i, (i - 1) * 0.5));
      e.mesh.quaternion.copy(cam.quaternion); const sz = 1.1 + 1.3 * Math.sqrt(u) + 0.2 * i; e.mesh.scale.set(sz, sz, 1);
    });
    // touch hole: sparks then a white wisp just before the shot
    const br = g.group.localToWorld(VENT.clone());
    const sp = (f - (FIRE - 4)) / 6; this.fxSparks.mesh.visible = !shotB && sp > 0 && sp < 1;
    if (this.fxSparks.mesh.visible) {
      const st = f % 3; this.fxSparks.r = this.pool.req(`sparks|${st}`, 300, 300, 1, (p) => sparks(p, st)); this.fxSparks.use(false);
      this.fxSparks.mesh.position.copy(br).add(V(0, 0.12, 0)); this.fxSparks.mesh.quaternion.copy(cam.quaternion); this.fxSparks.mesh.scale.set(0.42, 0.42, 1);
    }
    const up = (f - (FIRE - 3)) / 16; this.fxPuff.mesh.visible = !shotB && up > 0 && up < 1;
    if (this.fxPuff.mesh.visible) {
      const st = Math.round(up * 16) / 16; this.fxPuff.r = this.pool.req(`smoke|${st}`, 400, 400, 1, (p) => smoke(p, st)); this.fxPuff.use(false);
      this.fxPuff.mesh.position.copy(br).add(V(-0.05 * up, 0.2 + 0.4 * up, 0)); this.fxPuff.mesh.quaternion.copy(cam.quaternion);
      const sz = 0.2 + 0.3 * Math.sqrt(up); this.fxPuff.mesh.scale.set(sz, sz, 1);
    }
    // spray V behind the skimming ball
    this.fxSpray.mesh.visible = shotB;
    if (shotB) {
      const st = f % 4; this.fxSpray.r = this.pool.req(`spray|${st}`, 600, 320, 1, (p) => spray(p, st)); this.fxSpray.use(true);
      this.fxSpray.mesh.position.set(this.ball.position.x - 0.05, -2.2, this.ball.position.z); this.fxSpray.mesh.quaternion.copy(cam.quaternion); this.fxSpray.mesh.scale.set(0.9, 0.48, 1);
    }
    this.pool.flush();
    this.officer.bind(); this.gunner.bind(); this.fxBlast.bind(); this.fxJet.bind(); for (const e of this.fxSmoke) e.bind(); this.fxPuff.bind(); this.fxSpray.bind(); this.fxSparks.bind(); for (const b of this.blobs) b.bind(); this.wisp.bind();
    this.enemy.lookAt(pos.x, this.enemy.position.y, pos.z);
    return focus;
  }
}

// ---------------- optional: export this frame's scene + camera as GLB (for the Blender test) ----------------
/** with inputProps.exportGlb = "<url>", the frame's scene (visible objects, tagged materials) and camera are POSTed there */
const GlbExport: React.FC<{ world: BtWorld; cam: THREE.PerspectiveCamera; f: number }> = ({ world, cam, f }) => {
  const url = (getInputProps() as { exportGlb?: string }).exportGlb;
  const [h] = useState(() => (url ? delayRender("glb export") : null));
  useEffect(() => {
    if (!url || h === null) return;
    (async () => {
      const tag = (o: THREE.Object3D, name: string) => o.traverse((m) => { const mm = (m as THREE.Mesh).material as THREE.Material | undefined; if (mm) mm.name = name; });
      world.root.traverse((m) => { const mm = (m as THREE.Mesh).material as THREE.Material & { color?: THREE.Color } | undefined;
        if (mm && !mm.name) mm.name = `${mm.type}|${mm.color ? mm.color.getHexString() : "x"}`; });
      tag(world.officer.mesh, "CARD"); tag(world.gunner.mesh, "CARD");
      for (const e of [world.fxBlast, world.fxJet, world.fxPuff, world.fxSpray, world.fxSparks, ...world.fxSmoke]) tag(e.mesh, "FX");
      for (const b of world.blobs) tag(b.mesh, "BLOB");
      const c = cam.clone(); c.name = "ShotCam"; world.root.add(c); world.root.updateMatrixWorld(true);
      const glb = await new GLTFExporter().parseAsync(world.root, { binary: true, onlyVisible: true });
      world.root.remove(c);
      await fetch(`${url}?f=${f}`, { method: "POST", body: glb as ArrayBuffer });
      continueRender(h);
    })().catch((e) => { console.error("glb export failed", String(e)); continueRender(h); });
  }, []);
  return null;
};

// ---------------- render ----------------
const GRADE_BT: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
const Inner: React.FC<{ T: Tex }> = ({ T }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new BtWorld(T), [T]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.35, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: (() => { const g = new GradeEffect(GRADE_BT, 1); return g; })(),
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
  scene.background = new THREE.Color("#8cc4ee");
  const focus = world.update(f, camera as THREE.PerspectiveCamera);
  noInkFallback(world.root);
  fx.lens.focus = focus; fx.lens.cInf = f >= CUT ? 2 : 3.5;
  return (<><primitive object={world.root} dispose={null} />{(getInputProps() as any).nopost ? null : post}<Kick /><GlbExport world={world} cam={camera as THREE.PerspectiveCamera} f={f} /></>);
};

const WORDS: [number, number, string][] = [[0, 9 / 30, "If your"], [9 / 30, 18 / 30, "ship"], [18 / 30, 24 / 30, "got"], [24 / 30, 35 / 30, "hit by"], [35 / 30, 60 / 30, "a cannonball,"], [60 / 30, 3, "you'd"]];
const Caption: React.FC<{ t: number }> = ({ t }) => {
  const w = WORDS.find(([a, b]) => t >= a && t < b);
  if (!w) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center", fontFamily: "BtCap", fontSize: 82, color: "#fff",
      WebkitTextStroke: "16px #111", paintOrder: "stroke fill", letterSpacing: 1, textShadow: "0 6px 0 rgba(0,0,0,0.3)" }}>{w[2]}</div>
  );
};

/** 2D speed lines radiating from the ball during the follow shot */
const SpeedLines: React.FC<{ f: number }> = ({ f }) => {
  if (f < CUT) return null;
  const lines = Array.from({ length: 28 }, (_, i) => {
    const h = Math.sin((i + 1) * 12.9898 + f * 78.233) * 43758.5453, r = h - Math.floor(h);
    const a = Math.PI * (0.06 + 0.88 * (i / 27)) + r * 0.05, r0 = 300 + 260 * r, r1 = r0 + 160 + 340 * ((r * 7) % 1);
    const cx = 540, cy = 1060;
    return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a) * 1.25} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a) * 1.25}
      stroke="#ffffff" strokeOpacity={0.35 + 0.4 * r} strokeWidth={3 + 4 * r} strokeLinecap="round" />;
  });
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>{lines}</svg>;
};

export const BtCannon: React.FC = () => {
  const f = useCurrentFrame();
  const [T, setT] = useState<Tex | null>(null);
  const [h] = useState(() => delayRender("bt textures"));
  useEffect(() => { loadTex().then((x) => { setT(x); continueRender(h); }); }, [h]);
  if (!T) return null;
  return (
    <AbsoluteFill style={{ background: "#8cc4ee" }}>
      <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 46, near: 0.05, far: 2000 }}>
        <Inner T={T} />
      </ThreeCanvas>
      <SpeedLines f={f} />
      <Caption t={f / FPS} />
    </AbsoluteFill>
  );
};

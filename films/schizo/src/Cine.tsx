/* 《身体里住着两个人》 cinematic opening (0 → 24.9 s), real 3D.
   A cold bathroom at night, rain on the window. Someone has written 精分 in the fog on the mirror cabinet.
   The cabinet's two mirrored doors drift open and the word splits in two: 精 on one door, 分 on the other.
   On the hit a warm lamp comes on: one door now reflects a warm room, the other a cold one — 一个身体里住着两个人.
   The doors slam, the glass cracks; on the title hit the mirror bursts toward the camera in slow motion and the title
   burns gold in the dark where it was. We push through the title, black, and on the next hit a spotlight bangs on:
   an empty orchestra stage. Everything is code-drawn. */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { floorTex, drawGlass, drawCookie } from './PuppetTest';
import { chair, glowSprite } from './Set';
import { W, H, GOLD, INK, SERIF, SANS, txt, subtitle, mark, grain, vignette, ramp, eio, eo, clamp, FONT_CHARS } from './lib';

export const CINE_LEN_S = 24.9, CINE_FRAMES = Math.round(CINE_LEN_S * 30);
const SPLIT = 4.6, WARM = 8.473, SLAM = 12.55, CREAK = 14.6, TITLE = 16.613, POUR = 18.648, STAGE = 20.683;
const LINES: [number, number, string][] = [
  [0.33, 3.54, '你可能也随口说过：“我精分了”'],
  [4.40, 7.76, '在电影里，精神分裂常常是这样：'],
  [8.47, 11.40, '一个身体里，住着{两个人}'],
  [12.54, 15.75, '可医生说的“分裂”，到底是什么？'],
  [20.68, 24.61, '“好几个人格”，是另一种病：分离性身份障碍'],
];
const rng = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

/* ------------------------------------------------------------------ textures */
const tileTex = () => {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d')!; const r = rng(13);
  g.fillStyle = '#7d8483'; g.fillRect(0, 0, 1024, 1024);
  const tw = 128, th = 64;
  for (let row = 0; row < 16; row++) for (let col = -1; col < 9; col++) {
    const x = col * tw + (row % 2 ? tw / 2 : 0), y = row * th; const v = 205 + r() * 22;
    const gr = g.createLinearGradient(x, y, x, y + th); gr.addColorStop(0, `rgb(${v + 12},${v + 14},${v + 12})`); gr.addColorStop(1, `rgb(${v - 8},${v - 6},${v - 8})`);
    g.fillStyle = gr; g.beginPath(); g.roundRect(x + 3, y + 3, tw - 6, th - 6, 5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 6, y + 5, tw - 12, 2);
    for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(90,80,60,${r() * 0.05})`; g.fillRect(x + r() * tw, y + r() * th, 6 + r() * 20, 2 + r() * 8); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
const floorTiles = () => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d')!; const r = rng(29);
  g.fillStyle = '#1c1f21'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const v = 52 + r() * 16; g.fillStyle = `rgb(${v},${v + 3},${v + 4})`; g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(4, 5); t.anisotropy = 8; return t;
};
const curtainTex = () => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 64; const g = c.getContext('2d')!;
  for (let x = 0; x < 1024; x++) { const v = 0.5 + 0.5 * Math.sin(x * 0.11) * Math.sin(x * 0.023 + 1); const k = 30 + v * 60; g.fillStyle = `rgb(${k + 18},${k * 0.35},${k * 0.33})`; g.fillRect(x, 0, 1, 64); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* ------------------------------------------------------------------ the mirror: geometry shared by fog, cracks and shards */
const MW = 0.84, MH = 0.72, FW = 1024, FH = 878; // glass (both doors) and the fog canvas
const P0: [number, number] = [0.0, 0.03]; // impact point, on the seam
const toC = (x: number, y: number): [number, number] => [((x + MW / 2) / MW) * FW, ((MH / 2 - y) / MH) * FH];
type Pt = [number, number];
const clipPoly = (poly: Pt[], x0: number, x1: number, y0: number, y1: number) => {
  const edge = (pts: Pt[], inside: (p: Pt) => boolean, cut: (a: Pt, b: Pt) => Pt) => { const out: Pt[] = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const ia = inside(a), ib = inside(b); if (ia) out.push(a); if (ia !== ib) out.push(cut(a, b)); } return out; };
  const cx = (X: number) => (a: Pt, b: Pt): Pt => [X, a[1] + ((b[1] - a[1]) * (X - a[0])) / (b[0] - a[0])];
  const cy = (Y: number) => (a: Pt, b: Pt): Pt => [a[0] + ((b[0] - a[0]) * (Y - a[1])) / (b[1] - a[1]), Y];
  let p = edge(poly, (q) => q[0] >= x0, cx(x0)); if (p.length) p = edge(p, (q) => q[0] <= x1, cx(x1)); if (p.length) p = edge(p, (q) => q[1] >= y0, cy(y0)); if (p.length) p = edge(p, (q) => q[1] <= y1, cy(y1));
  return p;
};
const area = (p: Pt[]) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(a) / 2; };
const CRACK = (() => {
  const r = rng(101); const N = 13, RINGS = [0.035, 0.085, 0.15, 0.24, 0.37, 0.56, 0.9];
  const ang = Array.from({ length: N }, (_, i) => ((i + (r() - 0.5) * 0.6) / N) * Math.PI * 2);
  const rad = ang.map(() => RINGS.map((v) => v * (0.82 + r() * 0.36)));
  const pt = (i: number, k: number): Pt => { const j = i % N; return [P0[0] + Math.cos(ang[j]) * rad[j][k], P0[1] + Math.sin(ang[j]) * rad[j][k]]; };
  const cells: Pt[][] = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < RINGS.length; k++) cells.push(k === 0 ? [P0, pt(i, 0), pt(i + 1, 0)] : [pt(i, k - 1), pt(i + 1, k - 1), pt(i + 1, k), pt(i, k)]);
  const shards: { poly: Pt[]; side: number }[] = [];
  for (const c of cells) for (const side of [-1, 1]) { const p = clipPoly(c, side < 0 ? -MW / 2 : 0, side < 0 ? 0 : MW / 2, -MH / 2, MH / 2); if (p.length >= 3 && area(p) > 2e-5) shards.push({ poly: p, side }); }
  /* crack edges, each with the time it appears */
  const edges: { a: Pt; b: Pt; t: number; w: number }[] = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < RINGS.length; k++) {
    const a = k === 0 ? P0 : pt(i, k - 1), b = pt(i, k);
    edges.push({ a, b, t: k <= 4 ? SLAM + 0.025 * k : k === 5 ? CREAK + r() * 0.3 : 16.25 + r() * 0.3, w: 1.6 - k * 0.12 });
    if (k >= 1) { const ring = r(); edges.push({ a: pt(i, k), b: pt(i + 1, k), t: k <= 2 && ring < 0.75 ? SLAM + 0.05 + 0.04 * k : k <= 4 && ring < 0.7 ? CREAK + 0.1 + r() * 0.5 : 16.2 + r() * 0.35, w: 1.1 }); }
  }
  return { shards, edges };
})();
/* jagged crack line on the fog canvas */
const crackLine = (g: CanvasRenderingContext2D, a: Pt, b: Pt, k: number, w: number, seed: number) => {
  const r = rng(seed); const [ax, ay] = toC(...a), [bx, by] = toC(...b); const n = 5; const pts: Pt[] = [[ax, ay]];
  for (let i = 1; i < n; i++) { const u = i / n; const nx = -(by - ay), ny = bx - ax; const L = Math.hypot(nx, ny) || 1; const o = (r() - 0.5) * 14; pts.push([ax + (bx - ax) * u + (nx / L) * o, ay + (by - ay) * u + (ny / L) * o]); }
  pts.push([bx, by]); const m = Math.max(1, Math.ceil(pts.length * k));
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < m; i++) g.lineTo(pts[i][0], pts[i][1]);
  if (k < 1) { const i = m; const u = pts.length * k - (m - 1); const p = pts[Math.min(i, pts.length - 1)], q = pts[i - 1]; g.lineTo(q[0] + (p[0] - q[0]) * u, q[1] + (p[1] - q[1]) * u); }
  g.lineCap = 'round'; g.strokeStyle = 'rgba(6,10,14,.75)'; g.lineWidth = 3.4 * w; g.stroke(); g.strokeStyle = 'rgba(235,244,255,.95)'; g.lineWidth = 1.3 * w; g.stroke();
};

/* fog base: condensation, drawn once */
let FOGBASE: HTMLCanvasElement | null = null;
const fogBase = () => {
  if (FOGBASE) return FOGBASE; const c = document.createElement('canvas'); c.width = FW; c.height = FH; const g = c.getContext('2d')!; const r = rng(55);
  const gr = g.createRadialGradient(FW / 2, FH * 0.55, 100, FW / 2, FH * 0.55, 700); gr.addColorStop(0, 'rgba(208,216,222,.58)'); gr.addColorStop(1, 'rgba(200,208,214,.48)'); g.fillStyle = gr; g.fillRect(0, 0, FW, FH);
  for (let i = 0; i < 90; i++) { const x = r() * FW, y = r() * FH, rr = 40 + r() * 160; const b = g.createRadialGradient(x, y, 0, x, y, rr); b.addColorStop(0, `rgba(225,232,238,${r() * 0.12})`); b.addColorStop(1, 'rgba(225,232,238,0)'); g.fillStyle = b; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.3})`; g.beginPath(); g.arc(r() * FW, FH * (0.55 + r() * 0.45), 1 + r() * 4, 0, 7); g.fill(); }
  g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(240,246,250,${r() * 0.22})`; g.beginPath(); g.arc(r() * FW, r() * FH, 0.6 + r() * 1.8, 0, 7); g.fill(); }
  FOGBASE = c; return c;
};
const WORD = [{ c: '精', x: FW * 0.25, t0: 0.55, t1: 1.6 }, { c: '分', x: FW * 0.75, t0: 1.7, t1: 2.55 }];
const DRIPS = (() => { const r = rng(7); return Array.from({ length: 9 }, (_, i) => ({ x: (i < 5 ? FW * 0.25 : FW * 0.75) + (r() - 0.5) * 220, y: FH * 0.52 + r() * 40, t0: 2.4 + r() * 3.5, v: 40 + r() * 70, len: 120 + r() * 260 })); })();
const drawFog = (g: CanvasRenderingContext2D, t: number) => {
  g.clearRect(0, 0, FW, FH); g.drawImage(fogBase(), 0, 0);
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (const w of WORD) { const k = ramp(t, w.t0, w.t1 - w.t0); if (k <= 0) continue; g.save(); g.beginPath(); g.rect(w.x - 170, FH * 0.2, 340, 420 * eio(k) + 1); g.clip();
    g.font = `900 300px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineWidth = 16; g.lineJoin = 'round'; g.lineCap = 'round';
    g.fillText(w.c, w.x, FH * 0.42); g.strokeText(w.c, w.x, FH * 0.42); g.restore(); }
  for (const d of DRIPS) { if (t < d.t0) continue; const L = Math.min(d.len, (t - d.t0) * d.v * (1 / (1 + (t - d.t0) * 0.35))); g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.9)'; g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + Math.sin(d.y * 0.1) * 3, d.y + L); g.stroke(); }
  g.restore();
  for (const d of DRIPS) { if (t < d.t0) continue; const L = Math.min(d.len, (t - d.t0) * d.v * (1 / (1 + (t - d.t0) * 0.35))); g.fillStyle = 'rgba(225,236,246,.6)'; g.beginPath(); g.ellipse(d.x + Math.sin(d.y * 0.1) * 3, d.y + L, 5, 7, 0, 0, 7); g.fill(); }
  if (t >= SLAM) CRACK.edges.forEach((e, i) => { if (t < e.t) return; crackLine(g, e.a, e.b, eo(ramp(t, e.t, 0.06)), e.w, 300 + i); });
};

/* the title, burnt into a canvas */
const TCH = ['《', '身', '体', '里', '住', '着', '两', '个', '人', '》'], TAT = [0, 0, 0.254, 0.509, 0.763, 1.018, 1.272, 1.527, 1.781, 1.781];
const TW = 2048, TH = 512;
const drawTitle = (g: CanvasRenderingContext2D, t: number) => {
  g.clearRect(0, 0, TW, TH); if (t < TITLE) return;
  const size = 176, cw = 190, x0 = TW / 2 - (TCH.length * cw) / 2 + cw / 2, pour = ramp(t, POUR, 0.6);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `600 40px ${SERIF}`; g.fillStyle = `rgba(243,237,226,${0.55 * ramp(t, TITLE + 0.2, 0.4)})`; g.fillText('S C H I Z O P H R E N I A  ·  B L E U L E R  ·  M C M V I I I', TW / 2, 130);
  TCH.forEach((c, i) => { const t0 = TITLE + TAT[i]; if (t < t0) return; const k = eo(ramp(t, t0, 0.22)); const sc = 1 + 0.35 * (1 - k); const off = (1 - k) * 34;
    g.save(); g.translate(x0 + i * cw, 360); g.scale(sc, sc); g.font = `700 ${size}px ${SERIF}`;
    if (off > 0.5) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,150,80,.85)'; g.fillText(c, -off, 0); g.fillStyle = 'rgba(100,165,255,.85)'; g.fillText(c, off, 0); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = INK; g.globalAlpha = k; g.fillText(c, 0, 0);
    const lit = clamp(pour * 1.6 - (i / TCH.length) * 0.6); if (lit > 0) { const gr = g.createLinearGradient(0, -size, 0, 16); gr.addColorStop(0, '#fff3cc'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c08a34'); g.globalAlpha = lit; g.shadowColor = 'rgba(255,200,110,.9)'; g.shadowBlur = 40; g.fillStyle = gr; g.fillText(c, 0, 0); g.shadowBlur = 0; g.fillText(c, 0, 0); }
    g.restore(); });
};

/* ------------------------------------------------------------------ camera: cubic Hermite through keys [t, px,py,pz, lx,ly,lz, fov] */
type Key = number[];
const herm = (keys: Key[], t: number) => {
  if (t <= keys[0][0]) return keys[0].slice(1); const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0; while (keys[i + 1][0] < t) i++;
  const k0 = keys[i], k1 = keys[i + 1], dt = k1[0] - k0[0], u = (t - k0[0]) / dt, u2 = u * u, u3 = u2 * u;
  const tan = (j: number, d: number) => { const a = keys[Math.max(0, j - 1)], b = keys[Math.min(n - 1, j + 1)]; if (j === 0 || j === n - 1) return 0; return ((b[d] - a[d]) / (b[0] - a[0])) * dt; };
  return k0.slice(1).map((_, d) => { const p0 = k0[d + 1], p1 = k1[d + 1]; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * tan(i, d + 1) + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * tan(i + 1, d + 1); });
};
const BATH_KEYS: Key[] = [
  [0.0, 0.46, 1.4, 3.0, 0.0, 1.47, 0, 38],
  [4.4, 0.24, 1.47, 2.2, 0.0, 1.5, 0, 36],
  [8.47, -0.16, 1.52, 1.62, 0.0, 1.53, 0, 35],
  [12.2, 0.16, 1.54, 1.42, 0.0, 1.55, 0, 34],
  [16.55, 0.02, 1.55, 1.0, 0.0, 1.55, 0, 34],
];
const X0 = 60; // the stage lives far away in the same scene
const STAGE_KEYS: Key[] = [
  [STAGE, X0 + 3.4, 3.9, 5.6, X0, 0.55, -0.4, 31],
  [CINE_LEN_S, X0 + 2.0, 2.15, 3.9, X0, 0.75, -0.4, 31],
];


/* ------------------------------------------------------------------ the person in the mirror (only the mirror cameras can see them):
   a figure in dark clothes, standing still, breathing. Built facing +Z, origin on the floor. */
type Fig = { root: THREE.Group; torso: THREE.Group; head: THREE.Group; key: THREE.PointLight; rim: THREE.PointLight };
const person = (layer: number): Fig => {
  const root = new THREE.Group(); const cloth = M({ color: '#0b0c0e', roughness: 0.9 }), skin = M({ color: '#3a2c25', roughness: 0.6 }), hair = M({ color: '#0d0d0f', roughness: 0.7 });
  const torso = new THREE.Group(); torso.position.y = 1.0; root.add(torso);
  const prof = [[0.0, -0.1], [0.15, -0.1], [0.155, 0.0], [0.165, 0.18], [0.185, 0.32], [0.205, 0.41], [0.19, 0.46], [0.13, 0.49], [0.06, 0.505], [0.0, 0.51]].map(([r, y]) => new THREE.Vector2(r, y));
  const tg = new THREE.LatheGeometry(prof, 40); tg.scale(1, 1, 0.58); const tm = new THREE.Mesh(tg, cloth); torso.add(tm);
  for (const sx of [-1, 1]) { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), cloth); sh.position.set(sx * 0.178, 0.415, 0); torso.add(sh);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.047, 0.5, 6, 14), cloth); arm.position.set(sx * 0.215, 0.17, 0.0); arm.rotation.z = sx * 0.07; torso.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 10), skin); hand.scale.set(0.8, 1.3, 0.6); hand.position.set(sx * 0.235, -0.13, 0.0); torso.add(hand); }
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.026, 10, 24), cloth); collar.rotation.x = Math.PI / 2; collar.position.y = 0.5; torso.add(collar);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.09, 16), skin); neck.position.y = 0.535; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.575; torso.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 24), skin); hd.scale.set(0.8, 1.12, 0.92); hd.position.y = 0.09; head.add(hd);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.022, 10), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.085, 0.092); head.add(nose);
  const hr = new THREE.Mesh(new THREE.SphereGeometry(0.106, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hr.scale.set(0.86, 1.08, 1.0); hr.position.set(0, 0.112, -0.008); hr.rotation.x = -0.25; head.add(hr);
  root.traverse((o) => o.layers.set(layer));
  const key = new THREE.PointLight('#a8bccc', 0, 3, 2); key.layers.set(layer); const rim = new THREE.PointLight('#8fb0d0', 0, 3, 2); rim.layers.set(layer);
  return { root, torso, head, key, rim };
};
/* ------------------------------------------------------------------ the world */
type Refs = {
  innerG: THREE.Group; figs: Fig[]; refls: Reflector[]; fogMat: THREE.MeshBasicMaterial;
  bath: THREE.Group; stage: THREE.Group; doors: THREE.Group[]; overlays: THREE.Mesh[]; fog: CanvasRenderingContext2D; fogTex: THREE.CanvasTexture;
  glass: CanvasRenderingContext2D; glassTex: THREE.CanvasTexture; cookie: CanvasRenderingContext2D; cookieTex: THREE.CanvasTexture;
  title: CanvasRenderingContext2D; titleTex: THREE.CanvasTexture; titleMesh: THREE.Mesh; titleGlow: THREE.Sprite; titleLight: THREE.PointLight;
  tube: THREE.MeshStandardMaterial; tubeLight: THREE.SpotLight; tubeFill: THREE.PointLight; warmShade: THREE.MeshStandardMaterial; warmLight: THREE.PointLight; warmGlow: THREE.Sprite;
  shards: { g: THREE.Group; base: THREE.Vector3; v: THREE.Vector3; axis: THREE.Vector3; w: number }[]; shardRoot: THREE.Group;
  spot: THREE.SpotLight; beam: THREE.ShaderMaterial; dust: THREE.Points; dustBase: Float32Array; motes: THREE.Points; moteBase: Float32Array; rim: THREE.DirectionalLight;
};
const M = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };

const World: React.FC<{ t: number }> = ({ t }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo<Refs>(() => {
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = new THREE.Color('#000000');
    const bath = new THREE.Group(), stage = new THREE.Group(); scene.add(bath, stage);
    /* ---------- bathroom: x -1.3..1.3, z 0..3.2, y 0..2.6 */
    const RW = 2.6, RD = 3.2, RH = 2.6;
    const tiles = (w: number, h: number) => { const tx = tileTex(); tx.repeat.set(w / 1.2, h / 1.2); return M({ map: tx, roughness: 0.22, metalness: 0.0, color: '#d6dcdc' }); };
    const wall = (w: number, h: number, pos: [number, number, number], ry: number, mat = tiles(w, h)) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(...pos); m.rotation.y = ry; m.receiveShadow = true; bath.add(m); return m; };
    wall(RW, RH, [0, RH / 2, 0], 0); // mirror wall
    wall(RD, RH, [-RW / 2, RH / 2, RD / 2], Math.PI / 2); // left
    wall(RW, RH, [0, RH / 2, RD], Math.PI); // front (behind the camera; seen in the mirror)
    const WIN = { z0: 0.75, z1: 1.55, y0: 1.25, y1: 2.05 };
    const rw = (z0: number, z1: number, y0: number, y1: number) => wall(z1 - z0, y1 - y0, [RW / 2, (y0 + y1) / 2, (z0 + z1) / 2], -Math.PI / 2, tiles(z1 - z0, y1 - y0));
    rw(0, WIN.z0, 0, RH); rw(WIN.z1, RD, 0, RH); rw(WIN.z0, WIN.z1, 0, WIN.y0); rw(WIN.z0, WIN.z1, WIN.y1, RH);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M({ map: floorTiles(), roughness: 0.45, color: '#9aa0a2' })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, RD / 2); fl.receiveShadow = true; bath.add(fl);
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M({ color: '#15191b', roughness: 1 })); ce.rotation.x = Math.PI / 2; ce.position.set(0, RH, RD / 2); bath.add(ce);
    /* window: reveal, frame, rainy glass */
    const frameM = M({ color: '#23292d', roughness: 0.5 });
    const zc = (WIN.z0 + WIN.z1) / 2, yc = (WIN.y0 + WIN.y1) / 2, ww = WIN.z1 - WIN.z0, wh = WIN.y1 - WIN.y0;
    for (const z of [WIN.z0, WIN.z1]) add(bath, new THREE.BoxGeometry(0.18, wh, 0.03), frameM, RW / 2 + 0.09, yc, z);
    for (const y of [WIN.y0, WIN.y1]) add(bath, new THREE.BoxGeometry(0.18, 0.03, ww), frameM, RW / 2 + 0.09, y, zc);
    add(bath, new THREE.BoxGeometry(0.04, wh, 0.035), frameM, RW / 2 + 0.12, yc, zc); add(bath, new THREE.BoxGeometry(0.04, 0.035, ww), frameM, RW / 2 + 0.12, yc + 0.1, zc);
    const gc = document.createElement('canvas'); gc.width = gc.height = 512; const glass = gc.getContext('2d')!; const glassTex = new THREE.CanvasTexture(gc); glassTex.colorSpace = THREE.SRGBColorSpace;
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: glassTex, fog: false })); gm.position.set(RW / 2 + 0.14, yc, zc); gm.rotation.y = -Math.PI / 2; bath.add(gm);
    /* front door, towel rail, towel: things the mirror shows */
    add(bath, new THREE.BoxGeometry(0.86, 2.05, 0.05), M({ color: '#3a2c22', roughness: 0.6 }), 0.55, 1.025, RD - 0.03);
    add(bath, new THREE.SphereGeometry(0.03, 16, 12), M({ color: '#b9b2a6', metalness: 1, roughness: 0.25 }), 0.2, 1.0, RD - 0.07);
    add(bath, new THREE.CylinderGeometry(0.012, 0.012, 0.7, 12).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), M({ color: '#c8ccd0', metalness: 1, roughness: 0.2 }), -RW / 2 + 0.08, 1.25, 1.95);
    add(bath, new THREE.BoxGeometry(0.05, 0.62, 0.42), M({ color: '#5d6b74', roughness: 0.95 }), -RW / 2 + 0.09, 0.95, 1.95);
    /* vanity: counter, cabinet below, vessel basin, chrome tap, a glass with a toothbrush */
    add(bath, new THREE.BoxGeometry(1.2, 0.04, 0.55), M({ color: '#2a2d2f', roughness: 0.25 }), 0, 0.86, 0.275);
    add(bath, new THREE.BoxGeometry(1.16, 0.8, 0.5), M({ color: '#2d2621', roughness: 0.7 }), 0, 0.44, 0.25);
    for (const x of [-0.29, 0.29]) add(bath, new THREE.BoxGeometry(0.2, 0.012, 0.012), M({ color: '#a8a39a', metalness: 1, roughness: 0.3 }), x, 0.76, 0.505);
    const bowlPts: THREE.Vector2[] = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 0.5; bowlPts.push(new THREE.Vector2(0.03 + Math.sin(a) * 0.19, 0.0 + (1 - Math.cos(a)) * 0.15)); }
    const bowl = add(bath, new THREE.LatheGeometry(bowlPts, 48), M({ color: '#e8eae8', roughness: 0.15, side: THREE.DoubleSide }), 0, 0.88, 0.3); void bowl;
    const chrome = M({ color: '#d0d4d8', metalness: 1, roughness: 0.12 });
    add(bath, new THREE.CylinderGeometry(0.018, 0.022, 0.26, 20), chrome, 0, 1.01, 0.06);
    add(bath, new THREE.CylinderGeometry(0.014, 0.014, 0.16, 16).rotateX(Math.PI / 2), chrome, 0, 1.13, 0.13);
    const cup = add(bath, new THREE.CylinderGeometry(0.035, 0.03, 0.1, 24, 1, true), M({ color: '#cfe3ea', roughness: 0.05, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), 0.42, 0.93, 0.18, false); void cup;
    add(bath, new THREE.BoxGeometry(0.012, 0.19, 0.012).rotateZ(0.2), M({ color: '#4f7f8f', roughness: 0.5 }), 0.43, 0.99, 0.18);
    /* mirror cabinet: hollow box, shelves, pill bottles; two mirrored doors */
    const cab = new THREE.Group(); cab.position.set(0, 1.55, 0); bath.add(cab);
    const cabM = M({ color: '#25292c', roughness: 0.55 }), inner = new THREE.MeshBasicMaterial({ color: '#030303' });
    add(cab, new THREE.BoxGeometry(0.92, 0.8, 0.01), inner, 0, 0, 0.01);
    for (const sx of [-1, 1]) add(cab, new THREE.BoxGeometry(0.015, 0.8, 0.12), cabM, sx * 0.4525, 0, 0.06);
    for (const sy of [-1, 1]) add(cab, new THREE.BoxGeometry(0.92, 0.015, 0.12), cabM, 0, sy * 0.3925, 0.06);
    const innerG = new THREE.Group(); cab.add(innerG);
    for (const y of [-0.13, 0.12]) add(innerG, new THREE.BoxGeometry(0.89, 0.012, 0.1), M({ color: '#9fb0b4', roughness: 0.1, transparent: true, opacity: 0.6 }), 0, y, 0.06);
    { const r = rng(3); const amber = M({ color: '#7a3f12', roughness: 0.2, transparent: true, opacity: 0.85 }), cap = M({ color: '#e9e6df', roughness: 0.5 });
      for (let i = 0; i < 7; i++) { const x = -0.36 + i * 0.11 + r() * 0.03, y = i % 2 ? 0.126 : -0.124, h = 0.07 + r() * 0.05;
        add(innerG, new THREE.CylinderGeometry(0.022, 0.022, h, 16), amber, x, y + h / 2 + 0.006, 0.05 + r() * 0.03); add(innerG, new THREE.CylinderGeometry(0.024, 0.024, 0.018, 16), cap, x, y + h + 0.015, 0.05 + r() * 0.0); } }
    const fogC = document.createElement('canvas'); fogC.width = FW; fogC.height = FH; const fog = fogC.getContext('2d')!; const fogTex = new THREE.CanvasTexture(fogC); fogTex.colorSpace = THREE.SRGBColorSpace;
    const fogMat = new THREE.MeshBasicMaterial({ map: fogTex, transparent: true, depthWrite: false, fog: false, color: '#9aa4aa' });
    const shardFog = new THREE.MeshBasicMaterial({ map: fogTex, transparent: true, depthWrite: false, fog: false, color: '#c9d2d8', opacity: 0.8 });
    const doors: THREE.Group[] = [], overlays: THREE.Mesh[] = [], refls: Reflector[] = [];
    for (const side of [-1, 1]) {
      const hinge = new THREE.Group(); hinge.position.set(side * 0.44, 0, 0.125); cab.add(hinge); doors.push(hinge);
      const d = new THREE.Group(); d.position.x = -side * 0.22; hinge.add(d);
      for (const sy of [-1, 1]) add(d, new THREE.BoxGeometry(0.44, 0.03, 0.02), cabM, 0, sy * 0.375, 0.002); for (const sx of [-1, 1]) add(d, new THREE.BoxGeometry(0.012, 0.78, 0.02), cabM, sx * 0.214, 0, 0.002);
      const refl = new Reflector(new THREE.PlaneGeometry(0.42, MH), { textureWidth: 900, textureHeight: 1540, color: 0x9aa3aa, clipBias: 0.003 }); refl.position.z = 0.0085; d.add(refl); refls.push(refl); refl.camera.layers.enable(side < 0 ? 1 : 2);
      const og = new THREE.PlaneGeometry(0.42, MH); const uv = og.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setX(i, side < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5);
      const ov = new THREE.Mesh(og, fogMat); ov.position.z = 0.0098; d.add(ov); overlays.push(ov);
    }
    /* shards (hidden until the burst): metal-mirror front plus their piece of the fog and cracks */
    const pm = new THREE.PMREMGenerator(gl); const env = new THREE.Scene(); env.background = new THREE.Color('#020304');
    const panel = (c: string, i: number, w: number, h: number, p: [number, number, number]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
    panel('#ffc26e', 6, 3, 1.2, [0, 0, -4]); panel('#9ec3e6', 4, 2, 4, [4, 1, 0]); panel('#ffb070', 1.6, 2, 3, [-4, 0, 1]); panel('#ffffff', 1.2, 6, 0.5, [0, 4, 0]); panel('#6d8aa3', 0.6, 4, 2, [0, -1, 4]);
    const envMap = pm.fromScene(env, 0.03).texture;
    const shardMetal = M({ color: '#5c6872', metalness: 0.8, roughness: 0.1, envMap, envMapIntensity: 2.2, emissive: '#000000' });
    const shardRoot = new THREE.Group(); shardRoot.position.set(0, 1.55, 0.1335); shardRoot.visible = false; bath.add(shardRoot);
    const rS = rng(77); const shards: Refs['shards'] = [];
    for (const s of CRACK.shards) {
      const cx = s.poly.reduce((a, p) => a + p[0], 0) / s.poly.length, cy = s.poly.reduce((a, p) => a + p[1], 0) / s.poly.length;
      const sh = new THREE.Shape(s.poly.map(([x, y]) => new THREE.Vector2(x - cx, y - cy)));
      const g = new THREE.Group(); const base = new THREE.Vector3(cx + s.side * 0.01, cy, 0); g.position.copy(base); shardRoot.add(g);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: false }); geo.translate(0, 0, -0.004); const me = new THREE.Mesh(geo, shardMetal.clone()); me.castShadow = true; g.add(me);
      const og = new THREE.ShapeGeometry(sh); const uv = og.attributes.uv as THREE.BufferAttribute, pos = og.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) { const x = pos.getX(i) + cx, y = pos.getY(i) + cy; uv.setXY(i, (x + MW / 2) / MW, (y + MH / 2) / MH); }
      const ov = new THREE.Mesh(og, shardFog); ov.position.z = 0.0012; g.add(ov);
      const dir = new THREE.Vector3(cx - P0[0], cy - P0[1], 0); const dl = dir.length() || 0.01; dir.normalize();
      const v = dir.multiplyScalar(0.25 + rS() * 0.6 + 0.08 / (dl + 0.1)).add(new THREE.Vector3((rS() - 0.5) * 0.2, (rS() - 0.4) * 0.2, 0.15 + rS() * rS() * 1.6));
      shards.push({ g, base, v, axis: new THREE.Vector3(rS() - 0.5, rS() - 0.5, rS() - 0.5).normalize(), w: (1.5 + rS() * 4) * (rS() < 0.5 ? -1 : 1) });
    }
    /* title in the dark where the mirror was */
    const tc = document.createElement('canvas'); tc.width = TW; tc.height = TH; const title = tc.getContext('2d')!; const titleTex = new THREE.CanvasTexture(tc); titleTex.colorSpace = THREE.SRGBColorSpace;
    const titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.31), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, depthWrite: false, toneMapped: false, fog: false })); titleMesh.position.set(0, 1.55, 0.16); bath.add(titleMesh);
    const titleGlow = glowSprite('#ffb455', 2.6, 0); titleGlow.position.set(0, 1.55, 0.12); bath.add(titleGlow);
    const titleLight = new THREE.PointLight('#ffc070', 0, 4, 2); titleLight.position.set(0, 1.55, 0.75); bath.add(titleLight);
    /* lights: a cold fluorescent tube over the mirror, rain light through the window, a warm wall lamp on the left that comes on at the hit */
    bath.add(new THREE.HemisphereLight('#5d7486', '#0d1012', 0.35));
    const tube = M({ color: '#dfeef2', emissive: '#cfe6f0', emissiveIntensity: 2.2, roughness: 0.3 });
    add(bath, new THREE.CylinderGeometry(0.022, 0.022, 0.62, 20).rotateZ(Math.PI / 2), tube, 0, 2.03, 0.12, false);
    add(bath, new THREE.BoxGeometry(0.7, 0.05, 0.05), M({ color: '#9ea5a8', metalness: 0.8, roughness: 0.35 }), 0, 2.03, 0.07);
    const tubeLight = new THREE.SpotLight('#d8ecf4', 9, 0, 1.15, 0.9, 2); tubeLight.position.set(0, 1.98, 0.2); tubeLight.target.position.set(0, 0.6, 0.9);
    tubeLight.castShadow = true; tubeLight.shadow.mapSize.set(1024, 1024); tubeLight.shadow.bias = -0.0006; tubeLight.shadow.radius = 4; tubeLight.shadow.camera.near = 0.05; tubeLight.shadow.camera.far = 5; bath.add(tubeLight, tubeLight.target);
    const tubeFill = new THREE.PointLight('#cfe4ee', 1.2, 3, 2); tubeFill.position.set(0, 2.0, 0.6); bath.add(tubeFill);
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const cookie = cc.getContext('2d')!; const cookieTex = new THREE.CanvasTexture(cc); cookieTex.colorSpace = THREE.SRGBColorSpace;
    const moon = new THREE.SpotLight('#9db6cc', 130, 0, 0.36, 0.5, 2); moon.position.set(RW / 2 + 1.6, 2.7, 1.2); moon.target.position.set(-0.6, 1.0, 0.55); moon.map = cookieTex;
    moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); moon.shadow.bias = -0.0005; moon.shadow.radius = 4; moon.shadow.camera.near = 0.5; moon.shadow.camera.far = 8; bath.add(moon, moon.target);
    const warmShade = M({ color: '#f3dcb8', emissive: '#ffad5c', emissiveIntensity: 0, roughness: 0.8 });
    const shade = add(bath, new THREE.SphereGeometry(0.11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), warmShade, -RW / 2 + 0.16, 1.82, 1.05, false); shade.rotation.z = -Math.PI / 2;
    add(bath, new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24).rotateZ(Math.PI / 2), M({ color: '#7d6440', metalness: 0.8, roughness: 0.35 }), -RW / 2 + 0.01, 1.82, 1.05);
    const warmLight = new THREE.PointLight('#ffad62', 0, 4.5, 2); warmLight.position.set(-RW / 2 + 0.3, 1.82, 1.05); warmLight.castShadow = true; warmLight.shadow.mapSize.set(512, 512); warmLight.shadow.bias = -0.002; bath.add(warmLight);
    const warmGlow = glowSprite('#ffb066', 0.9, 0); warmGlow.position.set(-RW / 2 + 0.24, 1.82, 1.05); bath.add(warmGlow);
    /* dust/steam motes in the window light */
    const r = rng(19); const NM = 140, moteBase = new Float32Array(NM * 3);
    for (let i = 0; i < NM; i++) { moteBase[i * 3] = -0.3 + r() * 1.5; moteBase[i * 3 + 1] = 0.9 + r() * 1.3; moteBase[i * 3 + 2] = 0.3 + r() * 1.6; }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(moteBase.slice(), 3));
    const motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: '#cfe0ec', size: 0.006, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); bath.add(motes);

    /* ---------- stage: boards, a red curtain far back, empty orchestra chairs, one spotlight with a beam and dust */
    stage.position.set(X0, 0, 0);
    const ft = floorTex(); ft.repeat.set(5, 5);
    const sf = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), M({ map: ft, roughness: 0.5, color: '#8f7d68' })); sf.rotation.x = -Math.PI / 2; sf.receiveShadow = true; stage.add(sf);
    const cur = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), M({ map: curtainTex(), roughness: 0.9, color: '#a77f7a' })); cur.position.set(0, 4, -5.5); cur.receiveShadow = true; stage.add(cur);
    const placeChair = (x: number, z: number) => { const ch = chair(0.46); ch.position.set(x, 0, z); ch.rotation.y = Math.atan2(-x, 2.4 - z); stage.add(ch); return ch; };
    for (const [R, n] of [[2.0, 7], [3.0, 10], [4.0, 13]] as const) for (let i = 0; i < n; i++) { const a = -1.15 + (2.3 * i) / (n - 1); placeChair(Math.sin(a) * R, -1.2 - Math.cos(a) * R + 2.4); }
    placeChair(0, 0.15);
    const stand = M({ color: '#1b1c1e', metalness: 0.7, roughness: 0.4 });
    add(stage, new THREE.CylinderGeometry(0.01, 0.01, 1.05, 10), stand, 0, 0.53, 0.75); add(stage, new THREE.CylinderGeometry(0.16, 0.16, 0.01, 3), stand, 0, 0.01, 0.75);
    const desk = add(stage, new THREE.BoxGeometry(0.5, 0.34, 0.01), stand, 0, 1.12, 0.73); desk.rotation.x = -0.35;
    const sheet = add(stage, new THREE.PlaneGeometry(0.42, 0.29), M({ color: '#e9e1cf', roughness: 0.9 }), 0, 1.125, 0.723, false); sheet.rotation.x = -0.35 + Math.PI; sheet.rotation.y = Math.PI;
    stage.add(new THREE.HemisphereLight('#2a3440', '#080706', 0.07));
    const spot = new THREE.SpotLight('#ffe2b8', 0, 0, 0.17, 0.3, 2); spot.position.set(0, 7.5, 0.35); spot.target.position.set(0, 0, 0.35);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; spot.shadow.radius = 3; spot.shadow.camera.near = 3; spot.shadow.camera.far = 9; stage.add(spot, spot.target);
    const rim = new THREE.DirectionalLight('#6f8aa6', 0); rim.position.set(-2, 4, -8); stage.add(rim);
    const beam = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uI: { value: 0 }, uC: { value: new THREE.Color('#ffd9a6') } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vH; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); vH = (position.y+3.75)/7.5; gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'uniform float uI; uniform vec3 uC; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 2.2) * mix(0.25, 0.7, vH) * uI; gl_FragColor = vec4(uC, a); }' });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7.5 * Math.tan(0.17), 7.5, 64, 1, true), beam); cone.position.set(0, 3.75, 0.35); stage.add(cone);
    const ND = 520, dustBase = new Float32Array(ND * 3); const rd = rng(23);
    for (let i = 0; i < ND; i++) { const h = rd() * 7.2, rad = Math.sqrt(rd()) * (0.1 + (7.5 - h) * Math.tan(0.17) * 0.95), a = rd() * 7; dustBase[i * 3] = Math.cos(a) * rad; dustBase[i * 3 + 1] = h; dustBase[i * 3 + 2] = 0.35 + Math.sin(a) * rad; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dustBase.slice(), 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#ffe0b0', size: 0.016, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); stage.add(dust);
    const figs = [person(1), person(2)]; for (const f of figs) bath.add(f.root, f.key, f.rim);
    return { figs, refls, fogMat, innerG, bath, stage, doors, overlays, fog, fogTex, glass, glassTex, cookie, cookieTex, title, titleTex, titleMesh, titleGlow, titleLight, tube, tubeLight, tubeFill, warmShade, warmLight, warmGlow, shards, shardRoot, spot, beam, dust, dustBase, motes, moteBase, rim };
  }, [scene, gl]);

  const cam = camera as THREE.PerspectiveCamera;
  const inStage = t >= STAGE;
  S.bath.visible = !inStage; S.stage.visible = inStage;
  scene.fog = inStage ? new THREE.FogExp2('#070606', 0.045) : new THREE.FogExp2('#0b1115', 0.06);
  let p: number[];
  if (!inStage) {
    /* --- doors: drift open, hold, slam at the crack */
    const open = 0.5 * eio(ramp(t, SPLIT, 3.4));
    const slamK = ramp(t, SLAM - 0.3, 0.3); const bounce = t > SLAM ? 0.03 * Math.exp(-(t - SLAM) * 9) * Math.abs(Math.sin((t - SLAM) * 30)) : 0;
    const a = t < SLAM - 0.3 ? open : t < SLAM ? open * (1 - slamK * slamK) : bounce;
    S.doors[0].rotation.y = -a; S.doors[1].rotation.y = a;
    /* --- fog, cracks, rain */
    drawFog(S.fog, t); S.fogTex.needsUpdate = true;
    drawGlass(S.glass, 512, 512, t); S.glassTex.needsUpdate = true; drawCookie(S.cookie, 256, t); S.cookieTex.needsUpdate = true;
    /* --- lights: the tube hums and flickers; the warm lamp comes on at the hit; everything dies when the mirror bursts */
    const flick = (t > 2.3 && t < 2.5 && Math.sin(t * 90) > 0.2) || (t > 10.1 && t < 10.18) ? 0.35 : 1;
    const burst = t >= TITLE; const pop = burst ? Math.max(0, 1 - (t - TITLE) / 0.1) : 0;
    const tubeK = burst ? pop * 2.5 : flick * (t > SLAM && t < SLAM + 0.08 ? 1.8 : 1);
    S.tube.emissiveIntensity = 2.2 * tubeK; S.tubeLight.intensity = 9 * tubeK; S.tubeFill.intensity = 1.2 * tubeK;
    const warm = burst ? 0 : ramp(t, WARM, 0.08) * (1 - 0.3 * Math.max(0, Math.sin((t - WARM) * 40)) * Math.exp(-(t - WARM) * 8));
    S.warmShade.emissiveIntensity = 1.6 * warm; S.warmLight.intensity = 5.5 * warm; (S.warmGlow.material as THREE.SpriteMaterial).opacity = 0.5 * warm;
    /* --- shards */
    S.overlays.forEach((o) => { o.visible = !burst; }); S.doors.forEach((d) => { d.visible = !burst; }); S.innerG.visible = !burst;
    S.shardRoot.visible = burst;
    if (burst) { const s = t - TITLE; const f = 0.12 * (1 - Math.exp(-s / 0.04)) + 0.16 * s; const spin = 0.5 * (1 - Math.exp(-s / 0.06)) + 0.3 * s;
      for (const sh of S.shards) { sh.g.position.copy(sh.base).addScaledVector(sh.v, f); sh.g.position.y -= 0.06 * s * s; sh.g.quaternion.setFromAxisAngle(sh.axis, sh.w * spin); } }
    /* --- title */
    drawTitle(S.title, t); S.titleTex.needsUpdate = true; S.titleMesh.visible = burst;
    const tl = burst ? ramp(t, TITLE, 0.3) * (0.6 + 0.6 * ramp(t, POUR, 0.6)) : 0;
    S.titleLight.intensity = 2.5 * tl; (S.titleGlow.material as THREE.SpriteMaterial).opacity = 0.1 * tl * ramp(t, POUR, 0.8);
    /* --- motes */
    const mp = S.motes.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < mp.count; i++) { const b = i * 3; mp.setXYZ(i, S.moteBase[b] + Math.sin(t * 0.2 + i) * 0.05, S.moteBase[b + 1] + ((t * 0.02 + i * 0.137) % 0.3) - 0.15, S.moteBase[b + 2] + Math.cos(t * 0.15 + i * 1.7) * 0.05); }
    mp.needsUpdate = true;
    /* --- camera: slow push; a jolt at the slam; a recoil at the burst, then through the title */
    if (t < TITLE) p = herm(BATH_KEYS, t);
    else { const s = t - TITLE; const back = 0.42 * eo(ramp(s, 0, 0.35)) - 0.12 * eio(ramp(s, 0.35, 3.0)); const thru = Math.pow(ramp(t, 19.95, 0.7), 2.4) * 1.25;
      p = [0, 1.55, 1.0 + back - thru, 0, 1.55, 0, 34 - 3 * eio(ramp(s, 0.35, 3.2))]; }
    const shake = (t > SLAM ? 0.012 * Math.exp(-(t - SLAM) * 6) : 0) + (t > TITLE ? 0.02 * Math.exp(-(t - TITLE) * 5) : 0);
    p[0] += Math.sin(t * 0.7) * 0.004 + Math.sin(t * 1.9 + 1) * 0.002 + shake * Math.sin(t * 61); p[1] += Math.sin(t * 0.9 + 2) * 0.003 + shake * Math.cos(t * 53);
  } else {
    const k = ramp(t, STAGE, 0.05) * (1 - 0.35 * Math.max(0, Math.sin((t - STAGE) * 37)) * Math.exp(-(t - STAGE) * 6));
    S.spot.intensity = 700 * k; S.beam.uniforms.uI.value = k; S.rim.intensity = 0.5 * ramp(t, STAGE + 0.4, 1.5);
    (S.dust.material as THREE.PointsMaterial).opacity = 0.75 * k;
    const dp = S.dust.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < dp.count; i++) { const b = i * 3; dp.setXYZ(i, S.dustBase[b] + Math.sin(t * 0.3 + i) * 0.04, S.dustBase[b + 1] + Math.sin(t * 0.2 + i * 0.7) * 0.08 + t * 0.01, S.dustBase[b + 2] + Math.cos(t * 0.25 + i * 1.3) * 0.04); }
    dp.needsUpdate = true;
    p = herm(STAGE_KEYS, t);
    p[0] += Math.sin(t * 0.6) * 0.006; p[1] += Math.sin(t * 0.8 + 1) * 0.004;
  }
  cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = 0.03; cam.far = 60; cam.updateProjectionMatrix();

  /* the two people in the mirror: wherever each door's glass looks, put someone there (reflected into the room, seen only by that door) */
  if (!inStage && t < TITLE) {
    S.bath.updateMatrixWorld(true); const doorA = S.doors[0].rotation.y; const k = clamp(Math.abs(doorA) / 0.5);
    const M0 = new THREE.Vector3(0, 1.55, 0.134); const vC = M0.clone().add(M0.clone().sub(cam.position).setY(0).normalize().multiplyScalar(1.3));
    const breathe = Math.sin((t / 4.2) * Math.PI * 2);
    S.figs.forEach((F, i) => {
      const R = S.refls[i]; const C = new THREE.Vector3().setFromMatrixPosition(R.matrixWorld); const n = new THREE.Vector3(0, 0, 1).transformDirection(R.matrixWorld);
      const vO = C.clone().add(C.clone().sub(cam.position).setY(0).normalize().multiplyScalar(0.85)); const V = vC.clone().lerp(vO, k); V.y = 0;
      const X = V.clone().sub(n.clone().multiplyScalar(2 * V.clone().sub(C).dot(n)));
      const fv = cam.position.clone().sub(V).setY(0).normalize(); const f = fv.clone().sub(n.clone().multiplyScalar(2 * fv.dot(n)));
      F.root.position.copy(X); F.root.rotation.y = Math.atan2(f.x, f.z);
      F.torso.scale.y = 1 + 0.006 * breathe; F.torso.position.y = 1.0 + 0.002 * breathe;
      const tilt = (i === 0 ? 1 : -1) * 0.07 * eio(ramp(t, WARM + 0.4, 2.2)) * (t < SLAM ? 1 : Math.max(0, 1 - (t - SLAM) * 3));
      F.head.rotation.set(0.04 + Math.sin(t * 0.37 + i) * 0.01, (i === 0 ? 1 : -1) * 0.05 * eio(ramp(t, WARM + 0.4, 2.2)) * (t < SLAM ? 1 : 0), tilt);
      const side = new THREE.Vector3(f.z, 0, -f.x); const warmK = i === 0 ? ramp(t, WARM, 0.08) * (t < SLAM ? 1 : 0) : 0;
      F.key.position.copy(X).addScaledVector(f, 0.75).addScaledVector(side, i === 0 ? -0.6 : 0.6).setY(1.85);
      F.key.color.set('#a8bccc').lerp(new THREE.Color('#ffae62'), warmK); F.key.intensity = 0.6 + 3 * warmK + (i === 1 && t > WARM && t < SLAM ? 0.8 : 0);
      F.rim.position.copy(X).addScaledVector(f, -0.35).addScaledVector(side, i === 0 ? 0.45 : -0.45).setY(1.95); F.rim.color.set(i === 0 && warmK > 0 ? '#ffc58a' : '#8fb0d0'); F.rim.intensity = 14;
    });
    S.fogMat.opacity = 1 - 0.3 * eio(ramp(t, SPLIT, 4));
  }
  /* glints: each shard flashes when it turns its face between the camera and a light (the title, the window) */
  if (!inStage && t >= TITLE) { S.shardRoot.updateMatrixWorld(true); const wp = new THREE.Vector3(), n = new THREE.Vector3(), v = new THREE.Vector3(), r = new THREE.Vector3(), l = new THREE.Vector3();
    const TL = new THREE.Vector3(0, 1.55, 0.16), WIN = new THREE.Vector3(0.8, 0.45, 0.4).normalize(); const tk = ramp(t, TITLE, 0.3) * (0.5 + 0.5 * ramp(t, POUR, 0.6));
    for (const sh of S.shards) { sh.g.getWorldPosition(wp); n.set(0, 0, 1).applyQuaternion(sh.g.quaternion); v.copy(cam.position).sub(wp).normalize(); if (n.dot(v) < 0) n.negate();
      r.copy(v).negate().reflect(n); const g1 = Math.pow(Math.max(0, r.dot(l.copy(TL).sub(wp).normalize())), 30) * tk, g2 = Math.pow(Math.max(0, r.dot(WIN)), 30);
      const m = (sh.g.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial; m.emissive.setRGB(1.0 * g1 * 4 + 0.6 * g2 * 2.5, 0.75 * g1 * 4 + 0.8 * g2 * 2.5, 0.4 * g1 * 4 + 1.0 * g2 * 2.5); } }
  return null;
};

/* ------------------------------------------------------------------ 2D on top: letterbox, subtitles, tagline, mark, grain, fades */
const BAR = 100;
const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H);
    vignette(g, 0.55); grain(g, 11 + Math.floor(t * 30), 0.05);
    /* fades: in from black, a flash on the slam, white-gold flash on the burst, black as we go through the title */
    const blk = Math.max(1 - ramp(t, 0, 0.6), t < STAGE ? ramp(t, 20.3, 0.33) : 0, ramp(t, CINE_LEN_S - 0.6, 0.6));
    if (blk > 0) { g.fillStyle = `rgba(0,0,0,${blk})`; g.fillRect(0, 0, W, H); }
    if (t > SLAM && t < SLAM + 0.15) { g.fillStyle = `rgba(220,235,255,${0.28 * (1 - ramp(t, SLAM, 0.15))})`; g.fillRect(0, 0, W, H); }
    if (t > TITLE && t < TITLE + 0.25) { g.fillStyle = `rgba(255,236,200,${0.55 * (1 - ramp(t, TITLE, 0.25))})`; g.fillRect(0, 0, W, H); }
    const ta = ramp(t, TITLE + 1.6, 0.5) * (1 - ramp(t, 19.85, 0.3));
    txt(g, '精神分裂，到底分裂了什么？', 960, 740, 42, INK, { w: 700, alpha: ta }); txt(g, '— VIBE知识大赏 —', 960, 800, 24, 'rgba(243,237,226,.55)', { w: 500, alpha: ta });
    g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR); g.fillRect(0, H - BAR, W, BAR);
    mark(g, t >= TITLE && t < STAGE + 0.5 ? 0 : 0.9 * ramp(t, 0.6, 0.5));
    const L = LINES.find(([a, b]) => t >= a && t < b); if (L) subtitle(g, L[2], ramp(t, L[0], 0.12) * (1 - ramp(t, L[1] - 0.1, 0.1)));
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};

export const Cine: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + LINES.map((l) => l[2]).join('') + TCH.join('') + '精分神裂到底了什么？SCHIZOPHRENIABLEULERMCMVI·—';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `900 300px ${SANS}`, `700 176px ${SERIF}`, `600 40px ${SERIF}`, `700 42px ${SANS}`, `500 22px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.03, far: 60 }}>
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: t < STAGE ? 'linear-gradient(180deg, rgba(40,70,85,.32), rgba(18,38,52,.32))' : 'linear-gradient(180deg, rgba(60,40,20,.22), rgba(20,14,10,.3))', mixBlendMode: 'soft-light' }} />
      <Overlay t={t} />
    </AbsoluteFill>
  );
};

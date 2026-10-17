/* 《第n维长什么样》 key scenes (style frames for approval). One frame per key scene; everything is drawn in code:
   hypercubes are real n-dimensional vertices, rotated in planes and projected down one dimension at a time. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
type V = number[];
const W = 1920, H = 1080;
export const CYAN = '170,215,255', AMBER = '255,190,110', GOLD = '255,214,140', ROSE = '255,120,110';

/* ------------------------------------------------------------ randomness, background */
export let seed = 1; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const space = (g: G, warmth = 0) => {
  const gr = g.createRadialGradient(W * 0.5, H * 0.46, 60, W * 0.5, H * 0.5, 1250);
  gr.addColorStop(0, warmth ? '#1b1a2c' : '#121a33'); gr.addColorStop(0.55, '#0a1024'); gr.addColorStop(1, '#04060e');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  seed = 7; for (let i = 0; i < 420; i++) { const x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.3, a = rnd() * 0.5 + 0.1; g.fillStyle = `rgba(200,220,255,${a * 0.6})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  seed = 11; for (let i = 0; i < 9; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 260; const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(90,120,220,${0.05 + rnd() * 0.05})`); b.addColorStop(1, 'rgba(90,120,220,0)'); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
export const vignette = (g: G) => { const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H); };
export const glowDot = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };

/* ------------------------------------------------------------ 3D camera and n-dimensional geometry */
export type Cam = { yaw: number; pitch: number; dist: number; f: number; cx: number; cy: number; tx?: number; ty?: number; tz?: number };
export const p3 = (c: Cam, [x, y, z]: V): [number, number, number] => {
  x -= c.tx ?? 0; y -= c.ty ?? 0; z -= c.tz ?? 0;
  const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw); [x, z] = [x * cy - z * sy, x * sy + z * cy];
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch); [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const d = c.dist + z, k = c.f / d; return [c.cx + x * k, c.cy - y * k, d];
};
export const cube = (n: number) => { const vs: V[] = []; for (let i = 0; i < 1 << n; i++) vs.push(Array.from({ length: n }, (_, k) => (i >> k) & 1 ? 1 : -1)); const es: [number, number, number][] = []; for (let i = 0; i < vs.length; i++) for (let k = 0; k < n; k++) { const j = i ^ (1 << k); if (j > i) es.push([i, j, k]); } return { vs, es }; };
export const rot = (v: V, i: number, j: number, a: number) => { const o = v.slice(), c = Math.cos(a), s = Math.sin(a); o[i] = v[i] * c - v[j] * s; o[j] = v[i] * s + v[j] * c; return o; };
/** n-dimensional → 3D by perspective, one dimension at a time (the 4th, then the 5th…) */
export const down3 = (v: V, D = 3.2): V => { let u = v.slice(); while (u.length > 3) { const w = u.pop()!, k = D / (D - w); u = u.map((x) => x * k); } return u; };

/* ------------------------------------------------------------ glowing strokes */
export const glowSeg = (g: G, segs: [number, number, number, number][], col: string, w: number, a: number) => {
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (const [lw, la] of [[w * 7, 0.05], [w * 2.8, 0.16], [w, 0.95]] as const) {
    g.strokeStyle = `rgba(${col},${a * la})`; g.lineWidth = lw; g.beginPath();
    for (const [x1, y1, x2, y2] of segs) { g.moveTo(x1, y1); g.lineTo(x2, y2); }
    g.stroke();
  }
  g.restore();
};
export const glowPath = (g: G, pts: [number, number][], col: string, w: number, a: number, close = false) => {
  const s: [number, number, number, number][] = []; for (let i = 1; i < pts.length; i++) s.push([pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]]); if (close) s.push([pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1]]);
  glowSeg(g, s, col, w, a);
};
export const floor = (g: G, c: Cam, y = -1.6, size = 9, a = 0.22) => {
  const segs: [number, number, number, number][] = [];
  for (let i = -size; i <= size; i++) { const A = p3(c, [i, y, -size]), B = p3(c, [i, y, size]); segs.push([A[0], A[1], B[0], B[1]]); const C = p3(c, [-size, y, i]), D = p3(c, [size, y, i]); segs.push([C[0], C[1], D[0], D[1]]); }
  g.save(); g.globalAlpha = 1; glowSeg(g, segs, '90,130,220', 1.2, a); g.restore();
  const m = g.createLinearGradient(0, c.cy - 40, 0, H); m.addColorStop(0, 'rgba(6,9,20,.0)'); m.addColorStop(1, 'rgba(6,9,20,0)'); g.fillStyle = m;
};

/* ------------------------------------------------------------ the ant: small, warm, round, side view, facing right */
export const ant = (g: G, x: number, y: number, s: number, glow = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  glowDot(g, 0, -30, 120, AMBER, 0.28 * glow);
  g.lineCap = 'round'; g.strokeStyle = '#3a2412'; g.lineWidth = 5;
  for (const [x0, a] of [[-22, -0.5], [-2, 0], [18, 0.5]] as const) { g.beginPath(); g.moveTo(x0, -26); g.quadraticCurveTo(x0 + 14 * Math.sin(a) - 6, -6, x0 + 12 * a - 10, 2); g.stroke(); g.beginPath(); g.moveTo(x0 + 4, -26); g.quadraticCurveTo(x0 + 16, -8, x0 + 14 + 10 * a, 2); g.stroke(); }
  const body = (cx: number, cy: number, rx: number, ry: number) => { const gr = g.createRadialGradient(cx - rx * 0.3, cy - ry * 0.4, 1, cx, cy, rx * 1.2); gr.addColorStop(0, '#ffcf8a'); gr.addColorStop(0.55, '#e48a3a'); gr.addColorStop(1, '#9a4a1c'); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill(); };
  body(-34, -34, 24, 18); body(-4, -32, 12, 10); body(26, -40, 17, 16);
  g.fillStyle = '#2a1508'; g.beginPath(); g.arc(32, -44, 4.2, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(33.5, -45.5, 1.5, 0, 7); g.fill();
  g.strokeStyle = '#3a2412'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(30, -54); g.quadraticCurveTo(36, -76, 50, -78); g.stroke(); g.beginPath(); g.moveTo(24, -55); g.quadraticCurveTo(24, -78, 36, -84); g.stroke();
  g.restore();
};

/* ------------------------------------------------------------ text */
const sub = (g: G, s: string, hl?: [string, string]) => {
  g.save(); g.font = '900 74px "Noto Sans CJK SC"'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const parts = hl ? s.split(hl[0]) : [s], total = g.measureText(s).width + (s.length - 1) * 3, x0 = W / 2 - total / 2, y = H - 64;
  let x = x0; const put = (t: string, col: string) => { for (const ch of t) { g.lineJoin = 'round'; g.strokeStyle = '#000'; g.lineWidth = 10; g.strokeText(ch, x, y); g.fillStyle = col; g.fillText(ch, x, y); x += g.measureText(ch).width + 3; } };
  parts.forEach((p, i) => { put(p, '#fbf7ee'); if (hl && i < parts.length - 1) put(hl[0], hl[1]); });
  g.restore();
};
export const label = (g: G, s: string, x: number, y: number, size = 34, col = '220,232,255', a = 0.9, align: CanvasTextAlign = 'left', weight = 700) => { g.save(); g.font = `${weight} ${size}px "Noto Sans CJK SC"`; g.textAlign = align; g.fillStyle = `rgba(${col},${a})`; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 12; g.fillText(s, x, y); g.restore(); };
const tag = (g: G, s: string) => label(g, s, 56, 84, 26, '200,215,255', 0.55, 'left', 500);
const mark = (g: G) => label(g, `◆ ${JUNO.mark}`, W - 56, 64, 22, '243,237,226', 0.45, 'right', 500);

/* ------------------------------------------------------------ the key scenes */
const tesseractSegs = (c: Cam, aXW: number, aYW: number, aZW = 0, scale = 1.3) => {
  const { vs, es } = cube(4);
  const P = vs.map((v) => { let u = rot(v, 0, 3, aXW); u = rot(u, 1, 3, aYW); u = rot(u, 2, 3, aZW); u = rot(u, 0, 2, 0.5); return p3(c, down3(u).map((q) => q * scale)); });
  return { P, es };
};
export const drawTesseract = (g: G, c: Cam, aXW: number, aYW: number, aZW = 0, scale = 1.3, a = 1) => {
  const { P, es } = tesseractSegs(c, aXW, aYW, aZW, scale);
  const base = es.filter((e) => e[2] < 3).map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]] as [number, number, number, number]);
  const w4 = es.filter((e) => e[2] === 3).map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]] as [number, number, number, number]);
  glowSeg(g, base, CYAN, 3.2, a); glowSeg(g, w4, AMBER, 3.4, a);
  P.forEach(([x, y]) => glowDot(g, x, y, 16, LIGHT, 0.9 * a));
};
export const LIGHT = '235,245,255';

export const KEYS: { t: string; draw: (g: G) => void }[] = [
  // 1 · hook, 0:04 — the line drags sideways into a plane; the ant stands where the line was
  { t: '0:04', draw: (g) => {
    space(g);
    const c: Cam = { yaw: -0.3, pitch: 0.7, dist: 10.5, f: 1350, cx: 960, cy: 430 };
    // the plane being swept out of the line, a grid of light; its leading edge is the moving line
    const segs: [number, number, number, number][] = [];
    for (let i = 0; i <= 12; i++) { const z = -1.5 + i * 0.25 * (1 + 0 * i); const A = p3(c, [-5, -1, z]), B = p3(c, [5, -1, z]); segs.push([A[0], A[1], B[0], B[1]]); }
    for (let i = 0; i <= 20; i++) { const x = -5 + i * 0.5; const A = p3(c, [x, -1, -1.5]), B = p3(c, [x, -1, 1.5]); segs.push([A[0], A[1], B[0], B[1]]); }
    const q = [p3(c, [-5, -1, -1.5]), p3(c, [5, -1, -1.5]), p3(c, [5, -1, 1.5]), p3(c, [-5, -1, 1.5])];
    g.save(); g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    const fill = g.createLinearGradient(q[0][0], q[0][1], q[3][0], q[3][1]); fill.addColorStop(0, 'rgba(120,170,255,.05)'); fill.addColorStop(1, 'rgba(120,170,255,.16)'); g.fillStyle = fill; g.fill(); g.restore();
    glowSeg(g, segs, '120,160,240', 1.3, 0.35);
    // motion streaks: the drag
    for (let i = 0; i < 26; i++) { const x = -5 + i * 0.4; const A = p3(c, [x, -1, 0.6]), B = p3(c, [x, -1, 1.5]); glowSeg(g, [[A[0], A[1], B[0], B[1]]], CYAN, 1.6, 0.25 + 0.2 * (i % 2)); }
    const L0 = p3(c, [-5, -1, -1.5]), L1 = p3(c, [5, -1, -1.5]); glowSeg(g, [[L0[0], L0[1], L1[0], L1[1]]], LIGHT, 4, 0.7);
    const E0 = p3(c, [-5, -1, 1.5]), E1 = p3(c, [5, -1, 1.5]); glowSeg(g, [[E0[0], E0[1], E1[0], E1[1]]], LIGHT, 6, 1);
    const a = p3(c, [-0.6, -1, -1.5]); ant(g, a[0], a[1], 1.6);
    label(g, '一维', L1[0] + 20, L1[1] + 10, 34, CYAN, 0.7); label(g, '二维', E1[0] + 24, E1[1] + 12, 40, LIGHT, 0.95);
    vignette(g); tag(g, '开场 · 一到三维快速过场'); sub(g, '把线往旁边一拖，成了面：二维');
  } },
  // 2 · title, 0:16 — the cube begins its drag into the fourth direction; the title lands on the hit
  { t: '0:16', draw: (g) => {
    space(g);
    const c: Cam = { yaw: 0.55, pitch: 0.35, dist: 10.5, f: 1300, cx: 960, cy: 720 };
    const { vs, es } = cube(3), P = vs.map((v) => p3(c, v.map((q) => q * 1.15)));
    glowSeg(g, es.map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]]), CYAN, 3.4, 1);
    // a ghost of the cube, pulled "out" along the new direction, with streaks
    const Q = vs.map((v) => p3(c, down3([...v, 0.9]).map((q) => q * 1.15)));
    glowSeg(g, es.map(([i, j]) => [Q[i][0], Q[i][1], Q[j][0], Q[j][1]]), AMBER, 2.4, 0.55);
    glowSeg(g, vs.map((_, i) => [P[i][0], P[i][1], Q[i][0], Q[i][1]]), AMBER, 2.2, 0.75);
    P.forEach(([x, y]) => glowDot(g, x, y, 18, LIGHT, 0.9));
    glowDot(g, 960, 360, 560, GOLD, 0.16);
    g.save(); g.font = '900 150px "Noto Serif CJK SC"'; g.textAlign = 'center';
    const tg = g.createLinearGradient(0, 210, 0, 360); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32');
    g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 40; g.fillStyle = tg; g.fillText('《第n维长什么样》', 960, 330); g.restore();
    label(g, `— ${JUNO.series} —`, 960, 400, 30, GOLD, 0.9, 'center', 500);
    vignette(g); tag(g, '标题 · 第一个重拍 16.1 秒');
  } },
  // 3 · 4D, 0:28 — the tesseract's shadow, turning in the fourth dimension; the ant for scale
  { t: '0:28', draw: (g) => {
    space(g);
    const c: Cam = { yaw: 0.3, pitch: 0.28, dist: 10, f: 1500, cx: 960, cy: 470 };
    floor(g, c, -2.6, 10, 0.16);
    drawTesseract(g, c, 0.62, 0.35, 0.2, 1.15);
    const a = p3(c, [-3.2, -2.6, 1.6]); ant(g, a[0], a[1], 0.9);
    label(g, '橙色：第四个方向的棱', 1460, 260, 28, AMBER, 0.85); label(g, '它在四维里转身，影子像在翻里朝外', 1460, 300, 26, CYAN, 0.7, 'left', 500);
    vignette(g); tag(g, '四维 · 超立方体在三维里的影子（示意）'); mark(g); sub(g, '它没在变形，是在四维里转身');
  } },
  // 4 · a 4D being passes through our world, 0:37 — we only see a ball appear, grow and vanish
  { t: '0:37', draw: (g) => {
    space(g);
    const c: Cam = { yaw: -0.5, pitch: 0.32, dist: 11, f: 1500, cx: 960, cy: 500 };
    floor(g, c, -2, 9, 0.2);
    // the room's walls: our three dimensions
    const wall: [number, number, number, number][] = []; for (let i = -4; i <= 4; i++) { const A = p3(c, [i, -2, -4]), B = p3(c, [i, 3.5, -4]); wall.push([A[0], A[1], B[0], B[1]]); } for (let j = 0; j <= 5; j++) { const y = -2 + j * 1.1; const A = p3(c, [-4, y, -4]), B = p3(c, [4, y, -4]); wall.push([A[0], A[1], B[0], B[1]]); }
    glowSeg(g, wall, '90,130,220', 1.2, 0.18);
    // the slices, left to right through time: appear, grow, shrink, vanish
    const rs = [0.15, 0.7, 1.15, 1.35, 1.15, 0.7, 0.15];
    rs.forEach((r, i) => {
      const x = -3.6 + i * 1.2, [sx, sy, d] = p3(c, [x, 0.4, 0]), R = r * c.f / d, main = i === 3;
      const b = g.createRadialGradient(sx - R * 0.35, sy - R * 0.4, R * 0.1, sx, sy, R); b.addColorStop(0, `rgba(255,236,200,${main ? 0.95 : 0.25})`); b.addColorStop(0.6, `rgba(255,170,90,${main ? 0.65 : 0.15})`); b.addColorStop(1, `rgba(160,80,200,${main ? 0.35 : 0.08})`);
      g.fillStyle = b; g.beginPath(); g.arc(sx, sy, R, 0, 7); g.fill(); if (main) glowDot(g, sx, sy, R * 2.4, AMBER, 0.25);
      if (!main) { g.strokeStyle = 'rgba(255,200,140,.25)'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, R, 0, 7); g.stroke(); }
    });
    // the 4D path we can't point to: a dashed arc through the "w" direction
    g.save(); g.setLineDash([12, 14]); g.strokeStyle = 'rgba(200,160,255,.55)'; g.lineWidth = 3; const L = p3(c, [-4.2, 0.4, 0]), R0 = p3(c, [4.2, 0.4, 0]); g.beginPath(); g.moveTo(L[0], L[1] - 10); g.bezierCurveTo(L[0] + 300, L[1] - 420, R0[0] - 300, R0[1] - 420, R0[0], R0[1] - 10); g.stroke(); g.restore();
    label(g, '它在第四维里的路线', 960, 140, 30, '210,180,255', 0.8, 'center', 500);
    const a = p3(c, [-2.6, -2, 2.4]); ant(g, a[0], a[1], 0.85);
    vignette(g); tag(g, '间奏 · 四维生物路过我们的世界（示意）'); mark(g); sub(g, '我们只看到一个球：凭空出现，变大，消失');
  } },
  // 5 · 10D, 0:57 — the ten-dimensional cube drawn flat: 1024 points, 5120 edges, a mandala
  { t: '0:57', draw: (g) => {
    space(g, 1);
    const n = 10, { vs, es } = cube(n), R = 46;
    const dir = Array.from({ length: n }, (_, k) => [Math.cos(Math.PI * k / n), Math.sin(Math.PI * k / n)]);
    const P = vs.map((v) => { let x = 0, y = 0; v.forEach((s, k) => { x += s * dir[k][0]; y += s * dir[k][1]; }); return [960 + x * R, 500 + y * R]; });
    const hue = (k: number) => { const t = k / (n - 1); return `${Math.round(170 + 85 * t)},${Math.round(215 - 25 * t)},${Math.round(255 - 145 * t)}`; };
    for (let k = 0; k < n; k++) glowSeg(g, es.filter((e) => e[2] === k).map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]]), hue(k), 0.9, 0.22);
    P.forEach(([x, y]) => { g.fillStyle = 'rgba(255,240,215,.75)'; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); });
    glowDot(g, 960, 500, 260, GOLD, 0.18);
    label(g, 'n = 10', 120, 330, 92, LIGHT, 0.95, 'left', 900); label(g, '顶点  1 024', 124, 410, 44, GOLD, 0.95); label(g, '棱      5 120', 124, 466, 44, CYAN, 0.85);
    label(g, '1 → 2 → 4 → 8 → 16 → 32 → 64 → … → 1024', 124, 540, 28, '200,215,255', 0.6, 'left', 500);
    vignette(g); tag(g, '渐强 · 十维立方体的平面投影'); mark(g); sub(g, '画出来，已经像一朵曼陀罗');
  } },
  // 6 · DROP, 1:08 — the volume of a ball peaks in five dimensions, then falls toward zero
  { t: '1:08', draw: (g) => {
    space(g);
    const Vn = [2, 3.14, 4.19, 4.93, 5.26, 5.17, 4.72, 4.06, 3.3, 2.55, 1.88, 1.34, 0.91, 0.6, 0.38, 0.24, 0.15, 0.09, 0.05, 0.03];
    const x0 = 300, bw = 62, base = 800, k = 100;
    g.strokeStyle = 'rgba(160,190,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 30, base); g.lineTo(x0 + Vn.length * (bw + 6), base); g.stroke();
    Vn.forEach((v, i) => {
      const x = x0 + i * (bw + 6), h = v * k, peak = i === 4;
      const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, peak ? 'rgba(255,214,140,.95)' : 'rgba(150,190,255,.75)'); gr.addColorStop(1, peak ? 'rgba(255,160,80,.35)' : 'rgba(90,120,220,.15)');
      g.fillStyle = gr; g.fillRect(x, base - h, bw, h);
      if (peak) glowDot(g, x + bw / 2, base - h, 220, GOLD, 0.35);
      label(g, String(i + 1), x + bw / 2, base + 42, 26, peak ? GOLD : '200,215,255', peak ? 1 : 0.6, 'center', 700);
    });
    // the curve through the tops
    const pts: [number, number][] = Vn.map((v, i) => [x0 + i * (bw + 6) + bw / 2, base - v * k]); glowPath(g, pts, LIGHT, 2.2, 0.8);
    label(g, '五维 5.26', x0 + 4 * (bw + 6) + bw / 2, base - 5.26 * k - 40, 40, GOLD, 1, 'center', 900);
    label(g, '→ 0', x0 + 19 * (bw + 6) + 70, base - 10, 40, CYAN, 0.8, 'left', 900);
    label(g, '半径为 1 的"球"的体积', 300, 170, 34, '200,215,255', 0.7, 'left', 500);
    label(g, '维度 →', x0 + Vn.length * (bw + 6) - 40, base + 92, 26, '200,215,255', 0.5, 'right', 500);
    vignette(g); tag(g, '爆点 · 高维有多反直觉'); mark(g); sub(g, '球的体积，在五维最大');
  } },
  // 7 · 1:21 — the ball in the middle of the box pokes out of it in ten dimensions
  { t: '1:21', draw: (g) => {
    space(g);
    const cx = 760, cy = 470, s = 170;
    glowPath(g, [[cx - 2 * s, cy - 2 * s], [cx + 2 * s, cy - 2 * s], [cx + 2 * s, cy + 2 * s], [cx - 2 * s, cy + 2 * s]], LIGHT, 3, 0.9, true);
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const pts: [number, number][] = Array.from({ length: 61 }, (_, i) => [cx + dx * s + s * Math.cos(i / 60 * 7), cy + dy * s + s * Math.sin(i / 60 * 7)]); glowPath(g, pts, CYAN, 2.4, 0.7); }
    // the middle ball at n = 2 (small, dashed) … and at n = 10 (radius √10 − 1 ≈ 2.16 > 2)
    const r2 = (Math.SQRT2 - 1) * s, r10 = (Math.sqrt(10) - 1) * s;
    g.save(); g.setLineDash([10, 10]); g.strokeStyle = 'rgba(255,214,140,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r2, 0, 7); g.stroke(); g.restore();
    const ring: [number, number][] = Array.from({ length: 121 }, (_, i) => [cx + r10 * Math.cos(i / 120 * Math.PI * 2), cy + r10 * Math.sin(i / 120 * Math.PI * 2)]); glowPath(g, ring, ROSE, 3.4, 0.95);
    for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) glowDot(g, cx + ax * 2 * s, cy + ay * 2 * s, 80, ROSE, 0.45);
    label(g, '二维时的中间球', cx, cy + 8, 26, GOLD, 0.8, 'center', 500);
    label(g, 'n = 10', 1250, 300, 92, LIGHT, 0.95, 'left', 900);
    label(g, '中间球半径  √10 − 1 ≈ 2.16', 1254, 380, 36, ROSE, 0.95); label(g, '盒子半宽  2', 1254, 432, 36, '200,215,255', 0.8);
    label(g, '角落 2¹⁰ = 1024 个球', 1254, 484, 32, CYAN, 0.75, 'left', 500);
    vignette(g); tag(g, '爆点 · 盒子里的球（示意：画的是二维切面）'); mark(g); sub(g, '到了十维，盒子中间的球会戳出盒子', ['戳出盒子', '#ff8a7a']);
  } },
  // 8 · AI, 1:41 — words as points in a space of thousands of dimensions (squashed to two)
  { t: '1:41', draw: (g) => {
    space(g);
    seed = 21; for (let i = 0; i < 900; i++) { const x = 80 + rnd() * 1760, y = 80 + rnd() * 760, r = rnd() * 2.4 + 0.6; g.fillStyle = `rgba(170,200,255,${0.15 + rnd() * 0.35})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    const groups: [string[], number, number, string][] = [[['猫', '狗', '老虎', '狮子', '兔子'], 520, 360, AMBER], [['苹果', '香蕉', '葡萄', '橙子'], 1360, 330, '150,230,170'], [['国王', '女王', '王子', '公主'], 1080, 650, '200,170,255'], [['开心', '快乐', '高兴'], 420, 700, '255,170,190']];
    groups.forEach(([ws, gx, gy, col], gi) => {
      glowDot(g, gx, gy, 230, col, 0.16);
      const pts = ws.map((_, i) => { const a = i / ws.length * Math.PI * 2 + gi; return [gx + Math.cos(a) * 150, gy + Math.sin(a) * 95]; });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) glowSeg(g, [[pts[i][0], pts[i][1], pts[j][0], pts[j][1]]], col, 1, 0.25);
      ws.forEach((w, i) => { glowDot(g, pts[i][0], pts[i][1], 26, col, 0.9); label(g, w, pts[i][0] + 18, pts[i][1] - 14, 36, col, 0.95, 'left', 700); });
    });
    label(g, '每个词 = 几千维空间里的一个点', 960, 150, 34, '200,215,255', 0.75, 'center', 500);
    vignette(g); tag(g, '现实里 · 词语空间（示意：几千维压成二维）'); mark(g); sub(g, '意思越近的词，在高维里离得越近');
  } },
  // 9 · coda, 1:52 — the camera has backed out: the ant's line, inside a plane, inside a cube, inside a tesseract's shadow
  { t: '1:52', draw: (g) => {
    space(g);
    const c: Cam = { yaw: 0.45, pitch: 0.3, dist: 12, f: 1500, cx: 960, cy: 520 };
    drawTesseract(g, c, 0.5, 0.25, 0.1, 1.9, 0.45);
    const { vs, es } = cube(3), P = vs.map((v) => p3(c, v.map((q) => q * 1.2)));
    glowSeg(g, es.map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]]), CYAN, 2.4, 0.75);
    const sq = [[-1.2, -1.2, 0], [1.2, -1.2, 0], [1.2, -1.2, 1.2], [-1.2, -1.2, 1.2]].map((v) => p3(c, v));
    g.save(); g.beginPath(); sq.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = 'rgba(140,180,255,.14)'; g.fill(); g.restore();
    const L0 = p3(c, [-1.2, -1.2, 0.6]), L1 = p3(c, [1.2, -1.2, 0.6]); glowSeg(g, [[L0[0], L0[1], L1[0], L1[1]]], LIGHT, 4.5, 1);
    const a = p3(c, [0.1, -1.2, 0.6]); ant(g, a[0], a[1], 0.55, 1.4);
    vignette(g); tag(g, '尾声 · 镜头退回蚂蚁：线在面里，面在立方体里，立方体在超立方体的影子里'); mark(g); sub(g, '我们看不见第四维');
  } },
];

export const Keys: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(['900 74px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '900 150px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, '第n维长什么样把线往旁边一拖成了面：二维').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); KEYS[f].draw(g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#04060e' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

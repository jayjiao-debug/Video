/* 《第n维长什么样》 — one continuous shot. Everything is drawn in code. Scenes hand over without cuts: the cube becomes the
   tesseract, the tesseract shrinks into the ball's sheet, the room dissolves into the n-cube flower, the camera dives into the
   flower on the drop, the kissing-ring points scatter into the word galaxy, the galaxy falls back into the nested shapes. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import RAW from './lines.json';
import { JUNO } from './brand/identity';
import { space, vignette, glowDot, p3, cube, rot, down3, glowSeg, glowPath, ant, label, CYAN, LIGHT, Cam, rnd } from './Keys';
import * as K from './Keys';

export const FILM_LEN = 123.79;
export const FILM_FRAMES = Math.round(FILM_LEN * 30);
const W = 1920, H = 1080;
type G = CanvasRenderingContext2D;
type Seg = [number, number, number, number];
const AMBER = '255,190,110', GOLD = '255,214,140', ROSE = '255,120,110', VIOLET = '200,170,255';
const HIT = 16.104, DROP = 65.09, CODA = 109.19, END = 117.4;

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const pr = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (t: number, a: number, d: number) => 1 - Math.pow(1 - pr(t, a, d), 3);
const eio = (t: number, a: number, d: number) => { const x = pr(t, a, d); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const win = (t: number, a: number, z: number, fi = 0.5, fo = 0.5) => Math.min(eo(t, a, fi), 1 - pr(t, z - fo, fo));
const LINES = (RAW as [number, number, string][]).map(([a, z, s], i, arr) => [a, Math.min((i + 1 < arr.length ? arr[i + 1][0] : END) - 0.12, z + 0.6), s] as [number, number, string]);

/** a scene drawn scaled about the centre and faded: used to fly through one scene into the next */
const layer = (g: G, o: number, s: number, f: () => void, cx = 960, cy = 520) => { if (o <= 0.003) return; g.save(); g.globalAlpha = o; g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); f(); g.restore(); };
const big = (g: G, s: string, x: number, y: number, size: number, col: string, a = 1, align: CanvasTextAlign = 'left', weight = 900, font = 'Noto Sans CJK SC') => { g.save(); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.fillStyle = `rgba(${col},${a})`; g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 18; g.fillText(s, x, y); g.restore(); };
const fmt = (n: number) => Math.round(n).toLocaleString('en-US').replace(/,/g, ' ');

/* ------------------------------------------------------------ S1 + S2: the line, the plane, the cube, the tesseract */
const camA = (T: number): Cam => {
  const tP = eio(T, 3.4, 1.6), tC = eio(T, 6.2, 1.8);
  return { yaw: lerp(-0.25, 0.5, eio(T, 0, 16)) + 0.5 * eio(T, 16, 17), pitch: 0.3 + 0.16 * eio(T, 3.0, 2.5) - 0.12 * eio(T, 6.4, 3) - 0.04 * eio(T, 20, 10),
    dist: lerp(6.2, 10.5, eio(T, 4.2, 5)) + 2.6 * eio(T, 15.0, 1.4), f: 1400, cx: 960, cy: 520 + 130 * win(T, 15.0, 20.2, 1.2, 1.2),
    tx: 0, ty: lerp(-1.5, 0, tC), tz: lerp(-1.5, lerp(0, 0, tC), tP) };
};
const HS = 1.5;
const sceneBuild = (g: G, T: number) => {
  const c = camA(T);
  const lineP = eo(T, 0.3, 1.1), zP = eio(T, 3.4, 1.4), yP = eio(T, 6.2, 1.4);
  // the pull toward the fourth direction: small tries at 9.5 / 11.5 / 13.5, then a long pull into the hit; after the title it extrudes fully
  const tryW = (t0: number, a: number) => a * Math.sin(Math.PI * pr(T, t0, 0.9));
  const wG = T < 15.0 ? Math.max(0, tryW(9.5, 0.12) + tryW(11.5, 0.18) + tryW(13.5, 0.26)) : T < 20.6 ? 0.45 * eo(T, 15.0, 1.1) : lerp(0.45, 1, eio(T, 20.6, 2.8));
  const aXW = T < 27.9 ? 0 : 0.85 * Math.pow(pr(T, 27.9, 1.4), 2) * 1.4 / 2 + 0.85 * Math.max(0, T - 29.3);
  const aYW = T < 28.5 ? 0 : 0.3 * Math.max(0, T - 28.5) * 0.6;
  const x0 = -HS, x1 = lerp(-HS, HS, lineP), z1 = lerp(-HS, HS, zP), y1 = lerp(-HS, HS, yP);
  // the point
  if (T < 1.6) { const P = p3(c, [-HS, -HS, -HS]); glowDot(g, P[0], P[1], 40, '235,245,255', 0.9 * (1 - pr(T, 1.2, 0.4)) * eo(T, 0, 0.3)); }
  // plane fill and grid while it is being swept
  if (zP > 0.001) {
    const q = [p3(c, [x0, -HS, -HS]), p3(c, [HS, -HS, -HS]), p3(c, [HS, -HS, z1]), p3(c, [x0, -HS, z1])];
    g.save(); g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = `rgba(120,170,255,${0.13 * (1 - 0.5 * yP)})`; g.fill(); g.restore();
    const segs: Seg[] = []; for (let i = 0; i <= 8; i++) { const x = -HS + i * 2 * HS / 8; const A = p3(c, [x, -HS, -HS]), B = p3(c, [x, -HS, z1]); segs.push([A[0], A[1], B[0], B[1]]); }
    for (let j = 0; j <= 8; j++) { const z = -HS + j * 2 * HS / 8; if (z > z1) break; const A = p3(c, [-HS, -HS, z]), B = p3(c, [HS, -HS, z]); segs.push([A[0], A[1], B[0], B[1]]); }
    glowSeg(g, segs, '120,160,240', 1.2, 0.3 * (1 - 0.6 * yP));
    const moving = 1 - Math.abs(2 * zP - 1); if (moving > 0.05) for (let i = 0; i < 14; i++) { const x = -HS + (i + 0.5) * 2 * HS / 14; const A = p3(c, [x, -HS, z1 - 0.9 * moving]), B = p3(c, [x, -HS, z1]); glowSeg(g, [[A[0], A[1], B[0], B[1]]], CYAN, 1.4, 0.5 * moving); }
  }
  // cube walls rising
  if (yP > 0.001) {
    const vs = [[-HS, -HS, -HS], [HS, -HS, -HS], [HS, -HS, HS], [-HS, -HS, HS]];
    const segs: Seg[] = vs.map((v) => { const A = p3(c, v), B = p3(c, [v[0], y1, v[2]]); return [A[0], A[1], B[0], B[1]]; });
    const top = vs.map((v) => p3(c, [v[0], y1, v[2]])); for (let i = 0; i < 4; i++) segs.push([top[i][0], top[i][1], top[(i + 1) % 4][0], top[(i + 1) % 4][1]]);
    const moving = 1 - Math.abs(2 * yP - 1); if (moving > 0.05) for (let i = 0; i < 4; i++) { const A = p3(c, [vs[i][0], y1 - 1.2 * moving, vs[i][2]]); glowSeg(g, [[A[0], A[1], top[i][0], top[i][1]]], CYAN, 3, 0.4 * moving); }
    glowSeg(g, segs, CYAN, 3.2, 1 - 0.0 * wG);
  }
  // the tesseract (ghost while it tries, solid once dragged out)
  if (wG > 0.002 || T > 15) {
    const { vs, es } = cube(4);
    const P = vs.map((v) => { const w = (v[3] > 0 ? 2 * wG : 0) - wG; let u = [v[0], v[1], v[2], w]; u = rot(u, 0, 3, aXW); u = rot(u, 1, 3, aYW); return p3(c, down3(u).map((q) => q * HS)); });
    const solid = clamp((wG - 0.3) / 0.7) * (T > 16 ? 1 : 0.5);
    const base: Seg[] = [], w4: Seg[] = [], ghost: Seg[] = [];
    es.forEach(([i, j, k]) => { const s: Seg = [P[i][0], P[i][1], P[j][0], P[j][1]]; if (k === 3) w4.push(s); else if (vs[i][3] > 0) ghost.push(s); else base.push(s); });
    glowSeg(g, ghost, T > 20.6 ? CYAN : AMBER, 2.6, 0.45 + 0.55 * solid); glowSeg(g, w4, AMBER, 2.8, 0.55 + 0.45 * solid);
    if (T > 15) glowSeg(g, base, CYAN, 3.2, 1);
    P.forEach(([x, y], i) => { if (T > 15 || vs[i][3] < 0) glowDot(g, x, y, 16, LIGHT, 0.85); });
  } else if (yP <= 0.001 || T < 8) {
    // only the line (and the cube edges drawn above)
  }
  // the line itself (always the brightest thing until the cube exists)
  { const A = p3(c, [x0, -HS, -HS]), B = p3(c, [x1, -HS, -HS]); glowSeg(g, [[A[0], A[1], B[0], B[1]]], LIGHT, 4.5, 1 - 0.5 * yP); }
  if (zP > 0.001 && yP < 1) { const A = p3(c, [-HS, -HS, z1]), B = p3(c, [HS, -HS, z1]); glowSeg(g, [[A[0], A[1], B[0], B[1]]], LIGHT, 5, 1 - yP); }
  // the ant: on the line, walking a little; stays on the cube's floor
  const ax = lerp(-1.0, 0.2, eio(T, 0.8, 2.6)), A = p3(c, [ax, -HS, -HS + 0.05]);
  ant(g, A[0], A[1], lerp(0.9, 0.55, eio(T, 6, 4)) * (1 - pr(T, 31.5, 1.2)), 1);
  // the four axes, the fourth one we can't point along
  const oAx = win(T, 19.7, 25.0, 0.6, 0.8);
  if (oAx > 0) {
    const O = p3(c, [-HS, -HS, -HS]);
    for (const v of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const B = p3(c, [-HS + v[0] * 1.2, -HS + v[1] * 1.2, -HS + v[2] * 1.2]); glowSeg(g, [[O[0], O[1], B[0], B[1]]], LIGHT, 4, oAx); }
    g.save(); g.globalAlpha = oAx; g.setLineDash([14, 12]); g.strokeStyle = `rgba(${AMBER},.95)`; g.lineWidth = 4; g.beginPath(); g.moveTo(O[0], O[1]); g.lineTo(O[0] - 150, O[1] + 120); g.stroke(); g.restore();
    big(g, '第四个方向：与三条都垂直', O[0] - 170, O[1] + 180, 36, AMBER, oAx, 'center', 900);
  }
  const oN = win(T, 22.6, 27.6, 0.5, 0.6);
  if (oN > 0) { big(g, '16 个顶点 · 32 条棱', 1560, 220, 38, LIGHT, oN, 'center', 900); big(g, '8 个立方体围成', 1560, 270, 30, AMBER, oN * 0.9, 'center', 700); }
};

/* ------------------------------------------------------------ S3: a 4D visitor in our world */
const ballAt = (g: G, x: number, y: number, R: number, a: number) => {
  if (R <= 0.5 || a <= 0) return;
  glowDot(g, x, y, R * 2.4, AMBER, 0.28 * a);
  const b = g.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R); b.addColorStop(0, `rgba(255,240,210,${0.98 * a})`); b.addColorStop(0.6, `rgba(255,170,90,${0.8 * a})`); b.addColorStop(1, `rgba(150,80,210,${0.55 * a})`);
  g.fillStyle = b; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
};
const antXray = (g: G, x: number, y: number, s: number, T: number, a: number) => {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  glowDot(g, 0, -30, 160, AMBER, 0.25);
  const outline = (cx: number, cy: number, rx: number, ry: number) => { g.strokeStyle = 'rgba(255,214,160,.9)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,170,90,.12)'; g.fill(); };
  outline(-34, -34, 24, 18); outline(-4, -32, 12, 10); outline(26, -40, 17, 16);
  const beat = 1 + 0.18 * Math.max(0, Math.sin(T * 7));
  g.fillStyle = 'rgba(255,90,90,.95)'; g.beginPath(); g.arc(-2, -33, 4.5 * beat, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,200,120,.95)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-50, -34); g.bezierCurveTo(-40, -48, -28, -20, -20, -34); g.bezierCurveTo(-14, -42, -8, -30, 6, -32); g.stroke();
  g.fillStyle = 'rgba(180,220,255,.9)'; g.beginPath(); g.arc(28, -44, 5, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,214,160,.7)'; g.lineWidth = 2; for (const x0 of [-22, -2, 18]) { g.beginPath(); g.moveTo(x0, -26); g.lineTo(x0 - 8, 2); g.stroke(); g.beginPath(); g.moveTo(x0 + 4, -26); g.lineTo(x0 + 14, 2); g.stroke(); }
  g.restore();
};
const sceneVisitor = (g: G, T: number) => {
  const c: Cam = { yaw: lerp(-0.55, -0.35, pr(T, 32.5, 16)), pitch: lerp(0.3, 0.24, pr(T, 32.5, 16)), dist: 11, f: 1500, cx: 960, cy: 500 };
  // our room: a floor and a back wall
  const oRoom = eo(T, 35.6, 1.0);
  if (oRoom > 0) {
    const segs: Seg[] = []; for (let i = -8; i <= 8; i++) { const A = p3(c, [i, -2, -8]), B = p3(c, [i, -2, 8]); segs.push([A[0], A[1], B[0], B[1]]); const C = p3(c, [-8, -2, i]), D = p3(c, [8, -2, i]); segs.push([C[0], C[1], D[0], D[1]]); }
    for (let i = -4; i <= 4; i++) { const A = p3(c, [i, -2, -4]), B = p3(c, [i, 3.5, -4]); segs.push([A[0], A[1], B[0], B[1]]); }
    glowSeg(g, segs, '90,130,220', 1.1, 0.2 * oRoom);
  }
  // the analogy first: a ball through a sheet of paper, its slice glowing on the sheet
  const oSheet = win(T, 32.6, 36.4, 0.6, 0.6);
  if (oSheet > 0) {
    const sq = [[-4, 0, -2.5], [4, 0, -2.5], [4, 0, 2.5], [-4, 0, 2.5]].map((v) => p3(c, v));
    g.save(); g.globalAlpha = oSheet; g.beginPath(); sq.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = 'rgba(200,215,255,.10)'; g.fill(); g.restore();
    glowPath(g, sq.map((p) => [p[0], p[1]] as [number, number]), '200,215,255', 1.6, 0.5 * oSheet, true);
    const by = lerp(2.4, -2.4, eio(T, 33.3, 2.8)), R = 1.2, [sx, sy, d] = p3(c, [0, by, 0]);
    ballAt(g, sx, sy, R * c.f / d, oSheet * 0.85);
    if (Math.abs(by) < R) { const r = Math.sqrt(R * R - by * by), ring = Array.from({ length: 61 }, (_, i) => { const a = i / 60 * Math.PI * 2; const P = p3(c, [r * Math.cos(a), 0, r * Math.sin(a)]); return [P[0], P[1]] as [number, number]; }); glowPath(g, ring, AMBER, 3.5, oSheet); }
    big(g, '纸上的生物，只看到这一圈', 960, 170, 30, AMBER, oSheet * eo(T, 34.0, 0.5), 'center', 700);
  }
  // then us: a ball appears out of nothing, grows, shrinks, vanishes
  const tb = (T - 37.9) / 1.35;
  if (Math.abs(tb) < 1) { const [sx, sy, d] = p3(c, [0.6, 0.4, 0]); ballAt(g, sx, sy, 1.35 * Math.sqrt(1 - tb * tb) * c.f / d, eo(T, 36.6, 0.2)); }
  const oPath = win(T, 36.4, 39.6, 0.5, 0.5);
  if (oPath > 0) { const L = p3(c, [-4.4, 0.4, 0]), R0 = p3(c, [5.4, 0.4, 0]); g.save(); g.globalAlpha = oPath; g.setLineDash([12, 14]); g.strokeStyle = `rgba(${VIOLET},.6)`; g.lineWidth = 3; g.beginPath(); g.moveTo(L[0], L[1]); g.bezierCurveTo(L[0] + 300, L[1] - 420, R0[0] - 300, R0[1] - 420, R0[0], R0[1]); g.stroke(); g.restore(); big(g, '它在第四维里的路线', 960, 150, 30, VIOLET, oPath * 0.85, 'center', 500); }
  // the ant watching; then seen from the fourth direction, inside and all
  const A = p3(c, [-2.6, -2, 2.4]);
  const xr = win(T, 39.5, 42.4, 0.5, 0.5), sA = lerp(0.85, 3.2, eio(T, 39.4, 0.8)) - lerp(0, 2.35, eio(T, 42.0, 0.6));
  if (T < 42.6) { const ax = lerp(A[0], 960, eio(T, 39.4, 0.8) * (1 - eio(T, 42.0, 0.6))), ay = lerp(A[1], 640, eio(T, 39.4, 0.8) * (1 - eio(T, 42.0, 0.6)));
    g.save(); g.globalAlpha *= eo(T, 36.3, 0.5); if (xr < 0.99) ant(g, ax, ay, sA, 1 - xr); g.restore(); if (xr > 0) antXray(g, ax, ay, sA, T, xr); }
  if (xr > 0) big(g, '从第四维看，里面一览无余', 960, 170, 30, AMBER, xr, 'center', 700);
  // a knot that comes undone
  const oK = win(T, 42.2, 44.9, 0.4, 0.5);
  if (oK > 0) {
    const k = eio(T, 43.1, 1.3), spin = T * 0.6;
    const pts: [number, number][] = []; let lift = 0;
    for (let i = 0; i <= 240; i++) { const t = i / 240 * Math.PI * 2; const kn = [Math.sin(t) + 2 * Math.sin(2 * t), Math.cos(t) - 2 * Math.cos(2 * t), -Math.sin(3 * t)], ci = [2.4 * Math.cos(t), 2.4 * Math.sin(t), 0]; let v = kn.map((q, j) => lerp(q, ci[j], k) * 0.75); v = rot(v, 0, 2, spin); const P = p3({ ...c, yaw: 0, pitch: 0.2 }, [v[0], v[1] + 0.6, v[2]]); pts.push([P[0], P[1]]); lift += Math.abs(Math.sin(3 * t)); }
    glowPath(g, pts, k > 0.02 && k < 0.98 ? AMBER : LIGHT, 4, oK);
    big(g, k < 0.5 ? '三叶结' : '散开了', 960, 170, 30, k > 0.02 && k < 0.98 ? AMBER : LIGHT, oK, 'center', 700);
  }
  // a left mitten turned over through one more dimension
  const oM = win(T, 44.8, 48.6, 0.4, 0.6);
  if (oM > 0) {
    const ang = Math.PI * eio(T, 45.4, 1.4);
    const shape: [number, number][] = [[-0.9, -1.6], [0.9, -1.6], [1.0, 0.4], [0.8, 1.3], [0.2, 1.6], [-0.4, 1.3], [-0.6, 0.6], [-1.3, 0.9], [-1.6, 0.5], [-1.0, -0.1]];
    const cm: Cam = { yaw: 0, pitch: 0.1, dist: 9, f: 1500, cx: 960, cy: 540 };
    const P = shape.map(([x, y]) => { const v = rot([x, y, 0], 0, 2, ang); const q = p3(cm, v); return [q[0], q[1]] as [number, number]; });
    g.save(); g.globalAlpha = oM; g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = `rgba(${ang < Math.PI / 2 ? '120,170,255' : AMBER},.18)`; g.fill(); g.restore();
    glowPath(g, P, ang < Math.PI / 2 ? CYAN : AMBER, 4, oM, true);
    big(g, ang < Math.PI / 2 ? '左手' : '右手', 960, 170, 44, ang < Math.PI / 2 ? CYAN : AMBER, oM, 'center', 900);
    big(g, '示意：二维的手套绕三维翻身，就成了镜像', 960, 900, 24, '200,215,255', oM * 0.6, 'center', 500);
  }
};

/* ------------------------------------------------------------ S4: the n-cube flower (drag after drag) */
const nState = (T: number) => {
  // [dimension, time it starts being dragged out, how long the drag takes]
  const steps: [number, number, number][] = [[5, 49.0, 1.2], [6, 51.6, 1.0], [7, 54.2, 0.45], [8, 54.75, 0.45], [9, 55.3, 0.45], [10, 55.85, 0.5]];
  let n = 4, e = 1;
  for (const [d, t0, dur] of steps) if (T >= t0) { n = d; e = eio(T, t0, dur); }
  return { n, e };
};
const sceneFlower = (g: G, T: number) => {
  const { n, e } = nState(T);
  const nPrev = e < 1 ? n - 1 : n, nEff = lerp(nPrev, n, e);
  const { vs, es } = cube(n);
  const spin = 0.12 * Math.max(0, T - 56.5) + 0.5 * Math.pow(Math.max(0, T - 59.6), 2) / 2;
  const ang = (k: number) => Math.PI * k / nEff + spin;
  const R = 470 / nEff;
  const cx = 1100, cy = 500;
  const P = vs.map((v) => { let x = 0, y = 0; v.forEach((s, k) => { const m = k === n - 1 ? e : 1; x += s * m * Math.cos(ang(k)); y += s * m * Math.sin(ang(k)); }); return [cx + x * R, cy + y * R]; });
  const hue = (k: number) => { const t = k / 9; return `${Math.round(170 + 85 * t)},${Math.round(215 - 25 * t)},${Math.round(255 - 145 * t)}`; };
  const a = n >= 9 ? 0.25 : n >= 7 ? 0.38 : 0.6, w = n >= 9 ? 0.9 : n >= 7 ? 1.3 : 2.2;
  for (let k = 0; k < n; k++) glowSeg(g, es.filter((q) => q[2] === k).map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]] as Seg), k === n - 1 && e < 1 ? AMBER : hue(k), w, a + (k === n - 1 && e < 1 ? 0.3 : 0));
  const dot = n >= 9 ? 1.6 : n >= 7 ? 2.4 : 4;
  P.forEach(([x, y]) => { g.fillStyle = 'rgba(255,240,215,.8)'; g.beginPath(); g.arc(x, y, dot, 0, 7); g.fill(); });
  glowDot(g, cx, cy, 300, GOLD, 0.1 + 0.25 * eo(T, 59.6, 3));
  // the count, rolling with each drag
  const verts = Math.pow(2, n - 1) * (1 + e), edges = (n - 1) * Math.pow(2, n - 2) * (1 + e) + Math.pow(2, n - 1) * e;
  const oC = 1 - pr(T, 62.0, 1.0);
  big(g, `n = ${n}`, 110, 340, 96, LIGHT, oC, 'left', 900);
  big(g, `顶点  ${fmt(verts)}`, 116, 420, 46, GOLD, oC, 'left', 700); big(g, `棱  ${fmt(edges)}`, 116, 478, 40, CYAN, 0.85 * oC, 'left', 700);
};

/* ------------------------------------------------------------ S5: what n dimensions do to things we know */
const FACT = (T: number, a: number, z: number) => win(T, a, z, 0.45, 0.45);
const sceneFacts = (g: G, T: number) => {
  // a · the formula
  let o = FACT(T, 65.1, 67.6);
  if (o > 0) { big(g, 'n 维球的体积', 960, 400, 36, '200,215,255', o * 0.8, 'center', 500); big(g, 'V(n) = π^(n/2) ÷ Γ(n/2 + 1)', 960, 540, 84, GOLD, o, 'center', 900, 'Noto Serif CJK SC'); }
  // b · the volume peaks at five
  o = FACT(T, 67.3, 73.1);
  if (o > 0) {
    const Vn = [2, 3.14, 4.19, 4.93, 5.26, 5.17, 4.72, 4.06, 3.3, 2.55, 1.88, 1.34, 0.91, 0.6, 0.38, 0.24, 0.15, 0.09, 0.05, 0.03];
    const x0 = 300, bw = 62, base = 800, k = 100;
    g.save(); g.globalAlpha = o;
    g.strokeStyle = 'rgba(160,190,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 30, base); g.lineTo(x0 + Vn.length * (bw + 6), base); g.stroke();
    Vn.forEach((v, i) => {
      const grow = eo(T, 67.5 + i * 0.09, 0.5), x = x0 + i * (bw + 6), h = v * k * grow, peak = i === 4, tail = i > 9 && T > 69.8;
      const gr = g.createLinearGradient(0, base - h, 0, base); gr.addColorStop(0, peak ? 'rgba(255,214,140,.95)' : tail ? 'rgba(170,200,255,.95)' : 'rgba(150,190,255,.7)'); gr.addColorStop(1, peak ? 'rgba(255,160,80,.35)' : 'rgba(90,120,220,.15)');
      g.fillStyle = gr; g.fillRect(x, base - h, bw, h);
      if (peak && grow > 0.9) glowDot(g, x + bw / 2, base - h, 220, GOLD, 0.35);
      label(g, String(i + 1), x + bw / 2, base + 42, 26, peak ? GOLD : '200,215,255', peak ? 1 : 0.6, 'center', 700);
    });
    g.restore();
    big(g, '五维 5.26', x0 + 4 * (bw + 6) + bw / 2, base - 5.26 * k - 40, 42, GOLD, o * eo(T, 68.4, 0.4), 'center', 900);
    big(g, '→ 0', x0 + 19 * (bw + 6) + 70, base - 10, 44, CYAN, o * eo(T, 70.4, 0.5), 'left', 900);
    big(g, '半径为 1 的球的体积', 300, 180, 32, '200,215,255', o * 0.7, 'left', 500); big(g, '维度 →', x0 + Vn.length * (bw + 6) - 40, base + 92, 26, '200,215,255', o * 0.5, 'right', 500);
  }
  // c · the orange is nearly all peel
  o = FACT(T, 72.8, 75.6);
  if (o > 0) {
    const n = Math.round(lerp(3, 100, eio(T, 73.3, 1.7) ** 1.6)), share = 1 - Math.pow(0.9, n), cx = 760, cy = 500, R = 270;
    g.save(); g.globalAlpha = o;
    const b = g.createRadialGradient(cx - 60, cy - 70, 20, cx, cy, R); b.addColorStop(0, 'rgba(255,214,140,.55)'); b.addColorStop(1, 'rgba(255,150,60,.35)'); g.fillStyle = b; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    g.fillStyle = `rgba(255,140,40,${0.3 + 0.6 * share})`; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.arc(cx, cy, R * 0.9, 0, 7, true); g.fill();
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.strokeStyle = 'rgba(255,236,200,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * 0.88, cy + Math.sin(a) * R * 0.88); g.stroke(); }
    g.restore();
    glowPath(g, Array.from({ length: 121 }, (_, i) => [cx + R * Math.cos(i / 60 * Math.PI), cy + R * Math.sin(i / 60 * Math.PI)] as [number, number]), AMBER, 3, o);
    big(g, '皮：最外面 10%', cx, cy - R - 30, 30, AMBER, o, 'center', 700);
    big(g, `n = ${n}`, 1200, 400, 96, LIGHT, o, 'left', 900); big(g, `皮占体积  ${(share * 100).toFixed(share > 0.999 ? 3 : 0)}%`, 1206, 480, 50, AMBER, o, 'left', 900);
  }
  // d · the diagonal of an n-cube is √n edges long
  o = FACT(T, 75.3, 78.9);
  if (o > 0) {
    const n = Math.round(lerp(2, 100, eio(T, 75.6, 1.5) ** 2)), side = 110, x0 = 260, y0 = 640, d = side * Math.sqrt(n);
    glowPath(g, [[x0, y0], [x0 + side, y0], [x0 + side, y0 - side], [x0, y0 - side]], LIGHT, 3, o, true);
    glowSeg(g, [[x0, y0, x0 + Math.min(d, 1500), y0 - side * Math.min(1, side / d)]], AMBER, 4.5, o);
    for (let i = 1; i <= Math.min(10, Math.floor(Math.sqrt(n))); i++) { const x = x0 + side * i; g.fillStyle = `rgba(${LIGHT},${0.5 * o})`; g.fillRect(x - 1, y0 + 24, 2, 18); }
    big(g, `n = ${n}`, 1250, 340, 96, LIGHT, o, 'left', 900); big(g, `对角线 = √${n} ≈ ${Math.sqrt(n).toFixed(n === 100 ? 0 : 2)} 倍边长`, 1256, 420, 44, AMBER, o, 'left', 900);
  }
  // e · its corners stick out like spines
  o = FACT(T, 78.6, 81.4);
  if (o > 0) {
    const k = eio(T, 78.8, 1.8), spikes = Math.round(lerp(4, 24, k)), cx = 960, cy = 500, r0 = 120, r1 = lerp(170, 430, k);
    const pts: [number, number][] = []; for (let i = 0; i <= spikes * 2; i++) { const a = i / (spikes * 2) * Math.PI * 2 + Math.PI / 4, r = i % 2 ? r0 : r1; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    g.save(); g.globalAlpha = o; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = 'rgba(120,170,255,.12)'; g.fill(); g.restore();
    glowPath(g, pts, CYAN, 3, o, true); glowDot(g, cx, cy, 120, GOLD, 0.25 * o);
    big(g, '中心离面很近，离角很远', 960, 140, 32, '200,215,255', o * 0.8, 'center', 700);
  }
  // f · the ball in the middle of the box pokes out in ten dimensions
  o = FACT(T, 80.9, 84.5);
  if (o > 0) {
    const n = Math.round(lerp(2, 10, eio(T, 81.3, 2.0))), cx = 760, cy = 480, s = 165, r = (Math.sqrt(n) - 1) * s, out = r > 2 * s;
    glowPath(g, [[cx - 2 * s, cy - 2 * s], [cx + 2 * s, cy - 2 * s], [cx + 2 * s, cy + 2 * s], [cx - 2 * s, cy + 2 * s]], LIGHT, 3, o, true);
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) glowPath(g, Array.from({ length: 61 }, (_, i) => [cx + dx * s + s * Math.cos(i / 60 * 7), cy + dy * s + s * Math.sin(i / 60 * 7)] as [number, number]), CYAN, 2.4, 0.7 * o);
    glowPath(g, Array.from({ length: 121 }, (_, i) => [cx + r * Math.cos(i / 60 * Math.PI), cy + r * Math.sin(i / 60 * Math.PI)] as [number, number]), out ? ROSE : GOLD, 3.4, o);
    if (out) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) glowDot(g, cx + ax * 2 * s, cy + ay * 2 * s, 80, ROSE, 0.45 * o);
    big(g, `n = ${n}`, 1250, 300, 96, LIGHT, o, 'left', 900); big(g, `中间球半径  ${(Math.sqrt(n) - 1).toFixed(2)}`, 1256, 380, 40, out ? ROSE : GOLD, o, 'left', 900); big(g, '盒子半宽  2', 1256, 432, 36, '200,215,255', o * 0.8, 'left', 700);
    big(g, '示意：二维切面', 760, 900, 24, '200,215,255', o * 0.55, 'center', 500);
  }
  // g · two random directions are almost always at right angles
  o = FACT(T, 84.2, 87.4);
  if (o > 0) {
    const n = Math.round(lerp(2, 1000, eio(T, 84.5, 2.0) ** 3)), cx = 700, cy = 600, sig = 70 / Math.sqrt(n);
    seed_(Math.floor(T * 8)); const jit = (rnd2() - 0.5) * 2 * Math.min(60, sig * 1.6);
    const a1 = -Math.PI / 2 - 0.3, a2 = a1 + (Math.PI / 2 + jit * Math.PI / 180);
    glowSeg(g, [[cx, cy, cx + Math.cos(a1) * 340, cy + Math.sin(a1) * 340]], LIGHT, 4, o); glowSeg(g, [[cx, cy, cx + Math.cos(a2) * 340, cy + Math.sin(a2) * 340]], AMBER, 4, o);
    const curve: [number, number][] = []; for (let i = 0; i <= 120; i++) { const deg = i * 1.5, y = Math.exp(-((deg - 90) ** 2) / (2 * Math.max(4, sig) ** 2)); curve.push([1150 + i * 5, 760 - y * 300]); } glowPath(g, curve, CYAN, 2.5, o);
    big(g, '0°', 1150, 800, 26, '200,215,255', o * 0.6, 'center', 500); big(g, '90°', 1375, 800, 30, GOLD, o, 'center', 900); big(g, '180°', 1750, 800, 26, '200,215,255', o * 0.6, 'center', 500);
    big(g, `n = ${n}`, 1150, 330, 80, LIGHT, o, 'left', 900); big(g, `夹角 ${(90 + jit).toFixed(1)}°`, 1156, 400, 44, AMBER, o, 'left', 900);
  }
  // h · in 8 and 24 dimensions spheres pack tightest: 240 neighbours, in rings of 30
  o = FACT(T, 87.0, 98.6);
  if (o > 0) {
    const cx = 960, cy = 500, burst = eio(T, 96.9, 1.6);
    glowDot(g, cx, cy, 160, GOLD, 0.35 * o * (1 - burst));
    for (let ring = 0; ring < 8; ring++) for (let i = 0; i < 30; i++) {
      const a = i / 30 * Math.PI * 2 + ring * 0.1 + (T - 87) * 0.05 * (ring % 2 ? 1 : -1), r = (60 + ring * 42) * (1 + 2.6 * burst) + burst * 200 * Math.sin(i * 7 + ring);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, k = eo(T, 87.2 + (ring * 30 + i) * 0.004, 0.4);
      if (k > 0) glowDot(g, x, y, 14, ring % 2 ? CYAN : GOLD, 0.9 * o * k * (1 - 0.6 * burst));
    }
    big(g, '8 维：每个球同时碰到 240 个球', 960, 130, 36, LIGHT, o * eo(T, 87.6, 0.5) * (1 - burst), 'center', 900);
    big(g, '24 维：196 560 个', 960, 180, 32, CYAN, o * eo(T, 88.6, 0.5) * (1 - burst), 'center', 700);
    const om = win(T, 90.3, 96.8, 0.5, 0.6);
    if (om > 0) { glowPath(g, Array.from({ length: 91 }, (_, i) => [1560 + 120 * Math.cos(i / 45 * Math.PI), 760 + 120 * Math.sin(i / 45 * Math.PI)] as [number, number]), GOLD, 4, om); big(g, '2016', 1560, 752, 56, GOLD, om, 'center', 900); big(g, '证明 · 2022 菲尔兹奖', 1560, 806, 26, GOLD, om, 'center', 700); }
  }
};
let _s = 1; const seed_ = (s: number) => { _s = s * 7919 + 13; }; const rnd2 = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };

/* ------------------------------------------------------------ S6: words as points in a space of thousands of dimensions */
const GROUPS: [string[], number, number, string][] = [[['猫', '狗', '老虎', '狮子', '兔子'], 640, 370, AMBER], [['苹果', '香蕉', '葡萄', '橙子'], 1500, 350, '150,230,170'], [['国王', '女王', '王子', '公主'], 1240, 660, VIOLET], [['开心', '快乐', '高兴'], 560, 710, '255,170,190']];
const sceneWords = (g: G, T: number) => {
  const o = win(T, 97.6, 109.6, 0.8, 0.9), drift = (T - 98) * 6;
  if (o <= 0) return;
  g.save(); g.globalAlpha = o; g.translate(-drift, 0);
  let s = 21; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 900; i++) { const x = 80 + r() * 1900, y = 80 + r() * 760, rr = r() * 2.4 + 0.6; g.fillStyle = `rgba(170,200,255,${0.15 + r() * 0.35})`; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  g.restore();
  GROUPS.forEach(([ws, gx, gy, col], gi) => {
    const k = eo(T, 98.9 + gi * 0.4, 0.7) * o; if (k <= 0) return;
    const glow = 0.16 + 0.14 * eo(T, 103.6, 0.6);
    glowDot(g, gx - drift, gy, 230, col, glow * k);
    const pts = ws.map((_, i) => { const a = i / ws.length * Math.PI * 2 + gi; return [gx - drift + Math.cos(a) * 150 * lerp(1.8, 1, k), gy + Math.sin(a) * 95 * lerp(1.8, 1, k)]; });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) glowSeg(g, [[pts[i][0], pts[i][1], pts[j][0], pts[j][1]]], col, 1, 0.25 * k * eo(T, 103.6, 0.6));
    ws.forEach((w, i) => { glowDot(g, pts[i][0], pts[i][1], 26, col, 0.9 * k); label(g, w, pts[i][0] + 18, pts[i][1] - 14, 36, col, 0.95 * k, 'left', 700); });
  });
  big(g, '每个词 = 几千维空间里的一个点', 960, 150, 34, '200,215,255', 0.75 * eo(T, 99.4, 0.6) * o, 'center', 500);
};

/* ------------------------------------------------------------ S7: back out to the ant (coda) */
const sceneCoda = (g: G, T: number) => {
  const o = eo(T, 108.9, 1.0) * (1 - pr(T, END + 0.2, 0.6));
  if (o <= 0) return;
  const c: Cam = { yaw: lerp(0.2, 0.55, eio(T, 109, 8)), pitch: 0.3, dist: lerp(11.5, 15, eio(T, 109.1, 7)), f: 1500, cx: 960, cy: 520 };
  g.save(); g.globalAlpha = o;
  const flash = (t0: number) => Math.exp(-Math.max(0, T - t0) / 0.6) * (T > t0 ? 1 : 0);
  K.drawTesseract(g, c, 0.5 + 0.2 * (T - 109), 0.25, 0.1, 1.9, 0.25 + 0.5 * eo(T, 111.4, 0.6) + 0.4 * flash(111.46));
  const { vs, es } = cube(3), P = vs.map((v) => p3(c, v.map((q) => q * 1.2)));
  glowSeg(g, es.map(([i, j]) => [P[i][0], P[i][1], P[j][0], P[j][1]] as Seg), CYAN, 2.4, 0.75);
  const sq = [[-1.2, -1.2, 0], [1.2, -1.2, 0], [1.2, -1.2, 1.2], [-1.2, -1.2, 1.2]].map((v) => p3(c, v));
  g.beginPath(); sq.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = `rgba(140,180,255,${0.14 + 0.25 * flash(109.3)})`; g.fill();
  const L0 = p3(c, [-1.2, -1.2, 0.6]), L1 = p3(c, [1.2, -1.2, 0.6]); glowSeg(g, [[L0[0], L0[1], L1[0], L1[1]]], LIGHT, 4.5, 1);
  const a = p3(c, [0.1, -1.2, 0.6]); ant(g, a[0], a[1], lerp(1.1, 0.5, eio(T, 109.1, 7)), 1.4);
  if (T > 113.6) glowDot(g, 960, 520, 700, GOLD, 0.2 * eo(T, 113.6, 0.8));
  g.restore();
};

/* ------------------------------------------------------------ the end card */
const endCard = (g: G, T: number) => {
  const o = eo(T, END, 0.6); if (o <= 0) return;
  g.fillStyle = `rgba(4,6,14,${0.82 * o})`; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = o * eo(T, END + 0.2, 0.6); g.font = '900 120px "Noto Serif CJK SC"'; g.textAlign = 'center';
  const tg = g.createLinearGradient(0, 260, 0, 380); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32'); g.fillStyle = tg; g.fillText('《第n维长什么样》', 960, 360); g.restore();
  big(g, '你觉得第几维最难想象？评论区说说', 960, 500, 54, '242,236,226', o * eo(T, END + 0.7, 0.5), 'center', 700);
  const of = o * eo(T, END + 1.1, 0.5);
  g.save(); g.globalAlpha = of; g.strokeStyle = JUNO.colors.gold; g.lineWidth = 2; g.beginPath(); g.roundRect(960 - 290, 580, 580, 70, 35); g.stroke(); g.restore();
  big(g, JUNO.follow, 960, 628, 32, GOLD, of, 'center', 700);
  big(g, '资料：Abbott《平面国》1884 · Hinton 1888 · Shewchuk《高维空间的反直觉性质》· Viazovska 2016（IMU 2022）· Live Science', 960, 760, 22, '200,210,230', o * eo(T, END + 1.5, 0.5) * 0.8, 'center', 400);
};

/* ------------------------------------------------------------ the whole shot */
const draw = (g: G, T: number) => {
  space(g);
  // build (0–33.4): the line → plane → cube → tesseract, then it shrinks away into the sheet
  const oB = 1 - pr(T, 32.4, 1.0); layer(g, oB, lerp(1, 0.35, eio(T, 32.0, 1.6)), () => sceneBuild(g, T));
  // visitor (32.6–48.9)
  const oV = Math.min(eo(T, 32.6, 0.8), 1 - pr(T, 48.2, 0.8)); layer(g, oV, 1 + 0.6 * eio(T, 48.2, 0.9), () => sceneVisitor(g, T));
  // flower (48.2–65.1): flies in from far; on the drop the camera dives through its centre
  const oF = Math.min(eo(T, 48.2, 0.9), 1 - pr(T, 64.6, 0.5)); layer(g, oF, lerp(0.6, 1, eio(T, 48.2, 1.2)) * (1 + 5 * Math.pow(pr(T, 63.4, 1.69), 3)), () => sceneFlower(g, T), 1100, 500);
  // facts (65.1–98.6)
  if (T > 64.9 && T < 99) sceneFacts(g, T);
  // words (97.6–109.6), then the coda
  sceneWords(g, T);
  sceneCoda(g, T);
  // the hit flash for the title and the drop flash
  for (const [t0, a] of [[HIT, 0.55], [DROP, 0.9]] as const) if (T >= t0 && T < t0 + 1.2) { g.fillStyle = `rgba(255,236,200,${a * Math.exp(-(T - t0) / 0.22)})`; g.fillRect(0, 0, W, H); }
  // the title on the first hit
  const oT = T >= HIT - 0.05 ? Math.min(eo(T, HIT, 0.25), 1 - pr(T, 19.1, 0.6)) : 0;
  if (oT > 0) {
    g.save(); g.globalAlpha = oT; g.font = '900 150px "Noto Serif CJK SC"'; g.textAlign = 'center';
    const s = 1 + 0.25 * (1 - eo(T, HIT, 0.35)); g.translate(960, 300); g.scale(s, s);
    const tg = g.createLinearGradient(0, -110, 0, 30); tg.addColorStop(0, '#fff3cf'); tg.addColorStop(0.5, '#f0c873'); tg.addColorStop(1, '#b07c32');
    g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 40; g.fillStyle = tg; g.fillText('《第n维长什么样》', 0, 0); g.restore();
    big(g, `— ${JUNO.series} —`, 960, 380, 30, GOLD, oT * eo(T, HIT + 0.6, 0.4), 'center', 500);
  }
  vignette(g);
  endCard(g, T);
  const oMark = Math.min(eo(T, 19.6, 0.8), 1 - pr(T, END - 0.5, 0.5));
  if (oMark > 0) label(g, `◆ ${JUNO.mark}`, W - 56, 64, 22, '243,237,226', 0.45 * oMark, 'right', 500);
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const zh = Array.from(new Set(LINES.map((l) => l[2]).join('') + '第n维长什么样第四个方向与三条都垂直顶点棱立方体围成纸上的生物只看到这一圈它在第四维里的路线从看里面一览无余三叶结散开了左右手示意二维手套绕翻身就成了镜像半径为球体积五皮最外面占对角线倍边长中心离面很近角远间宽盒子切夹每个同时碰到证明菲尔兹奖词几千空点你觉得难想象评论区说说关注一起懂世界资料平面国高反直觉性质')).join('');
    Promise.all(['900 74px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '400 40px "Noto Sans CJK SC"', '900 150px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, zh + 'nV()=πΓ÷√°0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); draw(g, T); }, [T, ok]);
  return (
    <AbsoluteFill style={{ background: '#04060e' }}>
      <canvas ref={ref} width={W} height={H} style={{ position: 'absolute' }} />
      {ok && LINES.map(([a, z, t], i) => {
        const o = Math.min(eo(T, a, 0.2), 1 - pr(T, z - 0.18, 0.18));
        if (o <= 0) return null;
        const parts = t.split(/(\[[^\]]+\]|\{[^}]+\})/);
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', opacity: o, transform: `translateY(${(1 - eo(T, a, 0.35)) * 8}px)`, fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 900, fontSize: 74, letterSpacing: '0.04em', color: '#fbf7ee', whiteSpace: 'nowrap',
            textShadow: '0 0 2px #000, 3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000, 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 4px 16px rgba(0,0,0,.8)' }}>
            {parts.map((x, j) => { const hl = x.startsWith('[') || x.startsWith('{'); return <span key={j} style={hl ? { color: x.startsWith('[') ? '#f6d58e' : '#ff8a7a' } : undefined}>{hl ? x.slice(1, -1) : x}</span>; })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

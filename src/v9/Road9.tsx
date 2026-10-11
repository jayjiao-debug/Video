import React from 'react';
import { AbsoluteFill } from 'remotion';
import { mulberry } from '../v1/data';
import { b, prog, easeOut, easeInOut, lerp, clamp, win, smooth, heat, rgb, Hud, SANS, MONO, AMBER, RED, ICE, WHITE, DIMW } from './kit9';
import { Cam, V3, Poly, Proj, camAt, camLerp, projector, ribbon, poly, quad, at, sub, strokeWorld, bloom, integrator, hash, CITY_DOTS, STREETS, W, H } from './light9';
import { Canvas9 } from './Canvas9';

/* 《越修越堵》 the road network at night. Two parts share it:
   main: hook -> title -> the two routes -> the shortcut -> 80 -> closing it -> Braess -> a real city (b124)
   end:  back to the city after the springs; the shortcut goes dark and the flows cool down. */
export const HIT = b(80);
export const CITY_OUT = b(124);
export const END_IN = b(172.6);
export const CARD9 = b(187.6);

/* ---------- the Braess network (world units; z toward the viewer) ---------- */
const A: V3 = [-560, 0, 0], B: V3 = [560, 0, 0], C: V3 = [-180, 0, -230], D: V3 = [180, 0, 230];
const L = {
  AC: poly([A, [-370, 0, -125], C]),
  DB: poly([D, [370, 0, 125], B]),
  CB: quad(C, [230, 0, -560], B),
  AD: quad(A, [-230, 0, 560], D),
  CD: poly([C, D]),
};
const K = 0.11; // seconds of screen time per minute of travel
const narrowMin = (u: number) => 20 + 20 * u;

/* ---------- what the network is doing at time T ---------- */
export const netState = (T: number, part: 'main' | 'end') => {
  if (part === 'end') {
    const off = easeInOut(prog(T, b(182), b(183.8)));
    return { u: 1 - easeInOut(prog(T, b(182.6), b(186.4))), draw: 1, cut: off, closed: 0 };
  }
  if (T < b(32.2)) return { u: easeInOut(prog(T, 2.9, 5.3)), draw: easeInOut(prog(T, 0.35, 1.9)), cut: 0, closed: 0 };
  if (T < b(36.5)) return { u: 1 - easeInOut(prog(T, b(32.3), b(35.6))), draw: 1 - easeInOut(prog(T, b(33.4), b(35.8))), cut: 0, closed: 0 };
  if (T < b(64)) return { u: 0, draw: 0, cut: 0, closed: 0 };
  if (T < b(96.4)) return { u: easeInOut(prog(T, b(69.4), b(79.4))), draw: easeInOut(prog(T, b(64.3), b(66.2))), cut: 0, closed: 0 };
  return { u: 1 - easeInOut(prog(T, b(97.2), b(100.6))), draw: 1, cut: 0, closed: easeOut(prog(T, b(96.6), b(97.4))) * (1 - prog(T, b(101), b(102))) , };
};
const shortcutAlpha = (T: number, part: 'main' | 'end') => {
  const s = netState(T, part);
  if (part === 'main' && T > b(96.4)) return 1 - easeInOut(prog(T, b(97.4), b(100.2)));
  return 1 - s.cut;
};
const phaseMain = integrator((T) => 1 / (narrowMin(netState(T, 'main').u) * K));
const phaseEnd = integrator((T) => 1 / (narrowMin(netState(T, "end").u) * K), 70, 112);

/* ---------- cameras ---------- */
const cam = (pos: V3, tgt: V3, fov = 40, roll = 0): Cam => ({ pos, tgt, fov, roll });
const MAIN_KEYS: [number, Cam][] = [
  [2.4, cam([-420, 560, 1020], [-30, 0, 70], 46, 0.03)],
  [5.0, cam([-300, 760, 1130], [-10, 0, 50], 44, 0.015)],
  [b(31.4), cam([-140, 1000, 1180], [0, 0, 40], 42)],
  [b(36), cam([0, 1320, 790], [0, 0, 140], 40)],
  [b(58.4), cam([40, 1300, 770], [0, 0, 140], 40)],
  [b(64), cam([0, 1270, 760], [0, 0, 130], 40)],
  [b(79.6), cam([-40, 1090, 660], [0, 0, 130], 40)],
  [b(84), cam([0, 1240, 760], [0, 0, 140], 40)],
  [b(101.6), cam([0, 1280, 790], [0, 0, 140], 40)],
  [b(107.6), cam([0, 4700, 2300], [0, 0, 120], 40)],
  [b(124), cam([520, 4300, 2050], [120, 0, 80], 40, -0.03)],
];
const END_KEYS: [number, Cam][] = [
  [b(172), cam([-1000, 1700, 1700], [0, 0, 120], 42, 0.03)],
  [b(181.6), cam([-360, 1350, 1150], [0, 0, 130], 41, 0.01)],
  [b(187.6), cam([0, 1300, 900], [0, 0, 140], 40)],
  [b(200), cam([120, 1420, 960], [0, 0, 140], 40)],
];
/* the cold open: skim the lower highway at lane height, then crane up as the new road lights */
const qAD = (t: number): V3 => { const u = 1 - t; return [u * u * A[0] + 2 * u * t * -230 + t * t * D[0], 0, u * u * A[2] + 2 * u * t * 560 + t * t * D[2]]; };
const flight = (T: number): Cam => {
  const k = (T + 0.4) / 2.3, t = lerp(-0.16, 0.6, k);
  const p = qAD(t), q = qAD(t + 0.2);
  return cam([p[0] - 30, lerp(38, 70, clamp(k)), p[2] + 40], [q[0], 6, q[2]], 58, 0.09 * Math.sin(k * 2.2));
};
export const roadCam = (T: number, part: 'main' | 'end') => {
  if (part === 'main' && T < 3.2) {
    const crane = camAt(MAIN_KEYS, T);
    return camLerp(flight(T), crane, smooth(1.35, 3.1, T));
  }
  return camAt(part === 'main' ? MAIN_KEYS : END_KEYS, T);
};
const shakeAt = (T: number): [number, number] => {
  if (T < HIT) return [0, 0];
  const e = Math.exp(-(T - HIT) * 7) * 16;
  return [e * Math.sin(T * 91), e * Math.cos(T * 73)];
};

/* ---------- a stand-in city graph for 2008 (88 junctions, 123 two-way roads, 6 paradox roads) ---------- */
const CITY = (() => {
  const r = mulberry(2008);
  const nodes: V3[] = [];
  let guard = 0;
  while (nodes.length < 88 && guard++ < 20000) {
    const x = (r() * 2 - 1) * 2500, z = (r() * 2 - 1) * 1500;
    if ((x / 2500) ** 2 + (z / 1500) ** 2 > 1) continue;
    if (nodes.some((n) => Math.hypot(n[0] - x, n[2] - z) < 300)) continue;
    nodes.push([x, 0, z]);
  }
  const key = new Set<string>();
  const edges: [number, number][] = [];
  const d2 = (i: number, j: number) => (nodes[i][0] - nodes[j][0]) ** 2 + (nodes[i][2] - nodes[j][2]) ** 2;
  // relative-neighbourhood style: link close pairs, nearest first, until 123 roads
  const pairs: [number, number, number][] = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) pairs.push([d2(i, j), i, j]);
  pairs.sort((p, q) => p[0] - q[0]);
  const deg = new Array(nodes.length).fill(0);
  for (const [, i, j] of pairs) {
    if (edges.length >= 123) break;
    if (deg[i] >= 4 || deg[j] >= 4) continue;
    const k = `${i}-${j}`;
    if (key.has(k)) continue;
    key.add(k); edges.push([i, j]); deg[i]++; deg[j]++;
  }
  const mid = (e: [number, number]) => Math.hypot((nodes[e[0]][0] + nodes[e[1]][0]) / 2, (nodes[e[0]][2] + nodes[e[1]][2]) / 2);
  const order = edges.map((e, i) => [mid(e), i] as [number, number]).sort((p, q) => p[0] - q[0]);
  const hot = new Set([1, 4, 8, 13, 19, 26].map((k) => order[k][1]));
  return { nodes, edges, hot, cutEdge: order[4][1] };
})();

/* ---------- drawing ---------- */
const drawCity = (ctx: CanvasRenderingContext2D, pr: Proj, T: number, o: number) => {
  if (o <= 0) return;
  ctx.globalCompositeOperation = 'lighter';
  for (const d of CITY_DOTS) {
    const q = pr(d.p);
    if (!q || q[0] < -10 || q[0] > W + 10 || q[1] < -10 || q[1] > H + 10) continue;
    const sz = clamp(d.s * q[2] * 3.2, 0.5, 3.2);
    const a = o * (0.18 + 0.32 * d.tw) * (0.85 + 0.15 * Math.sin(T * (1 + d.tw * 3) + d.tw * 40));
    ctx.fillStyle = d.warm > 0.35 ? `rgba(255,${200 + 30 * d.warm | 0},150,${a})` : `rgba(150,190,255,${a})`;
    ctx.fillRect(q[0], q[1], sz, sz);
  }
  for (const s of STREETS) {
    strokeWorld(ctx, pr, [s.a, s.z], `rgba(90,110,160,${0.05 * o})`, 6, true);
    const P = poly([s.a, s.z]);
    for (let k = 0; k < s.n; k++) {
      const f0 = (((k / s.n + (T * 0.06 * s.dir) + s.seed) % 1) + 1) % 1;
      const f1 = clamp(f0 - 0.05 * s.dir);
      if (f0 < 0.03 || f0 > 0.97) continue;
      strokeWorld(ctx, pr, [at(P, f1)[0], at(P, f0)[0]], s.dir > 0 ? `rgba(255,230,200,${0.32 * o})` : `rgba(255,70,50,${0.32 * o})`, 1.4);
    }
  }
};

const drawRoadBase = (ctx: CanvasRenderingContext2D, pr: Proj, P: Poly, ww: number, a: number, glow?: string) => {
  ctx.globalCompositeOperation = 'lighter';
  if (glow) ribbon(ctx, pr, P.pts, ww * 1.3, glow);
  ribbon(ctx, pr, P.pts, ww / 2, `rgba(110,130,190,${0.07 * a})`);
  strokeWorld(ctx, pr, P.pts, `rgba(170,190,240,${0.12 * a})`, 1);
};

/** cars on one link: slots that light up as the link fills; streak length = speed x exposure */
const drawFlow = (ctx: CanvasRenderingContext2D, pr: Proj, P: Poly, opt: { slots: number; fill: number; phase: number; speed: number; lanes: number; laneW: number; color: number[]; a: number; from?: number; to?: number; seed: number; head?: boolean; lw?: number }) => {
  const { slots, fill, phase, speed, lanes, laneW, color, a, seed } = opt;
  const from = opt.from ?? 0, to = opt.to ?? 1;
  const trail = clamp(speed * 0.17, 0.006, 0.3);
  const lw = opt.lw ?? 1;
  for (let k = 0; k < slots; k++) {
    const h = hash(k, seed);
    const vis = smooth(h - 0.05, h + 0.05, fill);
    if (vis <= 0.01) continue;
    const f = ((k + 0.6 * hash(k, seed + 3)) / slots + phase) % 1;
    if (f < from || f > to) continue;
    const edge = Math.min(smooth(0, 0.04, f), smooth(1, 0.96, f));
    const lane = Math.floor(hash(k, seed + 7) * lanes) - (lanes - 1) / 2;
    const off = lane * laneW + (hash(k, seed + 9) - 0.5) * laneW * 0.3;
    const pts: V3[] = [];
    for (let i = 0; i <= 3; i++) {
      const [p, dx, dz] = at(P, Math.max(from, f - trail * (i / 3)));
      pts.push([p[0] - dz * off, 0, p[2] + dx * off]);
    }
    const al = a * vis * edge;
    strokeWorld(ctx, pr, pts, rgb(color, 0.3 * al), 3.0 * lw, true, 14);
    strokeWorld(ctx, pr, pts.slice(0, 2), rgb(color, 0.95 * al), 1.6 * lw, true, 7);
    if (opt.head) { const q = pr(pts[0]); if (q) { ctx.fillStyle = rgb([255, 255, 255], 0.8 * al); ctx.fillRect(q[0] - 1, q[1] - 1, 2.2, 2.2); } }
  }
};

const drawNet = (ctx: CanvasRenderingContext2D, pr: Proj, T: number, part: 'main' | 'end', o: number) => {
  if (o <= 0) return;
  const s = netState(T, part);
  const ph = part === 'main' ? phaseMain(T) : phaseEnd(T);
  const nMin = narrowMin(s.u);
  const jam = 0.3 + 0.7 * s.u;
  const scA = shortcutAlpha(T, part) * o;
  // asphalt
  drawRoadBase(ctx, pr, L.CB, 40, o);
  drawRoadBase(ctx, pr, L.AD, 40, o);
  drawRoadBase(ctx, pr, L.AC, 13, o, `rgba(255,60,40,${0.2 * s.u * o})`);
  drawRoadBase(ctx, pr, L.DB, 13, o, `rgba(255,60,40,${0.2 * s.u * o})`);
  // shortcut: drawn in like a scan line
  if (s.draw > 0 && scA > 0) {
    const pts = sub(L.CD, 1 - s.draw, 1, 30);
    ribbon(ctx, pr, pts, 17, `rgba(159,227,255,${0.08 * scA})`);
    ribbon(ctx, pr, pts, 4, `rgba(159,227,255,${0.3 * scA})`);
    strokeWorld(ctx, pr, pts, `rgba(235,250,255,${0.9 * scA})`, 1.6);
    if (s.draw < 1) { const q = pr(at(L.CD, 1 - s.draw)[0]); if (q) { const g = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], 26); g.addColorStop(0, `rgba(235,250,255,${scA})`); g.addColorStop(1, 'rgba(159,227,255,0)'); ctx.fillStyle = g; ctx.fillRect(q[0] - 26, q[1] - 26, 52, 52); } }
  }
  // traffic: narrow roads fill and slow down; wide roads empty; the shortcut carries the switchers
  const nSpeed = 1 / (nMin * K), wSpeed = 1 / (45 * K), cSpeed = 1 / 0.7;
  const nFill = ((1 + s.u) / 2) ** 2;
  const nCol = heat(jam);
  drawFlow(ctx, pr, L.AC, { slots: 170, fill: nFill, phase: ph, speed: nSpeed, lanes: 2, laneW: 5, color: nCol, a: o, seed: 1, lw: 1 + 0.8 * s.u });
  drawFlow(ctx, pr, L.DB, { slots: 170, fill: nFill, phase: ph + 0.13, speed: nSpeed, lanes: 2, laneW: 5, color: nCol, a: o, seed: 2, lw: 1 + 0.8 * s.u });
  const wFill = 0.55 * (1 - s.u) ** 1.3;
  drawFlow(ctx, pr, L.CB, { slots: 150, fill: wFill, phase: T * wSpeed, speed: wSpeed, lanes: 3, laneW: 11, color: [225, 236, 255], a: o, seed: 3 });
  drawFlow(ctx, pr, L.AD, { slots: 150, fill: wFill, phase: T * wSpeed + 0.21, speed: wSpeed, lanes: 3, laneW: 11, color: [225, 236, 255], a: o, seed: 4 });
  if (s.draw > 0.99 && scA > 0) drawFlow(ctx, pr, L.CD, { slots: 46, fill: s.u, phase: T * cSpeed, speed: cSpeed * 0.25, lanes: 2, laneW: 7, color: [200, 240, 255], a: scA, seed: 5, head: true });
  // junctions
  ctx.globalCompositeOperation = 'lighter';
  for (const [p, r, big] of [[A, 9, 1], [B, 9, 1], [C, 4, 0], [D, 4, 0]] as [V3, number, number][]) {
    const q = pr(p);
    if (!q) continue;
    ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,245,230,${(big ? 0.95 : 0.6) * o})`; ctx.fill();
    if (big) { ctx.beginPath(); ctx.arc(q[0], q[1], r + 9, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,245,230,${0.35 * o})`; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
};

const drawCityGraph = (ctx: CanvasRenderingContext2D, pr: Proj, T: number, o: number) => {
  if (o <= 0) return;
  const cut = easeInOut(prog(T, b(115.2), b(116.4)));
  const cool = 0.18 * easeInOut(prog(T, b(115.6), b(117.6)));
  const hotO = win(T, b(112.6), CITY_OUT, 0.4, 0.4);
  CITY.edges.forEach(([i, j], e) => {
    const a = CITY.nodes[i], z = CITY.nodes[j];
    const isCut = e === CITY.cutEdge;
    const P = poly([a, z]);
    const ea = o * (isCut ? 1 - cut : 1);
    strokeWorld(ctx, pr, P.pts, `rgba(110,130,190,${0.18 * ea})`, 22, true);
    const load = hash(e, 11), dir = hash(e, 12) < 0.5;
    const jam = clamp(load * 0.55 + 0.05 - cool);
    const sp = 0.16 + 0.3 * (1 - jam);
    drawFlow(ctx, pr, dir ? P : poly([z, a]), { slots: 34, fill: 0.25 + 0.6 * load, phase: T * sp + hash(e, 13), speed: sp, lanes: 2, laneW: 10, color: heat(jam), a: ea, seed: 20 + e, lw: 3 });
    if (CITY.hot.has(e) && hotO > 0) {
      ctx.save();
      ctx.setLineDash([10, 9]);
      ctx.lineDashOffset = -T * 40;
      const pulse = 0.65 + 0.35 * Math.sin(T * 7 + e);
      const ha = hotO * pulse * (isCut ? 1 - cut : 1);
      strokeWorld(ctx, pr, P.pts, `rgba(255,60,40,${0.25 * ha})`, 60, true);
      strokeWorld(ctx, pr, P.pts, `rgba(255,85,65,${ha})`, 4);
      ctx.restore();
    }
  });
  ctx.globalCompositeOperation = 'lighter';
  for (const n of CITY.nodes) { const q = pr(n); if (!q) continue; ctx.fillStyle = `rgba(255,245,230,${0.6 * o})`; ctx.fillRect(q[0] - 1.5, q[1] - 1.5, 3, 3); }
};

/* ---------- overlay text anchored to the world ---------- */
const anchor = (pr: Proj, p: V3, dx = 0, dy = 0) => { const q = pr(p); return q ? [q[0] + dx, q[1] + dy] : [-999, -999]; };
const Label: React.FC<{ x: number; y: number; o: number; big: string; small?: string; color?: string }> = ({ x, y, o, big, small, color = WHITE }) =>
  o <= 0.01 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o, textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 0 12px rgba(0,0,0,1), 0 0 3px rgba(0,0,0,1)' }}>
      <div style={{ fontFamily: MONO, fontSize: 26, color, letterSpacing: '0.06em' }}>{big}</div>
      {small && <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 400, color: DIMW, marginTop: 2, letterSpacing: '0.1em' }}>{small}</div>}
    </div>
  );

export const RoadScene: React.FC<{ T: number; part: 'main' | 'end'; o?: number }> = ({ T, part, o = 1 }) => {
  const c = roadCam(T, part);
  const sh = part === 'main' ? shakeAt(T) : [0, 0] as [number, number];
  const pr = projector(c, sh);
  const netO = part === 'main' ? 1 - easeInOut(prog(T, b(105.6), b(107.4))) : 1;
  const graphO = part === 'main' ? easeInOut(prog(T, b(105.8), b(108))) : 0;
  const cityO = part === 'main' ? lerp(1, 0.55, easeInOut(prog(T, b(34), b(37)))) * (1 - 0.5 * graphO) + 0.45 * easeInOut(prog(T, b(100.6), b(104))) * (1 - graphO) : 1;
  const s = netState(T, part);
  const nMin = narrowMin(s.u);
  const draw = (ctx: CanvasRenderingContext2D, b1: HTMLCanvasElement, b2: HTMLCanvasElement) => {
    // night sky haze above the horizon
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#060a16'); g.addColorStop(0.5, '#04060d'); g.addColorStop(1, '#020308');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawCity(ctx, pr, T, cityO);
    drawNet(ctx, pr, T, part, netO);
    drawCityGraph(ctx, pr, T, graphO);
    bloom(ctx, b1, 0.6, 4);
    bloom(ctx, b2, 0.35, 10);
    if (part === 'main' && T > 2.5 && T < 3.2) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(159,227,255,${0.16 * Math.exp(-(T - 2.5) * 7)})`; ctx.fillRect(0, 0, W, H); }
    // flash on the hit
    if (part === 'main' && T > HIT && T < HIT + 0.6) { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(255,236,210,${0.32 * Math.exp(-(T - HIT) * 9)})`; ctx.fillRect(0, 0, W, H); }
  };

  /* ---- overlays ---- */
  const ov: React.ReactNode[] = [];
  if (part === 'main') {
    const lab = (T2: number, z: number) => win(T, T2, Math.min(z, b(101.6)), 0.4, 0.4) * netO;
    const [ax, ay] = anchor(pr, A, -64, 0), [bx, by] = anchor(pr, B, 64, 0);
    ov.push(<Label key="A" x={ax} y={ay} o={lab(b(37.6), b(104))} big="A" small="出发" />);
    ov.push(<Label key="B" x={bx} y={by} o={lab(b(37.6), b(104))} big="B" small="家" />);
    const nCol = nMin > 30 ? RED : nMin > 21 ? AMBER : WHITE;
    const [m1x, m1y] = anchor(pr, at(L.AC, 0.5)[0], -58, -30), [m2x, m2y] = anchor(pr, at(L.DB, 0.5)[0], 58, 30);
    const nO = lab(b(43.3), b(104));
    ov.push(<Label key="ac" x={m1x} y={m1y} o={nO} big={`${Math.round(nMin)} 分钟`} small={T < b(64) ? '车数÷100' : undefined} color={nCol} />);
    ov.push(<Label key="db" x={m2x} y={m2y} o={nO} big={`${Math.round(nMin)} 分钟`} small={T < b(64) ? '车数÷100' : undefined} color={nCol} />);
    const [w1x, w1y] = anchor(pr, at(L.CB, 0.5)[0], 0, -44), [w2x, w2y] = anchor(pr, at(L.AD, 0.5)[0], 0, -50);
    const wO = lab(b(47.9), b(104));
    ov.push(<Label key="cb" x={w1x} y={w1y} o={wO} big="45 分钟" small="宽路" />);
    ov.push(<Label key="ad" x={w2x} y={w2y} o={wO} big="45 分钟" small="宽路" />);
    const [cx, cy] = anchor(pr, at(L.CD, 0.5)[0], 74, 0);
    ov.push(<Label key="cd" x={cx} y={cy} o={lab(b(65.6), b(98)) * s.draw} big="0 分钟" small="近路" color={ICE} />);
    { const k = clamp((T - 2.45) / 0.25), o1 = T > 2.45 ? Math.min(1, k * 1.5) * (1 - prog(T, 5.0, 5.4)) : 0;
      if (o1 > 0) { const [px1, py1] = anchor(pr, at(L.CD, 0.5)[0], 0, -70); ov.push(<div key="plus1" style={{ position: 'absolute', left: px1, top: py1, transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, easeOut(k))})`, opacity: o1, whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 300, fontSize: 64, color: '#e8f8ff', textShadow: '0 0 24px rgba(159,227,255,0.9), 0 0 4px rgba(0,0,0,0.9)' }}>+1 <span style={{ fontSize: 34 }}>条路</span></div>); } }
    // closing the shortcut
    const cl = s.closed;
    if (cl > 0) { const [xx, xy] = anchor(pr, at(L.CD, 0.5)[0]); ov.push(<div key="x" style={{ position: 'absolute', left: xx, top: xy, transform: `translate(-50%,-50%) scale(${lerp(1.6, 1, cl)})`, opacity: cl, fontFamily: SANS, fontWeight: 300, fontSize: 90, color: RED, textShadow: '0 0 20px rgba(255,75,58,0.8)' }}>×</div>); }
    // the 4000 cars
    const cars = Math.round(4000 * easeOut(prog(T, b(38.4), b(40.6))));
    ov.push(<Hud key="cars" x={ax + 30} y={ay + 50} o={lab(b(38.4), b(64))} align="right" color={AMBER} size={22}>{cars} 辆</Hud>);
    // route panel
    const AC = nMin, DB = nMin;
    const rows: [string, string, number, number][] = [
      ['上', 'A→C→B', AC + 45, win(T, b(58.5), b(101.4), 0.4, 0.4)],
      ['下', 'A→D→B', 45 + DB, win(T, b(58.7), b(101.4), 0.4, 0.4)],
      ['近', 'A→C→D→B', AC + DB, win(T, b(66), b(99), 0.4, 0.4) * s.draw],
    ];
    const best = Math.min(...rows.filter((r) => r[3] > 0.5).map((r) => r[2]));
    const flash85 = T > b(85) && T < b(90.6);
    ov.push(
      <div key="panel" style={{ position: 'absolute', right: 70, top: 120, width: 330 }}>
        {rows.map(([k, r, v, ro], i) => ro <= 0.01 ? null : (
          <div key={i} style={{ opacity: ro, display: 'flex', alignItems: 'baseline', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(243,241,236,0.14)' }}>
            <span style={{ fontFamily: SANS, fontSize: 22, color: i === 2 ? ICE : DIMW, width: 26 }}>{k}</span>
            <span style={{ fontFamily: MONO, fontSize: 19, color: DIMW, flex: 1, letterSpacing: '0.04em' }}>{r}</span>
            <span style={{ fontFamily: MONO, fontSize: 40, fontVariantNumeric: 'tabular-nums', color: flash85 && i < 2 ? RED : Math.round(v) === Math.round(best) ? AMBER : WHITE, textShadow: '0 0 12px rgba(0,0,0,0.9)' }}>{Math.round(v)}</span>
            <span style={{ fontFamily: SANS, fontSize: 16, color: DIMW }}>分</span>
          </div>
        ))}
      </div>,
    );
    // the 80
    const k80 = clamp((T - HIT) / 0.22);
    const o80 = T > HIT ? Math.min(1, k80 * 1.4) * (1 - prog(T, b(84.4), b(85))) : 0;
    if (o80 > 0) ov.push(<div key="scrim" style={{ position: 'absolute', inset: 0, opacity: o80, background: 'radial-gradient(ellipse 38% 34% at 50% 30%, rgba(3,4,9,0.8) 0%, rgba(3,4,9,0) 100%)' }} />);
    if (o80 > 0) ov.push(
      <div key="80" style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: o80, transform: `scale(${lerp(1.5, 1, easeOut(k80))})` }}>
        <span style={{ fontFamily: SANS, fontWeight: 200, fontSize: 300, lineHeight: 1, color: '#fff', textShadow: '0 0 40px rgba(255,90,60,0.85), 0 0 120px rgba(255,60,40,0.5)' }}>80</span>
        <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: 54, color: '#ffd9c8', marginLeft: 14 }}>分钟</span>
      </div>,
    );
    // hook clock
    const hk = win(T, 2.3, b(31.4), 0.4, 0.4);
    if (hk > 0) ov.push(
      <div key="hk" style={{ position: 'absolute', right: 120, top: 330, opacity: hk, textAlign: 'right' }}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, letterSpacing: '0.3em', color: DIMW }}>到 家</div>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: 150, lineHeight: 1.05, color: s.u > 0.5 ? '#ffd2c2' : WHITE, textShadow: `0 0 ${30 + 30 * s.u}px rgba(255,${lerp(200, 60, s.u) | 0},40,${0.4 + 0.4 * s.u})` }}>{Math.round(65 + 15 * s.u)}<span style={{ fontSize: 40, marginLeft: 10 }}>分钟</span></div>
      </div>,
    );
    // Braess 1968
    const bo = win(T, b(101.6), b(106.6), 0.5, 0.5);
    if (bo > 0) ov.push(
      <div key="br" style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: bo }}>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: '0.5em', color: AMBER }}>BRAESS'S PARADOX</div>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, letterSpacing: '0.3em', color: DIMW, marginTop: 10 }}>德国数学家 迪特里希·布雷斯 · 1968</div>
      </div>,
    );
    // the city HUD
    const ho = win(T, b(107.4), CITY_OUT, 0.5, 0.4);
    if (ho > 0) {
      ov.push(<Hud key="h1" x={1860} y={120} o={ho} align="right" color={WHITE} size={24}>BOSTON · 88 路口 · 246 段</Hud>);
      ov.push(<Hud key="h2" x={1860} y={160} o={ho * 0.9} align="right" size={18}>哈佛广场 → 波士顿公园 · 每小时 10,000 辆</Hud>);
      ov.push(<Hud key="h3" x={1860} y={214} o={win(T, b(112.8), CITY_OUT, 0.4, 0.4)} align="right" color={RED} size={22}>- - - 封掉任一段，均衡时延误下降</Hud>);
      ov.push(<Hud key="h4" x={1860} y={262} o={win(T, b(118.5), CITY_OUT, 0.4, 0.4)} align="right" color={AMBER} size={24}>LONDON 7 · NEW YORK 12</Hud>);
      const cut = easeOut(prog(T, b(115.2), b(115.8)));
      const [ex, ey] = (() => { const [i, j] = CITY.edges[CITY.cutEdge]; const m: V3 = [(CITY.nodes[i][0] + CITY.nodes[j][0]) / 2, 0, (CITY.nodes[i][2] + CITY.nodes[j][2]) / 2]; return anchor(pr, m); })();
      if (cut > 0) ov.push(<div key="cx" style={{ position: 'absolute', left: ex, top: ey, transform: 'translate(-50%,-50%)', opacity: cut * (1 - prog(T, b(123), CITY_OUT)), fontFamily: SANS, fontWeight: 300, fontSize: 64, color: RED, textShadow: '0 0 18px rgba(255,75,58,0.9)' }}>×</div>);
    }
  } else {
    // end: the route clock falls back from 80 to 65 as the shortcut goes dark
    const eo = win(T, b(176), CARD9 + 0.3, 0.6, 0.5);
    if (eo > 0) ov.push(
      <div key="ec" style={{ position: 'absolute', right: 120, top: 300, opacity: eo, textAlign: 'right' }}>
        <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 22, letterSpacing: '0.3em', color: DIMW }}>到 家</div>
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: 150, lineHeight: 1.05, color: s.u > 0.5 ? '#ffd2c2' : '#e6f7ff', textShadow: `0 0 40px rgba(${s.u > 0.5 ? '255,80,50' : '120,210,255'},0.6)` }}>{Math.round(65 + 15 * s.u)}<span style={{ fontSize: 40, marginLeft: 10 }}>分钟</span></div>
      </div>,
    );
  }
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Canvas9 T={T} draw={draw} />
      {ov}
    </AbsoluteFill>
  );
};

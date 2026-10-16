/* 《生命平等吗？》 art-direction looks: three styles × two moments (cold open; a dialogue with avatars + speech bubbles).
   Frame 0/1 = A 手作纸牌, 2/3 = B 水彩绘本, 4/5 = C 暖夜粉笔. Everything is drawn in code. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import { Canvas } from './kit';

type G = CanvasRenderingContext2D;
const W = 1920, H = 1080;
let seed = 1;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rs = (s: number) => { seed = s; };
const BRUSH = '"Ma Shan Zheng", serif', SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';

/* ---------------------------------------------------------------- drawing helpers */
/** a hand-drawn line through points: jittered, drawn twice for a pencil feel */
const hand = (g: G, pts: [number, number][], col: string, w: number, j = 1.6, passes = 2, close = false) => {
  for (let p = 0; p < passes; p++) {
    g.beginPath();
    pts.forEach(([x, y], i) => { const xx = x + (rand() - 0.5) * j, yy = y + (rand() - 0.5) * j; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); });
    if (close) g.closePath();
    g.strokeStyle = col; g.lineWidth = w * (p ? 0.6 : 1); g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = p ? 0.5 : 1; g.stroke(); g.globalAlpha = 1;
  }
};
const ell = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = Math.PI * 2, n = 48): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const bez = (p0: number[], p1: number[], p2: number[], p3: number[], n = 24): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
const fillPts = (g: G, pts: [number, number][], col: string, a = 1) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.globalAlpha = a; g.fillStyle = col; g.fill(); g.globalAlpha = 1; };
/** soft watercolour blot: many low-alpha jittered blobs */
const wash = (g: G, cx: number, cy: number, rx: number, ry: number, col: string, a = 0.08, n = 14) => {
  for (let i = 0; i < n; i++) {
    const pts: [number, number][] = ell(cx + (rand() - 0.5) * rx * 0.25, cy + (rand() - 0.5) * ry * 0.25, rx * (0.75 + rand() * 0.3), ry * (0.75 + rand() * 0.3), 0, Math.PI * 2, 40).map(([x, y]) => [x + (rand() - 0.5) * rx * 0.12, y + (rand() - 0.5) * ry * 0.12]);
    fillPts(g, pts, col, a);
  }
};
const paper = (g: G, base: string, fleck: string, n = 9000) => {
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let i = 0; i < n; i++) { g.globalAlpha = rand() * 0.07; g.fillStyle = fleck; g.fillRect(rand() * W, rand() * H, 1 + rand() * 2, 1 + rand() * 2); }
  for (let i = 0; i < 260; i++) { const x = rand() * W, y = rand() * H, a = rand() * Math.PI; g.globalAlpha = 0.05; g.strokeStyle = fleck; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
  g.globalAlpha = 1;
  const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,40,20,.22)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
};
/** a torn / hand-cut card */
const card = (g: G, x: number, y: number, w: number, h: number, rot: number, col: string, shadow = 'rgba(60,40,20,.25)') => {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number) => { for (let i = 0; i < 24; i++) { const t = i / 24; pts.push([x0 + (x1 - x0) * t + (rand() - 0.5) * 3, y0 + (y1 - y0) * t + (rand() - 0.5) * 3]); } };
  edge(-w / 2, -h / 2, w / 2, -h / 2); edge(w / 2, -h / 2, w / 2, h / 2); edge(w / 2, h / 2, -w / 2, h / 2); edge(-w / 2, h / 2, -w / 2, -h / 2);
  g.save(); g.translate(6, 10); g.filter = 'blur(8px)'; fillPts(g, pts, shadow); g.restore(); g.filter = 'none';
  fillPts(g, pts, col);
  g.restore();
};
const tape = (g: G, x: number, y: number, w: number, rot: number, col = 'rgba(214,190,140,.75)') => {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; g.beginPath(); g.moveTo(-w / 2, -16); for (let i = 0; i <= 6; i++) g.lineTo(-w / 2 + w * i / 6, -16 + (i % 2 ? 2 : -2)); g.lineTo(w / 2, 16); for (let i = 6; i >= 0; i--) g.lineTo(-w / 2 + w * i / 6, 16 + (i % 2 ? 2 : -2)); g.closePath(); g.fill(); g.restore();
};

/* ---------------------------------------------------------------- subjects */
const cat = (g: G, x: number, y: number, s: number, ink: string, fill: string | null, w = 3) => {
  // a sitting cat, seen from behind-side
  const P = (px: number, py: number): [number, number] => [x + px * s, y + py * s];
  const body = [...bez([-40, 0], [-62, -40], [-40, -95], [-6, -100]), ...bez([-6, -100], [30, -104], [52, -50], [44, 0])].map(([a, b]) => P(a, b));
  const head: [number, number][] = [...bez([-30, -96], [-34, -130], [-26, -146], [-22, -150]), [P(-22, -150)[0] - x, 0] as any].slice(0, 0);
  void head;
  const h0 = [P(-30, -98), P(-34, -126), P(-30, -152), P(-18, -140), P(-2, -142), P(10, -156), P(16, -128), P(12, -100)];
  if (fill) { fillPts(g, [...body, P(-40, 0)], fill); fillPts(g, h0, fill); }
  hand(g, [...body, P(-40, 0)], ink, w); hand(g, h0, ink, w, 1.6, 2, true);
  hand(g, bez([44, -6], [96, -6], [100, -50], [76, -62]).map(([a, b]) => P(a, b)), ink, w); // tail
};
const lamp = (g: G, x: number, y: number, h: number, ink: string, w = 3) => {
  hand(g, [[x, y], [x, y - h]], ink, w);
  hand(g, bez([x, y - h], [x, y - h - 40], [x + 60, y - h - 40], [x + 70, y - h - 10]), ink, w);
  hand(g, [[x + 50, y - h - 10], [x + 90, y - h - 10], [x + 80, y - h + 6], [x + 60, y - h + 6], [x + 50, y - h - 10]], ink, w);
};
const fish = (g: G, x: number, y: number, s: number, dir: number, ink: string, fill: string | null, w = 2.5) => {
  const P = (px: number, py: number): [number, number] => [x + px * s * dir, y + py * s];
  const b = [...bez([-40, 0], [-20, -22], [20, -18], [34, 0]), ...bez([34, 0], [20, 18], [-20, 22], [-40, 0])].map(([a, c]) => P(a, c));
  if (fill) fillPts(g, b, fill, 0.85);
  hand(g, b, ink, w); hand(g, [P(-40, 0), P(-58, -14), P(-56, 14), P(-40, 0)], ink, w);
  g.fillStyle = ink; g.beginPath(); g.arc(...P(22, -4), 2.6 * s, 0, 7); g.fill();
};
/** a stylised portrait in a round frame. kind: zhuang (topknot, long beard) | hui (scholar's cap, short beard) */
const avatar = (g: G, cx: number, cy: number, r: number, kind: 'zhuang' | 'hui', ink: string, bg: string, skin: string, ring: string, w = 3) => {
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = bg; g.fill(); g.clip();
  const s = r / 100, P = (px: number, py: number): [number, number] => [cx + px * s, cy + py * s];
  // robe
  fillPts(g, [P(-90, 110), P(-70, 60), P(-30, 40), P(30, 40), P(70, 60), P(90, 110)], kind === 'zhuang' ? '#8a9a86' : '#a88866', 0.9);
  hand(g, [P(-30, 40), P(0, 80), P(30, 40)], ink, w);
  // face
  const face = ell(cx, cy - 8 * s, 34 * s, 42 * s);
  fillPts(g, face, skin); hand(g, face, ink, w, 1.4, 2, true);
  if (kind === 'zhuang') {
    fillPts(g, ell(cx, cy - 62 * s, 18 * s, 14 * s), ink); hand(g, [P(-30, -64), P(30, -60)], ink, w); // topknot + pin
    fillPts(g, [...bez([-26, 18], [-20, 70], [20, 70], [26, 18]).map(([a, b]) => P(a, b))], '#ece6da'); hand(g, bez([-26, 18], [-20, 72], [20, 72], [26, 18]).map(([a, b]) => P(a, b)), ink, w * 0.8);
    fillPts(g, [...bez([-34, -18], [-30, -54], [30, -54], [34, -18]).map(([a, b]) => P(a, b)), P(30, -30), P(-30, -30)], ink, 0.85);
  } else {
    fillPts(g, [P(-38, -36), P(-30, -78), P(30, -78), P(38, -36)], '#3b3530'); hand(g, [P(-46, -36), P(46, -36)], ink, w);
    fillPts(g, bez([-14, 24], [-10, 44], [10, 44], [14, 24]).map(([a, b]) => P(a, b)), '#4a423b', 0.9);
  }
  // eyes (closed, gentle) + brows
  hand(g, bez([-20, -10], [-16, -6], [-10, -6], [-6, -10]).map(([a, b]) => P(a, b)), ink, w * 0.8);
  hand(g, bez([6, -10], [10, -6], [16, -6], [20, -10]).map(([a, b]) => P(a, b)), ink, w * 0.8);
  g.restore();
  hand(g, ell(cx, cy, r, r, 0, Math.PI * 2, 72), ring, w * 1.3, 1.2, 2, true);
};
/** speech bubble; a short wide tail on the side facing the speaker (side -1 = left, 1 = right) */
const bubble = (g: G, x: number, y: number, w: number, h: number, side: number, fill: string, ink: string, lw = 3) => {
  const r = Math.min(40, h / 2), pts: [number, number][] = [];
  const rr = (cx: number, cy: number, a0: number) => ell(cx, cy, r, r, a0, a0 + Math.PI / 2, 10);
  const ty = y + h * 0.62;
  pts.push(...rr(x + w - r, y + r, -Math.PI / 2));
  if (side > 0) pts.push([x + w, ty - 22], [x + w + 46, ty + 18], [x + w, ty + 14]);
  pts.push(...rr(x + w - r, y + h - r, 0), ...rr(x + r, y + h - r, Math.PI / 2));
  if (side < 0) pts.push([x, ty + 14], [x - 46, ty + 18], [x, ty - 22]);
  pts.push(...rr(x + r, y + r, Math.PI));
  fillPts(g, pts, fill); hand(g, pts, ink, lw, 1.4, 2, true);
};

/* ---------------------------------------------------------------- the six frames */
const draw = (g: G, f: number) => {
  rs(7 + f * 13);
  const look = Math.floor(f / 2), scene = f % 2;
  if (look === 0) {
    // A 手作纸牌: kraft desk, hand-cut cards, pencil + a little colour, brush lettering on paper tags
    paper(g, '#d9c6a5', '#5b4630');
    const INK = '#3a2f26';
    if (scene === 0) {
      card(g, 470, 150, 980, 640, -0.02, '#f4ecdc');
      g.save(); g.translate(960, 470); g.rotate(-0.02); g.translate(-960, -470);
      wash(g, 1000, 360, 230, 200, '#f3c56b', 0.06);
      hand(g, [[540, 680], [1380, 690]], INK, 3); hand(g, [[600, 720], [700, 718]], INK, 2); hand(g, [[820, 726], [960, 724]], INK, 2); hand(g, [[1080, 722], [1220, 724]], INK, 2);
      lamp(g, 900, 690, 400, INK); wash(g, 1010, 700, 180, 30, '#f3c56b', 0.07, 8);
      cat(g, 1060, 686, 0.95, INK, '#c9b8a0');
      g.restore();
      tape(g, 520, 170, 170, -0.5); tape(g, 1400, 170, 170, 0.45);
      // hanging paper tag
      card(g, 1330, 640, 300, 170, 0.08, '#f8f2e6');
      hand(g, [[1480, 640], [1460, 560]], INK, 2);
    } else {
      // bridge over water, two portrait cards, cut-paper bubbles
      card(g, 260, 560, 1400, 300, 0.01, '#e9f0ec');
      wash(g, 960, 720, 600, 90, '#7fb0b2', 0.05);
      hand(g, bez([300, 600], [700, 470], [1220, 470], [1620, 600]), INK, 4); hand(g, bez([300, 640], [700, 510], [1220, 510], [1620, 640]), INK, 3);
      for (let i = 0; i < 9; i++) hand(g, [[420 + i * 135, 600 - Math.sin(i / 8 * Math.PI) * 108], [420 + i * 135, 548 - Math.sin(i / 8 * Math.PI) * 108]], INK, 2.5);
      fish(g, 760, 760, 1.2, 1, INK, '#e98f6b'); fish(g, 1000, 800, 1.0, -1, INK, '#e98f6b'); fish(g, 1180, 744, 0.9, 1, INK, '#e9b16b');
      for (const [x, y] of [[700, 790], [1100, 770], [890, 740]]) hand(g, ell(x, y, 26, 6), '#5d8f92', 2);
      card(g, 250, 160, 270, 270, -0.06, '#f6efe1'); avatar(g, 385, 290, 110, 'zhuang', INK, '#efe2c8', '#f2d9bd', INK);
      card(g, 1400, 160, 270, 270, 0.05, '#f6efe1'); avatar(g, 1535, 290, 110, 'hui', INK, '#e3e6dc', '#f2d9bd', INK);
      bubble(g, 560, 190, 400, 130, -1, '#fffaf0', INK);
      bubble(g, 960, 300, 470, 200, 1, '#fffaf0', INK);
      tape(g, 300, 170, 120, -0.6); tape(g, 1620, 170, 120, 0.6);
    }
  } else if (look === 1) {
    // B 水彩绘本: soft washes, rounded shapes, thin warm-brown line
    paper(g, '#f6f1e7', '#8a7a62', 6000);
    const INK = '#6b4f3a';
    if (scene === 0) {
      wash(g, 960, 300, 900, 260, '#a9c3cf', 0.05, 18); wash(g, 1200, 380, 260, 200, '#f6c97a', 0.07);
      wash(g, 960, 760, 1000, 120, '#b9c6a6', 0.06, 16);
      hand(g, bez([200, 740], [700, 700], [1200, 720], [1720, 700]), INK, 2.5);
      lamp(g, 1080, 730, 430, INK, 2.5);
      wash(g, 1180, 735, 150, 26, '#f6c97a', 0.1, 8);
      cat(g, 1200, 730, 1.0, INK, '#d8b48f', 2.5);
      for (const [x, y, c] of [[420, 690, '#e7a7a0'], [470, 700, '#f1cf8b'], [1560, 690, '#e7a7a0']] as const) { wash(g, x, y, 22, 22, c, 0.2, 6); }
    } else {
      wash(g, 960, 300, 1000, 260, '#cfe0dd', 0.05, 16); wash(g, 960, 780, 900, 150, '#8fbcc0', 0.07, 18);
      hand(g, bez([260, 640], [700, 520], [1220, 520], [1660, 640]), INK, 3);
      wash(g, 960, 600, 700, 40, '#c7a882', 0.06, 8);
      fish(g, 760, 800, 1.2, 1, INK, '#f0a27e', 2); fish(g, 1020, 840, 1.0, -1, INK, '#f0a27e', 2); fish(g, 1200, 790, 0.9, 1, INK, '#f3c27e', 2);
      wash(g, 380, 300, 170, 170, '#f3d7b0', 0.08, 10); avatar(g, 380, 300, 120, 'zhuang', INK, '#f7ead4', '#f6dcc4', '#c99a6b', 2.5);
      wash(g, 1540, 300, 170, 170, '#cfdccb', 0.08, 10); avatar(g, 1540, 300, 120, 'hui', INK, '#e8efe2', '#f6dcc4', '#8ea58b', 2.5);
      bubble(g, 560, 190, 400, 130, -1, 'rgba(255,253,247,.92)', INK, 2.5);
      bubble(g, 960, 300, 470, 200, 1, 'rgba(255,253,247,.92)', INK, 2.5);
    }
  } else {
    // C 暖夜粉笔: dark blue-black, chalk lines, one warm lamp light; hand signs as chalkboard tags
    g.fillStyle = '#141820'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 7000; i++) { g.globalAlpha = rand() * 0.05; g.fillStyle = '#ffffff'; g.fillRect(rand() * W, rand() * H, 1.5, 1.5); } g.globalAlpha = 1;
    const CH = 'rgba(240,234,220,.9)';
    if (scene === 0) {
      const gr = g.createRadialGradient(1000, 560, 0, 1000, 560, 520); gr.addColorStop(0, 'rgba(255,196,110,.32)'); gr.addColorStop(1, 'rgba(255,196,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      hand(g, [[240, 760], [1680, 770]], CH, 3, 2.2, 3); lamp(g, 900, 760, 460, CH);
      cat(g, 1060, 754, 1.05, CH, null, 3);
    } else {
      wash(g, 960, 780, 800, 120, '#3c6b78', 0.06, 14);
      hand(g, bez([260, 640], [700, 520], [1220, 520], [1660, 640]), CH, 3, 2.2, 3);
      for (let i = 0; i < 9; i++) hand(g, [[400 + i * 140, 640 - Math.sin(i / 8 * Math.PI) * 108], [400 + i * 140, 588 - Math.sin(i / 8 * Math.PI) * 108]], CH, 2.5, 2.2, 3);
      fish(g, 760, 800, 1.2, 1, CH, null); fish(g, 1020, 840, 1.0, -1, CH, null); fish(g, 1200, 790, 0.9, 1, 'rgba(255,200,120,.95)', null);
      avatar(g, 380, 300, 120, 'zhuang', '#1b1f27', '#2a303b', '#e9dccb', CH);
      avatar(g, 1540, 300, 120, 'hui', '#1b1f27', '#2a303b', '#e9dccb', CH);
      bubble(g, 560, 190, 400, 130, -1, 'rgba(250,246,236,.95)', '#1b1f27');
      bubble(g, 960, 300, 470, 200, 1, 'rgba(250,246,236,.95)', '#1b1f27');
    }
  }
};

const T: React.FC<{ x: number; y: number; s: string; size: number; col: string; font?: string; rot?: number; w?: number; align?: 'left' | 'center' }> = ({ x, y, s, size, col, font = BRUSH, rot = 0, w = 600, align = 'center' }) => (
  <div style={{ position: 'absolute', left: x - (align === 'center' ? w / 2 : 0), top: y, width: w, textAlign: align, fontFamily: font, fontSize: size, color: col, transform: `rotate(${rot}rad)`, lineHeight: 1.25, whiteSpace: 'pre' }}>{s}</div>
);
const Sub: React.FC<{ s: string; dark?: boolean }> = ({ s, dark }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: '0.04em', color: dark ? '#3a2f26' : '#f3ede2', textShadow: dark ? '0 0 10px rgba(255,250,240,.9)' : '0 0 3px #000, 0 2px 14px rgba(0,0,0,.9)' }}>{s}</div>
);
const Tag: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: 'rgba(120,100,80,.85)', background: 'rgba(255,255,255,.55)', padding: '6px 14px', borderRadius: 6 }}>{s}</div>
);

export const Looks: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(['40px "Ma Shan Zheng"', '700 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, '一条命庄子惠鱼真快乐非安知之乐？。路边猫被车撞了很多人会难过整天手作纸牌水彩绘本暖夜粉笔ABC').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const look = Math.floor(f / 2), scene = f % 2;
  const dark = look < 2, INK = look === 0 ? '#3a2f26' : look === 1 ? '#6b4f3a' : '#1b1f27';
  const tagName = ['A · 手作纸牌', 'B · 水彩绘本', 'C · 暖夜粉笔'][look];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {ok && <>
        <Canvas dep={f} draw={(g) => draw(g, f)} />
        <Tag s={tagName} />
        {scene === 0 && <>
          {look === 0 && <T x={1480} y={672} s={'一条命'} size={78} col={INK} rot={0.08} />}
          {look === 1 && <T x={960} y={150} s={'一条命'} size={92} col={'#8a5a3a'} />}
          {look === 2 && <T x={1480} y={300} s={'一条命'} size={92} col={'rgba(255,214,150,.95)'} rot={-0.04} />}
          <Sub s="路边一只猫被车撞了" dark={dark} />
        </>}
        {scene === 1 && <>
          <T x={385} y={look === 0 ? 420 : 432} s="庄子" size={50} col={look === 2 ? '#f0e6d6' : INK} />
          <T x={look === 0 ? 1535 : 1540} y={look === 0 ? 420 : 432} s="惠子" size={50} col={look === 2 ? '#f0e6d6' : INK} />
          <T x={760} y={214} s="鱼真快乐。" size={62} col={INK} w={400} />
          <T x={1195} y={326} s={'子非鱼，\n安知鱼之乐？'} size={56} col={INK} w={470} />
          <Sub s="惠子问：你不是鱼，怎么知道鱼快乐" dark={dark} />
        </>}
      </>}
    </AbsoluteFill>
  );
};

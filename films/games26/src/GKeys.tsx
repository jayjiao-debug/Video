/* 《是菜还是非？》 key frames. Look: the light language the owner liked (gold particles on black) + a skill→luck
   spectrum (cool blue → magenta). Every game is a constellation drawn in light. One composition frame per key. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, W, H, LNUM, FontFaces, FONT_LOADS, Grade, Grain, Bars, glowDot, rnd, clamp, lerp } from './kit';
import { Light, Lbl, bg, trail, sparks, textPts, particleText, camT, GOLD, WHITE, BLUE, MAG, RED, P } from './lightkit';

/* ---------------------------------------------------------------- the spectrum colour */
const mix = (a: string, b: string, k: number) => { const A = a.split(',').map(Number), B = b.split(',').map(Number); return A.map((v, i) => Math.round(lerp(v, B[i], k))).join(','); };
const specCol = (u: number) => mix(BLUE, MAG, clamp(u));
const SX0 = 200, SX1 = 1720;
const spectrum = (g: CanvasRenderingContext2D, y: number, a = 1, fifty = 0) => {
  for (let x = SX0; x <= SX1; x += 3) { const u = (x - SX0) / (SX1 - SX0); g.fillStyle = `rgba(${specCol(u)},${0.55 * a})`; g.fillRect(x, y - 3, 3, 6); }
  for (let x = SX0; x <= SX1; x += 24) { const u = (x - SX0) / (SX1 - SX0); glowDot(g, x, y, 26, 0.08 * a, specCol(u)); }
  glowDot(g, SX0, y, 40, 0.6 * a, BLUE); glowDot(g, SX1, y, 40, 0.6 * a, MAG);
  if (fifty > 0) { const x = (SX0 + SX1) / 2; g.fillStyle = `rgba(${GOLD},${fifty})`; g.fillRect(x - 1.5, y - 90, 3, 180); glowDot(g, x, y, 120, 0.35 * fifty); }
};

/* ---------------------------------------------------------------- game glyphs in light */
const rectStroke = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, a = 1, lw = 1.4) => { g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = lw; g.strokeRect(x, y, w, h); };
const chess = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number, col: string, a = 1) => {
  const c = s / 8;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { g.fillStyle = `rgba(${col},${0.12 * a})`; g.fillRect(cx - s / 2 + i * c, cy - s / 2 + j * c, c, c); }
  rectStroke(g, cx - s / 2, cy - s / 2, s, s, col, 0.8 * a);
  g.font = `${c * 0.9}px "DejaVu Sans"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgba(${WHITE},${0.9 * a})`;
  [['♔', 4, 7], ['♕', 3, 7], ['♚', 4, 0], ['♞', 6, 2], ['♙', 3, 4], ['♟', 4, 3]].forEach(([p, i, j]) => g.fillText(p as string, cx - s / 2 + ((i as number) + 0.5) * c, cy - s / 2 + ((j as number) + 0.5) * c));
};
const go = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number, col: string, a = 1, n = 19, stones = 40) => {
  const c = s / (n - 1);
  g.strokeStyle = `rgba(${col},${0.35 * a})`; g.lineWidth = 0.8;
  for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(cx - s / 2 + i * c, cy - s / 2); g.lineTo(cx - s / 2 + i * c, cy + s / 2); g.stroke(); g.beginPath(); g.moveTo(cx - s / 2, cy - s / 2 + i * c); g.lineTo(cx + s / 2, cy - s / 2 + i * c); g.stroke(); }
  for (let k = 0; k < stones; k++) { const i = Math.floor(rnd(k, 1) * n), j = Math.floor(rnd(k, 2) * n), x = cx - s / 2 + i * c, y = cy - s / 2 + j * c; if (k % 2) glowDot(g, x, y, Math.min(c * 0.9, 16), 0.9 * a, WHITE); else { g.strokeStyle = `rgba(${col},${a})`; g.beginPath(); g.arc(x, y, c * 0.4, 0, 6.3); g.stroke(); } }
};
const tile = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ch: string, col: string, lit: number) => {
  g.strokeStyle = `rgba(${col},${0.25 + 0.7 * lit})`; g.lineWidth = 1.2; g.beginPath(); (g as any).roundRect(x, y, w, h, w * 0.14); g.stroke();
  if (lit > 0.05) { g.fillStyle = `rgba(${col},${0.08 * lit})`; g.fill(); g.font = `700 ${h * 0.55}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgba(${WHITE},${lit})`; g.fillText(ch, x + w / 2, y + h / 2 + 2); glowDot(g, x + w / 2, y + h / 2, w * 1.4, 0.25 * lit, col); }
};
const card = (g: CanvasRenderingContext2D, x: number, y: number, w: number, s: string, col: string, a = 1, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  const h = w * 1.4; g.strokeStyle = `rgba(${col},${0.9 * a})`; g.lineWidth = 1.6; g.beginPath(); (g as any).roundRect(-w / 2, -h / 2, w, h, w * 0.1); g.stroke();
  g.fillStyle = `rgba(${col},${0.08 * a})`; g.fill();
  g.font = `700 ${w * 0.5}px "DejaVu Sans"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgba(${WHITE},${a})`; g.fillText(s, 0, 0);
  g.restore(); glowDot(g, x, y, w * 1.5, 0.15 * a, col);
};
const die = (g: CanvasRenderingContext2D, x: number, y: number, s: number, n: number, col: string, a = 1) => {
  g.strokeStyle = `rgba(${col},${0.9 * a})`; g.lineWidth = 1.6; g.beginPath(); (g as any).roundRect(x - s / 2, y - s / 2, s, s, s * 0.18); g.stroke();
  const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] } as any;
  P[n].forEach(([i, j]: number[]) => glowDot(g, x + i * s * 0.26, y + j * s * 0.26, s * 0.12, 0.95 * a, WHITE));
};
const coin = (g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1, squash = 1) => {
  g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, r, r * squash, 0, 0, 6.3); g.stroke();
  g.strokeStyle = `rgba(${col},${0.5 * a})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r * 0.78, r * 0.78 * squash, 0, 0, 6.3); g.stroke();
  glowDot(g, x, y, r * 2.2, 0.3 * a, col);
};
const hexGrid = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number, cols: number, rows: number, col: string, a = 1) => {
  const pts: P[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = cx + (i - cols / 2) * r * 1.75 + (j % 2) * r * 0.875, y = cy + (j - rows / 2) * r * 1.52;
    g.strokeStyle = `rgba(${col},${0.35 * a})`; g.lineWidth = 1.2; g.beginPath();
    for (let k = 0; k <= 6; k++) { const t = (k / 6) * 6.283 + Math.PI / 6; const px = x + Math.cos(t) * r * 0.95, py = y + Math.sin(t) * r * 0.95 * 0.62; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
    g.stroke(); pts.push([x, y]);
  }
  return pts;
};

/* ---------------------------------------------------------------- frame chrome */
const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontFamily: F.sans, fontWeight: 500, fontSize: 50, letterSpacing: '0.05em', color: C.cream, ...LNUM }}>
    {s.split(/(\[[^\]]+\])/).map((x, j) => x.startsWith('[') ? <span key={j} style={{ color: C.goldHi }}>{x.slice(1, -1)}</span> : <span key={j}>{x}</span>)}
  </div>
);
const Frame: React.FC<{ f: number; T: number; draw: (g: CanvasRenderingContext2D) => void; sub?: string; children?: React.ReactNode; mark?: boolean }> = ({ f, T, draw, sub, children, mark = true }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Light f={f} draw={draw}>{children}</Light>
    <Grade warm={0.02} />
    <Grain T={T} />
    <Bars />
    {mark && <div style={{ position: 'absolute', right: 56, top: 36, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.45)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>}
    {sub && <Sub s={sub} />}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- the keys */
const K1: React.FC<{ f: number }> = ({ f }) => { const T = 1.2; return (
  <Frame f={f} T={T} sub="金铲铲连输三把：是你[菜]，还是你[非]？" draw={(g) => {
    bg(g, T); g.save(); camT(g, 1.05, 960, 600);
    const pts = hexGrid(g, 900, 640, 92, 7, 4, MAG, 0.9);
    pts.forEach(([x, y], i) => { if (rnd(i, 3) < 0.45) { const a = 0.4 + 0.6 * rnd(i, 4); glowDot(g, x, y - 10, 34, 0.35 * a, i % 3 ? MAG : BLUE); glowDot(g, x, y - 10, 7, a, WHITE); } });
    // pieces shattering on defeat
    [[560, 560], [900, 680], [1260, 600]].forEach(([x, y], k) => { for (let i = 0; i < 80; i++) { const a = rnd(i, k + 9) * 6.283, d = 30 + 160 * rnd(i, k + 11); g.fillStyle = `rgba(${MAG},${0.7 * (1 - d / 200)})`; g.fillRect(x + Math.cos(a) * d, y - 10 + Math.sin(a) * d * 0.6 - 40 * rnd(i, 7), 2, 2); } glowDot(g, x, y, 90, 0.3, RED); });
    g.restore();
  }}>
    <div style={{ position: 'absolute', right: 140, top: 170, textAlign: 'right' }}>
      <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 96, color: '#ff8fbf', textShadow: '0 0 30px rgba(255,110,200,.8), 0 0 80px rgba(255,110,200,.4)' }}>第 8 名</div>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.3em', color: C.dim, marginTop: 6 }}>× 3 连败</div>
    </div>
  </Frame>
); };

const GAMES: { u: number; name: string; draw: (g: CanvasRenderingContext2D, x: number, y: number) => void }[] = [
  { u: 0.03, name: '围棋', draw: (g, x, y) => go(g, x, y, 90, specCol(0.02), 1, 9, 14) },
  { u: 0.14, name: '国际象棋', draw: (g, x, y) => chess(g, x, y, 92, specCol(0.1)) },
  { u: 0.42, name: '金铲铲', draw: (g, x, y) => { const p = hexGrid(g, x, y, 18, 3, 3, specCol(0.42)); p.forEach(([a, b], i) => i % 2 || glowDot(g, a, b, 6, 0.9, WHITE)); } },
  { u: 0.6, name: '麻将', draw: (g, x, y) => { ['中', '发', '萬'].forEach((ch, i) => tile(g, x - 54 + i * 38, y - 26, 34, 50, ch, specCol(0.6), 1)); } },
  { u: 0.7, name: '德州扑克', draw: (g, x, y) => { card(g, x - 18, y, 48, 'A♠', specCol(0.7), 1, -0.15); card(g, x + 18, y, 48, 'K♥', specCol(0.7), 1, 0.12); } },
  { u: 0.86, name: '飞行棋', draw: (g, x, y) => die(g, x, y, 64, 5, specCol(0.86)) },
  { u: 0.98, name: '掷硬币', draw: (g, x, y) => coin(g, x, y, 34, specCol(0.98), 1, 0.85) },
];
const K2: React.FC<{ f: number }> = ({ f }) => { const T = 3; return (
  <Frame f={f} T={T} sub="把游戏排成一条线：左边全靠[实力]，右边全靠[运气]" draw={(g) => {
    bg(g, T); spectrum(g, 640, 1);
    GAMES.forEach((gm, gi) => { const x = lerp(SX0, SX1, gm.u), gy = gi % 2 ? 270 : 450; g.save(); g.translate(x, gy); g.scale(1.6, 1.6); g.translate(-x, -gy); gm.draw(g, x, gy); g.restore(); g.strokeStyle = `rgba(${specCol(gm.u)},.5)`; g.lineWidth = 1; g.setLineDash([3, 6]); g.beginPath(); g.moveTo(x, gy + 80); g.lineTo(x, 628); g.stroke(); g.setLineDash([]); glowDot(g, x, 640, 22, 0.9, specCol(gm.u)); });
  }}>
    {GAMES.map((gm) => <Lbl key={gm.name} x={lerp(SX0, SX1, gm.u)} y={680} s={gm.name} size={30} col="#f3ede2" anchor="center" />)}
    <Lbl x={SX0} y={760} s="◀ 全靠实力" size={28} col="#9cc8ff" />
    <Lbl x={SX1} y={760} s="全靠运气 ▶" size={28} col="#ff9ed6" anchor="right" />
  </Frame>
); };

const K3: React.FC<{ f: number }> = ({ f }) => { const T = 16.62; return (
  <Frame f={f} T={T} mark={false} draw={(g) => {
    bg(g, T, 0.7); spectrum(g, 700, 0.5);
    const pts = textPts('《是菜还是非？》', '900 140px "Noto Serif CJK SC"', 960, 500, 3);
    particleText(g, pts, T, 15.9, 16.6, GOLD, 21, 1100);
    sparks(g, 960, 500, 16.6, T, 160, GOLD, 3.2, 9); glowDot(g, 960, 500, 700, 0.12);
  }} />
); };

const K4: React.FC<{ f: number }> = ({ f }) => { const T = 34; return (
  <Frame f={f} T={T} sub="数学家证明过：国际象棋的结局，理论上[早就注定]" draw={(g) => {
    bg(g, T);
    chess(g, 960, 800, 260, specCol(0.1), 0.9);
    // the game tree: thousands of branches fanning out, then folding into three outcomes
    const root: P = [960, 650], outs: P[] = [[620, 230], [960, 200], [1300, 230]];
    for (let i = 0; i < 260; i++) {
      const o = outs[i % 3], mx = 960 + (rnd(i, 1) - 0.5) * 1400, my = 420 + (rnd(i, 2) - 0.5) * 180;
      const pts: P[] = []; for (let q = 0; q <= 20; q++) { const u = q / 20; const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; pts.push([a * root[0] + b * mx + c * o[0], a * root[1] + b * my + c * o[1]]); }
      g.strokeStyle = `rgba(${specCol(0.1)},${0.05 + 0.08 * rnd(i, 3)})`; g.lineWidth = 1; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    }
    glowDot(g, root[0], root[1], 60, 0.5, WHITE);
    outs.forEach(([x, y]) => { glowDot(g, x, y, 90, 0.35, GOLD); glowDot(g, x, y, 10, 1, WHITE); });
  }}>
    {['先手赢', '和棋', '后手赢'].map((s, i) => <Lbl key={s} x={[620, 960, 1300][i]} y={[150, 120, 150][i]} s={s} size={32} col={C.goldHi} anchor="center" />)}
    <Lbl x={960} y={250} s="？" size={48} col="#fff" anchor="center" />
  </Frame>
); };

const GO_N = '208168199381979984699478633344862770286522453884530548425639456820927419612738015378525648451698519643907259916015628128546089888314427129715319317557736620397247064840935';
const K5: React.FC<{ f: number }> = ({ f }) => { const T = 42; return (
  <Frame f={f} T={T} sub="只是算不完：围棋的局面数，有[171位]" draw={(g) => {
    bg(g, T); go(g, 960, 540, 760, specCol(0.02), 0.35, 19, 60);
    for (let i = 0; i < 600; i++) glowDot(g, rnd(i, 21) * W, rnd(i, 22) * H, 1.5 + 2 * rnd(i, 23), 0.5, WHITE);
  }}>
    <div style={{ position: 'absolute', left: 160, right: 160, top: 300, fontFamily: F.type, fontSize: 38, lineHeight: '58px', letterSpacing: '0.04em', color: '#cfe4ff', wordBreak: 'break-all', textShadow: '0 0 18px rgba(120,180,255,.8)', textAlign: 'center' }}>{GO_N}</div>
    <Lbl x={960} y={200} s="19×19 围棋 · 所有合法局面" size={30} col="#9cc8ff" anchor="center" />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 36, color: C.goldHi, textShadow: '0 0 18px rgba(255,214,140,.5)' }}>≈ 2.08 × 10<sup style={{ fontSize: 22 }}>170</sup>　·　宇宙里的原子 ≈ 10<sup style={{ fontSize: 22 }}>80</sup></div>
  </Frame>
); };

const K6: React.FC<{ f: number }> = ({ f }) => { const T = 72; return (
  <Frame f={f} T={T} sub="麻将更难：每一步，藏着超过[10⁴⁸]种可能" draw={(g) => {
    bg(g, T); g.save(); camT(g, 1.0);
    const CH = '一二三四五六七八九';
    for (let r = 0; r < 4; r++) for (let i = 0; i < 17; i++) { const x = 300 + i * 78 + (r % 2) * 10, y = 200 + r * 92; tile(g, x, y, 64, 84, CH[(i + r) % 9], specCol(0.6), rnd(i, r) < 0.08 ? 0.9 : 0.05); }
    for (let i = 0; i < 14; i++) tile(g, 420 + i * 78, 680, 66, 92, ['一', '二', '三', '五', '五', '中', '中', '中', '东', '南', '西', '北', '发', '白'][i], GOLD, 1);
    g.restore();
  }}>
    <Lbl x={960} y={120 + 0} s="136 张牌 · 你只看得见自己这 14 张" size={26} col="#ff9ed6" anchor="center" />
  </Frame>
); };

const K7: React.FC<{ f: number }> = ({ f }) => { const T = 82.2; return (
  <Frame f={f} T={T} sub="有人把[一半]国际象棋对局，换成掷硬币" draw={(g) => {
    bg(g, T); g.save(); camT(g, 1.0);
    const R = 2.0; // seconds after the drop: the shockwave radius
    for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) {
      const x = 320 + i * 160, y = 330 + r * 150, flip = (i + r) % 2 === 1, d = Math.hypot(x - 960, (y - 555) * 1.4);
      const k = clamp((R * 520 - d) / 120);
      if (flip && k > 0) { coin(g, x, y, 46, GOLD, k, lerp(0.15, 0.9, k)); if (k < 1) sparks(g, x, y, T - 0.2, T, 20, GOLD, 0.6, i * 7 + r); }
      else chess(g, x, y, 104, specCol(0.1), flip ? 1 - k : 0.8);
    }
    g.strokeStyle = `rgba(${GOLD},.35)`; g.lineWidth = 4; g.beginPath(); g.ellipse(960, 555, R * 520, R * 520 / 1.4, 0, 0, 6.3); g.stroke();
    spectrum(g, 175, 0.8, 1);
    g.restore();
  }}>
    <Lbl x={960} y={110} s="一半象棋 + 一半掷硬币 = 「一半运气」标准线" size={28} col={C.goldHi} anchor="center" />
  </Frame>
); };

const K8: React.FC<{ f: number }> = ({ f }) => { const T = 92; return (
  <Frame f={f} T={T} sub="结果：德州扑克，比这条线[还靠运气]" draw={(g) => {
    bg(g, T); spectrum(g, 470, 1, 1);
    const pts = [['围棋', 0.02], ['国际象棋', 0.1], ['标准线', 0.5], ['德州扑克', 0.66]] as [string, number][];
    pts.forEach(([n, u]) => { const x = lerp(SX0, SX1, u); if (n !== '标准线') { glowDot(g, x, 470, 60, 0.5, specCol(u)); glowDot(g, x, 470, 12, 1, WHITE); } });
    trail(g, [[lerp(SX0, SX1, 0.45), 470], [lerp(SX0, SX1, 0.66), 470]], MAG, 2.4, 1, true);
  }}>
    {[['围棋', 0.02], ['国际象棋', 0.1], ['德州扑克', 0.66]].map(([n, u]) => <Lbl key={n as string} x={lerp(SX0, SX1, u as number)} y={520} s={n as string} size={32} col="#f3ede2" anchor="center" />)}
    <Lbl x={960} y={350} s="50%" size={44} col={C.goldHi} anchor="center" />
    <div style={{ position: 'absolute', left: 260, top: 640, width: 1400, display: 'flex', justifyContent: 'space-around', fontFamily: F.serif, fontWeight: 700, color: C.cream }}>
      {[['国际象棋', '170+'], ['一半掷硬币的象棋', '45'], ['德州扑克', '< 30']].map(([a, b]) => (
        <div key={a} style={{ textAlign: 'center' }}><div style={{ fontFamily: F.lat, fontSize: 84, color: C.goldHi, textShadow: '0 0 24px rgba(255,214,140,.6)', ...LNUM }}>{b}</div><div style={{ fontSize: 26, color: C.dim }}>{a}</div></div>
      ))}
    </div>
    <Lbl x={960} y={860} s="评分的离散程度：越大 = 越靠实力 · 海德堡大学 2020" size={18} col={C.dim} serif={false} anchor="center" ls="0.2em" />
  </Frame>
); };

const K9: React.FC<{ f: number }> = ({ f }) => { const T = 100; return (
  <Frame f={f} T={T} sub="金铲铲在中间：刷卡看[运气]，运营看[实力]" draw={(g) => {
    bg(g, T);
    const cx = 960, cy = 500;
    for (let i = 0; i < 400; i++) { const a = rnd(i, 1) * 6.283, r = 140 * Math.sqrt(rnd(i, 2)); glowDot(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6, 4, 0.7, i % 4 ? specCol(0.42) : GOLD); }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * 6.283 - Math.PI / 2, px = cx + Math.cos(a) * 520, py = cy + Math.sin(a) * 300;
      const pts: P[] = []; for (let q = 0; q <= 16; q++) { const u = q / 16; pts.push([lerp(cx + Math.cos(a) * 150, px, u), lerp(cy + Math.sin(a) * 90, py, u) - Math.sin(u * Math.PI) * 30]); }
      trail(g, pts, k === 0 ? GOLD : specCol(0.42), k === 0 ? 2.4 : 1.4, k === 0 ? 1 : 0.6, true);
      glowDot(g, px, py, 50, 0.3, k === 0 ? GOLD : specCol(0.42)); glowDot(g, px, py, 10, 1, WHITE);
    }
  }}>
    <Lbl x={960} y={485} s="公共卡池" size={30} col="#fff" anchor="center" />
    <Lbl x={960} y={130} s="你" size={28} col={C.goldHi} anchor="center" />
    <Lbl x={960} y={840} s="8 个人抢同一个卡池 · 你刷到的，是别人没拿走的" size={24} col={C.dim} serif={false} anchor="center" />
  </Frame>
); };

const KEYS = [K1, K2, K3, K4, K5, K6, K7, K8, K9];
export const GKEY_COUNT = KEYS.length;
export const GKeys: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('gk-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '400 40px "DejaVu Sans"'].map((x) => document.fonts.load(x, '是菜还是非♔♠0123').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const K = KEYS[Math.min(KEYS.length - 1, f)];
  return <><FontFaces />{ok && <K f={f} />}</>;
};

/* 2万粉丝特别篇《你们的一万条评论》 v1 — cut to the owner's BGM (117.9 bpm; title 8.47, break 49.17, build 65.45, drop 82.24). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import CROPS from './crops.json';
import AN from './analysis.json';
import { W, H, FPS, G, SERIF, SANS, MONO, GOLD, INK, RED, clamp, ramp, eo, eio, back, lerp, rnd, setSeed, rr, txt, glow, sub, mark, room, roller, feedColumn, paperStrip, cassette, deck } from './lib';

export const LEN = 164.4;
const MUTED = 'rgba(243,237,226,.55)', NEUTRAL = 'rgba(243,237,226,.32)', COOL = '#8fb6ff', GRID = 'rgba(243,237,226,.10)';
const PLAY = 8.473, A_SIDE = 24.753, BRK = 49.172, B_SIDE = 52.733, BLD = 65.451, DROP = 82.239, AW = 127.515, AW0 = 130.059, BEAT = 0.509, END = 154.49, CARD = 158.0;
const AWARDS: [string, string][] = [['摇人王', '一条评论@了22个人'], ['人气王', '做售后的，听到微信电话心直接死了'], ['条件反射奖', '手机根本没有微信，心还是一紧'], ['行动派奖', '真的退出去，找是谁打的'],
  ['课堂社死奖', '普高偷玩手机时，铃声响了'], ['凌晨四点奖', '“你知道现在是凌晨4点半吗”'], ['唯一没被骗奖', '因为微信被封了'], ['最离谱跑题奖', '湘西赶尸']];
const AW_FILES = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a8', 'a9'];
const awT = (i: number) => AW0 + i * 6 * BEAT;

const LINES: [number, number, string][] = [
  [0.33, 3.40, '谢谢各位彦祖、亦菲'], [3.40, 5.95, '2万粉丝了'], [5.95, 8.40, '这期视频，是你们写的'],
  [12.53, 16.55, '上期《谁打来的？》，评论涨到了9666条'], [16.61, 20.62, '我把评论区慢慢滑完，一条条识别'], [20.68, 24.70, '去掉回复和重复：5841条'],
  [24.75, 28.55, '上期说：56%的年轻人觉得，突然来电多半没好事'], [28.55, 32.25, '评论区：近3成在说吓死、心慌、心里一紧'], [32.25, 35.25, '17%以为真有人给自己打电话'],
  [35.25, 38.95, '343条评论说：真的退出去，翻了微信'], [38.95, 41.45, '对不起，铃声是我放的'], [41.45, 44.85, '上期说：不接电话的头号理由，是怕诈骗'],
  [44.85, 47.05, '评论区提到诈骗的：26条'], [47.05, 49.10, '提到“妈”的：302条'], [49.17, 52.65, '你们怕的不是骗子，是妈'],
  [52.73, 55.90, 'B面：认真做点数据分析'], [55.90, 59.40, '评论最多的时间：晚上8点'], [59.40, 62.60, '凌晨0点，还有65条'], [62.60, 65.40, '最安静是早上6点：1条'],
  [65.45, 69.00, '评论最多的省：广东，833条'], [69.00, 72.60, '广东人话多？先看人口'], [72.60, 76.40, '人口越多，评论越多：相关系数0.92'],
  [76.40, 80.00, '但广东，比人口预测的多出252条'], [80.00, 82.15, '所以——'], [82.24, 85.50, '广东人，确实话多。'],
  [85.50, 89.00, '最惜字如金：山东，比预测少128条'], [89.00, 92.50, '不过，IP在广东，不一定是广东人'], [92.50, 95.50, '就像说：中国人占世界人口约17%'],
  [95.50, 98.50, '所以你生的孩子，有17%是中国人'], [98.50, 100.50, '听着有理，毫无道理'],
  [100.50, 104.00, '一条评论，平均只有11个字'], [104.00, 107.50, '5841条里，只有54条被点过赞'], [107.50, 111.00, '前10条，拿走了44%的赞'],
  [111.00, 114.50, '被赞的评论，长度是没被赞的两倍'], [114.50, 117.50, '但相关系数只有0.08：写长没太大用'],
  [117.50, 121.00, '说自己被吓到的人，只有4%会@朋友'], [121.00, 124.50, '@朋友的评论里，71%一个字都不说'], [124.50, 127.45, '被吓的不拉人，拉人的不说话'],
  [AW, AW0 - 0.06, '最后：评论区颁奖典礼'],
  ...AWARDS.map(([a, b], i) => [awT(i), awT(i + 1) - 0.06, `${a}：${b}`] as [number, number, string]),
  [END, CARD - 0.06, '下一期，你想让我分析什么？'],
];

type IMGS = { feed: HTMLImageElement[]; scare: HTMLImageElement[]; aw: HTMLImageElement[] };
const A = (T: number, a: number, b: number, fi = 0.3, fo = 0.3) => ramp(T, a, fi) * (1 - ramp(T, b - fo, fo));
const big = (g: G, s: string, x: number, y: number, size: number, col: string, a: number, sc = 1, f = SERIF) => { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc); txt(g, s, 0, 0, size, col, { f, glow: col === GOLD ? 'rgba(241,197,109,.5)' : col === RED ? 'rgba(226,72,61,.5)' : undefined }); g.restore(); };
const counterAt = (T: number) => {
  if (T < PLAY) return '0000';
  if (T < 16.61) return String(Math.floor((T - PLAY) * 457) % 10000).padStart(4, '0');
  const k = eio(ramp(T, 16.61, 20.683 - 16.61)); return String(Math.round(lerp(9666, 5841, k))).padStart(4, '0');
};
/* ---------------------------------------------------------------- charts */
const axes = (g: G, x0: number, y0: number, w: number, h: number, a: number) => { g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(243,237,226,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 + h); g.lineTo(x0 + w, y0 + h); g.stroke(); g.restore(); };
const hoursChart = (g: G, T: number, a: number) => {
  const d = AN.hours as number[], x0 = 260, y0 = 170, w = 1400, h = 560, mx = 180;
  const X = (i: number) => x0 + (i / 23) * w, Y = (v: number) => y0 + h - (v / mx) * h;
  g.save(); g.globalAlpha = a;
  for (const v of [50, 100, 150]) { g.strokeStyle = GRID; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x0 + w, Y(v)); g.stroke(); txt(g, String(v), x0 - 18, Y(v) + 9, 24, MUTED, { w: 500, a: 'right' }); }
  axes(g, x0, y0, w, h, 1);
  for (let i = 0; i < 24; i += 3) txt(g, `${i}点`, X(i), y0 + h + 44, 26, MUTED, { w: 500 });
  const p = eio(ramp(T, B_SIDE + 2.6, 2.4)), n = p * 23;
  g.beginPath(); for (let i = 0; i <= Math.floor(n); i++) { const v = d[i]; i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)); }
  if (n < 23) { const i = Math.floor(n), f = n - i; g.lineTo(lerp(X(i), X(i + 1), f), lerp(Y(d[i]), Y(d[i + 1]), f)); }
  const lineEnd = g.getTransform(); void lineEnd;
  g.strokeStyle = GOLD; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke();
  const pin = (i: number, s: string, t0: number, col: string) => { const k = ramp(T, t0, 0.3); if (k <= 0 || n < i) return; g.fillStyle = col; g.beginPath(); g.arc(X(i), Y(d[i]), 11 * k, 0, 7); g.fill(); g.strokeStyle = '#07060a'; g.lineWidth = 3; g.stroke(); txt(g, s, X(i), Y(d[i]) - 30, 34, INK, { w: 900, alpha: k }); };
  pin(20, '20点 · 165条', 55.9, GOLD); pin(0, '0点 · 65条', 59.4, GOLD); pin(6, '6点 · 1条', 62.6, GOLD);
  txt(g, '每小时评论数（北京时间，按有具体时刻的 1656 条）', x0 + w, y0 - 40, 28, MUTED, { w: 500, a: 'right' });
  g.restore();
};
const PTS = AN.prov_scatter.points as [string, number, number][];
const scatter = (g: G, T: number, a: number) => {
  const x0 = 330, y0 = 170, w = 1300, h = 580, X = (v: number) => x0 + (v / 130) * w, Y = (v: number) => y0 + h - (v / 900) * h;
  g.save(); g.globalAlpha = a;
  for (const v of [200, 400, 600, 800]) { g.strokeStyle = GRID; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x0 + w, Y(v)); g.stroke(); txt(g, String(v), x0 - 18, Y(v) + 9, 24, MUTED, { w: 500, a: 'right' }); }
  for (const v of [0, 25, 50, 75, 100, 125]) txt(g, `${v}`, X(v), y0 + h + 40, 24, MUTED, { w: 500 });
  axes(g, x0, y0, w, h, 1);
  txt(g, '人口（百万）→', x0 + w, y0 + h + 84, 28, MUTED, { w: 700, a: 'right' }); txt(g, '评论数 ↑', x0 + 20, y0 - 20, 28, MUTED, { w: 700, a: 'left' });
  const showAll = ramp(T, 69.0, 1.6);
  PTS.forEach(([p, pop, c], i) => {
    const isGD = p === '广东', isSD = p === '山东';
    const k = isGD ? ramp(T, 65.6, 0.4) : clamp((showAll * 31 - i) / 3);
    if (k <= 0) return;
    const col = isGD ? GOLD : isSD && T > 85.5 ? COOL : NEUTRAL;
    const r = (isGD ? 16 : 10) * (isGD && T > DROP ? 1 + 0.25 * Math.max(0, Math.sin((T - DROP) * Math.PI * 2 / BEAT)) * (1 - ramp(T, DROP + 3, 0.5)) : 1);
    g.fillStyle = col; g.beginPath(); g.arc(X(pop), Y(c), r * k, 0, 7); g.fill(); g.strokeStyle = '#0a0809'; g.lineWidth = 2; g.stroke();
    if (isGD) txt(g, '广东 833', X(pop) - 26, Y(c) + 10, 34, INK, { w: 900, a: 'right', alpha: k });
    if (isSD && T > 85.5) txt(g, '山东 333', X(pop) + 26, Y(c) + 40, 32, INK, { w: 900, a: 'left', alpha: ramp(T, 85.5, 0.3) });
    if (['河南', '江苏', '四川'].includes(p) && T > 70.5 && T < 76.4) txt(g, p, X(pop), Y(c) - 20, 24, MUTED, { w: 700, alpha: ramp(T, 70.5, 0.4) });
  });
  const lp = eio(ramp(T, 72.6, 1.2));
  if (lp > 0) { const s = AN.prov_scatter.slope as number, b = AN.prov_scatter.icpt as number, xa = 8, xb = lerp(8, 128, lp);
    g.setLineDash([16, 12]); g.strokeStyle = 'rgba(243,237,226,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(xa), Y(s * xa + b)); g.lineTo(X(xb), Y(s * xb + b)); g.stroke(); g.setLineDash([]);
    txt(g, 'r = 0.92', X(60), Y(s * 60 + b) - 60, 46, INK, { f: SERIF, alpha: ramp(T, 73.4, 0.4) });
    const res = (p: string, t0: number, col: string, lab: string, dx: number) => { const pt = PTS.find((q) => q[0] === p)!; const k = eio(ramp(T, t0, 0.8)); if (k <= 0) return;
      const yl = Y(s * pt[1] + b), yp = Y(pt[2]); g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.moveTo(X(pt[1]), yl); g.lineTo(X(pt[1]), lerp(yl, yp, k)); g.stroke();
      txt(g, lab, X(pt[1]) + dx, (yl + yp) / 2 + 14, 48, col === GOLD ? GOLD : COOL, { f: SERIF, a: dx > 0 ? 'left' : 'right', alpha: ramp(T, t0 + 0.5, 0.3) }); };
    res('广东', 76.4, GOLD, '+252', 34); if (T > 85.5) res('山东', 85.5, COOL, '−128', 34);
  }
  g.restore();
};
const worldPie = (g: G, T: number, a: number) => {
  const cx = 960, cy = 420, r = 230, k = eio(ramp(T, 92.6, 0.8));
  g.save(); g.globalAlpha = a; g.fillStyle = NEUTRAL; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = GOLD; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.174 * k); g.closePath(); g.fill();
  g.strokeStyle = '#07060a'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  txt(g, '17%', cx + 150, cy - 120, 64, INK, { f: SERIF, alpha: k }); txt(g, '世界人口', cx, cy + r + 70, 34, MUTED, { w: 700 });
  if (T > 95.5) { const b = back(clamp((T - 95.6) / 0.4)); g.save(); g.translate(cx - 360, cy); g.scale(b, b); g.fillStyle = '#f6e3c9'; g.beginPath(); g.arc(0, -40, 60, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, 80, 70, 90, 0, 0, 7); g.fill();
    g.fillStyle = '#2a1c12'; g.beginPath(); g.arc(-20, -45, 6, 0, 7); g.arc(20, -45, 6, 0, 7); g.fill(); txt(g, '17%', 0, 100, 48, '#2a1c12', { f: SERIF }); g.restore(); }
  if (T > 98.5) { g.strokeStyle = RED; g.lineWidth = 14; g.lineCap = 'round'; const k2 = eo(ramp(T, 98.6, 0.3)); g.beginPath(); g.moveTo(cx - 480, cy - 160); g.lineTo(lerp(cx - 480, cx - 240, k2), lerp(cy - 160, cy + 220, k2)); g.stroke(); }
  g.restore();
};
const lengthHist = (g: G, T: number, a: number) => {
  const d = AN.len_hist as [string, number][], x0 = 360, y0 = 190, w = 1200, h = 520, mx = 1800, bw = w / d.length;
  g.save(); g.globalAlpha = a; axes(g, x0, y0, w, h, 1);
  d.forEach(([lab, v], i) => { const k = eo(ramp(T, 100.6 + i * 0.12, 0.5)), bh = (v / mx) * h * k, x = x0 + i * bw + 14;
    g.fillStyle = i === 3 ? GOLD : NEUTRAL; rr(g, x, y0 + h - bh, bw - 28, bh, [6, 6, 0, 0] as unknown as number); g.fill();
    txt(g, lab + '字', x + (bw - 28) / 2, y0 + h + 42, 26, MUTED, { w: 500 }); if (k > 0.9) txt(g, String(v), x + (bw - 28) / 2, y0 + h - bh - 16, 28, INK, { w: 700 }); });
  txt(g, '中位数 11 字', x0 + 3.5 * bw, y0 - 20, 40, GOLD, { f: SERIF, alpha: ramp(T, 101.6, 0.4) });
  g.restore();
};
const likesGrid = (g: G, T: number, a: number) => {
  g.save(); g.globalAlpha = a; const cols = 110, sz = 10, gap = 3, x0 = 960 - (cols * (sz + gap)) / 2, y0 = 150;
  setSeed(9); const lit = new Set<number>(); while (lit.size < 54) lit.add(Math.floor(rnd() * 5841));
  const k = ramp(T, 104.4, 1.2);
  for (let i = 0; i < 5841; i++) { const c = i % cols, r = Math.floor(i / cols); g.fillStyle = lit.has(i) && k > 0 ? `rgba(241,197,109,${k})` : 'rgba(243,237,226,.13)'; g.fillRect(x0 + c * (sz + gap), y0 + r * (sz + gap), sz, sz); }
  g.restore();
};
const shareBar = (g: G, T: number, a: number) => {
  const x0 = 360, y = 330, w = 1200, h = 90, k = eio(ramp(T, 107.7, 0.9)), s = 0.437;
  g.save(); g.globalAlpha = a; g.fillStyle = NEUTRAL; rr(g, x0, y, w, h, 8); g.fill(); g.fillStyle = GOLD; rr(g, x0, y, w * s * k, h, 8); g.fill();
  txt(g, '前 10 条评论', x0, y - 30, 34, INK, { w: 700, a: 'left' }); txt(g, '44%', x0 + w * s * k - 20, y + 64, 52, '#2a1c12', { f: SERIF, a: 'right', alpha: k });
  txt(g, '其余 5831 条', x0 + w, y - 30, 34, MUTED, { w: 700, a: 'right' }); txt(g, '全部 1435 个赞', 960, y + h + 70, 30, MUTED, { w: 500 }); g.restore();
};
const twoBars = (g: G, T: number, a: number, t0: number, items: [string, number, string, boolean][], unitMax: number) => {
  g.save(); g.globalAlpha = a; const x0 = 520, y0 = 210, h = 120, gap = 90, w = 900;
  items.forEach(([lab, v, vs, hi], i) => { const k = eio(ramp(T, t0 + i * 0.25, 0.8)), y = y0 + i * (h + gap);
    txt(g, lab, x0 - 30, y + h / 2 + 14, 40, INK, { w: 900, a: 'right' }); g.fillStyle = hi ? GOLD : NEUTRAL; rr(g, x0, y, (v / unitMax) * w * k, h, 8); g.fill();
    txt(g, vs, x0 + (v / unitMax) * w * k + 24, y + h / 2 + 18, 52, INK, { f: SERIF, a: 'left', alpha: k }); });
  g.restore();
};
const waffle = (g: G, T: number, a: number) => {
  g.save(); g.globalAlpha = a; const s = 52, gp = 8, x0 = 560 - (10 * (s + gp)) / 2, y0 = 130, k = ramp(T, 121.2, 1.4);
  for (let i = 0; i < 100; i++) { const c = i % 10, r = Math.floor(i / 10), on = i < Math.round(71 * k); g.fillStyle = on ? GOLD : 'rgba(243,237,226,.14)'; rr(g, x0 + c * (s + gp), y0 + r * (s + gp), s, s, 6); g.fill(); if (on) txt(g, '@', x0 + c * (s + gp) + s / 2, y0 + r * (s + gp) + s / 2 + 12, 30, '#2a1c12', { w: 900 }); }
  g.restore();
};
/* ---------------------------------------------------------------- the film */
const draw = (g: G, T: number, IM: IMGS) => {
  room(g); const ang = T * 5, counter = counterAt(T);
  /* cold open 0–8.47 */
  if (T < PLAY + 0.05) {
    const cy = 470, xL = 230, open = eo(ramp(T, 0.0, 1.6)), squash = eio(ramp(T, 5.6, 0.6)), pull = eio(ramp(T, 6.15, 0.8)), xR = lerp(xL, 1690, open), h = lerp(780, 26, squash);
    const casX = lerp(2200, 1500, eo(ramp(T, 5.8, 0.6))), deckIn = eo(ramp(T, 6.6, 0.8)), deckY = lerp(1500, 600, deckIn), drop = eio(ramp(T, 7.1, 0.9));
    if (T < 7.2) {
      paperStrip(g, lerp(xL, casX - 100, pull), squash > 0 ? Math.min(xR, casX - 100) : xR, cy, h, squash);
      if (squash < 0.6) { g.save(); g.beginPath(); g.rect(xL + 20, cy - h / 2 + 20, xR - xL - 40, h - 40); g.clip(); g.globalAlpha = 1 - squash / 0.6;
        const off = T * 220 + Math.pow(Math.max(0, T - 1.5), 2.2) * 120; [IM.feed.slice(0, 16), IM.feed.slice(16, 32), IM.feed.slice(32, 48)].forEach((c, i) => feedColumn(g, c, xL + 80 + i * 490, cy - h / 2 + 30, 440, off * (1 + i * 0.12), 20 + i));
        if (T > 4.4) { g.globalAlpha = (1 - squash / 0.6) * ramp(T, 4.4, 1.0) * 0.45; g.fillStyle = '#fff'; setSeed(Math.floor(T * 30)); for (let i = 0; i < 40; i++) g.fillRect(xL + rnd() * (xR - xL), cy - h / 2 + rnd() * h, 4, 60 + rnd() * 200); }
        g.restore(); }
      if (squash < 1) roller(g, xL + pull * (casX - 100 - xL), cy, h);
      if (pull < 0.95 && squash < 0.9) roller(g, xR, cy, h);
    }
    if (T > 6.5) deck(g, 960, deckY, 0.82, { cas: 0, ang: 0, label: '', counter: '0000', play: ramp(T, PLAY - 0.09, 0.09) });
    if (T > 5.8) cassette(g, lerp(casX, 960, drop), lerp(cy, deckY - 8, drop), lerp(0.7, 0.82, drop), ang * (1 + pull * 6), '你们的评论', 'SIDE A');
    return;
  }
  /* title */
  if (T < 12.5) {
    if (T < PLAY + 0.12) { g.fillStyle = 'rgba(255,236,190,.5)'; g.fillRect(0, 0, W, H); }
    deck(g, 960, 720, 0.7, { ang, label: '你们的评论', counter: '0000', play: 1 });
    const a = eo(ramp(T, PLAY, 0.35)), out = 1 - ramp(T, 12.1, 0.4); glow(g, 960, 260, 700, '241,197,109', 0.16 * a * out);
    g.save(); g.globalAlpha = out; g.translate(960, 300); const sc = 1.1 - 0.1 * a; g.scale(sc, sc); txt(g, '你们的一万条评论', 0, 0, 120, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)', alpha: a }); g.restore();
    g.fillStyle = GOLD; g.globalAlpha = out * 0.8; const w = 560 * eo(ramp(T, PLAY + 0.5, 0.6)); g.fillRect(960 - w / 2, 350, w, 3); g.globalAlpha = 1;
    txt(g, '2万粉丝特别篇', 960, 420, 40, INK, { w: 700, alpha: ramp(T, PLAY + 0.8, 0.4) * out });
    return;
  }
  /* thanks / how */
  if (T < A_SIDE) {
    const z = 1 + 0.15 * eio(ramp(T, 12.5, 3)), shift = 160 * eio(ramp(T, 16.61, 0.6)) * (1 - ramp(T, 20.3, 0.4));
    deck(g, 960 + shift, 560, 0.85 * z, { ang, label: T < 12.53 ? '你们的评论' : '谁打来的？', counter, play: 1 });
    if (T > 12.6 && T < 16.6) { const k = back(clamp((T - 12.8) / 0.4)) * (1 - ramp(T, 16.3, 0.3)); g.save(); g.translate(1250, 270); g.rotate(0.18); g.scale(k, k); g.fillStyle = RED; g.beginPath(); g.arc(0, 0, 120, 0, 7); g.fill(); txt(g, '9666', 0, 16, 66, '#fff', { f: SERIF }); txt(g, '条评论', 0, 62, 26, '#fff', { w: 700 }); g.restore(); }
    if (T > 16.61 && T < 20.68) { const a = A(T, 16.61, 20.68); g.save(); g.globalAlpha = a; g.fillStyle = '#111'; rr(g, 150, 150, 340, 700, 46); g.fill(); g.save(); rr(g, 166, 166, 308, 668, 36); g.clip(); g.fillStyle = '#fff'; g.fillRect(166, 166, 308, 668); feedColumn(g, IM.feed.slice(0, 20), 176, 176, 288, (T - 16.6) * 700, 31); g.restore();
      for (let i = 0; i < 6; i++) { const p = ((T - 16.6) * 1.3 + i / 6) % 1, x = lerp(480, 1100, eio(p)), y = lerp(400 + i * 40, 500, eio(p)) - Math.sin(p * Math.PI) * 160, im = IM.feed[(i * 7 + Math.floor(T * 1.3)) % 48], s = 220 * (1 - p * 0.7); g.globalAlpha = a * (1 - p); g.drawImage(im, x - s / 2, y, s, (im.height / im.width) * s); }
      g.restore(); }
    if (T > 20.68) glow(g, 960 - 505 * 0.85 * z, 560 + 70 * 0.85 * z, 230, '241,197,109', 0.45 * (1 - ramp(T, 21.4, 0.6)));
    return;
  }
  /* A side 24.75–52.7 */
  if (T < B_SIDE) {
    const flip = T < A_SIDE + 1.6 ? Math.cos(Math.PI * eio(ramp(T, A_SIDE, 1.2))) : -1, lift = T < A_SIDE + 1.6 ? 220 * Math.sin(Math.PI * ramp(T, A_SIDE, 1.6)) : 0;
    const deckY = 780, dS = 0.62;
    let vuL: number | undefined, vuR: number | undefined, hotR = false;
    if (T >= 41.45) { vuL = T < 44.85 ? 0.2 : lerp(0.2, 0.09, eo(ramp(T, 44.85, 0.6))); vuR = T < 47.05 ? 0.2 : Math.min(1.08, lerp(0.2, 1.08, back(clamp((T - 47.05) / 0.6)))) + (T > 47.6 ? 0.03 * Math.sin(T * 40) : 0); hotR = T > 47.4; }
    deck(g, 960, deckY, dS, { ang: T > BRK ? ang * 0.2 : ang, label: flip >= 0 ? '谁打来的？' : 'A面 · 对答案', side: 'SIDE A', counter: '5841', play: 1, flip: (flip >= 0 ? 1 : -1) * Math.max(0.02, Math.abs(flip)), casLift: lift, vuL, vuR, hotR });
    if (T < 28.55) { const a = A(T, 25.35, 28.55); txt(g, '上期说', 960, 160, 40, INK, { w: 700, alpha: a }); big(g, '56%', 960, 360, 200, GOLD, a, 0.9 + 0.1 * eo(ramp(T, 25.35, 0.5))); txt(g, '觉得突然来电，多半没好事', 960, 440, 44, INK, { w: 700, alpha: a }); }
    else if (T < 32.25) { const a = A(T, 28.55, 32.25); g.save(); g.globalAlpha = a * 0.9; setSeed(5);
      IM.scare.slice(0, 10).forEach((im, i) => { const x = 40 + (i % 4) * 470 + rnd() * 30, sp = 260 + rnd() * 140, y = -260 + ((T - 28.55) * sp + i * 173) % 1000; g.save(); g.translate(x, y); g.rotate((rnd() - 0.5) * 0.06); g.fillStyle = '#111'; g.fillRect(8, 8, 420, (im.height / im.width) * 420); g.drawImage(im, 0, 0, 420, (im.height / im.width) * 420); g.restore(); });
      g.restore(); g.fillStyle = `rgba(7,6,10,${0.78 * a})`; rr(g, 520, 190, 880, 290, 30); g.fill(); big(g, '近 3 成', 960, 350, 150, GOLD, a); txt(g, '吓死 · 心慌 · 心里一紧', 960, 440, 44, INK, { w: 700, alpha: a }); }
    else if (T < 35.25) { const a = A(T, 32.25, 35.25); big(g, '17%', 960, 340, 200, GOLD, a); txt(g, '以为真有人给自己打电话', 960, 430, 44, INK, { w: 700, alpha: a }); }
    else if (T < 38.95) { const a = A(T, 35.25, 38.95), n = Math.floor(343 * eo(ramp(T, 35.4, 2.0)));
      for (let i = 0; i < 343; i++) { const c = i % 49, r = Math.floor(i / 49); g.globalAlpha = a; g.fillStyle = i < n ? '#5fd17a' : 'rgba(255,255,255,.1)'; rr(g, 380 + c * 24, 110 + r * 30, 16, 22, 4); g.fill(); }
      g.globalAlpha = 1; big(g, `${n} 条`, 960, 450, 110, GOLD, a); }
    else if (T < 41.45) { const a = A(T, 38.95, 41.45); g.fillStyle = `rgba(0,0,0,${0.5 * a})`; rr(g, 560, 220, 800, 170, 20); g.fill(); txt(g, 'SORRY ♪', 960, 335, 96, RED, { f: MONO, w: 700, alpha: a, glow: 'rgba(226,72,61,.6)' }); }
    else if (T < BRK) { const a = A(T, 41.45, BRK, 0.3, 0.12);
      txt(g, '上期说：头号理由是', 960, 130, 38, INK, { w: 700, alpha: a * (1 - ramp(T, 44.6, 0.3)) }); big(g, '怕诈骗', 960, 260, 110, INK, a * (1 - ramp(T, 44.6, 0.3)));
      const b = ramp(T, 44.85, 0.3); g.save(); g.globalAlpha = a * b; txt(g, '诈骗 / 骚扰', 560, 200, 44, INK, { w: 700 }); txt(g, '26', 560, 350, 130, INK, { f: SERIF });
      const c = ramp(T, 47.05, 0.3); g.globalAlpha = a * c; txt(g, '妈', 1360, 200, 56, GOLD, { w: 900 }); txt(g, '302', 1360, 350, 150, RED, { f: SERIF, glow: 'rgba(226,72,61,.6)' });
      if (T > 47.4) { g.globalAlpha = a * ramp(T, 47.4, 0.2); txt(g, 'PEAK!', 1360 + Math.sin(T * 60) * 4, 430, 54, RED, { f: MONO, w: 700, glow: 'rgba(226,72,61,.7)' }); }
      g.restore(); }
    else { big(g, '是妈。', 960, 330, 190, GOLD, A(T, BRK, B_SIDE, 0.08, 0.3), 1.3 - 0.3 * eo(ramp(T, BRK, 0.35))); }
    return;
  }
  /* B side: mini deck bottom-left, charts full */
  const flipB = T < B_SIDE + 1.4 ? Math.cos(Math.PI * eio(ramp(T, B_SIDE, 1.2))) : -1;
  const miniK = eio(ramp(T, B_SIDE + 1.2, 1.0));
  if (T < AW) deck(g, lerp(960, 185, miniK), lerp(780, 82, miniK), lerp(0.62, 0.17, miniK), { ang, label: flipB >= 0 ? 'A面 · 对答案' : 'B面 · 数据', side: flipB >= 0 ? 'SIDE A' : 'SIDE B', counter: '5841', play: 1, flip: (flipB >= 0 ? 1 : -1) * Math.max(0.02, Math.abs(flipB)) });
  if (T < BLD) { hoursChart(g, T, A(T, B_SIDE + 2.2, BLD + 0.2, 0.5, 0.4)); if (T < B_SIDE + 2.6) big(g, 'B面 · 数据分析', 960, 360, 110, GOLD, A(T, B_SIDE + 0.3, B_SIDE + 2.8)); }
  else if (T < 89.0) { scatter(g, T, A(T, BLD, 89.0, 0.4, 0.3));
    if (T > DROP) { const k = A(T, DROP, 85.5, 0.05, 0.3); g.fillStyle = `rgba(7,6,10,${0.55 * k})`; g.fillRect(0, 0, W, H); big(g, '广东人，确实话多。', 960, 470, 130, GOLD, k, 1.25 - 0.25 * eo(ramp(T, DROP, 0.3))); if (T < DROP + 0.12) { g.fillStyle = 'rgba(255,236,190,.35)'; g.fillRect(0, 0, W, H); } } }
  else if (T < 92.5) { const a = A(T, 89.0, 92.5); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(16,14,20,.9)'; rr(g, 560, 230, 800, 300, 26); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke();
    txt(g, 'IP属地：广东', 960, 340, 64, INK, { w: 900 }); txt(g, '≠ 广东人', 960, 450, 80, GOLD, { f: SERIF }); g.restore(); }
  else if (T < 100.5) worldPie(g, T, A(T, 92.5, 100.5));
  else if (T < 104.0) lengthHist(g, T, A(T, 100.5, 104.0));
  else if (T < 107.5) { likesGrid(g, T, A(T, 104.0, 107.5)); big(g, '54 / 5841', 960, 925, 72, GOLD, A(T, 105.0, 107.5)); }
  else if (T < 111.0) shareBar(g, T, A(T, 107.5, 111.0));
  else if (T < 117.5) { twoBars(g, T, A(T, 111.0, 117.5), 111.2, [['被赞过', 17, '17 字', true], ['没被赞', 9, '9 字', false]], 20);
    if (T > 114.5) { const k = ramp(T, 114.6, 0.4); g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(16,14,20,.88)'; rr(g, 1180, 620, 560, 150, 20); g.fill(); txt(g, 'ρ = 0.08', 1460, 720, 80, INK, { f: SERIF }); g.restore(); } }
  else if (T < 121.0) twoBars(g, T, A(T, 117.5, 121.0), 117.7, [['被吓到的人', 4.2, '4%', true], ['所有人', 22.1, '22%', false]], 25);
  else if (T < 124.5) { const a = A(T, 121.0, 124.5); waffle(g, T, a); big(g, `${Math.round(71 * ramp(T, 121.2, 1.4))}%`, 1360, 470, 200, GOLD, a); txt(g, '只@人，不说话', 1360, 560, 44, INK, { w: 700, alpha: a }); }
  else if (T < AW) { const a = A(T, 124.5, AW); big(g, '被吓的，不拉人', 960, 330, 96, INK, a); big(g, '拉人的，不说话', 960, 480, 96, GOLD, ramp(T, 125.4, 0.3) * a); }
  /* awards */
  else if (T < END) {
    if (T < AW0) { const k = back(clamp((T - AW) / 0.5)); g.save(); g.translate(960, 470); g.scale(k, k); cassette(g, 0, 0, 1, ang, '评论区颁奖典礼', 'BONUS'); g.restore(); glow(g, 960, 470, 600, '241,197,109', 0.25 * k); }
    else { const i = Math.min(AWARDS.length - 1, Math.floor((T - AW0) / (6 * BEAT))), t0 = awT(i), k = eo(ramp(T, t0, 0.35)), out = 1 - ramp(T, awT(i + 1) - 0.2, 0.2);
      g.save(); g.globalAlpha = out; txt(g, `No.${String(i + 1).padStart(2, '0')}`, 960, 150, 34, 'rgba(241,197,109,.75)', { f: MONO, w: 700, alpha: k }); big(g, AWARDS[i][0], 960, 270, 110, GOLD, k, 1.15 - 0.15 * k);
      const im = IM.aw[i], s = Math.min(1500 / im.width, 560 / im.height), w = im.width * s, h = im.height * s, x = 960 - w / 2, y = 330 + (600 - h) / 2 + (1 - k) * 80;
      g.globalAlpha = out * k; g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, x + 12, y + 18, w, h, 22); g.fill(); g.save(); rr(g, x, y, w, h, 22); g.clip(); g.drawImage(im, x, y, w, h); g.restore(); g.restore(); }
  }
  /* end */
  else {
    deck(g, 960, 560, 0.85, { ang: T < CARD ? ang : 0, label: '下一盘：你来定', side: 'SIDE A', counter: '0000', play: T < CARD ? 1 : 0 });
    if (T > CARD) { const k = ramp(T, CARD, 0.5); g.fillStyle = `rgba(5,6,11,${0.82 * k})`; g.fillRect(0, 0, W, H); big(g, '评论区见', 960, 450, 120, GOLD, k); txt(g, '关注 Juno · 一起看懂世界', 960, 580, 44, INK, { w: 700, alpha: ramp(T, CARD + 0.4, 0.5) }); }
    if (T > LEN - 1.0) { g.fillStyle = `rgba(0,0,0,${ramp(T, LEN - 1.0, 1.0)})`; g.fillRect(0, 0, W, H); }
  }
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('assets')); const [IM, setIM] = useState<IMGS | null>(null);
  useEffect(() => {
    const load = (p: string) => new Promise<HTMLImageElement>((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(im); im.src = staticFile(p); });
    const s = LINES.map((l) => l[2]).join('') + '你们的一万条评论2万粉丝特别篇上期说觉得突然来电多半没好事近成吓死心慌心里一紧以为真有人给自己打电话怕诈骗妈是领导老师对象条评论谁打来的？面数据分析每小时评论数北京时间按有具体时刻的人口百万广东山东河南江苏四川属地≠世界中位字前其余全部个赞被过没所有人颁奖典礼下一盘你来定区见关注一起看懂◆·JunoVIBE知识大赏0123456789%+−ρ=';
    Promise.all([Promise.all(CROPS.feed.map((c) => load(c.f))), Promise.all(CROPS.scare.map((c) => load(c.f))), Promise.all(AW_FILES.map((n) => load(`aw/${n}.png`))),
      ...[`900 70px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`, `700 40px ${MONO}`].map((x) => document.fonts.load(x, s).catch(() => null))])
      .then(([feed, scare, aw]) => { setIM({ feed: feed as HTMLImageElement[], scare: scare as HTMLImageElement[], aw: aw as HTMLImageElement[] }); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => {
    if (!IM || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    const T = f / FPS; draw(g, T, IM);
    if (T >= 12.5 && T < CARD) mark(g);
    for (const [a, b, s] of LINES) if (T >= a && T < b) sub(g, s, ramp(T, a + 0.02, 0.1) * (1 - ramp(T, b - 0.1, 0.1)));
  }, [f, IM]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /><Audio src={staticFile('bgm.mp3')} /></AbsoluteFill>;
};

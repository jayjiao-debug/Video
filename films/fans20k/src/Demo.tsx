/* 2万粉丝特别篇 demo (0:00–0:59): comic scroll -> tape -> cassette -> deck PLAY -> title -> thanks -> A-side. All drawn in code; comment screenshots are real crops. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import CROPS from './crops.json';

const W = 1920, H = 1080, FPS = 30;
type G = CanvasRenderingContext2D;
const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"', MONO = '"DejaVu Sans Mono"';
const GOLD = '#f1c56d', INK = '#f3ede2', PAPER = '#f2e6cc', TAPE = '#5b3a22', RED = '#e2483d';
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number } = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 28; } g.fillText(s, x, y); g.restore();
};
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.45, `rgba(${col},${a * 0.3})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const sub = (g: G, s: string, a: number) => { if (!s || a <= 0) return; g.save(); g.globalAlpha = a; g.font = `900 70px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 60); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 60); g.restore(); };
const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });

/* ---------------------------------------------------------------- room */
const room = (g: G) => {
  const b = g.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H / 2, 1250); b.addColorStop(0, '#1d1814'); b.addColorStop(1, '#07060a'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  seed = 4; g.fillStyle = 'rgba(255,230,190,.035)'; for (let y = 0; y < H; y += 26) for (let x = (y / 26) % 2 ? 13 : 0; x < W; x += 26) { const r = 2.2 * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.004 + y * 0.003))); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
};

/* ---------------------------------------------------------------- comic scroll */
const roller = (g: G, x: number, cy: number, h: number) => {
  const b = g.createLinearGradient(x - 26, 0, x + 26, 0); b.addColorStop(0, '#3b2414'); b.addColorStop(0.45, '#9a6a3c'); b.addColorStop(1, '#2c1a0e'); g.fillStyle = b; rr(g, x - 24, cy - h / 2 - 20, 48, h + 40, 18); g.fill();
  g.fillStyle = '#c99a4a'; for (const s of [-1, 1]) { rr(g, x - 34, cy + s * (h / 2 + 20) - (s > 0 ? 0 : 26), 68, 26, 10); g.fill(); }
};
const panel = (g: G, img: HTMLImageElement, x: number, y: number, w: number, rot: number) => {
  const h = (img.height / img.width) * w; g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  g.fillStyle = '#111'; g.fillRect(-w / 2 + 10, -h / 2 + 10, w, h); g.drawImage(img, -w / 2, -h / 2, w, h); g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); return h;
};
const feedColumn = (g: G, imgs: HTMLImageElement[], x: number, y0: number, w: number, off: number, s0: number) => {
  let total = 0; const hs = imgs.map((im) => (im.height / im.width) * w + 26); hs.forEach((h) => (total += h));
  let y = y0 - (off % total); seed = s0;
  for (let k = 0; k < 2; k++) imgs.forEach((im, i) => { const rot = (rnd() - 0.5) * 0.04; if (y > -400 && y < H + 50) panel(g, im, x, y, w, rot); y += hs[i]; });
};
const paperStrip = (g: G, x0: number, x1: number, cy: number, h: number, brown: number) => {
  g.save(); g.fillStyle = `rgb(${lerp(242, 91, brown)},${lerp(230, 58, brown)},${lerp(204, 34, brown)})`; g.fillRect(x0, cy - h / 2, x1 - x0, h);
  if (brown < 0.5) { g.strokeStyle = '#111'; g.lineWidth = 6; g.strokeRect(x0 + 14, cy - h / 2 + 14, x1 - x0 - 28, h - 28);
    seed = 8; g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 260; i++) { const x = x0 + rnd() * (x1 - x0), y = cy - h / 2 + rnd() * h; if (Math.abs(y - cy) > h * 0.36) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } } }
  g.restore();
};
/* ---------------------------------------------------------------- cassette + deck */
const reel = (g: G, x: number, y: number, r: number, ang: number, tapeR: number) => {
  g.fillStyle = TAPE; g.beginPath(); g.arc(x, y, tapeR, 0, 7); g.fill();
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = '#222'; for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.fillRect(-4, r * 0.35, 8, r * 0.45); } g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7); g.fill(); g.restore();
};
const cassette = (g: G, cx: number, cy: number, s: number, ang: number, label: string, sideLabel = '', flipX = 1) => {
  g.save(); g.translate(cx, cy); g.scale(s * flipX, s);
  g.fillStyle = 'rgba(0,0,0,.4)'; rr(g, -280 + 14, -175 + 18, 560, 350, 26); g.fill();
  const b = g.createLinearGradient(0, -175, 0, 175); b.addColorStop(0, '#2a2a30'); b.addColorStop(1, '#141418'); g.fillStyle = b; rr(g, -280, -175, 560, 350, 26); g.fill();
  g.fillStyle = PAPER; rr(g, -240, -150, 480, 210, 12); g.fill(); g.fillStyle = RED; g.fillRect(-240, -150, 480, 34);
  g.save(); if (flipX < 0) g.scale(-1, 1);
  txt(g, sideLabel || 'SIDE A', -214, -124, 22, '#fff5e6', { w: 900, a: 'left', f: MONO });
  txt(g, label, 0, -64, 40, '#2a1c12', { f: SERIF });
  g.restore();
  g.strokeStyle = 'rgba(60,40,20,.3)'; g.lineWidth = 2; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(-210, -36 + i * 26); g.lineTo(210, -36 + i * 26); g.stroke(); }
  g.fillStyle = '#0c0c10'; rr(g, -170, -20, 340, 84, 40); g.fill();
  reel(g, -100, 22, 30, ang, 40); reel(g, 100, 22, 30, ang * 1.05, 34);
  g.fillStyle = '#0c0c10'; g.beginPath(); g.moveTo(-150, 175); g.lineTo(-120, 120); g.lineTo(120, 120); g.lineTo(150, 175); g.fill();
  g.fillStyle = '#555'; for (const [x, y] of [[-258, -154], [258, -154], [-258, 154], [258, 154]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.restore();
};
const vu = (g: G, x: number, y: number, w: number, h: number, v: number, label: string, val: string, hot: boolean) => {
  g.fillStyle = '#e9dfc4'; rr(g, x, y, w, h, 10); g.fill(); g.strokeStyle = '#2a2016'; g.lineWidth = 3; g.stroke();
  const cx = x + w / 2, cy = y + h - 18, R = h - 50;
  g.strokeStyle = '#2a2016'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.68, Math.PI * 1.85); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.15 + 0.07 * i); g.strokeStyle = '#2a2016'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14)); g.stroke(); }
  const a = Math.PI * (1.15 + 0.7 * v); g.strokeStyle = hot ? RED : '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6)); g.stroke();
  if (label) { txt(g, label, cx, y + h + 46, 34, INK, { w: 700 }); txt(g, val, cx, y + h + 104, 54, hot ? RED : GOLD, { f: SERIF }); }
};
type DeckOpt = { cas?: number; ang: number; label: string; side?: string; counter: string; play: number; vuL?: number; vuR?: number; vuLabel?: [string, string, string, string]; hotR?: boolean; flip?: number; casLift?: number };
const deck = (g: G, cx: number, cy: number, s: number, o: DeckOpt) => {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, -690 + 20, -250 + 30, 1380, 500, 40); g.fill();
  const b = g.createLinearGradient(0, -250, 0, 250); b.addColorStop(0, '#4a4640'); b.addColorStop(0.5, '#2b2925'); b.addColorStop(1, '#1a1916'); g.fillStyle = b; rr(g, -690, -250, 1380, 500, 40); g.fill();
  g.strokeStyle = 'rgba(255,240,210,.06)'; g.lineWidth = 1; for (let y = -240; y < 240; y += 6) { g.beginPath(); g.moveTo(-680, y); g.lineTo(680, y); g.stroke(); }
  // window
  g.fillStyle = '#050506'; rr(g, -320, -210, 640, 400, 24); g.fill();
  if ((o.cas ?? 1) > 0) cassette(g, 0, -10 - (o.casLift ?? 0), 1, o.ang, o.label, o.side, o.flip ?? 1);
  g.fillStyle = 'rgba(180,200,230,.07)'; g.beginPath(); g.moveTo(-320, -210); g.lineTo(-120, -210); g.lineTo(-320, 60); g.fill();
  // VU meters
  vu(g, -650, -200, 290, 170, o.vuL ?? 0.15 + 0.05 * Math.sin(o.ang * 2), '', '', false);
  vu(g, 360, -200, 290, 170, o.vuR ?? 0.15 + 0.05 * Math.cos(o.ang * 2.3), '', '', !!o.hotR);
  // counter
  g.fillStyle = '#0a0a0a'; rr(g, -620, 30, 230, 80, 10); g.fill(); txt(g, o.counter, -505, 92, 60, '#f7e7b5', { f: MONO, w: 700, glow: 'rgba(247,231,181,.6)' });
  txt(g, 'COUNTER', -505, 140, 20, 'rgba(243,237,226,.5)', { f: MONO, w: 700 });
  // buttons
  const names = ['◀◀', '▶', '▶▶', '■', '⏏']; names.forEach((n, i) => {
    const x = -330 + i * 140, down = i === 1 ? o.play * 10 : 0, isPlay = i === 1;
    g.fillStyle = '#0d0c0b'; rr(g, x - 58, 212 - 8, 116, 52, 10); g.fill();
    g.fillStyle = isPlay && o.play > 0 ? '#3a3226' : '#3e3b36'; rr(g, x - 54, 200 + down - 8, 108, 46, 9); g.fill();
    txt(g, n, x, 236 + down - 8, 30, isPlay && o.play > 0 ? GOLD : INK, { f: SANS, w: 900 });
  });
  if (o.play > 0) glow(g, -190, 222, 120, '241,197,109', 0.35 * o.play);
  g.fillStyle = o.play > 0 ? RED : '#3a1210'; g.beginPath(); g.arc(560, 110, 12, 0, 7); g.fill(); if (o.play > 0) glow(g, 560, 110, 60, '226,72,61', 0.6);
  txt(g, 'PLAY', 520, 120, 22, 'rgba(243,237,226,.6)', { f: MONO, w: 700, a: 'right' });
  g.restore();
};
/* ---------------------------------------------------------------- timeline */
const LINES: [number, number, string][] = [
  [0.3, 2.5, '2万粉丝了。'],
  [8.0, 10.8, '谢谢各位彦祖、亦菲'], [10.8, 13.6, '这期视频，是你们写的'], [13.6, 17.4, '上期《谁打来的？》，你们留了9323条评论'],
  [17.4, 20.8, '我把评论区慢慢滑完，一条条识别'], [20.8, 24.0, '去掉回复和重复，一共5841条'],
  [24.0, 28.2, '上期说：56%的年轻人觉得，突然来电多半没好事'], [28.2, 32.0, '评论区：近3成在说吓死、心慌、心里一紧'], [32.0, 35.0, '17%以为真有人给自己打电话'],
  [35.0, 39.0, '343条评论说：自己真的退出去，翻了微信'], [39.0, 41.8, '对不起，铃声是我放的'], [41.8, 45.6, '上期说：不接电话的头号理由，是怕诈骗'],
  [45.6, 49.0, '评论区里，提到诈骗、骚扰的：26条'], [49.0, 51.8, '提到“妈”的：302条'], [51.8, 54.8, '你们怕的不是骗子，是妈'], [54.8, 58.4, '然后是领导、老师、对象，几乎打平'],
];
export const DEMO_LEN = Math.round(59.4 * FPS);
const counterAt = (T: number) => {
  if (T < 8) return '0000';
  if (T < 20.8) return String(Math.floor((T - 8) * 457) % 10000).padStart(4, '0');
  const k = eio(ramp(T, 20.8, 1.6)); return String(Math.round(lerp(Math.floor(12.8 * 457) % 10000, 5841, k))).padStart(4, '0');
};
const big = (g: G, s: string, x: number, y: number, size: number, col: string, a: number, sc = 1) => { g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(sc, sc); txt(g, s, 0, 0, size, col, { f: SERIF, glow: col === GOLD ? 'rgba(241,197,109,.5)' : undefined }); g.restore(); };

const draw = (g: G, T: number, IM: { feed: HTMLImageElement[]; scare: HTMLImageElement[] }) => {
  room(g);
  const ang = T * 5;
  /* ---- 0–4 s: scroll unrolls, comments race, roll up into tape, cassette into deck, PLAY */
  if (T < 4.0) {
    const cy = 470, xL = 230;
    const open = eo(ramp(T, 0, 1.1)), squash = eio(ramp(T, 2.45, 0.45)), pull = eio(ramp(T, 2.85, 0.55));
    const xR = lerp(xL, 1690, open);
    const h = lerp(780, 26, squash);
    const casX = lerp(2200, 1500, eo(ramp(T, 2.6, 0.4))) , casY = 470;
    const stripX0 = lerp(xL, casX - 100, pull), stripX1 = Math.min(xR, casX - 100);
    if (T < 3.45) {
      paperStrip(g, stripX0, squash > 0 ? stripX1 : xR, cy, h, squash);
      if (squash < 0.6) {
        g.save(); g.beginPath(); g.rect(xL + 20, cy - h / 2 + 20, xR - xL - 40, h - 40); g.clip(); g.globalAlpha = 1 - squash / 0.6;
        const speed = 300 + 2600 * eio(ramp(T, 0.6, 1.8)), off = T * speed * 0.6 + T * T * 260;
        const cols = [IM.feed.slice(0, 16), IM.feed.slice(16, 32), IM.feed.slice(32, 48)];
        cols.forEach((c, i) => feedColumn(g, c, xL + 80 + i * 490, cy - h / 2 + 30, 440, off * (1 + i * 0.12), 20 + i));
        if (T > 1.7) { g.globalAlpha = (1 - squash / 0.6) * ramp(T, 1.7, 0.6) * 0.5; g.fillStyle = '#fff'; seed = Math.floor(T * 30); for (let i = 0; i < 40; i++) g.fillRect(xL + rnd() * (xR - xL), cy - h / 2 + rnd() * h, 4, 60 + rnd() * 200); }
        g.restore();
      }
      if (squash < 1) roller(g, xL + pull * (casX - 100 - xL), cy, h);
      if (pull < 0.95 && squash < 0.9) roller(g, xR, cy, h);
    }
    const drop = eio(ramp(T, 3.35, 0.5)), deckIn = eo(ramp(T, 3.05, 0.55));
    const deckY = lerp(1500, 600, deckIn);
    if (T > 3.0) deck(g, 960, deckY, 0.82, { cas: 0, ang: 0, label: '', counter: '0000', play: ramp(T, 3.92, 0.08) });
    if (T > 2.6) {
      const tx = lerp(casX, 960, drop), ty = lerp(casY, deckY - 10 * 0.82, drop), s = lerp(0.7, 0.82, drop);
      cassette(g, tx, ty, s, ang * (1 + pull * 6), '你们的评论', 'SIDE A');
    }
    if (T > 3.9) { g.fillStyle = `rgba(255,236,190,${0.5 * (1 - ramp(T, 3.95, 0.1))})`; g.fillRect(0, 0, W, H); }
    sub(g, LINES[0][2], ramp(T, 0.3, 0.15) * (1 - ramp(T, 2.35, 0.15)));
    return;
  }
  /* ---- 4–8 s: title over the playing deck */
  if (T < 8.0) {
    deck(g, 960, 720, 0.7, { ang, label: '你们的评论', counter: '0000', play: 1 });
    const a = eo(ramp(T, 4.0, 0.35)), out = 1 - ramp(T, 7.6, 0.4); glow(g, 960, 260, 700, '241,197,109', 0.16 * a * out);
    g.save(); g.globalAlpha = out; g.translate(960, 300); const sc = 1.1 - 0.1 * a; g.scale(sc, sc);
    txt(g, '你们的一万条评论', 0, 0, 120, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)', alpha: a }); g.restore();
    g.fillStyle = GOLD; g.globalAlpha = out * 0.8; const w = 560 * eo(ramp(T, 4.5, 0.6)); g.fillRect(960 - w / 2, 350, w, 3); g.globalAlpha = 1;
    txt(g, '2万粉丝特别篇', 960, 420, 40, INK, { w: 700, alpha: ramp(T, 4.8, 0.4) * out });
    return;
  }
  /* ---- 8–24 s: thanks; counter, label, phone feeding the cassette */
  const counter = counterAt(T);
  if (T < 24.0) {
    const z = 1 + 0.15 * eio(ramp(T, 8, 3));
    const lbl = T < 13.6 ? '你们的评论' : '谁打来的？';
    deck(g, 960 + (T > 17.4 && T < 20.8 ? 160 : 0) * eio(ramp(T, 17.4, 0.6)) * (1 - ramp(T, 20.4, 0.4)), 560, 0.85 * z, { ang, label: lbl, counter, play: 1 });
    if (T > 13.6 && T < 17.4) { const k = back(clamp((T - 13.9) / 0.4)); g.save(); g.translate(1230, 280); g.rotate(0.18); g.scale(k, k); g.fillStyle = RED; g.beginPath(); g.arc(0, 0, 110, 0, 7); g.fill(); txt(g, '9323', 0, 16, 64, '#fff', { f: SERIF }); txt(g, '条评论', 0, 60, 26, '#fff', { w: 700 }); g.restore(); }
    if (T > 17.4 && T < 20.8) {
      const a = ramp(T, 17.4, 0.3) * (1 - ramp(T, 20.4, 0.4)); g.save(); g.globalAlpha = a;
      g.fillStyle = '#111'; rr(g, 150, 150, 340, 700, 46); g.fill(); g.save(); rr(g, 166, 166, 308, 668, 36); g.clip(); g.fillStyle = '#fff'; g.fillRect(166, 166, 308, 668);
      feedColumn(g, IM.feed.slice(0, 20), 176, 176, 288, (T - 17.4) * 900, 31); g.restore();
      seed = 77; for (let i = 0; i < 6; i++) { const p = ((T - 17.4) * 1.3 + i / 6) % 1, x = lerp(480, 1010, eio(p)), y = lerp(400 + i * 40, 500, eio(p)) - Math.sin(p * Math.PI) * 160, im = IM.feed[(i * 7 + Math.floor(T * 1.3)) % 48];
        g.globalAlpha = a * (1 - p); g.drawImage(im, x - 110 * (1 - p * 0.7), y, 220 * (1 - p * 0.7), (im.height / im.width) * 220 * (1 - p * 0.7)); }
      g.restore();
    }
    if (T > 20.8) { const k = ramp(T, 22.4, 0.3); if (k > 0) { glow(g, 960 - 505 * 0.85 * z, 560 + 70 * 0.85 * z, 220, '241,197,109', 0.4 * k); } }
    return;
  }
  /* ---- 24–59 s: A side */
  const flip = T < 26.0 ? Math.cos(Math.PI * eio(ramp(T, 24.0, 1.2))) : -1, flipSign = flip >= 0 ? 1 : -1, flipMag = Math.max(0.02, Math.abs(flip));
  const side = flip >= 0 ? 'SIDE B' : 'SIDE A';
  const lift = T < 26.0 ? 220 * Math.sin(Math.PI * ramp(T, 24.0, 1.6)) : 0;
  const deckY = 780, deckS = 0.62;
  let vuR: number | undefined, vuL: number | undefined, hotR = false;
  if (T >= 41.8 && T < 54.8) { vuL = T < 45.6 ? 0.2 : lerp(0.2, 0.09, eo(ramp(T, 45.6, 0.6))); vuR = T < 49.0 ? 0.2 : Math.min(1.08, lerp(0.2, 1.08, back(clamp((T - 49.0) / 0.6)))) + (T > 49.6 ? 0.03 * Math.sin(T * 40) : 0); hotR = T > 49.4; }
  g.save(); deck(g, 960, deckY, deckS, { ang, label: flip >= 0 ? '谁打来的？' : 'A面 · 对答案', side: 'SIDE A', counter, play: 1, flip: flipSign * flipMag, casLift: lift, vuL, vuR, hotR }); g.restore();
  void side;
  const A = (a: number, b: number) => ramp(T, a, 0.3) * (1 - ramp(T, b - 0.3, 0.3));
  // 56%
  if (T < 28.2) { const a = A(24.6, 28.2); txt(g, '上期说', 960, 160, 40, INK, { w: 700, alpha: a }); big(g, '56%', 960, 360, 200, GOLD, a, 0.9 + 0.1 * eo(ramp(T, 24.6, 0.5))); txt(g, '觉得突然来电，多半没好事', 960, 440, 44, INK, { w: 700, alpha: a }); }
  // comment rain + 28.8%
  if (T >= 28.2 && T < 32.0) { const a = A(28.2, 32.0); g.save(); g.globalAlpha = a * 0.9; seed = 5;
    IM.scare.slice(0, 10).forEach((im, i) => { const x = 40 + (i % 4) * 470 + rnd() * 30, sp = 260 + rnd() * 140, y = -260 + ((T - 28.2) * sp + i * 173) % 1000; g.save(); g.translate(x, y); g.rotate((rnd() - 0.5) * 0.06); g.fillStyle = '#111'; g.fillRect(8, 8, 420, (im.height / im.width) * 420); g.drawImage(im, 0, 0, 420, (im.height / im.width) * 420); g.restore(); });
    g.restore(); g.fillStyle = `rgba(7,6,10,${0.78 * a})`; rr(g, 520, 190, 880, 290, 30); g.fill(); big(g, '近 3 成', 960, 350, 150, GOLD, a); txt(g, '吓死 · 心慌 · 心里一紧', 960, 440, 44, INK, { w: 700, alpha: a }); }
  if (T >= 32.0 && T < 35.0) { const a = A(32.0, 35.0); big(g, '17%', 960, 340, 200, GOLD, a); txt(g, '以为真有人给自己打电话', 960, 430, 44, INK, { w: 700, alpha: a }); }
  if (T >= 35.0 && T < 39.0) { const a = A(35.0, 39.0); const n = Math.floor(343 * eo(ramp(T, 35.2, 2.0)));
    for (let i = 0; i < 343; i++) { const c = i % 49, r = Math.floor(i / 49), x = 380 + c * 24, y = 110 + r * 30; g.globalAlpha = a; g.fillStyle = i < n ? '#5fd17a' : 'rgba(255,255,255,.1)'; rr(g, x, y, 16, 22, 4); g.fill(); }
    g.globalAlpha = 1; big(g, String(n) + ' 条', 960, 450, 110, GOLD, a); }
  if (T >= 39.0 && T < 41.8) { const a = A(39.0, 41.8); g.fillStyle = `rgba(0,0,0,${0.5 * a})`; rr(g, 560, 220, 800, 170, 20); g.fill(); txt(g, 'SORRY ♪', 960, 335, 96, RED, { f: MONO, w: 700, alpha: a, glow: 'rgba(226,72,61,.6)' }); }
  if (T >= 41.8 && T < 54.8) {
    const a = A(41.8, 54.8); txt(g, '上期说：头号理由是', 960, 130, 38, INK, { w: 700, alpha: a * (1 - ramp(T, 45.4, 0.3)) }); big(g, '怕诈骗', 960, 260, 110, INK, a * (1 - ramp(T, 45.4, 0.3)));
    const b = ramp(T, 45.6, 0.3) * (1 - ramp(T, 51.7, 0.25));
    if (b > 0) { g.save(); g.globalAlpha = b;
      txt(g, '诈骗 / 骚扰', 560, 200, 44, INK, { w: 700 }); txt(g, '26', 560, 350, 130, INK, { f: SERIF });
      const c = ramp(T, 49.0, 0.3); g.globalAlpha = b * c; txt(g, '妈', 1360, 200, 56, GOLD, { w: 900 }); txt(g, '302', 1360, 350, 150, RED, { f: SERIF, glow: 'rgba(226,72,61,.6)' });
      if (T > 49.4) { const sh = (T < 51.8 ? 1 : 0) * Math.sin(T * 60) * 4; g.globalAlpha = b * ramp(T, 49.4, 0.2); txt(g, 'PEAK!', 1360 + sh, 430, 54, RED, { f: MONO, w: 700, glow: 'rgba(226,72,61,.7)' }); }
      g.restore(); }
    if (T >= 51.8) { const d = ramp(T, 51.9, 0.35) * (1 - ramp(T, 54.5, 0.3)); big(g, '是妈。', 960, 330, 170, GOLD, d, 1.25 - 0.25 * eo(ramp(T, 51.9, 0.35))); }
  }
  if (T >= 54.8) {
    const a = A(54.8, 59.0); const items: [string, number][] = [['领导', 134], ['老师', 131], ['对象', 128]];
    items.forEach(([k, v], i) => { const x = 620 + i * 340, hgt = 300 * (v / 140) * eo(ramp(T, 55.0 + i * 0.12, 0.6)); g.globalAlpha = a;
      for (let s = 0; s < 14; s++) { const y = 470 - s * 22; if (470 - y > hgt) break; g.fillStyle = s > 11 ? RED : s > 8 ? GOLD : '#5fd17a'; rr(g, x - 60, y - 16, 120, 16, 4); g.fill(); }
      txt(g, k, x, 530, 44, INK, { w: 900 }); txt(g, String(v), x, 585, 36, GOLD, { f: SERIF }); });
    g.globalAlpha = 1;
  }
  if (T > 58.6) { g.fillStyle = `rgba(0,0,0,${ramp(T, 58.6, 0.8)})`; g.fillRect(0, 0, W, H); }
};

export const Demo: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('assets')); const [IM, setIM] = useState<{ feed: HTMLImageElement[]; scare: HTMLImageElement[] } | null>(null);
  useEffect(() => {
    const load = (p: string) => new Promise<HTMLImageElement>((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(im); im.src = staticFile(p); });
    const s = LINES.map((l) => l[2]).join('') + '你们的一万条评论2万粉丝特别篇上期说觉得突然来电多半没好事近成吓死心慌心里一紧以为真有人给自己打电话怕诈骗妈是领导老师对象条评论谁打来的？◆·JunoVIBE知识大赏0123456789%';
    Promise.all([
      Promise.all(CROPS.feed.map((c) => load(c.f))), Promise.all(CROPS.scare.map((c) => load(c.f))),
      ...[`900 70px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`, `700 40px ${MONO}`].map((x) => document.fonts.load(x, s).catch(() => null)),
    ]).then(([feed, scare]) => { setIM({ feed: feed as HTMLImageElement[], scare: scare as HTMLImageElement[] }); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => {
    if (!IM || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
    const T = f / FPS; draw(g, T, IM);
    if (T >= 8.0 && T < 58.6) mark(g);
    for (const [a, b, s] of LINES.slice(1)) if (T >= a && T < b) sub(g, s, ramp(T, a + 0.02, 0.12) * (1 - ramp(T, b - 0.12, 0.12)));
  }, [f, IM]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

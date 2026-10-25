/* 《你有节奏感吗？》 vertical 1080×1920. The picture is driven by src/events.json, written by music.py together with
   the track, so every pulse, cell and prompt sits exactly on its hit. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { GOLD, INK, SERIF, SANS, txt, rr } from './lib';
import EV from './events.json';

type G = CanvasRenderingContext2D;
export const VW = 1080, VH = 1920, FPS = 30;
export const LEN = (EV as any).len as number;
const BAR = 2, STEP = 0.125;
type E = { t: number; i: string; bar: number; step: number; a: number; n?: number };
const EVENTS = (EV as any).events as E[];
const SEC = (EV as any).sec as Record<string, number>;
const byInst: Record<string, E[]> = {}; for (const e of EVENTS) (byInst[e.i] ||= []).push(e);
const since = (inst: string, T: number) => { const a = byInst[inst] || []; let best = 99; for (const e of a) { if (e.t <= T + 1e-4) best = T - e.t; else break; } return best; };
const lastEv = (inst: string, T: number) => { const a = byInst[inst] || []; let r: E | null = null; for (const e of a) { if (e.t <= T + 1e-4) r = e; else break; } return r; };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const pulse = (dt: number, k = 9) => (dt < 0 || dt > 1 ? 0 : Math.exp(-dt * k));

/* ---------------------------------------------------------------- the rows of the step grid, in order of entry */
const ROWS = [
  { i: 'kick', name: '鼓', col: '#ff5a4f', at: SEC.kick },
  { i: 'clap', name: '拍手', col: '#ffd166', at: SEC.clap },
  { i: 'hat', name: '反拍', col: '#7fd8ff', at: SEC.hat },
  { i: 'bass', name: '低音', col: '#a78bfa', at: SEC.bass },
  { i: 'chords', name: '和弦', col: '#6ee7a8', at: SEC.chords },
  { i: 'melody', name: '旋律', col: '#ff8fd0', at: SEC.melody },
];
export const LINES: [number, number, string][] = [
  [0.1, 1.9, '跟着它，点头'],
  [2.0, 3.9, '这一下，就是一拍'],
  [6.7, 7.95, '每分钟 120 下'],
  [8.0, 9.9, '四拍一组：1、2、3、4'],
  [10.0, 11.9, '第 1 拍最重，叫[强拍]'],
  [12.0, 13.9, '流行歌的巴掌，偏偏拍在[2]和[4]'],
  [14.0, 15.9, '跟我拍：2——4——'],
  [16.0, 17.9, '两拍中间再加一下：[反拍]'],
  [18.0, 19.9, '它开始想跳舞了'],
  [20.0, 21.9, '加上低音，踩在拍子上'],
  [22.0, 23.9, '很稳，但有点呆'],
  [24.0, 25.9, '把低音，错开一点点'],
  [26.0, 27.9, '节奏[有点错位]，人最想动'],
  [28.0, 29.9, '太整齐、太乱，都不想动'],
  [30.0, 31.9, '再铺上四个和弦'],
  [32.0, 33.9, '最后，一句旋律'],
  [34.0, 35.9, '准备——'],
  [38.0, 41.9, '鼓、低音、和弦、旋律：一首歌的骨架'],
  [44.0, 47.9, '跟着拍：[2] 和 [4]'],
  [52.0, 55.9, '鼓停了，心里继续数'],
  [56.0, 58.9, '鼓回来了，你还在拍子上吗？'],
];

/* ---------------------------------------------------------------- pieces */
const bg = (g: G, T: number) => {
  const drop = T >= SEC.drop * BAR && T < SEC.cut * BAR || (T >= SEC.back * BAR && T < 60);
  const b = g.createLinearGradient(0, 0, 0, VH); b.addColorStop(0, drop ? '#14091f' : '#0b0c12'); b.addColorStop(1, '#050507'); g.fillStyle = b; g.fillRect(0, 0, VW, VH);
  const k = pulse(since('kick', T), 6) * (drop ? 0.35 : 0.18); const l = g.createRadialGradient(540, 470, 40, 540, 470, 900); l.addColorStop(0, `rgba(255,90,79,${k})`); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, VW, VH);
  g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 2; for (let y = 0; y < VH; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(VW, y); g.stroke(); }
};
const orb = (g: G, T: number, a: number) => {
  if (a <= 0) return; const dk = since('kick', T), e = lastEv('kick', T), acc = e && e.a && dk < 0.5 ? 1 : 0;
  const drop = T >= SEC.drop * BAR;
  const r = 130 + 70 * pulse(dk, 8) + (acc ? 30 * pulse(dk, 6) : 0);
  g.save(); g.globalAlpha = a;
  for (let k = 0; k < (drop ? 4 : 1); k++) { const d = dk + k * 0.12; const rr2 = r + d * 520; const al = 0.5 * (1 - clamp(d / 0.6)); if (al > 0) { g.strokeStyle = `rgba(255,120,100,${al})`; g.lineWidth = 6; g.beginPath(); g.arc(540, 470, rr2, 0, 7); g.stroke(); } }
  const gr = g.createRadialGradient(540, 540, 10, 540, 470, r); gr.addColorStop(0, '#ffd0c4'); gr.addColorStop(0.45, '#ff5a4f'); gr.addColorStop(1, 'rgba(255,90,79,.0)'); g.fillStyle = gr; g.beginPath(); g.arc(540, 470, r, 0, 7); g.fill();
  if (acc) { const hideLab = (T > 6.5 && T < 8.2) || (T >= SEC.back * BAR && T < SEC.back * BAR + 1.5); g.strokeStyle = GOLD; g.lineWidth = 8; g.beginPath(); g.arc(540, 470, r + 18, 0, 7); g.stroke(); if (!hideLab) txt(g, '强', 540, 500, 84, '#1a0b08', { f: SERIF, w: 700, alpha: pulse(dk, 4) }); }
  g.restore();
};
const counter = (g: G, T: number, a: number) => { // 1 2 3 4 with strong/weak sizes
  if (a <= 0) return; const beat = Math.floor((T % BAR) / 0.5), into = (T % 0.5);
  const showSW = T >= SEC.accent * BAR, labels = ['强', '弱', '次强', '弱'];
  g.save(); g.globalAlpha = a;
  for (let k = 0; k < 4; k++) { const x = 240 + k * 200, on = k === beat, s = showSW ? [1.25, 0.8, 1.0, 0.8][k] : 1; const p = on ? pulse(into, 5) : 0;
    g.fillStyle = on ? (k === 0 && showSW ? GOLD : '#ff5a4f') : 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x, 790, (38 + 14 * p) * s, 0, 7); g.fill();
    txt(g, String(k + 1), x, 808, 46 * s, on ? '#140806' : 'rgba(243,237,226,.7)', { w: 900 });
    if (showSW) txt(g, labels[k], x, 880, 30, k === 0 ? GOLD : 'rgba(243,237,226,.55)', { w: 700, alpha: ramp(T, SEC.accent * BAR + 1.6, 0.4) });
    const clapOn = T >= SEC.clap * BAR && (k === 1 || k === 3); if (clapOn) { g.strokeStyle = '#ffd166'; g.lineWidth = 4; g.beginPath(); g.arc(x, 790, 62 * s, 0, 7); g.stroke(); txt(g, '拍', x, 730, 34, '#ffd166', { w: 900, alpha: 0.6 + 0.4 * (on ? pulse(into, 6) : 0) }); } }
  g.restore();
};
const grid = (g: G, T: number, a: number) => {
  const vis = ROWS.filter((r) => T >= r.at * BAR - 0.4); if (!vis.length || a <= 0) return;
  const bar = Math.floor(T / BAR), x0 = 190, cw = 50, rh = 54, y0 = 960, ph = (T % BAR) / BAR;
  g.save(); g.globalAlpha = a;
  for (let s = 0; s < 16; s++) { const x = x0 + s * cw; if (s % 4 === 0) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x, y0 - 30, cw * 4 - 4, vis.length * rh + 6); } }
  vis.forEach((r, k) => { const y = y0 + k * rh, enter = eo(ramp(T, r.at * BAR - 0.4, 0.4)); g.save(); g.globalAlpha = a * enter; g.translate((1 - enter) * -80, 0);
    txt(g, r.name, 150, y + 12, 32, r.col, { a: 'right', w: 900 });
    const hits = (byInst[r.i] || []).filter((e) => e.bar === bar);
    const sync = r.i === 'bass' && bar >= SEC.sync;
    for (let s = 0; s < 16; s++) { const x = x0 + s * cw + cw / 2, h = hits.find((e) => e.step === s);
      if (!h) { g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); continue; }
      const dt = T - h.t, lit = dt >= 0, p = lit ? pulse(dt, 6) : 0;
      rr(g, x - 20 - 6 * p, y - 20 - 6 * p, 40 + 12 * p, 40 + 12 * p, 9); g.fillStyle = lit ? r.col : 'rgba(0,0,0,0)'; g.globalAlpha = a * enter * (lit ? 0.45 + 0.55 * p : 1); g.fill();
      g.globalAlpha = a * enter; g.strokeStyle = r.col; g.lineWidth = 3; g.stroke();
      if (sync && s % 4 !== 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 30, 0, 7); g.stroke(); } }
    g.restore(); });
  const px = x0 + ph * 16 * cw; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(px - 2, y0 - 34, 4, vis.length * rh + 28);
  if (bar >= SEC.sync && bar < SEC.chords) txt(g, '错位', x0 + 16 * cw + 10, y0 + 3 * rh + 12, 30, GOLD, { a: 'left', w: 900 });
  g.restore();
};
const bpmBadge = (g: G, T: number) => { const a = ramp(T, 6.6, 0.3) * (1 - ramp(T, 8.0, 0.3)); if (a <= 0) return; txt(g, '120', 540, 500, 120, '#1a0b08', { f: SERIF, w: 700, alpha: a }); txt(g, 'BPM · 每分钟 120 拍', 540, 720, 34, 'rgba(243,237,226,.8)', { w: 700, alpha: a }); };
const cite = (g: G, T: number) => { const a = ramp(T, 26, 0.3) * (1 - ramp(T, 29.7, 0.3)); if (a > 0) txt(g, 'Witek 等，2014，PLoS ONE：中等程度的切分，最让人想动', 540, 1500, 24, 'rgba(243,237,226,.55)', { w: 500, alpha: a }); };
const titleCard = (g: G, T: number) => { const k = T - 4.0; if (k < 0 || k > 2.7) return; const a = Math.min(ramp(k, 0, 0.12), 1 - ramp(k, 2.3, 0.4));
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(5,6,11,.82)'; g.fillRect(0, 0, VW, VH);
  txt(g, '音乐 · 节奏 · 从零开始', 540, 700, 32, 'rgba(243,237,226,.7)', { w: 600, ls: 6 });
  const s = 1 + 0.2 * (1 - eo(ramp(k, 0, 0.3))); g.translate(540, 840); g.scale(s, s); g.font = `700 104px ${SERIF}`; g.textAlign = 'center'; const gr = g.createLinearGradient(0, -90, 0, 20); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#b8862e'); g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.45)'; g.shadowBlur = 30; g.fillText('《你有节奏感吗？》', 0, 0); g.restore();
  g.save(); g.globalAlpha = a; for (let k2 = 0; k2 < 4; k2++) { g.fillStyle = k2 === 0 ? GOLD : 'rgba(241,197,109,.45)'; g.beginPath(); g.arc(390 + k2 * 100, 960, k2 === 0 ? 20 : 13, 0, 7); g.fill(); }
  txt(g, '从一拍开始，搭一首歌', 540, 1060, 44, INK, { w: 700 }); txt(g, '— VIBE知识大赏 —', 540, 1130, 26, 'rgba(243,237,226,.5)', { w: 500 }); g.restore(); };
const cutScene = (g: G, T: number) => { const c0 = SEC.cut * BAR, c1 = SEC.back * BAR; if (T < c0 - 0.2 || T > c1 + 1.5) return;
  if (T < c1) { const n = Math.floor((T - c0) / 0.5) % 4 + 1; txt(g, `${n}?`, 540, 520, 160, 'rgba(243,237,226,.18)', { f: SERIF, w: 700 }); }
  else { const a = 1 - ramp(T, c1 + 0.8, 0.6); txt(g, '✓', 540, 540, 200, `rgba(110,231,168,${a})`, { w: 900 }); } };
const endCard = (g: G, T: number) => { const E0 = 60; const k = ramp(T, E0, 0.6); if (k <= 0) return;
  g.save(); g.fillStyle = `rgba(6,7,10,${0.9 * k})`; g.fillRect(0, 0, VW, VH); g.restore();
  const ring = eo(ramp(T, E0 + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(540, 480, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
  txt(g, 'J', 538, 504, 64, GOLD, { f: SERIF, alpha: k * ramp(T, E0 + 0.5, 0.4) }); txt(g, 'JUNO', 540, 556, 20, 'rgba(243,237,226,.7)', { w: 500, alpha: k * ramp(T, E0 + 0.6, 0.4) });
  txt(g, '《你有节奏感吗？》', 540, 680, 64, GOLD, { f: SERIF, w: 700, alpha: k * ramp(T, E0 + 0.4, 0.5) });
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(241,197,109,${(i === 0 ? 1 : 0.45) * k})`; g.beginPath(); g.arc(390 + i * 100, 760, i === 0 ? 18 : 12, 0, 7); g.fill(); }
  txt(g, '你是在第几层跟丢的？', 540, 900, 52, INK, { w: 800, alpha: k * ramp(T, E0 + 0.9, 0.5) });
  txt(g, '评论区告诉我', 540, 970, 40, 'rgba(243,237,226,.8)', { w: 700, alpha: k * ramp(T, E0 + 1.0, 0.5) });
  txt(g, '转给那个说自己没节奏感的朋友', 540, 1060, 34, '#ffd166', { w: 700, alpha: k * ramp(T, E0 + 1.2, 0.5) });
  const pa = k * ramp(T, E0 + 1.4, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(540 - 250, 1130, 500, 74, 37); g.stroke(); g.restore(); txt(g, '关注 Juno · 一起看懂世界', 540, 1180, 32, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：Witek et al. 2014, PLoS ONE · 音乐为本片原创合成', 540, 1290, 22, 'rgba(243,237,226,.45)', { w: 400, alpha: k * ramp(T, E0 + 1.6, 0.5) });
};
const sub = (g: G, T: number) => { for (const [a, b, s] of LINES) if (T >= a - 0.1 && T < b + 0.1) { const al = Math.min(ramp(T, a - 0.1, 0.1), 1 - ramp(T, b, 0.1));
  const parts: { t: string; c: string; w: number }[] = []; const re = /\[([^\]]+)\]|([^[]+)/g; let m; while ((m = re.exec(s))) parts.push(m[1] ? { t: m[1], c: GOLD, w: 900 } : { t: m[2], c: INK, w: 800 });
  g.save(); g.globalAlpha = al; g.textAlign = 'left'; let tw = 0; for (const p of parts) { g.font = `${p.w} 60px ${SANS}`; tw += g.measureText(p.t).width; } let x = 540 - tw / 2;
  for (const p of parts) { g.font = `${p.w} 60px ${SANS}`; g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.95)'; g.strokeText(p.t, x, 1440); g.fillStyle = p.c; g.fillText(p.t, x, 1440); x += g.measureText(p.t).width; }
  g.restore(); break; } };

export const draw = (g: G, T: number) => {
  g.clearRect(0, 0, VW, VH); bg(g, T);
  const cut = T >= SEC.cut * BAR && T < SEC.back * BAR, dim = cut ? 0.15 : 1;
  orb(g, T, dim); bpmBadge(g, T); counter(g, T, (T >= 6.6 ? 1 : 0) * dim); grid(g, T, (T >= SEC.accent * BAR + 4 ? 1 : 0) * dim); cutScene(g, T); cite(g, T);
  txt(g, '◆ Juno · VIBE知识大赏', VW - 50, 230, 22, 'rgba(243,237,226,.5)', { w: 500, a: 'right', alpha: T > 6.7 && T < 60 ? 1 : 0 });
  titleCard(g, T); sub(g, T); endCard(g, T);
};

const CHARS = LINES.map((l) => l[2]).join('') + '强弱次拍错位鼓拍手反拍低音和弦旋律120BPM·每分钟音乐节奏从零开始《你有节奏感吗？》一首歌—VIBE知识大赏✓?Witek等，2014PLoSONE：中等程度的切分最让人想动JUNO是在第几层跟丢的评论区告诉我转给那个说自己没朋友关注Juno一起看懂世界资料etal.为本片原创合成◆';
export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([400, 500, 600, 700, 800, 900].flatMap((w) => [`${w} 60px ${SANS}`, `${w} 60px ${SERIF}`]).map((x) => document.fonts.load(x, CHARS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (ok && ref.current) draw(ref.current.getContext('2d')!, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}>{ok && <canvas ref={ref} width={VW} height={VH} style={{ position: 'absolute', inset: 0 }} />}</AbsoluteFill>;
};

/* Gate 2a: three dark looks for 《为什么有些音放在一起好听》, two style frames each. Everything drawn in code. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

const W = 1920, H = 1080;
type G = CanvasRenderingContext2D;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"', MONO = '"DejaVu Sans Mono"';
const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; glow?: string } = {}) => {
  g.save(); g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 24; } g.fillText(s, x, y); g.restore();
};
const sub = (g: G, s: string) => { g.save(); g.font = `900 74px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 64); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 64); g.restore(); };
const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });
const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

/** Lissajous figure of two tones: x = sin(a·t + ph), y = sin(b·t). */
const liss = (g: G, cx: number, cy: number, R: number, a: number, b: number, col: string, o: { ph?: number; turns?: number; lw?: number; blur?: number; alpha?: number } = {}) => {
  const turns = o.turns ?? 1, N = Math.ceil(1400 * turns);
  g.save(); g.globalAlpha = o.alpha ?? 1; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round';
  const path = () => { g.beginPath(); for (let i = 0; i <= N; i++) { const t = (i / N) * Math.PI * 2 * turns; const x = cx + R * Math.sin(a * t + (o.ph ?? Math.PI / 4)), y = cy - R * Math.sin(b * t); i ? g.lineTo(x, y) : g.moveTo(x, y); } };
  if (o.blur !== 0) { g.shadowColor = col; g.shadowBlur = o.blur ?? 22; g.lineWidth = (o.lw ?? 4) * 2.2; g.globalAlpha = (o.alpha ?? 1) * 0.35; path(); g.stroke(); }
  g.shadowBlur = o.blur === 0 ? 0 : 8; g.globalAlpha = o.alpha ?? 1; g.lineWidth = o.lw ?? 4; path(); g.stroke(); g.restore();
};
/** a slightly mistuned pair drawn as the figure turning: ghost copies at advancing phase */
const turning = (g: G, cx: number, cy: number, R: number, col: string, ghost: string) => {
  for (let k = 5; k >= 1; k--) liss(g, cx, cy, R, 2, 3, ghost, { ph: Math.PI / 4 + k * 0.16, lw: 2.5, blur: 0, alpha: 0.12 + 0.06 * (5 - k) });
  liss(g, cx, cy, R, 2, 3, col, { lw: 5 });
};
/** piano keys C..C (13 semitones), with pressed keys lit */
const keys = (g: G, x0: number, y0: number, w: number, h: number, lit: Record<number, string>, white: string, black: string, edge: string) => {
  const ww = w / 8, wi = [0, 2, 4, 5, 7, 9, 11, 12], bl: [number, number][] = [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]];
  wi.forEach((s, i) => { g.fillStyle = lit[s] ?? white; rrect(g, x0 + i * ww + 3, y0, ww - 6, h, 10); g.fill(); g.strokeStyle = edge; g.lineWidth = 2; g.stroke(); if (lit[s]) glow(g, x0 + (i + 0.5) * ww, y0 + h * 0.6, ww * 1.4, '255,200,120', 0.35); });
  bl.forEach(([s, i]) => { g.fillStyle = lit[s] ?? black; rrect(g, x0 + (i + 1) * ww - ww * 0.3, y0, ww * 0.6, h * 0.62, 8); g.fill(); if (lit[s]) glow(g, x0 + (i + 1) * ww, y0 + h * 0.3, ww, '255,120,90', 0.4); });
};
const QUIZ: [string, string][] = [['A', '音有多高'], ['B', '两个音的比例'], ['C', '弹得多用力']];

/* ================================================================ A · 示波器 (green phosphor on a night desk) */
const deskBg = (g: G) => {
  const b = g.createRadialGradient(W * 0.42, H * 0.42, 50, W * 0.5, H * 0.5, 1300); b.addColorStop(0, '#1b2420'); b.addColorStop(1, '#050706'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  seed = 3; for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
};
const crt = (g: G, x: number, y: number, w: number, h: number) => {
  g.save(); g.fillStyle = '#2a2d2b'; rrect(g, x - 28, y - 28, w + 56, h + 56, 30); g.fill(); g.fillStyle = '#020604'; rrect(g, x, y, w, h, 22); g.fill();
  const s = g.createRadialGradient(x + w / 2, y + h / 2, 30, x + w / 2, y + h / 2, w * 0.7); s.addColorStop(0, 'rgba(60,255,150,.08)'); s.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = s; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(90,255,170,.10)'; g.lineWidth = 1.5; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(x + (w * i) / 10, y); g.lineTo(x + (w * i) / 10, y + h); g.stroke(); } for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(x, y + (h * i) / 8); g.lineTo(x + w, y + (h * i) / 8); g.stroke(); }
  g.restore();
};
const PH = '#5dffa8';
const hookA = (g: G) => {
  deskBg(g);
  crt(g, 150, 120, 560, 470); liss(g, 430, 355, 190, 2, 3, PH); txt(g, 'Do + Sol', 430, 660, 40, PH, { w: 700, f: MONO, glow: 'rgba(93,255,168,.6)' }); txt(g, '好听', 430, 720, 44, '#e8fff2', {});
  crt(g, 830, 120, 560, 470); liss(g, 1110, 355, 190, 1, Math.SQRT2, '#ff9d5c', { turns: 14, lw: 2 }); txt(g, 'Do + 升Fa', 1110, 660, 40, '#ff9d5c', { w: 700, glow: 'rgba(255,157,92,.6)' }); txt(g, '刺耳', 1110, 720, 44, '#ffe9dc', {});
  QUIZ.forEach(([k, v], i) => { const y = 180 + i * 170; g.save(); g.fillStyle = 'rgba(20,40,30,.75)'; rrect(g, 1480, y, 380, 130, 18); g.fill(); g.strokeStyle = 'rgba(93,255,168,.5)'; g.lineWidth = 2; g.stroke(); g.restore(); txt(g, k, 1535, y + 86, 56, PH, { f: MONO, w: 700 }); txt(g, v, 1700, y + 84, 44, '#e8fff2', { w: 700 }); });
  txt(g, '差在哪？', 1670, 130, 44, '#e8fff2');
  mark(g); sub(g, '猜猜：好听和刺耳，差在哪？');
};
const keyA = (g: G) => {
  deskBg(g); crt(g, 230, 110, 820, 690); turning(g, 640, 455, 290, PH, PH);
  txt(g, '3 : 2', 1380, 300, 110, PH, { f: MONO, w: 700, glow: 'rgba(93,255,168,.6)' }); txt(g, '理想的 Sol', 1380, 360, 34, 'rgba(232,255,242,.7)', { w: 500 });
  txt(g, '1.498', 1380, 560, 110, '#ffcf6b', { f: MONO, w: 700, glow: 'rgba(255,207,107,.6)' }); txt(g, '钢琴上的 Sol', 1380, 620, 34, 'rgba(255,240,210,.75)', { w: 500 });
  txt(g, '差了约千分之一 → 图形慢慢转', 1380, 720, 34, '#e8fff2', { w: 700 });
  mark(g); sub(g, '但钢琴上的 Sol，不是 3:2');
};

/* ================================================================ B · 夜琴 (piano under a lamp) */
const pianoBg = (g: G) => {
  const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#0b0a12'); b.addColorStop(1, '#1a1210'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  glow(g, W * 0.5, H * 0.95, 1100, '255,170,90', 0.22);
};
const GOLD = '#ffd38a';
const hookB = (g: G) => {
  pianoBg(g);
  g.fillStyle = '#1c120c'; g.fillRect(0, 660, W, 420);
  keys(g, 460, 670, 1000, 230, { 0: '#fff0c8', 7: '#fff0c8', 6: '#ff9d6a' }, '#7d7262', '#0d0b0a', '#2a2018');
  liss(g, 560, 360, 170, 2, 3, GOLD); txt(g, '好听', 560, 600, 46, '#fff1d6', {});
  liss(g, 1020, 360, 170, 1, Math.SQRT2, '#ff8f6a', { turns: 14, lw: 1.8 }); txt(g, '刺耳', 1020, 600, 46, '#ffe0d4', {});
  QUIZ.forEach(([k, v], i) => { const y = 170 + i * 150; g.save(); g.fillStyle = 'rgba(40,28,20,.7)'; rrect(g, 1380, y, 440, 116, 58); g.fill(); g.strokeStyle = 'rgba(255,211,138,.6)'; g.lineWidth = 2; g.stroke(); g.restore(); txt(g, k, 1440, y + 78, 52, GOLD, { f: SERIF }); txt(g, v, 1620, y + 76, 42, '#fff1d6', { w: 700 }); });
  mark(g); sub(g, '猜猜：好听和刺耳，差在哪？');
};
const keyB = (g: G) => {
  pianoBg(g);
  g.fillStyle = '#1c120c'; g.fillRect(0, 720, W, 360);
  keys(g, 560, 730, 800, 190, { 0: '#fff0c8', 7: '#fff0c8' }, '#7d7262', '#0d0b0a', '#2a2018');
  turning(g, 960, 370, 270, GOLD, GOLD);
  txt(g, '3 : 2', 400, 360, 96, 'rgba(255,241,214,.85)', { f: SERIF }); txt(g, '理想', 400, 420, 32, 'rgba(255,241,214,.6)', { w: 500 });
  txt(g, '1.498', 1520, 360, 96, GOLD, { f: SERIF, glow: 'rgba(255,211,138,.5)' }); txt(g, '钢琴', 1520, 420, 32, 'rgba(255,241,214,.6)', { w: 500 });
  mark(g); sub(g, '但钢琴上的 Sol，不是 3:2');
};

/* ================================================================ C · 墨金 (ink paper, bamboo pipes, Zhu Zaiyu) */
const inkBg = (g: G) => {
  const b = g.createRadialGradient(W / 2, H * 0.45, 100, W / 2, H / 2, 1200); b.addColorStop(0, '#1d2433'); b.addColorStop(1, '#0a0d14'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  seed = 9; for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(200,210,230,${rnd() * 0.03})`; g.lineWidth = 1; g.beginPath(); const y = rnd() * H; g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + rnd() * 30, W * 0.7, y - rnd() * 30, W, y + rnd() * 10); g.stroke(); }
};
const AU = '#e8c27a', SEAL = '#c8442f';
const pipe = (g: G, x: number, y: number, h: number, lit: boolean) => {
  const gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, lit ? '#8a6a32' : '#3d3a2c'); gr.addColorStop(0.5, lit ? '#f0d08a' : '#6d6650'); gr.addColorStop(1, lit ? '#7a5a2a' : '#34312a');
  g.fillStyle = gr; rrect(g, x - 22, y - h, 44, h, 8); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 1; k < 3; k++) g.fillRect(x - 22, y - h + (h * k) / 3, 44, 4);
  if (lit) glow(g, x, y - h / 2, 120, '232,194,122', 0.25);
};
const hookC = (g: G) => {
  inkBg(g);
  liss(g, 520, 380, 200, 2, 3, AU); txt(g, '宫 + 徵', 520, 650, 40, AU, { f: SERIF }); txt(g, '好听', 520, 710, 42, '#f4ead6', { f: SERIF });
  liss(g, 1040, 380, 200, 1, Math.SQRT2, SEAL, { turns: 14, lw: 2 }); txt(g, 'Do + 升Fa', 1040, 650, 40, '#ff8a70', { f: SERIF }); txt(g, '刺耳', 1040, 710, 42, '#f4ead6', { f: SERIF });
  QUIZ.forEach(([k, v], i) => { const y = 200 + i * 160; g.strokeStyle = 'rgba(232,194,122,.6)'; g.lineWidth = 2; rrect(g, 1400, y, 420, 120, 6); g.stroke(); g.fillStyle = SEAL; g.fillRect(1418, y + 18, 84, 84); txt(g, k, 1460, y + 84, 56, '#f4ead6', { f: SERIF }); txt(g, v, 1650, y + 80, 42, '#f4ead6', { f: SERIF }); });
  mark(g); sub(g, '猜猜：好听和刺耳，差在哪？');
};
const keyC = (g: G) => {
  inkBg(g);
  let L = 520; const base = 760;
  for (let i = 0; i < 12; i++) { pipe(g, 180 + i * 62, base, L * 0.62, i === 0 || i === 11); L = L * (i % 2 ? 4 / 3 : 2 / 3); if (L < 260) L *= 2; }
  txt(g, '三分损益：一次次 × 3/2', 520, 840, 34, 'rgba(244,234,214,.7)', { f: SERIF, w: 700 });
  g.fillStyle = SEAL; g.fillRect(1180, 170, 96, 300); ['朱', '载', '堉'].forEach((c, i) => txt(g, c, 1228, 240 + i * 90, 66, '#f4ead6', { f: SERIF }));
  txt(g, '1584', 1320, 250, 72, AU, { f: SERIF, a: 'left' }); txt(g, '明', 1320, 330, 48, 'rgba(244,234,214,.75)', { f: SERIF, a: 'left' });
  txt(g, '¹²√2 = 1.059463…', 1180, 600, 76, AU, { f: SERIF, a: 'left', glow: 'rgba(232,194,122,.45)' });
  txt(g, '每个半音，一样大', 1180, 680, 40, '#f4ead6', { f: SERIF, a: 'left' });
  mark(g); sub(g, '1584年，明朝的朱载堉算准了它');
};

export const LOOKS: { t: string; draw: (g: G) => void }[] = [
  { t: 'A 示波器 · 开头', draw: hookA }, { t: 'A 示波器 · 反转', draw: keyA },
  { t: 'B 夜琴 · 开头', draw: hookB }, { t: 'B 夜琴 · 反转', draw: keyB },
  { t: 'C 墨金 · 开头', draw: hookC }, { t: 'C 墨金 · 朱载堉', draw: keyC },
];

export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '猜好听和刺耳差在哪音有多高两个的比例弹得用力但钢琴上不是理想图形慢转约千分之一了宫徵升三损益次朱载堉明每半一样大年算准它算DoSolFa◆·JunoVIBE知识大赏0123456789.:→¹²√…ABC';
    Promise.all([`900 74px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`, `700 40px ${SERIF}`, `700 40px ${MONO}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); LOOKS[f].draw(g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

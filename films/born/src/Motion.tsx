/* 10 s motion test, look A: the tree doubles generation by generation, blooms into a haze, collapses into a net, then everything dims except the one golden line to you. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, G, GOLD, INK, SERIF, SANS, txt, glow, mark, sub, setSeed, rnd, pos, edge, lineage, ROOT, PO } from './Looks';

export const MOTION_LEN = 300;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerpP = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const sky = (g: G) => { const b = g.createRadialGradient(960, 830, 50, 960, 500, 1300); b.addColorStop(0, '#16152a'); b.addColorStop(1, '#03040a'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(3); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(220,225,255,${rnd() * 0.4})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 1.4 + 0.2, 0, 7); g.fill(); } };
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const draw = (g: G, T: number) => {
  sky(g);
  /* layout morphs: early tree (gmax 6) -> full tree (gmax 11) -> collapsed net */
  const grow = eio(ramp(T, 3.0, 1.6)), coll = eio(ramp(T, 5.6, 1.8));
  const A: PO = { gmax: 6, top: 170 }, B: PO = { gmax: 11 }, C: PO = { gmax: 11, collapse: 1 };
  const P = (gen: number, i: number) => { const a = pos(gen, i, A), b = pos(gen, i, B), c = pos(gen, i, C); return lerpP(lerpP(a, b, grow), c, coll); };
  const shown = Math.min(11, T < 3.0 ? T / 0.5 : 6 + (T - 3.0) / 0.32);   // generations revealed
  const dim = 1 - 0.85 * eio(ramp(T, 7.6, 1.0));
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let gen = 0; gen < Math.ceil(shown); gen++) {
    const k = clamp(shown - gen), n = 2 ** gen;
    g.strokeStyle = coll > 0.5 ? '#a9b8ff' : '#ffd99a'; g.lineWidth = Math.max(0.4, 3.2 - gen * 0.27);
    g.globalAlpha = k * dim * Math.max(0.07, 0.9 - gen * 0.075);
    for (let i = 0; i < n; i++) { const a = P(gen, i); for (const j of [2 * i, 2 * i + 1]) { const b = P(gen + 1, j); edge(g, a, k < 1 ? lerpP(a, b, k) : b); } }
  }
  g.restore();
  /* golden line draws upward from you */
  const gl = eio(ramp(T, 7.9, 1.8)) * 11;
  if (gl > 0) { g.save(); g.strokeStyle = GOLD; g.shadowColor = GOLD; g.shadowBlur = 24; g.lineWidth = 5;
    for (let gen = 0; gen < Math.ceil(gl); gen++) { const lo = lineage(gen, C), hi = lineage(gen + 1, C); const a = P(gen, lo), b = P(gen + 1, hi), k = clamp(gl - gen); edge(g, a, k < 1 ? lerpP(a, b, k) : b); }
    g.restore(); if (gl >= 11) glow(g, P(11, lineage(11, C)).x, P(11, lineage(11, C)).y, 200, '241,197,109', 0.4 * ramp(T, 9.7, 0.3)); }
  /* you */
  glow(g, ROOT.x, ROOT.y, 150, '241,197,109', 0.6); g.fillStyle = GOLD; g.beginPath(); g.arc(ROOT.x, ROOT.y, 16, 0, 7); g.fill(); txt(g, '你', ROOT.x + 44, ROOT.y + 14, 40, INK, { a: 'left' });
  /* counter */
  const gens = T < 3.0 ? Math.floor(shown) : Math.min(40, Math.floor(6 + (T - 3.0) * 13));
  const ca = 1 - ramp(T, 5.4, 0.4);
  if (gens >= 1 && ca > 0) { txt(g, `第 ${gens} 代`, 120, 140, 34, 'rgba(243,237,226,.7)', { a: 'left', w: 700, alpha: ca }); txt(g, fmt(2 ** gens), 120, 230, gens > 20 ? 64 : 84, GOLD, { a: 'left', f: SERIF, alpha: ca, glow: 'rgba(241,197,109,.5)' }); }
  mark(g);
  const line = T < 3.0 ? '每往上一代，翻一倍' : T < 5.6 ? '往上40代：约1.1万亿个位置' : T < 7.8 ? '很多位置，是同一个人' : '通向你的那条线，一次都没断';
  sub(g, line);
};

export const Motion: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '每往上一代翻倍40约1.1万亿个位置很多是同人通向你的那条线次都没断第代◆·JunoVIBE知识大赏0123456789,';
    Promise.all([`900 70px ${SANS}`, `700 34px ${SANS}`, `900 84px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

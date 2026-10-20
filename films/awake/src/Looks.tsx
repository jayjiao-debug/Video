/* 《越熬越精神》 gate: three looks × (hook frame, key data frame) */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, clamp, FONT_CHARS } from './lib';
import { bedroom, facade, dial } from './sets';

/* the two forces on one time axis (07:30 → next 07:30); illustrative shapes, not measured units */
export const forces = (g: G, x0: number, y0: number, w: number, h: number, o: { band?: boolean; pin?: number; alpha?: number } = {}) => {
  const a = o.alpha ?? 1; const X = (hr: number) => x0 + ((hr - 7.5) / 24) * w; const Y = (v: number) => y0 + h - v * h;
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(6,8,16,.72)'; g.beginPath(); g.roundRect(x0 - 40, y0 - 70, w + 80, h + 140, 18); g.fill();
  /* axis + ticks */
  g.strokeStyle = 'rgba(243,237,226,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 + h); g.lineTo(x0 + w, y0 + h); g.stroke();
  [[7.5, '07:30'], [12, '12:00'], [18, '18:00'], [24, '00:00'], [26, '02:00'], [31.5, '07:30']].forEach(([hr, s]) => { const x = X(hr as number); g.strokeStyle = 'rgba(243,237,226,.35)'; g.beginPath(); g.moveTo(x, y0 + h); g.lineTo(x, y0 + h + 10); g.stroke(); mono(g, s as string, x, y0 + h + 42, 24, 'rgba(243,237,226,.6)'); });
  /* band */
  if (o.band) { g.fillStyle = 'rgba(241,197,109,.14)'; g.fillRect(X(21.3), y0 - 20, X(23.3) - X(21.3), h + 20); g.strokeStyle = 'rgba(241,197,109,.6)'; g.setLineDash([6, 6]); g.strokeRect(X(21.3), y0 - 20, X(23.3) - X(21.3), h + 20); g.setLineDash([]); txt(g, '禁睡区', (X(21.3) + X(23.3)) / 2, y0 - 32, 30, GOLD, { w: 900 }); }
  /* sleep pressure: rises while awake, falls in sleep */
  g.strokeStyle = 'rgba(176,186,210,.95)'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 200; k++) { const hr = 7.5 + (24 * k) / 200; const v = hr <= 26 ? 0.08 + 0.82 * (1 - Math.exp(-(hr - 7.5) / 11)) / (1 - Math.exp(-18.5 / 11)) : 0.9 * Math.exp(-(hr - 26) / 2.6); k ? g.lineTo(X(hr), Y(v)) : g.moveTo(X(hr), Y(v)); } g.stroke();
  /* alerting: climbs through the day, peaks 1–3 h before habitual bedtime (00:18), collapses after */
  g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 200; k++) { const hr = 7.5 + (24 * k) / 200; const S = clamp((hr - 7.5) / 13), D = hr < 22.3 ? 1 : Math.exp(-(hr - 22.3) / 1.1), bump = Math.exp(-Math.pow((hr - 22.3) / 1.3, 2)); const v = (0.12 + 0.5 * S) * D + 0.24 * bump; k ? g.lineTo(X(hr), Y(v)) : g.moveTo(X(hr), Y(v)); } g.stroke();
  txt(g, '睡眠压力', X(14), Y(0.66) - 14, 26, 'rgba(243,237,226,.85)', { w: 700 }); txt(g, '生物钟的清醒信号', X(15.5), Y(0.44) + 72, 26, 'rgba(243,237,226,.85)', { w: 700 });
  g.fillStyle = 'rgba(176,186,210,.95)'; g.fillRect(X(14) - 92, Y(0.66) - 24, 16, 3); g.fillStyle = GOLD; g.fillRect(X(15.5) - 132, Y(0.44) + 62, 16, 3);
  if (o.pin !== undefined) { const x = X(o.pin); g.fillStyle = INK; g.beginPath(); g.moveTo(x, y0 + h - 4); g.lineTo(x - 10, y0 + h - 24); g.lineTo(x + 10, y0 + h - 24); g.fill(); mono(g, '22:30 躺下', x, y0 + h - 34, 24, INK); }
  g.restore();
};

const bigTime = (g: G, s: string) => mono(g, s, 1700, 560, 120, 'rgba(243,237,226,.92)', { f: SERIF, glow: 'rgba(0,0,0,.8)' });

const A1 = (g: G) => { bedroom(g, { lamp: 0, phone: 1, flick: 0.4, day: 0, clock: '22:30' }); grain(g); vignette(g); bigTime(g, '22:30'); mark(g); subtitle(g, '一躺下，突然清醒'); };
const A2 = (g: G) => { bedroom(g, { lamp: 0, phone: 0.7, day: 0, clock: '00:18' }); grain(g); vignette(g); forces(g, 260, 420, 1400, 360, { band: true, pin: 22.5 }); mark(g); subtitle(g, '你10点半躺下，正好躺进[禁睡区]'); };
const B1 = (g: G) => { facade(g, { hour: 5, focus: 1 }); grain(g); vignette(g, 0.4); mono(g, '02:00', 960, 140, 90, INK, { f: SERIF }); mark(g); subtitle(g, '凌晨两点，还亮着的那扇窗'); };
const B2 = (g: G) => { facade(g, { hour: 2.5, focus: 0.4 }); grain(g); vignette(g, 0.4); forces(g, 260, 330, 1400, 360, { band: true, pin: 22.5 }); mark(g); subtitle(g, '它推得最猛，是你习惯入睡前的1到3小时'); };
const C1 = (g: G) => { dial(g, 960, 470, 360, { hand: 22.5 }); const b = g.createRadialGradient(960, 470, 10, 960, 470, 300); b.addColorStop(0, 'rgba(150,190,255,.45)'); b.addColorStop(1, 'rgba(150,190,255,0)'); g.fillStyle = b; g.fillRect(0, 0, W, H); mono(g, '22:30', 960, 495, 80, INK, { f: SERIF }); grain(g); mark(g); subtitle(g, '一躺下，突然清醒'); };
const C2 = (g: G) => { dial(g, 960, 470, 360, { pressure: 1, alert: 1, band: [21.3, 23.3], hand: 22.5 }); txt(g, '禁睡区', 960 + Math.cos(((22.3 / 24) * 2 - 0.5) * Math.PI) * 470, 470 + Math.sin(((22.3 / 24) * 2 - 0.5) * Math.PI) * 470, 34, GOLD); txt(g, '睡眠压力', 1500, 700, 28, 'rgba(243,237,226,.8)', { w: 700 }); txt(g, '清醒信号', 1500, 750, 28, GOLD, { w: 700 }); grain(g); mark(g); subtitle(g, '睡眠学家叫它：[禁睡区]'); };

export const LOOKS = [A1, A2, B1, B2, C1, C2];
export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '一躺下突然清醒你点半正好进禁睡区凌晨两还亮着的那扇窗它推得最猛是习惯入前到小时学家叫睡眠压力生物钟清醒信号';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `700 26px ${SANS}`, `700 120px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); LOOKS[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

/* 2D puppet motion test: a flat-illustrated room at night, rain on the window, one warm lamp; the puppet sits, breathes,
   turns toward the window, lifts a hand to its ear, lowers it. Slow push-in. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, SANS, mark, grain, vignette, glow, rr, setSeed, rnd, ramp, eio, FONT_CHARS } from './lib';
import { drawPuppet, proj, View, SEAT_Y, PUPPET_DUR } from './Puppet2D';
export const P2D_LEN = Math.round(PUPPET_DUR * 30);

export const room2D = (g: G, t: number) => {
  /* wall */
  const wall = g.createLinearGradient(0, 0, 0, 760); wall.addColorStop(0, '#1c2430'); wall.addColorStop(1, '#2a323c'); g.fillStyle = wall; g.fillRect(0, 0, W, 760);
  g.strokeStyle = 'rgba(255,255,255,.025)'; g.lineWidth = 2; for (let x = 0; x < W; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 760); g.stroke(); }
  /* floor boards */
  const fl = g.createLinearGradient(0, 760, 0, H); fl.addColorStop(0, '#2b241f'); fl.addColorStop(1, '#16120f'); g.fillStyle = fl; g.fillRect(0, 760, W, H - 760);
  g.strokeStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 9; i++) { const y = 772 + i * i * 4.2 + i * 10; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#20262e'; g.fillRect(0, 748, W, 14);
  /* window, right: night, city lights blurred, rain */
  const wx = 1300, wy = 150, ww = 470, wh = 520;
  const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#0d1626'); sky.addColorStop(1, '#1d2a3c'); g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
  setSeed(4); for (let i = 0; i < 40; i++) glow(g, wx + rnd() * ww, wy + wh * 0.45 + rnd() * wh * 0.55, 10 + rnd() * 22, rnd() < 0.6 ? '255,190,120' : '150,190,255', 0.25 + rnd() * 0.3);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); g.strokeStyle = 'rgba(190,210,235,.35)'; g.lineWidth = 1.6; setSeed(9);
  for (let i = 0; i < 90; i++) { const x = wx + rnd() * ww, sp = 0.6 + rnd(); const y = wy + ((rnd() * wh + t * 260 * sp) % (wh + 60)) - 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 18 + rnd() * 16); g.stroke(); }
  g.fillStyle = 'rgba(200,220,240,.18)'; setSeed(12); for (let i = 0; i < 26; i++) { const x = wx + rnd() * ww, y = wy + ((rnd() * wh + t * 40 * (0.3 + rnd())) % wh); g.beginPath(); g.ellipse(x, y, 3, 4.5, 0, 0, 7); g.fill(); }
  g.restore();
  g.strokeStyle = '#3a3129'; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 10; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.42); g.lineTo(wx + ww, wy + wh * 0.42); g.stroke();
  g.fillStyle = '#4a3c30'; g.fillRect(wx - 24, wy + wh, ww + 48, 18);
  /* moonlit patch on the floor from the window */
  g.save(); g.globalAlpha = 0.07; g.fillStyle = '#8fb0d8'; g.beginPath(); g.moveTo(wx - 40, 780); g.lineTo(wx + ww - 40, 780); g.lineTo(wx + ww - 380, H); g.lineTo(wx - 520, H); g.closePath(); g.fill(); g.restore();
  /* lamp on a side table, left */
  const lx = 380; g.fillStyle = '#2e2620'; rr(g, lx - 110, 560, 220, 22, 6); g.fill(); g.fillRect(lx - 8, 580, 16, 180); g.fillRect(lx - 70, 752, 140, 10);
  g.fillStyle = '#3a3029'; g.fillRect(lx - 4, 440, 8, 122); g.fillStyle = '#5a4a3a'; rr(g, lx - 40, 548, 80, 14, 6); g.fill();
  const shade = g.createLinearGradient(lx - 90, 0, lx + 90, 0); shade.addColorStop(0, '#d9b98a'); shade.addColorStop(0.5, '#f6dfb4'); shade.addColorStop(1, '#c79e6c'); g.fillStyle = shade; g.beginPath(); g.moveTo(lx - 60, 360); g.lineTo(lx + 60, 360); g.lineTo(lx + 95, 450); g.lineTo(lx - 95, 450); g.closePath(); g.fill();
};
export const lampLight = (g: G, t: number) => { const flick = 1 + 0.02 * Math.sin(t * 13) * Math.sin(t * 5.3); g.save(); g.globalCompositeOperation = 'screen'; glow(g, 380, 430, 900, '255,170,90', 0.26 * flick); glow(g, 380, 420, 180, '255,225,170', 0.5 * flick); g.restore(); };

/* a flat wooden chair in the same projection as the puppet */
export const chair2D = (g: G, w: View) => {
  const y = SEAT_Y, xs = 0.21, z0 = -0.24, z1 = 0.2; const p = (x: number, yy: number, z: number) => proj([x, yy, z], w);
  const leg = (x: number, z: number, top: number) => { const a = p(x, top, z), b = p(x, 0, z); g.strokeStyle = '#3b2a1e'; g.lineWidth = 0.04 * w.s; g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); };
  leg(-xs, z0, 0.98); leg(xs, z0, 0.98);
  /* backrest slats */
  for (const yy of [0.62, 0.78, 0.94]) { const a = p(-xs, yy, z0), b = p(xs, yy, z0); g.strokeStyle = '#4a3424'; g.lineWidth = 0.05 * w.s; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  leg(-xs, z1, y); leg(xs, z1, y);
  const c = [p(-xs, y, z0), p(xs, y, z0), p(xs, y, z1), p(-xs, y, z1)]; g.fillStyle = '#5a4130'; g.beginPath(); c.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.stroke();
  const f = [p(-xs, y, z1), p(xs, y, z1), p(xs, y - 0.04, z1), p(-xs, y - 0.04, z1)]; g.fillStyle = '#3e2c20'; g.beginPath(); f.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); g.fill();
};

const draw = (g: G, t: number) => {
  const z = 1 + 0.12 * eio(ramp(t, 0, PUPPET_DUR)); g.save(); g.translate(860, 600); g.scale(z, z); g.translate(-860, -600);
  room2D(g, t);
  const view: View = { cx: 860, gy: 760, s: 470, yaw: -0.5 };
  /* floor shadow */
  g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(900, 765, 230, 26, 0, 0, 7); g.fill(); g.restore();
  chair2D(g, view); drawPuppet(g, t, view, 'wood');
  /* cool window light on the puppet's right side and warm lamp light: the grade */
  lampLight(g, t);
  g.save(); g.globalCompositeOperation = 'multiply'; const v = g.createLinearGradient(0, 0, W, 0); v.addColorStop(0, 'rgb(240,225,205)'); v.addColorStop(0.55, 'rgb(200,208,222)'); v.addColorStop(1, 'rgb(180,195,220)'); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore();
  g.restore();
  grain(g, 9, 0.06); vignette(g, 0.62); mark(g);
};
export const Puppet2DTest: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { document.fonts.load(`500 22px ${SANS}`, FONT_CHARS).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

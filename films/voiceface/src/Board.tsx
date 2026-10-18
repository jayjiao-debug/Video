/* 《声音好听的人，是不是长得丑？》 gate 2a: three dark looks (frames 0–5) and a storyboard in look A (frames 6+). All drawn in code. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

export const W = 1920, H = 1080;
export type G = CanvasRenderingContext2D;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const gauss = () => { const u = Math.max(1e-9, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
export const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"';
export const GOLD = '#f1c56d';
type TO = { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number };
export const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: TO = {}) => {
  g.save(); g.globalAlpha = o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 26; } g.fillText(s, x, y); g.restore();
};
export const sub = (g: G, s: string) => { if (!s) return; g.save(); g.font = `900 74px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 64); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 64); g.restore(); };
export const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });
export const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
export const rrect = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

/* ---------------------------------------------------------------- shared: line-art portrait */
type Face = { hair: 'short' | 'long' | 'bun'; jaw: number; eye: number; smile: number };
export const FACES: Record<string, Face> = { ideal: { hair: 'long', jaw: 0.2, eye: 0.15, smile: 0.035 }, plain: { hair: 'short', jaw: 0.27, eye: 0.13, smile: 0.012 }, man: { hair: 'short', jaw: 0.29, eye: 0.14, smile: 0.02 } };
export const face = (g: G, cx: number, cy: number, s: number, p: Face, col: string, o: { lw?: number; glowCol?: string; alpha?: number; fill?: string } = {}) => {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = o.alpha ?? 1; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  const lw = (o.lw ?? 3) / s;
  const strokes: (() => void)[] = [];
  const P = (f: () => void) => strokes.push(f);
  // shoulders + neck
  P(() => { g.beginPath(); g.moveTo(-0.13, 0.46); g.lineTo(-0.15, 0.8); g.bezierCurveTo(-0.35, 0.9, -0.66, 0.92, -0.78, 1.15); g.moveTo(0.13, 0.46); g.lineTo(0.15, 0.8); g.bezierCurveTo(0.35, 0.9, 0.66, 0.92, 0.78, 1.15); g.stroke(); });
  // head
  P(() => { g.beginPath(); g.moveTo(0, -0.56); g.bezierCurveTo(0.33, -0.56, 0.4, -0.22, 0.37, 0.05); g.bezierCurveTo(0.35, 0.3, p.jaw + 0.03, 0.45, 0, 0.56); g.bezierCurveTo(-p.jaw - 0.03, 0.45, -0.35, 0.3, -0.37, 0.05); g.bezierCurveTo(-0.4, -0.22, -0.33, -0.56, 0, -0.56); g.stroke(); });
  // ears
  P(() => { for (const d of [-1, 1]) { g.beginPath(); g.moveTo(d * 0.37, 0.0); g.bezierCurveTo(d * 0.46, -0.03, d * 0.46, 0.17, d * 0.36, 0.17); g.stroke(); } });
  // eyes, brows
  P(() => { for (const d of [-1, 1]) { const ex = d * p.eye, ey = 0.04; g.beginPath(); g.moveTo(ex - 0.065, ey); g.quadraticCurveTo(ex, ey - 0.045, ex + 0.065, ey); g.quadraticCurveTo(ex, ey + 0.03, ex - 0.065, ey); g.stroke();
    g.beginPath(); g.arc(ex, ey - 0.002, 0.016, 0, 7); g.fillStyle = col; g.fill();
    g.beginPath(); g.moveTo(ex - 0.08, ey - 0.085); g.quadraticCurveTo(ex, ey - 0.12, ex + 0.08, ey - 0.09); g.stroke(); } });
  // nose, mouth
  P(() => { g.beginPath(); g.moveTo(0.015, 0.08); g.quadraticCurveTo(0.045, 0.19, 0.035, 0.22); g.quadraticCurveTo(0.01, 0.24, -0.025, 0.225); g.stroke();
    g.beginPath(); g.moveTo(-0.075, 0.33); g.quadraticCurveTo(0, 0.33 + p.smile * 2, 0.075, 0.33); g.stroke(); });
  // hair
  P(() => { g.beginPath();
    if (p.hair === 'long') { g.moveTo(-0.34, 0.6); g.bezierCurveTo(-0.5, 0.2, -0.5, -0.55, -0.05, -0.66); g.bezierCurveTo(0.42, -0.7, 0.55, -0.2, 0.44, 0.25); g.bezierCurveTo(0.42, 0.45, 0.46, 0.58, 0.36, 0.66);
      g.moveTo(-0.05, -0.66); g.bezierCurveTo(-0.12, -0.4, -0.3, -0.3, -0.38, -0.12); g.moveTo(0.02, -0.64); g.bezierCurveTo(0.12, -0.42, 0.28, -0.32, 0.39, -0.16); }
    else if (p.hair === 'bun') { g.arc(0, -0.7, 0.14, 0, 7); g.moveTo(-0.38, -0.05); g.bezierCurveTo(-0.42, -0.5, 0.42, -0.5, 0.38, -0.05); }
    else { g.moveTo(-0.38, -0.02); g.bezierCurveTo(-0.44, -0.48, -0.2, -0.66, 0.04, -0.64); g.bezierCurveTo(0.3, -0.62, 0.46, -0.45, 0.38, -0.02); g.moveTo(-0.3, -0.34); g.bezierCurveTo(-0.1, -0.28, 0.15, -0.42, 0.33, -0.3); }
    g.stroke(); });
  if (o.glowCol) { g.shadowColor = o.glowCol; g.shadowBlur = 30; g.lineWidth = lw * 2.4; g.globalAlpha = (o.alpha ?? 1) * 0.35; strokes.forEach((f) => f()); }
  g.shadowBlur = o.glowCol ? 10 : 0; g.globalAlpha = o.alpha ?? 1; g.lineWidth = lw; strokes.forEach((f) => f());
  g.restore();
};

/* ---------------------------------------------------------------- shared: data */
export const cloud = (n: number, r: number, s0: number) => { seed = s0; const pts: [number, number][] = []; for (let i = 0; i < n; i++) { const a = gauss(), b = gauss(); pts.push([a, r * a + Math.sqrt(1 - r * r) * b]); } return pts; };
type PlotStyle = { axis: string; dot: string; hot?: string; label: string; font?: string };
export const scatter = (g: G, x0: number, y0: number, w: number, h: number, pts: [number, number][], st: PlotStyle, o: { r?: number; hotX?: number; dotR?: number; star?: boolean } = {}) => {
  g.save(); g.strokeStyle = st.axis; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 + h); g.lineTo(x0 + w, y0 + h); g.stroke();
  txt(g, '声音好听 →', x0 + w, y0 + h + 52, 30, st.label, { w: 700, a: 'right', f: st.font }); g.save(); g.translate(x0 - 30, y0); g.rotate(-Math.PI / 2); txt(g, '← 长得好看', 0, 0, 30, st.label, { w: 700, a: 'right', f: st.font }); g.restore();
  const X = (v: number) => x0 + w / 2 + v * (w / 6.4), Y = (v: number) => y0 + h / 2 - v * (h / 6.4);
  if (o.hotX !== undefined) { g.fillStyle = 'rgba(241,197,109,.10)'; g.fillRect(X(o.hotX), y0, x0 + w - X(o.hotX), h); }
  for (const [a, b] of pts) { const hot = o.hotX !== undefined && a > o.hotX; const R = (o.dotR ?? 8) * (hot ? 1.25 : 1);
    if (o.star) glow(g, X(a), Y(b), R * 4, hot ? '241,197,109' : '200,215,255', 0.35);
    g.fillStyle = hot ? (st.hot ?? GOLD) : st.dot; g.beginPath(); g.arc(X(a), Y(b), R, 0, 7); g.fill(); }
  if (o.r !== undefined) { g.strokeStyle = st.hot ?? GOLD; g.lineWidth = 4; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(X(-3), Y(-3 * o.r)); g.lineTo(X(3), Y(3 * o.r)); g.stroke(); g.setLineDash([]); }
  g.restore(); return { X, Y };
};
export const quiz = (g: G, x: number, y: number, card: (k: string, v: string, i: number, y: number) => void) => [['A', '越好听越丑'], ['B', '越好听越好看'], ['C', '没什么关系']].forEach(([k, v], i) => card(k, v, i, y + i * 150));
export const wave = (g: G, x0: number, y: number, w: number, amp: number, col: string, s0 = 2, n = 64, bw = 0.55) => { seed = s0; const step = w / n; g.fillStyle = col; for (let i = 0; i < n; i++) { const e = Math.sin((i / n) * Math.PI) ** 0.6, a = amp * e * (0.25 + 0.75 * rnd()); rrect(g, x0 + i * step, y - a, step * bw, 2 * a, step * 0.3); g.fill(); } };

/* ================================================================ Look A · 深夜电台 (radio booth, warm practical light) */
export const booth = (g: G, onAir: boolean | number = true) => {
  const oa = typeof onAir === 'number' ? onAir : onAir ? 1 : 0;
  const b = g.createRadialGradient(W * 0.3, H * 0.4, 50, W * 0.4, H * 0.5, 1500); b.addColorStop(0, '#2a1d16'); b.addColorStop(1, '#07050a'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  // acoustic foam wall
  for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) { const x = c * 124, y = r * 110, v = (r + c) % 2; const gr = g.createLinearGradient(x, y, v ? x + 124 : x, v ? y : y + 110); gr.addColorStop(0, 'rgba(255,220,180,.035)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(x + 3, y + 3, 118, 104); }
  g.fillStyle = '#2a0d0c'; rrect(g, 1440, 80, 240, 84, 12); g.fill(); g.strokeStyle = oa > 0.05 ? '#ff5a4a' : '#4a2420'; g.lineWidth = 3; g.stroke();
  if (oa > 0.01) glow(g, 1560, 120, 260, '255,70,60', 0.35 * oa);
  txt(g, 'ON AIR', 1560, 138, 46, oa > 0.05 ? `rgba(255,106,90,${0.3 + 0.7 * oa})` : '#5a2a24', oa > 0.05 ? { glow: 'rgba(255,90,74,.9)' } : {});
  // desk
  const d = g.createLinearGradient(0, 860, 0, H); d.addColorStop(0, '#3a271b'); d.addColorStop(1, '#120b07'); g.fillStyle = d; g.fillRect(0, 860, W, 220); g.fillStyle = 'rgba(255,190,120,.18)'; g.fillRect(0, 860, W, 3);
};
export const mic = (g: G, x: number, y: number, s: number, lit = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#1b1512'; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 330); g.lineTo(0, 520); g.moveTo(0, 520); g.lineTo(-260, 760); g.stroke();
  g.strokeStyle = '#5a4a3c'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 170, 150, 46, 0, 0, 7); g.stroke();
  const body = g.createLinearGradient(-90, 0, 90, 0); body.addColorStop(0, '#1a1614'); body.addColorStop(0.7, '#4a3e34'); body.addColorStop(0.92, `rgba(255,190,110,${0.9 * lit})`); body.addColorStop(1, '#2a221c');
  g.fillStyle = body; rrect(g, -90, -120, 180, 440, 90); g.fill();
  g.save(); rrect(g, -86, -116, 172, 210, 86); g.clip(); g.strokeStyle = 'rgba(255,220,170,.22)'; g.lineWidth = 2; for (let i = -120; i < 100; i += 12) { g.beginPath(); g.moveTo(-90, i); g.lineTo(90, i); g.stroke(); } for (let i = -90; i < 90; i += 12) { g.beginPath(); g.moveTo(i, -120); g.lineTo(i, 100); g.stroke(); } g.restore();
  g.fillStyle = '#0d0b0a'; g.fillRect(-92, 96, 184, 12);
  g.restore(); glow(g, x + 80 * s, y + 40 * s, 220 * s, '255,180,100', 0.25 * lit);
};
export const AMB = '#ffb46a';
export const stA: PlotStyle = { axis: 'rgba(255,220,180,.45)', dot: 'rgba(255,222,190,.75)', hot: GOLD, label: 'rgba(255,230,200,.7)' };
export const glass = (g: G, x: number, y: number, w: number, h: number) => { g.save(); g.fillStyle = 'rgba(12,9,8,.72)'; rrect(g, x, y, w, h, 24); g.fill(); g.strokeStyle = 'rgba(255,200,140,.22)'; g.lineWidth = 2; g.stroke(); g.restore(); };
const hookA = (g: G) => {
  booth(g); mic(g, 520, 260, 1.1);
  for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(255,180,106,${0.55 - k * 0.12})`; g.lineWidth = 4; g.beginPath(); g.arc(640, 300, 180 + k * 70, -0.7, 0.7); g.stroke(); }
  // the photo card turned away: only its back, lit from the mic side
  g.save(); g.translate(1230, 470); g.rotate(0.05); g.fillStyle = '#1a1310'; rrect(g, -210, -270, 420, 540, 22); g.fill(); g.strokeStyle = 'rgba(255,190,120,.4)'; g.lineWidth = 3; g.stroke();
  face(g, 0, -20, 330, FACES.ideal, 'rgba(241,197,109,.18)', { lw: 3 }); txt(g, '?', 0, 60, 220, 'rgba(241,197,109,.85)', { f: SERIF, glow: 'rgba(241,197,109,.8)' }); g.restore();
  mark(g); sub(g, '有人一开口，你就想看他的脸');
};
const dataA = (g: G) => {
  booth(g, false); mic(g, 170, 330, 0.62, 0.6); glass(g, 520, 90, 1280, 780);
  scatter(g, 640, 150, 760, 600, cloud(85, 0.06, 7), stA, { r: 0.06 });
  txt(g, '2020 · 德国', 1620, 260, 40, 'rgba(255,230,200,.8)', { w: 700 }); txt(g, 'r = 0.06', 1620, 380, 92, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.5)' }); txt(g, '几乎没关系', 1620, 460, 40, '#fff0dd', { w: 700 });
  txt(g, '示意：每个点是一个人', 1020, 840, 24, 'rgba(255,230,200,.45)', { w: 500 });
  mark(g); sub(g, '结果：声音和脸，几乎没关系');
};

/* ================================================================ Look B · 深夜语音 (phone, dark mode) */
const roomB = (g: G) => { g.fillStyle = '#07070d'; g.fillRect(0, 0, W, H); seed = 4; for (let i = 0; i < 40; i++) glow(g, rnd() * W, rnd() * H * 0.7, 60 + rnd() * 120, rnd() < 0.5 ? '120,90,255' : '60,200,220', 0.06 + rnd() * 0.08); };
const phone = (g: G, x: number, y: number, s: number, body: (g: G) => void) => {
  g.save(); g.translate(x, y); g.scale(s, s); glow(g, 0, 0, 700, '140,120,255', 0.16);
  g.fillStyle = '#18181f'; rrect(g, -260, -500, 520, 1000, 70); g.fill(); g.fillStyle = '#0d0d13'; rrect(g, -244, -484, 488, 968, 58); g.fill();
  g.fillStyle = '#000'; rrect(g, -60, -470, 120, 32, 16); g.fill(); body(g); g.restore();
};
const TEAL = '#4fe0d2', VIO = '#9b8cff';
const chat = (g: G, revealed: boolean) => {
  txt(g, '语音交友 · 今晚', 0, -390, 30, 'rgba(255,255,255,.75)', { w: 700 });
  g.fillStyle = '#23232d'; g.beginPath(); g.arc(-170, -250, 50, 0, 7); g.fill();
  if (revealed) { g.save(); g.beginPath(); g.arc(-170, -250, 50, 0, 7); g.clip(); face(g, -170, -255, 70, FACES.plain, '#cfd2dc', { lw: 2 }); g.restore(); }
  else txt(g, '?', -170, -232, 54, 'rgba(255,255,255,.6)');
  g.fillStyle = '#2b2b38'; rrect(g, -100, -300, 300, 100, 30); g.fill(); wave(g, -70, -250, 170, 26, TEAL, 5, 22, 0.5); txt(g, "59''", 170, -240, 28, 'rgba(255,255,255,.7)', { w: 700 });
  g.fillStyle = '#2b2b38'; rrect(g, -100, -170, 230, 86, 30); g.fill(); wave(g, -70, -127, 120, 20, TEAL, 8, 16, 0.5);
  g.fillStyle = VIO; rrect(g, -10, -40, 220, 80, 28); g.fill(); txt(g, '能看看照片吗', 100, 12, 28, '#fff', { w: 700 });
};
const hookB = (g: G) => {
  roomB(g); phone(g, 680, 520, 0.95, (g) => chat(g, false));
  g.strokeStyle = 'rgba(79,224,210,.5)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(520, 280, 120 + k * 60, -2.4, -1.2); g.stroke(); }
  quiz(g, 1220, 260, (k, v, i, y) => { g.fillStyle = 'rgba(30,30,44,.9)'; rrect(g, 1220, y, 520, 116, 58); g.fill(); g.strokeStyle = 'rgba(155,140,255,.55)'; g.lineWidth = 2; g.stroke(); g.fillStyle = VIO; g.beginPath(); g.arc(1280, y + 58, 38, 0, 7); g.fill(); txt(g, k, 1280, y + 75, 44, '#fff'); txt(g, v, 1530, y + 74, 42, '#f2f0ff', { w: 700 }); });
  txt(g, '声音好听 = 长得一般？', 1480, 200, 44, '#f2f0ff');
  mark(g); sub(g, '声音好听的人，是不是长得一般？');
};
const dataB = (g: G) => {
  roomB(g); g.fillStyle = 'rgba(20,20,30,.85)'; rrect(g, 380, 80, 1160, 800, 40); g.fill();
  scatter(g, 520, 150, 760, 600, cloud(85, 0.06, 7), { axis: 'rgba(220,220,255,.4)', dot: 'rgba(155,140,255,.85)', hot: TEAL, label: 'rgba(230,230,255,.7)' }, { r: 0.06 });
  txt(g, 'r = 0.06', 1410, 380, 80, TEAL, { glow: 'rgba(79,224,210,.5)' }); txt(g, '几乎没关系', 1410, 450, 38, '#f2f0ff', { w: 700 });
  mark(g); sub(g, '结果：声音和脸，几乎没关系');
};

/* ================================================================ Look C · 星空 (each person a star, imagination draws constellations) */
const skyC = (g: G) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#040814'); b.addColorStop(1, '#0d1a33'); g.fillStyle = b; g.fillRect(0, 0, W, H); seed = 11; for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(210,225,255,${rnd() * 0.5})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 1.4 + 0.2, 0, 7); g.fill(); }
  g.fillStyle = '#03050b'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 930); for (let x = 0; x <= W; x += 60) g.lineTo(x, 930 - 30 * Math.sin(x / 260) - 18 * Math.sin(x / 97)); g.lineTo(W, H); g.fill(); };
const hookC = (g: G) => {
  skyC(g);
  wave(g, 200, 520, 600, 120, 'rgba(200,220,255,.85)', 3, 48, 0.45);
  face(g, 1180, 430, 420, FACES.ideal, 'rgba(241,197,109,.95)', { lw: 2.2, glowCol: 'rgba(241,197,109,.9)' });
  seed = 21; for (let i = 0; i < 26; i++) { const a = rnd() * 7, r = 0.2 + rnd() * 0.3; glow(g, 1180 + Math.cos(a) * r * 420, 430 + Math.sin(a) * r * 420 * 1.2, 26, '241,197,109', 0.6); }
  txt(g, '听见的', 500, 760, 38, 'rgba(210,225,255,.8)', { f: SERIF }); txt(g, '想象的', 1180, 900, 38, GOLD, { f: SERIF });
  mark(g); sub(g, '听到好声音，你会脑补一张好看的脸');
};
const dataC = (g: G) => {
  skyC(g);
  scatter(g, 360, 120, 900, 680, cloud(120, 0.06, 7), { axis: 'rgba(210,225,255,.35)', dot: 'rgba(225,235,255,.9)', hot: GOLD, label: 'rgba(210,225,255,.7)', font: SERIF }, { hotX: 2.0, dotR: 4.5, star: true });
  txt(g, '百里挑一的声音', 1560, 300, 44, GOLD, { f: SERIF }); txt(g, '脸：第 50 名', 1560, 400, 64, '#eef3ff', { f: SERIF }); txt(g, '（共 100 名）', 1560, 460, 30, 'rgba(210,225,255,.6)', { f: SERIF, w: 500 });
  mark(g); sub(g, '可百里挑一的声音，配的多半是普通的脸');
};


/** a face made of sound: horizontal level bars whose lengths trace a head-and-shoulders outline */
export const voiceFace = (g: G, cx: number, cy: number, s: number) => {
  const half = (y: number) => y < -0.56 ? 0 : y < 0.05 ? 0.37 * Math.sqrt(Math.max(0, 1 - ((y + 0.05) / 0.51) ** 2)) + 0.0 : y < 0.56 ? 0.37 - (0.37 - 0.0) * ((y - 0.05) / 0.51) ** 1.6 * 0.75 : y < 0.8 ? 0.15 : Math.min(0.78, 0.15 + (y - 0.8) * 2.2);
  seed = 13; g.save(); g.shadowColor = GOLD; g.shadowBlur = 14;
  for (let y = -0.58; y < 1.15; y += 0.034) { const hw = half(y); if (hw <= 0) continue; const j = 0.9 + 0.2 * rnd(); g.fillStyle = `rgba(241,197,109,${0.55 + 0.4 * rnd()})`; rrect(g, cx - hw * s * j, cy + y * s, 2 * hw * s * j, 0.018 * s, 4); g.fill(); }
  g.restore();
};
/* ================================================================ Storyboard (look A) */
const S = (line: string, draw: (g: G) => void) => (g: G) => { draw(g); mark(g); sub(g, line); };
export const titleCard = (g: G, a: string, b: string) => { booth(g, false); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H); glow(g, W / 2, H / 2, 800, '241,197,109', 0.18); txt(g, a, W / 2, 480, 96, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)' }); txt(g, b, W / 2, 620, 110, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)' }); };
const BOARD: { t: string; d: string; draw: (g: G) => void }[] = [
  { t: '01 · 0:00 开场', d: '暗房间，ON AIR 亮起，麦克风被暖光勾边，声波从麦克风扩散；右边一张照片卡背对镜头。镜头缓慢推近麦克风。', draw: S('有人一开口，你就想看他的脸', (g) => hookA(g)) },
  { t: '02 · 0:03 翻牌', d: '照片卡翻过来：一张普通、温和的线稿脸（不丑化）。声波弱下去，ON AIR 闪一下。', draw: S('看到之后：哦……', (g) => { booth(g); mic(g, 300, 330, 0.75, 0.5); g.save(); g.translate(1100, 470); g.fillStyle = '#efe6d8'; rrect(g, -210, -270, 420, 540, 22); g.fill(); face(g, 0, -40, 340, FACES.plain, '#3b3029', { lw: 3 }); g.restore(); }) },
  { t: '03 · 0:06 选择题', d: '三张卡片依次落下：A 越好听越丑 / B 越好听越好看 / C 没什么关系。光标停在中间，不给答案。', draw: S('声音好听的人，是不是长得一般？', (g) => { booth(g, false); mic(g, 200, 330, 0.62, 0.6); quiz(g, 760, 250, (k, v, i, y) => { glass(g, 760, y, 640, 120); g.fillStyle = AMB; g.beginPath(); g.arc(830, y + 60, 40, 0, 7); g.fill(); txt(g, k, 830, y + 78, 46, '#2a1608'); txt(g, v, 1110, y + 78, 46, '#fff0dd', { w: 700 }); }); }) },
  { t: '04 · 0:09 标题（音乐重拍）', d: '画面压暗，金色标题在重拍上落下，两行。ON AIR 的红光扫过。', draw: S('', (g) => titleCard(g, '声音好听的人', '是不是长得丑？')) },
  { t: '05 · 0:13 早年研究', d: '墙上的玻璃屏亮起散点图，点排成一条斜线（r≈0.5），左下角一个“啊”的声波。', draw: S('早年的研究说：好听的声音配好看的脸', (g) => { booth(g, false); glass(g, 360, 90, 1200, 780); scatter(g, 520, 150, 760, 600, cloud(36, 0.5, 3), stA, { r: 0.5, dotR: 10 }); txt(g, 'r ≈ 0.4 – 0.6', 1420, 300, 52, GOLD, { f: SERIF }); }) },
  { t: '06 · 0:17 但是', d: '镜头推到左下：标签“30–42 人”“只听一个元音 啊”，声波只有短短一截。', draw: S('但只测了几十人，听的只是一个“啊”', (g) => { booth(g, false); glass(g, 360, 140, 1200, 640); wave(g, 520, 420, 300, 110, AMB, 4, 16, 0.6); txt(g, '“啊——”', 670, 640, 60, '#fff0dd', { f: SERIF }); txt(g, '30–42 人', 1200, 400, 84, GOLD, { f: SERIF }); txt(g, '大多是女生', 1200, 490, 40, 'rgba(255,230,200,.75)', { w: 700 }); }) },
  { t: '07 · 0:20 整句话', d: '声波拉长成一整句话的形状；散点开始松动。', draw: S('2020年，德国团队让人听整句话', (g) => { booth(g, false); mic(g, 200, 330, 0.62, 0.8); wave(g, 520, 470, 1200, 120, AMB, 9, 110, 0.5); txt(g, '“今天天气不错，我们出去走走吧”', 1120, 700, 44, 'rgba(255,240,220,.85)', { f: SERIF }); }) },
  { t: '08 · 0:24 几乎没关系', d: '那条斜线断开，点散成一团云，r = 0.06。', draw: S('结果：声音和脸，几乎没关系', (g) => dataA(g)) },
  { t: '09 · 0:28 大样本', d: '镜头拉远，点从 85 个变成 320 个，三块屏：脸、身材、声音。脸和身材之间连上金线，声音那块独自亮着。', draw: S('2026年，320个人，400个评分者', (g) => { booth(g, false); const P: [number, string][] = [[420, '脸'], [960, '身材'], [1500, '声音']]; P.forEach(([x, s], i) => { glass(g, x - 230, 200, 460, 440); txt(g, s, x, 300, 56, i < 2 ? GOLD : '#fff0dd', { f: SERIF }); seed = 30 + i; for (let k = 0; k < 60; k++) { g.fillStyle = 'rgba(255,222,190,.6)'; g.beginPath(); g.arc(x - 180 + rnd() * 360, 360 + rnd() * 240, 4, 0, 7); g.fill(); } }); g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.moveTo(650, 420); g.lineTo(730, 420); g.stroke(); txt(g, '对得上', 690, 400, 30, GOLD, { w: 700 }); g.setLineDash([8, 10]); g.strokeStyle = 'rgba(255,230,200,.35)'; g.beginPath(); g.moveTo(1190, 420); g.lineTo(1270, 420); g.stroke(); g.setLineDash([]); txt(g, '自成一派', 1500, 700, 36, '#fff0dd', { w: 700 }); }) },
  { t: '10 · 0:34 答案', d: 'C 卡片亮成金色，A、B 暗下。', draw: S('答案是C', (g) => { booth(g, false); quiz(g, 640, 250, (k, v, i, y) => { const on = k === 'C'; glass(g, 640, y, 640, 120); if (on) glow(g, 960, y + 60, 420, '241,197,109', 0.3); g.fillStyle = on ? GOLD : 'rgba(255,180,106,.3)'; g.beginPath(); g.arc(710, y + 60, 40, 0, 7); g.fill(); txt(g, k, 710, y + 78, 46, '#2a1608'); txt(g, v, 990, y + 78, 46, on ? GOLD : 'rgba(255,240,220,.35)', { w: 700 }); }); }) },
  { t: '11 · 0:37 为什么失望', d: '回到麦克风。声波在空中慢慢“画”出一张金色线稿脸（脑补）。', draw: S('听到好声音，你会脑补一张好看的脸', (g) => { booth(g); mic(g, 330, 300, 0.85); for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,180,106,${0.45 - k * 0.12})`; g.lineWidth = 3; g.beginPath(); g.arc(440, 330, 160 + k * 60, -0.6, 0.6); g.stroke(); } face(g, 1180, 420, 440, FACES.ideal, GOLD, { lw: 2.6, glowCol: 'rgba(241,197,109,.9)' }); }) },
  { t: '12 · 0:41 百里挑一', d: '散点图回来，最右边 1% 的“好声音”被金色框住，它们的高度落在中间。旁边：脸，第 50 名。', draw: S('可百里挑一的声音，配的多半是普通的脸', (g) => { booth(g, false); glass(g, 260, 90, 1400, 780); scatter(g, 420, 150, 800, 600, cloud(320, 0.06, 7), stA, { hotX: 1.6, dotR: 5 }); txt(g, '脸：第 50 名', 1440, 420, 56, GOLD, { f: SERIF }); txt(g, '（共 100 名）', 1440, 480, 30, 'rgba(255,230,200,.6)', { w: 500 }); }) },
  { t: '13 · 0:45 你想太美', d: '金色线稿脸慢慢褪色，变回那张普通的脸，两张叠在一起。', draw: S('不是他丑，是你想太美', (g) => { booth(g, false); face(g, 960, 420, 460, FACES.ideal, GOLD, { lw: 2.4, glowCol: 'rgba(241,197,109,.7)', alpha: 0.35 }); face(g, 960, 420, 460, FACES.plain, '#efe2d0', { lw: 3 }); }) },
  { t: '14 · 0:49 另一种可能', d: '右上角的点（又好看又好听）被一束舞台追光吸走，飞向画外的“舞台”。', draw: S('还有一种可能：又好看又好听的，都去当演员了', (g) => { booth(g, false); glass(g, 260, 120, 900, 700); const { X, Y } = scatter(g, 380, 170, 680, 540, cloud(160, 0.06, 7).filter(([a, b]) => !(a > 1 && b > 1)), stA, { dotR: 5 }); g.fillStyle = 'rgba(255,240,200,.08)'; g.beginPath(); g.moveTo(1650, 0); g.lineTo(1850, 0); g.lineTo(X(2.4), Y(2.4) + 60); g.lineTo(X(1.2), Y(1.6) + 60); g.fill(); seed = 5; for (let k = 0; k < 10; k++) { const t = rnd(); g.fillStyle = GOLD; g.beginPath(); g.arc(X(1.4) + t * (1700 - X(1.4)), Y(1.8) - t * (Y(1.8) - 120) + (rnd() - 0.5) * 60, 6, 0, 7); g.fill(); } txt(g, '舞台', 1740, 200, 48, GOLD, { f: SERIF }); }) },
  { t: '15 · 0:54 结尾', d: '声波的电平条一根根横过来，叠成一个人的头和肩膀：声音拼出的脸。', draw: S('声音，是你的另一张脸', (g) => { booth(g); mic(g, 260, 330, 0.7, 0.8); voiceFace(g, 1150, 470, 360); }) },
  { t: '16 · 0:58 评论区', d: '回到开场：麦克风和背对的照片卡，问号还在，留给评论区。', draw: S('评论区：你有过“听声音心动，见面……”吗？', (g) => { booth(g); mic(g, 520, 260, 0.9); g.save(); g.translate(1240, 470); g.rotate(0.04); g.fillStyle = '#1a1310'; rrect(g, -210, -270, 420, 540, 22); g.fill(); g.strokeStyle = 'rgba(255,190,120,.4)'; g.lineWidth = 3; g.stroke(); txt(g, '?', 0, 60, 220, 'rgba(241,197,109,.85)', { f: SERIF, glow: 'rgba(241,197,109,.8)' }); g.restore(); }) },
  { t: '17 · 1:02 片尾卡', d: '金色问题 + 关注 Juno · 一起看懂世界。', draw: S('', (g) => { booth(g, false); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); txt(g, '发给那个声音很好听的朋友', W / 2, 470, 72, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.5)' }); txt(g, '关注 Juno · 一起看懂世界', W / 2, 600, 40, 'rgba(255,240,220,.8)', { w: 700 }); }) },
];
export const BOARD_TEXT = BOARD.map((b) => [b.t, b.d]);

export const FRAMES: ((g: G) => void)[] = [hookA, dataA, hookB, dataB, hookC, dataC, ...BOARD.map((b) => b.draw)];
export const Board: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = '有人一开口你就想看他的脸到之后哦声音好听是不长得般越丑没什么关系早年研究说配但只测了几十听元啊2020德国团队让整句话结果乎326个评分者和身材对上自成一派答案为失望会脑补张百里挑多半普通他太美还可能又都去当演员另评论区过心动见面吗发给那朋友关注Juno起懂世界今天气错们出走吧示意每点是人第名共女生舞台ON AIR交友晚能照片吗◆·VIBE知识大赏r=≈–→←？…“”：，ABC0123456789';
    Promise.all([`900 74px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H); FRAMES[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

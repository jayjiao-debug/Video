/* 《声音好听的人，是不是长得丑？》 demo: the first ~30 s in the recording-booth look, animated. No music yet. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, G, txt, sub, mark, glow, rrect, FACES, face, cloud, scatter, quiz, wave, booth, mic, AMB, stA, glass, GOLD, SERIF } from './Board';

const FPS = 30;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type Shot = { a: number; b: number; line: string; draw: (g: G, t: number, d: number) => void; push?: number };
const XF = 0.25; // crossfade seconds

/* -------- shot drawings: t = seconds into the shot, d = shot length */
const waves = (g: G, x: number, y: number, t: number, k0: number, amp = 1) => {
  for (let k = 0; k < 4; k++) { const ph = ((t * 0.9 + k / 4) % 1); const r = 150 + ph * 330; g.strokeStyle = `rgba(255,180,106,${amp * 0.6 * (1 - ph)})`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, -0.65, 0.65); g.stroke(); }
};
const photoBack = (g: G, x: number, y: number, rot: number) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#1a1310'; rrect(g, -210, -270, 420, 540, 22); g.fill(); g.strokeStyle = 'rgba(255,190,120,.4)'; g.lineWidth = 3; g.stroke();
  txt(g, '?', 0, 60, 220, 'rgba(241,197,109,.85)', { f: SERIF, glow: 'rgba(241,197,109,.8)' }); g.restore();
};
const s01 = (g: G, t: number) => {
  const air = t < 0.35 ? 0 : t < 0.5 ? 1 : t < 0.6 ? 0.2 : 1; // ON AIR clicks on with one flicker
  booth(g, air); mic(g, 520, 260, 1.1, 0.6 + 0.4 * ramp(t, 0.3, 0.6));
  waves(g, 640, 300, Math.max(0, t - 0.5), 0, ramp(t, 0.5, 0.4));
  photoBack(g, 1230, 470 + Math.sin(t * 1.3) * 6, 0.05 + Math.sin(t * 0.9) * 0.01);
};
const s02 = (g: G, t: number) => {
  booth(g, 1); mic(g, 300, 330, 0.75, 0.5);
  const p = eio(ramp(t, 0.35, 0.55)), sx = Math.cos(Math.PI * p);
  g.save(); g.translate(1100, 470); g.scale(Math.max(0.02, Math.abs(sx)), 1);
  if (sx > 0) { g.fillStyle = '#1a1310'; rrect(g, -210, -270, 420, 540, 22); g.fill(); g.strokeStyle = 'rgba(255,190,120,.4)'; g.lineWidth = 3; g.stroke(); txt(g, '?', 0, 60, 220, 'rgba(241,197,109,.85)', { f: SERIF }); }
  else { g.fillStyle = '#d9cfbf'; rrect(g, -210, -270, 420, 540, 22); g.fill(); face(g, 0, -40, 340, FACES.plain, '#3b3029', { lw: 3 }); }
  g.restore();
};
const titleS = (g: G, t: number) => {
  booth(g, 1); g.fillStyle = `rgba(0,0,0,${0.55 * eo(ramp(t, 0, 0.3))})`; g.fillRect(0, 0, W, H);
  glow(g, W / 2, H / 2, 900, '241,197,109', 0.2 * eo(ramp(t, 0, 0.4)));
  const a = eo(ramp(t, 0.05, 0.35)), b = eo(ramp(t, 0.3, 0.35)), out = 1 - ramp(t, 3.6, 0.3);
  g.save(); g.globalAlpha = out;
  g.save(); g.translate(W / 2, 470); g.scale(1.08 - 0.08 * a, 1.08 - 0.08 * a); txt(g, '声音好听的人', 0, 0, 96, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)', alpha: a * out }); g.restore();
  g.save(); g.translate(W / 2, 620); g.scale(1.08 - 0.08 * b, 1.08 - 0.08 * b); txt(g, '是不是长得丑？', 0, 0, 116, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)', alpha: b * out }); g.restore();
  // a thin gold rule sweeps under the title
  g.fillStyle = GOLD; g.globalAlpha = 0.7 * out; const w = 520 * eo(ramp(t, 0.5, 0.6)); g.fillRect(W / 2 - w / 2, 690, w, 3);
  g.restore();
};
const s03 = (g: G, t: number) => {
  booth(g, 1); mic(g, 200, 330, 0.62, 0.6);
  quiz(g, 760, 250, (k, v, i, y) => { const p = eo(ramp(t, 0.15 + i * 0.3, 0.35)); if (p <= 0) return; g.save(); g.globalAlpha = p; g.translate(0, (1 - p) * -50);
    glass(g, 760, y, 640, 120); g.fillStyle = AMB; g.beginPath(); g.arc(830, y + 60, 40, 0, 7); g.fill(); txt(g, k, 830, y + 78, 46, '#2a1608', { alpha: p }); txt(g, v, 1110, y + 78, 46, '#fff0dd', { w: 700, alpha: p }); g.restore(); });
};
/* one set of 85 people; the first 40 are the early study */
const N_EARLY = 40;
const people = (r: number) => cloud(85, r, 7);
const s05 = (g: G, t: number) => {
  booth(g, 0.25); g.save(); g.globalAlpha = eo(ramp(t, 0, 0.4)); glass(g, 360, 200, 1200, 650); g.restore();
  const pts = people(0.5).slice(0, N_EARLY);
  const vis = pts.filter((_, i) => t > 0.3 + i * 0.045);
  const lineP = ramp(t, 2.2, 0.6);
  scatter(g, 520, 240, 760, 540, vis, stA, { dotR: 10 });
  if (lineP > 0) { g.save(); g.beginPath(); g.rect(520, 230, 760 * eo(lineP), 560); g.clip(); scatter(g, 520, 240, 760, 540, [], stA, { r: 0.5 }); g.restore(); txt(g, 'r ≈ 0.4 – 0.6', 1400, 330, 52, GOLD, { f: SERIF, alpha: eo(lineP) }); }
};
const s06 = (g: G, t: number) => {
  booth(g, 0.25); glass(g, 360, 200, 1200, 620);
  const pulse = 0.7 + 0.3 * Math.sin(t * 6); g.save(); g.translate(670, 420); g.scale(1, pulse); g.translate(-670, -420); wave(g, 520, 420, 300, 110, AMB, 4, 16, 0.6); g.restore();
  txt(g, '“啊——”', 670, 640, 60, '#fff0dd', { f: SERIF, alpha: eo(ramp(t, 0.2, 0.4)) });
  txt(g, '30–42 人', 1200, 400, 84, GOLD, { f: SERIF, alpha: eo(ramp(t, 0.6, 0.4)) }); txt(g, '大多是女生', 1200, 490, 40, 'rgba(255,230,200,.75)', { w: 700, alpha: eo(ramp(t, 1.0, 0.4)) });
};
const s07 = (g: G, t: number) => {
  booth(g, 1); mic(g, 200, 330, 0.62, 0.9);
  const p = eio(ramp(t, 0.1, 2.2)); g.save(); g.beginPath(); g.rect(500, 300, 1240 * p, 340); g.clip(); wave(g, 520, 470, 1200, 120, AMB, 9, 110, 0.5); g.restore();
  const sent = '“今天天气不错，我们出去走走吧”'; const n = Math.floor(sent.length * ramp(t, 0.2, 2.2)); txt(g, sent.slice(0, n), 1120, 700, 44, 'rgba(255,240,220,.85)', { f: SERIF });
};
const s08 = (g: G, t: number) => {
  booth(g, 0.25); glass(g, 400, 200, 1200, 650);
  const k = eio(ramp(t, 0.3, 1.8)), r = 0.5 + (0.06 - 0.5) * k;
  const all = people(r); const extra = all.slice(N_EARLY).filter((_, i) => t > 0.8 + i * 0.025);
  scatter(g, 520, 240, 760, 540, [...all.slice(0, N_EARLY), ...extra], stA, { r });
  txt(g, '2020 · 德国', 1430, 330, 40, 'rgba(255,230,200,.8)', { w: 700 }); txt(g, `r = ${r.toFixed(2)}`, 1430, 440, 92, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.5)' });
  txt(g, '几乎没关系', 1430, 510, 40, '#fff0dd', { w: 700, alpha: eo(ramp(t, 2.0, 0.4)) }); txt(g, '示意：每个点是一个人', 900, 835, 24, 'rgba(255,230,200,.45)', { w: 500 });
};

export const SHOTS: Shot[] = [
  { a: 0.0, b: 3.6, line: '有人一开口，你就想看他的脸', draw: s01, push: 0.06 },
  { a: 3.6, b: 7.6, line: '', draw: titleS },
  { a: 7.6, b: 10.6, line: '看到之后：哦……', draw: s02, push: 0.03 },
  { a: 10.6, b: 14.8, line: '声音好听的人，是不是长得一般？', draw: s03, push: 0.025 },
  { a: 14.8, b: 18.9, line: '早年的研究说：好听的声音配好看的脸', draw: s05, push: 0.03 },
  { a: 18.9, b: 22.8, line: '但只测了几十人，听的只是一个“啊”', draw: s06, push: 0.04 },
  { a: 22.8, b: 26.4, line: '2020年，德国团队让人听整句话', draw: s07, push: 0.03 },
  { a: 26.4, b: 31.0, line: '结果：声音和脸，几乎没关系', draw: s08, push: 0.03 },
];
export const DEMO_LEN = Math.round(31.0 * FPS);

const paint = (c: HTMLCanvasElement, s: Shot, T: number) => {
  const g = c.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  const t = T - s.a, d = s.b - s.a, z = 1 + (s.push ?? 0) * eio(clamp(t / d));
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); s.draw(g, Math.max(0, t), d); g.restore();
};
export const Demo: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const off = useRef<HTMLCanvasElement[]>([]);
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = SHOTS.map((x) => x.line).join('') + '声音好听的人是不是长得丑？今天天气不错我们出去走走吧越好听丑没什么关系德国几乎示意每个点是一人大多女生啊ON AIR◆·Juno VIBE知识大赏r=≈–0123456789.ABC';
    Promise.all(['900 74px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '500 40px "Noto Sans CJK SC"', '900 80px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => {
    if (!ok || !ref.current) return; const T = f / FPS;
    if (!off.current.length) off.current = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; });
    const g = ref.current.getContext('2d')!; g.clearRect(0, 0, W, H);
    const i = Math.max(0, SHOTS.findIndex((s) => T >= s.a && T < s.b)); const cur = SHOTS[i === -1 ? SHOTS.length - 1 : i];
    const prev = i > 0 && T - cur.a < XF ? SHOTS[i - 1] : null;
    paint(off.current[0], cur, T);
    if (prev) { paint(off.current[1], prev, T); g.drawImage(off.current[1], 0, 0); g.globalAlpha = (T - cur.a) / XF; }
    g.drawImage(off.current[0], 0, 0); g.globalAlpha = 1;
    if (T >= 7.6) mark(g);
    // subtitle: in fast, out with the shot
    const line = cur.line; if (line) { const a = ramp(T - cur.a, 0.05, 0.15) * (1 - ramp(T, cur.b - 0.12, 0.12)); g.globalAlpha = a; sub(g, line); g.globalAlpha = 1; }
    // fade out at the very end
    if (T > 30.2) { g.fillStyle = `rgba(0,0,0,${ramp(T, 30.2, 0.8)})`; g.fillRect(0, 0, W, H); }
  }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

/* 《假如你是拿破仑》 2D key frames. Everyone is a silhouette; the only lit thing in each shot is gold
   (the crown, the hat, the dome). A blue Paris street sign comes back three times. Frame i = scene i. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, GOLD, INK, RED, SERIF, SANS, txt, subtitle, grain, vignette, FONT_CHARS, rr } from './lib';

type G = CanvasRenderingContext2D;
const BAR = 100, SIL = '#07070a';

/* ---------------------------------------------------------------- silhouettes */
type Pose = { hat?: 'bicorne' | 'mitre' | 'none'; armL?: number; armR?: number; elL?: number; elR?: number; coat?: boolean; robe?: boolean; lean?: number; col?: string };
export const figure = (g: G, x: number, y: number, s: number, p: Pose = {}) => {
  // (x, y) = feet; height ≈ 340 * s
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(p.lean ?? 0); g.fillStyle = p.col ?? SIL; g.strokeStyle = p.col ?? SIL; g.lineCap = 'round'; g.lineJoin = 'round';
  if (p.robe) { g.beginPath(); g.moveTo(-70, 0); g.quadraticCurveTo(-40, -150, -38, -230); g.lineTo(38, -230); g.quadraticCurveTo(40, -150, 70, 0); g.closePath(); g.fill(); }
  else { g.lineWidth = 26; g.beginPath(); g.moveTo(-14, -150); g.lineTo(-20, -4); g.stroke(); g.beginPath(); g.moveTo(14, -150); g.lineTo(20, -4); g.stroke(); g.lineWidth = 14; g.beginPath(); g.moveTo(-30, -3); g.lineTo(-8, -3); g.stroke(); g.beginPath(); g.moveTo(8, -3); g.lineTo(30, -3); g.stroke(); }
  // torso + coat tails
  g.beginPath(); g.moveTo(-36, -250); g.quadraticCurveTo(-44, -200, -34, -140); if (p.coat !== false && !p.robe) { g.lineTo(-44, -84); g.lineTo(-10, -120); g.lineTo(10, -120); g.lineTo(44, -84); } g.lineTo(34, -140); g.quadraticCurveTo(44, -200, 36, -250); g.quadraticCurveTo(0, -262, -36, -250); g.fill();
  // arms: shoulder angle (0 = down, +out) and elbow bend
  const arm = (sx: number, a: number, e: number) => { g.save(); g.translate(sx * 34, -244); g.rotate(sx * a); g.lineWidth = 20; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 74); g.stroke(); g.translate(0, 74); g.rotate(sx * e); g.lineWidth = 17; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 66); g.stroke(); g.beginPath(); g.arc(0, 70, 10, 0, 7); g.fill(); g.restore(); };
  arm(-1, p.armL ?? 0.12, p.elL ?? 0.1); arm(1, p.armR ?? 0.12, p.elR ?? 0.1);
  // neck + head
  g.fillRect(-9, -276, 18, 24); g.beginPath(); g.ellipse(0, -300, 26, 31, 0, 0, 7); g.fill();
  if (p.hat === 'bicorne') { g.beginPath(); g.moveTo(-74, -318); g.quadraticCurveTo(-30, -380, 0, -372); g.quadraticCurveTo(30, -380, 74, -318); g.quadraticCurveTo(0, -330, -74, -318); g.fill(); }
  if (p.hat === 'mitre') { g.beginPath(); g.moveTo(-24, -318); g.lineTo(-18, -380); g.lineTo(0, -398); g.lineTo(18, -380); g.lineTo(24, -318); g.fill(); }
  g.restore();
};
export const bicorne = (g: G, x: number, y: number, s: number, glowA = 1) => { // the lit object
  g.save(); g.translate(x, y); g.scale(s, s);
  if (glowA > 0) { const gl = g.createRadialGradient(0, -20, 10, 0, -20, 260); gl.addColorStop(0, `rgba(241,197,109,${0.35 * glowA})`); gl.addColorStop(1, 'rgba(241,197,109,0)'); g.fillStyle = gl; g.fillRect(-300, -300, 600, 560); }
  const b = g.createLinearGradient(0, -110, 0, 10); b.addColorStop(0, '#2a2420'); b.addColorStop(1, '#0d0b0a'); g.fillStyle = b;
  g.beginPath(); g.moveTo(-200, 4); g.bezierCurveTo(-150, -60, -90, -132, 0, -126); g.bezierCurveTo(90, -132, 150, -60, 200, 4); g.quadraticCurveTo(100, -40, 0, -46); g.quadraticCurveTo(-100, -40, -200, 4); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.moveTo(-196, 2); g.bezierCurveTo(-150, -60, -90, -128, 0, -122); g.bezierCurveTo(90, -128, 150, -60, 196, 2); g.stroke();
  // cockade
  g.fillStyle = '#2b4c9a'; g.beginPath(); g.arc(92, -78, 22, 0, 7); g.fill(); g.fillStyle = '#eee'; g.beginPath(); g.arc(92, -78, 14, 0, 7); g.fill(); g.fillStyle = '#c0312b'; g.beginPath(); g.arc(92, -78, 7, 0, 7); g.fill();
  g.restore(); };
export const streetSign = (g: G, x: number, y: number, s: number, name: string, arr: string, rot = 0) => { // Paris enamel plaque
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 20; rr(g, -270, -80, 540, 160, 14); g.fillStyle = '#1f3f7a'; g.fill(); g.shadowBlur = 0;
  rr(g, -258, -68, 516, 136, 10); g.strokeStyle = '#e9eef6'; g.lineWidth = 6; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-258, -28); g.lineTo(258, -28); g.stroke();
  txt(g, arr, 0, -38, 26, '#e9eef6', { w: 600, f: SERIF }); txt(g, name, 0, 40, 50, '#f4f6fb', { w: 700, f: SERIF });
  g.restore(); };
const wall = (g: G, tint = '#2a2622') => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, tint); b.addColorStop(1, '#0b0a09'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; for (let y = 120; y < H; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (y / 70) % 2 ? 0 : 90; x < W; x += 180) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 70); g.stroke(); } } };
const pool = (g: G, x: number, y: number, r: number, col: string, a: number) => { const l = g.createRadialGradient(x, y, 10, x, y, r); l.addColorStop(0, col.replace('A', String(a))); l.addColorStop(1, col.replace('A', '0')); g.fillStyle = l; g.fillRect(0, 0, W, H); };
const snow = (g: G, n: number, seed: number, a = 0.7) => { let s = seed; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; g.fillStyle = `rgba(240,244,250,${a})`; for (let i = 0; i < n; i++) { g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2.5, 0, 7); g.fill(); } };
const dome = (g: G, x: number, y: number, s: number) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#121014'; g.fillRect(-300, -120, 600, 120); g.fillRect(-170, -220, 340, 100);
  const gd = g.createLinearGradient(-150, -460, 150, -220); gd.addColorStop(0, '#fff0c4'); gd.addColorStop(0.5, GOLD); gd.addColorStop(1, '#8a6224'); g.fillStyle = gd; g.beginPath(); g.moveTo(-150, -220); g.quadraticCurveTo(-150, -440, 0, -450); g.quadraticCurveTo(150, -440, 150, -220); g.fill();
  g.strokeStyle = 'rgba(80,50,10,.6)'; g.lineWidth = 3; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 40, -222); g.quadraticCurveTo(k * 30, -400, 0, -448); g.stroke(); }
  g.fillStyle = '#121014'; g.fillRect(-14, -520, 28, 72); g.fillStyle = GOLD; g.beginPath(); g.moveTo(0, -560); g.lineTo(8, -520); g.lineTo(-8, -520); g.fill(); g.restore(); };

/* ---------------------------------------------------------------- HUD: the borrowed mechanics, our styling */
const hud = (g: G, year: string, place: string, src: string, age: string) => {
  g.save(); g.textAlign = 'right'; g.fillStyle = GOLD; g.fillRect(W - 360, 150, 36, 2);
  txt(g, year, W - 70, 162, 38, INK, { a: 'right', f: SERIF, w: 700 }); txt(g, place, W - 70, 202, 26, 'rgba(243,237,226,.8)', { a: 'right', w: 600 }); if (src) txt(g, src, W - 70, 236, 20, 'rgba(243,237,226,.45)', { a: 'right', w: 500 });
  if (age) { txt(g, '你', 70, 930, 30, 'rgba(243,237,226,.7)', { a: 'left', w: 600 }); txt(g, age, 112, 936, 56, GOLD, { a: 'left', f: SERIF, w: 700 }); g.font = `700 56px ${SERIF}`; const w = g.measureText(age).width; txt(g, '岁', 120 + w, 930, 30, 'rgba(243,237,226,.7)', { a: 'left', w: 600 }); }
  g.restore(); };

/* ---------------------------------------------------------------- scenes */
const S: ((g: G) => void)[] = [
  // 0 hook: Notre-Dame, 1804 — he crowns himself, the pope sits
  (g) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#1a1410'); b.addColorStop(1, '#060505'); g.fillStyle = b; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { const x = 160 + i * 320; g.fillStyle = '#0d0a08'; g.fillRect(x - 40, 0, 80, H); g.beginPath(); g.moveTo(x - 40, 300); g.quadraticCurveTo(x + 120, 120, x + 280, 300); g.lineTo(x + 280, 0); g.lineTo(x - 40, 0); g.fill(); }
    pool(g, 1060, 260, 700, 'rgba(255,214,150,A)', 0.30); for (let i = 0; i < 5; i++) { const x = 700 + i * 140; g.fillStyle = 'rgba(255,220,160,.07)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 0); g.lineTo(x + 200, H); g.lineTo(x + 120, H); g.fill(); }
    g.fillStyle = '#0a0807'; g.fillRect(0, 820, W, 260);
    figure(g, 1300, 830, 1.15, { hat: 'mitre', robe: true, armL: 0.25, armR: 0.25 }); g.fillStyle = SIL; g.fillRect(1230, 700, 140, 130);
    figure(g, 960, 830, 1.35, { armL: -2.6, elL: -0.95, armR: -2.6, elR: -0.95 });
    const cx = 960, cy = 830 - 1.35 * 395; const gl = g.createRadialGradient(cx, cy, 5, cx, cy, 200); gl.addColorStop(0, 'rgba(255,220,140,.75)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gl; g.fillRect(cx - 200, cy - 200, 400, 400);
    g.strokeStyle = GOLD; g.lineWidth = 7; g.beginPath(); g.ellipse(cx, cy, 52, 14, 0, 0, 7); g.stroke(); for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 22, cy - 6); g.quadraticCurveTo(cx + k * 12, cy - 56, cx, cy - 66); g.stroke(); }
    for (let i = 0; i < 14; i++) figure(g, 120 + i * 60 + (i > 6 ? 900 : 0), 1000, 0.55, {});
    hud(g, '1804 · 12 · 2', '巴黎圣母院', '加冕礼', '35'); },
  // 1 title
  (g) => { g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H); pool(g, 960, 470, 700, 'rgba(241,197,109,A)', 0.14);
    txt(g, '历史 · 法兰西第一帝国 · 1769—1821', 960, 290, 30, 'rgba(243,237,226,.7)', { w: 600, ls: 6 });
    g.save(); g.font = `700 120px ${SERIF}`; g.textAlign = 'center'; const gr = g.createLinearGradient(0, 330, 0, 450); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#b8862e'); g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.45)'; g.shadowBlur = 30; g.fillText('《假如你是拿破仑》', 960, 430); g.restore();
    bicorne(g, 960, 620, 0.55, 0.8);
    txt(g, '法国，还记得它的皇帝吗？', 960, 720, 46, INK, { w: 700 }); txt(g, 'If you were Napoleon', 960, 772, 26, 'rgba(243,237,226,.55)', { w: 500, f: SERIF }); txt(g, '— VIBE知识大赏 —', 960, 850, 26, 'rgba(243,237,226,.5)', { w: 500 }); },
  // 2 the street, 1806
  (g) => { wall(g, '#3a3028'); pool(g, 760, 260, 700, 'rgba(255,200,130,A)', 0.4);
    g.fillStyle = '#0c0b0a'; g.fillRect(560, 120, 18, 760); g.beginPath(); g.moveTo(520, 120); g.lineTo(618, 120); g.lineTo(600, 190); g.lineTo(538, 190); g.fill(); g.fillStyle = 'rgba(255,214,150,.9)'; g.fillRect(546, 140, 46, 44);
    streetSign(g, 1120, 380, 1.25, 'RUE NAPOLÉON', '2ᵉ ARR');
    figure(g, 1500, 900, 0.9, { hat: 'bicorne' }); figure(g, 1640, 900, 0.85, {}); g.fillStyle = '#100d0b'; g.fillRect(0, 880, W, 200);
    hud(g, '1806', '巴黎', '新街落成，以皇帝命名', '36'); },
  // 3 Russia, 1812: 450,000 → 120,000
  (g) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#2c3440'); b.addColorStop(0.6, '#8d96a2'); b.addColorStop(1, '#d9dee4'); g.fillStyle = b; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e8ecf0'; g.beginPath(); g.moveTo(0, 640); g.quadraticCurveTo(700, 600, 1300, 650); g.quadraticCurveTo(1700, 670, W, 630); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    for (let i = 0; i < 60; i++) { const t = i / 60; const x = 120 + t * 1600, y = 680 + Math.sin(t * 6) * 18 + t * 80; const alive = i % 4 === 0; figure(g, x, y, 0.16 + t * 0.12, { col: alive ? SIL : 'rgba(7,7,10,.16)', lean: 0.15 }); }
    snow(g, 380, 5, 0.75);
    txt(g, '450,000', 560, 330, 110, SIL, { f: SERIF, w: 700 }); txt(g, '→', 960, 320, 80, SIL, { w: 300 }); txt(g, '≈120,000', 1360, 330, 110, RED, { f: SERIF, w: 700 });
    txt(g, '6 月过涅曼河', 560, 390, 32, '#1c2028', { w: 700 }); txt(g, '12 月', 1360, 390, 32, '#1c2028', { w: 700 });
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 840, 420, 140); hud(g, '1812', '俄国', '法军入侵俄国', '42'); },
  // 4 1814: the sign is changed
  (g) => { wall(g, '#2e2a2a'); pool(g, 960, 260, 800, 'rgba(210,220,240,A)', 0.22);
    streetSign(g, 1040, 380, 1.25, 'RUE DE LA PAIX', '2ᵉ ARR');
    streetSign(g, 700, 900, 0.85, 'RUE NAPOLÉON', '2ᵉ ARR', 0.2); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 960, W, 120);
    figure(g, 1500, 930, 0.95, { armR: 2.5, elR: -0.3 }); g.fillStyle = SIL; g.fillRect(1450, 700, 12, 230);
    tag(g, '拿破仑街 → 和平街', 1040, 560, INK, 40);
    hud(g, '1814', '巴黎', '波旁复辟，街道改名', '44'); },
  // 5 St Helena: a tiny island, a lone figure; the 'short' myth
  (g) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#1b2333'); b.addColorStop(0.55, '#c27a4a'); b.addColorStop(0.62, '#3a3a48'); b.addColorStop(1, '#0c0f16'); g.fillStyle = b; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,200,140,.85)'; g.beginPath(); g.arc(1080, 600, 60, Math.PI, 0); g.fill();
    g.fillStyle = '#0a0b10'; g.beginPath(); g.moveTo(380, 680); g.quadraticCurveTo(520, 560, 700, 590); g.quadraticCurveTo(820, 600, 900, 680); g.fill();
    figure(g, 640, 585, 0.32, { hat: 'bicorne', armL: 0.05, armR: 0.05, elL: 1.4, elR: 1.4 });
    // the caricature vs the ruler
    g.strokeStyle = 'rgba(243,237,226,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(1460, 900); g.lineTo(1460, 520); g.stroke(); for (let k = 0; k <= 10; k++) { const y = 900 - k * 38; g.beginPath(); g.moveTo(1460, y); g.lineTo(1460 + (k % 5 ? 14 : 28), y); g.stroke(); }
    figure(g, 1560, 900, 1.12, { hat: 'bicorne', col: '#0a0b10' }); txt(g, '1.69 米', 1440, 560, 50, GOLD, { f: SERIF, w: 700, a: 'right' });
    figure(g, 1790, 900, 0.48, { hat: 'bicorne', col: 'rgba(220,90,70,.9)' }); txt(g, '漫画里的你', 1790, 690, 30, '#ff9a8a', { w: 700 });
    hud(g, '1815—1821', '圣赫勒拿岛', '离非洲大陆近两千公里', '46'); },
  // 6 1840: home to the golden dome, cold, crowds
  (g) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#2a3040'); b.addColorStop(1, '#0c0d12'); g.fillStyle = b; g.fillRect(0, 0, W, H); pool(g, 960, 300, 600, 'rgba(241,197,109,A)', 0.25);
    dome(g, 960, 820, 1.0);
    for (let i = 0; i < 70; i++) { const x = (i * 97) % W, row = i % 3; figure(g, x, 1000 - row * 30, 0.42 - row * 0.06, { col: `rgba(7,7,10,${0.95 - row * 0.2})` }); }
    g.fillStyle = SIL; rr(g, 820, 800, 280, 110, 10); g.fill(); g.fillStyle = GOLD; g.fillRect(860, 790, 200, 10); for (const x of [860, 1060]) { g.beginPath(); g.arc(x, 910, 34, 0, 7); g.fill(); g.fillStyle = SIL; g.beginPath(); g.arc(x, 910, 26, 0, 7); g.fill(); g.fillStyle = GOLD; }
    snow(g, 160, 9, 0.55);
    hud(g, '1840 · 12 · 15', '巴黎 · 荣军院', '归葬巴黎', '71'); },
  // 7 2023: the hat under a spotlight, the hammer
  (g) => { g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,240,210,.06)'; g.beginPath(); g.moveTo(860, 0); g.lineTo(1060, 0); g.lineTo(1260, 820); g.lineTo(660, 820); g.fill();
    g.fillStyle = '#16131a'; rr(g, 760, 640, 400, 200, 8); g.fill(); g.fillStyle = '#3a1c24'; g.fillRect(740, 620, 440, 30);
    bicorne(g, 960, 610, 0.9, 1);
    txt(g, '€1,932,000', 960, 300, 96, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.4)' });
    for (let i = 0; i < 9; i++) figure(g, 140 + i * 200 + (i > 3 ? 280 : 0), 1060, 0.55, { col: '#050506' });
    tag(g, '约 120 顶，大多已经丢了', 960, 905, INK, 36);
    hud(g, '2023 · 11', '枫丹白露 · 拍卖', '二角帽拍卖纪录', '254'); },
  // 8 end: 2026, the same street, still 'de la Paix'
  (g) => { wall(g, '#2a2420'); pool(g, 960, 300, 800, 'rgba(255,214,160,A)', 0.30);
    streetSign(g, 960, 360, 1.25, 'RUE DE LA PAIX', '2ᵉ ARR'); bicorne(g, 960, 680, 0.45, 0.6);
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,${200 + i * 8},150,.5)`; g.beginPath(); g.arc(200 + i * 300, 860, 6, 0, 7); g.fill(); }
    hud(g, '2026', '巴黎', '那条街，没有改回来', '257'); },
];
const tag = (g: G, s: string, x: number, y: number, col = INK, size = 40) => { g.font = `900 ${size}px ${SANS}`; const tw = g.measureText(s).width; rr(g, x - tw / 2 - 22, y - size * 0.95, tw + 44, size * 1.45, size * 0.3); g.fillStyle = 'rgba(10,10,12,.72)'; g.fill(); txt(g, s, x, y, size, col); };
const LINES = ['35岁，教皇就站在你身边——你自己把皇冠戴在了头上', '', '巴黎修了一条新街，名字就叫「拿破仑街」', '四十五万人跟着你过河；到了12月，还剩约{十二万}', '那条拿破仑街，被改名叫「和平街」', '英国漫画里，你是个小矮子。其实你[一米六九]', '12月15日，巴黎很冷，人挤满了街，看你回家', '你戴过约120顶帽子，其中一顶卖了[193.2万欧元]', '他们只是两百年都没想好，该怎么记住你'];

const Overlay: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H); S[i](g); vignette(g, 0.5); grain(g, 5 + i, 0.05);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR); g.fillRect(0, H - BAR, W, BAR); if (i !== 1) txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.5)', { w: 500, a: 'right' }); if (LINES[i]) subtitle(g, LINES[i], 1); }, [i]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
export const Keys: React.FC = () => {
  const f = useCurrentFrame(); const i = Math.min(S.length - 1, f); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + LINES.join('') + '历史法兰西第一帝国1769—1821《假如你是拿破仑》法国还记得它的皇帝吗？IfyouwereNapoleonVIBE知识大赏巴黎圣母院加冕礼新街落成以命名俄国入侵涅曼河月波旁复辟道改名拿破仑街→和平圣赫勒拿岛离非洲大陆近两千公里英漫画里的米荣军院归葬€1,932,000约顶多已经丢了枫丹白露拍卖二角帽纪录那条没有回来RUENAPOLÉONDELAPAIX2ᵉARR岁450,0006月12≈.';
    Promise.all([400, 500, 600, 700, 900].flatMap((w) => [`${w} 60px ${SANS}`, `${w} 60px ${SERIF}`]).map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}><Overlay i={i} /></AbsoluteFill>;
};

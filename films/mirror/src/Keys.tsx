/* 《哪个才是真的你》 2D key frames. One girl (side part on her right, mole on her left cheek, right brow higher),
   a bathroom at night, a phone. Frame i = scene i. Everything drawn on one canvas. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { W, H, GOLD, INK, RED, SERIF, SANS, txt, subtitle, mark, grain, vignette, FONT_CHARS, rr } from './lib';

type G = CanvasRenderingContext2D;
const BAR = 100;
const SKIN = '#f0c7a8', SKIN_D = '#d79f80', HAIR = '#2a1b15', HAIR_L = '#5a3a2a', TOP = '#3e5b6e', MOLE = '#5a3528';

/* ---------------------------------------------------------------- the girl */
type Face = { flip?: boolean; wide?: number; blink?: number; mouth?: number; pretty?: number; look?: number; top?: string };
export const girl = (g: G, x: number, y: number, k: number, o: Face = {}) => {
  const w = o.wide ?? 0, pr = o.pretty ?? 0, bl = o.blink ?? 0, mo = o.mouth ?? 0;
  g.save(); g.translate(x, y); g.scale(o.flip ? -k : k, k);
  // shoulders + neck
  g.fillStyle = o.top ?? TOP; g.beginPath(); g.moveTo(-230, 330); g.bezierCurveTo(-225, 230, -150, 190, -60, 180); g.lineTo(60, 180); g.bezierCurveTo(150, 190, 225, 230, 230, 330); g.closePath(); g.fill();
  g.fillStyle = SKIN_D; g.beginPath(); g.moveTo(-42, 100); g.lineTo(-46, 190); g.quadraticCurveTo(0, 215, 46, 190); g.lineTo(42, 100); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 182, 52, 14, 0, 0, 7); g.fill();
  // hair, back
  g.fillStyle = HAIR; g.beginPath(); g.moveTo(-132, -40); g.bezierCurveTo(-156, 60, -146, 130, -122, 156); g.quadraticCurveTo(0, 170, 122, 156); g.bezierCurveTo(146, 130, 156, 60, 132, -40); g.bezierCurveTo(124, -186, -124, -186, -132, -40); g.fill();
  // ears (shrink when the camera is close)
  const es = 1 - 0.45 * w; g.fillStyle = SKIN_D; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * (100 - 6 * w), 12, 15 * es, 26 * es, 0, 0, 7); g.fill(); }
  // face
  const fw = (1 - 0.07 * w) * (1 - 0.04 * pr), cw = 1 - 0.12 * w - 0.09 * pr;
  const face = () => { g.beginPath(); g.moveTo(0, -128); g.bezierCurveTo(70 * fw, -128, 102 * fw, -80, 102 * fw, -5); g.bezierCurveTo(102 * fw, 60, 70 * cw, 118, 0, 136 - 8 * w); g.bezierCurveTo(-70 * cw, 118, -102 * fw, 60, -102 * fw, -5); g.bezierCurveTo(-102 * fw, -80, -70 * fw, -128, 0, -128); g.closePath(); };
  const sk = g.createRadialGradient(-30, -40, 20, 0, 0, 170); sk.addColorStop(0, '#f8d9c0'); sk.addColorStop(0.6, SKIN); sk.addColorStop(1, SKIN_D);
  face(); g.fillStyle = sk; g.fill();
  g.save(); face(); g.clip(); { const sh = g.createRadialGradient(110, 20, 10, 110, 20, 120); sh.addColorStop(0, 'rgba(150,80,60,.22)'); sh.addColorStop(1, 'rgba(150,80,60,0)'); g.fillStyle = sh; g.fillRect(-10, -130, 130, 270); } g.restore();
  // blush
  g.fillStyle = 'rgba(232,120,110,.22)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 58, 42, 26, 14, 0, 0, 7); g.fill(); }
  // brows: her right (viewer's left) sits higher
  g.strokeStyle = HAIR; g.lineCap = 'round'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(-68, -60); g.quadraticCurveTo(-46, -78, -20, -64); g.stroke();
  g.beginPath(); g.moveTo(20, -54); g.quadraticCurveTo(44, -66, 66, -52); g.stroke();
  // eyes
  const eh = 17 * (1 + 0.12 * pr) * (1 - bl), ew = 29 * (1 + 0.07 * pr), ex = 42 + 4 * w;
  for (const s of [-1, 1]) { const cx = s * ex, cy = -16;
    if (eh < 3) { g.strokeStyle = HAIR; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - ew, cy); g.quadraticCurveTo(cx, cy + 8, cx + ew, cy); g.stroke(); continue; }
    g.fillStyle = '#fbf6f0'; g.beginPath(); g.moveTo(cx - ew, cy); g.quadraticCurveTo(cx, cy - eh * 1.6, cx + ew, cy); g.quadraticCurveTo(cx, cy + eh * 1.3, cx - ew, cy); g.fill();
    g.save(); g.clip(); g.fillStyle = '#3a241a'; g.beginPath(); g.arc(cx + (o.look ?? 0) * 6, cy, 14 * (1 + 0.06 * pr), 0, 7); g.fill(); g.fillStyle = '#120a08'; g.beginPath(); g.arc(cx + (o.look ?? 0) * 6, cy, 6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + (o.look ?? 0) * 6 - 4, cy - 5, 3.5, 0, 7); g.fill(); g.restore();
    g.strokeStyle = HAIR; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - ew - 2, cy + 1); g.quadraticCurveTo(cx, cy - eh * 1.65, cx + ew + 3, cy - 2); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(cx + s * (ew + 1), cy - 2); g.lineTo(cx + s * (ew + 9), cy - 8); g.stroke(); }
  // nose: widens up close
  const nw = (1 + 0.35 * w) * (1 - 0.1 * pr);
  g.strokeStyle = 'rgba(160,90,65,.55)'; g.lineWidth = 4; g.beginPath(); g.moveTo(10, -6); g.quadraticCurveTo(16 * nw, 22, 14 * nw, 38); g.stroke();
  g.fillStyle = 'rgba(170,95,70,.55)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 11 * nw, 42, 6 * nw, 3.6, s * 0.3, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,235,220,.55)'; g.beginPath(); g.ellipse(-2, 30, 7 * nw, 5 * nw, 0, 0, 7); g.fill();
  // mouth
  g.fillStyle = '#c4645c'; g.beginPath(); g.moveTo(-28, 74); g.quadraticCurveTo(-12, 64, 0, 69); g.quadraticCurveTo(12, 64, 28, 74); g.quadraticCurveTo(0, 86 + mo * 14, -28, 74); g.fill();
  if (mo > 0.1) { g.fillStyle = '#5a2420'; g.beginPath(); g.ellipse(0, 77, 16, 6 * mo, 0, 0, 7); g.fill(); }
  // mole on her left cheek (viewer's right)
  g.fillStyle = MOLE; g.beginPath(); g.arc(56, 60, 5, 0, 7); g.fill();
  // hair, front: side part on her right (viewer's left), sweep across to the other temple
  g.fillStyle = HAIR; g.beginPath(); g.moveTo(-34, -150); g.bezierCurveTo(40, -164, 132, -118, 128, 0); g.bezierCurveTo(112, -44, 84, -82, 30, -96); g.bezierCurveTo(0, -102, -24, -112, -34, -122); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-40, -150); g.bezierCurveTo(-96, -146, -134, -96, -128, 10); g.bezierCurveTo(-110, -60, -82, -104, -40, -116); g.closePath(); g.fill();
  g.strokeStyle = HAIR_L; g.lineWidth = 3; g.globalAlpha = 0.7; for (const d of [0, 14, 28]) { g.beginPath(); g.moveTo(-20 + d, -128 + d * 0.2); g.bezierCurveTo(40 + d, -126, 90, -90 + d, 104, -30 + d); g.stroke(); } g.globalAlpha = 1;
  g.restore();
};

/* ---------------------------------------------------------------- sets & props */
const bathroom = (g: G, lit = 1) => {
  const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#1d2226'); b.addColorStop(1, '#0c0e10'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 2; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const l = g.createRadialGradient(W / 2, 140, 40, W / 2, 300, 900); l.addColorStop(0, `rgba(255,214,160,${0.42 * lit})`); l.addColorStop(1, 'rgba(255,214,160,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
};
const counter = (g: G, y = 900) => { const c = g.createLinearGradient(0, y, 0, y + 80); c.addColorStop(0, '#d9d2c6'); c.addColorStop(1, '#8a847a'); g.fillStyle = c; g.fillRect(0, y, W, 90); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 88, W, 4); };
const mirror = (g: G, x: number, y: number, w: number, h: number, inner: (g: G) => void, light = true) => {
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; rr(g, x - 14, y - 14, w + 28, h + 28, 34); g.fillStyle = '#b89a64'; g.fill(); g.restore();
  rr(g, x - 14, y - 14, w + 28, h + 28, 34); g.strokeStyle = '#e8cf94'; g.lineWidth = 3; g.stroke();
  g.save(); rr(g, x, y, w, h, 24); g.clip(); const m = g.createLinearGradient(x, y, x, y + h); m.addColorStop(0, '#3a3f44'); m.addColorStop(1, '#1b1e21'); g.fillStyle = m; g.fillRect(x, y, w, h);
  inner(g);
  const s = g.createLinearGradient(x, y, x + w, y + h); s.addColorStop(0, 'rgba(255,255,255,.10)'); s.addColorStop(0.35, 'rgba(255,255,255,0)'); s.addColorStop(0.62, 'rgba(255,255,255,0)'); s.addColorStop(0.7, 'rgba(255,255,255,.07)'); s.addColorStop(0.78, 'rgba(255,255,255,0)'); g.fillStyle = s; g.fillRect(x, y, w, h); g.restore();
  if (light) { rr(g, x + w * 0.2, y - 46, w * 0.6, 18, 9); g.fillStyle = '#fff1d8'; g.shadowColor = '#ffd9a0'; g.shadowBlur = 40; g.fill(); g.shadowBlur = 0; }
};
const phone = (g: G, x: number, y: number, w: number, inner: (g: G, sw: number, sh: number) => void, tilt = 0) => {
  const h = w * 2.08; g.save(); g.translate(x, y); g.rotate(tilt);
  g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 50; g.shadowOffsetY = 20; rr(g, -w / 2, -h / 2, w, h, w * 0.14); g.fillStyle = '#16171a'; g.fill(); g.shadowColor = 'transparent';
  rr(g, -w / 2, -h / 2, w, h, w * 0.14); g.strokeStyle = '#4a4c52'; g.lineWidth = 3; g.stroke();
  const p = w * 0.04, sw = w - 2 * p, sh = h - 2 * p; g.save(); rr(g, -sw / 2, -sh / 2, sw, sh, w * 0.11); g.clip(); g.translate(-sw / 2, -sh / 2); g.fillStyle = '#222'; g.fillRect(0, 0, sw, sh); inner(g, sw, sh); g.restore();
  rr(g, -w * 0.15, -h / 2 + p + 12, w * 0.3, w * 0.07, w * 0.035); g.fillStyle = '#000'; g.fill();
  g.restore();
};
const camUI = (g: G, sw: number, sh: number) => { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, sh - sh * 0.16, sw, sh * 0.16); g.fillStyle = '#fff'; g.beginPath(); g.arc(sw / 2, sh - sh * 0.08, sw * 0.1, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.arc(sw / 2, sh - sh * 0.08, sw * 0.125, 0, 7); g.stroke(); };
const portraitBg = (g: G, sw: number, sh: number) => { const b = g.createLinearGradient(0, 0, 0, sh); b.addColorStop(0, '#3a3530'); b.addColorStop(1, '#1d1a18'); g.fillStyle = b; g.fillRect(0, 0, sw, sh); const l = g.createRadialGradient(sw * 0.3, sh * 0.2, 10, sw * 0.3, sh * 0.2, sh * 0.7); l.addColorStop(0, 'rgba(255,214,160,.35)'); l.addColorStop(1, 'rgba(255,214,160,0)'); g.fillStyle = l; g.fillRect(0, 0, sw, sh); };
const tag = (g: G, s: string, x: number, y: number, col = INK, size = 40, bg = 'rgba(10,10,12,.72)') => { g.font = `900 ${size}px ${SANS}`; const tw = g.measureText(s).width; rr(g, x - tw / 2 - 22, y - size * 0.95, tw + 44, size * 1.45, size * 0.3); g.fillStyle = bg; g.fill(); txt(g, s, x, y, size, col); };
const arrow = (g: G, x1: number, y1: number, x2: number, y2: number, col: string, wdt = 4) => { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = wdt; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 18 * Math.cos(a - 0.4), y2 - 18 * Math.sin(a - 0.4)); g.lineTo(x2 - 18 * Math.cos(a + 0.4), y2 - 18 * Math.sin(a + 0.4)); g.fill(); };
const photoPrint = (g: G, x: number, y: number, w: number, rot: number, f: Face, label?: string) => { const h = w * 1.25; g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = '#f2ede4'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 110); g.clip(); g.translate(-w / 2 + 20, -h / 2 + 20); portraitBg(g, w - 40, h - 110); girl(g, (w - 40) / 2, (h - 110) * 0.5, (w - 40) / 340, f); g.restore();
  if (label) txt(g, label, 0, h / 2 - 30, 44, '#2a2016'); g.restore(); };

/* ---------------------------------------------------------------- scenes */
const S: ((g: G) => void)[] = [
  // 0 hook: preview vs saved
  (g) => { bathroom(g); counter(g, 930);
    phone(g, 700, 540, 330, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.42, sw / 300, { flip: true, wide: 0.5 }); camUI(c, sw, sh); }, -0.05);
    phone(g, 1230, 540, 330, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.42, sw / 300, { wide: 0.5, mouth: 0.15 }); }, 0.05);
    tag(g, '预览：还挺好看', 700, 172, INK, 40); tag(g, '咔嚓 → 这谁？', 1230, 172, '#ff9a8a', 40);
    arrow(g, 900, 540, 1030, 540, GOLD, 6); },
  // 1 title + the choice
  (g) => { bathroom(g, 0.8);
    phone(g, 640, 640, 205, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.42, sw / 300, { wide: 0.5 }); camUI(c, sw, sh); });
    mirror(g, 1140, 470, 300, 380, (c) => girl(c, 1290, 690, 0.85, { flip: true }));
    tag(g, 'A  原相机', 640, 920, '#e2a03a', 46); tag(g, 'B  镜子', 1290, 920, '#7fd08e', 46);
    txt(g, '哪个更丑？', 965, 680, 60, INK, { glow: 'rgba(0,0,0,.9)' }); },
  // 2 1977: two prints
  (g) => { const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#2a2420'); b.addColorStop(1, '#14100d'); g.fillStyle = b; g.fillRect(0, 0, W, H);
    const l = g.createRadialGradient(960, 420, 50, 960, 500, 900); l.addColorStop(0, 'rgba(255,220,170,.35)'); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
    txt(g, '1977', 960, 200, 90, 'rgba(241,197,109,.85)', { f: SERIF, w: 700 });
    photoPrint(g, 700, 560, 380, -0.04, {}, '正片'); photoPrint(g, 1220, 560, 380, 0.04, { flip: true }, '左右翻转');
    tag(g, '闺蜜选这张', 700, 905, '#9cc3ff', 42); tag(g, '她自己选这张', 1220, 905, GOLD, 42); },
  // 3 mirror: what flips
  (g) => { bathroom(g); counter(g, 950);
    mirror(g, 610, 290, 700, 640, (c) => girl(c, 960, 640, 1.5, { flip: true }));
    const call = (s: string, tx: number, ty: number, px: number, py: number) => { arrow(g, tx + (tx < 960 ? 120 : -120), ty, px, py, GOLD, 3); tag(g, s, tx, ty + 14, INK, 38); };
    call('分缝', 360, 360, 1011, 418); call('高一点的眉毛', 1580, 500, 1030, 545); call('痣', 360, 740, 876, 730);
    txt(g, '你看了上千遍的，是反过来的自己', 960, 175, 44, GOLD); },
  // 4 distance: 30 cm vs 1.5 m
  (g) => { g.fillStyle = '#121416'; g.fillRect(0, 0, W, H);
    const d = (cx: number, dist: number, label: string, wide: number, col: string) => {
      g.save(); g.translate(cx, 330); // top-down head + camera
      g.fillStyle = SKIN_D; g.beginPath(); g.ellipse(0, 0, 70, 86, 0, 0, 7); g.fill(); g.fillStyle = HAIR; g.beginPath(); g.ellipse(0, -12, 74, 80, 0, Math.PI, 0); g.fill(); g.fillStyle = SKIN_D; g.beginPath(); g.moveTo(-14, 80); g.lineTo(0, 108); g.lineTo(14, 80); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 72, 0, 10, 20, 0, 0, 7); g.fill(); }
      const cy = 108 + dist; g.fillStyle = '#ddd'; rr(g, -26, cy, 52, 18, 5); g.fill();
      g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([8, 8]); for (const [tx, ty] of [[0, 108], [-72, 0], [72, 0]]) { g.beginPath(); g.moveTo(0, cy); g.lineTo(tx, ty); g.stroke(); } g.setLineDash([]);
      txt(g, label, 120, 108 + dist / 2 + 14, 42, col, { a: 'left' }); g.restore();
      g.save(); rr(g, cx - 170, 620, 340, 290, 20); g.clip(); portraitBg(g, 0, 0); g.translate(cx - 170, 620); portraitBg(g, 340, 290); girl(g, 170, 175, 0.95, { wide }); g.restore(); };
    d(560, 120, '30 厘米', 1, '#ff8a7a'); d(1360, 200, '1.5 米', 0, '#9cc3ff');
    txt(g, '鼻子宽了', 960, 700, 52, INK); txt(g, '三成', 960, 840, 120, GOLD, { f: SERIF, w: 700 });
    txt(g, '近处被放大，远处被缩小', 960, 180, 40, 'rgba(243,237,226,.7)', { w: 600 }); },
  // 5 frozen face: a strip of frames, 91%
  (g) => { g.fillStyle = '#0e0f11'; g.fillRect(0, 0, W, H);
    const fr: Face[] = [{ mouth: 0.6 }, { blink: 0.6 }, { mouth: 0.2, look: 1 }, { mouth: 0.9 }, {}, { blink: 1 }, { mouth: 0.5, look: -1 }];
    g.fillStyle = '#050505'; g.fillRect(0, 300, W, 360); for (let x = 20; x < W; x += 60) { g.fillStyle = '#2a2a2a'; rr(g, x, 312, 30, 20, 4); g.fill(); rr(g, x, 628, 30, 20, 4); g.fill(); }
    fr.forEach((f, i) => { const x = 140 + i * 275; g.save(); g.beginPath(); g.rect(x - 120, 345, 240, 270); g.clip(); g.translate(x - 120, 345); portraitBg(g, 240, 270); girl(g, 120, 160, 0.78, f); g.restore(); if (i === 1 || i === 5) { g.strokeStyle = RED; g.lineWidth = 6; g.strokeRect(x - 120, 345, 240, 270); } });
    txt(g, '91%', 760, 850, 150, GOLD, { f: SERIF, w: 700 }); txt(g, '的静帧，不如视频里好看', 1220, 835, 50, INK, { w: 700 }); txt(g, '2012 · 定格脸效应', 960, 220, 40, 'rgba(243,237,226,.7)', { w: 600 }); },
  // 6 the beauty filter in your head
  (g) => { bathroom(g, 0.9);
    const xs = [520, 960, 1400], pr = [0, 1, 2];
    xs.forEach((x, i) => { g.save(); rr(g, x - 170, 260, 340, 420, 24); g.clip(); g.translate(x - 170, 260); portraitBg(g, 340, 420); girl(g, 170, 230, 1.0, { flip: true, pretty: pr[i] }); g.restore();
      rr(g, x - 170, 260, 340, 420, 24); g.strokeStyle = i === 1 ? GOLD : 'rgba(255,255,255,.25)'; g.lineWidth = i === 1 ? 8 : 3; g.stroke();
      txt(g, ['真实', '美化 10%', '美化 20%'][i], x, 740, 44, i === 1 ? GOLD : INK); });
    tag(g, '大多数人认成自己的，是这张', 960, 840, GOLD, 42);
    txt(g, '脑内美颜', 960, 200, 64, INK, { f: SERIF, w: 700 }); },
  // 7 callback / end
  (g) => { bathroom(g); counter(g, 950);
    mirror(g, 420, 300, 420, 560, (c) => girl(c, 630, 600, 1.1, { flip: true }));
    phone(g, 1330, 590, 260, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.42, sw / 300, { mouth: 0.4, look: 1 }); });
    txt(g, '真的你，是会动的你', 960, 185, 56, GOLD, { f: SERIF, w: 700 });
    tag(g, '你更信原相机，还是镜子？', 960, 905, INK, 44); },
];
const LINES = ['前置摄像头里，还挺好看。咔嚓——这谁？', '原相机里的你，和镜子里的你，哪个更丑？', '同一张脸，两个人选的正好相反', '是你看了上千遍的那张脸，本来就是[反的]', '和1.5米外拍的比，鼻子宽了[三成]', '照片抓到的，常是半眨眼、半句话的你', '你脑子里的自己，自带一层[美颜]', '评论区见'];

const Overlay: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H); S[i](g); vignette(g, 0.5); grain(g, 5 + i, 0.05);
    if (i === 1) { g.save(); g.font = `700 112px ${SERIF}`; g.textAlign = 'center'; const gr = g.createLinearGradient(0, 300, 0, 420); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#b8862e'); g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 30; g.fillStyle = gr; g.fillText('哪个才是真的你', 960, 290); g.restore(); txt(g, '— VIBE知识大赏 —', 960, 345, 26, 'rgba(243,237,226,.6)', { w: 500 }); }
    g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR); g.fillRect(0, H - BAR, W, BAR); mark(g, i === 1 ? 0 : 0.9); subtitle(g, LINES[i], 1); }, [i]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
export const Keys: React.FC = () => {
  const f = useCurrentFrame(); const i = Math.min(S.length - 1, f); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + LINES.join('') + '预览还挺好看咔嚓这谁原相机镜子哪个更丑AB1977正片左右翻转闺蜜选这张她自己分缝高一点的眉毛痣你看了上千遍是反过来30厘米1.5米鼻子宽三成近处被放大远缩小91%静帧不如视频里2012定格脸效应真实美化10%20%大多数人认成脑内颜会动信还—VIBE知识大赏哪才';
    Promise.all([400, 500, 600, 700, 900].flatMap((w) => [`${w} 60px ${SANS}`, `${w} 60px ${SERIF}`]).map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}><Overlay i={i} /></AbsoluteFill>;
};

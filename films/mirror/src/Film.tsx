/* 《哪个才是真的你》 full film, 2D. One canvas per frame; time T in seconds; music anchors from the owner's track (117.94 bpm). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { W, H, GOLD, INK, RED, SERIF, SANS, txt, subtitle, grain, vignette, FONT_CHARS, rr, ramp, eio, eo, back, lerp, clamp } from './lib';
import { girl, Face, bathroom, counter, mirror, phone, camUI, portraitBg, tag, arrow } from './Keys';

type G = CanvasRenderingContext2D;
export const LEN = 145.0, FPS = 30;
const BAR = 100, BLUE = '#9cc3ff', GREEN = '#7fd08e', AMBER = '#e2a03a';
// anchors
const SHUT = 4.404, MIR = 8.473, AB = 12.54, TITLE = 16.613, OPEN = 20.683, BREAK = 49.172, BUILD = 65.451, DROP = 82.239;
const P1 = 89.87, P2 = 98.0, P3 = 106.15, P4 = 114.3, P5 = 122.4, P6 = 130.6, END = 138.7;

/* ---------------------------------------------------------------- script */
export const LINES: [number, number, string][] = [
  [0.6, 3.9, '前置摄像头里，还挺好看'],
  [4.6, 6.3, '咔嚓。这谁？'],
  [6.5, 9.3, '原相机里的你，和镜子里的你'],
  [9.5, 12.4, '哪个更丑？'],
  [12.7, 15.9, '先在心里选一个'],
  [20.8, 24.2, '1977年，美国一间心理学实验室'],
  [24.4, 27.4, '研究者给一群女大学生拍照'],
  [27.6, 30.2, '同一张脸，冲成两张'],
  [30.4, 33.6, '一张是正的，一张左右翻过来'],
  [33.8, 36.6, '然后问她：你更喜欢哪张？'],
  [36.8, 39.3, '她挑了[翻过来]的那张'],
  [39.5, 41.8, '再问她最好的朋友'],
  [42.0, 44.4, '朋友挑了[正的]那张'],
  [44.6, 48.9, '同一张脸，两个人选的正好相反'],
  [49.4, 51.8, '不是照片拍丑了'],
  [52.0, 56.0, '是你看了上千遍的那张脸，本来就是[反的]'],
  [56.2, 59.8, '人脸不对称：分缝、痣、高一点的眉毛'],
  [60.0, 62.8, '镜子里，它们全在另一边'],
  [63.0, 65.3, '看得越多越顺眼——[曝光效应]'],
  [65.6, 68.8, '很多手机的前置预览，也是镜像的'],
  [69.0, 71.8, '一按快门，它把你翻了回去'],
  [72.0, 74.2, '但翻转只是一半'],
  [74.4, 77.3, '自拍时，手机离脸大约30厘米'],
  [77.5, 80.3, '鼻子离镜头最近，耳朵最远'],
  [80.5, 82.1, '差多少？'],
  [82.3, 85.8, '和1.5米外拍的比，鼻子宽了[三成]'],
  [86.0, 89.2, '那离远点拍，就是真的你了吗？'],
  [89.95, 91.5, '也不是。'],
  [91.7, 94.3, '别人看到的你，一直在动'],
  [94.5, 97.8, '把一段说话的视频，切成单帧'],
  [98.05, 101.3, '[91%]的静帧，不如视频里好看'],
  [101.5, 105.0, '照片抓到的，常是半眨眼、半句话的你'],
  [105.2, 107.9, '那镜子总可以信了吧？'],
  [108.1, 111.4, '2008年的实验：把照片一点点调好看'],
  [111.6, 115.0, '大多数人，把美化过的那张认成了自己'],
  [115.2, 118.2, '你脑子里的自己，自带一层[美颜]'],
  [118.4, 121.3, '① 手机离远点，用2倍镜头'],
  [121.5, 124.2, '② 拍段视频，比摆拍更像你'],
  [124.4, 127.9, '③ 想和镜子一样，就开「镜像前置镜头」'],
  [128.2, 131.6, '镜子里是反的你，原相机里是凑太近的你'],
  [131.8, 134.2, '照片里，是定格的你'],
  [134.4, 138.4, '真的你，是别人眼里那个——[会动的你]'],
];

/* ---------------------------------------------------------------- life: blinks and talking on their own clock */
const BLINKS = [1.9, 5.6, 7.9, 11.3, 14.8, 22.1, 26.4, 47.0, 50.7, 54.3, 58.1, 66.2, 70.9, 86.9, 92.6, 94.0, 96.3, 106.0, 110.4, 113.6, 117.1, 129.5, 133.0, 135.6, 137.9];
const blink = (T: number) => { let b = 0; for (const t of BLINKS) { const d = T - t; if (d > -0.07 && d < 0.13) b = Math.max(b, 1 - Math.abs(d - 0.03) / 0.1); } return clamp(b); };
const talk = (T: number) => clamp(0.45 + 0.35 * Math.sin(T * 13.1) + 0.25 * Math.sin(T * 7.3 + 1));
const breath = (T: number) => Math.sin(T * 1.3) * 0.006;
const flipX = (g: G, x: number, y: number, sx: number, draw: () => void) => { g.save(); g.translate(x, y); g.scale(sx, 1); g.translate(-x, -y); draw(); g.restore(); };
const zoom = (g: G, cx: number, cy: number, s: number) => { g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); };
const flash = (g: G, T: number, t0: number, a = 0.9) => { const k = T - t0; if (k < 0 || k > 0.5) return; g.fillStyle = `rgba(255,255,255,${a * (1 - k / 0.5) ** 2})`; g.fillRect(0, 0, W, H); };
const fadeIn = (g: G, T: number, t0: number, d = 0.4) => { const k = 1 - ramp(T, t0, d); if (k > 0) { g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, W, H); } };
const pop = (T: number, t0: number, d = 0.35) => back(ramp(T, t0, d));

/* ---------------------------------------------------------------- 1 · hook (0 – 16.6) */
const hook = (g: G, T: number) => {
  const lit = T < 0.33 ? 0.1 : T < 0.45 ? 0.6 : T < 0.52 ? 0.25 : 1; bathroom(g, lit); counter(g, 940);
  const pull = eio(ramp(T, 6.5, 1.6)); // phone slides left, mirror opens on the right
  const px = lerp(960, 640, pull), pw = lerp(390, 230, pull), py = lerp(560, 600, pull);
  const shotFlip = T < SHUT ? 1 : Math.cos(Math.PI * eio(ramp(T, SHUT + 0.15, 0.5))); // preview (mirrored) flips to the saved photo
  g.save(); zoom(g, 960, 560, 1 + 0.02 * ramp(T, 0, 6));
  phone(g, px, py, pw, (c, sw, sh) => { portraitBg(c, sw, sh);
    const saved = T >= SHUT + 0.4; flipX(c, sw / 2, 0, shotFlip, () => girl(c, sw / 2, sh * 0.42 + breath(T) * sh, sw / 300, { flip: true, wide: 0.55, blink: saved ? 0.55 : blink(T), smile: saved ? 0 : 0.6, mouth: saved ? 0.25 : 0, tilt: saved ? 0.03 : 0 }));
    if (T < SHUT) camUI(c, sw, sh); else { c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, 0, sw, 70); txt(c, '照片', sw / 2, 50, 30, INK, { w: 600 }); } }, (1 - pull) * -0.02);
  g.restore();
  if (T > SHUT + 0.5 && T < 6.6) { const a = ramp(T, SHUT + 0.5, 0.2) * (1 - ramp(T, 6.3, 0.3)); txt(g, '？', px + pw * 0.75, 330, 120, INK, { alpha: a, f: SERIF }); }
  // the mirror
  const ma = ramp(T, MIR, 0.25); if (ma > 0) { g.save(); g.globalAlpha = ma; mirror(g, 1140, 410, 300, 420, (c) => girl(c, 1290, 650 + breath(T) * 300, 0.9, { flip: true, blink: blink(T + 0.4), smile: 0.4 })); g.restore(); }
  if (T > 9.5) { const a = ramp(T, 9.5, 0.3); g.save(); g.globalAlpha = a; txt(g, '哪个更丑？', 965, 640, 64, INK, { glow: 'rgba(0,0,0,.9)' }); g.restore(); }
  if (T > AB) { const s = pop(T, AB); g.save(); g.translate(640, 935); g.scale(s, s); tag(g, 'A  原相机', 0, 0, AMBER, 46); g.restore(); g.save(); g.translate(1290, 935); g.scale(s, s); tag(g, 'B  镜子', 0, 0, GREEN, 46); g.restore(); }
  flash(g, T, SHUT, 1);
  if (T > 14.6) { g.fillStyle = `rgba(0,0,0,${0.5 * ramp(T, 14.6, 2)})`; g.fillRect(0, 0, W, H); }
};

/* ---------------------------------------------------------------- 2 · title (16.6 – 20.7) */
const motif = (g: G, x: number, y: number, s: number, a: number) => { // a gold hand mirror
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.ellipse(0, -30, 46, 58, 0, 0, 7); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.ellipse(0, -30, 38, 50, 0, 0, 7); g.stroke(); g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 28); g.lineTo(0, 92); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(-18, -54); g.lineTo(6, -72); g.stroke(); g.restore(); };
const titleCard = (g: G, T: number) => {
  const k = T - TITLE; g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H);
  const gl = g.createRadialGradient(960, 470, 20, 960, 470, 700); gl.addColorStop(0, `rgba(241,197,109,${0.16 * ramp(k, 0, 0.3)})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
  txt(g, '心理学 · 曝光效应 · 1977', 960, 300, 30, 'rgba(243,237,226,.7)', { w: 600, ls: 6, alpha: ramp(k, 0.15, 0.4) });
  const s = 1 + 0.25 * (1 - back(ramp(k, 0, 0.35))); g.save(); g.translate(960, 430); g.scale(s, s); g.font = `700 120px ${SERIF}`; g.textAlign = 'center'; const gr = g.createLinearGradient(0, -100, 0, 20); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#b8862e');
  g.globalAlpha = ramp(k, 0, 0.12); g.shadowColor = 'rgba(241,197,109,.45)'; g.shadowBlur = 30; g.fillStyle = gr; g.fillText('《哪个才是真的你》', 0, 0); g.restore();
  motif(g, 960, 560, 0.9, ramp(k, 0.3, 0.5));
  txt(g, '原相机和镜子，到底谁在骗你？', 960, 720, 44, INK, { w: 700, alpha: ramp(k, 0.5, 0.4) });
  txt(g, 'Which one is the real you?', 960, 772, 26, 'rgba(243,237,226,.55)', { w: 500, f: SERIF, alpha: ramp(k, 0.6, 0.4) });
  txt(g, '— VIBE知识大赏 —', 960, 850, 26, 'rgba(243,237,226,.5)', { w: 500, alpha: ramp(k, 0.7, 0.4) });
  if (k > 3.6) { g.fillStyle = `rgba(0,0,0,${ramp(k, 3.6, 0.45)})`; g.fillRect(0, 0, W, H); }
};

/* ---------------------------------------------------------------- 3 · 1977 (20.7 – 49.2) */
const darkroom = (g: G, T: number) => {
  const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#2a1612'); b.addColorStop(1, '#0d0806'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  const l = g.createRadialGradient(960, 120, 30, 960, 400, 1000); l.addColorStop(0, 'rgba(255,90,60,.30)'); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
  rr(g, 900, 110, 120, 34, 8); g.fillStyle = '#ff5a3c'; g.shadowColor = '#ff5a3c'; g.shadowBlur = 40; g.fill(); g.shadowBlur = 0;
  g.fillStyle = '#1c120e'; g.fillRect(0, 880, W, 200); g.fillStyle = 'rgba(255,120,80,.08)'; g.fillRect(0, 880, W, 3);
  for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,200,160,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 170 + i * 14); g.lineTo(W, 170 + i * 14); g.stroke(); }
};
const print = (g: G, x: number, y: number, w: number, rot: number, sx: number, f: Face, glowCol?: string, glowA = 0) => {
  const h = w * 1.25; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, 1);
  if (glowA > 0) { g.shadowColor = glowCol!; g.shadowBlur = 60 * glowA; }
  else { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12; }
  g.fillStyle = Math.abs(sx) < 0.05 ? '#d8d0c4' : '#f2ede4'; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.save(); g.beginPath(); g.rect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 70); g.clip(); g.translate(-w / 2 + 20, -h / 2 + 20); (g as any).filter = 'sepia(0.55) contrast(1.05)'; portraitBg(g, w - 40, h - 70); girl(g, (w - 40) / 2, (h - 70) * 0.5, (w - 40) / 340, f); (g as any).filter = 'none'; g.restore();
  if (glowA > 0) { g.strokeStyle = glowCol!; g.lineWidth = 6; g.globalAlpha = glowA; g.strokeRect(-w / 2, -h / 2, w, h); }
  g.restore();
};
const lab = (g: G, T: number) => {
  darkroom(g, T);
  // 20.8 – 27.4 the shoot: her portrait in an old frame, a flashbulb at 24.6
  if (T < 27.6) {
    const a = ramp(T, OPEN + 0.1, 0.5); g.save(); g.globalAlpha = a;
    txt(g, '1977', 960, 330, 150, 'rgba(241,197,109,.9)', { f: SERIF, w: 700, alpha: 1 - ramp(T, 23.8, 0.6) });
    const s = ramp(T, 24.2, 0.5); if (s > 0) { g.globalAlpha = s; g.save(); rr(g, 760, 260, 400, 520, 18); g.clip(); (g as any).filter = 'sepia(0.6)'; portraitBg(g, W, H); g.translate(760, 260); portraitBg(g, 400, 520); girl(g, 200, 290 + breath(T) * 500, 1.15, { blink: blink(T), smile: 0.3 }); (g as any).filter = 'none'; g.restore();
      rr(g, 760, 260, 400, 520, 18); g.strokeStyle = 'rgba(255,220,180,.5)'; g.lineWidth = 3; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.7)'; rr(g, 790, 290, 60, 34, 6); g.fill(); g.fillStyle = '#ff3a2a'; g.beginPath(); g.arc(820, 307, 8, 0, 7); g.fill(); }
    g.restore(); flash(g, T, 24.65, 0.95); return;
  }
  // 27.6 – 49 two prints
  const inL = eo(ramp(T, 27.6, 0.6)), inR = eo(ramp(T, 27.85, 0.6));
  const flipK = eio(ramp(T, 30.6, 0.7)), sxR = Math.cos(Math.PI * flipK);
  const herA = ramp(T, 36.9, 0.4), friendA = ramp(T, 42.1, 0.4), cross = ramp(T, 44.7, 0.6);
  g.save(); zoom(g, 960, 540, 1 + 0.035 * ramp(T, 27.6, 21));
  print(g, lerp(-300, 680, inL), 520, 380, -0.04, 1, { blink: 0, smile: 0.3 }, BLUE, friendA);
  print(g, lerp(2220, 1240, inR), 520, 380, 0.04, sxR, { flip: flipK > 0.5, smile: 0.3 }, GOLD, herA);
  g.restore();
  if (T > 28.4) { txt(g, '正片', 680, 830, 40, INK, { alpha: ramp(T, 28.4, 0.3) }); txt(g, flipK > 0.5 ? '左右翻转' : '正片', 1240, 830, 40, flipK > 0.5 ? GOLD : INK, { alpha: ramp(T, 28.6, 0.3) }); }
  if (T > 31.3 && T < 36.6) { const a = ramp(T, 31.3, 0.3) * (1 - ramp(T, 36.3, 0.3)); arrow(g, 1080, 210, 1400, 210, `rgba(241,197,109,${a})`, 4); arrow(g, 1400, 230, 1080, 230, `rgba(241,197,109,${a})`, 4); }
  if (T > 33.9 && T < 36.8) { const k = (T - 33.9) / 1.4; const sx = k % 1 < 0.5 ? 680 : 1240; const l = g.createRadialGradient(sx, 520, 30, sx, 520, 380); l.addColorStop(0, 'rgba(255,230,190,.16)'); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H); }
  if (herA > 0) { g.save(); g.translate(1240, 905); const s = pop(T, 36.9); g.scale(s, s); tag(g, '她自己选这张', 0, 0, GOLD, 42); g.restore(); }
  // the friend: a small portrait card enters from the left
  const fa = ramp(T, 39.5, 0.5); if (fa > 0) { g.save(); g.globalAlpha = fa; const fx = lerp(120, 250, eo(fa)); g.save(); g.beginPath(); g.arc(fx, 300, 105, 0, 7); g.clip(); portraitBg(g, W, H); girl(g, fx, 330, 0.6, { hair: 'short', top: '#7a4a5a', blink: blink(T + 1.1), smile: 0.5 }); g.restore();
    g.strokeStyle = BLUE; g.lineWidth = 4; g.beginPath(); g.arc(fx, 300, 105, 0, 7); g.stroke(); txt(g, '她最好的朋友', fx, 450, 36, BLUE, { w: 800 }); g.restore(); }
  if (friendA > 0) { g.save(); g.translate(680, 905); const s = pop(T, 42.1); g.scale(s, s); tag(g, '朋友选这张', 0, 0, BLUE, 42); g.restore(); }
  if (cross > 0) { g.save(); g.globalAlpha = cross; txt(g, '同一张脸', 960, 210, 54, INK, { f: SERIF, w: 700 }); g.restore(); }
};

/* ---------------------------------------------------------------- 4 · the mirror (49.2 – 65.4), quiet */
const mirrorScene = (g: G, T: number) => {
  const lit = T < BREAK + 0.25 ? 0.15 : 1; bathroom(g, lit); counter(g, 960);
  const flipK = eio(ramp(T, 60.1, 0.7)), sx = Math.cos(Math.PI * flipK);
  g.save(); zoom(g, 960, 600, 1 + 0.04 * ramp(T, BREAK, 16));
  mirror(g, 610, 280, 700, 650, (c) => {
    // echoes: the same reflection seen a thousand times
    const ea = ramp(T, 52.3, 0.8) * (1 - ramp(T, 55.6, 0.6)); if (ea > 0) for (let i = 4; i >= 1; i--) { c.save(); c.globalAlpha = ea * 0.09; girl(c, 960 + (i % 2 ? 1 : -1) * i * 60, 650 - i * 12, 1.5 - i * 0.08, { flip: true, smile: 0.3 }); c.restore(); }
    flipX(c, 960, 0, sx, () => girl(c, 960, 650 + breath(T) * 400, 1.5, { flip: true, blink: blink(T), smile: 0.25 }));
  }, lit > 0.5 && T < 62.6);
  g.restore();
  if (T > 52.4 && T < 56.0) { const a = ramp(T, 52.4, 0.5) * (1 - ramp(T, 55.6, 0.4)); const times = ['07:12', '12:40', '18:05', '23:47']; times.forEach((s, i) => txt(g, s, 330 + (i % 2) * 1260, 320 + i * 120, 34, 'rgba(243,237,226,.55)', { w: 500, alpha: a * ramp(T, 52.4 + i * 0.5, 0.3) })); }
  // callouts track the features through the flip
  const z = 1 + 0.04 * ramp(T, BREAK, 16), Z = (x: number, y: number) => [960 + (x - 960) * z, 600 + (y - 600) * z];
  const fx = (lx: number) => 960 + (-lx) * 1.5 * sx; // flipped girl: world x = 960 - lx*1.5 (then flip anim)
  const feats: [string, number, number, number, number][] = [['分缝', 56.5, -34, -150, 0], ['痣', 57.4, 56, 60, 1], ['高一点的眉毛', 58.3, -44, -72, 2]];
  if (T > 56.3) for (const [name, t0, lx, ly] of feats) { const a = ramp(T, t0, 0.3) * (1 - ramp(T, 65.0, 0.3)); if (a <= 0) continue; const [px, py] = Z(fx(lx), 650 + ly * 1.5); const side = px < 960 ? -1 : 1; const tx = 960 + side * 640, ty = py;
    g.save(); g.globalAlpha = a; arrow(g, tx - side * 120, ty, px - side * 8, py, GOLD, 3); tag(g, name, tx, ty + 14, INK, 38); g.restore(); }
  if (T > 63.0) { const s = pop(T, 63.0); g.save(); g.translate(960, 175); g.scale(s, s); txt(g, '曝光效应', 0, 0, 60, GOLD, { f: SERIF, w: 700, glow: 'rgba(0,0,0,.9)' }); g.restore(); txt(g, '看得越多，越觉得顺眼', 960, 910, 32, 'rgba(243,237,226,.7)', { w: 600, alpha: ramp(T, 63.4, 0.4) }); }
  fadeIn(g, T, BREAK, 0.35);
};

/* ---------------------------------------------------------------- 5 · build (65.4 – 82.2): preview is mirrored, then distance */
const previewScene = (g: G, T: number) => {
  bathroom(g); counter(g, 950);
  mirror(g, 1060, 300, 380, 520, (c) => girl(c, 1250, 600 + breath(T) * 300, 1.0, { flip: true, blink: blink(T), smile: 0.3 }));
  const shotK = eio(ramp(T, 69.4, 0.6)), sx = Math.cos(Math.PI * shotK);
  phone(g, 640, 560, 250, (c, sw, sh) => { portraitBg(c, sw, sh); flipX(c, sw / 2, 0, sx, () => girl(c, sw / 2, sh * 0.42, sw / 300, { flip: shotK < 0.5, blink: blink(T + 0.2), smile: shotK < 0.5 ? 0.3 : 0 })); if (T < 69.2) camUI(c, sw, sh); });
  const eq = ramp(T, 66.4, 0.4) * (1 - ramp(T, 69.0, 0.2)); txt(g, '=', 905, 590, 110, INK, { alpha: eq, w: 300 });
  const ne = ramp(T, 69.9, 0.3); txt(g, '≠', 905, 590, 110, RED, { alpha: ne, w: 300 });
  tag(g, '预览 = 镜子', 640, 905, INK, 40); if (T > 69.9) tag(g, '存下来 = 翻回去', 640, 175, '#ff9a8a', 40);
  flash(g, T, 69.2, 0.9);
  if (T > 72.0) { const k = eio(ramp(T, 72.0, 2.2)); g.fillStyle = `rgba(0,0,0,${k * 0.6})`; g.fillRect(0, 0, W, H); txt(g, '½', 960, 600, 300, GOLD, { f: SERIF, w: 700, alpha: ramp(T, 72.1, 0.3) * (1 - ramp(T, 74.0, 0.3)) }); }
  fadeIn(g, T, BUILD, 0.3);
};
const topHead = (g: G, x: number, y: number, s: number, nose = 1) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#d79f80'; g.beginPath(); g.ellipse(0, 0, 70, 86, 0, 0, 7); g.fill(); for (const k of [-1, 1]) { g.beginPath(); g.ellipse(k * 72, 0, 11, 22, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2a1b15'; g.beginPath(); g.ellipse(0, -12, 74, 80, 0, Math.PI, 0); g.fill(); g.fillStyle = '#d79f80'; g.beginPath(); g.moveTo(-14 * nose, 80); g.lineTo(0, 110); g.lineTo(14 * nose, 80); g.fill(); g.restore(); };
const distScene = (g: G, T: number) => {
  g.fillStyle = '#101214'; g.fillRect(0, 0, W, H); const l = g.createRadialGradient(960, 300, 20, 960, 400, 900); l.addColorStop(0, 'rgba(255,214,160,.12)'); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const drop = T >= DROP; const shift = eio(ramp(T, 80.4, 0.8)); // diagram moves up/left for the comparison
  const hx = lerp(960, 560, shift), hy = lerp(250, 230, shift), hs = lerp(1.25, 0.9, shift);
  // the phone travels from 1.5 m (off frame) to 30 cm
  const d = lerp(560, 130, eio(ramp(T, 74.6, 2.0))) * hs; const cy = hy + 110 * hs + d;
  topHead(g, hx, hy, hs);
  g.fillStyle = '#e6e6e6'; rr(g, hx - 30 * hs, cy, 60 * hs, 18 * hs, 5); g.fill();
  const cm = Math.round(lerp(150, 30, eio(ramp(T, 74.6, 2.0)))); txt(g, `${cm} 厘米`, hx + 150 * hs, cy + 14, 44 * Math.max(0.8, hs), cm <= 30 ? '#ff8a7a' : INK, { a: 'left', alpha: 1 - shift });
  const ra = ramp(T, 77.6, 0.4); if (ra > 0) { g.save(); g.globalAlpha = ra; g.setLineDash([10, 10]); g.lineWidth = 3;
    g.strokeStyle = '#ff8a7a'; g.beginPath(); g.moveTo(hx, cy); g.lineTo(hx, hy + 110 * hs); g.stroke(); g.strokeStyle = BLUE; for (const k of [-1, 1]) { g.beginPath(); g.moveTo(hx, cy); g.lineTo(hx + k * 72 * hs, hy); g.stroke(); } g.setLineDash([]);
    txt(g, '近', hx - 46 * hs, hy + 150 * hs, 40, '#ff8a7a'); txt(g, '远', hx - 110 * hs, hy - 30 * hs, 40, BLUE); txt(g, '远', hx + 110 * hs, hy - 30 * hs, 40, BLUE); g.restore(); }
  // comparison portraits (from 80.4)
  if (shift > 0) { g.save(); g.globalAlpha = shift;
    const box = (x: number, wide: number, label: string, col: string) => { g.save(); rr(g, x - 190, 480, 380, 400, 22); g.clip(); g.translate(x - 190, 480); portraitBg(g, 380, 400); girl(g, 190, 230, 1.05, { wide, blink: blink(T + (wide ? 0 : 0.7)) }); g.restore(); rr(g, x - 190, 480, 380, 400, 22); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); txt(g, label, x, 455, 40, col); };
    box(560, drop ? 1 : 0.0001, '30 厘米', '#ff8a7a'); box(1360, 0, '1.5 米', BLUE); topHead(g, 1360, 230, 0.9); g.restore(); }
  if (drop) { const s = pop(T, DROP, 0.3); const sh = (1 - ramp(T, DROP, 0.35)) * 14; g.save(); g.translate(960 + Math.sin(T * 90) * sh, 690); g.scale(s, s); txt(g, '鼻子宽', 0, -60, 54, INK); txt(g, '三成', 0, 70, 150, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.5)' }); g.restore();
    const nx = 560, ny = 480 + 230 + 40; const a = (1 - ramp(T, DROP + 1.2, 0.6)); g.strokeStyle = `rgba(241,197,109,${a})`; g.lineWidth = 4; g.beginPath(); g.arc(nx, ny, 60 + 30 * ramp(T, DROP, 0.5), 0, 7); g.stroke(); flash(g, T, DROP, 0.6); }
  fadeIn(g, T, 74.4, 0.3);
};

/* ---------------------------------------------------------------- 6 · drop: the far portrait, then the moving face, the strip, 91% */
const farScene = (g: G, T: number) => { // 86.0 – 89.9: step back to 1.5 m, a good portrait
  bathroom(g, 0.9); const k = eio(ramp(T, 86.0, 2.6));
  g.save(); zoom(g, 960, 560, lerp(1.25, 1.0, k)); phone(g, 960, 560, 330, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.45, sw / 330 * lerp(1.15, 0.85, k), { wide: lerp(1, 0, k), blink: blink(T), smile: 0.4 }); camUI(c, sw, sh); }); g.restore();
  tag(g, `${lerp(30, 150, k).toFixed(0)} 厘米`, 960, 175, k > 0.95 ? BLUE : INK, 40);
  fadeIn(g, T, 86.0, 0.25);
};
const liveFace = (g: G, T: number, frozen: number | null) => { // the 'video': she talks, blinks, tilts
  const t = frozen ?? T; const fr: Face = { blink: frozen !== null ? 0.6 : blink(t), mouth: talk(t), smile: 0.35 + 0.25 * Math.sin(t * 0.9), tilt: 0.05 * Math.sin(t * 0.8), look: Math.sin(t * 0.6) };
  if (frozen !== null) { fr.mouth = 0.55; fr.smile = 0; fr.tilt = 0.06; }
  girl(g, 960, 560 + breath(t) * 600, 1.7, fr); };
const videoScene = (g: G, T: number) => { // 89.9 – 98.0
  g.fillStyle = '#0c0d0f'; g.fillRect(0, 0, W, H);
  if (T < 91.6) { txt(g, '也不是。', 960, 560, 90, INK, { f: SERIF, w: 700, alpha: ramp(T, P1 + 0.05, 0.2) }); return; }
  const freeze = T > 94.6; const pull = eio(ramp(T, 95.4, 1.6)); // the video shrinks into the film strip
  g.save(); rr(g, lerp(360, 760, pull), lerp(130, 330, pull), lerp(1200, 400, pull), lerp(760, 300, pull), 20); g.clip(); portraitBg(g, W, H); g.translate(0, 0);
  const s = lerp(1, 0.38, pull); g.translate(960, lerp(470, 470, pull)); g.scale(s, s); g.translate(-960, -470); liveFace(g, T, freeze ? 94.6 : null); g.restore();
  if (pull < 0.5) { const a = 1 - pull * 2; g.save(); g.globalAlpha = a; g.fillStyle = freeze ? '#888' : '#ff3a2a'; g.beginPath(); g.arc(420, 175, 12, 0, 7); g.fill(); txt(g, freeze ? '暂停' : 'REC', 445, 186, 30, INK, { a: 'left', w: 700 });
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(400, 860, 1120, 8); g.fillStyle = '#ff3a2a'; g.fillRect(400, 860, 1120 * clamp((T - 91.6) / 6), 8); g.restore(); }
  // strip of frames slides in around it
  if (pull > 0) { strip(g, T, pull, false); }
  fadeIn(g, T, 91.6, 0.2);
};
const FR: Face[] = [{ mouth: 0.7, smile: 0.2 }, { blink: 0.6, mouth: 0.4 }, { mouth: 0.15, look: 1, smile: 0.6 }, { mouth: 0.9 }, { smile: 0.5 }, { blink: 1, mouth: 0.3 }, { mouth: 0.5, look: -1 }, { blink: 0.3, mouth: 0.8, tilt: 0.06 }, { smile: 0.7 }, { mouth: 0.6, look: 1 }];
const strip = (g: G, T: number, a: number, mark: boolean) => {
  g.save(); g.globalAlpha = a; g.fillStyle = '#050505'; g.fillRect(0, 300, W, 360); for (let x = -60 + ((T * 40) % 60); x < W; x += 60) { g.fillStyle = '#2a2a2a'; rr(g, x, 312, 30, 20, 4); g.fill(); rr(g, x, 628, 30, 20, 4); g.fill(); }
  const off = (T * 40) % 275;
  for (let i = -1; i < 8; i++) { const x = 140 + i * 275 - off; const f = FR[(i + 10 + Math.floor(T * 40 / 275)) % FR.length]; g.save(); g.beginPath(); g.rect(x - 120, 345, 240, 270); g.clip(); g.translate(x - 120, 345); portraitBg(g, 240, 270); girl(g, 120, 160, 0.78, f); g.restore();
    if (mark) { const bad = (i + Math.floor(T * 40 / 275)) % 11 !== 4; if (bad) { g.fillStyle = `rgba(0,0,0,${0.45 * ramp(T, P2, 0.4)})`; g.fillRect(x - 120, 345, 240, 270); } else { g.strokeStyle = GOLD; g.lineWidth = 6; g.strokeRect(x - 120, 345, 240, 270); } } }
  g.restore(); };
const stripScene = (g: G, T: number) => { // 98.0 – 105.2: 91%, then zoom into a half blink
  g.fillStyle = '#0e0f11'; g.fillRect(0, 0, W, H);
  const zk = eio(ramp(T, 101.5, 1.4));
  if (zk < 1) { g.save(); g.globalAlpha = 1 - zk; strip(g, T, 1, true);
    const s = pop(T, P2, 0.3); g.save(); g.translate(740, 860); g.scale(s, s); txt(g, '91%', 0, 0, 150, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.4)' }); g.restore();
    txt(g, '的静帧，不如视频里好看', 1180, 845, 50, INK, { w: 700, alpha: ramp(T, P2 + 0.2, 0.3) }); txt(g, '2012 · 定格脸效应', 960, 225, 40, 'rgba(243,237,226,.7)', { w: 600, alpha: ramp(T, P2 + 0.3, 0.4) }); g.restore(); }
  if (zk > 0) { g.save(); g.globalAlpha = zk; rr(g, 560, 160, 800, 740, 24); g.clip(); portraitBg(g, W, H); g.translate(560, 160); portraitBg(g, 800, 740); girl(g, 400, 430, 2.0, { blink: 0.62, mouth: 0.55, tilt: 0.06, look: 1 }); g.restore();
    g.save(); g.globalAlpha = zk; rr(g, 560, 160, 800, 740, 24); g.strokeStyle = RED; g.lineWidth = 6; g.stroke();
    tag(g, '半眨眼', 470, 420, '#ff9a8a', 40); tag(g, '半句话', 1460, 640, '#ff9a8a', 40); g.restore(); }
};

/* ---------------------------------------------------------------- 7 · the beauty filter in your head (105.2 – 118.4) */
const beautyScene = (g: G, T: number) => {
  bathroom(g, 0.9); counter(g, 960);
  const split = eio(ramp(T, 108.2, 1.0));
  if (split < 1) { g.save(); g.globalAlpha = 1 - split; mirror(g, 660, 260, 600, 640, (c) => girl(c, 960, 620 + breath(T) * 400, 1.4, { flip: true, blink: blink(T), smile: 0.5 })); g.restore(); }
  if (split > 0) { const xs = [520, 960, 1400], label = ['真实', '美化 10%', '美化 20%'];
    const pick = ramp(T, 111.8, 0.4);
    xs.forEach((x, i) => { const yy = lerp(580, 470, split); g.save(); g.globalAlpha = split; rr(g, x - 170, yy - 210, 340, 420, 24); g.clip(); g.translate(x - 170, yy - 210); portraitBg(g, 340, 420); girl(g, 170, 230, 1.0, { flip: true, pretty: i * ramp(T, 108.8 + i * 0.5, 0.8), blink: blink(T + i * 0.37), smile: 0.4 }); g.restore();
      g.save(); g.globalAlpha = split; rr(g, x - 170, yy - 210, 340, 420, 24); g.strokeStyle = i === 1 && pick > 0 ? GOLD : 'rgba(255,255,255,.25)'; g.lineWidth = i === 1 && pick > 0 ? 4 + 4 * pick : 3; g.stroke(); txt(g, label[i], x, yy + 270, 44, i === 1 && pick > 0 ? GOLD : INK); g.restore(); });
    if (pick > 0) { const s = pop(T, 111.8); g.save(); g.translate(960, 870); g.scale(s, s); tag(g, '大多数人认成自己的，是这张', 0, 0, GOLD, 42); g.restore(); }
    txt(g, '2008', 960, 190, 52, 'rgba(241,197,109,.85)', { f: SERIF, w: 700, alpha: split * (1 - ramp(T, 115.0, 0.3)) }); }
  if (T > 115.2) { const s = pop(T, 115.2); g.save(); g.translate(960, 200); g.scale(s, s); txt(g, '脑内美颜', 0, 0, 72, GOLD, { f: SERIF, w: 700, glow: 'rgba(0,0,0,.9)' }); g.restore();
    for (let i = 0; i < 14; i++) { const a = ((T * 0.7 + i * 0.37) % 1); const x = 960 + Math.cos(i * 2.4) * (200 + i * 30), y = 470 + Math.sin(i * 1.7) * 260; g.fillStyle = `rgba(255,236,190,${0.6 * Math.sin(a * Math.PI)})`; g.beginPath(); g.arc(x, y, 3 + 3 * Math.sin(a * Math.PI), 0, 7); g.fill(); } }
  fadeIn(g, T, 105.2, 0.25);
};

/* ---------------------------------------------------------------- 8 · three tips (118.4 – 128.0) */
const tipsScene = (g: G, T: number) => {
  bathroom(g, 0.8);
  const card = (i: number, t0: number, title: string, draw: (x: number, y: number) => void) => { const k = eo(ramp(T, t0, 0.45)); if (k <= 0) return; const x = 330 + i * 630, y = 560;
    g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 60); rr(g, x - 270, y - 330, 540, 640, 30); g.fillStyle = 'rgba(14,16,18,.86)'; g.fill(); g.strokeStyle = 'rgba(241,197,109,.5)'; g.lineWidth = 2; g.stroke();
    txt(g, ['①', '②', '③'][i], x, y - 230, 64, GOLD, { f: SERIF }); draw(x, y - 20); txt(g, title, x, y + 250, 40, INK, { w: 800 }); g.restore(); };
  card(0, 118.5, '离远点，用 2 倍镜头', (x, y) => { phone(g, x + 90, y, 110, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.45, sw / 300, { smile: 0.4, blink: blink(T) }); }); txt(g, '2×', x - 90, y + 20, 80, GOLD, { f: SERIF, w: 700 }); });
  card(1, 121.6, '拍段视频，比摆拍更像你', (x, y) => { g.save(); rr(g, x - 160, y - 120, 320, 240, 18); g.clip(); g.translate(x - 160, y - 120); portraitBg(g, 320, 240); girl(g, 160, 150, 0.62, { mouth: talk(T), blink: blink(T + 0.5), smile: 0.4 }); g.restore(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(x - 24, y + 70); g.lineTo(x - 24, y + 110); g.lineTo(x + 12, y + 90); g.fill(); });
  card(2, 124.5, '打开「镜像前置镜头」', (x, y) => { rr(g, x - 200, y - 50, 400, 100, 20); g.fillStyle = '#23262b'; g.fill(); txt(g, '镜像前置镜头', x - 50, y + 12, 34, INK, { w: 700 }); const on = ramp(T, 125.6, 0.25); rr(g, x + 90, y - 26, 92, 52, 26); g.fillStyle = on > 0.5 ? '#4cd964' : '#555'; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 116 + 40 * on, y, 22, 0, 7); g.fill(); });
  fadeIn(g, T, 118.4, 0.25);
};

/* ---------------------------------------------------------------- 9 · callback (128.2 – 138.7) */
const callback = (g: G, T: number) => {
  bathroom(g); counter(g, 950);
  const live = eio(ramp(T, 134.4, 1.4));
  g.save(); g.globalAlpha = 1 - live;
  mirror(g, 300, 300, 380, 520, (c) => girl(c, 490, 600 + breath(T) * 300, 1.0, { flip: true, blink: blink(T), smile: 0.3 }));
  phone(g, 1480, 560, 250, (c, sw, sh) => { portraitBg(c, sw, sh); girl(c, sw / 2, sh * 0.42, sw / 300, { wide: 0.6, blink: blink(T + 0.3) }); });
  if (T > 128.4) tag(g, '反的你', 490, 905, GREEN, 40); if (T > 129.6) tag(g, '凑太近的你', 1480, 905, AMBER, 40);
  const pa = ramp(T, 131.9, 0.4); if (pa > 0) { g.save(); g.globalAlpha = pa * (1 - live); g.translate(960, 540); g.rotate(-0.04); g.fillStyle = '#f2ede4'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.fillRect(-170, -210, 340, 420); g.shadowBlur = 0; g.save(); g.beginPath(); g.rect(-150, -190, 300, 330); g.clip(); g.translate(-150, -190); portraitBg(g, 300, 330); girl(g, 150, 190, 0.9, { blink: 0.6, mouth: 0.55, tilt: 0.06 }); g.restore(); txt(g, '定格的你', 0, 190, 38, '#2a2016'); g.restore(); }
  g.restore();
  if (live > 0) { g.save(); g.globalAlpha = live; const l = g.createRadialGradient(960, 420, 40, 960, 500, 800); l.addColorStop(0, 'rgba(255,214,160,.28)'); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
    girl(g, 960, 520 + breath(T) * 500, 1.55, { blink: blink(T), mouth: T < 136.6 ? 0.2 * talk(T) : 0, smile: 0.4 + 0.3 * ramp(T, 135.6, 1), tilt: 0.04 * Math.sin(T * 0.7), look: 0.4 * Math.sin(T * 0.5) }); g.restore(); }
};

/* ---------------------------------------------------------------- end card (138.7 – 145) */
const endCard = (g: G, T: number) => {
  const k = ramp(T, END, 0.6); if (k <= 0) return;
  g.save(); g.fillStyle = `rgba(6,7,10,${0.9 * k})`; g.fillRect(0, 0, W, H); g.restore();
  const ring = eio(ramp(T, END + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(960, 200, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
  txt(g, 'J', 958, 224, 64, GOLD, { f: SERIF, alpha: k * ramp(T, END + 0.5, 0.4) }); txt(g, 'JUNO', 960, 276, 20, 'rgba(243,237,226,.7)', { w: 500, alpha: k * ramp(T, END + 0.6, 0.4) });
  const ta = k * ramp(T, END + 0.4, 0.5); const gr = g.createLinearGradient(0, 330, 0, 410); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a');
  g.save(); g.globalAlpha = ta; g.font = `700 72px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.4)'; g.shadowBlur = 20; g.fillText('《哪个才是真的你》', 960, 390); g.restore();
  motif(g, 960, 470, 0.55, ta);
  txt(g, '你更信原相机，还是镜子？评论区见', 960, 610, 46, INK, { w: 700, alpha: k * ramp(T, END + 0.9, 0.5) });
  const pa = k * ramp(T, END + 1.3, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(960 - 260, 680, 520, 74, 37); g.stroke(); g.restore(); txt(g, '关注 Juno · 一起看懂世界', 960, 730, 34, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：Mita, Dermer & Knight 1977 · Paskhover et al. 2018 (JAMA Facial Plast Surg) · Post et al. 2012 · Epley & Whitchurch 2008', 960, 850, 21, 'rgba(243,237,226,.45)', { w: 400, alpha: k * ramp(T, END + 1.6, 0.5) });
};

/* ---------------------------------------------------------------- frame */
const draw = (g: G, T: number) => {
  g.clearRect(0, 0, W, H);
  if (T < TITLE) hook(g, T);
  else if (T < OPEN) titleCard(g, T);
  else if (T < BREAK) lab(g, T);
  else if (T < BUILD) mirrorScene(g, T);
  else if (T < 74.4) previewScene(g, T);
  else if (T < 86.0) distScene(g, T);
  else if (T < P1) farScene(g, T);
  else if (T < P2) videoScene(g, T);
  else if (T < 105.2) stripScene(g, T);
  else if (T < 118.4) beautyScene(g, T);
  else if (T < 128.1) tipsScene(g, T);
  else callback(g, T);
  vignette(g, 0.5); grain(g, Math.floor(T * 12), 0.05);
  endCard(g, T);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR); g.fillRect(0, H - BAR, W, BAR);
  const titleUp = T >= TITLE - 0.1 && T < OPEN; const ma = titleUp ? 0 : 0.9 * (1 - ramp(T, END, 0.6)) * ramp(T, 0.3, 0.5);
  txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.55)', { w: 500, a: 'right', alpha: ma });
  for (const [a, b, s] of LINES) if (T >= a - 0.12 && T < b + 0.12) { subtitle(g, s, Math.min(ramp(T, a - 0.12, 0.12), 1 - ramp(T, b, 0.12))); break; }
  if (T > LEN - 1.2) { g.fillStyle = `rgba(0,0,0,${ramp(T, LEN - 1.2, 1.2)})`; g.fillRect(0, 0, W, H); }
};

const CHARS = LINES.map((l) => l[2]).join('') + '照片？哪个更丑A原相机B镜子心理学曝光效应1977《哪个才是真的你》原相机和镜子，到底谁在骗你Whichoneistherealyou—VIBE知识大赏正片左右翻转她自己选这张最好的朋友同一张脸07:1212:4018:0523:47分缝痣高一点的眉毛看得越多越觉顺眼预览=镜子≠存下来翻回去½厘米近远鼻子宽三成1.5米也不是暂停REC91%的静帧不如视频里好看2012定格脸效应半眨眼半句话真实美化10%20%大多数人认成自己是这张2008脑内美颜①②③离远点用2倍镜头×拍段视频比摆拍更像你打开「镜像前置镜头」反凑太近JUNO你更信还评论区见关注Juno·一起看懂世界资料：Mita,Dermer&Knight·Paskhoveretal.(JAMAFacialPlastSurg)PostEpleyWhitchurch';
export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + CHARS; Promise.all([300, 400, 500, 600, 700, 800, 900].flatMap((w) => [`${w} 60px ${SANS}`, `${w} 60px ${SERIF}`]).map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (ok && ref.current) draw(ref.current.getContext('2d')!, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}>
    {ok && <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />}
  </AbsoluteFill>;
};

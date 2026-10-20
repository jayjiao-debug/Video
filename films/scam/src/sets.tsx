/* 《最后一步》 sets: a living room, the phone close-up, the case file. All drawn in code; every UI is generic (no real app or bank). */
import { G, W, H, rnd, setSeed, glow, rr, mono, txt, GOLD, INK, RED, SERIF, SANS, clamp, lerp } from './lib';

/* ================================================================ the phone */
export type Screen = (g: G, w: number, h: number) => void;
export const phone = (g: G, cx: number, cy: number, sc: number, screen: Screen, o: { tilt?: number; buzz?: number; off?: number } = {}) => {
  const w = 500, h = 1040; g.save(); g.translate(cx + (o.buzz ? Math.sin(o.buzz * 90) * 4 : 0), cy); g.rotate(o.tilt ?? 0); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 60; g.shadowOffsetY = 30; g.fillStyle = '#16171b'; rr(g, -w / 2, -h / 2, w, h, 70); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = '#3a3c44'; g.lineWidth = 4; rr(g, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 68); g.stroke();
  g.save(); rr(g, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 52); g.clip(); g.translate(-w / 2 + 20, -h / 2 + 20); screen(g, w - 40, h - 40);
  if (o.off) { g.fillStyle = `rgba(0,0,0,${o.off})`; g.fillRect(0, 0, w, h); } g.restore();
  g.fillStyle = '#0b0b0d'; rr(g, -60, -h / 2 + 34, 120, 32, 16); g.fill();
  g.restore();
};
/* incoming call */
export const callScreen = (k = 0): Screen => (g, w, h) => {
  const b = g.createLinearGradient(0, 0, 0, h); b.addColorStop(0, '#1f2a3a'); b.addColorStop(1, '#0c1018'); g.fillStyle = b; g.fillRect(0, 0, w, h);
  txt(g, '来电', w / 2, 120, 30, 'rgba(255,255,255,.6)', { w: 500 });
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(w / 2, 300, 90 + 10 * Math.sin(k * 6), 0, 7); g.fill(); g.fillStyle = '#5a6578'; g.beginPath(); g.arc(w / 2, 300, 80, 0, 7); g.fill();
  /* a headset glyph instead of a face */
  g.strokeStyle = '#dfe6f1'; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, 304, 38, Math.PI, 0); g.stroke(); g.fillStyle = '#dfe6f1'; rr(g, w / 2 - 48, 296, 18, 34, 6); g.fill(); rr(g, w / 2 + 30, 296, 18, 34, 6); g.fill();
  txt(g, '“平台客服”', w / 2, 470, 52, '#fff', { w: 700 }); txt(g, '未知号码', w / 2, 530, 30, 'rgba(255,255,255,.55)', { w: 500 });
  const by = h - 170; g.fillStyle = '#e5453a'; g.beginPath(); g.arc(w / 2 - 120, by, 56, 0, 7); g.fill(); g.fillStyle = '#34c759'; g.beginPath(); g.arc(w / 2 + 120, by, 56, 0, 7); g.fill();
  txt(g, '挂断', w / 2 - 120, by + 100, 28, 'rgba(255,255,255,.75)', { w: 500 }); txt(g, '接听', w / 2 + 120, by + 100, 28, 'rgba(255,255,255,.75)', { w: 500 });
  g.save(); g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.translate(w / 2 - 120, by); g.rotate(2.3); g.beginPath(); g.arc(0, 0, 22, -0.9, 0.9); g.stroke(); g.restore();
  g.save(); g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.translate(w / 2 + 120, by); g.rotate(0.8); g.beginPath(); g.arc(0, 0, 22, -0.9, 0.9); g.stroke(); g.restore();
};
/* the permission prompt */
export const shareAsk = (pick = 0): Screen => (g, w, h) => {
  g.fillStyle = '#e9ecf1'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; rr(g, 40, h / 2 - 190, w - 80, 380, 28); g.fill();
  txt(g, '开始共享屏幕？', w / 2, h / 2 - 100, 40, '#111', { w: 700 });
  txt(g, '对方将能看到你屏幕上的', w / 2, h / 2 - 40, 26, '#555', { w: 500 }); txt(g, '所有内容，包括密码和验证码', w / 2, h / 2, 26, '#555', { w: 500 });
  g.fillStyle = '#eceef2'; rr(g, 70, h / 2 + 60, (w - 160) / 2, 80, 16); g.fill(); g.fillStyle = pick > 0 ? '#1f6feb' : '#3b82f6'; rr(g, w / 2 + 10, h / 2 + 60, (w - 160) / 2, 80, 16); g.fill();
  txt(g, '拒绝', 70 + (w - 160) / 4, h / 2 + 112, 32, '#333', { w: 700 }); txt(g, '允许', w / 2 + 10 + (w - 160) / 4, h / 2 + 112, 32, '#fff', { w: 700 });
};
/* a transfer page being filled in by someone else: the remote cursor and the code typing itself */
export const transfer = (typed: number, cur: { x: number; y: number }, amount = '50,000'): Screen => (g, w, h) => {
  g.fillStyle = '#f3f4f7'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d93a2f'; g.fillRect(0, 0, w, 116); g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2 - 98, 92, 9, 0, 7); g.fill(); txt(g, '正在共享屏幕', w / 2 + 12, 102, 28, '#fff', { w: 700 });
  txt(g, '转账', w / 2, 170, 36, '#111', { w: 700 });
  g.fillStyle = '#fff'; rr(g, 30, 200, w - 60, 200, 18); g.fill(); txt(g, '转账金额', 60, 250, 26, '#777', { w: 500, a: 'left' }); mono(g, `¥ ${amount}`, 60, 345, 62, '#111', { a: 'left', w: 700 });
  g.fillStyle = '#fff'; rr(g, 30, 430, w - 60, 200, 18); g.fill(); txt(g, '短信验证码', 60, 480, 26, '#777', { w: 500, a: 'left' });
  const code = '482913'; for (let i = 0; i < 6; i++) { const x = 60 + i * 64; g.strokeStyle = i === typed ? '#3b82f6' : '#ccd0d8'; g.lineWidth = 3; rr(g, x, 510, 52, 76, 10); g.stroke(); if (i < typed) mono(g, code[i], x + 26, 566, 40, '#111'); }
  g.fillStyle = '#3b82f6'; rr(g, 30, h - 200, w - 60, 96, 18); g.fill(); txt(g, '确认转账', w / 2, h - 138, 36, '#fff', { w: 700 });
  /* the cursor that is not yours */
  g.save(); g.translate(cur.x, cur.y); g.fillStyle = '#111'; g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.lineTo(12, 35); g.lineTo(22, 56); g.lineTo(30, 52); g.lineTo(20, 32); g.lineTo(36, 32); g.closePath(); g.fill(); g.stroke(); g.restore();
};

/* ================================================================ A · the living room at dusk */
export type Room = { lamp: number; ring: number; t: number; dusk: number; tv?: number };
export const livingRoom = (g: G, s: Room) => {
  /* wall */
  const wall = g.createLinearGradient(0, 0, 0, 700); wall.addColorStop(0, '#2e2620'); wall.addColorStop(1, '#4a3a2c'); g.fillStyle = wall; g.fillRect(0, 0, W, 720);
  setSeed(3); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,230,190,${rnd() * 0.025})`; g.fillRect(rnd() * W, rnd() * 700, 40 + rnd() * 120, 2); }
  /* window: dusk outside */
  const wx = 150, wy = 120, ww = 520, wh = 430; const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, lerp(0, 1, s.dusk) > 0.5 ? '#1b2747' : '#2a3b66'); sky.addColorStop(1, '#c9805a'); g.fillStyle = sky; g.fillRect(wx, wy, ww, wh);
  g.fillStyle = '#1a1d28'; for (let i = 0; i < 9; i++) { setSeed(20 + i); const bh = 60 + rnd() * 140; g.fillRect(wx + i * 60, wy + wh - bh, 52, bh); for (let k = 0; k < 6; k++) if (rnd() < 0.5) { g.fillStyle = 'rgba(255,200,120,.7)'; g.fillRect(wx + i * 60 + 8 + (k % 3) * 14, wy + wh - bh + 12 + Math.floor(k / 3) * 22, 8, 10); g.fillStyle = '#1a1d28'; } }
  g.strokeStyle = '#5a4634'; g.lineWidth = 18; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 10; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.45); g.lineTo(wx + ww, wy + wh * 0.45); g.stroke();
  g.fillStyle = '#6b4e3a'; g.fillRect(wx - 30, wy + wh, ww + 60, 22);
  /* curtains */
  g.fillStyle = '#7a3b2e'; g.beginPath(); g.moveTo(wx - 70, wy - 40); g.bezierCurveTo(wx - 10, wy + 200, wx - 60, wy + 420, wx - 20, wy + wh + 120); g.lineTo(wx - 90, wy + wh + 120); g.lineTo(wx - 90, wy - 40); g.fill();
  g.beginPath(); g.moveTo(wx + ww + 70, wy - 40); g.bezierCurveTo(wx + ww + 10, wy + 200, wx + ww + 60, wy + 420, wx + ww + 20, wy + wh + 120); g.lineTo(wx + ww + 90, wy + wh + 120); g.lineTo(wx + ww + 90, wy - 40); g.fill();
  /* family photos on the wall */
  [[880, 200, 150, 110], [1060, 180, 110, 140], [1200, 210, 130, 100]].forEach(([x, y, w, h]) => { g.fillStyle = '#6b5236'; g.fillRect(x - 8, y - 8, w + 16, h + 16); g.fillStyle = '#c8b089'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(80,60,40,.45)'; g.beginPath(); g.arc(x + w * 0.38, y + h * 0.42, h * 0.16, 0, 7); g.arc(x + w * 0.64, y + h * 0.46, h * 0.14, 0, 7); g.fill(); g.fillRect(x + w * 0.22, y + h * 0.62, w * 0.56, h * 0.38); });
  /* floor */
  const fl = g.createLinearGradient(0, 720, 0, H); fl.addColorStop(0, '#3a2a1e'); fl.addColorStop(1, '#22180f'); g.fillStyle = fl; g.fillRect(0, 720, W, H - 720);
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 12; i++) g.fillRect(0, 740 + i * 30 + i * i * 1.2, W, 2);
  /* armchair (right), with a knitted blanket */
  g.fillStyle = '#5c3d2b'; rr(g, 1380, 430, 420, 330, 40); g.fill(); g.fillStyle = '#6e4a34'; rr(g, 1340, 560, 90, 260, 30); g.fill(); rr(g, 1750, 560, 90, 260, 30); g.fill(); g.fillStyle = '#7c5640'; rr(g, 1420, 640, 340, 130, 26); g.fill();
  /* a knitted throw over the chair's back and seat */
  g.save(); g.beginPath(); g.moveTo(1450, 440); g.bezierCurveTo(1520, 420, 1620, 420, 1700, 445); g.lineTo(1712, 700); g.bezierCurveTo(1660, 730, 1560, 735, 1470, 712); g.closePath(); g.clip();
  for (let k = 0; k < 14; k++) { g.fillStyle = k % 2 ? '#a8463a' : '#c9a46c'; g.fillRect(1440 + k * 20, 400, 20, 360); }
  g.strokeStyle = 'rgba(60,30,20,.25)'; g.lineWidth = 2; for (let k = 0; k < 16; k++) { g.beginPath(); g.moveTo(1440, 450 + k * 18); g.lineTo(1720, 450 + k * 18); g.stroke(); } g.restore();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(1470, 712); g.bezierCurveTo(1560, 735, 1660, 730, 1712, 700); g.lineTo(1712, 712); g.bezierCurveTo(1660, 745, 1560, 748, 1470, 724); g.fill();
  g.fillStyle = '#3a271b'; g.fillRect(1370, 810, 26, 70); g.fillRect(1786, 810, 26, 70);
  /* floor lamp beside the chair */
  g.strokeStyle = '#2a2420'; g.lineWidth = 8; g.beginPath(); g.moveTo(1250, 900); g.lineTo(1250, 330); g.stroke(); g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(1250, 905, 60, 14, 0, 0, 7); g.fill();
  g.fillStyle = s.lamp > 0 ? '#f2d3a0' : '#8a7a62'; g.beginPath(); g.moveTo(1180, 330); g.lineTo(1320, 330); g.lineTo(1290, 240); g.lineTo(1210, 240); g.closePath(); g.fill();
  /* coffee table with glasses, tea, phone */
  g.fillStyle = '#4b3324'; rr(g, 520, 760, 820, 60, 12); g.fill(); g.fillStyle = '#3a271b'; g.fillRect(560, 820, 30, 140); g.fillRect(1270, 820, 30, 140); g.fillStyle = '#5c4030'; rr(g, 520, 752, 820, 18, 8); g.fill();
  /* tea cup, steam */
  g.fillStyle = '#e8e2d6'; rr(g, 640, 690, 70, 66, 10); g.fill(); g.strokeStyle = '#e8e2d6'; g.lineWidth = 6; g.beginPath(); g.arc(716, 720, 16, -1.2, 1.2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 4; for (let k = 0; k < 3; k++) { g.beginPath(); const sx = 656 + k * 18; g.moveTo(sx, 680); g.bezierCurveTo(sx - 14, 650 - (s.t * 30) % 20, sx + 14, 620, sx, 590); g.stroke(); }
  /* reading glasses */
  g.strokeStyle = '#2b2b2b'; g.lineWidth = 4; g.beginPath(); g.ellipse(1150, 742, 26, 14, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(1212, 742, 26, 14, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(1176, 740); g.lineTo(1186, 740); g.stroke();
  /* the phone on the table, ringing */
  const bz = s.ring > 0 ? Math.sin(s.t * 70) * 3 * s.ring : 0;
  g.save(); g.translate(930 + bz, 742); g.fillStyle = '#16171b'; g.beginPath(); g.moveTo(-80, 6); g.lineTo(80, 6); g.lineTo(64, -16); g.lineTo(-64, -16); g.closePath(); g.fill();
  if (s.ring > 0) { g.fillStyle = `rgba(150,200,255,${0.75 * s.ring})`; g.beginPath(); g.moveTo(-74, 3); g.lineTo(74, 3); g.lineTo(60, -13); g.lineTo(-60, -13); g.closePath(); g.fill(); }
  g.restore();
  /* LIGHT: dusk dims the room; the lamp gives a warm pool; the phone throws cold light up the wall */
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${lerp(225, 150, s.dusk)},${lerp(215, 140, s.dusk)},${lerp(210, 160, s.dusk)})`; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'screen';
  if (s.lamp > 0) { glow(g, 1250, 300, 820, '255,180,100', 0.38 * s.lamp); glow(g, 1250, 290, 140, '255,230,180', 0.8 * s.lamp); }
  glow(g, 410, 340, 520, '210,140,110', 0.18);
  if (s.ring > 0) { const p = 0.7 + 0.3 * Math.sin(s.t * 12); glow(g, 930, 720, 380, '120,170,255', 0.42 * s.ring * p); }
  if (s.tv) glow(g, 0, 600, 600, '120,160,255', 0.2 * s.tv);
  g.restore();
};

/* ================================================================ C · the case file */
export const caseFile = (g: G, o: { stamp?: number } = {}) => {
  const d = g.createLinearGradient(0, 0, W, H); d.addColorStop(0, '#2a1d14'); d.addColorStop(1, '#170f0a'); g.fillStyle = d; g.fillRect(0, 0, W, H);
  setSeed(8); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(0,0,0,${0.1 + rnd() * 0.15})`; g.lineWidth = 2; g.beginPath(); const y = rnd() * H; g.moveTo(0, y); g.bezierCurveTo(600, y + 20, 1300, y - 20, W, y + 10); g.stroke(); }
  /* folder */
  g.save(); g.translate(960, 560); g.rotate(-0.03);
  g.fillStyle = '#c9a66b'; rr(g, -720, -420, 1440, 840, 10); g.fill(); g.fillStyle = '#b8955b'; rr(g, -720, -470, 360, 70, 10); g.fill();
  g.fillStyle = '#efe7d6'; g.save(); g.rotate(0.02); rr(g, -640, -380, 760, 760, 4); g.fill(); g.restore();
  txt(g, '案 件 卷 宗', -260, -300, 44, '#2b2620', { f: SERIF, w: 700 });
  g.fillStyle = 'rgba(40,36,30,.5)'; for (let k = 0; k < 11; k++) { setSeed(60 + k); g.fillRect(-580, -220 + k * 46, 520 + rnd() * 120, 8); }
  /* evidence: a printed phone screenshot pinned */
  g.save(); g.translate(330, -40); g.rotate(0.06); g.fillStyle = '#fafafa'; g.fillRect(-170, -300, 340, 560); g.fillStyle = '#1f2a3a'; g.fillRect(-150, -280, 300, 480); txt(g, '“平台客服”', 0, -120, 34, '#fff', { w: 700 }); txt(g, '屏幕共享 · 已开启', 0, -60, 24, '#ff7a6e', { w: 700 }); g.fillStyle = '#d0d0d0'; g.beginPath(); g.arc(0, -330, 14, 0, 7); g.fill(); g.restore();
  /* the red stamp */
  const st = o.stamp ?? 1; if (st > 0) { g.save(); g.translate(-280, 260); g.rotate(-0.18); g.scale(1 + 0.4 * (1 - st), 1 + 0.4 * (1 - st)); g.globalAlpha = st; g.strokeStyle = '#c0281c'; g.lineWidth = 8; rr(g, -230, -60, 460, 120, 10); g.stroke(); txt(g, '电信网络诈骗', 0, 22, 62, '#c0281c', { f: SERIF, w: 700 }); g.restore(); }
  g.restore();
};
export { GOLD, INK, RED, SANS, clamp };

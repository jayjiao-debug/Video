/* 《对爸妈说“我爱你”，为什么这么难》 storyboard: a dark bedroom lit by a phone (cool) and memories of home (warm). All drawn in code. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';

export const W = 1920, H = 1080;
export type G = CanvasRenderingContext2D;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"';
export const GOLD = '#f1c56d', COOL = '#a9c8ff', WARM = '#ffb46a', INK = '#f3ede2';
type TO = { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number };
export const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: TO = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 26; } g.fillText(s, x, y); g.restore();
};
export const sub = (g: G, s: string) => { if (!s) return; g.save(); g.font = `900 70px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 64); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 64); g.restore(); };
export const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });
export const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.4, `rgba(${col},${a * 0.35})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
export const rrect = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

/* ---------------------------------------------------------------- sets */
/** the bedroom at night: window with moon, desk edge; `ph` = how bright the phone glow is */
export const room = (g: G, ph = 1, px = 960, py = 760) => {
  const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#070a14'); b.addColorStop(1, '#0c1220'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  // window
  g.fillStyle = '#0d1630'; rrect(g, 140, 110, 420, 520, 6); g.fill(); seed = 3; for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,214,150,${0.15 + rnd() * 0.35})`; g.fillRect(150 + rnd() * 400, 420 + rnd() * 200, 4, 6); }
  glow(g, 430, 220, 120, '220,230,255', 0.35); g.fillStyle = '#e8eefc'; g.beginPath(); g.arc(430, 220, 30, 0, 7); g.fill(); g.fillStyle = '#0d1630'; g.beginPath(); g.arc(442, 212, 28, 0, 7); g.fill();
  g.strokeStyle = '#1e2638'; g.lineWidth = 14; g.strokeRect(140, 110, 420, 520); g.beginPath(); g.moveTo(350, 110); g.lineTo(350, 630); g.moveTo(140, 370); g.lineTo(560, 370); g.stroke();
  g.fillStyle = 'rgba(120,150,220,.06)'; g.beginPath(); g.moveTo(560, 630); g.lineTo(980, 900); g.lineTo(700, 900); g.lineTo(140, 630); g.fill();
  // desk
  const d = g.createLinearGradient(0, 820, 0, H); d.addColorStop(0, '#1a1712'); d.addColorStop(1, '#0a0806'); g.fillStyle = d; g.fillRect(0, 820, W, 260);
  if (ph > 0) glow(g, px, py, 900, '150,185,255', 0.22 * ph);
};
/** the phone; content drawn in phone-local coordinates (screen 488 × 968 centred on 0,0) */
export const phone = (g: G, x: number, y: number, s: number, body: (g: G) => void, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); glow(g, 0, 0, 700, '150,185,255', 0.18);
  g.fillStyle = '#16181f'; rrect(g, -260, -500, 520, 1000, 70); g.fill(); g.fillStyle = '#0b0d14'; rrect(g, -244, -484, 488, 968, 58); g.fill();
  g.fillStyle = '#000'; rrect(g, -60, -470, 120, 32, 16); g.fill(); g.save(); rrect(g, -244, -484, 488, 968, 58); g.clip(); body(g); g.restore(); g.restore();
};
const bubble = (g: G, s: string, me: boolean, y: number, o: { col?: string; alpha?: number } = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `700 40px ${SANS}`; const w = g.measureText(s).width + 56;
  const x = me ? 220 - w : -220; g.fillStyle = o.col ?? (me ? '#5b7cff' : '#262a36'); rrect(g, x, y, w, 84, 32); g.fill(); txt(g, s, x + w / 2, y + 56, 40, '#fff', { w: 700 }); g.restore();
};
export const chat = (g: G, opt: { input?: string; caret?: boolean; sent?: string[]; reply?: string; typing?: boolean } = {}) => {
  g.fillStyle = '#10131c'; g.fillRect(-244, -484, 488, 968); g.fillStyle = '#161a26'; g.fillRect(-244, -484, 488, 130);
  txt(g, '妈妈', 0, -390, 36, INK, { w: 700 });
  let y = -300; bubble(g, '早点睡，别熬夜', false, y); y += 100; txt(g, '23:47', 0, y + 20, 22, 'rgba(255,255,255,.35)', { w: 500 }); y += 50;
  for (const s of opt.sent ?? []) { bubble(g, s, true, y); y += 100; }
  if (opt.reply) { bubble(g, opt.reply, false, y); y += 100; }
  if (opt.typing) { g.fillStyle = '#262a36'; rrect(g, -210, y, 120, 70, 30); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(-176 + i * 26, y + 35, 7, 0, 7); g.fill(); } }
  g.fillStyle = '#161a26'; g.fillRect(-244, 330, 488, 154); g.fillStyle = '#232838'; rrect(g, -210, 360, 330, 74, 37); g.fill();
  if (opt.input) txt(g, opt.input + (opt.caret ? '|' : ''), -186, 412, 40, '#fff', { w: 700, a: 'left' }); else if (opt.caret) txt(g, '|', -186, 410, 34, COOL, { w: 400, a: 'left' });
  g.fillStyle = opt.input ? '#5b7cff' : '#2c3242'; g.beginPath(); g.arc(170, 397, 37, 0, 7); g.fill(); txt(g, '发送', 170, 408, 24, '#fff', { w: 700 });
};
/** home memory: warm kitchen table under a pendant lamp */
export const kitchen = (g: G) => {
  const b = g.createLinearGradient(0, 0, 0, H); b.addColorStop(0, '#120c08'); b.addColorStop(1, '#1d140d'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2a1d14'; g.lineWidth = 3; g.beginPath(); g.moveTo(960, 0); g.lineTo(960, 170); g.stroke();
  g.fillStyle = '#3a2a1c'; g.beginPath(); g.moveTo(860, 230); g.lineTo(1060, 230); g.lineTo(1010, 170); g.lineTo(910, 170); g.fill();
  g.fillStyle = 'rgba(255,190,120,.10)'; g.beginPath(); g.moveTo(880, 230); g.lineTo(1040, 230); g.lineTo(1500, 760); g.lineTo(420, 760); g.fill(); glow(g, 960, 240, 260, '255,200,130', 0.55);
  g.fillStyle = '#4a3322'; g.beginPath(); g.ellipse(960, 760, 720, 120, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,190,120,.12)'; g.beginPath(); g.ellipse(960, 740, 560, 80, 0, 0, 7); g.fill();
};
export const fruitPlate = (g: G, x: number, y: number, s = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(6, 18, 210, 50, 0, 0, 7); g.fill();
  g.fillStyle = '#efe7da'; g.beginPath(); g.ellipse(0, 0, 210, 56, 0, 0, 7); g.fill(); g.fillStyle = '#dcd2c2'; g.beginPath(); g.ellipse(0, 0, 160, 38, 0, 0, 7); g.fill();
  for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3, cx = Math.cos(a) * 95 - 10, cy = -18 + Math.sin(i * 1.7) * 10; g.save(); g.translate(cx, cy); g.rotate(a * 0.5);
    g.fillStyle = '#fbf0d0'; g.beginPath(); g.ellipse(0, 0, 46, 20, 0, Math.PI, 0); g.fill(); g.strokeStyle = '#c0392b'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 46, 20, 0, Math.PI, 0); g.stroke(); g.restore(); }
  g.strokeStyle = '#c9a36a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-30, -40); g.lineTo(-20, -90); g.moveTo(40, -36); g.lineTo(56, -84); g.stroke();
  g.restore();
};
export const thermos = (g: G, x: number, y: number) => { const b = g.createLinearGradient(x - 40, 0, x + 40, 0); b.addColorStop(0, '#5b2d22'); b.addColorStop(0.6, '#b0503a'); b.addColorStop(1, '#4a241c'); g.fillStyle = b; rrect(g, x - 40, y - 230, 80, 230, 20); g.fill(); g.fillStyle = '#d8d2c8'; rrect(g, x - 44, y - 260, 88, 40, 10); g.fill(); };
export const envelope = (g: G, x: number, y: number, label: string, pct: string, col = WARM) => {
  g.save(); g.translate(x, y); g.fillStyle = '#e9dfcc'; rrect(g, -160, -100, 320, 200, 10); g.fill(); g.strokeStyle = '#b9a98c'; g.lineWidth = 3; g.beginPath(); g.moveTo(-160, -100); g.lineTo(0, 20); g.lineTo(160, -100); g.stroke();
  g.fillStyle = '#9b2d24'; g.beginPath(); g.arc(0, 20, 26, 0, 7); g.fill(); txt(g, label, 0, 80, 40, '#3b2a1e'); txt(g, pct, 0, 170, 56, col, { f: SERIF }); g.restore();
};
export const sweater = (g: G, x: number, y: number) => {
  g.fillStyle = '#6b6258'; g.beginPath(); g.arc(x, y, 14, Math.PI, 0); g.fill(); g.strokeStyle = '#8a8178'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40); g.moveTo(x - 110, y + 70); g.lineTo(x, y + 40); g.lineTo(x + 110, y + 70); g.stroke();
  const b = g.createLinearGradient(x - 130, 0, x + 130, 0); b.addColorStop(0, '#5a2a20'); b.addColorStop(0.5, '#8a4430'); b.addColorStop(1, '#4e241b'); g.fillStyle = b;
  g.beginPath(); g.moveTo(x - 40, y + 55); g.quadraticCurveTo(x, y + 85, x + 40, y + 55); g.lineTo(x + 120, y + 75); g.lineTo(x + 150, y + 400); g.lineTo(x + 105, y + 405); g.lineTo(x + 95, y + 200); g.lineTo(x + 100, y + 430); g.lineTo(x - 100, y + 430); g.lineTo(x - 95, y + 200); g.lineTo(x - 105, y + 405); g.lineTo(x - 150, y + 400); g.lineTo(x - 120, y + 75); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,220,180,.18)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(x - 90 + i * 22, y + 410); g.lineTo(x - 90 + i * 22, y + 430); g.stroke(); }
  for (let r = 0; r < 6; r++) { g.beginPath(); for (let i = 0; i <= 8; i++) { const xx = x - 80 + i * 20; g.lineTo(xx, y + 150 + r * 42 + (i % 2) * 10); } g.stroke(); }
};
const lights = (g: G, x0: number, y0: number, n: number, on: (i: number) => string | null, gap = 92, per = 5) => {
  for (let i = 0; i < n; i++) { const x = x0 + (i % per) * gap, y = y0 + Math.floor(i / per) * gap, c = on(i);
    if (c) glow(g, x, y, 70, c === GOLD ? '241,197,109' : '255,180,106', 0.45); g.fillStyle = c ?? 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); }
};
const quizCards = (g: G, hot?: string) => [['A', '很尴尬'], ['B', '很开心'], ['C', '没感觉']].forEach(([k, v], i) => { const y = 250 + i * 150, on = hot === k, dim = hot && !on;
  g.save(); g.fillStyle = 'rgba(16,19,30,.85)'; rrect(g, 700, y, 520, 116, 58); g.fill(); g.strokeStyle = on ? GOLD : 'rgba(169,200,255,.4)'; g.lineWidth = on ? 4 : 2; g.stroke(); g.restore(); if (on) glow(g, 960, y + 58, 420, '241,197,109', 0.25);
  g.fillStyle = on ? GOLD : dim ? 'rgba(169,200,255,.25)' : COOL; g.beginPath(); g.arc(762, y + 58, 38, 0, 7); g.fill(); txt(g, k, 762, y + 75, 44, '#0b0d14'); txt(g, v, 1000, y + 76, 46, on ? GOLD : dim ? 'rgba(243,237,226,.35)' : INK, { w: 700 }); });
const bars = (g: G, x: number, y: number, label: string, guess: number, real: number, col: string) => {
  txt(g, label, x, y - 30, 40, INK, { w: 700, a: 'left' });
  g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, x, y, 640, 56, 28); g.fill(); g.fillStyle = 'rgba(169,200,255,.55)'; rrect(g, x, y, 640 * guess, 56, 28); g.fill(); txt(g, '你以为', x + 660, y + 40, 30, COOL, { w: 700, a: 'left' });
  g.fillStyle = 'rgba(255,255,255,.08)'; rrect(g, x, y + 76, 640, 56, 28); g.fill(); g.fillStyle = col; rrect(g, x, y + 76, 640 * real, 56, 28); g.fill(); txt(g, '实际', x + 660, y + 116, 30, col, { w: 700, a: 'left' });
};
const titleCard = (g: G) => { room(g, 0.4); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); glow(g, W / 2, H / 2, 900, '241,197,109', 0.18);
  txt(g, '对爸妈说“我爱你”', W / 2, 470, 100, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)' }); txt(g, '为什么这么难', W / 2, 620, 110, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.6)' }); g.fillStyle = GOLD; g.fillRect(W / 2 - 260, 690, 520, 3); };

/* ---------------------------------------------------------------- storyboard */
const S = (line: string, draw: (g: G) => void) => (g: G) => { draw(g); mark(g); sub(g, line); };
type ChatOpt = { input?: string; caret?: boolean; sent?: string[]; reply?: string; typing?: boolean };
const P = (g: G, b: ChatOpt, x = 960, y = 470, s = 0.82) => { room(g, 1, x, y); phone(g, x, y, s, (g) => chat(g, b)); };
export const BOARD: { t: string; d: string; draw: (g: G) => void }[] = [
  { t: '01 · 0:00 深夜', d: '漆黑的卧室，窗外有月亮和远处楼里的灯。桌上的手机亮起，冷白光照亮半个房间。镜头缓慢推近。', draw: S('你上一次对爸妈说“我爱你”，是什么时候？', (g) => { room(g, 1, 1180, 800); phone(g, 1180, 760, 0.42, (g) => chat(g, {}), -1.35); }) },
  { t: '02 · 0:04 打字', d: '手机特写：和“妈妈”的对话框。输入框里一个字一个字打出“妈，我爱你”，光标在闪。', draw: S('对话框里打出：妈，我爱你', (g) => P(g, { input: '妈，我爱你', caret: true })) },
  { t: '03 · 0:07 删掉', d: '字一个个退格删掉，改成“妈，吃了吗”，点了发送。对面秒回“吃了，你呢”。', draw: S('删掉。改成：妈，吃了吗', (g) => P(g, { sent: ['妈，吃了吗'], reply: '吃了，你呢' })) },
  { t: '04 · 0:10 选择题', d: '手机退到一边变暗，三张卡片依次亮起：A 很尴尬 / B 很开心 / C 没感觉。', draw: S('猜猜：如果真说出口，爸妈会觉得？', (g) => { room(g, 0.5, 300, 760); quizCards(g); }) },
  { t: '05 · 0:14 标题（音乐重拍）', d: '画面压暗，金色两行标题落下，下面扫过一道金线。', draw: S('', titleCard) },
  { t: '06 · 0:18 安静的爱', d: '转场进“回忆”：画面变暖。墙上亮起 15 盏小灯，代表 15 个孩子，全部是暖色，旁边写“15/15：爸妈的爱是安静的”。', draw: S('一项研究访谈了15个华人孩子：爸妈的爱是“安静的”', (g) => { kitchen(g); lights(g, 560, 330, 15, () => WARM); txt(g, '15 / 15', 1340, 420, 110, WARM, { f: SERIF, glow: 'rgba(255,180,106,.5)' }); txt(g, '都说：爸妈的爱很“安静”', 1340, 500, 40, INK, { w: 700 }); }) },
  { t: '07 · 0:25 切好的水果', d: '餐桌吊灯下一盘切好的苹果，插着牙签。手机弹出一条通知：到账 ¥500。（生活例子，不是研究原话）', draw: S('是切好的水果，是多打的生活费', (g) => { kitchen(g); fruitPlate(g, 820, 700, 1.3); thermos(g, 1260, 760); g.save(); g.fillStyle = 'rgba(20,24,36,.92)'; rrect(g, 1240, 150, 520, 120, 26); g.fill(); g.restore(); txt(g, '到账 ¥500', 1500, 222, 44, INK, { w: 700 }); txt(g, '妈妈：别省着', 1500, 258, 24, 'rgba(243,237,226,.6)', { w: 500 }); }) },
  { t: '08 · 0:29 多穿点', d: '门口衣钩上挂着一件厚毛衣，门缝漏进楼道的光。一行小字浮起：“多穿点”。', draw: S('是你出门前那句“多穿点”', (g) => { kitchen(g); g.fillStyle = '#1a120c'; g.fillRect(1100, 120, 420, 700); g.fillStyle = 'rgba(255,200,130,.25)'; g.fillRect(1490, 120, 10, 700); sweater(g, 1300, 230); txt(g, '“多穿点”', 700, 480, 72, WARM, { f: SERIF, glow: 'rgba(255,180,106,.4)' }); }) },
  { t: '09 · 0:32 只有4个', d: '15 盏灯里只剩 4 盏变成金色：提到拥抱或“我爱你”的只有 4 个。', draw: S('提到拥抱和“我爱你”的，只有4个', (g) => { kitchen(g); lights(g, 560, 330, 15, (i) => ([1, 6, 8, 13].includes(i) ? GOLD : null)); txt(g, '4 / 15', 1340, 420, 110, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.5)' }); txt(g, '提到拥抱或“我爱你”', 1340, 500, 40, INK, { w: 700 }); }) },
  { t: '10 · 0:36 两边都安静', d: '画面一分为二：左边是爸妈的（水果、保温杯），右边是你的（奖状、给爸妈的红包、礼物盒）。中间一条虚线，没有一句话穿过去。', draw: S('听话、帮忙、争气：两边都在用行动说爱', (g) => { kitchen(g); fruitPlate(g, 520, 660, 0.9); thermos(g, 760, 720); g.setLineDash([12, 14]); g.strokeStyle = 'rgba(243,237,226,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(960, 160); g.lineTo(960, 820); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#c0392b'; rrect(g, 1120, 520, 150, 220, 10); g.fill(); txt(g, '福', 1195, 650, 70, GOLD, { f: SERIF }); g.fillStyle = '#e9dfcc'; rrect(g, 1320, 440, 260, 190, 6); g.fill(); g.strokeStyle = '#b8862e'; g.lineWidth = 6; g.strokeRect(1335, 455, 230, 160); txt(g, '奖状', 1450, 560, 48, '#9b2d24', { f: SERIF });
    g.fillStyle = '#3d5a8a'; rrect(g, 1420, 650, 200, 120, 6); g.fill(); g.fillStyle = GOLD; g.fillRect(1510, 650, 20, 120); txt(g, '爸妈的', 520, 280, 44, WARM, { f: SERIF }); txt(g, '你的', 1400, 280, 44, WARM, { f: SERIF }); }) },
  { t: '11 · 0:45 2008人', d: '回到夜里的房间。墙上铺开 2008 个小点，其中 52% 依次亮起冷光，大字 52%。', draw: S('2019年调查2008人：52%经常对爸妈报喜不报忧', (g) => { room(g, 0.4); seed = 9; for (let i = 0; i < 2008; i++) { const c = i % 56, r = Math.floor(i / 56); g.fillStyle = i < 1044 ? 'rgba(169,200,255,.9)' : 'rgba(255,255,255,.12)'; g.fillRect(640 + c * 16, 170 + r * 16, 10, 10); } txt(g, '52%', 1730, 420, 120, COOL, { f: SERIF, glow: 'rgba(169,200,255,.5)' }); txt(g, '经常', 1730, 490, 40, INK, { w: 700 }); }) },
  { t: '12 · 0:52 瞒了什么', d: '三个封好的信封落在桌上：工作 59%、钱 56%、身体 56%。火漆印把它们封住。', draw: S('瞒工作，瞒钱，瞒身体', (g) => { room(g, 0.5); envelope(g, 820, 520, '工作', '59%', COOL); envelope(g, 1220, 520, '钱', '56%', COOL); envelope(g, 1620, 520, '身体', '56%', COOL); }) },
  { t: '13 · 0:58 他们也在瞒', d: '手机亮起，妈妈发来：“家里都好，别担心。”画面上写：四分之一的人觉得，爸妈瞒得更多。', draw: S('还有四分之一的人觉得：爸妈瞒得比自己还多', (g) => { P(g, { sent: ['最近怎么样'], reply: '家里都好，别担心' }, 700); txt(g, '26%', 1420, 430, 120, COOL, { f: SERIF, glow: 'rgba(169,200,255,.5)' }); txt(g, '觉得爸妈瞒得更多', 1420, 500, 40, INK, { w: 700 }); }) },
  { t: '14 · 1:03 心理学家', d: '一张安静的引语卡（大意）：不赞成一味报喜不报忧，亲人之间的情感支持很重要。署名：中科院心理所 陈祉妍。', draw: S('心理学家提醒：一直报喜不报忧，并不好', (g) => { room(g, 0.3); g.save(); g.fillStyle = 'rgba(16,19,30,.85)'; rrect(g, 640, 260, 1100, 400, 30); g.fill(); g.restore(); txt(g, '“亲人之间的情感支持，', 1190, 400, 54, INK, { f: SERIF }); txt(g, '对心理健康和亲密关系都很重要。”', 1190, 480, 54, INK, { f: SERIF }); txt(g, '—— 陈祉妍，中科院心理所（大意）', 1190, 590, 32, 'rgba(243,237,226,.6)', { w: 500 }); }) },
  { t: '15 · 1:06 写一封信', d: '台灯下一张信纸，笔尖写下几行字。旁边一个指针表：“对方会觉得别扭吗？”指针指向“很别扭”。', draw: S('芝加哥大学做过4个实验：写的人都以为对方会别扭', (g) => { room(g, 0.3); glow(g, 860, 560, 600, '255,200,130', 0.25); g.save(); g.translate(860, 540); g.rotate(-0.06); g.fillStyle = '#efe6d4'; g.fillRect(-260, -300, 520, 600); g.strokeStyle = 'rgba(80,60,40,.35)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-210, -200 + i * 56); g.lineTo(i < 5 ? 210 : 60, -200 + i * 56); g.stroke(); } txt(g, '谢谢你……', -200, -215, 40, '#3b2a1e', { f: SERIF, a: 'left' }); g.restore();
    g.strokeStyle = 'rgba(243,237,226,.5)'; g.lineWidth = 6; g.beginPath(); g.arc(1400, 560, 200, Math.PI, 0); g.stroke(); g.strokeStyle = COOL; g.lineWidth = 8; g.beginPath(); g.moveTo(1400, 560); g.lineTo(1400 + Math.cos(-0.5) * 180, 560 + Math.sin(-0.5) * 180); g.stroke(); txt(g, '不别扭', 1210, 610, 30, INK, { w: 700 }); txt(g, '很别扭', 1590, 610, 30, COOL, { w: 700 }); txt(g, '对方会觉得别扭吗？', 1400, 320, 40, INK, { w: 700 }); }) },
  { t: '16 · 1:16 结果', d: '两组对比条：开心——你以为的短、实际的长；尴尬——你以为的长、实际的短。（示意，方向来自实验，不是具体数值）', draw: S('结果：对方比想的开心得多，也没那么尴尬', (g) => { room(g, 0.3); bars(g, 700, 330, '对方有多开心', 0.45, 0.82, GOLD); bars(g, 700, 640, '对方有多尴尬', 0.7, 0.3, WARM); txt(g, '示意：方向来自实验结果', 1020, 880, 26, 'rgba(243,237,226,.5)', { w: 500 }); }) },
  { t: '17 · 1:26 答案', d: '选择题回来，B 卡片亮成金色。', draw: S('答案是B：难开口，是你高估了尴尬', (g) => { room(g, 0.5, 300, 760); quizCards(g, 'B'); }) },
  { t: '18 · 1:30 对你也好', d: '一条压力曲线：写下爱意的那条更快回落。下面：每次 20 分钟 × 3 次，胆固醇下降。', draw: S('连写三次，每次20分钟，胆固醇都降了', (g) => { room(g, 0.3); g.strokeStyle = 'rgba(243,237,226,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(400, 300); g.lineTo(400, 700); g.lineTo(1500, 700); g.stroke();
    const curve = (k: number, col: string) => { g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= 1; x += 0.01) { const y = x < 0.2 ? 0 : Math.exp(-(x - 0.2) * k) * Math.sin(Math.min(1, (x - 0.2) * 12) * Math.PI / 2); g.lineTo(400 + x * 1100, 680 - y * 330); } g.stroke(); };
    curve(2.2, 'rgba(169,200,255,.6)'); curve(6, GOLD); txt(g, '写下爱意', 900, 560, 34, GOLD, { w: 700 }); txt(g, '没写', 1250, 430, 34, COOL, { w: 700 }); txt(g, '20分钟 × 3次 → 胆固醇下降', 960, 810, 44, INK, { w: 700 }); }) },
  { t: '19 · 1:36 300天', d: '一面日历墙：29 年，每年只亮 10 格。所有亮着的格子聚到一起，是 300 格不到。标注“粗算”。', draw: S('粗算：一年回家10天，往后大约300天', (g) => { room(g, 0.3); for (let yr = 0; yr < 29; yr++) for (let d = 0; d < 37; d++) { g.fillStyle = d < 1 ? 'rgba(255,180,106,.95)' : 'rgba(255,255,255,.07)'; g.fillRect(660 + d * 22, 150 + yr * 22, 17, 16); }
    txt(g, '≈ 300 天', 1710, 440, 100, WARM, { f: SERIF, glow: 'rgba(255,180,106,.5)' }); txt(g, '粗算：29年 × 10天', 1710, 510, 34, 'rgba(243,237,226,.65)', { w: 500 }); txt(g, '每一行是一年，亮的是回家的日子', 1060, 820, 28, 'rgba(243,237,226,.5)', { w: 500 }); }) },
  { t: '20 · 1:44 我想你了', d: '回到手机：打出“妈，我想你了”，这次按下了发送。房间里的冷光慢慢变暖。', draw: S('说不出“我爱你”，就从“我想你了”开始', (g) => { room(g, 1); glow(g, 960, 470, 800, '255,180,106', 0.12); phone(g, 960, 470, 0.82, (g) => chat(g, { sent: ['妈，我想你了'] })); }) },
  { t: '21 · 1:52 正在输入', d: '对面显示“正在输入……”，三个点跳动，不给答案。留给评论区。', draw: S('现在就发，评论区说说他们回了什么', (g) => { room(g, 1); glow(g, 960, 470, 900, '255,180,106', 0.2); phone(g, 960, 470, 0.82, (g) => chat(g, { sent: ['妈，我想你了'], typing: true })); }) },
  { t: '22 · 1:56 片尾卡', d: '金色问题 + 关注 Juno · 一起看懂世界。音乐继续。', draw: S('', (g) => { room(g, 0.3); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H); txt(g, '发给那个说不出口的自己', W / 2, 470, 76, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.5)' }); txt(g, '关注 Juno · 一起看懂世界', W / 2, 600, 40, 'rgba(243,237,226,.8)', { w: 700 }); }) },
];

export const FRAMES = BOARD.map((b) => b.draw);
export const Board: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = BOARD.map((b) => b.d + b.t).join('') + '你上一次对爸妈说我爱是什么时候对话框里打出删掉改成吃了吗猜如果真口会觉得很尴尬开心没感觉为这么难一项研究访谈15个华人孩子安静切好水果多生活费出门前那句穿提到拥抱只有4听帮忙争气两边都在用行动年调查2008经常报喜不忧瞒工作钱身体还四分之一比自己心理学家提醒并实验以别扭结果想得答案B高估连写三次每20分胆固醇降粗算回家10天往后大约300开始现发评论区他们关注Juno起看懂世界妈早点睡熬夜最近样都好担心到账¥500省着福奖状的以示意方向来自对方有多实际谢谢你写下爱意没写每一行是亮日子正在输入23:47◆·VIBE知识大赏≈×→—…“”：，%/';
    Promise.all([`900 70px ${SANS}`, `700 40px ${SANS}`, `500 40px ${SANS}`, `900 80px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); FRAMES[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};

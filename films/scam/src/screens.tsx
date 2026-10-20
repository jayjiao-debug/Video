/* more phone screens for the film (generic UI, no real app) */
import { G, txt, mono, rr, RED, GOLD } from './lib';
import { Screen } from './sets';
const bgDark = (g: G, w: number, h: number) => { const b = g.createLinearGradient(0, 0, 0, h); b.addColorStop(0, '#1f2a3a'); b.addColorStop(1, '#0c1018'); g.fillStyle = b; g.fillRect(0, 0, w, h); };
const hangBtn = (g: G, x: number, y: number, col: string, rot: number) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, 56, 0, 7); g.fill(); g.save(); g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.translate(x, y); g.rotate(rot); g.beginPath(); g.arc(0, 0, 22, -0.9, 0.9); g.stroke(); g.restore(); };

/* the transfer page before anyone touches it: amount and a pulsing confirm */
export const pay = (amount: string, pulse: number): Screen => (g, w, h) => {
  g.fillStyle = '#f3f4f7'; g.fillRect(0, 0, w, h); txt(g, '转账', w / 2, 120, 36, '#111', { w: 700 });
  g.fillStyle = '#fff'; rr(g, 30, 180, w - 60, 140, 18); g.fill(); txt(g, '收款人', 60, 230, 26, '#777', { w: 500, a: 'left' }); txt(g, '“儿子”的朋友', 60, 285, 34, '#111', { w: 700, a: 'left' });
  g.fillStyle = '#fff'; rr(g, 30, 350, w - 60, 200, 18); g.fill(); txt(g, '转账金额', 60, 400, 26, '#777', { w: 500, a: 'left' }); mono(g, `¥ ${amount}`, 60, 495, 62, '#111', { a: 'left', w: 700 });
  g.save(); g.shadowColor = `rgba(59,130,246,${0.8 * pulse})`; g.shadowBlur = 40 * pulse; g.fillStyle = '#3b82f6'; rr(g, 30, h - 200, w - 60, 96, 18); g.fill(); g.restore(); txt(g, '确认转账', w / 2, h - 138, 36, '#fff', { w: 700 });
};
/* SMS with a code */
export const sms = (): Screen => (g, w, h) => {
  g.fillStyle = '#f3f4f7'; g.fillRect(0, 0, w, h); txt(g, '短信', w / 2, 120, 32, '#111', { w: 700 });
  g.fillStyle = '#e4e6eb'; rr(g, 30, 220, w - 120, 230, 26); g.fill();
  txt(g, '【银行】您的验证码为', 56, 280, 28, '#222', { w: 500, a: 'left' }); mono(g, '482913', 56, 350, 54, '#111', { a: 'left', w: 700 }); txt(g, '请勿告诉任何人。', 56, 410, 28, RED, { w: 700, a: 'left' });
};
/* "is this you signing in?" */
export const isYou = (): Screen => (g, w, h) => {
  g.fillStyle = '#e9ecf1'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; rr(g, 40, h / 2 - 170, w - 80, 340, 28); g.fill();
  txt(g, '是你本人在登录吗？', w / 2, h / 2 - 80, 38, '#111', { w: 700 }); txt(g, '新设备 · 未知位置', w / 2, h / 2 - 25, 26, '#666', { w: 500 });
  g.fillStyle = '#eceef2'; rr(g, 70, h / 2 + 50, (w - 160) / 2, 80, 16); g.fill(); g.fillStyle = '#3b82f6'; rr(g, w / 2 + 10, h / 2 + 50, (w - 160) / 2, 80, 16); g.fill();
  txt(g, '不是我', 70 + (w - 160) / 4, h / 2 + 102, 32, '#333', { w: 700 }); txt(g, '是我', w / 2 + 10 + (w - 160) / 4, h / 2 + 102, 32, '#fff', { w: 700 });
};
/* your chat: voice messages and videos you sent */
export const chat = (k: number): Screen => (g, w, h) => {
  g.fillStyle = '#ededed'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7f7f7'; g.fillRect(0, 0, w, 120); txt(g, '家人', w / 2, 92, 32, '#111', { w: 700 });
  const bub = (y: number, sec: number, mine: boolean) => { const bw = 150 + sec * 14; const x = mine ? w - 40 - bw : 110; g.fillStyle = mine ? '#95ec69' : '#fff'; rr(g, x, y, bw, 70, 12); g.fill(); g.fillStyle = '#c7c7c7'; g.beginPath(); g.arc(mine ? w - 0 : 60, y + 35, 30, 0, 7); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 4; for (let r = 0; r < 3; r++) { g.beginPath(); g.arc(mine ? x + bw - 30 : x + 30, y + 35, 6 + r * 8, mine ? Math.PI * 0.75 : -Math.PI * 0.25, mine ? Math.PI * 1.25 : Math.PI * 0.25); g.stroke(); }
    txt(g, `${sec}"`, mine ? x - 16 : x + bw + 16, y + 46, 26, '#888', { w: 500, a: mine ? 'right' : 'left' }); };
  bub(170, 5, true); bub(270, 3, false); bub(370, 8, true);
  g.fillStyle = '#222'; rr(g, w - 300, 470, 260, 300, 12); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(w - 190, 580); g.lineTo(w - 190, 660); g.lineTo(w - 125, 620); g.fill(); bub(800, 12, true);
  /* a scanning bar copying them */
  if (k > 0) { g.fillStyle = `rgba(229,83,63,${0.25 * k})`; g.fillRect(0, 140 + ((k * 900) % 760), w, 30); }
};
/* calling your child */
export const calling = (who: string): Screen => (g, w, h) => {
  bgDark(g, w, h); txt(g, '正在呼叫…', w / 2, 200, 30, 'rgba(255,255,255,.6)', { w: 500 }); txt(g, who, w / 2, 290, 60, '#fff', { w: 700 });
  g.fillStyle = '#5a6578'; g.beginPath(); g.arc(w / 2, 470, 90, 0, 7); g.fill(); g.fillStyle = '#dfe6f1'; g.beginPath(); g.arc(w / 2, 445, 34, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, 530, 60, 36, 0, Math.PI, 0); g.fill();
  hangBtn(g, w / 2, h - 170, '#e5453a', 2.3);
};
/* recents: the scammer's number, crossed out */
export const recents = (cross: number): Screen => (g, w, h) => {
  g.fillStyle = '#f7f7f9'; g.fillRect(0, 0, w, h); txt(g, '通话记录', 40, 110, 40, '#111', { w: 700, a: 'left' });
  const rows: [string, string, boolean][] = [['未知号码', '来电 · 刚刚', true], ['孩子', '昨天', false], ['老伴', '星期一', false], ['小区物业', '星期日', false]];
  rows.forEach(([n, d, bad], i) => { const y = 180 + i * 120; g.fillStyle = '#e1e3e8'; g.fillRect(40, y + 104, w - 80, 2); txt(g, n, 40, y + 54, 36, bad ? RED : '#111', { w: 700, a: 'left' }); txt(g, d, 40, y + 92, 24, '#888', { w: 500, a: 'left' });
    if (bad) { g.strokeStyle = '#3b82f6'; g.lineWidth = 3; g.beginPath(); g.arc(w - 80, y + 56, 26, 0, 7); g.stroke(); txt(g, '回拨', w - 80, y + 64, 20, '#3b82f6', { w: 700 });
      if (cross > 0) { g.strokeStyle = RED; g.lineWidth = 8; g.lineCap = 'round'; const c = cross; g.beginPath(); g.moveTo(w - 112, y + 24); g.lineTo(w - 112 + 64 * c, y + 24 + 64 * c); g.stroke(); if (c > 0.5) { g.beginPath(); g.moveTo(w - 48, y + 24); g.lineTo(w - 48 - 64 * (c - 0.5) * 2, y + 24 + 64 * (c - 0.5) * 2); g.stroke(); } } } });
};
/* the safe word: the voice is asked, and fails */
export const safeWord = (fail: number, t: number): Screen => (g, w, h) => {
  bgDark(g, w, h); txt(g, '未知号码', w / 2, 170, 46, '#fff', { w: 700 });
  g.fillStyle = '#fff'; rr(g, 40, 230, w - 120, 110, 22); g.fill(); txt(g, '我们家的暗号是？', 70, 300, 34, '#111', { w: 700, a: 'left' });
  g.strokeStyle = fail > 0 ? RED : '#9cc3ff'; g.lineWidth = 6; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const x = 50 + i * ((w - 100) / 25); const a = (1 - fail) * (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + t * 9) * Math.sin(i * 0.6 + t * 4.3))); const hh = 6 + a * 130; g.beginPath(); g.moveTo(x, 520 - hh / 2); g.lineTo(x, 520 + hh / 2); g.stroke(); }
  if (fail > 0) txt(g, '……', w / 2, 640, 60, `rgba(229,83,63,${fail})`, { w: 700 });
  hangBtn(g, w / 2, h - 170, '#e5453a', 2.3);
};
export { GOLD };

/* incoming call, Chinese style: a 192 number with its region, and a "possible fraud" hint left out on purpose (most phones don't show it) */
export const ring = (num: string, loc: string, k = 0): Screen => (g, w, h) => {
  const b = g.createLinearGradient(0, 0, 0, h); b.addColorStop(0, '#2b3546'); b.addColorStop(1, '#0d1119'); g.fillStyle = b; g.fillRect(0, 0, w, h);
  mono(g, num, w / 2, 250, 54, '#fff', { w: 700 }); txt(g, loc, w / 2, 310, 30, 'rgba(255,255,255,.6)', { w: 500 });
  g.strokeStyle = `rgba(255,255,255,${0.25 * (1 - ((k * 1.2) % 1))})`; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, 520, 80 + ((k * 1.2) % 1) * 60, 0, 7); g.stroke();
  g.fillStyle = '#5a6578'; g.beginPath(); g.arc(w / 2, 520, 80, 0, 7); g.fill(); g.fillStyle = '#dfe6f1'; g.beginPath(); g.arc(w / 2, 500, 28, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, 568, 50, 30, 0, Math.PI, 0); g.fill();
  const by = h - 170; hangBtn(g, w / 2 - 120, by, '#e5453a', 2.3); hangBtn(g, w / 2 + 120, by, '#34c759', 0.8);
  txt(g, '拒绝', w / 2 - 120, by + 100, 28, 'rgba(255,255,255,.75)', { w: 500 }); txt(g, '接听', w / 2 + 120, by + 100, 28, 'rgba(255,255,255,.75)', { w: 500 });
};
/* lock screen with notifications stacking */
export const lock = (notes: [string, string, string][], n: number, t: number): Screen => (g, w, h) => {
  const b = g.createLinearGradient(0, 0, w, h); b.addColorStop(0, '#3a2f4a'); b.addColorStop(1, '#14182a'); g.fillStyle = b; g.fillRect(0, 0, w, h);
  mono(g, '19:42', w / 2, 230, 120, '#fff', { w: 300 }); txt(g, '10月20日 星期二', w / 2, 290, 30, 'rgba(255,255,255,.8)', { w: 500 });
  notes.forEach(([app, title, body], i) => { const k = Math.min(1, Math.max(0, n - i)); if (k <= 0) return; const y = 340 + i * 230 - 30 * (1 - k);
    g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(255,255,255,.92)'; rr(g, 18, y, w - 36, 210, 28); g.fill(); g.fillStyle = app === '电话' ? '#34c759' : '#3b82f6'; rr(g, 40, y + 22, 44, 44, 11); g.fill();
    txt(g, app, 100, y + 56, 28, '#555', { w: 500, a: 'left' }); txt(g, '现在', w - 44, y + 56, 26, '#777', { w: 500, a: 'right' }); txt(g, title, 40, y + 112, 36, '#111', { w: 700, a: 'left' }); txt(g, body, 40, y + 168, 32, '#333', { w: 500, a: 'left' }); g.restore(); });
};
/* a generic chat transfer: the friend of "your son" asks, and the button glows */
export const chatPay = (pulse: number): Screen => (g, w, h) => {
  g.fillStyle = '#ededed'; g.fillRect(0, 0, w, h); g.fillStyle = '#f7f7f7'; g.fillRect(0, 0, w, 120); txt(g, '“儿子”', w / 2, 92, 32, '#111', { w: 700 });
  g.fillStyle = '#fff'; rr(g, 100, 170, 300, 90, 12); g.fill(); txt(g, '妈，转到这个卡', 120, 225, 28, '#111', { w: 500, a: 'left' });
  g.fillStyle = '#fff'; rr(g, 100, 280, 320, 90, 12); g.fill(); txt(g, '我同学的，急用', 120, 335, 28, '#111', { w: 500, a: 'left' });
  g.fillStyle = '#c7c7c7'; g.beginPath(); g.arc(60, 215, 30, 0, 7); g.fill(); g.beginPath(); g.arc(60, 325, 30, 0, 7); g.fill();
  g.fillStyle = '#fff'; rr(g, 30, 470, w - 60, 330, 22); g.fill(); txt(g, '转账', w / 2, 530, 30, '#333', { w: 700 }); mono(g, '¥ 20,000', w / 2, 640, 70, '#111', { w: 700 });
  g.save(); g.shadowColor = `rgba(243,154,30,${0.8 * pulse})`; g.shadowBlur = 40 * pulse; g.fillStyle = '#f39a1e'; rr(g, 60, 690, w - 120, 84, 16); g.fill(); g.restore(); txt(g, '确认转账', w / 2, 745, 34, '#fff', { w: 700 });
};
/* the phone powering off */
export const powerOff = (k: number): Screen => (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const a = 1 - k; g.save(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(w / 2, h / 2, 70, -Math.PI / 2 + 0.6, -Math.PI / 2 - 0.6 + Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(w / 2, h / 2 - 90); g.lineTo(w / 2, h / 2 - 10); g.stroke(); g.restore(); txt(g, '正在关机…', w / 2, h / 2 + 160, 30, `rgba(255,255,255,${0.7 * a})`, { w: 500 }); };
export const dial110 = (n: number): Screen => (g, w, h) => { g.fillStyle = '#0f1218'; g.fillRect(0, 0, w, h); mono(g, '110'.slice(0, n), w / 2, 260, 90, '#fff', { w: 300 });
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '']; keys.forEach((kk, i) => { if (!kk) return; const x = w / 2 + ((i % 3) - 1) * 130, y = 420 + Math.floor(i / 3) * 130; g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x, y, 52, 0, 7); g.fill(); mono(g, kk, x, y + 16, 46, '#fff', { w: 300 }); });
  hangBtn(g, w / 2, h - 120, '#34c759', 0.8); };

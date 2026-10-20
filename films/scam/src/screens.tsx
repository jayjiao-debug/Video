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

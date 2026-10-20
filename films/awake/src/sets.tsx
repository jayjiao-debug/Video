/* the three candidate sets, each drawn fully in code */
import { G, W, H, rnd, setSeed, glow, rr, mono, txt, GOLD, INK, SERIF, BLUE, clamp, lerp } from './lib';

/* ================================================================ A · overhead bedroom */
export type Room = { lamp: number; phone: number; flick?: number; day: number; clock: string; battery?: number; alarm?: number };
const plank = (g: G) => { for (let i = 0; i < 18; i++) { const x = i * 112 - 20; setSeed(40 + i); g.fillStyle = `hsl(28, 24%, ${25 + rnd() * 5}%)`; g.fillRect(x, 0, 110, H); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 110, 0, 2, H); for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(0,0,0,${0.06 + rnd() * 0.06})`; g.lineWidth = 1; g.beginPath(); const gx = x + 10 + rnd() * 90; g.moveTo(gx, 0); g.bezierCurveTo(gx + 8, 300, gx - 8, 700, gx + 4, H); g.stroke(); } const jy = rnd() * H; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, jy, 110, 2); } };
export const bedroom = (g: G, s: Room) => {
  /* base, drawn in muted day colours; night is a multiply wash on top, then the light pools */
  plank(g);
  g.fillStyle = '#5b4b3f'; rr(g, 420, 760, 1080, 360, 26); g.fill(); g.strokeStyle = 'rgba(255,240,220,.12)'; g.lineWidth = 3; rr(g, 440, 780, 1040, 330, 18); g.stroke();
  /* bed */
  g.fillStyle = '#3a2a20'; rr(g, 588, 60, 744, 80, 14); g.fill();
  g.fillStyle = '#c9cbd2'; rr(g, 612, 120, 696, 900, 18); g.fill();
  const pil = (x: number) => { const b = g.createLinearGradient(x, 150, x, 300); b.addColorStop(0, '#e6e7ec'); b.addColorStop(1, '#b9bcc6'); g.fillStyle = b; rr(g, x, 148, 300, 150, 46); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 40, 222); g.quadraticCurveTo(x + 150, 236, x + 260, 220); g.stroke(); };
  pil(640); pil(980);
  /* the head on the left pillow: hair seen from above */
  const hb = g.createRadialGradient(780, 232, 10, 790, 248, 92); hb.addColorStop(0, '#2b2420'); hb.addColorStop(1, '#141010'); g.fillStyle = hb; g.beginPath(); g.ellipse(790, 246, 72, 84, -0.08, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(760 + k * 7, 170); g.quadraticCurveTo(745 + k * 9, 240, 770 + k * 6, 320); g.stroke(); }
  /* duvet with the body under it */
  const dv = g.createLinearGradient(620, 0, 1300, 0); dv.addColorStop(0, '#7d8aa6'); dv.addColorStop(0.28, '#a3afc8'); dv.addColorStop(0.42, '#8794b0'); dv.addColorStop(1, '#717d98'); g.fillStyle = dv;
  g.beginPath(); g.moveTo(606, 312); g.bezierCurveTo(700, 290, 860, 330, 960, 300); g.bezierCurveTo(1080, 276, 1200, 316, 1314, 296); g.lineTo(1326, 1010); g.bezierCurveTo(1100, 1030, 820, 1024, 596, 1012); g.closePath(); g.fill();
  /* the body's ridge and folds */
  const ridge = g.createLinearGradient(700, 0, 900, 0); ridge.addColorStop(0, 'rgba(255,255,255,0)'); ridge.addColorStop(0.5, 'rgba(255,255,255,.16)'); ridge.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = ridge; g.beginPath(); g.ellipse(800, 600, 120, 330, 0.02, 0, 7); g.fill();
  g.strokeStyle = 'rgba(30,36,54,.35)'; g.lineWidth = 3; [[680, 420, 720, 900], [930, 380, 980, 930], [1080, 360, 1150, 980], [1230, 330, 1250, 960]].forEach(([x1, y1, x2, y2]) => { g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + 30, (y1 + y2) / 2 - 80, x2 - 30, (y1 + y2) / 2 + 80, x2, y2); g.stroke(); });
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(606, 312); g.bezierCurveTo(700, 290, 860, 330, 960, 300); g.bezierCurveTo(1080, 276, 1200, 316, 1314, 296); g.lineTo(1314, 318); g.bezierCurveTo(1200, 338, 1080, 298, 960, 322); g.bezierCurveTo(860, 352, 700, 312, 606, 334); g.fill();
  /* phone, held above the face: we see its back */
  const ph = s.phone; if (ph > 0) { g.save(); g.translate(812, 318); g.rotate(-0.12); g.fillStyle = '#1b1d22'; rr(g, -40, -74, 80, 148, 12); g.fill(); g.fillStyle = '#2a2d34'; rr(g, -26, -60, 22, 22, 6); g.fill(); g.restore(); }
  /* nightstand, lamp, clock */
  g.fillStyle = '#4a3527'; rr(g, 1360, 96, 210, 250, 10); g.fill(); g.strokeStyle = 'rgba(255,230,200,.08)'; g.lineWidth = 2; rr(g, 1372, 108, 186, 226, 6); g.stroke();
  g.fillStyle = '#d8cdb8'; g.beginPath(); g.arc(1462, 170, 56, 0, 7); g.fill(); g.fillStyle = '#b9ab92'; g.beginPath(); g.arc(1462, 170, 20, 0, 7); g.fill();
  g.fillStyle = '#121214'; rr(g, 1388, 262, 156, 62, 8); g.fill();
  /* slippers */
  g.fillStyle = '#3c4a5e'; g.beginPath(); g.ellipse(520, 880, 26, 54, 0.1, 0, 7); g.fill(); g.beginPath(); g.ellipse(575, 892, 26, 54, -0.05, 0, 7); g.fill();
  /* window light on the floor (moon at night, sun in the morning) */
  const win = (a: number, col: string) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(0, 170); g.lineTo(420, 240); g.lineTo(520, 640); g.lineTo(0, 590); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 10; g.beginPath(); g.moveTo(210, 205); g.lineTo(260, 615); g.moveTo(0, 380); g.lineTo(470, 440); g.stroke(); g.restore(); };
  win(0.5 * s.day, 'rgba(255,250,240,.35)');

  /* NIGHT: multiply everything down to blue, then add the lights */
  const night = 1 - s.day;
  const dk = 1 - 0.35 * s.lamp;  // the lamp lifts the whole room a little
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${lerp(255, 78 / dk * 0.8, night)},${lerp(255, 92 / dk * 0.8, night)},${lerp(255, 150 / dk * 0.8, night)})`; g.fillRect(0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'screen';
  /* moonlight through the window */
  if (night > 0) { g.save(); g.globalAlpha = 0.22 * night; const m = g.createLinearGradient(0, 300, 520, 500); m.addColorStop(0, 'rgba(150,180,255,1)'); m.addColorStop(1, 'rgba(150,180,255,0)'); g.fillStyle = m; g.beginPath(); g.moveTo(0, 170); g.lineTo(420, 240); g.lineTo(520, 640); g.lineTo(0, 590); g.closePath(); g.fill(); g.restore(); }
  /* lamp: warm pool */
  if (s.lamp > 0) { glow(g, 1462, 170, 760, '255,178,96', 0.55 * s.lamp); glow(g, 1462, 170, 160, '255,226,170', 0.9 * s.lamp); }
  /* phone: cold glow spilling from under the phone onto the face and pillow, flickering with each swipe */
  if (s.phone > 0) { const f = 1 + 0.18 * (s.flick ?? 0); glow(g, 800, 290, 420, '120,170,255', 0.42 * s.phone * f); glow(g, 800, 290, 150, '200,225,255', 0.55 * s.phone * f); }
  /* morning: cold white daylight */
  if (s.day > 0) glow(g, 300, 400, 1300, '230,240,255', 0.25 * s.day);
  g.restore();
  /* the clock's digits glow on top of everything */
  mono(g, s.clock, 1466, 312, 46, s.alarm ? (Math.sin((s.alarm) * 40) > 0 ? '#ff6a4d' : '#ffb39a') : '#ff8a4c', { glow: 'rgba(255,110,60,.8)' });
  if (s.battery !== undefined) { const bx = 840, by = 470; /* small battery read-out beside the phone */ }
};

/* ================================================================ B · the building at night */
export type Facade = { hour: number; focus: number };
export const facade = (g: G, s: Facade) => {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#060a18'); sky.addColorStop(1, '#141a30'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  setSeed(4); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(220,230,255,${rnd() * 0.5})`; g.fillRect(rnd() * W, rnd() * 300, 1.5, 1.5); }
  glow(g, 1560, 150, 220, '220,230,255', 0.25); g.fillStyle = '#e9ecf4'; g.beginPath(); g.arc(1560, 150, 42, 0, 7); g.fill(); g.fillStyle = '#060a18'; g.beginPath(); g.arc(1578, 140, 38, 0, 7); g.fill();
  /* far towers */
  setSeed(6); for (let i = 0; i < 14; i++) { const x = i * 150 - 40, h = 260 + rnd() * 380; g.fillStyle = '#0b1022'; g.fillRect(x, H - h, 130, h); for (let r = 0; r < h / 30; r++) for (let c = 0; c < 5; c++) if (rnd() < 0.12) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,200,130,.35)' : 'rgba(140,180,255,.35)'; g.fillRect(x + 12 + c * 22, H - h + 14 + r * 30, 10, 14); } }
  /* the hero building */
  const bx = 360, bw = 1200, top = 180; g.fillStyle = '#1b2033'; g.fillRect(bx, top, bw, H - top); g.fillStyle = '#232a42'; g.fillRect(bx, top, bw, 18);
  const cols = 10, rows = 8, cw = bw / cols, rh = (H - top - 40) / rows;
  setSeed(12);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = bx + c * cw + 22, y = top + 40 + r * rh, w = cw - 44, h = rh - 34;
    const v = rnd(); const lit = v < clamp(0.85 - s.hour * 0.16); const hero = r === 3 && c === 5;
    g.fillStyle = '#0a0d18'; g.fillRect(x, y, w, h);
    if (hero) { const b = g.createRadialGradient(x + w / 2, y + h * 0.6, 4, x + w / 2, y + h * 0.6, w); b.addColorStop(0, 'rgba(170,205,255,.95)'); b.addColorStop(1, 'rgba(70,110,200,.25)'); g.fillStyle = b; g.fillRect(x, y, w, h); }
    else if (lit) { g.fillStyle = v < 0.3 ? 'rgba(255,196,120,.75)' : 'rgba(255,214,160,.55)'; g.fillRect(x, y, w, h); }
    g.strokeStyle = '#2b3350'; g.lineWidth = 4; g.strokeRect(x, y, w, h); g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke();
    if (hero) glow(g, x + w / 2, y + h / 2, 260, '120,170,255', 0.35 + 0.15 * s.focus);
    g.fillStyle = '#262d46'; g.fillRect(x - 8, y + h, w + 16, 10);
  }
};

/* ================================================================ C · the clock face */
export const dial = (g: G, cx: number, cy: number, R: number, o: { hand?: number; band?: [number, number]; pressure?: number; alert?: number }) => {
  const bg = g.createRadialGradient(cx, cy, 20, cx, cy, R * 1.6); bg.addColorStop(0, '#111628'); bg.addColorStop(1, '#04050a'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(243,237,226,.18)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, R * 0.62, 0, 7); g.stroke();
  const ang = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2;
  for (let h = 0; h < 24; h++) { const a = ang(h); const l = h % 6 === 0 ? 26 : 12; g.strokeStyle = `rgba(243,237,226,${h % 6 === 0 ? 0.7 : 0.3})`; g.lineWidth = h % 6 === 0 ? 3 : 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * (R - l), cy + Math.sin(a) * (R - l)); g.stroke(); if (h % 3 === 0) txt(g, String(h), cx + Math.cos(a) * (R + 40), cy + Math.sin(a) * (R + 40) + 12, 30, 'rgba(243,237,226,.6)', { f: SERIF, w: 700 }); }
  /* night half shaded */
  g.save(); g.fillStyle = 'rgba(60,80,150,.12)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, ang(22), ang(31.5)); g.closePath(); g.fill(); g.restore();
  /* sleep pressure: a grey tide whose radius grows from 7:30 to 2:00 */
  const pr = o.pressure ?? 0; if (pr > 0) { g.save(); g.globalAlpha = pr; g.fillStyle = 'rgba(160,170,195,.28)'; g.beginPath(); for (let k = 0; k <= 120; k++) { const h = 7.5 + (18.5 * k) / 120; const r = R * 0.62 + R * 0.34 * (k / 120); const a = ang(h); k ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } for (let k = 120; k >= 0; k--) { const h = 7.5 + (18.5 * k) / 120; const a = ang(h); g.lineTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); } g.fill(); g.restore(); }
  /* circadian alerting: gold line, peaks before habitual bedtime */
  const al = o.alert ?? 0; if (al > 0) { g.save(); g.globalAlpha = al; g.strokeStyle = GOLD; g.lineWidth = 4; g.shadowColor = 'rgba(241,197,109,.6)'; g.shadowBlur = 12; g.beginPath(); for (let k = 0; k <= 160; k++) { const h = 7.5 + (18.5 * k) / 160; const peak = Math.exp(-Math.pow((h - 22.3) / 1.6, 2)); const base = clamp((h - 7.5) / 14) * 0.55; const v = h > 22.3 ? peak * 0.95 : Math.max(base, peak * 0.95); const r = R * 0.64 + R * 0.32 * v; const a = ang(h); k ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.stroke(); g.restore(); }
  if (o.band) { const [a0, a1] = o.band; g.save(); g.fillStyle = 'rgba(241,197,109,.18)'; g.strokeStyle = 'rgba(241,197,109,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 1.0, ang(a0), ang(a1)); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  if (o.hand !== undefined) { const a = ang(o.hand); g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fill(); }
};
export { BLUE };

/* 《妈，是我》 v2 sets: three tables seen from straight above (flat-lay), each its own world.
   World units are set pixels; a camera frames part of the world. Every prop is drawn in code. */
import { G, W, H, rnd, setSeed, glow, rr, txt, mono, GOLD, INK, RED, SERIF, SANS, clamp, lerp } from './lib';
import { phone, Screen } from './sets';

export type Cam = { x: number; y: number; s: number; r?: number };
export const withCam = (g: G, c: Cam, f: () => void) => { g.save(); g.translate(W / 2, H / 2); g.rotate(c.r ?? 0); g.scale(c.s, c.s); g.translate(-c.x, -c.y); f(); g.restore(); };
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), k)), r: lerp(a.r ?? 0, b.r ?? 0, k) });

/* ---------------------------------------------------------------- materials */
const wood = (g: G, x: number, y: number, w: number, h: number, base: [number, number, number], seed: number, plank = 240) => {
  setSeed(seed);
  for (let px = x; px < x + w; px += plank) {
    const v = rnd() * 10 - 5; g.fillStyle = `hsl(${base[0] + v * 0.4}, ${base[1]}%, ${base[2] + v * 0.5}%)`; g.fillRect(px, y, plank, h);
    for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(0,0,0,${0.04 + rnd() * 0.07})`; g.lineWidth = 1 + rnd() * 2; const gx = px + 10 + rnd() * (plank - 20); g.beginPath(); g.moveTo(gx, y); g.bezierCurveTo(gx + 20 * (rnd() - 0.5), y + h * 0.3, gx + 30 * (rnd() - 0.5), y + h * 0.7, gx + 10 * (rnd() - 0.5), y + h); g.stroke(); }
    for (let k = 0; k < 2; k++) { const kx = px + 30 + rnd() * (plank - 60), ky = y + rnd() * h; g.strokeStyle = 'rgba(40,20,10,.18)'; g.lineWidth = 2; for (let r = 0; r < 4; r++) { g.beginPath(); g.ellipse(kx, ky, 8 + r * 7, 22 + r * 14, 0, 0, 7); g.stroke(); } }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(px + plank - 2, y, 3, h);
  }
};
const shadowed = (g: G, f: () => void, blur = 30, oy = 14, a = 0.45) => { g.save(); g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = oy; g.shadowOffsetX = oy * 0.6; f(); g.restore(); };
const steam = (g: G, x: number, y: number, t: number, a = 1) => { g.save(); g.globalAlpha = 0.16 * a; g.strokeStyle = '#fff'; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { const ph = t * 0.6 + k * 0.25; const r = 20 + ((ph * 80) % 90); g.lineWidth = 10 - r / 12; g.beginPath(); g.arc(x + Math.sin(ph * 3 + k) * 14, y + Math.cos(ph * 2 + k) * 10, r, ph * 2 + k, ph * 2 + k + 1.6); g.stroke(); } g.restore(); };

/* ---------------------------------------------------------------- 1 · mum's coffee table (warm) */
export const MUM_W = 2600, MUM_H = 1600;
export const MUM_PHONE = { x: 1320, y: 820, r: -0.14, s: 0.6 };
export type MumState = { t: number; screen: Screen; glowA: number; buzz?: number; night?: number; phoneOff?: number; phoneFace?: number };
export const mumTable = (g: G, s: MumState) => {
  wood(g, 0, 0, MUM_W, MUM_H, [24, 38, 24], 11);
  /* a crocheted runner across the table */
  g.save(); g.globalAlpha = 0.9; g.fillStyle = '#e9e1cf'; rr(g, 380, 560, 1840, 520, 30); g.fill(); g.strokeStyle = 'rgba(160,140,110,.5)'; g.lineWidth = 2;
  for (let x = 420; x < 2200; x += 46) for (let y = 600; y < 1060; y += 46) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.stroke(); }
  g.fillStyle = '#e9e1cf'; for (let x = 400; x < 2220; x += 40) { g.beginPath(); g.arc(x, 560, 12, Math.PI, 0); g.fill(); g.beginPath(); g.arc(x, 1080, 12, 0, Math.PI); g.fill(); } g.restore();
  /* tea: saucer, cup, tea, handle, steam */
  shadowed(g, () => { g.fillStyle = '#efe9dd'; g.beginPath(); g.arc(760, 470, 130, 0, 7); g.fill(); });
  g.strokeStyle = 'rgba(70,110,160,.55)'; g.lineWidth = 6; g.beginPath(); g.arc(760, 470, 112, 0, 7); g.stroke();
  shadowed(g, () => { g.fillStyle = '#fbf8f2'; g.beginPath(); g.arc(760, 470, 86, 0, 7); g.fill(); g.fillRect(840, 455, 60, 30); }, 16, 8, 0.35);
  const tea = g.createRadialGradient(745, 455, 10, 760, 470, 72); tea.addColorStop(0, '#c48a3c'); tea.addColorStop(1, '#7a4a1c'); g.fillStyle = tea; g.beginPath(); g.arc(760, 470, 70, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(735, 445, 22, 10, -0.6, 0, 7); g.fill();
  /* reading glasses, folded */
  g.save(); g.translate(1880, 470); g.rotate(0.25); shadowed(g, () => { g.strokeStyle = '#a0672e'; g.lineWidth = 9; g.beginPath(); g.ellipse(-62, 0, 54, 40, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(62, 0, 54, 40, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-10, -6); g.quadraticCurveTo(0, -18, 10, -6); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(-116, -8); g.lineTo(60, -26); g.moveTo(116, -8); g.lineTo(-40, -30); g.stroke(); }, 14, 8, 0.4);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(-70, -8, 30, 16, -0.5, 0, 7); g.ellipse(54, -8, 30, 16, -0.5, 0, 7); g.fill(); g.restore();
  /* yarn ball and needles */
  shadowed(g, () => { const y = g.createRadialGradient(560, 1200, 20, 600, 1240, 130); y.addColorStop(0, '#d9573f'); y.addColorStop(1, '#8e2b1f'); g.fillStyle = y; g.beginPath(); g.arc(600, 1240, 120, 0, 7); g.fill(); });
  g.strokeStyle = 'rgba(255,200,180,.35)'; g.lineWidth = 3; setSeed(5); for (let k = 0; k < 16; k++) { g.beginPath(); const a = rnd() * 6.28; g.ellipse(600, 1240, 118, 40 + rnd() * 70, a, 0, Math.PI); g.stroke(); }
  g.strokeStyle = '#c9b48a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(760, 1080); g.lineTo(1060, 1380); g.moveTo(780, 1370); g.lineTo(1080, 1110); g.stroke(); g.strokeStyle = '#d9573f'; g.lineWidth = 4; g.beginPath(); g.moveTo(700, 1200); g.bezierCurveTo(820, 1180, 880, 1260, 920, 1230); g.stroke();
  /* a dish of sunflower seeds */
  shadowed(g, () => { g.fillStyle = '#f1ece2'; g.beginPath(); g.ellipse(1950, 1200, 170, 120, 0.2, 0, 7); g.fill(); });
  g.strokeStyle = 'rgba(200,60,50,.6)'; g.lineWidth = 5; g.beginPath(); g.ellipse(1950, 1200, 150, 102, 0.2, 0, 7); g.stroke();
  setSeed(9); for (let k = 0; k < 70; k++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 110; const x = 1950 + Math.cos(a) * r * 1.3, y = 1200 + Math.sin(a) * r * 0.85; g.save(); g.translate(x, y); g.rotate(rnd() * 6.28); g.fillStyle = '#2b2522'; g.beginPath(); g.ellipse(0, 0, 13, 6, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(230,220,200,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-10, 0); g.lineTo(10, 0); g.stroke(); g.restore(); }
  /* a wall calendar page, torn */
  g.save(); g.translate(2230, 760); g.rotate(-0.08); shadowed(g, () => { g.fillStyle = '#fbf6ea'; g.fillRect(-150, -190, 300, 380); }); txt(g, '十月', 0, -120, 34, '#b3261b', { f: SERIF, w: 700 }); mono(g, '20', 0, 30, 150, '#b3261b', { f: SERIF }); txt(g, '星期二 · 九月初十', 0, 120, 22, '#6b6258', { w: 500 }); g.restore();
  /* the phone */
  g.save(); g.translate(MUM_PHONE.x, MUM_PHONE.y); g.rotate(MUM_PHONE.r);
  if ((s.phoneFace ?? 0) > 0.5) { shadowed(g, () => { g.fillStyle = '#26272c'; rr(g, -150, -312, 300, 624, 42); g.fill(); }); g.fillStyle = '#34363d'; rr(g, -110, -280, 90, 120, 26); g.fill(); }
  else { shadowed(g, () => { g.fillStyle = '#16171b'; rr(g, -150, -312, 300, 624, 42); g.fill(); }, 40, 18, 0.55); phone(g, 0, 0, MUM_PHONE.s, s.screen, { buzz: s.buzz, off: s.phoneOff }); }
  g.restore();
  /* light: warm lamp pool from the upper right, the room darker toward the edges; the phone's glow lights the runner */
  const night = s.night ?? 0;
  g.save(); g.globalCompositeOperation = 'multiply'; const v = g.createRadialGradient(1700, 300, 200, 1500, 700, 1700); v.addColorStop(0, `rgb(255,${lerp(236, 210, night)},${lerp(205, 170, night)})`); v.addColorStop(1, `rgb(${lerp(90, 40, night)},${lerp(70, 34, night)},${lerp(60, 40, night)})`); g.fillStyle = v; g.fillRect(0, 0, MUM_W, MUM_H); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, 1800, 250, 900, '255,170,90', 0.18 * (1 - night * 0.5));
  if (s.glowA > 0) glow(g, MUM_PHONE.x, MUM_PHONE.y, 620, '130,175,255', 0.32 * s.glowA); g.restore();
  steam(g, 760, 420, s.t, 1 - night * 0.6);
};

/* ---------------------------------------------------------------- 2 · the police desk (lamp-lit) */
export const DESK_W = 3000, DESK_H = 1700;
export type DeskState = { t: number; stampA?: number; stampB?: number; reportBars?: number; wave?: number; hi?: number };
const paper = (g: G, x: number, y: number, w: number, h: number, r: number, f: () => void, col = '#f2ecdf') => { g.save(); g.translate(x, y); g.rotate(r); shadowed(g, () => { g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h); }, 24, 10, 0.5); f(); g.restore(); };
const lines = (g: G, x: number, y: number, w: number, n: number, seed: number, gap = 34) => { setSeed(seed); g.fillStyle = 'rgba(40,36,30,.42)'; for (let k = 0; k < n; k++) g.fillRect(x, y + k * gap, w * (0.6 + rnd() * 0.4), 7); };
const stamp = (g: G, x: number, y: number, s: string, k: number, r = -0.14) => { if (k <= 0) return; const sc = 1 + 0.6 * (1 - clamp(k * 1.4)); g.save(); g.translate(x, y); g.rotate(r); g.scale(sc, sc); g.globalAlpha = clamp(k * 2); g.strokeStyle = '#c0281c'; g.lineWidth = 9; g.font = `700 64px ${SERIF}`; const w = g.measureText(s).width + 70; rr(g, -w / 2, -58, w, 116, 12); g.stroke(); txt(g, s, 0, 22, 64, '#c0281c', { f: SERIF, w: 700 }); g.restore(); };
export const waveCompare = (g: G, x: number, y: number, w: number, k: number) => {
  /* two voice prints, the real grandson's and the cloned one, nearly identical */
  const draw = (yy: number, col: string, seed: number, lbl: string) => { txt(g, lbl, x, yy - 40, 26, '#4a443c', { w: 700, a: 'left' }); g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 120 * k; i++) { const px = x + (i / 120) * w; const a = Math.sin(i * 0.37 + seed) * Math.sin(i * 0.11) * (0.5 + 0.5 * Math.sin(i * 0.05)); i ? g.lineTo(px, yy + a * 46) : g.moveTo(px, yy + a * 46); } g.stroke(); };
  draw(y, '#2b2620', 0, '孙子本人'); draw(y + 150, '#b3261b', 0.08, 'AI 合成');
};
export const deskScene = (g: G, s: DeskState) => {
  wood(g, 0, 0, DESK_W, DESK_H, [20, 30, 16], 21, 300);
  g.fillStyle = '#1f3a2e'; rr(g, 260, 170, 2480, 1360, 26); g.fill(); g.strokeStyle = 'rgba(200,170,110,.35)'; g.lineWidth = 4; rr(g, 285, 195, 2430, 1310, 20); g.stroke();
  /* case A: the cloned grandson (left) */
  g.save(); g.translate(820, 760); g.rotate(-0.04); shadowed(g, () => { g.fillStyle = '#c9a66b'; g.fillRect(-520, -430, 1040, 860); }, 30, 14, 0.5); g.fillStyle = '#b8955b'; g.fillRect(-520, -480, 300, 60); g.restore();
  paper(g, 640, 740, 600, 780, -0.03, () => { txt(g, '案 件 卷 宗', 0, -300, 40, '#2b2620', { f: SERIF, w: 700 }); txt(g, '北京 · AI 拟声冒充亲属', 0, -240, 28, '#6b6258', { w: 700 }); waveCompare(g, -240, -100, 480, s.wave ?? 1); lines(g, -240, 170, 480, 5, 3); });
  paper(g, 1120, 560, 340, 260, 0.06, () => { txt(g, '转账凭证', 0, -70, 28, '#6b6258', { w: 700 }); mono(g, '¥10,000', 0, 10, 64, '#2b2620', { f: SERIF }); txt(g, '收款方：“孙子”的朋友', 0, 70, 22, '#6b6258', { w: 500 }); }, '#fbf8f0');
  stamp(g, 1100, 960, 'AI合成声音', s.stampA ?? 0);
  /* case B: the 70-year-old (right) */
  g.save(); g.translate(2180, 760); g.rotate(0.03); shadowed(g, () => { g.fillStyle = '#c9a66b'; g.fillRect(-520, -430, 1040, 860); }, 30, 14, 0.5); g.restore();
  paper(g, 2000, 760, 600, 780, 0.02, () => { txt(g, '案 件 卷 宗', 0, -300, 40, '#2b2620', { f: SERIF, w: 700 }); txt(g, '冒充客服 · 屏幕共享', 0, -240, 28, '#6b6258', { w: 700 });
    [['年龄', '70岁'], ['两张卡内', '1421万'], ['民警赶到', '6分钟']].forEach(([a, b], i) => { txt(g, a, -230, -130 + i * 80, 30, '#6b6258', { w: 500, a: 'left' }); txt(g, b, 230, -128 + i * 80, 40, i === 1 ? '#b3261b' : '#2b2620', { w: 700, a: 'right' }); g.fillStyle = 'rgba(40,36,30,.15)'; g.fillRect(-230, -110 + i * 80, 460, 2); }); lines(g, -230, 140, 460, 5, 7); });
  /* an evidence photo of a phone with the red sharing bar */
  paper(g, 2470, 520, 260, 360, 0.08, () => { g.fillStyle = '#20232b'; g.fillRect(-110, -150, 220, 280); g.fillStyle = '#d93a2f'; g.fillRect(-110, -150, 220, 34); txt(g, '正在共享屏幕', 0, -126, 18, '#fff', { w: 700 }); g.fillStyle = '#eef0f4'; g.fillRect(-90, -96, 180, 200); mono(g, '¥500,000', 0, -40, 30, '#111'); }, '#fafafa');
  stamp(g, 2240, 1000, '一分未损', s.stampB ?? 0, 0.1);
  /* the report page (centre bottom): victims by age, 2023 */
  paper(g, 1500, 1330, 760, 420, -0.02, () => {
    txt(g, '电信网络诈骗受害人年龄分布（2023）', 0, -150, 26, '#2b2620', { w: 700 }); txt(g, '公安部刑侦局', 0, -112, 20, '#6b6258', { w: 500 });
    const rows: [string, number][] = [['18–40岁', 62.1], ['41–65岁', 33.1], ['其他', 4.8]]; const k = s.reportBars ?? 1;
    rows.forEach(([l, v], i) => { const y = -60 + i * 70; if (i === 0 && (s.hi ?? 0) > 0) { g.fillStyle = `rgba(241,197,109,${0.35 * (s.hi ?? 0)})`; g.fillRect(-345, y - 26, 690, 62); } txt(g, l, -330, y + 14, 26, '#2b2620', { w: 700, a: 'left' }); g.fillStyle = i === 0 ? '#b3261b' : 'rgba(43,38,32,.45)'; g.beginPath(); g.roundRect(-190, y - 10, (v / 70) * 420 * k, 34, [0, 4, 4, 0]); g.fill(); mono(g, `${v}%`, -190 + (v / 70) * 420 * k + 14, y + 16, 26, '#2b2620', { a: 'left', alpha: clamp(k * 1.5 - 0.5) }); });
  });
  /* pen, stamp pad, mug */
  g.save(); g.translate(1500, 330); g.rotate(0.5); shadowed(g, () => { g.fillStyle = '#1b1c20'; rr(g, -180, -12, 360, 24, 12); g.fill(); }); g.fillStyle = '#c9a66b'; g.fillRect(150, -12, 10, 24); g.restore();
  shadowed(g, () => { g.fillStyle = '#7a1d17'; rr(g, 1380, 1000, 180, 120, 10); g.fill(); }); g.fillStyle = '#b3261b'; rr(g, 1395, 1015, 150, 90, 6); g.fill();
  shadowed(g, () => { g.fillStyle = '#e6e2da'; g.beginPath(); g.arc(2720, 1420, 90, 0, 7); g.fill(); }); g.fillStyle = '#3b2412'; g.beginPath(); g.arc(2720, 1420, 72, 0, 7); g.fill();
  /* lamp: a cone of warm light from the banker's lamp at the top left, the rest of the room in shadow */
  g.save(); g.globalCompositeOperation = 'multiply'; const l = g.createRadialGradient(1300, 500, 300, 1500, 800, 1900); l.addColorStop(0, 'rgb(255,232,190)'); l.addColorStop(1, 'rgb(40,36,40)'); g.fillStyle = l; g.fillRect(0, 0, DESK_W, DESK_H); g.restore();
  /* the lamp itself, top-down: green shade and brass */
  shadowed(g, () => { g.fillStyle = '#b48a3c'; g.beginPath(); g.arc(140, 120, 80, 0, 7); g.fill(); }, 40, 20, 0.6); g.save(); g.translate(150, 210); g.rotate(-0.5); shadowed(g, () => { const sh = g.createLinearGradient(0, -70, 0, 70); sh.addColorStop(0, '#2f8a5e'); sh.addColorStop(0.5, '#1d6a46'); sh.addColorStop(1, '#0f3d28'); g.fillStyle = sh; rr(g, -230, -70, 460, 140, 60); g.fill(); }, 40, 24, 0.6); g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, -200, -56, 400, 26, 13); g.fill(); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, 900, 520, 1100, '255,200,130', 0.16); g.restore();
  steam(g, 2720, 1380, s.t, 0.8);
};

/* ---------------------------------------------------------------- 3 · a young person's desk (cool, night) */
export const YOU_W = 2600, YOU_H = 1600;
export const YOU_PHONE = { x: 1660, y: 900, r: 0.12, s: 0.58 };
export const youDesk = (g: G, s: { t: number; screen: Screen; glowA: number; buzz?: number }) => {
  g.fillStyle = '#2a2d33'; g.fillRect(0, 0, YOU_W, YOU_H); setSeed(31); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`; g.fillRect(rnd() * YOU_W, rnd() * YOU_H, 2 + rnd() * 30, 2); }
  /* laptop: keyboard deck and the screen's top edge */
  g.save(); g.translate(1000, 560); g.rotate(-0.05);
  shadowed(g, () => { g.fillStyle = '#b9bcc3'; rr(g, -560, -330, 1120, 700, 30); g.fill(); }, 40, 18, 0.5);
  g.fillStyle = '#9a9ea6'; rr(g, -560, -360, 1120, 60, 18); g.fill();
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { g.fillStyle = '#26282d'; rr(g, -470 + c * 72, -230 + r * 72, 60, 60, 8); g.fill(); }
  g.fillStyle = '#a8acb4'; rr(g, -200, 150, 400, 180, 14); g.fill(); g.restore();
  /* energy drink can, earbuds case, student card, sticky notes */
  shadowed(g, () => { g.fillStyle = '#d9dde3'; g.beginPath(); g.arc(2150, 360, 82, 0, 7); g.fill(); }); g.fillStyle = '#9aa0a8'; g.beginPath(); g.arc(2150, 360, 62, 0, 7); g.fill(); g.fillStyle = '#5b6068'; rr(g, 2120, 320, 50, 22, 10); g.fill();
  shadowed(g, () => { g.fillStyle = '#f4f5f7'; rr(g, 2060, 1180, 170, 140, 50); g.fill(); }); g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 3; g.beginPath(); g.moveTo(2065, 1230); g.lineTo(2225, 1230); g.stroke();
  g.save(); g.translate(560, 1260); g.rotate(-0.18); shadowed(g, () => { g.fillStyle = '#e9eef6'; rr(g, -210, -130, 420, 260, 16); g.fill(); }); g.fillStyle = '#2b5fa8'; rr(g, -210, -130, 420, 64, [16, 16, 0, 0] as any); g.fill(); txt(g, '学 生 证', 0, -84, 32, '#fff', { w: 700 }); g.fillStyle = '#c7cfdb'; rr(g, -180, -40, 120, 150, 8); g.fill(); g.fillStyle = 'rgba(40,50,70,.45)'; for (let k = 0; k < 4; k++) g.fillRect(-30, -20 + k * 36, 200 - k * 30, 10); g.restore();
  [[2350, 820, '#f7d84a', -0.1, '交作业 周五'], [2380, 1050, '#9be3c4', 0.08, '还花呗 ¥1,280']].forEach(([x, y, c, r, t]) => { g.save(); g.translate(x as number, y as number); g.rotate(r as number); shadowed(g, () => { g.fillStyle = c as string; g.fillRect(-120, -110, 240, 220); }, 16, 8, 0.35); txt(g, t as string, 0, 10, 28, '#333', { w: 700 }); g.restore(); });
  /* phone */
  g.save(); g.translate(YOU_PHONE.x, YOU_PHONE.y); g.rotate(YOU_PHONE.r); shadowed(g, () => { g.fillStyle = '#16171b'; rr(g, -145, -302, 290, 604, 40); g.fill(); }, 40, 18, 0.55); phone(g, 0, 0, YOU_PHONE.s, s.screen, { buzz: s.buzz }); g.restore();
  /* light: cold monitor wash from the top, a desk lamp off; the phone's glow */
  g.save(); g.globalCompositeOperation = 'multiply'; const v = g.createLinearGradient(0, 0, 0, YOU_H); v.addColorStop(0, 'rgb(170,190,230)'); v.addColorStop(1, 'rgb(50,56,76)'); g.fillStyle = v; g.fillRect(0, 0, YOU_W, YOU_H); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, 1000, -100, 1100, '120,160,255', 0.25); if (s.glowA > 0) glow(g, YOU_PHONE.x, YOU_PHONE.y, 600, '130,175,255', 0.35 * s.glowA); g.restore();
};
export { GOLD, INK, RED, SANS };

/* shared drawing helpers for the fans20k films */
export const W = 1920, H = 1080, FPS = 30;
export type G = CanvasRenderingContext2D;
export const SERIF = '"Noto Serif CJK SC"', SANS = '"Noto Sans CJK SC"', MONO = '"DejaVu Sans Mono"';
export const GOLD = '#f1c56d', INK = '#f3ede2', PAPER = '#f2e6cc', TAPE = '#5b3a22', RED = '#e2483d';
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, d: number) => clamp((t - a) / d);
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const back = (x: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export let seed = 1; export const setSeed = (v: number) => { seed = v; }; export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
export const txt = (g: G, s: string, x: number, y: number, size: number, col: string, o: { w?: number; f?: string; a?: CanvasTextAlign; glow?: string; alpha?: number } = {}) => {
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.font = `${o.w ?? 900} ${size}px ${o.f ?? SANS}`; g.textAlign = o.a ?? 'center'; g.fillStyle = col;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 28; } g.fillText(s, x, y); g.restore();
};
export const glow = (g: G, x: number, y: number, r: number, col: string, a: number) => { const b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(0.45, `rgba(${col},${a * 0.3})`); b.addColorStop(1, `rgba(${col},0)`); g.fillStyle = b; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
export const sub = (g: G, s: string, a: number) => { if (!s || a <= 0) return; g.save(); g.globalAlpha = a; g.font = `900 70px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(s, W / 2, H - 60); g.fillStyle = '#fbf7ee'; g.fillText(s, W / 2, H - 60); g.restore(); };
export const mark = (g: G) => txt(g, '◆ Juno · VIBE知识大赏', W - 56, 64, 22, 'rgba(243,237,226,.42)', { w: 500, a: 'right' });

/* ---------------------------------------------------------------- room */
export const room = (g: G) => {
  const b = g.createRadialGradient(W / 2, H * 0.45, 80, W / 2, H / 2, 1250); b.addColorStop(0, '#1d1814'); b.addColorStop(1, '#07060a'); g.fillStyle = b; g.fillRect(0, 0, W, H);
  seed = 4; g.fillStyle = 'rgba(255,230,190,.035)'; for (let y = 0; y < H; y += 26) for (let x = (y / 26) % 2 ? 13 : 0; x < W; x += 26) { const r = 2.2 * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.004 + y * 0.003))); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
};

/* ---------------------------------------------------------------- comic scroll */
export const roller = (g: G, x: number, cy: number, h: number) => {
  const b = g.createLinearGradient(x - 26, 0, x + 26, 0); b.addColorStop(0, '#3b2414'); b.addColorStop(0.45, '#9a6a3c'); b.addColorStop(1, '#2c1a0e'); g.fillStyle = b; rr(g, x - 24, cy - h / 2 - 20, 48, h + 40, 18); g.fill();
  g.fillStyle = '#c99a4a'; for (const s of [-1, 1]) { rr(g, x - 34, cy + s * (h / 2 + 20) - (s > 0 ? 0 : 26), 68, 26, 10); g.fill(); }
};
export const panel = (g: G, img: HTMLImageElement, x: number, y: number, w: number, rot: number) => {
  const h = (img.height / img.width) * w; g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot);
  g.fillStyle = '#111'; g.fillRect(-w / 2 + 10, -h / 2 + 10, w, h); g.drawImage(img, -w / 2, -h / 2, w, h); g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); return h;
};
export const feedColumn = (g: G, imgs: HTMLImageElement[], x: number, y0: number, w: number, off: number, s0: number) => {
  let total = 0; const hs = imgs.map((im) => (im.height / im.width) * w + 26); hs.forEach((h) => (total += h));
  let y = y0 - (off % total); seed = s0;
  for (let k = 0; k < 2; k++) imgs.forEach((im, i) => { const rot = (rnd() - 0.5) * 0.04; if (y > -400 && y < H + 50) panel(g, im, x, y, w, rot); y += hs[i]; });
};
export const paperStrip = (g: G, x0: number, x1: number, cy: number, h: number, brown: number) => {
  g.save(); g.fillStyle = `rgb(${lerp(242, 91, brown)},${lerp(230, 58, brown)},${lerp(204, 34, brown)})`; g.fillRect(x0, cy - h / 2, x1 - x0, h);
  if (brown < 0.5) { g.strokeStyle = '#111'; g.lineWidth = 6; g.strokeRect(x0 + 14, cy - h / 2 + 14, x1 - x0 - 28, h - 28);
    seed = 8; g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 260; i++) { const x = x0 + rnd() * (x1 - x0), y = cy - h / 2 + rnd() * h; if (Math.abs(y - cy) > h * 0.36) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } } }
  g.restore();
};
/* ---------------------------------------------------------------- cassette + deck */
export const reel = (g: G, x: number, y: number, r: number, ang: number, tapeR: number) => {
  g.fillStyle = TAPE; g.beginPath(); g.arc(x, y, tapeR, 0, 7); g.fill();
  g.fillStyle = '#f4f1ea'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = '#222'; for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.fillRect(-4, r * 0.35, 8, r * 0.45); } g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7); g.fill(); g.restore();
};
export const cassette = (g: G, cx: number, cy: number, s: number, ang: number, label: string, sideLabel = '', flipX = 1) => {
  g.save(); g.translate(cx, cy); g.scale(s * flipX, s);
  g.fillStyle = 'rgba(0,0,0,.4)'; rr(g, -280 + 14, -175 + 18, 560, 350, 26); g.fill();
  const b = g.createLinearGradient(0, -175, 0, 175); b.addColorStop(0, '#2a2a30'); b.addColorStop(1, '#141418'); g.fillStyle = b; rr(g, -280, -175, 560, 350, 26); g.fill();
  g.fillStyle = PAPER; rr(g, -240, -150, 480, 210, 12); g.fill(); g.fillStyle = RED; g.fillRect(-240, -150, 480, 34);
  g.save(); if (flipX < 0) g.scale(-1, 1);
  txt(g, sideLabel || 'SIDE A', -214, -124, 22, '#fff5e6', { w: 900, a: 'left', f: MONO });
  txt(g, label, 0, -64, 40, '#2a1c12', { f: SERIF });
  g.restore();
  g.strokeStyle = 'rgba(60,40,20,.3)'; g.lineWidth = 2; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(-210, -36 + i * 26); g.lineTo(210, -36 + i * 26); g.stroke(); }
  g.fillStyle = '#0c0c10'; rr(g, -170, -20, 340, 84, 40); g.fill();
  reel(g, -100, 22, 30, ang, 40); reel(g, 100, 22, 30, ang * 1.05, 34);
  g.fillStyle = '#0c0c10'; g.beginPath(); g.moveTo(-150, 175); g.lineTo(-120, 120); g.lineTo(120, 120); g.lineTo(150, 175); g.fill();
  g.fillStyle = '#555'; for (const [x, y] of [[-258, -154], [258, -154], [-258, 154], [258, 154]]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.restore();
};
export const vu = (g: G, x: number, y: number, w: number, h: number, v: number, label: string, val: string, hot: boolean) => {
  g.fillStyle = '#e9dfc4'; rr(g, x, y, w, h, 10); g.fill(); g.strokeStyle = '#2a2016'; g.lineWidth = 3; g.stroke();
  const cx = x + w / 2, cy = y + h - 18, R = h - 50;
  g.strokeStyle = '#2a2016'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.68, Math.PI * 1.85); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.15 + 0.07 * i); g.strokeStyle = '#2a2016'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14)); g.stroke(); }
  const a = Math.PI * (1.15 + 0.7 * v); g.strokeStyle = hot ? RED : '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6)); g.stroke();
  if (label) { txt(g, label, cx, y + h + 46, 34, INK, { w: 700 }); txt(g, val, cx, y + h + 104, 54, hot ? RED : GOLD, { f: SERIF }); }
};
export type DeckOpt = { cas?: number; ang: number; label: string; side?: string; counter: string; play: number; vuL?: number; vuR?: number; vuLabel?: [string, string, string, string]; hotR?: boolean; flip?: number; casLift?: number };
export const deck = (g: G, cx: number, cy: number, s: number, o: DeckOpt) => {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.5)'; rr(g, -690 + 20, -250 + 30, 1380, 500, 40); g.fill();
  const b = g.createLinearGradient(0, -250, 0, 250); b.addColorStop(0, '#4a4640'); b.addColorStop(0.5, '#2b2925'); b.addColorStop(1, '#1a1916'); g.fillStyle = b; rr(g, -690, -250, 1380, 500, 40); g.fill();
  g.strokeStyle = 'rgba(255,240,210,.06)'; g.lineWidth = 1; for (let y = -240; y < 240; y += 6) { g.beginPath(); g.moveTo(-680, y); g.lineTo(680, y); g.stroke(); }
  // window
  g.fillStyle = '#050506'; rr(g, -320, -210, 640, 400, 24); g.fill();
  if ((o.cas ?? 1) > 0) cassette(g, 0, -10 - (o.casLift ?? 0), 1, o.ang, o.label, o.side, o.flip ?? 1);
  g.fillStyle = 'rgba(180,200,230,.07)'; g.beginPath(); g.moveTo(-320, -210); g.lineTo(-120, -210); g.lineTo(-320, 60); g.fill();
  // VU meters
  vu(g, -650, -200, 290, 170, o.vuL ?? 0.15 + 0.05 * Math.sin(o.ang * 2), '', '', false);
  vu(g, 360, -200, 290, 170, o.vuR ?? 0.15 + 0.05 * Math.cos(o.ang * 2.3), '', '', !!o.hotR);
  // counter
  g.fillStyle = '#0a0a0a'; rr(g, -620, 30, 230, 80, 10); g.fill(); txt(g, o.counter, -505, 92, 60, '#f7e7b5', { f: MONO, w: 700, glow: 'rgba(247,231,181,.6)' });
  txt(g, 'COUNTER', -505, 140, 20, 'rgba(243,237,226,.5)', { f: MONO, w: 700 });
  // buttons
  const names = ['◀◀', '▶', '▶▶', '■', '⏏']; names.forEach((n, i) => {
    const x = -330 + i * 140, down = i === 1 ? o.play * 10 : 0, isPlay = i === 1;
    g.fillStyle = '#0d0c0b'; rr(g, x - 58, 212 - 8, 116, 52, 10); g.fill();
    g.fillStyle = isPlay && o.play > 0 ? '#3a3226' : '#3e3b36'; rr(g, x - 54, 200 + down - 8, 108, 46, 9); g.fill();
    txt(g, n, x, 236 + down - 8, 30, isPlay && o.play > 0 ? GOLD : INK, { f: SANS, w: 900 });
  });
  if (o.play > 0) glow(g, -190, 222, 120, '241,197,109', 0.35 * o.play);
  g.fillStyle = o.play > 0 ? RED : '#3a1210'; g.beginPath(); g.arc(560, 110, 12, 0, 7); g.fill(); if (o.play > 0) glow(g, 560, 110, 60, '226,72,61', 0.6);
  txt(g, 'PLAY', 520, 120, 22, 'rgba(243,237,226,.6)', { f: MONO, w: 700, a: 'right' });
  g.restore();
};

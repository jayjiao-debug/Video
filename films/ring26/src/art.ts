/* Art for 《谁打来的？》 (电话恐惧): one place, a bedroom desk at night, lit by a warm desk lamp (key) and cool
   moonlight through the window (rim); the phone's own screen is the third, story-driven light.
   Palette: night blue + lamp amber; gold = warm / answers (开心); magenta = the tightening (一紧, 陌生号码, 诈骗).
   Everything is a function of (x, y, scale); the set is parallax layers driven by a 2D camera. */
import { rnd, clamp, lerp } from './kit';

type G = CanvasRenderingContext2D;
export const W = 1920, H = 1080;
export const AMBER = '255,196,120', MOON = '140,180,255', MAGC = '255,110,205', GOLDC = '255,214,140', SCREEN = '205,220,255';

const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); (g as any).roundRect(x, y, w, h, r); };
export const glow = (g: G, x: number, y: number, r: number, a: number, col: string) => {
  if (a <= 0.001 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.4, `rgba(${col},${a * 0.35})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};
/** an elliptical glow (light pooled on a surface seen at an angle) */
export const pool = (g: G, x: number, y: number, rx: number, ry: number, a: number, col: string) => {
  if (a <= 0.001) return;
  g.save(); g.translate(x, y); g.scale(1, ry / rx); glow(g, 0, 0, rx, a, col); g.restore();
};

/* ------------------------------------------------------------------ camera */
export type Cam = { x: number; y: number; s: number };   // look-at offset (px) and zoom
/** apply the camera for a layer at depth p (0 = infinitely far, 1 = the desk, >1 = foreground) */
export const layer = (g: G, cam: Cam, p: number, fn: () => void) => {
  g.save();
  const s = 1 + (cam.s - 1) * p;
  g.translate(960, 560); g.scale(s, s); g.translate(-960 - cam.x * p, -560 - cam.y * p);
  fn(); g.restore();
};

/* ------------------------------------------------------------------ the room */
export type RoomOpt = { lamp?: number; moon?: number; screen?: number; screenCol?: string; screenX?: number; screenY?: number; dawn?: number };
const DESK = 700;   // y of the desk's back edge

const skyline = (g: G, T: number, x0: number, x1: number, y0: number, y1: number, dawn = 0) => {
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  const sky = g.createLinearGradient(0, y0, 0, y1);
  sky.addColorStop(0, dawn > 0.5 ? '#3a4a6a' : '#060b18'); sky.addColorStop(0.6, dawn > 0.5 ? '#9a8aa0' : '#101830'); sky.addColorStop(1, dawn > 0.5 ? '#f0b888' : '#18223a');
  g.fillStyle = sky; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  glow(g, x0 + (x1 - x0) * 0.78, y0 + 70, 120, 0.35 * (1 - dawn), '200,215,255');
  g.fillStyle = `rgba(235,240,255,${0.9 * (1 - dawn)})`; g.beginPath(); g.arc(x0 + (x1 - x0) * 0.78, y0 + 70, 16, 0, 6.3); g.fill();
  // two rows of towers, far (bluer) and near (darker), lit windows on a slow random flicker
  for (let row = 0; row < 2; row++) {
    let x = x0 - 20, i = row * 50;
    while (x < x1) {
      const w = 40 + 70 * rnd(i, 3 + row), h = (row ? 120 : 190) + (row ? 140 : 160) * rnd(i, 5 + row);
      const top = y1 - h + (row ? 30 : 0);
      g.fillStyle = row ? '#070a12' : '#0e1424'; g.fillRect(x, top, w, y1 - top);
      for (let wy = top + 12; wy < y1 - 8; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 12) {
        const k = rnd(wx * 0.37 + wy * 1.3, 9 + row);
        if (k < (row ? 0.16 : 0.22)) {
          const on = rnd(Math.floor(T * 0.4 + k * 30), wx + wy) > 0.06;
          if (on) { g.fillStyle = k < 0.07 ? 'rgba(160,190,255,.55)' : `rgba(255,${200 + 30 * rnd(wx, wy) | 0},140,${row ? 0.55 : 0.4})`; g.fillRect(wx, wy, 5, 7); }
        }
      }
      x += w + 6 + 20 * rnd(i, 7); i++;
    }
  }
  g.restore();
};

/** the back wall with the window (depth ~0.55) */
export const roomBack = (g: G, T: number, o: RoomOpt = {}) => {
  const moon = o.moon ?? 1, dawn = o.dawn ?? 0;
  const wall = g.createLinearGradient(0, 0, 0, DESK);
  wall.addColorStop(0, '#080b13'); wall.addColorStop(1, '#141a27');
  g.fillStyle = wall; g.fillRect(-400, -200, W + 800, DESK + 240);
  // faint wallpaper stripes
  g.fillStyle = 'rgba(255,255,255,.012)'; for (let x = -400; x < W + 400; x += 46) g.fillRect(x, -200, 2, DESK + 240);
  // window
  const wx = 170, wy = 150, ww = 600, wh = 470;
  skyline(g, T, wx, wx + ww, wy, wy + wh, dawn);
  // glass reflection
  add(g, () => { g.fillStyle = 'rgba(160,190,255,.035)'; g.beginPath(); g.moveTo(wx + 60, wy); g.lineTo(wx + 260, wy); g.lineTo(wx + 40, wy + wh); g.lineTo(wx - 160 + 60, wy + wh); g.closePath(); g.fill(); });
  // frame + mullions, moon-lit edges
  g.strokeStyle = '#05070c'; g.lineWidth = 22; g.strokeRect(wx, wy, ww, wh);
  g.lineWidth = 12; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.42); g.lineTo(wx + ww, wy + wh * 0.42); g.stroke();
  g.strokeStyle = `rgba(${MOON},${0.28 * moon})`; g.lineWidth = 2;
  g.beginPath(); g.moveTo(wx + 11, wy + wh - 11); g.lineTo(wx + 11, wy + 11); g.lineTo(wx + ww - 11, wy + 11); g.stroke();
  // sill
  g.fillStyle = '#0b0f19'; g.fillRect(wx - 40, wy + wh + 8, ww + 80, 22);
  g.fillStyle = `rgba(${MOON},${0.22 * moon})`; g.fillRect(wx - 40, wy + wh + 8, ww + 80, 2);
  // curtain, left of the window
  for (let k = 0; k < 7; k++) {
    const x = wx - 150 + k * 26, gr = g.createLinearGradient(x, 0, x + 26, 0);
    gr.addColorStop(0, '#0a0d16'); gr.addColorStop(0.5, k % 2 ? '#1a2033' : '#141a2a'); gr.addColorStop(1, '#0a0d16');
    g.fillStyle = gr; g.fillRect(x, wy - 70, 27, wh + 160);
  }
  g.fillStyle = `rgba(${MOON},${0.12 * moon})`; g.fillRect(wx - 150 + 6 * 26 + 22, wy - 70, 3, wh + 160);
  g.fillStyle = '#05070c'; g.fillRect(wx - 200, wy - 82, ww + 300, 12);   // rail
  // a framed print on the right wall, caught by the lamp
  const px = 1240, py = 210;
  g.fillStyle = '#07090f'; g.fillRect(px, py, 230, 290);
  g.fillStyle = '#1b2232'; g.fillRect(px + 16, py + 16, 198, 258);
  g.strokeStyle = 'rgba(255,196,120,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 30, py + 220); g.bezierCurveTo(px + 80, py + 120, px + 140, py + 200, px + 200, py + 90); g.stroke();
  glow(g, px + 150, py + 100, 26, 0.3, AMBER);
  if (dawn > 0) add(g, () => { glow(g, wx + ww * 0.6, wy + wh * 0.8, 900, 0.16 * dawn, '255,190,140'); });
  // lamp light on the wall (key) and moon falloff
  add(g, () => { glow(g, 1560, 520, 620, 0.10 * (o.lamp ?? 1), AMBER); });
  // screen light thrown up the wall / ceiling (story light)
  if ((o.screen ?? 0) > 0) add(g, () => glow(g, o.screenX ?? 960, (o.screenY ?? 820) - 360, 720, 0.16 * (o.screen ?? 0), o.screenCol ?? SCREEN));
};

/** the desk top (depth 1): wood in perspective, the lamp, props. The phone is drawn separately (it acts). */
export const deskTop = (g: G, T: number, o: RoomOpt = {}) => {
  const lamp = o.lamp ?? 1;
  // desk surface
  const top = g.createLinearGradient(0, DESK, 0, H + 200);
  top.addColorStop(0, '#2b1d14'); top.addColorStop(0.35, '#1d130d'); top.addColorStop(1, '#0b0705');
  g.fillStyle = top; g.fillRect(-500, DESK, W + 1000, H + 400 - DESK);
  // back edge highlight
  g.fillStyle = `rgba(${AMBER},${0.18 * lamp})`; g.fillRect(-500, DESK, W + 1000, 2);
  // wood grain converging to a vanishing point above
  g.save(); g.beginPath(); g.rect(-500, DESK, W + 1000, H + 400); g.clip();
  g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.5;
  for (let k = -30; k <= 30; k++) { g.beginPath(); g.moveTo(960 + k * 80, DESK); g.lineTo(960 + k * 360, H + 400); g.stroke(); }
  g.strokeStyle = 'rgba(255,190,130,.025)';
  for (let k = -30; k <= 30; k++) { g.beginPath(); g.moveTo(960 + k * 80 + 30, DESK); g.lineTo(960 + k * 360 + 120, H + 400); g.stroke(); }
  g.restore();
  // lamp pool on the desk (key light)
  add(g, () => pool(g, 1330, 830, 720, 210, 0.3 * lamp, AMBER));
  // moon spill across the front-left of the desk
  add(g, () => pool(g, 420, 800, 520, 120, 0.06 * (o.moon ?? 1), MOON));
  // screen light on the desk around the phone
  if ((o.screen ?? 0) > 0) add(g, () => pool(g, o.screenX ?? 960, (o.screenY ?? 820) + 10, 520, 150, 0.38 * (o.screen ?? 0), o.screenCol ?? SCREEN));
  // props
  books(g, 330, 790, 1, lamp);
  mug(g, 1210, 800, 1, T, lamp);
  deskLamp(g, 1560, 770, 1, lamp);
};

/** foreground (depth ~1.4): out-of-focus desk edge and a pen, for parallax */
export const roomFront = (g: G, o: RoomOpt = {}) => {
  g.save(); g.filter = 'blur(10px)';
  const e = g.createLinearGradient(0, 990, 0, 1100); e.addColorStop(0, '#120b07'); e.addColorStop(1, '#050302');
  g.fillStyle = e; g.fillRect(-500, 1000, W + 1000, 200);
  g.fillStyle = `rgba(${AMBER},${0.25 * (o.lamp ?? 1)})`; g.fillRect(-500, 1000, W + 1000, 3);
  // pen
  g.translate(1700, 1010); g.rotate(-0.12); g.fillStyle = '#1a1716'; rr(g, -240, -12, 300, 24, 12); g.fill();
  g.fillStyle = `rgba(${AMBER},.35)`; g.fillRect(-230, -10, 280, 3);
  g.restore();
};

/* ------------------------------------------------------------------ props */
export const books = (g: G, x: number, y: number, s: number, lit = 1) => {
  const cols = ['#3a2a3c', '#24344a', '#4a3424', '#2c3a32'];
  let yy = y;
  for (let i = 0; i < 4; i++) {
    const w = (230 - i * 14 + 18 * rnd(i, 2)) * s, h = (30 + 6 * rnd(i, 3)) * s, dx = (rnd(i, 4) - 0.5) * 30 * s;
    g.fillStyle = cols[i]; rr(g, x - w / 2 + dx, yy - h, w, h, 4 * s); g.fill();
    g.fillStyle = 'rgba(240,230,210,.55)'; g.fillRect(x - w / 2 + dx + w - 10 * s, yy - h + 4 * s, 7 * s, h - 8 * s);   // page edge
    g.fillStyle = `rgba(${MOON},${0.25})`; g.fillRect(x - w / 2 + dx, yy - h, w, 1.5);
    yy -= h + 1;
  }
};

export const mug = (g: G, x: number, y: number, s: number, T: number, lit = 1) => {
  const w = 96 * s, h = 112 * s;
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(x + 14 * s, y + 4 * s, w * 0.7, 12 * s, 0, 0, 6.3); g.fill();
  const b = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  b.addColorStop(0, '#2a2e3a'); b.addColorStop(0.55, '#5a5f6c'); b.addColorStop(0.8, `rgba(${AMBER},.9)`); b.addColorStop(1, '#3a3430');
  g.fillStyle = b; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y - h); g.lineTo(x + w / 2 - 4 * s, y - 6 * s); g.quadraticCurveTo(x, y + 6 * s, x - w / 2 + 4 * s, y - 6 * s); g.closePath(); g.fill();
  g.strokeStyle = '#3f3a36'; g.lineWidth = 14 * s; g.beginPath(); g.arc(x + w / 2 + 4 * s, y - h * 0.55, 24 * s, -1.2, 1.2); g.stroke();
  g.fillStyle = '#16100c'; g.beginPath(); g.ellipse(x, y - h, w / 2, 11 * s, 0, 0, 6.3); g.fill();
  g.strokeStyle = 'rgba(255,220,180,.45)'; g.lineWidth = 2; g.stroke();
  // steam: three slow wisps on their own clock
  add(g, () => {
    for (let k = 0; k < 3; k++) {
      const ph = (T * 0.35 + k / 3) % 1;
      g.strokeStyle = `rgba(255,236,215,${0.12 * Math.sin(ph * Math.PI)})`; g.lineWidth = 6 * s; g.lineCap = 'round';
      g.beginPath();
      for (let j = 0; j <= 16; j++) { const q = j / 16, yy = y - h - 10 * s - (q * 150 + ph * 60) * s, xx = x + (k - 1) * 18 * s + Math.sin(q * 5 + T * 1.3 + k * 2) * 14 * s * q; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      g.stroke();
    }
  });
};

export const deskLamp = (g: G, x: number, y: number, s: number, lit = 1) => {
  // base
  g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(x, y + 4 * s, 110 * s, 18 * s, 0, 0, 6.3); g.fill();
  const bs = g.createLinearGradient(x - 90 * s, 0, x + 90 * s, 0); bs.addColorStop(0, '#16161a'); bs.addColorStop(0.4, '#3a3a40'); bs.addColorStop(1, '#101014');
  g.fillStyle = bs; g.beginPath(); g.ellipse(x, y - 8 * s, 90 * s, 20 * s, 0, 0, 6.3); g.fill();
  // arm: up to an elbow behind, then forward and over to the head
  const el: [number, number] = [x + 60 * s, y - 300 * s], hd: [number, number] = [x - 150 * s, y - 380 * s];
  g.strokeStyle = '#24242a'; g.lineWidth = 11 * s; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x, y - 16 * s); g.lineTo(el[0], el[1]); g.lineTo(hd[0], hd[1]); g.stroke();
  g.strokeStyle = `rgba(${AMBER},${0.3 * lit})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4 * s, y - 16 * s); g.lineTo(el[0] - 4 * s, el[1] + 4 * s); g.lineTo(hd[0], hd[1] + 5 * s); g.stroke();
  g.fillStyle = '#2e2e34'; g.beginPath(); g.arc(el[0], el[1], 12 * s, 0, 6.3); g.fill();
  // shade: a cone hanging from the head, mouth facing down onto the desk
  const ang = 0.32;
  g.save(); g.translate(hd[0], hd[1]); g.rotate(ang);
  const sh = g.createLinearGradient(-90 * s, 0, 90 * s, 0); sh.addColorStop(0, '#120e0b'); sh.addColorStop(0.55, '#4a3a2c'); sh.addColorStop(1, '#100c09');
  g.fillStyle = sh; g.beginPath(); g.moveTo(-26 * s, -16 * s); g.lineTo(26 * s, -16 * s); g.lineTo(92 * s, 120 * s); g.lineTo(-92 * s, 120 * s); g.closePath(); g.fill();
  g.fillStyle = '#3a2e24'; g.beginPath(); g.ellipse(0, -16 * s, 26 * s, 7 * s, 0, 0, 6.3); g.fill();
  // the lit lip of the mouth (seen from slightly above, so only a sliver of the inside shows)
  g.fillStyle = `rgba(255,232,185,${0.95 * lit})`; g.beginPath(); g.ellipse(0, 120 * s, 92 * s, 12 * s, 0, 0, Math.PI); g.fill();
  add(g, () => glow(g, 0, 132 * s, 220 * s, 0.55 * lit, AMBER));
  g.restore();
  // light cone from the mouth onto the desk
  add(g, () => {
    const mx = hd[0] - Math.sin(ang) * 120 * s, my = hd[1] + Math.cos(ang) * 120 * s;
    const gr = g.createLinearGradient(0, my, 0, y + 60 * s);
    gr.addColorStop(0, `rgba(${AMBER},${0.2 * lit})`); gr.addColorStop(1, `rgba(${AMBER},0.03)`);
    g.filter = `blur(${22 * s}px)`;
    g.fillStyle = gr; g.beginPath(); g.moveTo(mx - 86 * s, my); g.lineTo(mx + 86 * s, my); g.lineTo(mx + 260 * s, y + 60 * s); g.lineTo(mx - 420 * s, y + 60 * s); g.closePath(); g.fill();
  });
};

/** a generic phone lying flat on the desk, seen from ~30° above.
 *  flip: 0 = face down, 1 = face up (turns about its long axis, lifting off the desk mid-turn).
 *  light: the screen's glow (face up) or the light leaking round its edges (face down). buzz: 0..1 vibration amount. */
export const phoneFlat = (g: G, x: number, y: number, s: number, flip: number, light = 0, T = 0, buzz = 0, screenCol = SCREEN) => {
  const L = 330 * s, Wd = 160 * s, R = 26 * s, tilt = 0.42, rot = -0.1;
  const th = Math.PI * (1 - clamp(flip)), c = Math.cos(th), lift = Math.sin(th) * 70 * s;
  const jx = buzz * (Math.sin(T * 190) * 2.4 + Math.sin(T * 123) * 1.6) * s, jy = buzz * Math.sin(T * 157) * 1.2 * s;
  // contact shadow and leaked light on the desk
  g.save(); g.translate(x, y); g.scale(1, tilt); g.rotate(rot);
  g.fillStyle = `rgba(0,0,0,${0.55 - 0.25 * Math.sin(th)})`; g.beginPath(); g.ellipse(10 * s, 16 * s, L * 0.62, Wd * 0.7, 0, 0, 6.3); g.fill();
  g.restore();
  if (light > 0 && c <= 0) add(g, () => pool(g, x, y + 4 * s, L * 0.95, L * 0.34, 0.6 * light, screenCol));   // face down: light escapes at the edges
  // the body
  g.save(); g.translate(x + jx, y + jy - lift); g.scale(1, tilt); g.rotate(rot); g.scale(1, Math.max(0.03, Math.abs(c)));
  const faceUp = c > 0;
  const body = g.createLinearGradient(-L / 2, -Wd / 2, L / 2, Wd / 2);
  body.addColorStop(0, '#34343c'); body.addColorStop(0.5, '#15151a'); body.addColorStop(1, '#060608');
  // side thickness (drawn as an offset darker slab)
  g.fillStyle = '#050506'; rr(g, -L / 2, -Wd / 2 + 9 * s, L, Wd, R); g.fill();
  g.fillStyle = body; rr(g, -L / 2, -Wd / 2, L, Wd, R); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1.5; g.stroke();
  if (faceUp) {
    const sc = g.createLinearGradient(-L / 2, 0, L / 2, 0);
    sc.addColorStop(0, `rgba(${screenCol},${0.25 + 0.65 * light})`); sc.addColorStop(1, `rgba(${screenCol},${0.15 + 0.5 * light})`);
    g.fillStyle = light > 0 ? sc : '#07080c'; rr(g, -L / 2 + 8 * s, -Wd / 2 + 8 * s, L - 16 * s, Wd - 16 * s, R * 0.7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(-L / 2 + 12 * s, -Wd / 2 + 10 * s); g.lineTo(-L * 0.05, -Wd / 2 + 10 * s); g.lineTo(-L * 0.3, Wd / 2 - 10 * s); g.lineTo(-L / 2 + 12 * s, Wd / 2 - 10 * s); g.closePath(); g.fill();
  } else {
    // camera island
    g.fillStyle = '#0b0b0e'; rr(g, -L / 2 + 16 * s, -Wd / 2 + 16 * s, 64 * s, 64 * s, 16 * s); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.stroke();
    [[34, 34], [62, 34], [34, 62]].forEach(([a, b]) => { g.fillStyle = '#1b1e28'; g.beginPath(); g.arc(-L / 2 + a * s, -Wd / 2 + b * s, 10 * s, 0, 6.3); g.fill(); g.fillStyle = 'rgba(150,180,255,.35)'; g.beginPath(); g.arc(-L / 2 + (a - 3) * s, -Wd / 2 + (b - 3) * s, 3.5 * s, 0, 6.3); g.fill(); });
    g.strokeStyle = `rgba(${AMBER},.28)`; g.lineWidth = 2; g.beginPath(); g.moveTo(-L / 2 + R, -Wd / 2 + 1); g.lineTo(L / 2 - R, -Wd / 2 + 1); g.stroke();
  }
  g.restore();
  if (faceUp && light > 0) add(g, () => glow(g, x, y - lift - 20 * s, 420 * s, 0.32 * light, screenCol));
  // vibration marks: short arcs either side, only while buzzing
  if (buzz > 0.05) add(g, () => {
    g.strokeStyle = `rgba(255,255,255,${0.35 * buzz})`; g.lineWidth = 3 * s; g.lineCap = 'round';
    for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { const r = (L * 0.56 + k * 22 * s); g.beginPath(); g.ellipse(x, y - lift, r, r * tilt, 0, sd > 0 ? -0.35 : Math.PI - 0.35, sd > 0 ? 0.35 : Math.PI + 0.35); g.stroke(); }
  });
};

/** the caller card that floats up out of the phone (no app UI: a plain glass card, avatar circle, a name) */
export const callerCard = (g: G, x: number, y: number, name: string, a: number, hot = 0, s = 1, col = MAGC) => {
  if (a <= 0) return;
  const w = 560 * s, h = 150 * s;
  g.save(); g.globalAlpha *= a;
  add(g, () => glow(g, x, y, w * 0.8, 0.25 * hot, col));
  const body = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); body.addColorStop(0, 'rgba(32,30,42,.92)'); body.addColorStop(1, 'rgba(12,11,18,.92)');
  g.fillStyle = body; rr(g, x - w / 2, y - h / 2, w, h, 28 * s); g.fill();
  g.strokeStyle = hot ? `rgba(${col},${0.5 + 0.5 * hot})` : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  const ax = x - w / 2 + 86 * s;
  g.fillStyle = hot ? `rgba(${col},.32)` : 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(ax, y, 46 * s, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(ax, y - 10 * s, 15 * s, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(ax, y + 23 * s, 25 * s, 15 * s, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#f3ede2'; g.font = `900 ${66 * s}px "Noto Sans CJK SC"`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(name, x - w / 2 + 166 * s, y + 2 * s);
  g.restore();
};

/** studio ON AIR lamp: what a phone call feels like (live, no undo) */
export const onAir = (g: G, x: number, y: number, s: number, on: number) => {
  const w = 300 * s, h = 110 * s;
  g.fillStyle = '#0b0b0d'; rr(g, x - w / 2 - 14 * s, y - h / 2 - 14 * s, w + 28 * s, h + 28 * s, 18 * s); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
  const gl = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  gl.addColorStop(0, on > 0.05 ? `rgba(255,${90 + 60 * on | 0},${80 + 40 * on | 0},${0.55 + 0.45 * on})` : '#2a1414'); gl.addColorStop(1, on > 0.05 ? `rgba(200,40,50,${0.6 + 0.4 * on})` : '#1a0c0c');
  g.fillStyle = gl; rr(g, x - w / 2, y - h / 2, w, h, 10 * s); g.fill();
  g.fillStyle = on > 0.05 ? `rgba(255,245,235,${0.6 + 0.4 * on})` : 'rgba(120,70,70,.6)';
  g.font = `700 ${62 * s}px "Cormorant Garamond"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ON  AIR', x, y + 4 * s);
  if (on > 0) add(g, () => glow(g, x, y, 420 * s, 0.35 * on, '255,80,80'));
};

/** a message bubble: typing dots, or text being written (chars: how many characters are visible) */
export const bubble = (g: G, x: number, y: number, s: number, text: string, chars: number, mine = true, a = 1, T = 0) => {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  g.font = `500 ${40 * s}px "Noto Sans CJK SC"`;
  const shown = text.slice(0, Math.max(0, Math.floor(chars)));
  const tw = shown ? g.measureText(shown).width : 90 * s, w = Math.max(150 * s, tw + 64 * s), h = 84 * s;
  const x0 = mine ? x - w : x;
  g.fillStyle = mine ? 'rgba(240,220,180,.95)' : 'rgba(60,62,74,.95)'; rr(g, x0, y - h / 2, w, h, 30 * s); g.fill();
  g.beginPath(); if (mine) { g.moveTo(x - 24 * s, y + h / 2 - 16 * s); g.lineTo(x + 12 * s, y + h / 2 + 6 * s); g.lineTo(x - 2 * s, y + h / 2 - 34 * s); } else { g.moveTo(x + 24 * s, y + h / 2 - 16 * s); g.lineTo(x - 12 * s, y + h / 2 + 6 * s); g.lineTo(x + 2 * s, y + h / 2 - 34 * s); } g.fill();
  if (shown) { g.fillStyle = mine ? '#2a1e10' : '#eee'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(shown, x0 + 32 * s, y + 2 * s);
    // caret
    if (Math.floor(T * 2.2) % 2 === 0) { g.fillStyle = mine ? '#2a1e10' : '#eee'; g.fillRect(x0 + 34 * s + tw, y - 22 * s, 3 * s, 44 * s); } }
  else for (let k = 0; k < 3; k++) { const b = 0.5 + 0.5 * Math.sin(T * 7 - k * 0.9); g.fillStyle = `rgba(42,30,16,${0.35 + 0.5 * b})`; g.beginPath(); g.arc(x0 + w / 2 + (k - 1) * 30 * s, y - 6 * b * s, 9 * s, 0, 6.3); g.fill(); }
  g.restore();
};

/** an old telephone handset (the 'call' side of the experiment): a curved grip with an ear cup and a mouth cup */
export const handset = (g: G, x: number, y: number, s: number, rot = -0.2, lit = 1) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const gr = g.createLinearGradient(0, -110, 0, 60); gr.addColorStop(0, '#45454e'); gr.addColorStop(0.4, '#1a1a20'); gr.addColorStop(1, '#060608');
  // grip
  g.strokeStyle = '#0d0d11'; g.lineWidth = 50; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-118, -38); g.quadraticCurveTo(0, -112, 118, -38); g.stroke();
  g.strokeStyle = gr; g.lineWidth = 44; g.stroke();
  g.strokeStyle = `rgba(${AMBER},${0.45 * lit})`; g.lineWidth = 3; g.beginPath(); g.moveTo(-110, -60); g.quadraticCurveTo(0, -132, 110, -60); g.stroke();
  // cups
  for (const cx of [-132, 132]) {
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 36, -52); g.lineTo(cx + 36, -52); g.lineTo(cx + 62, 34); g.lineTo(cx - 62, 34); g.closePath(); g.fill();
    g.fillStyle = '#0a0a0d'; g.beginPath(); g.ellipse(cx, 34, 62, 17, 0, 0, 6.3); g.fill();
    g.strokeStyle = `rgba(${AMBER},${0.4 * lit})`; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = '#1e1e24'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(cx + (k - 2) * 16, 34 + (k % 2 ? 4 : -3), 3.5, 0, 6.3); g.fill(); }
  }
  g.restore();
};

/** an envelope (the 'write' side of the experiment) */
export const envelope = (g: G, x: number, y: number, s: number, rot = 0.08, lit = 1) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const w = 300, h = 190;
  const p = g.createLinearGradient(0, -h / 2, 0, h / 2); p.addColorStop(0, '#efe4cc'); p.addColorStop(1, '#bfae8c');
  g.fillStyle = p; g.fillRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = 'rgba(80,60,30,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(0, 16); g.lineTo(w / 2, -h / 2); g.moveTo(-w / 2, h / 2); g.lineTo(-30, -4); g.moveTo(w / 2, h / 2); g.lineTo(30, -4); g.stroke();
  g.fillStyle = '#a8782f'; g.beginPath(); g.arc(0, 16, 20, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(255,230,170,.6)'; g.beginPath(); g.arc(-5, 11, 6, 0, 6.3); g.fill();
  g.restore();
};

/** an analog dial with two needles: predicted (magenta) and actual (gold). values 0..1 */
export const gauge = (g: G, x: number, y: number, s: number, label: string, pred: number, actual: number, aPred = 1, aAct = 1) => {
  const r = 230 * s, a0 = Math.PI * 1.1, a1 = Math.PI * 1.9;
  g.fillStyle = '#0c0b10'; g.beginPath(); g.arc(x, y, r + 26 * s, Math.PI, 0); g.lineTo(x + r + 26 * s, y + 40 * s); g.lineTo(x - r - 26 * s, y + 40 * s); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.stroke();
  const face = g.createRadialGradient(x, y, 0, x, y, r); face.addColorStop(0, '#efe4cc'); face.addColorStop(1, '#c9b892');
  g.fillStyle = face; g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.closePath(); g.fill();
  // red zone
  g.strokeStyle = 'rgba(200,60,110,.55)'; g.lineWidth = 18 * s; g.beginPath(); g.arc(x, y, r - 30 * s, lerp(a0, a1, 0.7), a1); g.stroke();
  for (let k = 0; k <= 20; k++) { const a = lerp(a0, a1, k / 20), l = k % 5 ? 14 : 28; g.strokeStyle = '#2a2016'; g.lineWidth = k % 5 ? 2 : 4; g.beginPath(); g.moveTo(x + Math.cos(a) * (r - 10 * s), y + Math.sin(a) * (r - 10 * s)); g.lineTo(x + Math.cos(a) * (r - (10 + l) * s), y + Math.sin(a) * (r - (10 + l) * s)); g.stroke(); }
  g.fillStyle = '#2a2016'; g.font = `700 ${46 * s}px "Noto Sans CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x, y - r * 0.38);
  const needle = (v: number, col: string, al: number) => {
    if (al <= 0) return; const a = lerp(a0, a1, clamp(v));
    g.save(); g.globalAlpha *= al; g.strokeStyle = col; g.lineWidth = 7 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - Math.cos(a) * 24 * s, y - Math.sin(a) * 24 * s); g.lineTo(x + Math.cos(a) * (r - 34 * s), y + Math.sin(a) * (r - 34 * s)); g.stroke(); g.restore();
  };
  needle(pred, '#d23c8c', aPred); needle(actual, '#b8862e', aAct);
  g.fillStyle = '#1a1612'; g.beginPath(); g.arc(x, y, 16 * s, 0, 6.3); g.fill();
};

/** split-flap number board; `text` per tile, `flip` 0..1 per tile animates the top flap falling */
export const flapBoard = (g: G, x: number, y: number, s: number, text: string, flips: number[] = [], col = '#f3ede2') => {
  const tw = 150 * s, th = 200 * s, gap = 14 * s, n = text.length, x0 = x - (n * tw + (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    const tx = x0 + i * (tw + gap), f = flips[i] ?? 1;
    g.fillStyle = '#111116'; rr(g, tx, y - th / 2, tw, th, 12 * s); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
    g.save(); g.beginPath(); rr(g, tx, y - th / 2, tw, th, 12 * s); g.clip();
    g.fillStyle = col; g.font = `900 ${132 * s}px "Noto Sans CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const ch = text[i];
    g.save(); g.translate(tx + tw / 2, y + 6 * s); if (f < 1) g.scale(1, Math.abs(Math.cos(f * Math.PI))); g.fillText(ch, 0, 0); g.restore();
    g.restore();
    g.fillStyle = '#000'; g.fillRect(tx, y - 2 * s, tw, 4 * s);   // the split
    g.fillStyle = '#2a2a30'; g.fillRect(tx - 4 * s, y - 10 * s, 8 * s, 20 * s); g.fillRect(tx + tw - 4 * s, y - 10 * s, 8 * s, 20 * s);
  }
};

/** a desk calendar page with one slot booked (约好的电话) */
export const calendar = (g: G, x: number, y: number, s: number, slot = '20:00', label = '通话', a = 1, hot = 0) => {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-150, -170, 320, 360);
  const p = g.createLinearGradient(0, -180, 0, 180); p.addColorStop(0, '#f1e7d2'); p.addColorStop(1, '#cdbd9c');
  g.fillStyle = p; g.fillRect(-160, -180, 320, 360);
  g.fillStyle = '#a8782f'; g.fillRect(-160, -180, 320, 54);
  g.fillStyle = '#1c140c'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(-120 + k * 48, -180, 8, 0, 6.3); g.fill(); }
  g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 2;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-140, -90 + k * 56); g.lineTo(140, -90 + k * 56); g.stroke(); }
  g.fillStyle = hot ? `rgba(255,200,110,${0.55 + 0.4 * hot})` : 'rgba(255,200,110,.55)'; g.fillRect(-140, -90 + 2 * 56 + 4, 280, 48);
  g.fillStyle = '#2a1e10'; g.font = '700 34px "JunoMono"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(slot, -126, -90 + 2 * 56 + 29);
  g.font = '700 34px "Noto Sans CJK SC"'; g.fillText(label, 10, -90 + 2 * 56 + 29);
  g.restore();
};

/** three bars, 'connection' by medium (qualitative, labelled 示意) */
export const bars3 = (g: G, x: number, y: number, s: number, v: [number, number, number], labels = ['打字', '视频', '语音'], cols = ['160,160,172', GOLDC, GOLDC]) => {
  const bw = 120 * s, gap = 70 * s, hmax = 360 * s, x0 = x - (3 * bw + 2 * gap) / 2;
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 30 * s, y); g.lineTo(x0 + 3 * bw + 2 * gap + 30 * s, y); g.stroke();
  for (let i = 0; i < 3; i++) {
    const bx = x0 + i * (bw + gap), h = hmax * clamp(v[i]);
    const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, `rgba(${cols[i]},.95)`); gr.addColorStop(1, `rgba(${cols[i]},.35)`);
    g.fillStyle = gr; rr(g, bx, y - h, bw, h, 10 * s); g.fill();
    g.fillStyle = '#efe8da'; g.font = `700 ${46 * s}px "Noto Sans CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(labels[i], bx + bw / 2, y + 18 * s);
  }
};

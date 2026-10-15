/* 《差一分钱》 props, drawn in code: a case desk seen from above under a warm lamp, and the objects that carry the story
   (price tags, sorting trays, digits with value bars, a mechanical odometer, a price-cliff chart on graph paper, a
   catalogue page, a desk calendar, two patient charts). Palette: walnut + lamp amber, paper cream, ink, gold for the
   answer, magenta for the trap. */
import { rnd, lerp, clamp } from './kit';

type G = CanvasRenderingContext2D;
export const W = 1920, H = 1080;
export const INK = '#2a2016', PAPER = '#efe6d2', GOLD = '241,197,109', MAG = '255,110,205', AMB = '255,190,120';
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); (g as any).roundRect(x, y, w, h, r); };
const shadow = (g: G, blur: number, dy: number, a = 0.55) => { g.shadowColor = `rgba(0,0,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = dy; g.shadowOffsetX = dy * 0.4; };
const noShadow = (g: G) => { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = g.shadowOffsetY = 0; };

/** overhead walnut desk with a warm lamp pool (lx, ly) and a soft vignette */
export const desk = (g: G, lx = 760, ly = 420, lamp = 1) => {
  g.fillStyle = '#120b08'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) {
    const y = i * 120 - 30, c = 16 + 7 * rnd(i, 2);
    g.fillStyle = `rgb(${c + 16},${c + 6},${c - 3})`; g.fillRect(0, y, W, 118);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, y + 117, W, 3);
    g.strokeStyle = 'rgba(255,200,150,.04)'; g.lineWidth = 1.2;
    for (let k = 0; k < 13; k++) { const yy = y + 6 + k * 9 + 3 * rnd(i, k); g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= W; x += 96) g.lineTo(x, yy + Math.sin(x * 0.0045 + k * 1.7 + i) * 3.2); g.stroke(); }
    // a knot here and there
    if (rnd(i, 9) > 0.6) { const kx = 200 + 1500 * rnd(i, 10); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let r = 4; r < 22; r += 5) { g.beginPath(); g.ellipse(kx, y + 60, r * 2.4, r * 0.7, 0, 0, 6.3); g.stroke(); } }
  }
  g.save(); g.globalCompositeOperation = 'lighter';
  const p = g.createRadialGradient(lx, ly, 30, lx + 80, ly + 80, 1050);
  p.addColorStop(0, `rgba(255,190,120,${0.34 * lamp})`); p.addColorStop(0.45, `rgba(255,170,100,${0.11 * lamp})`); p.addColorStop(1, 'rgba(255,160,90,0)');
  g.fillStyle = p; g.fillRect(0, 0, W, H); g.restore();
  const v = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.7)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
};

/** a manila price tag with a string, rotated; text drawn in heavy serif. flip 0..1 turns it over on its long axis */
export const tag = (g: G, x: number, y: number, s: number, rot: number, text: string, opts: { cur?: string; flip?: number; col?: string; sub?: string; strike?: boolean } = {}) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * Math.max(0.02, Math.abs(Math.cos((opts.flip ?? 0) * Math.PI))), s);
  g.font = '900 118px "Noto Serif CJK SC"'; const tw = g.measureText(text).width;
  const w = Math.max(360, tw + 190), h = 200;
  // string
  g.strokeStyle = 'rgba(230,220,200,.75)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-w / 2 + 34, 0); g.bezierCurveTo(-w / 2 - 60, -40, -w / 2 - 120, 60, -w / 2 - 220, 20); g.stroke();
  shadow(g, 26, 10);
  const p = g.createLinearGradient(0, -h / 2, 0, h / 2); p.addColorStop(0, '#e9d3a6'); p.addColorStop(1, '#cdb07a');
  g.fillStyle = p; g.beginPath();
  g.moveTo(-w / 2 + 50, -h / 2); g.lineTo(w / 2 - 14, -h / 2); g.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 14); g.lineTo(w / 2, h / 2 - 14); g.quadraticCurveTo(w / 2, h / 2, w / 2 - 14, h / 2);
  g.lineTo(-w / 2 + 50, h / 2); g.lineTo(-w / 2, 40); g.lineTo(-w / 2, -40); g.closePath(); g.fill();
  noShadow(g);
  // reinforced hole
  g.fillStyle = '#b9975e'; g.beginPath(); g.arc(-w / 2 + 34, 0, 16, 0, 6.3); g.fill();
  g.fillStyle = '#1a110b'; g.beginPath(); g.arc(-w / 2 + 34, 0, 8, 0, 6.3); g.fill();
  // paper fibre
  g.strokeStyle = 'rgba(120,90,50,.08)'; g.lineWidth = 1; for (let k = 0; k < 30; k++) { const yy = -h / 2 + 6 + k * 6.4; g.beginPath(); g.moveTo(-w / 2 + 50, yy); g.lineTo(w / 2, yy + 2 * Math.sin(k)); g.stroke(); }
  // price
  g.fillStyle = opts.col ?? INK; g.textBaseline = 'middle';
  const tx = -w / 2 + 120;
  g.font = '700 54px "Noto Serif CJK SC"'; g.textAlign = 'right'; g.fillText(opts.cur ?? '¥', tx - 4, 10);
  g.font = '900 118px "Noto Serif CJK SC"'; g.textAlign = 'left'; g.fillText(text, tx, 14);
  if (opts.sub) { g.font = '700 30px "Noto Sans CJK SC"'; g.fillStyle = 'rgba(60,40,20,.7)'; g.fillText(opts.sub, tx, -72); }
  if (opts.strike) { g.strokeStyle = 'rgba(200,40,60,.85)'; g.lineWidth = 7; g.beginPath(); g.moveTo(tx - 50, 34); g.lineTo(tx + tw + 10, -14); g.stroke(); }
  g.restore();
};

/** two wooden sorting trays with brass label plates */
export const tray = (g: G, x: number, y: number, w: number, h: number, label: string, glow = 0, col = GOLD) => {
  shadow(g, 30, 14, 0.6);
  const b = g.createLinearGradient(x, y, x, y + h); b.addColorStop(0, '#4a3020'); b.addColorStop(1, '#2a1a10');
  g.fillStyle = b; rr(g, x, y, w, h, 14); g.fill(); noShadow(g);
  const inner = g.createLinearGradient(x, y + 24, x, y + h - 24); inner.addColorStop(0, '#1a100a'); inner.addColorStop(1, '#2c1d13');
  g.fillStyle = inner; rr(g, x + 22, y + 22, w - 44, h - 44, 8); g.fill();
  g.strokeStyle = 'rgba(255,214,170,.18)'; g.lineWidth = 2; rr(g, x, y, w, h, 14); g.stroke();
  // brass plate
  const pw = 300, px = x + w / 2 - pw / 2, py = y + h - 4;
  const br = g.createLinearGradient(px, py, px, py + 64); br.addColorStop(0, '#e8c47a'); br.addColorStop(0.5, '#b8873a'); br.addColorStop(1, '#8a6024');
  shadow(g, 14, 6); g.fillStyle = br; rr(g, px, py, pw, 64, 8); g.fill(); noShadow(g);
  g.fillStyle = '#2a1a08'; g.font = '900 40px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, x + w / 2, py + 34);
  if (glow > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const r = g.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * 0.7); r.addColorStop(0, `rgba(${col},${0.3 * glow})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(x - w, y - h, w * 3, h * 3); g.restore(); }
};

/** a big row of digits printed on a paper strip, each with a bar under it whose height = the place value it carries */
export const placeValue = (g: G, x: number, y: number, digits: string, kk: number | number[], hl = -1, hl2 = -1, a = 1) => {
  const n = digits.length, cw = 190, x0 = x - (n * cw) / 2;
  const kAt = (i: number) => (Array.isArray(kk) ? kk[i] ?? 0 : clamp(kk * 1.3 - i * 0.12));
  g.save(); g.globalAlpha *= a;
  // paper strip
  shadow(g, 30, 12); g.fillStyle = PAPER; rr(g, x0 - 50, y - 150, n * cw + 100, 220, 6); g.fill(); noShadow(g);
  g.strokeStyle = 'rgba(80,60,30,.12)'; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(x0 - 50, y - 150 + i * 20); g.lineTo(x0 + n * cw + 50, y - 150 + i * 20); g.stroke(); }
  const vals = digits.split('').map((d, i) => Number(d) * Math.pow(10, n - 1 - i));
  const maxV = Math.max(...vals, 1);
  digits.split('').forEach((d, i) => {
    const cx = x0 + i * cw + cw / 2;
    g.fillStyle = i === hl ? `rgb(${GOLD})` : i === hl2 ? `rgb(${MAG})` : INK; g.font = '900 200px "JunoMono"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d, cx, y - 36);
    // value bar on the desk below
    const hh = 330 * Math.sqrt(vals[i] / maxV) * clamp(kAt(i));
    if (hh > 1) {
      const gr = g.createLinearGradient(0, y + 110, 0, y + 110 + hh); gr.addColorStop(0, `rgba(${GOLD},.95)`); gr.addColorStop(1, `rgba(${GOLD},.25)`);
      shadow(g, 18, 8, 0.5); g.fillStyle = gr; rr(g, cx - 54, y + 110, 108, hh, 8); g.fill(); noShadow(g);
    }
    g.fillStyle = 'rgba(243,237,226,.85)'; g.font = '700 30px "JunoMono"'; g.textBaseline = 'top';
    if (kAt(i) > 0.3) g.fillText(vals[i].toLocaleString('en-US'), cx, y + 120 + Math.max(hh, 0) + 12);
  });
  g.restore();
};

/** a mechanical odometer: chrome bezel, black drums; value may be fractional so the last drums roll */
export const odometer = (g: G, x: number, y: number, s: number, value: number, label = 'MILES') => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const n = 6, dw = 92, dh = 140, w = n * dw + 60, h = dh + 70;
  shadow(g, 40, 16, 0.7);
  const bz = g.createLinearGradient(0, -h / 2, 0, h / 2); bz.addColorStop(0, '#d9d9de'); bz.addColorStop(0.5, '#7b7b84'); bz.addColorStop(1, '#3a3a40');
  g.fillStyle = bz; rr(g, -w / 2, -h / 2, w, h, 26); g.fill(); noShadow(g);
  g.fillStyle = '#0b0b0d'; rr(g, -w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 14); g.fill();
  const x0 = -n * dw / 2;
  for (let i = 0; i < n; i++) {
    const place = Math.pow(10, n - 1 - i);
    // each drum turns only when the drums to its right roll over (like a real odometer)
    const below = value % place, digit = Math.floor(value / place) % 10;
    const roll = place === 1 ? value % 1 : clamp((below - (place - 1)) / 1);
    const v = digit + roll;
    g.save(); g.beginPath(); g.rect(x0 + i * dw + 4, -dh / 2, dw - 8, dh); g.clip();
    const dr = g.createLinearGradient(0, -dh / 2, 0, dh / 2); dr.addColorStop(0, '#050505'); dr.addColorStop(0.5, '#1d1d20'); dr.addColorStop(1, '#050505');
    g.fillStyle = dr; g.fillRect(x0 + i * dw + 4, -dh / 2, dw - 8, dh);
    for (let j = -1; j <= 1; j++) {
      const d = (Math.floor(v) + j + 10) % 10, yy = (j - (v - Math.floor(v))) * 120;
      g.fillStyle = '#f1ece2'; g.font = '700 96px "JunoMono"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(d), x0 + i * dw + dw / 2, yy + 4);
    }
    const sh = g.createLinearGradient(0, -dh / 2, 0, dh / 2); sh.addColorStop(0, 'rgba(0,0,0,.85)'); sh.addColorStop(0.3, 'rgba(0,0,0,0)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.85)');
    g.fillStyle = sh; g.fillRect(x0 + i * dw + 4, -dh / 2, dw - 8, dh);
    g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, -w / 2 + 18, -h / 2 + 18, w - 36, 16, 8); g.fill();
  g.fillStyle = 'rgba(220,220,225,.8)'; g.font = '700 22px "JunoMono"'; g.textAlign = 'center'; g.fillText(label, 0, h / 2 + 30);
  g.restore();
};

/** graph paper sheet */
export const graphPaper = (g: G, x: number, y: number, w: number, h: number, rot = 0) => {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
  shadow(g, 30, 12); g.fillStyle = '#efe9da'; g.fillRect(0, 0, w, h); noShadow(g);
  for (let i = 0; i <= w; i += 20) { g.strokeStyle = i % 100 ? 'rgba(60,120,140,.12)' : 'rgba(60,120,140,.28)'; g.lineWidth = 1; g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); }
  for (let j = 0; j <= h; j += 20) { g.strokeStyle = j % 100 ? 'rgba(60,120,140,.12)' : 'rgba(60,120,140,.28)'; g.beginPath(); g.moveTo(0, j); g.lineTo(w, j); g.stroke(); }
  g.restore();
};

/** price vs mileage: a smooth decline with a step down at every 10,000 (the cliffs), drawn in ink with gold cliffs */
export const cliffChart = (g: G, x: number, y: number, w: number, h: number, k: number, hl = -1) => {
  const m0 = 50000, m1 = 110000, px = (m: number) => x + (m - m0) / (m1 - m0) * w;
  const price = (m: number) => 12000 - (m - m0) * 0.055 - Math.floor(m / 10000) * 190;
  const py = (p: number) => y + h - (p - 7600) / (12000 - 7600) * h;
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
  g.fillStyle = INK; g.font = '700 22px "JunoMono"'; g.textAlign = 'center'; g.textBaseline = 'top';
  for (let m = 60000; m <= 100000; m += 10000) g.fillText(`${m / 1000}k`, px(m), y + h + 10);
  const end = m0 + (m1 - m0) * clamp(k);
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath();
  for (let m = m0; m <= end; m += 100) { const X = px(m), Y = py(price(m)); m === m0 ? g.moveTo(X, Y) : g.lineTo(X, Y); }
  g.stroke();
  // mark the cliffs
  for (let m = 60000; m <= 100000; m += 10000) {
    if (m > end) break;
    const X = px(m), Y0 = py(price(m - 1)), Y1 = py(price(m));
    g.strokeStyle = `rgba(${m === hl ? MAG : '200,60,80'},.95)`; g.lineWidth = m === hl ? 7 : 5; g.beginPath(); g.moveTo(X, Y0); g.lineTo(X, Y1); g.stroke();
  }
};

/** a catalogue page with three swatches of the same dress and three prices */
export const catalogue = (g: G, x: number, y: number, prices: string[], sold: number[], k: number, hl = 1) => {
  const w = 1180, h = 640;
  shadow(g, 40, 16); g.fillStyle = '#f2ece0'; g.fillRect(x, y, w, h); noShadow(g);
  g.fillStyle = INK; g.font = '700 28px "Cormorant Garamond"'; g.textAlign = 'left'; g.fillText('SPRING CATALOGUE · NO. 3', x + 40, y + 52);
  g.strokeStyle = 'rgba(40,30,20,.3)'; g.beginPath(); g.moveTo(x + 40, y + 70); g.lineTo(x + w - 40, y + 70); g.stroke();
  prices.forEach((p, i) => {
    const cx = x + 200 + i * 390, cy = y + 270;
    // the dress, as a flat silhouette on a hanger (no person)
    g.strokeStyle = '#8a8a90'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy - 190); g.quadraticCurveTo(cx + 14, cy - 206, cx, cy - 214); g.moveTo(cx, cy - 186); g.lineTo(cx - 70, cy - 150); g.lineTo(cx + 70, cy - 150); g.closePath(); g.stroke();
    const dg = g.createLinearGradient(cx - 110, 0, cx + 110, 0); dg.addColorStop(0, '#5e2029'); dg.addColorStop(0.45, '#8c3442'); dg.addColorStop(1, '#5a1e27');
    g.fillStyle = dg; g.beginPath();
    g.moveTo(cx - 24, cy - 150); g.quadraticCurveTo(cx, cy - 128, cx + 24, cy - 150);       // neckline
    g.lineTo(cx + 62, cy - 146); g.lineTo(cx + 88, cy - 112); g.lineTo(cx + 66, cy - 98);   // right sleeve
    g.lineTo(cx + 46, cy - 40); g.quadraticCurveTo(cx + 40, cy - 20, cx + 44, cy - 6);      // waist
    g.quadraticCurveTo(cx + 96, cy + 70, cx + 118, cy + 128); g.quadraticCurveTo(cx, cy + 144, cx - 118, cy + 128);
    g.quadraticCurveTo(cx - 96, cy + 70, cx - 44, cy - 6); g.quadraticCurveTo(cx - 40, cy - 20, cx - 46, cy - 40);
    g.lineTo(cx - 66, cy - 98); g.lineTo(cx - 88, cy - 112); g.lineTo(cx - 62, cy - 146); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,8,12,.5)'; g.fillRect(cx - 44, cy - 14, 88, 10);
    g.strokeStyle = 'rgba(255,230,230,.12)'; g.lineWidth = 3; for (const dx of [-50, -10, 34]) { g.beginPath(); g.moveTo(cx + dx * 0.3, cy); g.quadraticCurveTo(cx + dx * 0.9, cy + 60, cx + dx * 1.6, cy + 126); g.stroke(); }
    g.fillStyle = i === hl ? '#9a6a1c' : INK; g.font = '900 72px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.fillText(p, cx, cy + 200);
    // sales bar beside
    const hh = 220 * sold[i] * clamp(k * 1.4 - i * 0.15);
    g.fillStyle = i === hl ? `rgba(${GOLD},.95)` : 'rgba(60,45,30,.55)'; g.fillRect(cx + 130, cy + 120 - hh, 40, hh);
  });
};

/** desk calendar page */
export const calendarPage = (g: G, x: number, y: number, s: number, big: string, small: string, mark = 0) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  shadow(g, 30, 12); g.fillStyle = '#f3ede0'; rr(g, -150, -170, 300, 340, 10); g.fill(); noShadow(g);
  g.fillStyle = '#9a2a2a'; rr(g, -150, -170, 300, 70, 10); g.fill(); g.fillRect(-150, -130, 300, 30);
  g.fillStyle = '#f3ede0'; g.font = '700 34px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(small, 0, -132);
  g.fillStyle = INK; g.font = '900 150px "Noto Serif CJK SC"'; g.fillText(big, 0, 30);
  for (let k = 0; k < 6; k++) { g.fillStyle = '#1a1410'; g.beginPath(); g.arc(-110 + k * 44, -170, 7, 0, 6.3); g.fill(); }
  if (mark > 0) { g.strokeStyle = `rgba(200,40,60,${0.9 * mark})`; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 30, 120 * mark, 90 * mark, -0.1, 0, 6.3); g.stroke(); }
  g.restore();
};

/** a patient chart on a clipboard: a title, a few ruled lines, one big percentage */
export const chart = (g: G, x: number, y: number, title: string, pct: string, col: string, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  shadow(g, 34, 14); g.fillStyle = '#6b4a2c'; rr(g, -230, -310, 460, 620, 14); g.fill(); noShadow(g);
  g.fillStyle = '#f2ece0'; g.fillRect(-200, -270, 400, 560);
  g.fillStyle = '#b8b8be'; rr(g, -70, -330, 140, 50, 8); g.fill();
  g.fillStyle = INK; g.font = '700 34px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.fillText(title, 0, -200);
  g.strokeStyle = 'rgba(40,30,20,.18)'; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-170, -150 + k * 34); g.lineTo(170, -150 + k * 34); g.stroke(); }
  g.fillStyle = col; g.font = '900 128px "JunoMono"'; g.fillText(pct, 0, 150);
  g.fillStyle = 'rgba(40,30,20,.7)'; g.font = '700 28px "Noto Sans CJK SC"'; g.fillText('做了搭桥手术', 0, 230);
  g.restore();
};

/** a pencil lying on the desk */
export const pencil = (g: G, x: number, y: number, rot: number, len = 420) => {
  g.save(); g.translate(x, y); g.rotate(rot); shadow(g, 14, 8);
  g.fillStyle = '#d9a336'; g.fillRect(-len / 2, -11, len - 60, 22); noShadow(g);
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-len / 2, 2, len - 60, 9);
  g.fillStyle = '#e8cfa0'; g.beginPath(); g.moveTo(len / 2 - 60, -11); g.lineTo(len / 2, 0); g.lineTo(len / 2 - 60, 11); g.closePath(); g.fill();
  g.fillStyle = '#222'; g.beginPath(); g.moveTo(len / 2 - 18, -3.5); g.lineTo(len / 2, 0); g.lineTo(len / 2 - 18, 3.5); g.closePath(); g.fill();
  g.fillStyle = '#b7b7bd'; g.fillRect(-len / 2 - 30, -11, 34, 22); g.fillStyle = '#d78a8a'; g.fillRect(-len / 2 - 60, -11, 32, 22);
  g.restore();
};

export { lerp };

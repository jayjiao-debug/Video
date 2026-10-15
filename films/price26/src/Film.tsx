/* 《差一分钱》: one long documentary take over a case desk. Every object lies at its own station on the desk; the camera
   glides from station to station, each glide landing on a beat. Text that belongs to the desk (annotations) is drawn
   in the picture so it moves with the camera; subtitles, slates and the slammed words sit on the glass. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit, rnd, glowDot } from './kit';
import { sparks } from './lightkit';
import { tag, tray, placeValue, odometer, graphPaper, cliffChart, carPrice, catalogue, calendarPage, chart, pencil, GOLD, MAG, RED_INK, INK } from './props';
import { LINES, CUT, at, till, bt, near, B, SLAM80, FILM_FRAMES, GLIDE, FLIP, PAIR, GROOVE, DROP } from './time';
import { JUNO } from './brand/identity';
export { FILM_FRAMES };

type G = CanvasRenderingContext2D;
const GL = '#f6d58e', MG = '#ff6b5e';
// station origins on the desk (each is a 1920×1080 "page" of the desk)
const ST = { A: [0, 0], C: [2300, 0], D: [4600, 0], E: [4600, 1500], F: [2300, 1500], G: [0, 1500] } as const;
const ctr = (k: keyof typeof ST, dx = 0, dy = 0) => [ST[k][0] + 960 + dx, ST[k][1] + 540 + dy] as const;

/* ---------------------------------------------------------------- camera: arrive at each key on a beat */
// Moves between stations take 4 beats with a sine ease (peak ≈ 60 px a frame) and start only once the last line of the
// station has been read; the title card covers the first move.
type Key = { t: number; c: readonly [number, number]; s: number; d?: number };
const KEYS: Key[] = [
  { t: 0, c: ctr('A', 0, -10), s: 1.0 },
  { t: bt(14), c: ctr('A', -170, 30), s: 1.1, d: 2.6 },                       // h3: lean in on the 9.99
  { t: CUT.S1, c: ctr('C', 0, 0), s: 1.0, d: CUT.T_OUT - CUT.TITLE - 0.25 },    // under the title card
  { t: CUT.S2, c: ctr('D', 0, -80), s: 1.0, d: GLIDE },
  { t: CUT.S3, c: ctr('E', -500, -20), s: 1.3, d: GLIDE },
  { t: near(till('c4') + 1.9), c: ctr('E', 480, -70), s: 1.5, d: 1.8 },   // only once c4 has been read
  { t: CUT.S4, c: ctr('F', 0, -20), s: 1.0, d: GLIDE },
  { t: CUT.S5, c: ctr('G', 0, -40), s: 1.0, d: GLIDE },
  { t: CUT.S6, c: ctr('A', 0, -10), s: 1.0, d: GLIDE + 0.5 },
];
const sine = (q: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(q));
const camAt = (T: number) => {
  let i = 0; while (i < KEYS.length - 1 && T >= KEYS[i + 1].t - (KEYS[i + 1].d ?? 1)) i++;
  const k = KEYS[i], n = KEYS[i + 1];
  // where the hold drift had got to when the move starts, so the move picks up from there without a jump
  const drift = (kk: Key, T2: number, nn?: Key) => {
    const hold = (nn ? nn.t - (nn.d ?? 1) : CUT.FIN) - kk.t, q = pr(T2, kk.t, Math.max(1, hold));
    return { x: kk.c[0] + 14 * q, y: kk.c[1] - 8 * q, s: kk.s * (1 + 0.03 * q) };
  };
  if (n && T >= n.t - (n.d ?? 1)) {
    const d = n.d ?? 1, from = drift(k, n.t - d, n), q = sine((T - (n.t - d)) / d);
    return { x: lerp(from.x, n.c[0], q), y: lerp(from.y, n.c[1], q), s: lerp(from.s, n.s, q) * (1 - 0.015 * Math.sin(q * Math.PI)) };
  }
  return drift(k, T, n);
};

/* ---------------------------------------------------------------- the desk in world space */
const deskWorld = (g: G, x0: number, y0: number, x1: number, y1: number) => {
  g.fillStyle = '#120b08'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let r = Math.floor(y0 / 120) - 1; r <= Math.ceil(y1 / 120); r++) {
    const y = r * 120, c = 16 + 7 * rnd(r, 2);
    g.fillStyle = `rgb(${c + 16},${c + 6},${c - 3})`; g.fillRect(x0, y, x1 - x0, 118);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x0, y + 117, x1 - x0, 3);
    g.strokeStyle = 'rgba(255,200,150,.04)'; g.lineWidth = 1.2;
    for (let k = 0; k < 13; k++) { const yy = y + 6 + k * 9 + 3 * rnd(r, k); g.beginPath(); g.moveTo(x0, yy); for (let x = Math.floor(x0 / 96) * 96; x <= x1 + 96; x += 96) g.lineTo(x, yy + Math.sin(x * 0.0045 + k * 1.7 + r) * 3.2); g.stroke(); }
    // butt joints between boards
    const jx = (r * 1373) % 2400;
    for (let x = Math.floor(x0 / 2400) * 2400 + jx; x < x1; x += 2400) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x, y, 3, 118); }
  }
};

/* ---------------------------------------------------------------- stations */
const stamp = (T: number, t0: number) => eo(T, t0, 0.22);
const pctType = (s: string, t0: number, T: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((T - t0) / 0.07))));
const txt = (g: G, s: string, x: number, y: number, font: string, col: string, align: CanvasTextAlign = 'center', base: CanvasTextBaseline = 'middle') => {
  g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y);
};
/** where the first digit of a tag's price sits (tag-local x), for glows */
const firstDigitX = (g: G, text: string) => {
  g.save(); g.font = '900 118px "Noto Serif CJK SC"'; const tw = g.measureText(text).width, dw = g.measureText(text[0]).width; g.restore();
  return -Math.max(360, tw + 190) / 2 + 120 + dw / 2;
};
const goldColumn = (g: G, x: number, base: number, hh: number, w = 150) => {
  if (hh <= 1) return;
  const gr = g.createLinearGradient(0, base - hh, 0, base); gr.addColorStop(0, `rgba(${GOLD},.97)`); gr.addColorStop(1, `rgba(${GOLD},.28)`);
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8;
  g.fillStyle = gr; g.beginPath(); (g as any).roundRect(x - w / 2, base - hh, w, hh, 10); g.fill(); g.restore();
};

// station A: the hook and the take-home. Two tags, and under each a column for the price you *feel*.
const A_BASE = 880, A_TALL = 360, A_SHORT = 0.66 * A_TALL;
const stationA = (g: G, T: number) => {
  pencil(g, 1700, 800, -0.45);
  // 0–0.4: the 10.00 tag lands; FLIP (1.418): it turns over to 9.99; PAIR (3.443): it steps left, a 10.00 slides in
  const land = eo(T, 0, 0.4), f = clamp((T - FLIP) / 0.28), pk = eio(T, PAIR, 0.7);
  const x1 = lerp(960, 640, pk), y1 = lerp(470, 330, pk), s1 = lerp(1.6, 1.0, pk) * lerp(1.25, 1, land);
  g.save(); g.globalAlpha = eo(T, 0, 0.2);
  // the felt-price columns: both rise to (almost) the same height, then the 9.99 one sinks
  const rise = eo(T, bt(7), 0.6), sink = eio(T, bt(9), 0.5) * (1 - eio(T, at('f3'), 0.7));
  if (T > bt(7)) {
    goldColumn(g, 640, A_BASE, rise * lerp(A_TALL - 2, A_SHORT, sink));
    goldColumn(g, 1290, A_BASE, rise * A_TALL);
    // the real prices: a dashed line across both, almost exactly level
    const la = eo(T, bt(8), 0.4);
    g.save(); g.globalAlpha *= la; g.strokeStyle = 'rgba(243,237,226,.75)'; g.lineWidth = 3; g.setLineDash([14, 12]);
    g.beginPath(); g.moveTo(520, A_BASE - A_TALL); g.lineTo(1410, A_BASE - A_TALL); g.stroke(); g.setLineDash([]);
    txt(g, '实际只差 ¥0.01', 965, A_BASE - A_TALL - 30, '700 34px "Noto Sans CJK SC"', 'rgba(243,237,226,.9)');
    txt(g, '心里觉得的价格', 965, A_BASE - 40, '700 32px "Noto Sans CJK SC"', `rgba(${GOLD},.9)`);
    g.restore();
    // the gap you feel, in red
    const ga = eo(T, bt(10), 0.4) * (1 - eo(T, at('f3'), 0.5));
    if (ga > 0) {
      const top = A_BASE - A_TALL, bot = A_BASE - A_SHORT, x = 740;
      g.save(); g.globalAlpha *= ga; g.strokeStyle = 'rgb(235,82,64)'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(x - 14, top); g.lineTo(x, top); g.lineTo(x, bot); g.lineTo(x - 14, bot); g.stroke();
      txt(g, '一大截', x + 22, (top + bot) / 2, '900 46px "Noto Serif CJK SC"', 'rgb(255,107,94)', 'left');
      g.restore();
    }
  }
  const glow2 = hit(T, at('f2') + 0.2, 0.9);
  if (glow2 > 0) {
    g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, x1, y1, 330 * s1, 0.35 * glow2, GOLD); g.restore();
  }
  tag(g, x1, y1, s1, lerp(-0.08, -0.05, pk), f < 0.5 ? '10.00' : '9.99', { flip: f > 0 && f < 1 ? f : 0 });
  if (T > FLIP) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, x1, y1, FLIP, T, 90, GOLD, 1.6, 3); g.restore(); }
  if (T > PAIR - 0.05) tag(g, lerp(2350, 1290, eo(T, PAIR, 0.6)), 330, 1.0, 0.05, '10.00');
  g.restore();
  // the take-home: the column rises back, and a note card says what to read it as
  if (T > at('f3') - 0.1) {
    const a = eo(T, at('f3') - 0.1, 0.4), w = eio(T, at('f3') + 0.3, 0.8);
    if (T > at('f3') + 0.7) { g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, 640, A_BASE - A_TALL, 220, 0.4 * hit(T, at('f3') + 0.7, 0.8), GOLD); g.restore(); }
    g.save(); g.translate(965, 690 + (1 - a) * 40); g.rotate(0.07); g.globalAlpha = a;
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
    g.fillStyle = '#f3ead6'; g.fillRect(-150, -85, 300, 170); g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(120,150,190,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-130, -30 + i * 40); g.lineTo(130, -30 + i * 40); g.stroke(); }
    g.save(); g.beginPath(); g.rect(-150, -85, 300 * w, 170); g.clip();
    txt(g, '≈10', 0, 6, '900 112px "Noto Serif CJK SC"', '#26232e');
    g.restore(); g.restore();
  }
};

// station C: the 9.99 tag is read left to right, the first digit lights up, and the tag drops into the 9块多 tray
const C_TAG = [960, 250] as const;
const stationC = (g: G, T: number) => {
  const d1 = near(at('a3') + 0.1), d2 = d1 + 2 * B;
  tray(g, 300, 380, 560, 400, '9块多', hit(T, d1, 0.6) + (T > at('a4') ? 0.6 : 0), GOLD);
  tray(g, 1060, 380, 560, 400, '10块', hit(T, d2, 0.6) * 0.8 + (T > at('a4') ? 0.4 : 0), '255,214,190');
  const k1 = eio(T, d1 - 0.4, 0.4);
  const tx = lerp(C_TAG[0], 600, k1), ty = lerp(C_TAG[1], 580, k1), ts = lerp(0.8, 0.85, k1), tr = lerp(-0.04, -0.12, k1);
  // the first digit glows from the groove hit until the tag drops
  const dg = eo(T, GROOVE, 0.25) * (1 - eo(T, d1 - 0.4, 0.3));
  const fx = tx + firstDigitX(g, '9.99') * ts;
  if (dg > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, fx, ty + 10, 150, 0.55 * dg + 0.25 * hit(T, GROOVE, 0.6), GOLD); g.restore(); }
  g.save(); g.globalAlpha = eo(T, CUT.T_OUT - 0.5, 0.4); tag(g, tx, ty, ts, tr, '9.99'); g.restore();
  // a reading light sweeps left to right across the price
  const sw = pr(T, at('a1') + 0.4, 1.1);
  if (sw > 0 && sw < 1) {
    const x = lerp(tx - 200, tx + 220, sw);
    g.save(); g.globalCompositeOperation = 'lighter';
    const lg = g.createLinearGradient(x - 70, 0, x + 70, 0); lg.addColorStop(0, 'rgba(255,230,170,0)'); lg.addColorStop(0.5, 'rgba(255,230,170,.45)'); lg.addColorStop(1, 'rgba(255,230,170,0)');
    g.fillStyle = lg; g.fillRect(x - 70, ty - 90, 140, 180); g.restore();
  }
  if (T > d2 - 0.4) { const k2 = eo(T, d2 - 0.4, 0.35); tag(g, 1360, lerp(-200, 580, k2), lerp(1.2, 0.85, k2), 0.08, '10.00'); }
  if (T > at('a4')) {   // the gap: ¥0.01, chalked between the trays
    const a = eo(T, at('a4'), 0.4);
    g.save(); g.globalAlpha = a; g.strokeStyle = `rgba(${GOLD},.9)`; g.lineWidth = 4; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(880, 590); g.lineTo(1040, 590); g.stroke(); g.setLineDash([]);
    txt(g, '¥0.01', 960, 545, '700 46px "JunoMono"', `rgb(${GOLD})`);
    g.restore();
  }
};

const stationD = (g: G, T: number) => {
  const a = eo(T, CUT.S2 - 0.8, 0.6);
  const k0 = eo(T, at('b3') + 0.3, 0.7), kAll = eo(T, at('b5'), 0.9);
  const ks = [Math.max(k0, kAll), kAll, kAll, T > at('b4') ? 1 : 0, T > at('b4') ? 1 : 0];
  placeValue(g, 960, 320, '79900', ks, T > at('b3') ? 0 : -1, T > at('b4') && T < at('b5') ? 4 : -1, a);
  if (T > at('b6')) {   // tick: reading only the first digit is right almost every time
    const q = eio(T, at('b6') + 0.3, 0.5);
    g.save(); g.strokeStyle = `rgba(${GOLD},.95)`; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round';
    const P = [[1500, 660], [1560, 720], [1680, 580]]; const L1 = Math.hypot(60, 60), L2 = Math.hypot(120, 140), dd = q * (L1 + L2);
    g.beginPath(); g.moveTo(P[0][0], P[0][1]);
    if (dd <= L1) g.lineTo(lerp(P[0][0], P[1][0], dd / L1), lerp(P[0][1], P[1][1], dd / L1)); else { g.lineTo(P[1][0], P[1][1]); g.lineTo(lerp(P[1][0], P[2][0], (dd - L1) / L2), lerp(P[1][1], P[2][1], (dd - L1) / L2)); }
    g.stroke(); g.restore();
  }
};

// station E: the odometer rolls over; then the price-vs-mileage chart, which zooms in on the 80k cliff and out again
const PL = { x: 1140, y: 262, w: 640, h: 380 };
const stationE = (g: G, T: number) => {
  const r0 = at('c3') + 0.2, r1 = near(r0 + 2.4);
  // it creeps up to 79999 while c2 is read, then the carry rolls every drum at once, ending on a beat
  const v = T < at('c2') ? 79990 : T < r0 ? 79990 + Math.floor(9 * eio(T, at('c2'), r0 - at('c2') - 0.3) + 1e-6) : T < r1 ? 79999 + (1 - Math.pow(1 - pr(T, r0, r1 - r0), 2)) : 80000;
  odometer(g, 460, 520, 1.15, v);
  if (T > r1) { g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, 460 - 240, 520, 220, 0.4 * hit(T, r1, 0.8) + (T > at('c4') ? 0.12 : 0), MAG); sparks(g, 230, 520, r1, T, 60, MAG, 1.2, 5); g.restore(); }
  // the chart on graph paper
  const pa = eo(T, near(till('c4') + 1.9) - 1.5, 0.8);
  if (pa <= 0) return;
  g.save(); g.globalAlpha = pa; graphPaper(g, 1060, 200, 780, 540, 0); g.restore();
  const ax = eo(T, at('c5'), 0.5);
  if (ax <= 0) return;
  g.save(); g.globalAlpha = ax;
  const ck = T < at('c6') ? 0 : eio(T, at('c6'), bt(128) - at('c6'));          // drawn through c6, done on the 65.2 build hit
  const z = eio(T, at('c7') - 0.2, 0.9) * (1 - eio(T, at('c9') - 0.2, 0.9));
  const { px, py } = cliffChart(g, PL.x, PL.y, PL.w, PL.h, ck, z, T > at('c7') ? 80000 : -1);
  txt(g, '车价', PL.x + 14, PL.y + 14, '700 28px "Noto Sans CJK SC"', INK, 'left');
  txt(g, '里程 · 英里', PL.x + PL.w, PL.y + PL.h + 58, '700 24px "Noto Sans CJK SC"', 'rgba(42,32,22,.75)', 'right');
  // −$200, pinned to the 80k cliff once we are zoomed in
  if (z > 0.6 && T < at('c9')) {
    const q = clamp((z - 0.6) / 0.3), Y = (py(carPrice(79999)) + py(carPrice(80000))) / 2;
    g.save(); g.globalAlpha *= q; txt(g, '−$200', px(80000) + 18, Y, '900 46px "JunoMono"', RED_INK, 'left'); g.restore();
  }
  // c8: the two drops side by side, to scale: 100 miles before the line vs across it
  if (T > at('c8') && T < at('c9') + 0.4) {
    const q = eo(T, at('c8'), 0.5) * (1 - pr(T, at('c9') - 0.2, 0.5));
    const top = 448, rx = [1215, 1335], sc = 0.7;
    g.save(); g.globalAlpha *= q;
    g.fillStyle = 'rgba(239,233,218,.94)'; g.fillRect(1150, 410, 250, 226);
    g.strokeStyle = 'rgba(42,32,22,.35)'; g.lineWidth = 2; g.strokeRect(1150, 410, 250, 226);
    txt(g, '79.8k→79.9k', rx[0], 428, '700 17px "JunoMono"', INK);
    txt(g, '79.9k→80k', rx[1], 428, '700 17px "JunoMono"', INK);
    g.fillStyle = 'rgba(42,32,22,.75)'; g.fillRect(rx[0] - 26, top, 52, 10 * sc * eo(T, at('c8') + 0.3, 0.4));
    g.fillStyle = RED_INK; g.fillRect(rx[1] - 26, top, 52, 200 * sc * eo(T, at('c8') + 0.7, 0.6));
    txt(g, '−$10', rx[0], top + 38, '900 30px "JunoMono"', INK);
    txt(g, '−$200', rx[1] - 6, top + 140 + 24, '900 28px "JunoMono"', RED_INK);
    g.restore();
  }
  // c9: how many cars come to auction, by mileage: it jumps just before each 10,000
  if (T > at('c9') - 0.2) {
    const q = eo(T, at('c9') + 0.5, 0.9);
    g.save(); g.beginPath(); g.rect(PL.x + 2, PL.y, PL.w, PL.h); g.clip();
    for (let m = 51000; m < 110000; m += 1000) {
      const r = m % 10000, spike = r === 9000 ? 5 : r === 8000 ? 2 : 1;
      const hh = 16 * spike * q * (0.85 + 0.3 * rnd(m, 3));
      g.fillStyle = spike > 2 ? 'rgba(184,50,42,.85)' : 'rgba(58,42,26,.45)'; g.fillRect(px(m + 500) - 3, PL.y + PL.h - hh, 6, hh);
    }
    g.restore();
    g.save(); g.globalAlpha *= q; txt(g, '送去拍卖的车', PL.x + 16, PL.y + PL.h - 110, '700 24px "Noto Sans CJK SC"', RED_INK, 'left'); g.restore();
  }
  g.restore();
};

// station F: the catalogue slaps down on the drop
const stationF = (g: G, T: number) => {
  if (T < CUT.S4 - 0.14) return;
  const k = eo(T, CUT.S4 - 0.14, 0.14), sc = lerp(1.12, 1, k);
  g.save(); g.globalAlpha = clamp(k * 3); g.translate(960, 500); g.scale(sc, sc); g.translate(-960, -500);
  catalogue(g, 370, 180, ['$34', '$39', '$44'], [0.76, 1.0, 0.81], eo(T, near(at('d3') + 0.1), 0.5), T > at('d3') ? 1 : -1);
  // bars: units as reported (16 · 21 · 17)
  if (T > at('d5')) {   // $34 and $39 both read as "thirty-something"; $44 as "forty-something"
    const q = eio(T, at('d5'), 0.5), q2 = eio(T, at('d5') + 0.5, 0.5);
    const br = (x0: number, x1: number, label: string, col: string, qq: number) => {
      const y = 712, mid = (x0 + x1) / 2, hw = (x1 - x0) / 2 * qq;
      g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(mid - hw, y - 14); g.lineTo(mid - hw, y); g.lineTo(mid + hw, y); g.lineTo(mid + hw, y - 14); g.moveTo(mid, y); g.lineTo(mid, y + 12); g.stroke();
      g.save(); g.globalAlpha *= qq; txt(g, label, mid, y + 44, '900 42px "Noto Serif CJK SC"', col); g.restore();
    };
    br(370 + 200 - 90, 370 + 590 + 90, '都是「30多」', '#9a6a1c', q);
    br(370 + 980 - 90, 370 + 980 + 90, '「40多」', RED_INK, q2);
  }
  g.restore();
  if (T > CUT.S4) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 830, CUT.S4, T, 70, '255,200,140', 1.3, 13); g.restore(); }
};

// station G: the calendar counts up to the birthday; the two patient charts; the slam
const page = (g: G, x: number, y: number, s: number, T: number, flips: [number, string][], first: string, mark = 0) => {
  let shown = first, sq = 1;
  for (const [t, v] of flips) { if (T >= t) shown = v; else if (T > t - 0.3) { const q = pr(T, t - 0.3, 0.3); sq = Math.abs(Math.cos(q * Math.PI)); if (q >= 0.5) shown = v; } }
  g.save(); g.translate(x, y); g.scale(1, Math.max(0.04, sq)); g.translate(-x, -y); calendarPage(g, x, y, s, shown, '生日', mark); g.restore();
};
const stationG = (g: G, T: number) => {
  const a = eo(T, CUT.S5 - 0.9, 0.6);
  g.save(); g.globalAlpha = a; g.translate(960, 470); g.scale(0.82, 0.82); g.translate(-960, -470);
  const in1 = eo(T, at('e2'), 0.5), in2 = eo(T, at('e2') + 0.25, 0.5);
  g.save(); g.translate(0, (1 - in1) * 60); g.globalAlpha *= in1; chart(g, 560, 470, '80岁生日前两周', pctType('7.0%', at('e4') + 1.0, T), '#2a2016', -0.05); g.restore();
  g.save(); g.translate(0, (1 - in2) * 60); g.globalAlpha *= in2; chart(g, 1360, 470, '80岁生日后两周', pctType('5.3%', at('e5') + 0.9, T), RED_INK, 0.04); g.restore();
  // the calendar counts the birthdays up, and turns to 80 exactly on the slam
  page(g, 960, 250, 0.8, T, [[near(at('e2')), '78'], [near(at('e3')), '79'], [SLAM80, '80']], '77', T >= SLAM80 ? eo(T, SLAM80 + 0.05, 0.35) : 0);
  g.restore();
  if (T >= SLAM80) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 290, SLAM80, T, 140, MAG, 2.2, 9); g.restore(); }
  // e7: the other birthdays: only 80 is circled
  if (T > at('e7') - 0.1) {
    const ages = ['77', '78', '79', '80', '81', '82', '83'];
    ages.forEach((s, i) => {
      const q = eo(T, at('e7') + i * 0.07, 0.35);
      g.save(); g.globalAlpha = q * (s === '80' ? 1 : 0.85); calendarPage(g, 960 + (i - 3) * 132, 832 + (1 - q) * 30, 0.3, s, '生日', s === '80' ? eo(T, at('e7') + 0.8, 0.4) : 0); g.restore();
    });
  }
};

/* ---------------------------------------------------------------- the film */
const LOADS = [...FONT_LOADS, '900 40px "Noto Serif CJK SC"'];
const GLYPHS = '实际只差心里觉得的价格一大截都是「30多」「40多」车价里程·英里送去拍卖的车80岁生日前两周后≈10¥$0123456789.,+−→≈⅓块多只便宜了一分钱为什么感觉一大截你定也被这骗过读个数我们从左往右看到第位大脑就开始估进格子硬是两这是不说明很笨其实聪明的捷径最边代表七万后那什么都决定有所以平时几乎对还省力它会出错偏在进位刻再多跳成值没变判断却了美国多万笔二手车拍卖记录里里程表每过整英里价掉截比贵约美元可之间差卖家懂快时送去突然定人站道悬崖上女装目录做实验同条裙子标三个反而卖得更好起来专业呢年研究者翻查老医保数据样心脏病发作住院还几周满岁搭桥手术刚过有被归进其他前没落差笨太下次先心里把读成生日差一分钱为看比便那么评论区坑过资料';
const Slate: React.FC<{ s: string; a: number }> = ({ s, a }) => (a <= 0 ? null : <div style={{ position: 'absolute', left: 96, top: 150, opacity: a, padding: '6px 14px', borderRadius: 6, background: 'rgba(8,6,5,.72)', fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(239,232,218,.92)' }}>{s}</div>);
const slateA = (T: number, a: number, z: number) => Math.min(eo(T, a, 0.4), 1 - pr(T, z - 0.4, 0.4));

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(LOADS.map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const cam = camAt(T);
  const titleO = T < CUT.TITLE - 0.05 ? 0 : 1 - pr(T, CUT.T_OUT - 0.5, 0.5);
  const endO = eo(T, CUT.END, 0.6);
  const markO = (1 - (T >= CUT.TITLE - 0.3 && T < CUT.T_OUT ? 1 : 0)) * (1 - endO);
  const title = '差一分钱';
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={f} draw={(g) => {
            g.save(); g.translate(960, 540); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y);
            const hw = 960 / cam.s + 40, hh = 540 / cam.s + 40;
            deskWorld(g, cam.x - hw, cam.y - hh, cam.x + hw, cam.y + hh);
            const on = (k: keyof typeof ST, fn: () => void) => {
              const [ox, oy] = ST[k];
              if (ox + 1920 < cam.x - hw || ox > cam.x + hw || oy + 1080 < cam.y - hh || oy > cam.y + hh) return;
              g.save(); g.translate(ox, oy); fn(); g.restore();
            };
            on('A', () => stationA(g, T)); on('C', () => stationC(g, T)); on('D', () => stationD(g, T));
            on('E', () => stationE(g, T)); on('F', () => stationF(g, T)); on('G', () => stationG(g, T));
            g.restore();
            // the lamp follows the camera; a vignette holds the frame
            g.save(); g.globalCompositeOperation = 'lighter';
            const p = g.createRadialGradient(780, 400, 30, 860, 480, 1050); p.addColorStop(0, 'rgba(255,190,120,.30)'); p.addColorStop(0.45, 'rgba(255,170,100,.10)'); p.addColorStop(1, 'rgba(255,160,90,0)');
            g.fillStyle = p; g.fillRect(0, 0, 1920, 1080); g.restore();
            const v = g.createRadialGradient(960, 540, 300, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
            // title and end card sit on a darkened desk
            const dim = Math.max(0.9 * titleO, endO);
            if (dim > 0) { g.fillStyle = `rgba(4,3,3,${dim})`; g.fillRect(0, 0, 1920, 1080); }
            if (T >= CUT.TITLE && T < CUT.T_OUT) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 380, CUT.TITLE, T, 160, GOLD, 2.4, 21); g.restore(); }
          }} />
          <Grade warm={0.06} />
          <Grain T={T} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.08 * hit(T, FLIP, 0.08) + 0.14 * hit(T, CUT.TITLE, 0.08) + 0.12 * hit(T, DROP, 0.08) + 0.16 * hit(T, SLAM80, 0.08), mixBlendMode: 'screen' }} />
          <Bars />
          {/* slates: where the evidence comes from */}
          <Slate s="J. CONSUMER RESEARCH · THOMAS & MORWITZ · 2005" a={slateA(T, at('a2'), CUT.S2 - GLIDE + 0.2)} />
          <Slate s="22 MILLION USED-CAR SALES · LACETERA, POPE & SYDNOR" a={slateA(T, at('c5'), CUT.S4 - GLIDE + 0.2)} />
          <Slate s="ANDERSON & SIMESTER · 2003" a={slateA(T, at('d2'), CUT.S5 - GLIDE + 0.2)} />
          <Slate s="MEDICARE · NEJM 2020" a={slateA(T, at('e2'), CUT.S6 - GLIDE + 0.2)} />
          {/* title card */}
          {titleO > 0 && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', opacity: titleO * eo(T, CUT.TITLE + 0.3, 0.4), fontFamily: F.lat, fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>LEFT-DIGIT EFFECT · THOMAS & MORWITZ · MMV</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', opacity: titleO, fontFamily: F.serif, fontWeight: 900, fontSize: 150, lineHeight: '190px', whiteSpace: 'nowrap' }}>
                {['《', ...title, '》'].map((c, i) => {
                  const t0 = i === 0 || i === 5 ? CUT.TITLE : CUT.TITLE + (i - 1) * B / 2, k = stamp(T, t0);
                  return <span key={i} style={{ display: 'inline-block', opacity: T < t0 ? 0 : k, transform: `scale(${lerp(1.4, 1, k)})`, background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' }}>{c}</span>;
                })}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: titleO * eo(T, CUT.TITLE + 0.9, 0.4), fontFamily: F.serif, fontWeight: 700, fontSize: 50, color: C.cream, textShadow: '0 4px 20px rgba(0,0,0,.9)' }}>为什么9.99，看起来比10块便宜那么多？</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 774, textAlign: 'center', opacity: 0.9 * titleO * eo(T, CUT.TITLE + 1.2, 0.4), fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'rgba(239,232,218,.9)' }}>One cent, one whole digit.</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 838, textAlign: 'center', opacity: titleO * eo(T, CUT.TITLE + 1.5, 0.4), fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>— {JUNO.series} —</div>
            </>
          )}
          {/* the slammed words on the 113.8 s hit */}
          {T >= SLAM80 && T < at('e7') && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 862, textAlign: 'center', opacity: eo(T, SLAM80, 0.18) * (1 - pr(T, at('e7') - 0.3, 0.3)), transform: `scale(${lerp(1.35, 1, eo(T, SLAM80, 0.22))})`, fontFamily: F.serif, fontWeight: 900, fontSize: 84, color: C.cream, textShadow: '0 6px 30px rgba(0,0,0,.95)' }}>
              只隔一个生日，就被归进了<span style={{ color: MG }}>「80多岁」</span>
            </div>
          )}
          {/* end card */}
          {endO > 0 && (
            <>
              <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: endO }}>
                <defs><linearGradient id="gec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
                <circle cx={960} cy={222} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eio(T, CUT.END, 0.8)} transform="rotate(-90 960 222)" />
                <text x={960} y={242} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={eo(T, CUT.END + 0.3, 0.4)}>J</text>
                <text x={960} y={296} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.85 * eo(T, CUT.END + 0.5, 0.4)}>JUNO</text>
                <text x={960} y={430} textAnchor="middle" opacity={eo(T, CUT.END, 0.3)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 104 }} fill="url(#gec)">《差一分钱》</text>
                <text x={960} y={650} textAnchor="middle" opacity={eo(T, CUT.END + 1.0, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.06em' }} fill={C.cream}>你上次被「.99」打动，买了什么？</text>
              </svg>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 706, display: 'flex', justifyContent: 'center', opacity: endO * eo(T, CUT.END + 1.3, 0.4) }}>
                <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', opacity: endO * eo(T, CUT.END + 1.6, 0.4), fontFamily: F.sans, fontSize: 26, color: 'rgba(239,232,218,.88)', lineHeight: '38px' }}>
                <div>资料：Thomas & Morwitz, J. Consumer Research 2005 · Lacetera, Pope & Sydnor, AER 2012</div>
                <div>Anderson & Simester, Quant. Marketing & Economics 2003 · Olenski et al., NEJM 2020</div>
              </div>
              <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: pr(T, CUT.FIN - 0.5, 0.5) }} />
            </>
          )}
          {/* the motif on the end card: the price tag, in gold */}
          {endO > 0 && <Canvas dep={f} draw={(g) => { g.save(); g.globalAlpha = endO * eo(T, CUT.END + 0.6, 0.4); tag(g, 960, 528, 0.55, -0.05, '9.99', { col: '#8a6420' }); g.restore(); }} />}
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>
          <Subs T={T} lines={LINES.filter(([a]) => a < CUT.END && a !== at('e6')) as any} />
        </>
      )}
    </AbsoluteFill>
  );
};

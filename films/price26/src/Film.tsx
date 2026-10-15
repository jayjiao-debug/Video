/* 《差一分钱》: one long documentary take over a case desk. Every object lies at its own station on the desk; the camera
   glides from station to station, each glide landing on a beat. Text that belongs to the desk (annotations) is drawn
   in the picture so it moves with the camera; subtitles, slates and the slammed words sit on the glass. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit, rnd, glowDot } from './kit';
import { sparks } from './lightkit';
import { tag, tray, placeValue, odometer, graphPaper, cliffChart, catalogue, calendarPage, chart, pencil, GOLD, MAG } from './props';
import { LINES, CUT, at, till, bt, near, B, SLAM80, FILM_FRAMES } from './time';
import { JUNO } from './brand/identity';
export { FILM_FRAMES };

type G = CanvasRenderingContext2D;
const GL = '#f6d58e', MG = '#ff9ed6';
// station origins on the desk (each is a 1920×1080 "page" of the desk)
const ST = { A: [0, 0], C: [2300, 0], D: [4600, 0], E: [4600, 1500], F: [2300, 1500], G: [0, 1500] } as const;
const ctr = (k: keyof typeof ST, dx = 0, dy = 0) => [ST[k][0] + 960 + dx, ST[k][1] + 540 + dy] as const;

/* ---------------------------------------------------------------- camera: arrive at each key on a beat */
type Key = { t: number; c: readonly [number, number]; s: number; d?: number };
const KEYS: Key[] = [
  { t: 0, c: ctr('A', 60, 20), s: 1.0 },
  { t: CUT.S1, c: ctr('C'), s: 1.0, d: 1.3 },
  { t: CUT.S2, c: ctr('D', 0, -30), s: 1.0, d: 1.3 },
  { t: CUT.S3, c: ctr('E', -400, 0), s: 1.35, d: 1.4 },
  { t: near(at('c5')), c: ctr('E', 420, -60), s: 1.12, d: 1.1 },
  { t: near(at('c7')), c: ctr('E', 330, -20), s: 1.45, d: 1.0 },
  { t: near(at('c9')), c: ctr('E', 300, 40), s: 1.08, d: 1.0 },
  { t: CUT.S4, c: ctr('F', 0, -20), s: 1.0, d: 1.3 },
  { t: CUT.S5, c: ctr('G', 0, -40), s: 1.0, d: 1.4 },
  { t: CUT.S6, c: ctr('A', 120, 0), s: 1.18, d: 1.6 },
];
const camAt = (T: number) => {
  let i = 0; while (i < KEYS.length - 1 && T >= KEYS[i + 1].t - (KEYS[i + 1].d ?? 1)) i++;
  const k = KEYS[i], n = KEYS[i + 1];
  if (n && T >= n.t - (n.d ?? 1)) { const q = eio(T, n.t - (n.d ?? 1), n.d ?? 1); return { x: lerp(k.c[0], n.c[0], q), y: lerp(k.c[1], n.c[1], q), s: lerp(k.s, n.s, q) * (1 + 0.025 * Math.sin(q * Math.PI) * -1) }; }
  // hold: a slow documentary drift
  const hold = (n ? n.t - (n.d ?? 1) : CUT.FIN) - k.t;
  const q = pr(T, k.t, Math.max(1, hold));
  return { x: k.c[0] + 14 * q, y: k.c[1] - 8 * q, s: k.s * (1 + 0.035 * q) };
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
const pctType = (s: string, t0: number, T: number) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((T - t0) / 0.07))));
const stamp = (T: number, t0: number) => eo(T, t0, 0.22);

const stationA = (g: G, T: number) => {
  // the hook: the tag turns over on the first hit, 10.00 → 9.99
  const f = T < 0.402 ? 0 : clamp((T - 0.402) / 0.28);
  const txt = f < 0.5 ? '10.00' : '9.99';
  const drop = T < 0.2 ? 1.06 : 1;
  tag(g, 1060, 560, 1.75 * drop, -0.08, txt, { flip: f < 1 ? f : 0 });
  if (T > 0.402) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 1060, 560, 0.402, T, 90, GOLD, 1.6, 3); g.restore(); }
  pencil(g, 1560, 930, -0.5);
  // the take-home: a note card slides in beside the tag, and the pencil writes ≈10 on it
  if (T > at('f2') - 0.3) {
    const a = eo(T, at('f2') - 0.3, 0.5), w = eio(T, at('f3') + 0.2, 0.9);
    g.save(); g.translate(1560, 735 + (1 - a) * 50); g.rotate(0.07); g.globalAlpha = a;
    g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
    g.fillStyle = '#f3ead6'; g.fillRect(-170, -95, 340, 190); g.shadowColor = 'transparent';
    g.strokeStyle = 'rgba(120,150,190,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-150, -40 + i * 40); g.lineTo(150, -40 + i * 40); g.stroke(); }
    g.save(); g.beginPath(); g.rect(-170, -95, 340 * w, 190); g.clip();
    g.fillStyle = '#26232e'; g.font = '900 118px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('≈10', 0, 6); g.restore();
    g.restore();
  }
};

const stationC = (g: G, T: number) => {
  const d1 = near(at('a3') + 0.1), d2 = d1 + 2 * B;
  tray(g, 300, 330, 560, 420, '9块多', hit(T, d1, 0.6) + (T > at('a4') ? 0.6 : 0), GOLD);
  tray(g, 1060, 330, 560, 420, '10块', hit(T, d2, 0.6) * 0.8 + (T > at('a4') ? 0.4 : 0), '255,214,190');
  const fall = (t0: number) => (T < t0 - 0.35 ? -1 : eo(T, t0 - 0.35, 0.35));
  const k1 = fall(d1), k2 = fall(d2);
  if (k1 >= 0) tag(g, 600, lerp(-200, 520, k1), lerp(1.2, 0.85, k1), -0.12, '9.99');
  if (k2 >= 0) tag(g, 1360, lerp(-200, 520, k2), lerp(1.2, 0.85, k2), 0.08, '10.00');
  // the gap: ¥0.01, chalked between the trays
  if (T > at('a4')) {
    const a = eo(T, at('a4'), 0.4);
    g.save(); g.globalAlpha = a; g.strokeStyle = `rgba(${GOLD},.9)`; g.lineWidth = 4; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(880, 540); g.lineTo(1040, 540); g.stroke(); g.setLineDash([]);
    g.fillStyle = `rgb(${GOLD})`; g.font = '700 46px "JunoMono"'; g.textAlign = 'center'; g.fillText('¥0.01', 960, 500);
    g.restore();
  }
};

const stationD = (g: G, T: number) => {
  const a = eo(T, CUT.S2 - 0.6, 0.6);
  const k0 = eo(T, at('b3') + 0.3, 0.7), kAll = eo(T, at('b5'), 0.9);
  const ks = [Math.max(k0, kAll), kAll, kAll, T > at('b4') ? 1 : 0, T > at('b4') ? 1 : 0];
  placeValue(g, 960, 300, '79900', ks, T > at('b3') ? 0 : -1, T > at('b4') && T < at('b5') ? 4 : -1, a);
  if (T > at('b6')) {   // ticks: reading only the first digit is right almost every time
    const q = eo(T, at('b6'), 0.5);
    g.save(); g.globalAlpha = q; g.strokeStyle = `rgba(${GOLD},.95)`; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(1560, 650); g.lineTo(1610, 700); g.lineTo(1700, 590); g.stroke(); g.restore();
  }
};

const stationE = (g: G, T: number) => {
  // the odometer rolls over at the carry, ending on a beat
  const r0 = at('c3') + 0.2, r1 = near(r0 + 2.4);
  const v = T < r0 ? 79990 : T < r1 ? 79990 + 10 * (1 - Math.pow(1 - pr(T, r0, r1 - r0), 2)) : 80000;
  odometer(g, 560, 520, 1.15, v);
  if (T > r1) { g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, 560 - 240, 520, 220, 0.4 * hit(T, r1, 0.8) + (T > at('c4') ? 0.12 : 0), MAG); sparks(g, 330, 520, r1, T, 60, MAG, 1.2, 5); g.restore(); }
  // the cliff chart on graph paper
  graphPaper(g, 1020, 170, 760, 620, 0.03);
  const ck = eio(T, at('c5'), at('c7') - at('c5') - 0.2);
  g.save(); g.translate(1400, 480); g.rotate(0.03); g.translate(-1400, -480);
  cliffChart(g, 1090, 230, 620, 470, ck, T > at('c7') - 0.3 ? 80000 : -1);
  const px = (m: number) => 1090 + (m - 50000) / 60000 * 620;
  if (T > at('c7')) {   // −$200 across the 80k cliff
    const q = eo(T, at('c7'), 0.4);
    g.globalAlpha = q; g.fillStyle = 'rgb(176,40,74)'; g.font = '900 52px "JunoMono"'; g.textAlign = 'left'; g.fillText('−$200', px(80000) + 18, 470);
    g.strokeStyle = 'rgba(176,40,74,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(px(80000) + 6, 452); g.lineTo(px(80000) + 16, 452); g.stroke();
    g.globalAlpha = 1;
  }
  if (T > at('c8')) { const q = eo(T, at('c8'), 0.4); g.globalAlpha = q; g.fillStyle = '#3a2a1a'; g.font = '700 34px "JunoMono"'; g.textAlign = 'right'; g.fillText('79.8k→79.9k: −$10', px(79000), 330); g.globalAlpha = 1; }
  if (T > at('c9')) {   // more cars come to auction just before each 10,000
    const q = eo(T, at('c9'), 0.8);
    for (let m = 52000; m < 110000; m += 1000) {
      const near10 = (m % 10000) >= 8000 ? 1 + 2.6 * ((m % 10000) - 8000) / 2000 : 1;
      const hh = 18 * near10 * q * (0.8 + 0.4 * rnd(m, 3));
      g.fillStyle = near10 > 1.5 ? 'rgba(176,40,74,.8)' : 'rgba(58,42,26,.5)'; g.fillRect(px(m) - 3, 700 - hh, 6, hh);
    }
  }
  g.restore();
};

const stationF = (g: G, T: number) => {
  const a = eo(T, CUT.S4 - 0.7, 0.6);
  g.save(); g.globalAlpha = a;
  const sold = eo(T, near(at('d3') + 0.1), 0.9);
  catalogue(g, 370, 180, ['$34', '$39', '$44'], [0.75, 1.0, 0.75], sold, T > at('d3') ? 1 : -1);
  if (T > at('d3') + 0.6) { const q = eo(T, at('d3') + 0.6, 0.3); g.globalAlpha = q; g.fillStyle = '#9a6a1c'; g.font = '900 60px "JunoMono"'; g.textAlign = 'left'; g.fillText('+⅓', 960 + 140, 330); g.globalAlpha = 1; }
  if (T > at('d5')) {   // the 3 in $34 and $39: both "thirty-something"
    const q = eio(T, at('d5'), 0.6);
    const ring = (x: number, col: string) => { g.strokeStyle = col; g.lineWidth = 6; g.beginPath(); g.ellipse(x, 640, 36, 52, -0.15, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2); g.stroke(); };
    ring(370 + 200 - 2, `rgba(${GOLD},.95)`); ring(370 + 590 - 2, `rgba(${GOLD},.95)`); ring(370 + 980 - 2, 'rgba(176,40,74,.9)');
  }
  g.restore();
};

const stationG = (g: G, T: number) => {
  const a = eo(T, CUT.S5 - 0.7, 0.6);
  g.save(); g.globalAlpha = a; g.translate(960, 470); g.scale(0.82, 0.82); g.translate(-960, -470);
  const in1 = eo(T, at('e3'), 0.5), in2 = eo(T, at('e3') + 0.25, 0.5);
  g.save(); g.translate(0, (1 - in1) * 60); g.globalAlpha *= in1; chart(g, 560, 470, '还差几周满80岁', pctType('7.0%', at('e4') + 1.2, T), '#2a2016', -0.05); g.restore();
  g.save(); g.translate(0, (1 - in2) * 60); g.globalAlpha *= in2; chart(g, 1360, 470, '刚过80岁', pctType('5.3%', at('e5') + 0.6, T), '#b0284a', 0.04); g.restore();
  // the calendar flips from 79 to 80 on the slam
  const flipped = T >= SLAM80;
  calendarPage(g, 960, 250, 0.8, flipped ? '80' : '79', '生日', flipped ? eo(T, SLAM80 + 0.15, 0.4) : 0);
  if (T > SLAM80 - 0.25 && T < SLAM80 + 0.25) { const q = pr(T, SLAM80 - 0.25, 0.5); g.save(); g.translate(960, 250); g.scale(0.8, 0.8 * Math.abs(Math.cos(q * Math.PI))); g.fillStyle = '#f3ede0'; g.fillRect(-150, -100, 300, 270); g.restore(); }
  g.restore();
  if (T >= SLAM80) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 300, SLAM80, T, 140, MAG, 2.2, 9); g.restore(); }
};

/* ---------------------------------------------------------------- the film */
const LOADS = [...FONT_LOADS, '900 40px "Noto Serif CJK SC"'];
const GLYPHS = '¥$0123456789.,+−→≈⅓块多只便宜了一分钱为什么感觉一大截你定也被这骗过读个数我们从左往右看到第位大脑就开始估进格子硬是两这是不说明很笨其实聪明的捷径最边代表七万后那什么都决定有所以平时几乎对还省力它会出错偏在进位刻再多跳成值没变判断却了美国多万笔二手车拍卖记录里里程表每过整英里价掉截比贵约美元可之间差卖家懂快时送去突然定人站道悬崖上女装目录做实验同条裙子标三个反而卖得更好起来专业呢年研究者翻查老医保数据样心脏病发作住院还几周满岁搭桥手术刚过有被归进其他前没落差笨太下次先心里把读成生日差一分钱为看比便那么评论区坑过资料';
const Slate: React.FC<{ s: string; a: number }> = ({ s, a }) => (a <= 0 ? null : <div style={{ position: 'absolute', left: 110, top: 140, opacity: a, fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(239,232,218,.88)' }}>{s}</div>);
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
            const dim = Math.max(0.62 * titleO, endO);
            if (dim > 0) { g.fillStyle = `rgba(4,3,3,${dim})`; g.fillRect(0, 0, 1920, 1080); }
            if (T >= CUT.TITLE && T < CUT.T_OUT) { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 380, CUT.TITLE, T, 160, GOLD, 2.4, 21); g.restore(); }
          }} />
          <Grade warm={0.06} />
          <Grain T={T} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.1 * hit(T, 0.402, 0.08) + 0.14 * hit(T, CUT.TITLE, 0.08) + 0.16 * hit(T, SLAM80, 0.08), mixBlendMode: 'screen' }} />
          <Bars />
          {/* slates: where the evidence comes from */}
          <Slate s="NYU · THOMAS & MORWITZ · 2005" a={slateA(T, at('a2'), CUT.S2 - 0.6)} />
          <Slate s="22,000,000 USED-CAR AUCTIONS · LACETERA, POPE & SYDNOR" a={slateA(T, at('c5'), CUT.S4 - 0.6)} />
          <Slate s="ANDERSON & SIMESTER · 2003" a={slateA(T, at('d2'), CUT.S5 - 0.6)} />
          <Slate s="MEDICARE · NEJM 2020" a={slateA(T, at('e2'), CUT.S6 - 0.6)} />
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
              只差几周，就被归进了<span style={{ color: MG }}>「80多岁」</span>
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
                <text x={960} y={650} textAnchor="middle" opacity={eo(T, CUT.END + 1.0, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.06em' }} fill={C.cream}>你被哪个"9.9"坑过？评论区说说</text>
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
          {endO > 0 && <Canvas dep={f} draw={(g) => { g.save(); g.globalAlpha = endO * eo(T, CUT.END + 0.6, 0.4); tag(g, 960, 540, 0.62, -0.05, '9.99', { col: '#8a6420' }); g.restore(); }} />}
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>
          <Subs T={T} lines={LINES.filter(([a]) => a < CUT.END && a !== at('e6')) as any} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* 《这车真能飞？》 the analysis cut. The same one-take car runs underneath; on top, each stunt is taken apart and judged:
   0–10.5 hook · 10.5 title · 15–30 倒挂 (rewind, x-ray, 1970→2026 timeline, stamp on 28.8) · 30–44 翻身 (slowed flight,
   action/reaction, the rocket's nitrogen thrusters, stamp on 44.4) · 45–67 飞 (the tank, ≈300 kg, ≈10 s, helicopter vs car,
   4.6 g, stamp on 66.8) · 69–83 现实 (2017 promises vs now, 2028 on 77.5, stamp on 80.1) · 83–90 end card.
   Numbers: 600 L (Tesla, on stage) · up to ~690 bar (MotorTrend) · ≈300 kg / ≈10 s are our estimates (labelled). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grain, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit } from './kit';
import { car, plume, arrow, ribbon, withCam, toScreen, freePose, carToWorld, carDir, RW, GOLD, CYAN, RED, type Pose } from './world';
import { stateAt, camAt, stage, dust, streaks, label, LANDX, KEYS, type K } from './Film';
import { need, type Line } from './time';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
const CREAM = '243,237,226', DIM = '200,200,210';
export const FIN2 = 89.8;
export const ANALYSIS_FRAMES = Math.round(FIN2 * 30);
const END = 83.0;
const L = (a: number, s: string): Line => [a, a + need(s), s];
const LINES2: Line[] = [
  L(0.3, '特斯拉新跑车：倒挂、翻身、飞过一排车'),
  L(4.0, '看起来，像科幻片'),
  L(7.0, '是真本事，还是{营销}？'),
  // title 10.54
  L(15.1, '倒回去，先看第一招：[倒挂]'),
  L(18.4, '车底风扇抽气，外面空气把车[按住]'),
  L(21.7, '这招，50多年前就有人玩过'),
  L(24.65, '2025年，已有车在台架上倒开过'),
  L(28.95, '[真本事]，但不是新本事'),
  L(31.5, '第二招：[空中翻身]'),
  L(33.7, '原理：气往一边喷，车往[反方向]转'),
  L(36.8, '火箭上，用的是[同一类喷口]'),
  L(39.6, '难的不是原理，是[控制]'),
  L(42.1, '10个喷口，什么时候喷、喷多久'),
  L(45.1, '第三招：[飞过一排车]'),
  L(47.6, '它背着600升压缩气'),
  L(50.3, '估算一下：这罐气有多重？'),
  L(52.9, '全部喷完，最多悬停[十秒左右]'),
  L(56.0, '直升机推外面的空气，能[一直飞]'),
  L(59.1, '它推自己背的气，用完就{落地}'),
  L(62.1, '0.59秒到60英里，约4.6g'),
  L(66.95, '轮胎做不到，只能靠[喷气]'),
  L(69.7, '最大的{问号}，不在技术'),
  L(72.3, '2017年说：2020年交车'),
  L(75.3, '续航、座位，都{缩水}了'),
  L(77.55, '现在说：2028年才量产'),
  L(80.3, '马斯克说：{安全}不是主要目标'),
];
const HITS = { TITLE: 10.54, V1: 28.8, V2: 44.44, V3: 66.81, Y2028: 77.46, V4: 80.06 };
const KEYS2: K[] = [...KEYS.filter((k) => k.t < 67), { t: 67.4, s: 0.6, ox: -200, oy: -380, d: 2 }, { t: 70.4, s: 0.62, ox: 430, oy: -470, d: 2.4 }];

/* ================================================================ boards */
const panel = (g: G, x: number, y: number, w: number, h: number, a: number, edge = `rgba(${GOLD},.35)`, op = 0.86) => {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.fillStyle = `rgba(8,10,18,${op})`; g.strokeStyle = edge; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x, y, w, h, 18); g.fill(); g.stroke(); g.restore();
};
/** a verdict stamp: k = how far it has landed (0 → 1); it lands big and settles */
const stamp = (g: G, x: number, y: number, big: string, small: string, col: string, k: number, r = 110, rot = -0.12) => {
  if (k <= 0) return;
  const s = lerp(1.7, 1, eo(k, 0, 1)), a = clamp(k * 3);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha *= a;
  g.strokeStyle = `rgba(${col},.95)`; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r - 13, 0, 7); g.stroke();
  g.fillStyle = 'rgba(8,10,18,.6)'; g.beginPath(); g.arc(0, 0, r - 13, 0, 7); g.fill();
  g.fillStyle = `rgb(${col})`; g.font = `900 ${big.length === 1 ? r * 0.8 : r * 0.5}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(big, 0, -r * 0.12);
  g.font = `700 ${r * 0.26}px "Noto Sans CJK SC"`; g.fillText(small, 0, r * 0.45);
  g.restore();
};
const STAMPS: { t: number; big: string; small: string; col: string; slot: string; x: number; y: number }[] = [
  { t: HITS.V1, big: '真', small: '但不新', col: GOLD, slot: '倒挂', x: 975, y: 770 },
  { t: HITS.V2, big: '真', small: '难在控制', col: GOLD, slot: '翻身', x: 1480, y: 380 },
  { t: HITS.V3, big: '能跳', small: '不能飞', col: RED, slot: '飞', x: 1480, y: 380 },
  { t: HITS.V4, big: '存疑', small: '要等2028', col: RED, slot: '交车', x: 1700, y: 750 },
];
/** generic low race car with a fan at the tail (no livery, no real design) */
const fanCar = (g: G, x: number, y: number, s: number, tone: string) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = tone; g.beginPath(); g.moveTo(-212, 0); g.lineTo(-220, -34); g.lineTo(-150, -44); g.lineTo(-40, -46); g.lineTo(-12, -74); g.lineTo(40, -74); g.lineTo(70, -46); g.lineTo(200, -34); g.lineTo(226, -10); g.lineTo(214, 0); g.closePath(); g.fill();
  g.fillStyle = '#0a0a0d'; for (const wx of [-130, 140]) { g.beginPath(); g.arc(wx, 0, 30, 0, 7); g.fill(); }
  g.strokeStyle = `rgba(${CYAN},.95)`; g.lineWidth = 3; g.beginPath(); g.arc(-185, -24, 18, 0, 7); g.stroke();
  g.restore();
};
const rocket = (g: G, x: number, y: number, s: number) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bg = g.createLinearGradient(-40, 0, 40, 0); bg.addColorStop(0, '#9aa0aa'); bg.addColorStop(0.5, '#e8e8ec'); bg.addColorStop(1, '#8a8f99');
  g.fillStyle = bg; g.fillRect(-30, -440, 60, 440); g.fillStyle = '#2a2d35'; g.fillRect(-30, -34, 60, 34);
  g.strokeStyle = '#3a3e48'; g.lineWidth = 5; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 26, -34); g.lineTo(sx * 76, 24); g.stroke(); }
  g.restore();
};
const heli = (g: G, x: number, y: number, s: number, T: number) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#3a3f4c';
  g.beginPath(); g.ellipse(0, 0, 120, 60, 0, 0, 7); g.fill(); g.fillRect(80, -14, 220, 20); g.fillRect(290, -50, 14, 60);
  g.fillRect(-6, -84, 12, 30); const w = 260 * Math.abs(Math.cos(T * 9)); g.strokeStyle = '#5a6070'; g.lineWidth = 8; g.beginPath(); g.moveTo(-w, -86); g.lineTo(w, -86); g.stroke();
  g.strokeStyle = 'rgba(160,170,190,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-260, -86); g.lineTo(260, -86); g.stroke();
  g.lineWidth = 6; g.strokeStyle = '#4a5060'; g.beginPath(); g.moveTo(-90, 64); g.lineTo(90, 64); g.stroke();
  g.fillStyle = '#0f1626'; g.beginPath(); g.ellipse(-60, -10, 50, 32, 0, 0, 7); g.fill();
  g.restore();
};
const tankG = (g: G, x: number, y: number, w: number, h: number, fill: number) => {
  g.save(); g.beginPath(); (g as any).roundRect(x, y, w, h, w / 2); g.clip();
  g.fillStyle = '#1a1c24'; g.fillRect(x, y, w, h);
  const fy = y + h * (1 - fill), tg = g.createLinearGradient(0, fy, 0, y + h); tg.addColorStop(0, `rgba(${CYAN},.85)`); tg.addColorStop(1, `rgba(${CYAN},.35)`); g.fillStyle = tg; g.fillRect(x, fy, w, h * fill);
  g.strokeStyle = 'rgba(255,240,200,.16)'; g.lineWidth = 2; for (let i = -h; i < w + h; i += 18) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i - h, y + h); g.stroke(); }
  g.restore();
  g.strokeStyle = `rgba(${GOLD},.9)`; g.lineWidth = 4; g.beginPath(); (g as any).roundRect(x, y, w, h, w / 2); g.stroke();
};
const lab = (g: G, s: string, x: number, y: number, size: number, col: string, a: number, align: CanvasTextAlign = 'left', weight = 700, font = 'Noto Sans CJK SC') => label(g, s, x, y, size, col, align, weight, font, a);

/** boards enter with a small spring (rise + settle) and leave with a lift; tin = first visible, tout = gone */
type MV = { a: number; s: number; dy: number };
const mv = (T: number, tin: number, tout: number): MV => {
  const i = pr(T, tin, 0.45), o = pr(T, tout - 0.4, 0.4);
  const back = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  return { a: Math.min(clamp(i * 2.2), 1 - eio(o, 0, 1)), s: lerp(0.9, 1, back(i)) * lerp(1, 0.97, eio(o, 0, 1)), dy: (1 - back(i)) * 60 - 50 * eio(o, 0, 1) };
};
const bxf = (g: G, m: MV, cx: number, cy: number) => { g.translate(cx, cy + m.dy); g.scale(m.s, m.s); g.translate(-cx, -cy); };
const num = (v: number, d = 0) => (d ? v.toFixed(d) : String(Math.round(v)));

/* ================================================================ the film */
const GLYPHS = '特斯拉新跑车倒挂翻身飞过一排看起来像科幻片是真本事还营销三个绝活哪这能风扇吸地被逐出只比场夺冠随即禁静止下压力约2吨台架上着开喷气发布会演示但不新火箭用的同类口冷推进缩反方向转猎鹰9号级滑行时氮姿态示意难在控制10什么候久它背最够悬停秒左右600升现说高690巴据≈300公斤估算钟表盘全部完把托空中重速度理想限直升机外面不就落跳0到英里平均4.6g轮胎给宣称分靠第三实测大问号交件2017承诺2026续航620座位版本仅邀请路马克安主要目标存疑等尾评论区打资料·—→《》倒带慢放定格×¼‖◀年1970197820252028现在缩水抽按住空气';
const TITLE = '这车真能飞？';
export const Analysis: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('analysis', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '900 40px "Noto Serif CJK SC"', '900 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const titleO = T < HITS.TITLE - 0.05 ? 0 : 1 - pr(T, 14.3, 0.5);
  const endO = eo(T, END, 0.7);
  const markO = (1 - (T >= HITS.TITLE - 0.3 && T < 14.8 ? 1 : 0)) * (1 - endO);
  const xray = Math.min(eo(T, 18.6, 0.6), 1 - pr(T, 28.2, 0.6));
  const rewind = Math.min(eo(T, 15.0, 0.2), 1 - pr(T, 18.2, 0.2));
  const slow = Math.max(Math.min(eo(T, 30.6, 0.4), 1 - pr(T, 44.0, 0.4)), Math.min(eo(T, 56.5, 0.4), 1 - pr(T, 61.1, 0.4)));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <Canvas dep={f} draw={(g) => {
            // impact: a short decaying shake when a verdict stamp lands
            const sh = STAMPS.reduce((acc, s) => acc + (T >= s.t + 0.18 ? Math.exp(-(T - s.t - 0.18) / 0.09) : 0), 0);
            if (sh > 0.01) { g.translate(960 + 16 * sh * Math.sin(T * 97), 540 + 11 * sh * Math.cos(T * 83)); g.scale(1.025, 1.025); g.translate(-960, -540); }
            const st = stateAt(T), cam = camAt(T, KEYS2), p: Pose = st.p, sy = st.sy;
            // the timeline board (21.6–30.4) sits on a frozen, dimmed frame
            const mTL = mv(T, 21.5, 30.5), tlA = mTL.a;
            stage(g, T, cam, Math.max(xray * 0.7, tlA));
            const toS = (x: number, y: number) => toScreen(cam, x, y);
            withCam(g, cam, () => {
              dust(g, LANDX, 10.54, T); dust(g, LANDX, 44.44, T); dust(g, LANDX - 4700, 66.81, T, 0.8);
              if (st.ground) { g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(p.x, 4, 400, 14, 0, 0, 7); g.fill(); }
              else if (p.y > -1400) { const k = clamp(1 - (-p.y) / 1400); g.fillStyle = `rgba(0,0,0,${0.4 * k})`; g.beginPath(); g.ellipse(p.x, 4, 400 * (0.6 + 0.4 * k), 12, 0, 0, 7); g.fill(); }
              streaks(g, p, st.streak * (1 - xray));
              if (st.down > 0) for (const lx of [300, 120, -140, -300]) plume(g, ...carToWorld(p, sy, lx, 44), carDir(p, sy, Math.PI / 2), 640, st.down, T, lx);
              if (st.rear > 0) plume(g, ...carToWorld(p, sy, -382, -30), carDir(p, sy, Math.PI), 620, st.rear, T, 9);
              const tanks = Math.min(eo(T, 47.6, 0.4), 1 - pr(T, 52.5, 0.4));
              car(g, p, { sy, spin: st.spin, rim: 1, under: st.under * (1 - xray), xray: Math.max(xray, 0.6 * Math.min(eo(T, 42.0, 0.4), 1 - pr(T, 44.6, 0.4)), 0.5 * tanks), fans: xray, tanks: Math.max(0.3 * xray, tanks), nozzles: Math.min(eo(T, 42.0, 0.4), 1 - pr(T, 44.6, 0.4)), T });
              if (st.side > 0) plume(g, ...carToWorld(p, sy, 20, 0), Math.PI / 2 + 0.35, 520, st.side, T, 7, 0);
              // x-ray: air pulled out from under the car; the outside air pressing it up
              if (xray > 0) {
                for (let i = 0; i < 8; i++) {
                  const lx0 = 330 - i * 88, fx = lx0 > -20 ? 110 : -150, pts: [number, number][] = [];
                  for (let k = 0; k <= 30; k++) {
                    const q = k / 30; let lx: number, ly: number;
                    if (q < 0.35) { const u = q / 0.35; lx = lerp(lx0, fx, u); ly = lerp(52, 38, u * u); }
                    else if (q < 0.7) { const u = (q - 0.35) / 0.35; lx = lerp(fx, -380, u); ly = lerp(38, 22, u); }
                    else { const u = (q - 0.7) / 0.3; lx = -380 - 260 * u; ly = 22 - 6 * u + (i - 3.5) * 9 * u; }
                    pts.push(carToWorld(p, 1, lx, ly));
                  }
                  g.save(); g.setLineDash([26, 18]); g.lineDashOffset = -T * 160; ribbon(g, pts, CYAN, 2.5, 0.8 * xray * (1 - tlA), 0); g.restore();
                }
                for (let i = 0; i < 6; i++) {
                  const a = eo(T, 19.4 + i * 0.07, 0.4) * xray * (1 - tlA), lx = [-330, -220, -110, 110, 220, 330][i], [x, y] = carToWorld(p, 1, lx, -330 - 30 * (1 - a));
                  if (a > 0) arrow(g, x, y, -Math.PI / 2, 150, 26, `rgba(${GOLD},.92)`, a);
                }
              }
              // action / reaction
              const nr = Math.min(eo(T, 34.4, 0.3), 1 - pr(T, 37.4, 0.3));
              if (nr > 0) { const [x, y] = carToWorld(p, sy, 380, 0); arrow(g, x + 30 * Math.cos(carDir(p, sy, 0)), y, carDir(p, sy, 0), 220, 30, `rgba(${GOLD},.95)`, nr); }
            });
            // ---------------------------------------------------------------- boards (screen space)
            // hook: three empty rings waiting for a verdict
            const hr = Math.min(eo(T, 7.4, 0.5), 1 - pr(T, 10.2, 0.4));
            if (hr > 0) ['倒挂', '翻身', '飞'].forEach((t, i) => { const x = 660 + i * 300, y = 220; g.save(); g.globalAlpha = hr * eo(T, 7.4 + i * 0.12, 0.4); g.setLineDash([10, 10]); g.strokeStyle = `rgba(${GOLD},.8)`; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 76, 0, 7); g.stroke(); g.restore(); lab(g, t, x, y, 38, GOLD, hr * eo(T, 7.4 + i * 0.12, 0.4), 'center', 900, 'Noto Serif CJK SC'); });
            // x-ray labels
            if (xray > 0 && tlA < 1) {
              const [ex, ey] = toS(...carToWorld(p, 1, -520, 16)), a = eo(T, 19.0, 0.4) * xray * (1 - tlA);
              lab(g, '风扇抽走车底的空气', ex - 150, ey + 90, 30, CYAN, a);
              lab(g, '外面的空气，把车按在顶上', 1180, 880, 34, GOLD, eo(T, 19.6, 0.4) * xray * (1 - tlA));
            }
            // 倒挂: the timeline
            if (tlA > 0) {
              g.save(); bxf(g, mTL, 960, 520);
              panel(g, 100, 170, 1720, 700, tlA, `rgba(${GOLD},.35)`, 0.95);
              g.save(); g.globalAlpha *= tlA;
              const xs = [330, 760, 1190, 1620], yrs = ['1970', '1978', '2025', '2026'];
              const names = [['Chaparral 2J', '风扇吸地', '被逐出 Can-Am'], ['Brabham BT46B', '只比一场，夺冠', '随即被禁'], ['McMurtry', '静止下压力约2吨', '台架上倒着开'], ['特斯拉', '倒挂 + 喷气', '发布会演示']];
              const tl = eio(T, 21.8, 1.6);
              g.strokeStyle = `rgba(${GOLD},.6)`; g.lineWidth = 3; g.beginPath(); g.moveTo(220, 640); g.lineTo(220 + 1500 * tl, 640); g.stroke();
              xs.forEach((x, i) => {
                const k = eo(T, i < 2 ? 22.0 + i * 0.7 : 24.6 + (i - 2) * 0.9, 0.5); if (k <= 0) return;
                g.save(); g.globalAlpha *= k; g.translate(0, (1 - k) * 20);
                g.fillStyle = `rgb(${i === 3 ? RED : GOLD})`; g.beginPath(); g.arc(x, 640, 10, 0, 7); g.fill();
                label(g, yrs[i], x, 690, 44, i === 3 ? RED : GOLD, 'center', 900, 'JunoMono');
                if (i < 3) fanCar(g, x, 520, 0.85, i === 2 ? '#3a3f4c' : '#2e323d'); else { g.save(); g.translate(x, 520); g.scale(0.45, 0.45); car(g, freePose(0, -RW, 0), { rim: 1 }); g.restore(); }
                label(g, names[i][0], x, 270, 30, CREAM, 'center', 700, 'Cormorant Garamond');
                label(g, names[i][1], x, 320, 26, DIM, 'center'); label(g, names[i][2], x, 358, 26, DIM, 'center');
                g.restore();
              });
              g.restore();
              g.restore();
            }
            // 翻身: the rocket inset
            const mR = mv(T, 36.6, 42.2), ra = mR.a;
            if (ra > 0) {
              g.save(); bxf(g, mR, 1560, 490);
              panel(g, 1300, 170, 520, 640, ra, `rgba(${CYAN},.4)`);
              g.save(); g.globalAlpha *= ra; rocket(g, 1560, 740, 1.0);
              plume(g, 1528, 330, Math.PI + 0.2, 180, 1, T, 5, 0.4); plume(g, 1592, 330, -0.2, 180, 1, T * 1.1, 6, 0.4); g.restore();
              lab(g, '火箭一级 · 氮气喷口调姿态（示意）', 1560, 780, 22, DIM, ra, 'center');
              g.restore();
            }
            const nz = Math.min(eo(T, 42.2, 0.3), 1 - pr(T, 44.6, 0.3));
            if (nz > 0) { const [x, y] = toS(...carToWorld(p, sy, 300, -34)); lab(g, '喷口 ×10', x + 40, y - 120, 36, CYAN, nz, 'left', 900); }
            // 飞: the tank and the hover clock
            const mT = mv(T, 47.5, 56.1), ta = mT.a;
            if (ta > 0) {
              g.save(); bxf(g, mT, 500, 405);
              panel(g, 90, 170, 820, 470, ta);
              g.save(); g.globalAlpha *= ta; tankG(g, 140, 210, 120, 380, lerp(1, 0.08, eio(T, 53.0, 2.4))); g.restore();
              lab(g, `${num(600 * eo(T, 47.7, 0.7))}升（特斯拉现场说）`, 300, 240, 32, CREAM, ta); lab(g, '最高约690巴（据MotorTrend）', 300, 286, 26, DIM, ta);
              lab(g, `≈ ${num(300 * eo(T, 51.4, 0.8))}公斤气（估算）`, 300, 350, 38, CYAN, ta * eo(T, 51.3, 0.25), 'left', 900);
              const ck = eo(T, 52.9, 0.4) * ta;
              if (ck > 0) {
                g.save(); g.globalAlpha *= ck; g.translate(560, 500); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 18; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.stroke();
                g.strokeStyle = `rgba(${GOLD},.95)`; g.beginPath(); g.arc(0, 0, 90, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (10 / 60) * eio(T, 53.0, 2.4)); g.stroke(); g.restore();
                lab(g, `≈${num(10 * eio(T, 53.0, 2.4))}秒`, 700, 480, 56, GOLD, ck, 'left', 900, 'JunoMono'); lab(g, '一分钟表盘上的10秒', 700, 536, 22, DIM, ck);
                lab(g, '估算：车约2吨，喷速按理想上限', 300, 610, 22, DIM, ck);
              }
              g.restore();
            }
            // 飞: helicopter vs car
            const mH = mv(T, 55.9, 62.4), he = mH.a;
            if (he > 0) {
              g.save(); bxf(g, mH, 500, 430);
              panel(g, 90, 170, 820, 520, he, `rgba(${CYAN},.4)`);
              g.save(); g.globalAlpha *= he; g.beginPath(); g.rect(90, 170, 820, 520); g.clip();
              heli(g, 300, 380, 0.62, T);
              for (let i = 0; i < 4; i++) { const yy = 250 + ((T * 120 + i * 30) % 60); arrow(g, 210 + i * 60, yy - 40, Math.PI / 2, 50, 10, `rgba(${CYAN},.5)`); arrow(g, 210 + i * 60, 450, Math.PI / 2, 110, 14, `rgba(${CYAN},.8)`); }
              g.save(); g.translate(690, 410); g.scale(0.42, 0.42); car(g, freePose(0, 0, 0), { rim: 1, xray: 0.5, tanks: 1 }); g.restore();
              for (const dx of [-90, 90]) plume(g, 690 + dx, 430, Math.PI / 2, 150, 1, T, dx, 0.4);
              g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.beginPath(); g.moveTo(500, 200); g.lineTo(500, 660); g.stroke();
              g.restore();
              lab(g, '空气：无限', 300, 630, 32, CYAN, he, 'center');
              lab(g, '气：只有一罐', 690, 630, 32, RED, he * eo(T, 59.1, 0.4), 'center');
              g.restore();
            }
            // 4.6 g
            const mG = mv(T, 62.0, 69.9), ga = mG.a;
            if (ga > 0) {
              g.save(); bxf(g, mG, 540, 370);
              panel(g, 90, 170, 900, 400, ga);
              const bar = (y: number, v: number, t: string, val: string, col: string, k: number) => { g.save(); g.globalAlpha *= ga; g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(330, y, 560, 60); g.fillStyle = `rgba(${col},.9)`; g.fillRect(330, y, 560 * v / 5 * k, 60); g.restore(); lab(g, t, 310, y + 30, 28, CREAM, ga, 'right'); lab(g, val.replace('#', num(v * k, 1)), 340 + 560 * v / 5 * k, y + 30, 36, col, ga * clamp(k * 3), 'left', 900, 'JunoMono'); };
              bar(240, 1.1, '轮胎能给的', '约1g', CREAM, eo(T, 62.3, 0.5));
              bar(350, 4.63, '它宣称的', '#g', GOLD, eo(T, 63.0, 0.9));
              lab(g, '差的约3.5g，全靠喷气', 540, 470, 32, GOLD, ga * eo(T, 64.2, 0.4), 'center');
              lab(g, '0.59秒：特斯拉宣称，未经第三方实测', 540, 520, 22, DIM, ga, 'center');
              g.restore();
            }
            // 现实: promises vs now
            const mP = mv(T, 71.9, END + 0.4), pa = mP.a;
            if (pa > 0) {
              g.save(); bxf(g, mP, 1400, 510);
              panel(g, 960, 160, 880, 700, pa);
              lab(g, '2017年 承诺', 1360, 220, 30, DIM, pa, 'center'); lab(g, '现在', 1660, 220, 30, GOLD, pa, 'center');
              const rows: [string, string, string, number][] = [['交车', '2020年', '2028年量产', 72.3], ['续航', '620英里', '300多英里', 75.4], ['座位', '4个', '最多2个', 75.8], ['会飞的版本', '—', '仅邀请·不能上路', 76.2]];
              rows.forEach(([k, a, b, t0], i) => {
                const y = 300 + i * 86, ka = eo(T, t0, 0.4) * pa; if (ka <= 0) return;
                g.save(); g.globalAlpha *= ka; g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(1000, y - 32, 800, 64); g.restore();
                lab(g, k, 1030, y, 28, CREAM, ka); lab(g, a, 1360, y, 30, DIM, ka, 'center');
                const kb = i === 0 ? eo(T, HITS.Y2028, 0.3) : ka;
                if (i === 0) { g.save(); g.translate(1660, y); g.scale(lerp(1.6, 1, kb), lerp(1.6, 1, kb)); lab(g, b, 0, 0, 32, GOLD, pa * kb, 'center', 900); g.restore(); if (T < HITS.Y2028) lab(g, '……', 1660, y, 32, DIM, ka, 'center'); }
                else lab(g, b, 1660, y, 28, RED, kb, 'center', 900);
              });
              lab(g, '马斯克："安全不是主要目标"', 1030, 680, 30, CREAM, pa * eo(T, 80.2, 0.4));
              g.restore();
            }
            // verdict stamps: land big at centre-right, hold, then fly to the scoreboard (top left)
            STAMPS.forEach((s, i) => {
              if (T < s.t || i === 3 && T > END) return;
              const land = pr(T, s.t, 0.22), fly = eio(T, s.t + 2.2, 0.7);
              const bigX = s.x, bigY = s.y, sx = 110 + i * 112, sy2 = 866;
              const x = lerp(bigX, sx, fly), y = lerp(bigY, sy2, fly), r = lerp(i === 0 ? 92 : 118, 48, fly);
              if (fly < 1 && land < 1) { g.save(); g.globalCompositeOperation = 'lighter'; const gg = g.createRadialGradient(bigX, bigY, 0, bigX, bigY, 260); gg.addColorStop(0, `rgba(${s.col},${0.35 * (1 - land)})`); gg.addColorStop(1, `rgba(${s.col},0)`); g.fillStyle = gg; g.fillRect(bigX - 260, bigY - 260, 520, 520); g.restore(); }
              stamp(g, x, y, s.big, s.small, s.col, land * (1 - endO), r);
              const w = pr(T, s.t + 0.12, 0.55);
              if (w > 0 && w < 1) { g.save(); g.strokeStyle = `rgba(${s.col},${0.8 * (1 - w)})`; g.lineWidth = 6 * (1 - w) + 1; g.beginPath(); g.arc(bigX, bigY, r * (1 + 1.4 * eo(w, 0, 1)), 0, 7); g.stroke(); g.restore(); }
            });
            // the empty scoreboard slots from the first verdict on
            if (T > HITS.V1 + 2.2 && endO < 1) STAMPS.forEach((s, i) => { if (T < s.t + 2.9) { g.save(); g.globalAlpha = 0.5 * (1 - endO); g.setLineDash([6, 6]); g.strokeStyle = `rgba(${GOLD},.6)`; g.lineWidth = 2; g.beginPath(); g.arc(110 + i * 112, 866, 44, 0, 7); g.stroke(); g.restore(); } lab(g, s.slot, 110 + i * 112, 800, 20, DIM, 1 - endO, 'center'); });
            // vignette; title and end card on a dimmed frame
            const v = g.createRadialGradient(960, 540, 420, 960, 540, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080);
            const dim = Math.max(0.5 * titleO, 0.74 * endO);
            if (dim > 0) { g.fillStyle = `rgba(4,4,8,${dim})`; g.fillRect(0, 0, 1920, 1080); }
            if (endO > 0) STAMPS.forEach((s, i) => stamp(g, 600 + i * 240, 250, s.big, s.small, s.col, eo(T, END + 0.2 + i * 0.12, 0.3), 82, i % 2 ? 0.05 : -0.1));
          }} />
          <Grain T={T} />
          <Bars />
          {rewind > 0 && <Ind s="◀◀  倒带" o={rewind} />}
          {xray > 0 && T < 21.6 && <Ind s="‖  定格" o={xray * (1 - pr(T, 21.2, 0.4))} />}
          {slow > 0 && <Ind s="慢放 ×¼" o={slow} />}
          {titleO > 0 && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: titleO * eo(T, HITS.TITLE + 0.3, 0.4), fontFamily: F.lat, fontWeight: 600, fontSize: 28, letterSpacing: '0.3em', color: C.gold }}>ROADSTER · McGREGOR, TEXAS · 2026.10.15</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 284, textAlign: 'center', opacity: titleO, fontFamily: F.serif, fontWeight: 900, fontSize: 140, lineHeight: '190px', whiteSpace: 'nowrap' }}>
                {['《', ...TITLE, '》'].map((c, i) => {
                  const t0 = i === 0 || i === TITLE.length + 1 ? HITS.TITLE : HITS.TITLE + (i - 1) * 0.6518 / 2, k = eo(T, t0, 0.22);
                  return <span key={i} style={{ display: 'inline-block', opacity: T < t0 ? 0 : k, transform: `scale(${lerp(1.4, 1, k)})`, background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' }}>{c}</span>;
                })}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', opacity: titleO * eo(T, HITS.TITLE + 1.0, 0.4), fontFamily: F.serif, fontWeight: 700, fontSize: 50, color: C.cream, textShadow: '0 4px 20px rgba(0,0,0,.9)' }}>三个绝活，哪个是真本事？</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 574, textAlign: 'center', opacity: 0.9 * titleO * eo(T, HITS.TITLE + 1.3, 0.4), fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'rgba(239,232,218,.9)' }}>Stunt or substance?</div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', opacity: titleO * eo(T, HITS.TITLE + 1.6, 0.4), fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>— {JUNO.series} —</div>
            </>
          )}
          {endO > 0 && (
            <>
              <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: endO }}>
                <defs><linearGradient id="gec2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
                <text x={960} y={470} textAnchor="middle" opacity={eo(T, END + 0.6, 0.3)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 100 }} fill="url(#gec2)">《这车真能飞？》</text>
                <text x={960} y={590} textAnchor="middle" opacity={eo(T, END + 1.0, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.06em' }} fill={C.cream}>真本事还是营销？评论区打一个</text>
              </svg>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', opacity: endO * eo(T, END + 1.3, 0.4) }}>
                <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 750, textAlign: 'center', opacity: endO * eo(T, END + 1.6, 0.4), fontFamily: F.sans, fontSize: 24, color: 'rgba(239,232,218,.88)', lineHeight: '36px' }}>
                <div>资料：TechCrunch · Fox Business · Electrek · MotorTrend（2026.10）</div>
                <div>Motorsport Magazine · PlanetF1 · The Drive · Motor1 · Cosmos · AIAA</div>
                <div>约300公斤、约10秒为本片估算；画面为示意，车辆为原创造型</div>
              </div>
            </>
          )}
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>{JUNO.mark}</div>
          <Subs T={T} lines={LINES2 as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
const Ind: React.FC<{ s: string; o: number }> = ({ s, o }) => (
  <div style={{ position: 'absolute', right: 64, top: 150, opacity: o, fontFamily: F.sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: 'rgba(243,237,226,.85)', padding: '6px 16px', borderRadius: 6, background: 'rgba(8,6,5,.55)' }}>{s}</div>
);
void hit;

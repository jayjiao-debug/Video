/* The light scenes: the economy as 10,000 households, one light each ("microfoundations" made literal).
   Canvas, additive gold. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, H, LNUM, Canvas, glowDot, Note, Chapter, clamp, pr, eo, eio, lerp, hit, rnd, easeInOut } from './kit';
import { CUT, bt } from './time';

/* ---------------------------------------------------------------- the city of 10,000 households on a ground plane */
const N = 10000;
const CL = Array.from({ length: 46 }, (_, i) => ({ u: rnd(i, 21), v: 0.04 + rnd(i, 22) * 0.96, r: 0.02 + rnd(i, 23) * 0.06 }));
export const proj = (u: number, v: number) => { const k = Math.pow(v, 1.5); return { x: 960 + (u - 0.5) * (700 + 2900 * k), y: 250 + 720 * k, z: 0.35 + 1.9 * k }; };
const gauss = (i: number, k: number) => Math.sqrt(-2 * Math.log(rnd(i, k) + 1e-6)) * Math.cos(6.283 * rnd(i, k + 1));
const HOUSE = Array.from({ length: N }, (_, i) => {
  let u: number, v: number;
  const kind = rnd(i, 30);
  if (kind < 0.62) { const c = CL[Math.floor(rnd(i, 31) * CL.length)]; u = c.u + gauss(i, 32) * c.r; v = c.v + gauss(i, 34) * c.r * 0.7; }
  else if (kind < 0.86) { const st = Math.floor(rnd(i, 36) * 9); u = rnd(i, 37); v = 0.08 + st * 0.11 + gauss(i, 38) * 0.004; }
  else { const st = Math.floor(rnd(i, 39) * 11); u = 0.04 + st * 0.093 + gauss(i, 40) * 0.003; v = rnd(i, 41); }
  u = clamp(u, -0.1, 1.1); v = clamp(v, 0.01, 1);
  const P = proj(u, v);
  return { u, v, x: P.x, y: P.y, s: 0.55 * P.z + rnd(i, 3) * 0.5, h2m: rnd(i, 4) < 0.2, ph: rnd(i, 5) * 6.28 };
});
const WU = 0.5, WV = 0.5;
const cam = (g: CanvasRenderingContext2D, s: number, cx = 960, cy = 560) => { g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); };

/* ---------------------------------------------------------------- S5 · households become the economy (28.76 – 32.81) */
const curve = (u: number) => 560 - 150 * Math.sin(u * 5.2) * Math.exp(-u * 0.6) - 40 * u;
const drawAgg = (g: CanvasRenderingContext2D, T: number) => {
  const t = T - CUT.agg;
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  g.save(); cam(g, lerp(1.08, 1.0, eio(T, CUT.agg, 4)), 960, 600);
  g.globalCompositeOperation = 'lighter';
  const fieldIn = eo(T, CUT.agg, 0.6);
  for (let i = 0; i < N; i++) {
    const p = HOUSE[i];
    const flies = i % 5 !== 0; // 80 % of the lights fly up into the curve
    const st = 0.5 + rnd(i, 9) * 1.8, k = flies ? eio(t, st, 1.4) : 0;
    const u = rnd(i, 10), tx = 160 + u * 1600, ty = curve(u) + (rnd(i, 11) - 0.5) * 12;
    const x = p.x + (tx - p.x) * k, y = p.y + (ty - p.y) * k - 140 * Math.sin(k * Math.PI) * rnd(i, 12);
    const a = (0.5 + 0.14 * Math.sin(T * 1.6 + p.ph)) * fieldIn * (1 - k) + k * 0.75;
    g.fillStyle = k > 0 ? `rgba(255,${200 + 30 * k | 0},${130 + 40 * k | 0},${a})` : `rgba(150,165,200,${a})`;
    const sz = p.s * (1 - k) + 1.6 * k;
    g.fillRect(x - sz / 2, y - sz / 2, sz * 1.4, sz * 1.4);
  }
  const lineK = eo(t, 2.4, 1.2);
  for (let j = 0; j < 160; j++) { const u = j / 159; if (u > lineK) break; glowDot(g, 160 + u * 1600, curve(u), 24, 0.07); }
  g.restore();
};
export const S5: React.FC<{ T: number; f: number }> = ({ T, f }) => (
  <AbsoluteFill style={{ background: '#050506' }}>
    <Canvas dep={f} draw={(g) => drawAgg(g, T)} />
    <Note x={120} y={150} s="每一个光点 = 一个家庭" o={eo(T, CUT.agg + 0.3, 0.5)} />
    <div style={{ position: 'absolute', left: 1500, top: 300, fontFamily: F.serif, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', color: C.goldHi, opacity: eo(T, CUT.agg + 2.8, 0.5) }}>= 整个经济</div>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- S8 · the city of windows, the transfer (63.18 – 73.31) */
type Win = { x: number; y: number; w: number; h: number; layer: number; h2m: boolean; on: number };
const TOWERS: { x: number; w: number; h: number; layer: number }[] = [];
for (let layer = 0; layer < 3; layer++) {
  const sc = 0.55 + layer * 0.3, n = 14 - layer * 3;
  for (let b = 0; b < n; b++) TOWERS.push({ layer, w: (80 + rnd(b, layer) * 90) * sc, h: (300 + rnd(b, layer + 7) * 420) * sc, x: (b / n) * 2100 - 120 + rnd(b, 3) * 40 });
}
const WINS: Win[] = [];
TOWERS.forEach((tw, b) => {
  const sc = 0.55 + tw.layer * 0.3, base = 980;
  const cols = Math.max(2, Math.floor(tw.w / (14 * sc))), rows = Math.floor(tw.h / (20 * sc));
  for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) {
    const id = b * 997 + r * 31 + c + tw.layer * 5000;
    WINS.push({ x: tw.x + 4 * sc + c * (tw.w - 8 * sc) / cols, y: base - tw.h + r * 20 * sc, w: 7 * sc, h: 10 * sc, layer: tw.layer, h2m: rnd(id, 2) < 0.2, on: rnd(id, 1) });
  }
});
const drawCity = (g: CanvasRenderingContext2D, T: number) => {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a0d18'); sky.addColorStop(1, '#04050a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.save(); cam(g, lerp(1.0, 1.08, eio(T, CUT.city, 10)), 1100, 700);
  const RAIN = CUT.build, SPEND = 66.6;
  TOWERS.forEach((tw) => { g.fillStyle = `rgb(${12 + tw.layer * 6},${14 + tw.layer * 6},${22 + tw.layer * 6})`; g.fillRect(tw.x, 980 - tw.h, tw.w, tw.h); });
  for (let i = 0; i < WINS.length; i++) {
    const w = WINS[i]; if (w.on < 0.3) continue;
    const a0 = (0.3 + w.layer * 0.25);
    const saver = eo(T, RAIN + 0.6 + w.on * 1.2, 0.5) * 0.25;            // the forward-looking 80 %: a faint, steady warmth
    const spend = w.h2m ? eo(T, SPEND + w.on * 0.8, 0.25) : 0;           // the hand-to-mouth 20 %: they light up
    const a = a0 * (w.h2m ? lerp(0.45, 1.6, spend) : 0.45 + saver);
    g.fillStyle = w.h2m && spend > 0 ? `rgba(255,214,130,${clamp(a)})` : `rgba(150,120,80,${clamp(a * 0.55)})`;
    g.fillRect(w.x, w.y, w.w, w.h);
    if (spend > 0.5 && w.layer === 2) glowDot(g, w.x + 3, w.y + 5, 24, 0.22 * spend);
  }
  // the transfer: gold strands and coins falling from RAIN
  if (T > RAIN - 0.2) {
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 160; i++) {
      const born = RAIN + rnd(i, 8) * 3.2, age = T - born; if (age < 0) continue;
      const x = rnd(i, 4) * W, y = 80 + age * (380 + 300 * rnd(i, 5)), l = 30 + rnd(i, 6) * 90; if (y > 1000) continue;
      const gr = g.createLinearGradient(x, y - l, x, y); gr.addColorStop(0, 'rgba(255,214,140,0)'); gr.addColorStop(1, `rgba(255,224,160,${0.25 + 0.5 * rnd(i, 7)})`);
      g.strokeStyle = gr; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y - l); g.lineTo(x, y); g.stroke();
    }
    for (let i = 0; i < 60; i++) {
      const born = RAIN + rnd(i, 18) * 3.4, age = T - born; if (age < 0) continue;
      const x = rnd(i, 14) * W + 30 * Math.sin(age * 3 + i), y = 80 + age * (260 + 200 * rnd(i, 15)); if (y > 1000) continue;
      g.fillStyle = 'rgba(255,220,150,.9)'; g.beginPath(); g.ellipse(x, y, 6, Math.max(0.6, 5 * Math.abs(Math.sin(age * 6 + i))), 0, 0, 6.3); g.fill(); glowDot(g, x, y, 18, 0.3);
    }
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
};
export const S8: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const barK = eo(T, 69.3, 0.6);
  return (
    <AbsoluteFill style={{ background: '#04050a' }}>
      <Canvas dep={f} draw={(g) => drawCity(g, T)} />
      <Note x={120} y={150} s="HALL & MISHKIN 1982 · 每户发 1000 · 按模型示意" o={eo(T, CUT.city + 0.3, 0.5)} />
      {barK > 0 && (
        <div style={{ position: 'absolute', left: 120, top: 196, width: 760, opacity: barK, padding: '14px 18px 4px', background: 'rgba(4,5,10,.7)' }}>
          <div style={{ display: 'flex', height: 30 }}>
            <div style={{ width: `${80 * barK}%`, background: 'rgba(150,120,80,.7)' }} />
            <div style={{ width: `${20 * barK}%`, background: '#f6d58e', boxShadow: '0 0 20px rgba(246,213,142,.6)' }} />
          </div>
          <div style={{ position: 'relative', height: 40, marginTop: 10, fontFamily: F.serif, fontWeight: 700, fontSize: 24, whiteSpace: 'nowrap' }}>
            <div style={{ position: 'absolute', left: 0, color: C.dim }}>约八成：存着，慢慢花</div>
            <div style={{ position: 'absolute', left: '80%', color: C.goldHi }}>约两成：当场花光</div>
          </div>
        </div>
      )}
      <Chapter n="III" t="霍尔" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S9 · Woodford's three equations, wired (73.31 – 79.38) */
const EQ = [
  { y: 330, label: '需求', terms: ['x', '=', 'Eₜxₜ₊₁', '−σ(i', '−', 'Eₜπₜ₊₁', '− rⁿ)'] },
  { y: 540, label: '物价', terms: ['π', '=', 'β', 'Eₜπₜ₊₁', '+ κx'] },
  { y: 750, label: '央行', terms: ['i', '=', 'φπ·π', '+ φx·x'] },
];
const EQ_X = [[420, 520, 700, 950, 1110, 1290, 1480], [420, 520, 640, 800, 1020], [420, 520, 700, 960]];
const termAt = (r: number, i: number) => CUT.wfd + 0.15 + r * 0.45 + i * 0.07;
const IGNITE = bt(147), WIRE = bt(149), PULSE = bt(151);
const BOX = EQ.flatMap((e, r) => e.terms.map((tm, i) => ({ x: EQ_X[r][i] + 40, y: e.y + 26, hot: tm.startsWith('E'), r })));
const PAIRS: [number, number][] = [];
BOX.forEach((a, i) => BOX.forEach((b, j) => { if (j > i && a.hot && (b.hot || b.r === 2) && b.r !== a.r) PAIRS.push([i, j]); }));
const bez = (a: { x: number; y: number }, b: { x: number; y: number }, u: number) => {
  const c1 = { x: a.x + 200, y: a.y + 40 }, c2 = { x: b.x - 200, y: b.y - 40 };
  const m = 1 - u; return { x: m * m * m * a.x + 3 * m * m * u * c1.x + 3 * m * u * u * c2.x + u * u * u * b.x, y: m * m * m * a.y + 3 * m * m * u * c1.y + 3 * m * u * u * c2.y + u * u * u * b.y };
};
const drawWires = (g: CanvasRenderingContext2D, T: number) => {
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,220,160,${(0.04 + 0.16 * rnd(i, 3)) * (0.6 + 0.4 * Math.sin(T * 0.8 + i))})`; g.fillRect(rnd(i, 1) * W, rnd(i, 2) * H - T * 6 * rnd(i, 4) % H, 1.5, 1.5); }
  const wk = eio(T, WIRE, 1.4);
  PAIRS.forEach(([ia, ib], n) => {
    const a = BOX[ia], b = BOX[ib], k = clamp(wk * 1.3 - n * 0.04);
    if (k <= 0) return;
    for (let s = 0; s < 4; s++) {
      g.strokeStyle = `rgba(255,214,140,${0.08 - s * 0.015})`; g.lineWidth = 0.8 + s * 1.4;
      g.beginPath(); for (let q = 0; q <= 40 * k; q++) { const P = bez(a, b, q / 40); if (q) g.lineTo(P.x, P.y); else g.moveTo(P.x, P.y); } g.stroke();
    }
    // pulses running along the wire, faster after PULSE
    const speed = T > PULSE ? 0.9 : 0.35;
    for (let q = 0; q < 3; q++) { const u = ((T * speed + q / 3 + n * 0.13) % 1); if (u > k) continue; const P = bez(a, b, u); glowDot(g, P.x, P.y, 10 + 10 * hit(T, PULSE, 0.3), 0.55); }
  });
  BOX.forEach((b) => { if (b.hot) glowDot(g, b.x, b.y - 10, 130, 0.08 * eo(T, IGNITE, 0.4) + 0.12 * hit(T, PULSE, 0.25)); });
  g.globalCompositeOperation = 'source-over';
};
export const S9: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const out = 1 - pr(T, CUT.gap - 0.12, 0.12);
  return (
    <AbsoluteFill style={{ background: '#050506', opacity: out }}>
      <Canvas dep={f} draw={(g) => drawWires(g, T)} />
      <div style={{ position: 'absolute', left: 230, top: 210, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: C.gold, opacity: eo(T, CUT.wfd, 0.4) }}>Michael Woodford · Interest and Prices · 2003</div>
      {EQ.map((e, r) => (
        <div key={r}>
          <div style={{ position: 'absolute', left: 230, top: e.y - 44, fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: 'rgba(239,232,218,.5)', opacity: eo(T, termAt(r, 0) - 0.1, 0.3) }}>{e.label}</div>
          {e.terms.map((tm, i) => {
            const hot = tm.startsWith('E'), k = eo(T, termAt(r, i), 0.3), ig = hot ? eo(T, IGNITE + r * 0.1, 0.3) : 0;
            return (
              <div key={i} style={{ position: 'absolute', left: EQ_X[r][i], top: e.y - 64 + (1 - k) * 18, opacity: k, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64,
                color: ig > 0 ? `rgb(${lerp(239, 246, ig)},${lerp(232, 213, ig)},${lerp(218, 142, ig)})` : C.cream,
                textShadow: ig > 0 ? `0 0 ${30 * ig}px rgba(246,213,142,.8), 0 0 ${80 * ig}px rgba(246,213,142,.4)` : 'none', ...LNUM }}>{tm}</div>
            );
          })}
        </div>
      ))}
      <div style={{ position: 'absolute', right: 230, top: 210, fontFamily: F.serif, fontWeight: 700, fontSize: 26, color: C.goldHi, letterSpacing: '0.12em', opacity: eo(T, IGNITE + 0.3, 0.4) }}>E = 大家的预期</div>
      <Chapter n="IV" t="伍德福德" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S10 · the sentence and the shockwave (79.38 – 89.51) */
const T0 = CUT.drop - 2.6; // local clock: wave at 2.6
const SW = { text: 0.3, dissolve: 1.6, wave: 2.6 };
const ringR = (t: number) => (t > SW.wave ? (t - SW.wave) * 260 * (1 - 0.05 * Math.min(8, t - SW.wave)) : -1);
const drawShock = (g: CanvasRenderingContext2D, T: number) => {
  const t = T - T0;
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  const LP = proj(WU, WV);
  const fieldIn = eo(t, 1.2, 1.4); // the city fades up out of the dark while the sentence burns
  const kick = t > SW.wave ? 0.025 * Math.exp(-(t - SW.wave) / 0.25) : 0;
  const s = lerp(1.0, 1.08, eio(t, 0, 10)) + kick, rise = lerp(0, -40, eio(t, 4, 6));
  g.save(); cam(g, s); g.translate(0, rise);
  const R = ringR(t);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < N; i++) {
    const p = HOUSE[i];
    const d = Math.hypot(p.u - WU, (p.v - WV) * 1.3) * 1000;
    const passed = R > 0 ? clamp((R - d) / 60) : 0;
    const front = R > 0 ? Math.exp(-Math.pow((R - d) / 28, 2)) : 0;
    const lift = front * 10;
    const idle = (0.42 + 0.12 * Math.sin(t * 1.6 + p.ph)) * fieldIn;
    const lum = idle * (1 - passed) + passed * (p.h2m ? 0.95 : 0.6) + front * 0.9;
    const x = p.x, y = p.y - lift * 1.4;
    if (passed > 0 || front > 0.05) {
      g.fillStyle = `rgba(255,${200 + 30 * passed | 0},${120 + 40 * passed | 0},${clamp(lum)})`;
      g.fillRect(x - p.s, y - p.s, p.s * 2.2, p.s * 2.2);
      if (front > 0.3) { g.strokeStyle = `rgba(255,226,170,${0.4 * front})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26 * front * p.s); g.stroke(); }
    } else if (lum > 0.01) {
      g.fillStyle = `rgba(150,165,200,${lum})`; g.fillRect(x - p.s * 0.7, y - p.s * 0.7, p.s * 1.5, p.s * 1.5);
    }
  }
  if (R > 0) {
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = `rgba(255,220,150,${(0.32 - k * 0.1) * Math.exp(-(t - SW.wave) / 3)})`; g.lineWidth = 6 - k * 2;
      g.beginPath();
      for (let a = 0; a <= 200; a++) { const th = (a / 200) * Math.PI * 2, rr = Math.max(0.001, (R - k * 14) / 1000); const P = proj(WU + Math.cos(th) * rr, WV + Math.sin(th) * rr / 1.3); if (a) g.lineTo(P.x, P.y); else g.moveTo(P.x, P.y); }
      g.stroke();
    }
    glowDot(g, LP.x, LP.y, 300 * Math.exp(-(t - SW.wave) / 0.5) + 40, 0.5 * Math.exp(-(t - SW.wave) / 0.8));
  }
  // the sentence, alone in the music's gap, then dissolving into light that falls to the landing point
  const msg = 'at least through mid-2013';
  if (t < SW.wave + 0.2) {
    g.font = '400 46px "DejaVu Sans Mono"'; const cw = 27.7, x0 = 960 - (msg.length * cw) / 2, y0 = 300;
    for (let j = 0; j < msg.length; j++) {
      const k = clamp((t - SW.dissolve - j * 0.02) / 0.9);
      const tx = x0 + j * cw, ty = y0;
      const typedIn = clamp((t - SW.text - j * 0.035) / 0.05);
      g.fillStyle = `rgba(246,213,142,${typedIn * (1 - k)})`; g.fillText(msg[j], tx, ty);
      if (typedIn > 0 && k < 0.05) glowDot(g, tx + 12, ty - 14, 30, 0.08 * typedIn);
      for (let q = 0; q < 14; q++) {
        if (k <= 0 || k >= 1) continue;
        const sx = tx + rnd(j * 31 + q, 7) * 24, sy = ty - rnd(j * 31 + q, 8) * 40;
        const e = easeInOut(k), px = sx + (LP.x - sx) * e + Math.sin(q + k * 6) * 30 * (1 - e), py = sy + (LP.y - sy) * e - 60 * Math.sin(e * Math.PI) * rnd(q, j);
        glowDot(g, px, py, 7, 0.55 * (1 - e * 0.3));
      }
    }
  }
  g.restore();
};
export const S10: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const t = T - T0, R = ringR(t);
  let n = 0; if (R > 0) for (let i = 0; i < N; i++) { const p = HOUSE[i]; if (Math.hypot(p.u - WU, (p.v - WV) * 1.3) * 1000 < R) n++; }
  const lab = eo(t, 2.0, 0.4);
  return (
    <AbsoluteFill style={{ background: '#050506' }}>
      <Canvas dep={f} draw={(g) => drawShock(g, T)} />
      <div style={{ position: 'absolute', left: 120, top: 150, opacity: lab, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: 'rgba(239,232,218,.55)', ...LNUM }}>
        10,000 个家庭 <span style={{ color: '#e3b765' }}>· 改变计划的 {n.toLocaleString('en-US')}</span>
      </div>
      <div style={{ position: 'absolute', right: 120, top: 140, width: 220, padding: '16px 0', border: '1.5px solid rgba(239,232,218,.25)', textAlign: 'center', background: 'rgba(5,5,6,.6)', opacity: lab }}>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, letterSpacing: '0.2em', color: 'rgba(239,232,218,.55)' }}>政策利率</div>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 62, color: C.cream, ...LNUM }}>0%</div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, color: '#e3b765', letterSpacing: '0.2em' }}>一分没动</div>
      </div>
      <Note x={120} y={190} s="示意：每个光点代表一个家庭" o={lab * 0.8} />
    </AbsoluteFill>
  );
};

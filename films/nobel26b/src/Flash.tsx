/* 《一句话，让钱变便宜》 · the flashier look: the economy as 10,000 lights (one per household — "microfoundations"
   made literal), drawn on a canvas with additive gold light. Four stills + one 8 s motion test of the drop:
   the sentence dissolves into light, a shockwave crosses 10,000 households and every one changes its plan
   while the rate plate stays at 0 %. All drawn in code. */
import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';

const W = 1920, H = 1080;
const F = { serif: '"Noto Serif CJK SC", serif', sans: '"Noto Sans CJK SC", sans-serif', lat: '"Cormorant Garamond", Georgia, serif', mono: '"JunoMono", monospace', type: '"DejaVu Sans Mono", monospace' };
const GOLD = '#f6d58e', CREAM = '#efe8da';

/* deterministic random */
const rnd = (i: number, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7 + 0.5) * 43758.5453; return x - Math.floor(x); };
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

/* 10,000 households on a gently curved field (a city seen from above at night) */
const N = 10000;
const CL = Array.from({ length: 46 }, (_, i) => ({ u: rnd(i, 21), v: 0.04 + rnd(i, 22) * 0.96, r: 0.02 + rnd(i, 23) * 0.06 }));
const proj = (u: number, v: number) => { const k = Math.pow(v, 1.5); return { x: 960 + (u - 0.5) * (700 + 2900 * k), y: 250 + 720 * k, z: 0.35 + 1.9 * k }; };
const gauss = (i: number, k: number) => Math.sqrt(-2 * Math.log(rnd(i, k) + 1e-6)) * Math.cos(6.283 * rnd(i, k + 1));
const HOUSE = Array.from({ length: N }, (_, i) => {
  let u: number, v: number;
  const kind = rnd(i, 30);
  if (kind < 0.62) { const c = CL[Math.floor(rnd(i, 31) * CL.length)]; u = c.u + gauss(i, 32) * c.r; v = c.v + gauss(i, 34) * c.r * 0.7; }
  else if (kind < 0.86) { const st = Math.floor(rnd(i, 36) * 9); u = rnd(i, 37); v = 0.08 + st * 0.11 + gauss(i, 38) * 0.004; } // avenues
  else { const st = Math.floor(rnd(i, 39) * 11); u = 0.04 + st * 0.093 + gauss(i, 40) * 0.003; v = rnd(i, 41); }            // cross streets
  u = clamp(u, -0.1, 1.1); v = clamp(v, 0.01, 1);
  const P = proj(u, v);
  return { u, v, x: P.x, y: P.y, s: 0.55 * P.z + rnd(i, 3) * 0.5, h2m: rnd(i, 4) < 0.2, ph: rnd(i, 5) * 6.28 };
});
const WU = 0.5, WV = 0.5; // where the sentence lands

const useFonts = () => {
  const [h] = useState(() => delayRender('flash-fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '500 40px "Noto Sans CJK SC"', '700 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '700 20px "JunoMono"', '400 20px "DejaVu Sans Mono"']
      .map((f) => document.fonts.load(f, '一句话让钱变便宜0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return ok;
};
const FontFaces: React.FC = () => (
  <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
    @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
    @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; font-weight: 500; }`}</style>
);

/** a canvas that redraws synchronously every frame */
const Canvas: React.FC<{ draw: (g: CanvasRenderingContext2D) => void; dep: number }> = ({ draw, dep }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); draw(g);
  }, [dep, draw]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
const glowDot = (g: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, col = '255,214,140') => {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

const Chrome: React.FC<{ sub?: string; children?: React.ReactNode }> = ({ sub, children }) => (
  <>
    {children}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.7) 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain0.png')})`, backgroundSize: '1920px 1080px', opacity: 0.09, mixBlendMode: 'overlay' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 104, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 104, background: '#000' }} />
    <div style={{ position: 'absolute', right: 56, top: 36, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>
    {sub && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: F.sans, fontWeight: 500, fontSize: 50, letterSpacing: '0.05em', color: CREAM }}
      dangerouslySetInnerHTML={{ __html: sub.replace(/\[([^\]]+)\]/g, `<span style="color:${GOLD}">$1</span>`) }} />}
  </>
);

/* ------------------------------------------------------------------ the shockwave (motion test + still) */
const SW = { text: 0.3, dissolve: 1.6, wave: 2.6, end: 8 };
const drawShock = (g: CanvasRenderingContext2D, t: number) => {
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  const cx = 960, cy = 560; const LP = proj(WU, WV);
  // camera: slow push, a kick on the wave
  const kick = t > SW.wave ? 0.025 * Math.exp(-(t - SW.wave) / 0.25) : 0;
  const s = 1.0 + 0.04 * eio((t - 0) / SW.end) + kick;
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy);
  const R = t > SW.wave ? (t - SW.wave) * 260 * (1 - 0.05 * (t - SW.wave)) : -1;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < N; i++) {
    const p = HOUSE[i];
    const d = Math.hypot(p.u - WU, (p.v - WV) * 1.3) * 1000;
    const P0 = proj(WU, WV); const dx = p.x - P0.x, dy = p.y - P0.y, dd = Math.hypot(dx, dy) || 1;
    const passed = R > 0 ? clamp((R - d) / 60) : 0;
    const front = R > 0 ? Math.exp(-Math.pow((R - d) / 28, 2)) : 0;
    const lift = front * 10;
    const idle = 0.42 + 0.12 * Math.sin(t * 1.6 + p.ph);
    const lum = idle * (1 - passed) + passed * (p.h2m ? 0.95 : 0.55) + front * 0.9;
    const ux = dx / dd, uy = dy / dd;
    const x = p.x + ux * lift, y = p.y - lift * 1.4;
    if (passed > 0 || front > 0.05) {
      g.fillStyle = `rgba(255,${200 + 30 * passed | 0},${120 + 40 * passed | 0},${clamp(lum)})`;
      g.fillRect(x - p.s, y - p.s, p.s * 2.2, p.s * 2.2);
      if (front > 0.3) { g.strokeStyle = `rgba(255,226,170,${0.4 * front})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26 * front * p.s); g.stroke(); }
    } else {
      g.fillStyle = `rgba(150,165,200,${lum})`; g.fillRect(x - p.s * 0.7, y - p.s * 0.7, p.s * 1.5, p.s * 1.5);
    }
  }
  // the ring
  if (R > 0) {
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = `rgba(255,220,150,${(0.32 - k * 0.1) * Math.exp(-(t - SW.wave) / 3)})`; g.lineWidth = 6 - k * 2;
      g.beginPath();
      for (let a = 0; a <= 200; a++) { const th = (a / 200) * Math.PI * 2, rr = (R - k * 14) / 1000; const P = proj(WU + Math.cos(th) * rr, WV + Math.sin(th) * rr / 1.3); if (a) g.lineTo(P.x, P.y); else g.moveTo(P.x, P.y); }
      g.stroke();
    }
    const P0 = proj(WU, WV); glowDot(g, P0.x, P0.y, 300 * Math.exp(-(t - SW.wave) / 0.5) + 40, 0.5 * Math.exp(-(t - SW.wave) / 0.8));
  }
  // the sentence dissolving into light, sucked to the centre
  const msg = 'at least through mid-2013';
  if (t > SW.text && t < SW.wave + 0.2) {
    g.font = '400 46px "DejaVu Sans Mono"'; const cw = 27.7, x0 = cx - (msg.length * cw) / 2, y0 = 300;
    for (let j = 0; j < msg.length; j++) {
      const k = clamp((t - SW.dissolve - j * 0.02) / 0.9);
      const tx = x0 + j * cw, ty = y0;
      const a = clamp((t - SW.text) / 0.4) * (1 - k);
      g.fillStyle = `rgba(246,213,142,${a})`; g.fillText(msg[j], tx, ty);
      for (let q = 0; q < 14; q++) {
        if (k <= 0 || k >= 1) continue;
        const sx = tx + rnd(j * 31 + q, 7) * 24, sy = ty - rnd(j * 31 + q, 8) * 40;
        const e = eio(k), px = sx + (LP.x - sx) * e + Math.sin(q + k * 6) * 30 * (1 - e), py = sy + (LP.y - sy) * e - 60 * Math.sin(e * Math.PI) * rnd(q, j);
        glowDot(g, px, py, 7, 0.55 * (1 - e * 0.3));
      }
    }
  }
  g.restore();
  g.globalCompositeOperation = 'source-over';
};
const ShockLabels: React.FC<{ t: number }> = ({ t }) => {
  const R = t > SW.wave ? (t - SW.wave) * 260 * (1 - 0.05 * (t - SW.wave)) : 0;
  let n = 0; if (R > 0) for (let i = 0; i < N; i += 1) { const p = HOUSE[i]; if (Math.hypot(p.u - WU, (p.v - WV) * 1.3) * 1000 < R) n++; }
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: 150, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: 'rgba(239,232,218,.55)' }}>
        10,000 个家庭 <span style={{ color: '#e3b765' }}>· 改变计划的 {n.toLocaleString('en-US')}</span>
      </div>
      <div style={{ position: 'absolute', right: 120, top: 140, width: 220, padding: '16px 0', border: '1.5px solid rgba(239,232,218,.25)', textAlign: 'center', background: 'rgba(5,5,6,.6)' }}>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, letterSpacing: '0.2em', color: 'rgba(239,232,218,.55)' }}>政策利率</div>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 62, color: CREAM, fontFeatureSettings: "'lnum' 1" }}>0%</div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 20, color: '#e3b765', letterSpacing: '0.2em' }}>一分没动</div>
      </div>
    </>
  );
};
export const ShockTest: React.FC = () => {
  const ok = useFonts(); const f = useCurrentFrame(); const t = f / 30;
  return (
    <AbsoluteFill style={{ background: '#050506' }}>
      <FontFaces />
      {ok && <Chrome sub={t < SW.wave ? '利率不用动……' : '[话说清楚]，就够了'}><Canvas dep={f} draw={(g) => drawShock(g, t)} /><ShockLabels t={t} /></Chrome>}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ still A: households become the curve */
const drawAggregate = (g: CanvasRenderingContext2D) => {
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  const curve = (u: number) => 640 - 150 * Math.sin(u * 5.2) * Math.exp(-u * 0.6) - 40 * u; // a business cycle being damped
  for (let i = 0; i < 6000; i++) {
    const p = HOUSE[i];
    const k = rnd(i, 9); // how far along its flight into the curve
    const u = rnd(i, 10), tx = 160 + u * 1600, ty = curve(u) + (rnd(i, 11) - 0.5) * 10;
    const sx = p.x, sy = 760 + (p.y - 150) * 0.28;
    const e = eio(k), x = sx + (tx - sx) * e, y = sy + (ty - sy) * e - 120 * Math.sin(e * Math.PI) * rnd(i, 12);
    const a = 0.18 + 0.7 * e;
    g.fillStyle = `rgba(255,${190 + 40 * e | 0},${120 + 50 * e | 0},${a})`; g.fillRect(x, y, 1.6 + e, 1.6 + e);
    if (e > 0.2 && e < 0.85) { g.strokeStyle = `rgba(255,214,150,${0.12})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x - (tx - sx) * 0.02, y - (ty - sy) * 0.02 + 6); g.stroke(); }
  }
  for (let j = 0; j < 220; j++) { const u = j / 219; glowDot(g, 160 + u * 1600, curve(u), 26, 0.06); }
  g.globalCompositeOperation = 'source-over';
};
/* ------------------------------------------------------------------ still C: the three equations wired together */
const EQ = [
  { y: 330, label: '需求', terms: ['x', '=', 'Eₜxₜ₊₁', '−σ(i', '−', 'Eₜπₜ₊₁', '− rⁿ)'] },
  { y: 540, label: '物价', terms: ['π', '=', 'β', 'Eₜπₜ₊₁', '+ κx'] },
  { y: 750, label: '央行', terms: ['i', '=', 'φπ·π', '+ φx·x'] },
];
const drawWires = (g: CanvasRenderingContext2D, boxes: { x: number; y: number; hot: boolean }[]) => {
  g.fillStyle = '#050506'; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  // light paths between every "expectation" term and the central bank line: the model is one machine
  const hot = boxes.filter((b) => b.hot), bank = boxes.filter((b) => b.y > 700);
  for (const a of hot) for (const b of [...bank, ...hot]) {
    if (a === b) continue;
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = `rgba(255,214,140,${0.07 - k * 0.01})`; g.lineWidth = 0.8 + k * 1.2;
      g.beginPath(); g.moveTo(a.x, a.y); g.bezierCurveTo(a.x + 200, a.y + 40, b.x - 200, b.y - 40, b.x, b.y); g.stroke();
    }
    for (let q = 0; q < 40; q++) { const u = rnd(q, a.x + b.y); const x = (1 - u) ** 3 * a.x + 3 * (1 - u) ** 2 * u * (a.x + 200) + 3 * (1 - u) * u * u * (b.x - 200) + u ** 3 * b.x; const y = (1 - u) ** 3 * a.y + 3 * (1 - u) ** 2 * u * (a.y + 40) + 3 * (1 - u) * u * u * (b.y - 40) + u ** 3 * b.y; glowDot(g, x, y, 5, 0.35); }
  }
  for (const b of hot) glowDot(g, b.x, b.y - 10, 120, 0.07);
  // dust
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,220,160,${0.05 + 0.2 * rnd(i, 3)})`; g.fillRect(rnd(i, 1) * W, rnd(i, 2) * H, 1.5, 1.5); }
  g.globalCompositeOperation = 'source-over';
};
const EQ_X = [[420, 520, 700, 950, 1110, 1290, 1480], [420, 520, 640, 800, 1020], [420, 520, 700, 960]];
/* ------------------------------------------------------------------ still D: the city of windows, money raining */
const drawCity = (g: CanvasRenderingContext2D) => {
  g.fillStyle = '#04050a'; g.fillRect(0, 0, W, H);
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a0d18'); sky.addColorStop(1, '#04050a'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // towers of windows (perspective-free, layered for depth)
  for (let layer = 0; layer < 3; layer++) {
    const sc = 0.55 + layer * 0.3, base = 980, a = 0.35 + layer * 0.3;
    for (let b = 0; b < 14 - layer * 3; b++) {
      const bw = (80 + rnd(b, layer) * 90) * sc, bh = (300 + rnd(b, layer + 7) * 420) * sc, bx = (b / (14 - layer * 3)) * 2100 - 120 + rnd(b, 3) * 40;
      g.fillStyle = `rgba(${12 + layer * 6},${14 + layer * 6},${22 + layer * 6},1)`; g.fillRect(bx, base - bh, bw, bh);
      const cols = Math.max(2, Math.floor(bw / (14 * sc))), rows = Math.floor(bh / (20 * sc));
      for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) {
        const id = b * 997 + r * 31 + c + layer * 5000; if (rnd(id, 1) < 0.35) continue;
        const h2m = rnd(id, 2) < 0.2, wx = bx + 4 * sc + c * (bw - 8 * sc) / cols, wy = base - bh + r * 20 * sc;
        g.fillStyle = h2m ? `rgba(255,214,130,${a})` : `rgba(150,120,80,${a * 0.45})`; g.fillRect(wx, wy, 7 * sc, 10 * sc);
        if (h2m && layer === 2) glowDot(g, wx + 3, wy + 5, 22, 0.25);
      }
    }
  }
  // the transfer falling as gold streaks
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 140; i++) { const x = rnd(i, 4) * W, y = 120 + rnd(i, 5) * 760, l = 30 + rnd(i, 6) * 90; const gr = g.createLinearGradient(x, y - l, x, y); gr.addColorStop(0, 'rgba(255,214,140,0)'); gr.addColorStop(1, `rgba(255,224,160,${0.25 + 0.5 * rnd(i, 7)})`); g.strokeStyle = gr; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - 4, y - l); g.lineTo(x, y); g.stroke(); }
  for (let i = 0; i < 70; i++) { const x = rnd(i, 14) * W, y = 140 + rnd(i, 15) * 700; g.fillStyle = 'rgba(255,220,150,.9)'; g.beginPath(); g.ellipse(x, y, 6, 2.2 + 3 * rnd(i, 16), rnd(i, 17) * 3, 0, 6.3); g.fill(); glowDot(g, x, y, 18, 0.3); }
  g.globalCompositeOperation = 'source-over';
};

export const FlashKeys: React.FC = () => {
  const ok = useFonts(); const f = useCurrentFrame();
  const eqBoxes = EQ.flatMap((e, r) => e.terms.map((tm, i) => ({ x: EQ_X[r][i] + 40, y: e.y + 26, hot: tm.startsWith('E') })));
  return (
    <AbsoluteFill style={{ background: '#050506' }}>
      <FontFaces />
      {ok && f === 0 && (
        <Chrome sub="10,000 个家庭各自打算，[加起来]就是整个经济">
          <Canvas dep={f} draw={drawAggregate} />
          <div style={{ position: 'absolute', left: 120, top: 150, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: 'rgba(239,232,218,.55)' }}>每一个光点 = 一个家庭</div>
        </Chrome>
      )}
      {ok && f === 1 && (
        <Chrome sub="霍尔：每户发1000，八成[存着慢慢花]，两成[当场花光]"><Canvas dep={f} draw={drawCity} />
          <div style={{ position: 'absolute', left: 120, top: 150, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: 'rgba(239,232,218,.55)' }}>HALL & MISHKIN 1982 <span style={{ color: '#e3b765' }}>· 亮着的 = 钱到手就花</span></div>
        </Chrome>
      )}
      {ok && f === 2 && (
        <Chrome sub="三条式子，被同一样东西连在一起：[大家的预期]">
          <Canvas dep={f} draw={(g) => drawWires(g, eqBoxes)} />
          {EQ.map((e, r) => (
            <div key={r}>
              <div style={{ position: 'absolute', left: 230, top: e.y - 44, fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: 'rgba(239,232,218,.5)' }}>{e.label}</div>
              {e.terms.map((tm, i) => (
                <div key={i} style={{ position: 'absolute', left: EQ_X[r][i], top: e.y - 64, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64, color: tm.startsWith('E') ? GOLD : CREAM, textShadow: tm.startsWith('E') ? '0 0 30px rgba(246,213,142,.8), 0 0 80px rgba(246,213,142,.4)' : 'none' }}>{tm}</div>
              ))}
            </div>
          ))}
        </Chrome>
      )}
      {ok && f === 3 && (
        <Chrome sub="[话说清楚]，就够了"><Canvas dep={f} draw={(g) => drawShock(g, 3.6)} /><ShockLabels t={3.6} /></Chrome>
      )}
    </AbsoluteFill>
  );
};

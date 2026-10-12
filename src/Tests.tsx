/* Test reel: 5 cold-open hooks (track 0 – 4.46 s) and 5 title openings (track 12.05 – 20.66 s, title on the 16.606 hit).
   Each clip is shown with its real music and subtitles, after a one-second slate. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, glowDot, clamp, lerp, pr, eo, eio, pop, hit, rnd, easeInOut } from './kit';
import { textPts, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, strip, king, die, coin, FLOOR, W, H } from './hero';
import { Lb, Scene, add, cam } from './Scenes';
import { CUT, LINES, bt } from './time';

type G = CanvasRenderingContext2D;
type Clip = { tag: string; name: string; a: number; z: number; el: (T: number, f: number) => React.ReactNode };
const BLUE = '120,175,255', MAG = '255,110,205';
const HIT = CUT.title;

/* ================================================================ HOOKS (0 – 4.456) */
export const HOOK_END = CUT.cards;

/* H1 · three rank plaques drop, then the question splits the frame */
const plaque = (g: G, x: number, y: number, n: string) => {
  const w = 250, h = 320;
  const body = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); body.addColorStop(0, '#231a2b'); body.addColorStop(0.6, '#120d17'); body.addColorStop(1, '#07050a');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(x - w / 2, y - h, w, h, 14); g.fill();
  g.strokeStyle = 'rgba(255,170,225,.55)'; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x - w / 2 + 12, y - h + 12, w - 24, h - 24, 8); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - w / 2 + 14, y - h + 2); g.lineTo(x + w / 2 - 14, y - h + 2); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,190,230,.75)'; g.font = `700 34px "Noto Serif CJK SC"`; g.fillText('第', x, y - h + 62); g.fillText('名', x, y - 58);
  g.save(); g.shadowColor = 'rgba(255,110,205,.9)'; g.shadowBlur = 30; g.fillStyle = '#ffd1ea'; g.font = `700 150px "Cormorant Garamond"`; g.fillText(n, x, y - h / 2 + 4); g.restore();
};
const DROPS = [bt(0), bt(2), bt(4)];
export const H1: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const split = eio(T, bt(6), 0.45);
  // camera: slow dolly, plus a soft damped dip on each landing (no shake)
  const dip = DROPS.reduce((m, d) => m + (T < d ? 0 : 7 * Math.exp(-(T - d) * 6) * Math.sin((T - d) * 16)), 0);
  const FALL = 0.36;
  const drawPlaque = (g: G, i: number, tt: number, alpha = 1) => {
    const d = DROPS[i], k = clamp((tt - (d - FALL)) / FALL); if (k <= 0) return;
    const after = Math.max(0, tt - d);
    const bounce = tt < d ? 0 : 16 * Math.exp(-after * 8) * Math.abs(Math.sin(after * 15));
    const sq = tt < d ? 0 : 0.045 * Math.exp(-after * 12);
    const x = 560 + i * 400, y = FLOOR - (1 - k * k) * 620 - bounce;
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.scale(1 + sq * 0.6, 1 - sq); g.translate(-x, -y); plaque(g, x, y, ['8', '7', '8'][i]); g.restore();
  };
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.06, eio(T, 0, HOOK_END)), 960, 620); g.translate(0, dip);
      DROPS.forEach((d, i) => spot(g, 560 + i * 400, 420, 0.9 * eio(T, d - 0.35, 0.4), '255,200,235'));
      withReflection(g, () => DROPS.forEach((d, i) => {
        // a little motion blur while falling: two fading ghosts behind
        if (T < d) [0.008, 0.016, 0.024, 0.032].forEach((dt) => drawPlaque(g, i, T - dt, 0.09));
        drawPlaque(g, i, T);
      }), 0.22);
      floorFade(g);
      DROPS.forEach((d, i) => { if (T > d) add(g, () => { sparks(g, 560 + i * 400, FLOOR, d, T, 46, '255,170,225', 0.8, i); glowDot(g, 560 + i * 400, FLOOR, 220, 0.35 * Math.exp(-(T - d) * 4), '255,140,210'); }); });
      g.restore();
      if (split > 0) {
        add(g, () => { g.fillStyle = `rgba(${BLUE},${0.18 * split})`; g.fillRect(0, 0, 960, H); g.fillStyle = `rgba(${MAG},${0.18 * split})`; g.fillRect(960, 0, 960, H); const lg = g.createLinearGradient(930, 0, 990, 0); lg.addColorStop(0, 'rgba(255,244,220,0)'); lg.addColorStop(0.5, `rgba(255,244,220,${0.9 * split})`); lg.addColorStop(1, 'rgba(255,244,220,0)'); g.fillStyle = lg; g.fillRect(930, 0, 60, H * clamp(split * 1.4)); });
      }
    }}>
      <Lb x={960} y={120} s="最近三把" size={26} col="rgba(255,200,235,.8)" ls="0.4em" o={eo(T, 0.5, 0.4) * (1 - split)} />
      {[['菜？', 480, '#bcd6ff', 'rgba(120,175,255,.7)', 0], ['非？', 1440, '#ffc4e6', 'rgba(255,110,205,.7)', 0.12]].map(([s, x, col, sh, dl]) => {
        const k = eo(T, bt(6) + (dl as number), 0.45);
        return <div key={s as string} style={{ position: 'absolute', left: (x as number) - 300, width: 600, top: 240, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 24}px) scale(${lerp(1.12, 1, k)})`, fontFamily: F.serif, fontWeight: 900, fontSize: 150, color: col as string, textShadow: `0 0 40px ${sh}` }}>{s}</div>;
      })}
    </Scene>
  );
};

/* H2 · a multiple-choice question; the selection can't make up its mind */
const H2: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const panel = eo(T, bt(0), 0.3);
  // hesitation: own clock, getting faster (not on the beat)
  const PICKS = [1.7, 2.25, 2.68, 2.98, 3.2, 3.36];
  const n = PICKS.filter((p) => T >= p).length, last = n ? PICKS[n - 1] : 0;
  const finalC = T >= bt(6) + 0.08;
  const sel = finalC ? 2 : n === 0 ? -1 : (n - 1) % 2;
  const glide = n ? eo(T, last, 0.12) : 0;
  const prev = n >= 2 ? (n - 2) % 2 : sel;
  const rowY = (i: number) => 470 + i * 110;
  const selY = finalC ? lerp(rowY(sel === 2 ? (n - 1) % 2 : prev), rowY(2), eo(T, bt(6) + 0.08, 0.15)) : lerp(rowY(prev), rowY(Math.max(0, sel)), glide);
  const OPTS: [string, string, string][] = [['A', '我菜', '#a8ccff'], ['B', '我非', '#ffaee0'], ['C', '算一算才知道', C.goldHi]];
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 24, 0.8);
      spot(g, 960, 1300, 0.8 * panel, '235,225,255');
      add(g, () => glowDot(g, 960, 520, 700, 0.12 * panel, '200,190,255'));
      floorFade(g);
    }}>
      <div style={{ position: 'absolute', left: 410, top: 230 + (1 - panel) * 40, width: 1100, height: 600, opacity: panel, borderRadius: 26, background: 'linear-gradient(180deg, rgba(40,34,58,.82), rgba(14,12,22,.9))', border: '1.5px solid rgba(227,183,101,.55)', boxShadow: '0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12)' }}>
        <div style={{ position: 'absolute', left: 60, top: 40, fontFamily: F.sans, fontWeight: 700, fontSize: 22, letterSpacing: '0.4em', color: C.gold }}>单选题</div>
        <div style={{ position: 'absolute', left: 60, top: 82, fontFamily: F.serif, fontWeight: 900, fontSize: 60, color: '#f3ede2' }}>连输三把，原因是？</div>
        {sel >= 0 && <div style={{ position: 'absolute', left: 40, top: selY - 230 - 6, width: 1020, height: 86, borderRadius: 16, background: 'rgba(255,255,255,.07)', border: `1.5px solid ${OPTS[Math.max(0, sel)][2]}`, boxShadow: `0 0 30px ${sel === 1 ? 'rgba(255,110,205,.35)' : sel === 0 ? 'rgba(120,175,255,.35)' : 'rgba(255,214,140,.45)'}` }} />}
        {OPTS.map(([k, s, col], i) => {
          const o = i < 2 ? eo(T, [bt(1), bt(2)][i], 0.25) : eo(T, bt(6), 0.2);
          return (
            <div key={k} style={{ position: 'absolute', left: 80, top: rowY(i) - 230 + 8, opacity: o, display: 'flex', alignItems: 'center', gap: 34 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, border: `2px solid ${col}`, color: col, fontFamily: F.lat, fontWeight: 700, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k}</div>
              <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, color: col }}>{s}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

/* H3 · bullet comments: half blame skill, half blame luck */
const BUL: [string, number][] = [['菜就多练', 0], ['纯纯非酋', 1], ['运营稀烂', 0], ['卡池被吃光了', 1], ['这阵容也敢玩？', 0], ['一张都刷不到', 1], ['操作问题', 0], ['这就是命', 1], ['多看看攻略吧', 0], ['运气太差了', 1], ['站位不对', 0], ['系统针对你', 1], ['菜就多练', 0], ['非酋实锤', 1]];
const H3: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const settle = eio(T, bt(6), 0.3);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 26, 0.9);
      spot(g, 960, 900, 0.7, '235,225,255');
      floorFade(g);
      if (settle > 0) add(g, () => { glowDot(g, 640, 470, 360, 0.22 * settle, BLUE); glowDot(g, 1280, 470, 360, 0.22 * settle, MAG); });
    }}>
      {BUL.map(([s, side], i) => {
        const t0 = -0.9 + i * 0.2 + 0.1 * rnd(i, 3), sp = 560 + 260 * rnd(i, 4), x = W + 40 - (T - t0) * sp, y = 140 + ((i * 97) % 520) + 30 * rnd(i, 5);
        if (T < t0) return null;
        const big = i % 5 === 0;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, opacity: (1 - 0.85 * settle), whiteSpace: 'nowrap', padding: '8px 22px', borderRadius: 30, background: side ? 'rgba(255,110,205,.16)' : 'rgba(120,175,255,.16)', border: `1px solid ${side ? 'rgba(255,150,220,.5)' : 'rgba(150,190,255,.5)'}`, fontFamily: F.sans, fontWeight: 700, fontSize: big ? 44 : 32, color: side ? '#ffc4e6' : '#cfe0ff' }}>{s}</div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: settle, transform: `scale(${lerp(1.2, 1, settle)})`, fontFamily: F.serif, fontWeight: 900, fontSize: 150, letterSpacing: '0.06em' }}>
        <span style={{ color: '#bcd6ff', textShadow: '0 0 40px rgba(120,175,255,.8)' }}>菜</span>
        <span style={{ color: '#efe8da', fontSize: 70, margin: '0 40px', verticalAlign: 'middle' }}>还是</span>
        <span style={{ color: '#ffc4e6', textShadow: '0 0 40px rgba(255,110,205,.8)' }}>非</span>
        <span style={{ color: C.goldHi }}>？</span>
      </div>
    </Scene>
  );
};

/* H4 · split screen: skill on the left (a king falls), luck on the right (a die rolls a 1) */
const H4: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const fall = easeInOut(pr(T, bt(2), 0.55));
  const rollQ = pr(T, bt(3), 0.95);
  const hopH = rollQ < 1 ? Math.abs(Math.sin(rollQ * Math.PI * 3)) * 90 * (1 - rollQ) : 0;
  const faces: [number, number, number] = rollQ < 1 ? ([[3, 5, 6], [6, 4, 2], [2, 3, 6], [5, 1, 4]][Math.floor(rollQ * 4) % 4] as [number, number, number]) : [1, 2, 3];
  const seam = eo(T, bt(6), 0.3);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 18, 0.7);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, 0, HOOK_END)), 960, 640);
      spot(g, 480, 520, eo(T, bt(0), 0.2), '190,215,255'); spot(g, 1440, 520, eo(T, bt(0), 0.2), '255,200,235');
      withReflection(g, () => {
        const px = 480 + 74 * 0.95; g.save(); g.translate(px, FLOOR); g.rotate(-fall * 1.45 * -1); g.translate(-px, -FLOOR); king(g, 480, FLOOR, 0.95); g.restore();
        const dx = lerp(1700, 1440, eo(T, bt(3), 0.95)); g.save(); g.translate(dx, FLOOR - 62 - hopH); g.rotate(rollQ < 1 ? Math.sin(rollQ * 14) * 0.5 * (1 - rollQ) : 0); g.translate(-dx, -(FLOOR - 62 - hopH)); die(g, dx, FLOOR - 62 - hopH, 1.1, faces); g.restore();
      }, 0.25);
      floorFade(g);
      if (fall >= 1) add(g, () => sparks(g, 640, FLOOR - 10, bt(2) + 0.55, T, 40, BLUE, 0.7, 5));
      if (rollQ >= 1) add(g, () => { sparks(g, 1440, FLOOR - 40, bt(3) + 0.95, T, 40, MAG, 0.7, 6); glowDot(g, 1440, FLOOR - 140, 130, 0.4 * hit(T, bt(3) + 0.95, 0.4), MAG); });
      g.restore();
      add(g, () => { g.fillStyle = `rgba(${BLUE},.07)`; g.fillRect(0, 0, 960, H); g.fillStyle = `rgba(${MAG},.07)`; g.fillRect(960, 0, 960, H);
        const lg = g.createLinearGradient(950, 0, 970, 0); lg.addColorStop(0, 'rgba(255,244,220,0)'); lg.addColorStop(0.5, `rgba(255,244,220,${0.35 + 0.6 * seam})`); lg.addColorStop(1, 'rgba(255,244,220,0)'); g.fillStyle = lg; g.fillRect(950, 0, 20, H);
        if (seam > 0) glowDot(g, 960, 420, 260, 0.35 * seam, GOLD); });
    }}>
      <Lb x={480} y={140} s="菜" size={110} col="#bcd6ff" sub="操作" o={eo(T, 0.5, 0.3)} />
      <Lb x={1440} y={140} s="非" size={110} col="#ffc4e6" sub="手气" o={eo(T, 0.62, 0.3)} />
      <Lb x={480} y={FLOOR + 70} s="一步走错" size={30} col="#cfe0ff" o={eo(T, bt(2) + 0.6, 0.3)} />
      <Lb x={1440} y={FLOOR + 70} s="掷出 1 点" size={30} col="#ffc4e6" o={eo(T, bt(3) + 1.0, 0.3)} />
      <Lb x={960} y={330} s="？" size={140} col={C.goldHi} o={clamp(pop(T, bt(6), 0.3))} />
    </Scene>
  );
};

/* H5 · a balance: 菜 on one pan, 非 on the other; the losses fall in and it can't settle */
const H5: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const PX = 960, PY = 300, L = 380;
  // beam angle: damped responses to each weight (own physics, ω ≈ 7.5 rad/s)
  const kick = (t0: number, amp: number) => (T < t0 ? 0 : amp * Math.exp(-(T - t0) * 1.6) * Math.sin((T - t0) * 7.5));
  const W1 = bt(2), W2 = bt(4);
  const th = (T >= W1 ? 0.12 : 0) - (T >= W2 ? 0.12 : 0) + kick(W1, 0.16) - kick(W2, 0.2);
  const ends = [-1, 1].map((sg) => [PX + sg * L * Math.cos(th), PY + sg * L * Math.sin(th)] as [number, number]);
  const weight = (g: G, x: number, y: number) => { const w = 70, h = 54; const gr = g.createLinearGradient(x, y - h, x, y); gr.addColorStop(0, '#3a3a42'); gr.addColorStop(1, '#141418'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2 + 10, y - h); g.lineTo(x + w / 2 - 10, y - h); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fill(); g.fillStyle = '#ff6b7a'; g.font = '900 30px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('败', x, y - h / 2 + 2); };
  const third = T >= bt(6) - 0.4;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 20, 0.7);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, 0, HOOK_END)), 960, 560);
      spot(g, 960, 900, eo(T, bt(0), 0.2), '255,230,190');
      const brass = (x0: number, x1: number) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#5a3d12'); gr.addColorStop(0.5, '#f0cf86'); gr.addColorStop(1, '#5a3d12'); return gr; };
      withReflection(g, () => {
        g.fillStyle = brass(PX - 16, PX + 16); g.fillRect(PX - 9, PY, 18, FLOOR - PY - 30);
        g.fillStyle = brass(PX - 120, PX + 120); g.beginPath(); g.ellipse(PX, FLOOR - 16, 130, 22, 0, 0, 6.3); g.fill();
      }, 0.22);
      // beam
      g.strokeStyle = brass(PX - L, PX + L); g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(...ends[0]); g.lineTo(...ends[1]); g.stroke();
      g.fillStyle = '#f3d38a'; g.beginPath(); g.arc(PX, PY, 16, 0, 6.3); g.fill();
      // pans hang straight down from the beam ends
      ends.forEach(([x, y], i) => {
        const py = y + 230; g.strokeStyle = 'rgba(240,207,134,.7)'; g.lineWidth = 2;
        [-70, 0, 70].forEach((dx) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx, py); g.stroke(); });
        const pg = g.createLinearGradient(x - 90, 0, x + 90, 0); pg.addColorStop(0, '#5a3d12'); pg.addColorStop(0.5, '#e8c477'); pg.addColorStop(1, '#5a3d12');
        g.fillStyle = pg; g.beginPath(); g.ellipse(x, py, 95, 22, 0, 0, Math.PI); g.lineTo(x - 95, py); g.fill();
        g.fillStyle = 'rgba(255,240,200,.35)'; g.beginPath(); g.ellipse(x, py, 95, 14, 0, 0, 6.3); g.fill();
        add(g, () => glowDot(g, x, py - 90, 120, 0.3, i ? MAG : BLUE));
        const wt = [W1, W2][i], k = clamp((T - (wt - 0.25)) / 0.25);
        if (k > 0) weight(g, x, py - 8 - (1 - k * k) * 500);
      });
      if (third) { const sw = Math.sin((T - bt(6)) * 5) * 0.25; const hx = PX + Math.sin(sw) * 40, hy = PY - 120 + eo(T, bt(6) - 0.4, 0.4) * 0; add(g, () => glowDot(g, hx, hy - 20, 90, 0.4, GOLD)); weight(g, hx, hy + 20 - (1 - eo(T, bt(6) - 0.4, 0.4)) * 300); }
      floorFade(g);
      g.restore();
    }}>
      <Lb x={960 - 380} y={130} s="菜" size={100} col="#bcd6ff" sub="SKILL" o={eo(T, 0.5, 0.3)} />
      <Lb x={960 + 380} y={130} s="非" size={100} col="#ffc4e6" sub="LUCK" o={eo(T, 0.62, 0.3)} />
      <Lb x={960} y={FLOOR + 50} s="第三把，算谁的？" size={34} col={C.goldHi} o={eo(T, bt(6), 0.3)} />
    </Scene>
  );
};

/* ================================================================ TITLES (12.05 – 20.656) */
const T0 = CUT.strip, TEND = CUT.gallery;
const TITLE = '《是菜还是非？》', TY = 470, FS = 150;
const charX = (i: number) => 960 + (i - 3.5) * FS * 1.02;
const GoldTitle: React.FC<{ T: number; o?: number; tint?: boolean }> = ({ T, o = 1, tint = false }) => {
  const k = eo(T, HIT, 0.25) * o, sc = lerp(1.12, 1, eo(T, HIT, 0.22));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient>
        <filter id="tblur"><feGaussianBlur stdDeviation="18" /></filter></defs>
      {tint && <g opacity={0.7 * k} filter="url(#tblur)"><circle cx={charX(2)} cy={TY - 10} r={80} fill="rgb(120,175,255)" /><circle cx={charX(5)} cy={TY - 10} r={80} fill="rgb(255,110,205)" /></g>}
      <g transform={`translate(960 ${TY}) scale(${sc}) translate(-960 ${-TY})`} opacity={k}>
        {TITLE.split('').map((ch, i) => <text key={i} x={charX(i)} y={TY + FS * 0.36} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: FS }} fill="url(#tg)">{ch}</text>)}
      </g>
      <text x={960} y={TY + 150} textAnchor="middle" opacity={eo(T, HIT + 0.5, 0.5) * o} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>LUCK · SKILL · EVERY GAME YOU PLAY</text>
    </svg>
  );
};
const titleBurst = (g: G, T: number, y = TY) => { if (T >= HIT) add(g, () => { sparks(g, 960, y, HIT, T, 160, GOLD, 3.2, 9); g.fillStyle = `rgba(255,244,220,${0.55 * hit(T, HIT, 0.22)})`; g.fillRect(180, y - 1, 1560, 3); glowDot(g, 960, y, 760, 0.1 * eo(T, HIT, 0.3)); }); };

/* T1 · a two-colour ratio bar searching for the split, collapsing into the title's underline on the hit */
const splitAt = (T: number) => { const t = T - T0; const sp = 1 + 1.6 * clamp((T - 15.2) / 1.3); return 0.5 + 0.3 * Math.sin(t * 1.3 * sp + 0.6) * Math.cos(t * 0.71 * sp) + 0.06 * Math.sin(t * 4.3 * sp); };
const TT1: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const grow = eio(T, T0 + 0.1, 0.7), col = clamp((T - (HIT - 0.12)) / 0.12), after = T >= HIT;
  const sx = splitAt(Math.min(T, HIT)), x0 = 960 - 700 * grow, x1 = 960 + 700 * grow, xs = lerp(x0, x1, sx);
  const bh = after ? 0 : 30 * (1 - col), y = after ? TY + 110 : 640;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8); floorFade(g);
      if (!after) {
        const bg = g.createLinearGradient(x0, 0, xs, 0); bg.addColorStop(0, '#2c4f9a'); bg.addColorStop(1, '#78afff');
        g.fillStyle = bg; g.beginPath(); (g as any).roundRect(x0, y - bh / 2, Math.max(0, xs - x0), bh, [bh / 2, 0, 0, bh / 2]); g.fill();
        const mg = g.createLinearGradient(xs, 0, x1, 0); mg.addColorStop(0, '#ff6ecd'); mg.addColorStop(1, '#8a2a6e');
        g.fillStyle = mg; g.beginPath(); (g as any).roundRect(xs, y - bh / 2, Math.max(0, x1 - xs), bh, [0, bh / 2, bh / 2, 0]); g.fill();
        add(g, () => { glowDot(g, xs, y, 80, 0.6, '255,244,220'); g.fillStyle = 'rgba(255,244,220,.95)'; g.fillRect(xs - 2, y - bh / 2 - 10, 4, bh + 20); });
      }
      if (after) add(g, () => { g.fillStyle = `rgba(255,214,140,${0.8})`; g.fillRect(260, TY + 108, 1400, 2); });
      titleBurst(g, T);
    }}>
      {!after && grow > 0.5 && (
        <>
          <Lb x={x0 + 120} y={560 - 60} s={`实力 ${Math.round(sx * 100)}%`} size={34} col="#a8ccff" o={eo(T, T0 + 0.6, 0.3)} />
          <Lb x={x1 - 120} y={560 - 60} s={`运气 ${100 - Math.round(sx * 100)}%`} size={34} col="#ffaee0" o={eo(T, T0 + 0.6, 0.3)} />
        </>
      )}
      <GoldTitle T={T} tint />
    </Scene>
  );
};

/* T2 · the title assembled from two streams: go stones from the skill side, dice and coins from the luck side */
const TT2: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const pts = textPts(TITLE, `900 ${FS}px "Noto Serif CJK SC"`, 960, TY, 7);
  const from = 13.9, k = clamp((T - from) / (HIT - from)), e = k * k * (3 - 2 * k) * 0.25 + k * k * k * 0.75;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 18, 0.7); floorFade(g);
      strip(g, 140, 1780, FLOOR + 40, 0.8);
      add(g, () => { glowDot(g, 140, FLOOR + 40, 140, 0.45, BLUE); glowDot(g, 1780, FLOOR + 40, 140, 0.45, MAG); });
      const fade = 1 - pr(T, HIT + 0.2, 0.5);
      pts.forEach(([tx, ty], i) => {
        const left = tx < 960 + (rnd(i, 9) - 0.5) * 80;
        const sx = left ? -120 - rnd(i, 1) * 500 : W + 120 + rnd(i, 1) * 500, sy = FLOOR + 40 - 200 * rnd(i, 2);
        const d = clamp(e * 1.15 - rnd(i, 3) * 0.15);
        const x = lerp(sx, tx, d), y = lerp(sy, ty, d) - Math.sin(d * Math.PI) * (120 + 160 * rnd(i, 4));
        if (k <= 0) return;
        g.globalAlpha = fade;
        if (left) { const wh = i % 2 === 0; g.fillStyle = wh ? '#f2f0ea' : '#121216'; g.beginPath(); g.arc(x, y, 4.6, 0, 6.3); g.fill(); if (!wh) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - 1.3, y - 1.3, 1.4, 0, 6.3); g.fill(); } }
        else if (i % 3) { g.fillStyle = '#e9c070'; g.beginPath(); g.ellipse(x, y, 4.8, 3.2, 0, 0, 6.3); g.fill(); }
        else { g.fillStyle = '#fbf8f2'; g.fillRect(x - 3.6, y - 3.6, 7.2, 7.2); g.fillStyle = '#c8102e'; g.fillRect(x - 0.9, y - 0.9, 1.8, 1.8); }
        g.globalAlpha = 1;
      });
      titleBurst(g, T);
    }}>
      <Lb x={300} y={FLOOR + 90} s="实力" size={50} col="#a8ccff" sub="SKILL" o={eo(T, T0 + 0.6, 0.4) * (1 - pr(T, HIT, 0.4))} />
      <Lb x={1620} y={FLOOR + 90} s="运气" size={50} col="#ffaee0" sub="LUCK" o={eo(T, T0 + 0.8, 0.4) * (1 - pr(T, HIT, 0.4))} />
      <GoldTitle T={T} />
    </Scene>
  );
};

/* T3 · black lacquer mahjong tiles stood up one by one, all flipped over on the hit */
const luxTile = (g: G, x: number, y: number, ch: string, face: boolean, glow = 0) => {
  const w = 150, h = 200, d = 26;
  g.fillStyle = face ? '#2a2a30' : '#0c3a2a'; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x - w / 2 + 12, y - h - d * 0.6); g.lineTo(x + w / 2 + 12, y - h - d * 0.6); g.lineTo(x + w / 2, y - h); g.closePath(); g.fill();
  g.fillStyle = '#08080a'; g.beginPath(); g.moveTo(x + w / 2, y - h); g.lineTo(x + w / 2 + 12, y - h - d * 0.6); g.lineTo(x + w / 2 + 12, y - d * 0.6); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  const fr = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y);
  if (face) { fr.addColorStop(0, '#2b2b33'); fr.addColorStop(0.5, '#141418'); fr.addColorStop(1, '#060608'); } else { fr.addColorStop(0, '#1d6b4d'); fr.addColorStop(0.6, '#0f4532'); fr.addColorStop(1, '#072519'); }
  g.fillStyle = fr; g.beginPath(); (g as any).roundRect(x - w / 2, y - h, w, h, 14); g.fill();
  g.strokeStyle = face ? 'rgba(227,183,101,.8)' : 'rgba(150,230,190,.3)'; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x - w / 2 + 10, y - h + 10, w - 20, h - 20, 8); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - w / 2 + 14, y - h + 2); g.lineTo(x + w / 2 - 14, y - h + 2); g.stroke();
  if (face) {
    g.save(); g.shadowColor = `rgba(255,214,140,${0.5 + 0.5 * glow})`; g.shadowBlur = 24 + 30 * glow;
    const gg = g.createLinearGradient(0, y - h + 30, 0, y - 30); gg.addColorStop(0, '#fff3cf'); gg.addColorStop(0.5, '#f0c873'); gg.addColorStop(1, '#b07c32');
    g.fillStyle = gg; g.font = '900 112px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y - h / 2 + 6); g.restore();
  }
};
const TT3: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const CH = '是菜还是非？'.split(''), place = [12.5, 13.15, 13.7, 14.35, 14.8, 15.4];
  const xi = (i: number) => 960 + (i - 2.5) * 172;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 18, 0.7);
      g.save(); cam(g, lerp(1.0, 1.06, pr(T, T0, HIT - T0)) + 0.015 * hit(T, HIT, 0.25), 960, 620);
      spot(g, 960, 1300, 0.9, '255,230,190');
      withReflection(g, () => CH.forEach((ch, i) => {
        const k = eo(T, place[i], 0.3); if (k <= 0) return;
        const fl = clamp((T - (HIT - 0.16 + (i - 2.5) * 0.012)) / 0.16), sq = Math.abs(Math.cos(fl * Math.PI)), x = xi(i);
        g.save(); g.globalAlpha *= k; g.translate(x, 0); g.scale(Math.max(0.03, sq), 1); g.translate(-x, 0);
        luxTile(g, x, FLOOR - (1 - k) * 40 - Math.sin(fl * Math.PI) * 30, ch, fl >= 0.5, hit(T, HIT, 0.5));
        g.restore();
      }), 0.28);
      floorFade(g);
      if (T >= HIT) add(g, () => { sparks(g, 960, FLOOR - 100, HIT, T, 180, GOLD, 3.0, 9); glowDot(g, 960, FLOOR - 100, 700, 0.12 * eo(T, HIT, 0.3)); });
      g.restore();
    }}>
      <Lb x={960 - 3 * 172 - 70} y={FLOOR - 172} s="《" size={100} col={C.goldHi} o={eo(T, HIT, 0.25)} />
      <Lb x={960 + 3 * 172 + 80} y={FLOOR - 172} s="》" size={100} col={C.goldHi} o={eo(T, HIT, 0.25)} />
      <Lb x={960} y={FLOOR - 310} s="LUCK · SKILL · EVERY GAME YOU PLAY" size={20} col={C.dim} ls="0.42em" o={eo(T, HIT + 0.5, 0.5)} />
    </Scene>
  );
};

/* T4 · six dice tumble in and land on the hit, the question on their front faces */
const fdie = (g: G, x: number, y: number, a: number, glyph: string, pips: number, glow = 0) => {
  const d = a * 0.28;
  g.fillStyle = '#1c1c22'; g.beginPath(); g.moveTo(x - a / 2, y - a); g.lineTo(x - a / 2 + d, y - a - d); g.lineTo(x + a / 2 + d, y - a - d); g.lineTo(x + a / 2, y - a); g.closePath(); g.fill();
  g.fillStyle = '#060608'; g.beginPath(); g.moveTo(x + a / 2, y - a); g.lineTo(x + a / 2 + d, y - a - d); g.lineTo(x + a / 2 + d, y - d); g.lineTo(x + a / 2, y); g.closePath(); g.fill();
  const fr = g.createLinearGradient(x - a / 2, y - a, x + a / 2, y); fr.addColorStop(0, '#2c2c34'); fr.addColorStop(0.55, '#121216'); fr.addColorStop(1, '#050507');
  g.fillStyle = fr; g.beginPath(); (g as any).roundRect(x - a / 2, y - a, a, a, a * 0.12); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - a / 2 + 10, y - a + 2); g.lineTo(x + a / 2 - 10, y - a + 2); g.stroke();
  // top face pips (gold), small
  g.fillStyle = 'rgba(240,200,115,.85)'; [[-0.2, 0], [0.2, 0]].forEach(([u]) => { g.beginPath(); g.ellipse(x + u * a + d / 2, y - a - d / 2, a * 0.05, a * 0.025, 0, 0, 6.3); g.fill(); });
  if (glyph) {
    g.save(); g.shadowColor = `rgba(255,214,140,${0.5 + 0.5 * glow})`; g.shadowBlur = 20 + 30 * glow;
    const gg = g.createLinearGradient(0, y - a, 0, y); gg.addColorStop(0, '#fff3cf'); gg.addColorStop(0.5, '#f0c873'); gg.addColorStop(1, '#b07c32');
    g.fillStyle = gg; g.font = `900 ${a * 0.7}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, x, y - a / 2 + a * 0.04); g.restore();
  } else {
    const P: Record<number, number[][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    g.fillStyle = '#f0c873'; P[pips].forEach(([i, j]) => { g.beginPath(); g.arc(x + i * a * 0.27, y - a / 2 + j * a * 0.27, a * 0.075, 0, 6.3); g.fill(); });
  }
};
export const TT4: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const CH = '是菜还是非？'.split(''), A = 150;
  const ign = eio(T, T0, 1.1), after = eo(T, HIT, 0.6);
  // one die, tumbling like a real cube: it rolls over its edges, a new face every quarter turn, slowing to rest
  const dieAt = (g: G, i: number, tt: number, alpha: number) => {
    const land = HIT - (5 - i) * 0.07, dur = 1.55 + 0.25 * rnd(i, 2), q = clamp((tt - (land - dur)) / dur);
    if (q <= 0) return;
    const u = 1 - Math.pow(1 - q, 1.45), N = 5 + (i % 3);            // still rolling when it lands: the last quarter turn ends on its beat
    const xf = 960 + (i - 2.5) * 178, x = lerp(W + 160 + i * 50, xf, u);
    const turns = (1 - u) * N, face = Math.ceil(turns - 1e-6), resid = (face - turns) * (Math.PI / 2) * -1;   // the title face only comes up as it lands
    const lift = (A / 2) * (Math.abs(Math.cos(resid)) + Math.abs(Math.sin(resid)) - 1);
    const hop = 110 * Math.pow(1 - u, 1.5) * Math.abs(Math.sin(Math.PI * 2 * u));
    const sq = tt >= land ? 0.06 * Math.exp(-(tt - land) * 12) * Math.cos((tt - land) * 22) : 0;
    const y = FLOOR - lift - hop, cx = x, cy = y - A / 2;
    g.save(); g.globalAlpha *= alpha; g.translate(cx, y); g.scale(1 + sq * 0.5, 1 - sq); g.translate(-cx, -y);
    g.translate(cx, cy); g.rotate(resid); g.translate(-cx, -cy);
    fdie(g, x, y, A, face === 0 ? CH[i] : '', 1 + ((face + i * 2) % 6), tt >= land ? Math.exp(-(tt - land) * 2) : 0);
    g.restore();
  };
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 18, 0.7);
      g.save(); cam(g, lerp(1.0, 1.05, eio(T, T0, HIT - T0)) + 0.012 * hit(T, HIT, 0.3), 960, 620);
      spot(g, 960, 1300, 0.35 + 0.55 * eio(T, 14.2, 1.2), '255,230,190');
      floorFade(g);
      if (ign > 0) { strip(g, 960 - 820 * ign, 960 + 820 * ign, FLOOR + 40, 1 - 0.5 * after); add(g, () => { glowDot(g, 960 - 820 * ign, FLOOR + 40, 120, 0.4 * ign * (1 - 0.6 * after), BLUE); glowDot(g, 960 + 820 * ign, FLOOR + 40, 120, 0.4 * ign * (1 - 0.6 * after), MAG); }); }
      withReflection(g, () => CH.forEach((_, i) => { if (T < HIT) [0.008, 0.016, 0.024, 0.032].forEach((dt) => dieAt(g, i, T - dt, 0.08)); dieAt(g, i, T, 1); }), 0.26);
      CH.forEach((_, i) => { const land = HIT - (5 - i) * 0.07; if (T >= land) add(g, () => sparks(g, 960 + (i - 2.5) * 178, FLOOR - 4, land, T, 22, GOLD, 0.6, i)); });
      if (T >= HIT) add(g, () => glowDot(g, 960, FLOOR - 80, 700, 0.12 * after));
      g.restore();
    }}>
      <Lb x={300} y={FLOOR + 90} s="实力" size={56} col="#a8ccff" sub="SKILL" o={eo(T, T0 + 0.8, 0.4) * (1 - eio(T, 14.8, 0.6))} />
      <Lb x={1620} y={FLOOR + 90} s="运气" size={56} col="#ffaee0" sub="LUCK" o={eo(T, T0 + 1.0, 0.4) * (1 - eio(T, 14.8, 0.6))} />
      <Lb x={960 - 3 * 178 - 60} y={FLOOR - 145} s="《" size={100} col={C.goldHi} o={eo(T, HIT, 0.3)} />
      <Lb x={960 + 3 * 178 + 85} y={FLOOR - 145} s="》" size={100} col={C.goldHi} o={eo(T, HIT, 0.3)} />
      <Lb x={960} y={FLOOR - 290} s="LUCK · SKILL · EVERY GAME YOU PLAY" size={20} col={C.dim} ls="0.42em" o={eo(T, HIT + 0.5, 0.5)} />
    </Scene>
  );
};

/* T5 · 菜 sits at the skill end, 非 at the luck end; on the hit they rush to the middle and the title closes around them */
const TT5: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const rush = clamp((T - (HIT - 0.55)) / 0.55), r3 = rush * rush * rush;
  const drift = (s: number) => (rush > 0 ? 0 : 40 * Math.sin((T - T0) * 0.9 + s));
  const cx = lerp(260 + drift(0), charX(2), r3), fx = lerp(1660 + drift(2), charX(5), r3);
  const glyphO = eo(T, T0 + 0.5, 0.5);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 20, 0.8); floorFade(g);
      const k = eio(T, T0, 1.0);
      strip(g, 960 - 820 * k, 960 + 820 * k, FLOOR + 40, 1);
      add(g, () => {
        glowDot(g, cx, TY - 10, 220, 0.35 * glyphO, BLUE); glowDot(g, fx, TY - 10, 220, 0.35 * glyphO, MAG);
        if (rush > 0 && rush < 1) { [[260, cx, BLUE], [1660, fx, MAG]].forEach(([a, b, c]) => { const gr = g.createLinearGradient(a as number, 0, b as number, 0); gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(1, `rgba(${c},.8)`); g.fillStyle = gr; g.fillRect(Math.min(a as number, b as number), TY - 4, Math.abs((b as number) - (a as number)), 8); }); }
      });
      titleBurst(g, T);
    }}>
      {T < HIT && (
        <>
          <div style={{ position: 'absolute', left: cx - 100, width: 200, top: TY - 100, textAlign: 'center', opacity: glyphO, fontFamily: F.serif, fontWeight: 900, fontSize: FS, color: '#cfe0ff', textShadow: '0 0 40px rgba(120,175,255,.9)' }}>菜</div>
          <div style={{ position: 'absolute', left: fx - 100, width: 200, top: TY - 100, textAlign: 'center', opacity: glyphO, fontFamily: F.serif, fontWeight: 900, fontSize: FS, color: '#ffd1ea', textShadow: '0 0 40px rgba(255,110,205,.9)' }}>非</div>
        </>
      )}
      <Lb x={260} y={FLOOR + 90} s="实力" size={40} col="#a8ccff" sub="SKILL" o={eo(T, T0 + 0.8, 0.4) * (1 - pr(T, HIT, 0.4))} />
      <Lb x={1660} y={FLOOR + 90} s="运气" size={40} col="#ffaee0" sub="LUCK" o={eo(T, T0 + 1.0, 0.4) * (1 - pr(T, HIT, 0.4))} />
      <GoldTitle T={T} tint />
    </Scene>
  );
};

/* ================================================================ the reel */
const CLIPS: Clip[] = [
  { tag: '开场 A', name: '战绩牌：三连败砸下来，画面劈成 菜？ | 非？', a: 0, z: HOOK_END, el: (T, f) => <H1 T={T} f={f} /> },
  { tag: '开场 B', name: '选择题：A 我菜  B 我非  C 算一算才知道', a: 0, z: HOOK_END, el: (T, f) => <H2 T={T} f={f} /> },
  { tag: '开场 C', name: '弹幕：一半骂你菜，一半说你非', a: 0, z: HOOK_END, el: (T, f) => <H3 T={T} f={f} /> },
  { tag: '开场 D', name: '分屏：左边一步走错，右边掷出 1 点', a: 0, z: HOOK_END, el: (T, f) => <H4 T={T} f={f} /> },
  { tag: '开场 E', name: '天平：菜 和 非 各一边，败绩掉进去，停不下来', a: 0, z: HOOK_END, el: (T, f) => <H5 T={T} f={f} /> },
  { tag: '标题 1', name: '比例条：实力 / 运气 的分界一直在找，重拍时收成标题下划线', a: T0, z: TEND, el: (T, f) => <TT1 T={T} f={f} /> },
  { tag: '标题 2', name: '两股粒子：左边围棋子，右边骰子和金币，重拍拼成标题', a: T0, z: TEND, el: (T, f) => <TT2 T={T} f={f} /> },
  { tag: '标题 3', name: '黑漆麻将：一张张立起来，重拍一起翻开', a: T0, z: TEND, el: (T, f) => <TT3 T={T} f={f} /> },
  { tag: '标题 4', name: '六颗骰子：滚进来，重拍落定，正面是标题', a: T0, z: TEND, el: (T, f) => <TT4 T={T} f={f} /> },
  { tag: '标题 5', name: '两端合拢：菜在实力端，非在运气端，重拍冲到中间', a: T0, z: TEND, el: (T, f) => <TT5 T={T} f={f} /> },
];
export const SLATE = 30;
export const clipFrames = (c: Clip) => Math.round((c.z - c.a) * 30);
export const TEST_SEGMENTS = CLIPS.map((c) => ({ a: c.a, z: c.a + clipFrames(c) / 30 }));
export const TESTS_FRAMES = CLIPS.reduce((m, c) => m + SLATE + clipFrames(c), 0);

export const Tests: React.FC = () => {
  const fr = useCurrentFrame();
  const [h] = useState(() => delayRender('test-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '400 40px "DejaVu Sans"'].map((x) => document.fonts.load(x, '是菜还是非国际象棋0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  let acc = 0, idx = 0;
  for (; idx < CLIPS.length; idx++) { const n = SLATE + clipFrames(CLIPS[idx]); if (fr < acc + n) break; acc += n; }
  idx = Math.min(idx, CLIPS.length - 1);
  const c = CLIPS[idx], local = fr - acc;
  if (!ok) return <AbsoluteFill style={{ background: '#000' }}><FontFaces /></AbsoluteFill>;
  if (local < SLATE) {
    return (
      <AbsoluteFill style={{ background: '#050506', alignItems: 'center', justifyContent: 'center' }}>
        <FontFaces />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 96, color: C.goldHi }}>{c.tag}</div>
          <div style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 34, color: C.cream, marginTop: 24 }}>{c.name}</div>
        </div>
      </AbsoluteFill>
    );
  }
  const T = c.a + (local - SLATE) / 30;
  const isTitle = c.a > 1;
  const markO = isTitle ? 0 : 1;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {c.el(T, fr)}
      <Grade warm={0.03} />
      <Grain T={T} />
      <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: isTitle ? 0.2 * hit(T, HIT, 0.09) : 0, mixBlendMode: 'screen' }} />
      <Bars />
      <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
        <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
      </div>
      <div style={{ position: 'absolute', left: 56, top: 36, fontFamily: F.sans, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(227,183,101,.8)' }}>{c.tag}</div>
      <Subs T={T} lines={LINES} />
    </AbsoluteFill>
  );
};

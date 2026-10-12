/* Five cold opens that say "金铲铲" at first glance: the golden spatula and the golden pan, plus the three rank plaques.
   All run 0 – 4.456 s on the track: hit at 0.40, plaques on beats, the frame splits into 菜？ | 非？ on bt(6). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, glowDot, clamp, lerp, pr, eo, eio, hit } from './kit';
import { sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, spatula, panUp, panFlat, panSide, FLOOR, H } from './hero';
import { Lb, Scene, add, cam, S2, GAL } from './Scenes';
import { plaque, DROPS, HOOK_END } from './Tests';
import { LINES, bt } from './time';

type G = CanvasRenderingContext2D;
const BLUE = '120,175,255', MAG = '255,110,205';
const SPLIT = bt(6);

/* shared pieces ---------------------------------------------------------------- */
const FALL = 0.36;
/** a plaque that falls under gravity, lands on `d`, bounces twice and settles */
const dropPlaque = (g: G, T: number, d: number, x: number, y0: number, n: string, s = 1, blur = true) => {
  const one = (tt: number, alpha: number) => {
    const k = clamp((tt - (d - FALL)) / FALL); if (k <= 0) return;
    const after = Math.max(0, tt - d), bounce = tt < d ? 0 : 16 * s * Math.exp(-after * 8) * Math.abs(Math.sin(after * 15));
    const sq = tt < d ? 0 : 0.045 * Math.exp(-after * 12), y = y0 - (1 - k * k) * 700 - bounce;
    g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.scale(s * (1 + sq * 0.6), s * (1 - sq)); g.translate(-x, -y); plaque(g, x, y, n); g.restore();
  };
  if (blur && T < d) [0.008, 0.016, 0.024, 0.032].forEach((dt) => one(T - dt, 0.09));
  one(T, 1);
};
const landFx = (g: G, T: number, d: number, x: number, y: number) => { if (T > d) add(g, () => { sparks(g, x, y, d, T, 40, '255,170,225', 0.8, x); glowDot(g, x, y, 200, 0.32 * Math.exp(-(T - d) * 4), '255,140,210'); }); };
const dipCam = (T: number, ds: number[]) => ds.reduce((m, d) => m + (T < d ? 0 : 7 * Math.exp(-(T - d) * 6) * Math.sin((T - d) * 16)), 0);
const splitFx = (g: G, T: number, seamX = 960) => {
  const s = eio(T, SPLIT, 0.45); if (s <= 0) return;
  add(g, () => {
    g.fillStyle = `rgba(${BLUE},${0.18 * s})`; g.fillRect(0, 0, seamX, H); g.fillStyle = `rgba(${MAG},${0.18 * s})`; g.fillRect(seamX, 0, 1920 - seamX, H);
    const lg = g.createLinearGradient(seamX - 30, 0, seamX + 30, 0); lg.addColorStop(0, 'rgba(255,244,220,0)'); lg.addColorStop(0.5, `rgba(255,244,220,${0.9 * s})`); lg.addColorStop(1, 'rgba(255,244,220,0)');
    g.fillStyle = lg; g.fillRect(seamX - 30, 0, 60, H * clamp(s * 1.4));
  });
};
const SplitWords: React.FC<{ T: number; y?: number }> = ({ T, y = 240 }) => (
  <>
    {([['菜？', 480, '#bcd6ff', 'rgba(120,175,255,.7)', 0], ['非？', 1440, '#ffc4e6', 'rgba(255,110,205,.7)', 0.12]] as [string, number, string, string, number][]).map(([s, x, col, sh, dl]) => {
      const k = eo(T, SPLIT + dl, 0.45);
      return <div key={s} style={{ position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 24}px) scale(${lerp(1.12, 1, k)})`, fontFamily: F.serif, fontWeight: 900, fontSize: 150, color: col, textShadow: `0 0 40px ${sh}` }}>{s}</div>;
    })}
  </>
);
const Tag: React.FC<{ T: number; y?: number; s?: string }> = ({ T, y = 120, s = '金铲铲 · 最近三把' }) => <Lb x={960} y={y} s={s} size={28} col="rgba(255,214,140,.9)" ls="0.4em" o={eo(T, 0.5, 0.4) * (1 - eio(T, SPLIT, 0.45))} />;

/* A · showroom: the spatula and the pan light up on the hit, then the three plaques fall between them ------------- */
const HA: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const D = [bt(2), bt(3), bt(4)], on = eo(T, bt(0), 0.12);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.06, eio(T, 0, HOOK_END)), 960, 620); g.translate(0, dipCam(T, D));
      spot(g, 330, 420, on, '255,230,190'); spot(g, 1580, 480, on, '255,230,190');
      D.forEach((d, i) => spot(g, 700 + i * 260, 300, 0.8 * eio(T, d - 0.35, 0.4), '255,200,235'));
      withReflection(g, () => {
        spatula(g, 330, FLOOR, 0.95, 0.04, pr(T, bt(0), 0.7) < 1 ? pr(T, bt(0), 0.7) : -1);
        panUp(g, 1585, FLOOR - 150, 125, 2.75, 0.6 * hit(T, bt(0), 0.4));
        D.forEach((d, i) => dropPlaque(g, T, d, 700 + i * 260, FLOOR, ['8', '7', '8'][i], 0.8));
      }, 0.22);
      floorFade(g);
      if (T > bt(0)) add(g, () => { glowDot(g, 330, FLOOR - 200, 260, 0.3 * on, GOLD); glowDot(g, 1585, FLOOR - 150, 260, 0.3 * on, GOLD); });
      D.forEach((d, i) => landFx(g, T, d, 700 + i * 260, FLOOR));
      g.restore();
      splitFx(g, T);
    }}>
      <Tag T={T} />
      <SplitWords T={T} />
    </Scene>
  );
};

/* B · the pan is a gong behind the plaques (it rings on every landing); the spatula slams down and splits the frame ---- */
const HB: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const ring = DROPS.reduce((m, d) => m + hit(T, d, 0.35), 0);
  const sk = clamp((T - (SPLIT - 0.3)) / 0.3), sy = FLOOR + 30 - (1 - sk * sk) * 900;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.05, eio(T, 0, HOOK_END)), 960, 600); g.translate(0, dipCam(T, [...DROPS, SPLIT]));
      spot(g, 960, 1300, 0.6 + 0.3 * eo(T, bt(0), 0.2), '255,225,200');
      g.save(); g.globalAlpha = 0.55 + 0.25 * eo(T, bt(0), 0.3); panUp(g, 960, 360, 270, -0.75, 0.25 + 0.5 * Math.min(1, ring) + 0.15 * Math.sin(T * 9) * Math.min(1, ring)); g.restore();
      withReflection(g, () => DROPS.forEach((d, i) => dropPlaque(g, T, d, 520 + i * 440, FLOOR, ['8', '7', '8'][i])), 0.22);
      floorFade(g);
      DROPS.forEach((d, i) => landFx(g, T, d, 520 + i * 440, FLOOR));
      if (sk > 0) { spatula(g, 960, sy, 1.05, 0); if (T >= SPLIT) add(g, () => { sparks(g, 960, FLOOR + 30, SPLIT, T, 120, GOLD, 2.2, 3); glowDot(g, 960, FLOOR, 360, 0.5 * hit(T, SPLIT, 0.4), GOLD); }); }
      g.restore();
      splitFx(g, T);
    }}>
      <Tag T={T} y={110} />
      <SplitWords T={T} y={150} />
    </Scene>
  );
};

/* C · the plaques drop into the golden pan, clang, clang, clang; the spatula stands beside it --------------------------- */
const HC: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const wob = DROPS.reduce((m, d) => m + (T < d ? 0 : 6 * Math.exp(-(T - d) * 7) * Math.sin((T - d) * 30)), 0);
  const PX = 900, PY = FLOOR - 20;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.07, eio(T, 0, HOOK_END)), 960, 640);
      spot(g, 960, 1100, 0.5 + 0.45 * eo(T, bt(0), 0.2), '255,230,200');
      withReflection(g, () => { spatula(g, 1480, FLOOR, 0.92, -0.06, pr(T, bt(0), 0.7) < 1 ? pr(T, bt(0), 0.7) : -1); }, 0.22);
      g.save(); g.translate(0, wob); panFlat(g, PX, PY, 360, 100); g.restore();
      DROPS.forEach((d, i) => dropPlaque(g, T, d, PX - 200 + i * 200, PY + 52 + wob, ['8', '7', '8'][i], 0.62));
      floorFade(g);
      DROPS.forEach((d, i) => { if (T > d) add(g, () => { sparks(g, PX - 200 + i * 200, PY + 40, d, T, 50, GOLD, 1.0, i); glowDot(g, PX, PY, 420, 0.28 * Math.exp(-(T - d) * 5), GOLD); }); });
      g.restore();
      splitFx(g, T);
    }}>
      <Tag T={T} />
      <SplitWords T={T} />
    </Scene>
  );
};

/* D · stir-fry toss, polished: the pan flicks the plaque up, it flips over like a card (the number changes while it is
   edge-on), drops back into the pan a moment before the next beat, and is tossed again on the beat. The last toss shows
   the plaque's back, a gold "？", which splits into 菜？ | 非？. `sp` = where the spatula stands (1 plinth, 2 leaning behind, 3 lying in front). */
const PLQ = 0.78;
const plaqueBack = (g: G, x: number, y: number) => {
  const w = 250, h = 320;
  const body = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); body.addColorStop(0, '#2a1d33'); body.addColorStop(1, '#0b0810');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(x - w / 2, y - h, w, h, 14); g.fill();
  g.strokeStyle = 'rgba(227,183,101,.7)'; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x - w / 2 + 12, y - h + 12, w - 24, h - 24, 8); g.stroke();
  g.save(); g.shadowColor = 'rgba(255,214,140,.8)'; g.shadowBlur = 26; g.fillStyle = '#f0c873'; g.font = '900 150px "Noto Serif CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('？', x, y - h / 2 + 6); g.restore();
};
/** a plaque turning about its horizontal axis: phi 0 = front, π = back */
const flipPlaque = (g: G, x: number, cy: number, phi: number, oldN: string, newN: string, tilt = 0, alpha = 1, clip = 0, apart = 0) => {
  const c = Math.cos(phi), sy = Math.max(0.025, Math.abs(c));
  const wrapped = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const side = wrapped < Math.PI / 2 || wrapped >= 1.5 * Math.PI ? 'front' : 'back';
  const n = phi < Math.PI / 2 ? oldN : newN;
  g.save(); g.globalAlpha *= alpha; g.translate(x, cy); g.rotate(tilt); g.scale(PLQ, PLQ * sy);
  if (clip) { g.beginPath(); g.rect(clip < 0 ? -200 : 0, -200, 200, 400); g.clip(); g.translate(clip * apart, 0); }
  if (side === 'front') plaque(g, 0, 160, n); else plaqueBack(g, 0, 160);
  // light: the face darkens as it turns away, and catches a glint when it comes square to the camera
  g.fillStyle = `rgba(0,0,0,${0.5 * (1 - sy)})`; g.fillRect(-126, -161, 252, 322);
  if (sy > 0.9) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,250,${0.18 * (sy - 0.9) / 0.1})`; g.fillRect(-126, -161, 252, 322); }
  g.restore();
};
const plinth = (g: G, x: number, y: number, w: number, h: number) => {
  const d = 22;
  g.fillStyle = '#1b1922'; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x - w / 2 + d, y - h - d * 0.6); g.lineTo(x + w / 2 + d, y - h - d * 0.6); g.lineTo(x + w / 2, y - h); g.closePath(); g.fill();
  g.fillStyle = '#08080b'; g.beginPath(); g.moveTo(x + w / 2, y - h); g.lineTo(x + w / 2 + d, y - h - d * 0.6); g.lineTo(x + w / 2 + d, y - d * 0.6); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  const fr = g.createLinearGradient(0, y - h, 0, y); fr.addColorStop(0, '#1d1b25'); fr.addColorStop(1, '#0a090d');
  g.fillStyle = fr; g.fillRect(x - w / 2, y - h, w, h);
  g.strokeStyle = 'rgba(255,214,140,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - w / 2, y - h); g.lineTo(x + w / 2, y - h); g.stroke();
};
export const HD: React.FC<{ T: number; f: number; sp?: number }> = ({ T, f, sp = 1 }) => {
  const PX = 960, PY = FLOOR - 10, REST = PY - 165;
  const TOSS = [bt(0), bt(2), bt(4)], LAND = [bt(2) - 0.24, bt(4) - 0.24];
  const NUM = ['8', '7', '8'];
  // the pan: a small dip before each toss (anticipation), the flick, and a soft give on each catch
  const g1 = (t: number, w: number) => Math.exp(-Math.pow(t / w, 2));
  const panRot = TOSS.reduce((m, t) => m - 0.26 * g1(T - t + 0.02, 0.075), 0) + LAND.reduce((m, d) => m + (T < d ? 0 : 0.05 * Math.exp(-(T - d) * 8) * Math.sin((T - d) * 18)), 0);
  const panY = TOSS.reduce((m, t) => m + 9 * g1(T - t + 0.13, 0.06) - 14 * g1(T - t, 0.06), 0) + LAND.reduce((m, d) => m + (T < d ? 0 : 11 * Math.exp(-(T - d) * 9) * Math.cos((T - d) * 19)), 0);
  // where the plaque is
  const flight = (tt: number) => {
    const k = [0, 1, 2].findIndex((i) => tt >= TOSS[i] && tt < (i < 2 ? LAND[i] : 99));
    if (k < 0) { const n = tt < TOSS[0] ? NUM[0] : tt < TOSS[2] && tt >= LAND[0] && tt < TOSS[1] ? NUM[1] : NUM[2]; return { y: REST + panY, phi: 0, oldN: n, newN: n, tilt: 0, sq: 0, k }; }
    if (k < 2) {
      const q = (tt - TOSS[k]) / (LAND[k] - TOSS[k]), ease = 0.85 * q + 0.15 * q * q * (3 - 2 * q);
      return { y: REST + panY - 4 * 235 * q * (1 - q), phi: 2 * Math.PI * ease, oldN: NUM[k], newN: NUM[k + 1], tilt: 0.1 * Math.sin(2 * Math.PI * q) * (k ? -1 : 1), sq: 0, k };
    }
    // last toss: rises to its apex on the split beat, turning over once to its back (the gold ？)
    const dur = 2 * (SPLIT - TOSS[2]), q = Math.min((tt - TOSS[2]) / dur, 0.5);
    return { y: REST + panY - 4 * 220 * q * (1 - q), phi: Math.PI * Math.min(1, q / 0.5) * (0.9 + 0.1 * Math.min(1, q / 0.5)), oldN: NUM[2], newN: NUM[2], tilt: 0.06 * Math.sin(Math.PI * q), sq: 0, k };
  };
  const now = flight(T), apart = eio(T, SPLIT, 0.5);
  const landSq = LAND.reduce((m, d) => m + (T < d ? 0 : 0.06 * Math.exp(-(T - d) * 12)), 0);
  const spatulaAt = (g: G) => {
    if (sp === 1) { plinth(g, 380, FLOOR, 200, 74); spatula(g, 380, FLOOR - 74, 1.0, 0.0, pr(T, bt(0), 0.8) < 1 ? pr(T, bt(0), 0.8) : -1); }
    if (sp === 2) { g.save(); g.globalAlpha *= 0.85; spatula(g, 1210, FLOOR - 30, 1.3, 0.3, pr(T, bt(0), 0.9) < 1 ? pr(T, bt(0), 0.9) : -1); g.restore(); }
  };
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.05, eio(T, 0, HOOK_END)), 960, 600);
      spot(g, PX, 900, 0.5 + 0.45 * eo(T, bt(0), 0.25), '255,230,200');
      if (sp === 1) spot(g, 380, 320, 0.75, '255,230,190');
      if (sp === 2) spot(g, 1210, 600, 0.45, '255,230,190');
      // spatula behind the pan (2) is drawn first
      if (sp === 2) withReflection(g, () => spatulaAt(g), 0.2);
      // the plaque: fine motion blur while it flies, then the plaque itself
      if (T < SPLIT) {
        if (now.k >= 0) [0.012, 0.024, 0.036].forEach((dt) => { const p = flight(T - dt); flipPlaque(g, PX, p.y, p.phi, p.oldN, p.newN, p.tilt, 0.1); });
        g.save(); g.translate(PX, now.y + 128 * PLQ); g.scale(1 + landSq * 0.5, 1 - landSq); g.translate(-PX, -(now.y + 128 * PLQ));
        flipPlaque(g, PX, now.y, now.phi, now.oldN, now.newN, now.tilt); g.restore();
      } else if (apart < 1) {
        // the gold ？ splits: each half drifts to its side and fades into the words
        const p = flight(SPLIT - 0.001);
        [-1, 1].forEach((sd) => { g.save(); g.translate(PX, p.y); g.rotate(sd * 0.35 * apart); g.translate(-PX, -p.y); flipPlaque(g, PX, p.y, Math.PI, '8', '8', 0, 1 - apart, sd, 260 * apart); g.restore(); });
      }
      withReflection(g, () => { if (sp === 1) spatulaAt(g); panSide(g, PX, PY + panY, 1.6, panRot); }, 0.22);
      floorFade(g);
      if (sp === 3) { g.save(); g.translate(560, FLOOR + 112); g.scale(1, 0.5); g.rotate(-2.05); spatula(g, 0, 0, 1.45, 0, pr(T, bt(0), 0.9) < 1 ? pr(T, bt(0), 0.9) : -1); g.restore(); add(g, () => glowDot(g, 420, FLOOR + 60, 260, 0.2, GOLD)); }
      LAND.forEach((d) => { if (T > d) add(g, () => sparks(g, PX, PY - 70, d, T, 30, GOLD, 0.6, d)); });
      if (T >= SPLIT) add(g, () => { sparks(g, PX, flight(SPLIT - 0.001).y, SPLIT, T, 140, '255,214,180', 2.0, 7); glowDot(g, PX, flight(SPLIT - 0.001).y, 300, 0.5 * hit(T, SPLIT, 0.35), GOLD); });
      g.restore();
      splitFx(g, T);
    }}>
      <Tag T={T} />
      <SplitWords T={T} />
    </Scene>
  );
};

/* E · a crest: spatula and pan crossed like a coat of arms; it rises to the top and the plaques fall beneath it -------- */
const crest = (g: G, cx: number, cy: number, s: number, glow: number) => {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  // the pan: disc to the upper left, handle to the lower right
  panUp(g, -120, -120, 150, 0.79, glow);
  // the spatula: blade to the upper right, handle to the lower left
  const th = Math.PI + 0.75, L = 412 * 0.95; spatula(g, 0.68 * L * 0.5, -0.73 * L * 0.5, 0.95, th);
  g.restore();
};
const HE: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const D = [bt(2), bt(3), bt(4)], rise = eio(T, bt(1) + 0.15, 0.55), on = eo(T, bt(0), 0.25);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.05, eio(T, 0, HOOK_END)), 960, 620); g.translate(0, dipCam(T, D));
      spot(g, 960, 700, 0.9 * on * (1 - 0.6 * rise), '255,230,190');
      add(g, () => glowDot(g, 960, lerp(470, 215, rise), 420 * lerp(1, 0.45, rise), 0.35 * on + 0.4 * hit(T, bt(0), 0.3), GOLD));
      g.save(); g.globalAlpha = on; crest(g, 960, lerp(500, 225, rise), lerp(1.0, 0.42, rise) * lerp(1.15, 1, eo(T, bt(0), 0.3)), 0.4 * hit(T, bt(0), 0.5)); g.restore();
      if (T > bt(0) && T < bt(0) + 1.2) add(g, () => sparks(g, 960, 470, bt(0), T, 120, GOLD, 2.0, 2));
      D.forEach((d, i) => spot(g, 600 + i * 360, 300, 0.8 * eio(T, d - 0.35, 0.4), '255,200,235'));
      withReflection(g, () => D.forEach((d, i) => dropPlaque(g, T, d, 600 + i * 360, FLOOR, ['8', '7', '8'][i], 0.82)), 0.22);
      floorFade(g);
      D.forEach((d, i) => landFx(g, T, d, 600 + i * 360, FLOOR));
      g.restore();
      splitFx(g, T);
    }}>
      <Lb x={960} y={760} s="金铲铲" size={44} col={C.goldHi} ls="0.3em" o={eo(T, 0.55, 0.3) * (1 - rise)} />
      <Lb x={960} y={330} s="最近三把" size={26} col="rgba(255,200,235,.85)" ls="0.4em" o={eo(T, bt(2) - 0.2, 0.3) * (1 - eio(T, SPLIT, 0.45))} />
      <SplitWords T={T} y={300} />
    </Scene>
  );
};

/* the reel ---------------------------------------------------------------- */
type Clip = { tag: string; name: string; a: number; z: number; die?: number; el: (T: number, f: number) => React.ReactNode };
const G0 = 23.6, G1 = 27.6;
const CLIPS: Clip[] = [
  { tag: '颠勺 1', name: '铲子立在左边的黑色展台上', a: 0, z: HOOK_END, el: (T, f) => <HD T={T} f={f} sp={1} /> },
  { tag: '颠勺 2', name: '铲子斜倚在锅后面，大而暗，像背景', a: 0, z: HOOK_END, el: (T, f) => <HD T={T} f={f} sp={2} /> },
  { tag: '颠勺 3', name: '铲子斜放在锅前的地面上，静物摆拍', a: 0, z: HOOK_END, el: (T, f) => <HD T={T} f={f} sp={3} /> },
];
const SLATE = 30;
const frames = (c: Clip) => Math.round((c.z - c.a) * 30);
export const TESTS2_FRAMES = CLIPS.reduce((m, c) => m + SLATE + frames(c), 0);
export const TESTS2_SEGMENTS = CLIPS.map((c) => [c.a, frames(c)]);

export const Tests2: React.FC = () => {
  const fr = useCurrentFrame();
  const [h] = useState(() => delayRender('t2-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '400 40px "DejaVu Sans"'].map((x) => document.fonts.load(x, '是菜还是非金铲铲0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  let acc = 0, idx = 0;
  for (; idx < CLIPS.length; idx++) { const n = SLATE + frames(CLIPS[idx]); if (fr < acc + n) break; acc += n; }
  idx = Math.min(idx, CLIPS.length - 1);
  const c = CLIPS[idx], local = fr - acc;
  GAL.die = c.die ?? 1;
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
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {c.el(T, fr)}
      <Grade warm={0.03} />
      <Grain T={T} />
      <Bars />
      <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
        <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
      </div>
      <div style={{ position: 'absolute', left: 56, top: 36, fontFamily: F.sans, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(227,183,101,.8)' }}>{c.tag}</div>
      <Subs T={T} lines={LINES} />
    </AbsoluteFill>
  );
};

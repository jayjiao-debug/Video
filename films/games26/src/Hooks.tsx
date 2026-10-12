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

/* D · stir-fry toss: the pan flips one plaque up three times (8 → 7 → 8); the last toss bursts into 菜？ | 非？ --------- */
const HD: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const TOSS = [bt(0), bt(2), bt(4)], LAND = [bt(2), bt(4)], PX = 960, PY = FLOOR - 30;
  const jerk = TOSS.reduce((m, t) => m + -0.32 * Math.exp(-Math.pow((T - t + 0.04) / 0.07, 2)), 0);
  const catchDip = LAND.reduce((m, d) => m + (T < d ? 0 : 10 * Math.exp(-(T - d) * 9) * Math.cos((T - d) * 20)), 0);
  // the plaque's flight
  let px = PX, py = PY - 125, rot = 0, num = '8', vis = 1;
  const k = TOSS.findIndex((t, i) => T >= t && T < (LAND[i] ?? 99));
  if (k >= 0) {
    const t0 = TOSS[k], t1 = LAND[k] ?? SPLIT, q = clamp((T - t0) / (t1 - t0)), apex = k === 2 ? 300 : 340;
    py = PY - 125 - 4 * apex * q * (1 - q) * (k === 2 ? 1 + q * 0.3 : 1); rot = q * Math.PI * 2 * (k === 1 ? -1 : 1);
    num = k === 0 ? (q < 0.5 ? '8' : '7') : k === 1 ? (q < 0.5 ? '7' : '8') : '8';
    if (k === 2 && T >= SPLIT - 0.02) vis = 0;
  } else if (T >= bt(2) && T < bt(4)) num = '7';
  if (T >= SPLIT) vis = 0;
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.8);
      g.save(); cam(g, lerp(1.0, 1.05, eio(T, 0, HOOK_END)), 960, 600);
      spot(g, 960, 900, 0.5 + 0.45 * eo(T, bt(0), 0.2), '255,230,200'); spot(g, 380, 340, 0.7, '255,230,190');
      if (vis > 0) { g.save(); g.translate(px, py + catchDip); g.rotate(rot); g.scale(0.78, 0.78); plaque(g, 0, 160, num); g.restore(); }
      withReflection(g, () => { spatula(g, 380, FLOOR, 0.85, 0.05); panSide(g, PX, PY + catchDip, 1.6, jerk); }, 0.22);
      floorFade(g);
      LAND.forEach((d) => { if (T > d) add(g, () => sparks(g, PX, PY - 60, d, T, 40, GOLD, 0.8, d)); });
      if (T >= SPLIT) add(g, () => { sparks(g, 960, PY - 330, SPLIT, T, 140, '255,200,235', 2.2, 7); glowDot(g, 960, PY - 330, 300, 0.5 * hit(T, SPLIT, 0.35), '255,214,240'); });
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
  { tag: '开场 A', name: '陈列：金铲铲 + 金锅锅在重拍亮灯，三块牌落在中间', a: 0, z: HOOK_END, el: (T, f) => <HA T={T} f={f} /> },
  { tag: '开场 B', name: '锅当铜锣：每块牌落地锅就“嗡”一下，最后铲子劈下来分屏', a: 0, z: HOOK_END, el: (T, f) => <HB T={T} f={f} /> },
  { tag: '开场 C', name: '牌掉进锅里：哐、哐、哐，铲子立在旁边', a: 0, z: HOOK_END, el: (T, f) => <HC T={T} f={f} /> },
  { tag: '开场 D', name: '颠勺：锅把牌颠起来三次 8→7→8，最后一颠炸成 菜？|非？', a: 0, z: HOOK_END, el: (T, f) => <HD T={T} f={f} /> },
  { tag: '开场 E', name: '徽章：锅铲交叉成徽章，升到顶上，三块牌落在下面', a: 0, z: HOOK_END, el: (T, f) => <HE T={T} f={f} /> },
  { tag: '骰子 1', name: '直接掉下来：落地弹两下，不转', a: G0, z: G1, die: 1, el: (T, f) => <S2 T={T} f={f} /> },
  { tag: '骰子 2', name: '从右边滚进来：沿着棱翻三面，减速停下', a: G0, z: G1, die: 2, el: (T, f) => <S2 T={T} f={f} /> },
  { tag: '骰子 3', name: '骰盅：盅掀起来，骰子就在那里，骰子本身不动', a: G0, z: G1, die: 3, el: (T, f) => <S2 T={T} f={f} /> },
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
  GAL.die = c.die ?? 0;
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

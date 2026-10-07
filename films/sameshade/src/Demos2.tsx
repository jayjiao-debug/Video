import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { JUNO } from './brand/identity';
import music from './music.json';

/* Second round of candidate illusions for the quiet section of 《大脑的懒惰》: none of them needs the viewer to stare,
   so they still work while the subtitles are being read. 16.28 s each (break → build), back to back for review.
   Code-drawn; every number on screen is the drawn geometry. Motion runs on its own clocks, not the beat. */
export const SEG2 = music.events.build - music.events.break;
const GOLD = '#f1c56d', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.55)', RED = '#ff5a48';
const SANS = '"Noto Sans CJK SC", sans-serif', MONO = '"JunoMono", monospace';
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const vis = (t: number, a: number, z: number, fi = 0.25, fo = 0.3) => Math.min(easeOut(prog(t, a, a + fi)), 1 - prog(t, z - fo, z));

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"'].map((f) => document.fonts.load(f, '测试0123')))
      .then(() => continueRender(h), () => continueRender(h));
  }, [h]);
};
type Line = [number, number, string];
const Subs: React.FC<{ t: number; lines: Line[] }> = ({ t, lines }) => {
  const cur = lines.find(([a, z]) => t >= a - 0.05 && t < z + 0.1);
  if (!cur) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center', opacity: Math.min(easeOut(prog(t, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(t, cur[1], cur[1] + 0.1)) }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', lineHeight: 1.25, textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)' }}>
        {cur[2].split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>
          : seg.startsWith('{') ? <span key={i} style={{ color: RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}
      </span>
    </div>
  );
};
export const Box: React.FC<{ title: string; rows: [string, string, string?][]; o: number }> = ({ title, rows, o }) => o <= 0.001 ? null : (
  <div style={{ position: 'absolute', right: 70, top: 160, width: 450, padding: '16px 24px 18px', borderRadius: 16, background: 'rgba(10,10,12,0.88)', border: '1px solid rgba(243,237,226,0.2)', fontFamily: MONO, color: INK, opacity: o }}>
    <div style={{ fontSize: 22, letterSpacing: '0.2em', color: DIM, marginBottom: 10, fontFamily: SANS, fontWeight: 700 }}>{title}</div>
    {rows.map(([k, v, sw], i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 33, fontWeight: 700, marginTop: i ? 10 : 0 }}>
        {sw && <span style={{ width: 42, height: 42, borderRadius: 7, background: sw, border: '1px solid rgba(255,255,255,0.35)' }} />}
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 30, flexGrow: 1, whiteSpace: 'nowrap' }}>{k}</span>
        <span style={{ whiteSpace: 'pre' }}>{v}</span>
      </div>
    ))}
  </div>
);

/* ---------------------------------------------------------------- A. Shepard tables (Shepard 1990, Mind Sights) */
// one table top: a parallelogram with a long side U and a short side V; the right table's top is the very same shape
// turned 90°. Legs and a little thickness make the brain read them as tables, i.e. as receding into depth.
type P2 = [number, number];
const U: P2 = [-118, -276], V: P2 = [112, 46];            // |U| = 300, |V| = 121
const rot = ([x, y]: P2, a: number): P2 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const top = (c: P2, u: P2, v: P2): P2[] => { const o: P2 = [c[0] - (u[0] + v[0]) / 2, c[1] - (u[1] + v[1]) / 2]; return [o, [o[0] + u[0], o[1] + u[1]], [o[0] + u[0] + v[0], o[1] + u[1] + v[1]], [o[0] + v[0], o[1] + v[1]]]; };
const pts = (p: P2[]) => p.map((q) => q.join(',')).join(' ');
const Table: React.FC<{ c: P2; u: P2; v: P2; o?: number }> = ({ c, u, v, o = 1 }) => {
  const q = top(c, u, v), TH = 16, LEG = 150;
  const low = [...q].sort((a, b) => b[1] - a[1]).slice(0, 3);      // the three corners nearest the viewer carry legs
  return (
    <g opacity={o}>
      {low.map((p, i) => <rect key={i} x={p[0] - 7} y={p[1] + TH - 4} width={14} height={LEG} fill="#3a2414" />)}
      {q.map((p, i) => { const n = q[(i + 1) % 4]; return <polygon key={i} points={`${p[0]},${p[1]} ${n[0]},${n[1]} ${n[0]},${n[1] + TH} ${p[0]},${p[1] + TH}`} fill="#5a3518" />; })}
      <polygon points={pts(q)} fill="#b9773e" />
      <polygon points={pts(q)} fill="none" stroke="#e0a565" strokeWidth={2} />
    </g>
  );
};
const C_L: P2 = [640, 520], C_R: P2 = [1290, 560];
const SH_LINES: Line[] = [[0.2, 3.1, '两张桌面，哪一张更[长]？'], [3.2, 6.3, '左边又长又窄，右边又短又宽？'],
  [6.6, 9.7, '把左边的桌面拿起来，转一下——'], [10.4, 13.3, '{一模一样}。只是转了90度'], [13.4, 16.2, '大脑自动按"[透视]"把它拉长了']];
const LIFT = 6.8, LAND = 9.6;
const Shepard: React.FC<{ t: number }> = ({ t }) => {
  const k = easeInOut(prog(t, LIFT, LAND));
  const a = -Math.PI / 2 * k;
  const c: P2 = [lerp(C_L[0], C_R[0], k), lerp(C_L[1], C_R[1], k) - 120 * Math.sin(Math.PI * k)];
  const ghost = top(c, rot(U, a), rot(V, a));
  const landed = t >= LAND;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #2a2118 0%, #120d09 70%, #070504 100%)' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect x={0} y={760} width={1920} height={320} fill="#0d0907" />
        <Table c={C_L} u={U} v={V} />
        <Table c={C_R} u={rot(U, -Math.PI / 2)} v={rot(V, -Math.PI / 2)} />
        {t >= LIFT - 0.2 && <polygon points={pts(ghost)} fill={landed ? 'rgba(241,197,109,0.35)' : 'rgba(241,197,109,0.22)'} stroke={GOLD} strokeWidth={4} strokeDasharray={landed ? '0' : '14 10'} opacity={vis(t, LIFT - 0.2, 99, 0.2)} />}
        {t >= LIFT - 0.2 && <polygon points={pts(top(C_L, U, V))} fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray="10 8" opacity={0.7 * vis(t, LIFT - 0.2, 99, 0.2)} />}
      </svg>
      <Box title="量一下 · 像素" o={vis(t, 3.2, 99, 0.3)} rows={[['左桌面', '300 × 121'], ['右桌面', '300 × 121']]} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- B. barber pole / aperture problem (Wallach 1935) */
const SPD = 110, PER = 70; // px/s to the right; stripe period
const OPEN0 = 8.0, OPEN1 = 9.0, SHUT0 = 13.4, SHUT1 = 14.2;
const BP_LINES: Line[] = [[0.2, 3.1, '窗口里的条纹，往哪个方向走？'], [3.2, 6.2, '看起来，一直在往[上]走？'],
  [8.1, 11.2, '把窗口打开——它们一直在往{右}走'], [11.3, 14.6, '只看见一小段，大脑就挑[最省事]的答案'], [14.7, 16.2, '关上窗，又往上了']];
const Barber: React.FC<{ t: number }> = ({ t }) => {
  const open = easeInOut(prog(t, OPEN0, OPEN1)) * (1 - easeInOut(prog(t, SHUT0, SHUT1)));
  const w = lerp(150, 1300, open), h = 560, x0 = 960 - w / 2, y0 = 330;
  const dx = (SPD * t) % PER;
  return (
    <AbsoluteFill style={{ background: '#101014' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs><clipPath id="ap"><rect x={x0} y={y0} width={w} height={h} rx={10} /></clipPath></defs>
        <g clipPath="url(#ap)">
          <rect x={x0} y={y0} width={w} height={h} fill="#f1ece2" />
          {/* "\" stripes moving right: through a tall slit they read as moving up */}
          <g transform={`translate(${dx} 0)`}>
            {Array.from({ length: 60 }, (_, i) => { const x = -1200 + i * PER; return <polygon key={i} points={`${x},0 ${x + 32},0 ${x + 32 + 1080},1080 ${x + 1080},1080`} fill="#c8302a" />; })}
          </g>
        </g>
        <rect x={x0} y={y0} width={w} height={h} rx={10} fill="none" stroke="#3a3a44" strokeWidth={10} />
        {open > 0.6 && <g opacity={vis(t, OPEN1 - 0.2, SHUT0, 0.2, 0.3)}>
          <line x1={760} y1={930} x2={1140} y2={930} stroke={GOLD} strokeWidth={8} /><polygon points="1140,912 1176,930 1140,948" fill={GOLD} />
        </g>}
      </svg>
      <Box title="实际运动" o={vis(t, OPEN0, 99, 0.3)} rows={[['方向', '→ 水平'], ['速度', `${SPD} px/s`]]} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- C. the breathing circle (dynamic Ebbinghaus) */
const D = 140, PERIOD = 3.4; // centre diameter; the surround's own clock
const EB_LINES: Line[] = [[0.2, 3.1, '中间的橙色圆，在变大变小吗？'], [3.2, 6.0, '看起来，像在[呼吸]'],
  [10.1, 13.0, '量一下：直径{一直是140}'], [13.1, 16.2, '大脑拿旁边的东西，当[尺子]']];
const PROOF = 10.0;
const Ebb: React.FC<{ t: number }> = ({ t }) => {
  const s = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / PERIOD);  // 0 = big circles close, 1 = small circles far
  const rr = lerp(118, 34, s), ring = lerp(215, 175, s);
  const fade = 1 - 0.8 * easeInOut(prog(t, PROOF + 2.6, PROOF + 3.4));
  const ruler = vis(t, PROOF - 0.1, 99, 0.25);
  return (
    <AbsoluteFill style={{ background: '#0d0e12' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={fade}>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <circle key={i} cx={960 + Math.cos(a) * (D / 2 + 22 + ring - 60)} cy={540 + Math.sin(a) * (D / 2 + 22 + ring - 60)} r={rr} fill="#6a7486" />; })}</g>
        <circle cx={960} cy={540} r={D / 2} fill="#f08a2c" />
        <g opacity={ruler}>
          <line x1={960 - D / 2} y1={540} x2={960 + D / 2} y2={540} stroke="#fff" strokeWidth={3} />
          <line x1={960 - D / 2} y1={524} x2={960 - D / 2} y2={556} stroke="#fff" strokeWidth={3} /><line x1={960 + D / 2} y1={524} x2={960 + D / 2} y2={556} stroke="#fff" strokeWidth={3} />
        </g>
      </svg>
      <Box title="量一下 · 像素" o={ruler} rows={[['橙圆直径', String(D), '#f08a2c'], ['全程', '从没变过']]} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- D. curvature blindness (Takahashi 2017, i-Perception) */
// identical sine waves; each line alternates light and dark every half wavelength. Where the colour flips at the
// peaks and troughs the line reads as a zigzag; where it flips half-way between, it reads as a smooth wave.
const WL = 170, AMP = 26;
const CB_LINES: Line[] = [[0.2, 3.1, '这些线，是弯的，还是[折]的？'], [3.2, 6.3, '上面三条像折线，下面三条像波浪？'],
  [8.6, 11.6, '描一遍：每一条，都是{同一条曲线}'], [11.7, 16.2, '大脑偷懒，把颜色突变当成了"[拐角]"']];
const TRACE = 8.4;
const wave = (y: number, x0: number, x1: number) => { let d = `M ${x0} ${y}`; for (let x = x0; x <= x1; x += 4) d += ` L ${x} ${y + AMP * Math.sin((2 * Math.PI * (x - x0)) / WL)}`; return d; };
const Curv: React.FC<{ t: number }> = ({ t }) => {
  const rows = [240, 340, 440, 600, 700, 800];
  const x0 = 200, x1 = 1720;
  const trace = prog(t, TRACE, TRACE + 2.0);
  return (
    <AbsoluteFill style={{ background: '#8a8a8a' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {rows.map((y, r) => {
          const zig = r < 3; // flip at peaks (zigzag look) for the top three, at the zero crossings for the bottom three
          const shift = zig ? WL / 4 : 0;
          return (
            <g key={r}>
              <defs><clipPath id={`cb${r}`}>{Array.from({ length: 30 }, (_, i) => <rect key={i} x={x0 - WL + shift + i * WL} y={y - 80} width={WL / 2} height={160} />)}</clipPath></defs>
              <path d={wave(y, x0, x1)} fill="none" stroke="#2b2b2b" strokeWidth={9} />
              <path d={wave(y, x0, x1)} fill="none" stroke="#e8e8e8" strokeWidth={9} clipPath={`url(#cb${r})`} />
            </g>
          );
        })}
        {trace > 0 && rows.map((y, r) => <path key={r} d={wave(y, x0, x1)} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray={`${3200 * trace} 9999`} />)}
      </svg>
    </AbsoluteFill>
  );
};

const PARTS: [string, React.FC<{ t: number }>, Line[]][] = [
  ['新候选 A · 谢泼德桌子', Shepard, SH_LINES], ['新候选 B · 理发店转灯（光圈问题）', Barber, BP_LINES],
  ['新候选 C · 会呼吸的圆（动态艾宾浩斯）', Ebb, EB_LINES], ['新候选 D · 曲率盲', Curv, CB_LINES],
];
export const N_PARTS = PARTS.length;
export const Demos2: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const k = Math.min(PARTS.length - 1, Math.floor(T / SEG2)), t = T - k * SEG2;
  const [name, Part, lines] = PARTS[k];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }`}</style>
      <Part t={t} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 128, background: '#000' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 128, background: '#000' }} />
      <div style={{ position: 'absolute', top: 48, left: 70, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: DIM }}>{name}（审片用标签，正片不出现）</div>
      <Subs t={t} lines={lines} />
      <div style={{ position: 'absolute', top: 50, right: 60, opacity: 0.6, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

/* 小J — the robot guide of 《掉进黑洞》. Original design: a small square cube (not a tall slab, not segmented),
   warm ivory shell with gold edges, a dark glass face screen with two gold "eyes" that make the expressions,
   a short antenna with a gold bulb, two stubby thruster pods for arms, a soft thruster glow underneath.
   Drawn as a tiny parallel-projection box renderer in SVG so every view and expression comes from one model. */

type V3 = [number, number, number];
type View = { yaw: number; pitch: number; s: number; cx: number; cy: number };
const GOLD = '#f1c56d', GOLD_D = '#c8913a', IVORY = '#ece6da', INK = '#f3ede2';

const proj = (v: V3, w: View): [number, number] => {
  const [x, y, z] = v; // x right, y up, z towards the viewer at yaw 0
  const cy = Math.cos(w.yaw), sy = Math.sin(w.yaw), cp = Math.cos(w.pitch), sp = Math.sin(w.pitch);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  return [w.cx + x1 * w.s, w.cy - y1 * w.s + 0 * z2];
};
const depth = (v: V3, w: View) => { const [x, y, z] = v; const z1 = -x * Math.sin(w.yaw) + z * Math.cos(w.yaw); return y * Math.sin(w.pitch) + z1 * Math.cos(w.pitch); };
const nrm = (n: V3, w: View) => depth(n, w); // facing the camera if > 0

type Face = { pts: V3[]; n: V3; fill: string; decal?: (m: string) => React.ReactNode; key: string };
/** a box centred at c with half sizes h; faces get light from the upper left front */
const box = (key: string, c: V3, h: V3, col: [number, number, number], decals: Partial<Record<'front' | 'back' | 'left' | 'right' | 'top', (m: string) => React.ReactNode>> = {}): Face[] => {
  const [cx, cy, cz] = c, [hx, hy, hz] = h;
  const P = (sx: number, sy: number, sz: number): V3 => [cx + sx * hx, cy + sy * hy, cz + sz * hz];
  const L: V3 = [-0.45, 0.75, 0.5];
  const shade = (n: V3) => { const d = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]); const k = 0.62 + 0.5 * d; return `rgb(${Math.round(col[0] * k)},${Math.round(col[1] * k)},${Math.round(col[2] * k)})`; };
  const F = (k: string, pts: V3[], n: V3): Face => ({ key: `${key}-${k}`, pts, n, fill: shade(n), decal: (decals as any)[k] });
  return [
    F('front', [P(-1, 1, 1), P(1, 1, 1), P(1, -1, 1), P(-1, -1, 1)], [0, 0, 1]),
    F('back', [P(1, 1, -1), P(-1, 1, -1), P(-1, -1, -1), P(1, -1, -1)], [0, 0, -1]),
    F('right', [P(1, 1, 1), P(1, 1, -1), P(1, -1, -1), P(1, -1, 1)], [1, 0, 0]),
    F('left', [P(-1, 1, -1), P(-1, 1, 1), P(-1, -1, 1), P(-1, -1, -1)], [-1, 0, 0]),
    F('top', [P(-1, 1, -1), P(1, 1, -1), P(1, 1, 1), P(-1, 1, 1)], [0, 1, 0]),
    F('bottom', [P(-1, -1, 1), P(1, -1, 1), P(1, -1, -1), P(-1, -1, -1)], [0, -1, 0]),
  ];
};
/** SVG matrix mapping the unit square (0..1, 0..1; y down) onto a projected face (corners tl, tr, bl) */
const faceMatrix = (f: Face, w: View) => {
  const [a, b, , d] = f.pts.map((p) => proj(p, w));
  return `matrix(${b[0] - a[0]} ${b[1] - a[1]} ${d[0] - a[0]} ${d[1] - a[1]} ${a[0]} ${a[1]})`;
};

export type Expr = 'normal' | 'blink' | 'wink' | 'happy' | 'worried' | 'surprised' | 'squint' | 'red';
/** the face screen, drawn in unit-square coordinates (0..1) */
const Screen: React.FC<{ e: Expr; glow?: boolean }> = ({ e, glow = true }) => {
  const eyeCol = e === 'red' ? '#ff6a4a' : GOLD;
  const eye = (x: number, kind: string) => {
    const y = 0.5, w = 0.13, h = 0.24;
    switch (kind) {
      case 'blink': return <rect x={x - w / 2} y={y - 0.015} width={w} height={0.03} rx={0.015} fill={eyeCol} />;
      case 'happy': return <path d={`M ${x - w / 2} ${y + 0.04} Q ${x} ${y - 0.12} ${x + w / 2} ${y + 0.04}`} fill="none" stroke={eyeCol} strokeWidth={0.045} strokeLinecap="round" />;
      case 'worried': return <g><rect x={x - w / 2} y={y - h / 2 + 0.04} width={w} height={h - 0.06} rx={0.05} fill={eyeCol} /><line x1={x - w / 2 - 0.01} y1={y - h / 2 - 0.02 + (x < 0.5 ? 0.04 : 0)} x2={x + w / 2 + 0.01} y2={y - h / 2 - 0.02 + (x < 0.5 ? 0 : 0.04)} stroke={eyeCol} strokeWidth={0.03} strokeLinecap="round" /></g>;
      case 'surprised': return <circle cx={x} cy={y} r={0.1} fill="none" stroke={eyeCol} strokeWidth={0.04} />;
      case 'squint': return <path d={`M ${x - w / 2} ${y - 0.05} L ${x + w / 2} ${y} L ${x - w / 2} ${y + 0.05}`} fill="none" stroke={eyeCol} strokeWidth={0.04} strokeLinejoin="round" strokeLinecap="round" transform={x > 0.5 ? `translate(${2 * x} 0) scale(-1 1)` : undefined} />;
      default: return <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={0.06} fill={eyeCol} />;
    }
  };
  const L = e === 'wink' ? 'normal' : e === 'red' ? 'normal' : e;
  const R = e === 'wink' ? 'happy' : e === 'red' ? 'normal' : e;
  return (
    <g>
      <rect x={0.08} y={0.12} width={0.84} height={0.7} rx={0.12} fill="#0c0f18" stroke={GOLD_D} strokeWidth={0.02} />
      <rect x={0.12} y={0.16} width={0.5} height={0.12} rx={0.06} fill="#fff" opacity={0.06} />
      <g style={glow ? { filter: `drop-shadow(0 0 0.03px ${eyeCol})` } : undefined}>{eye(0.33, L)}{eye(0.67, R)}</g>
      {e === 'happy' && <path d="M 0.42 0.66 Q 0.5 0.72 0.58 0.66" fill="none" stroke={eyeCol} strokeWidth={0.03} strokeLinecap="round" />}
      {e === 'surprised' && <circle cx={0.5} cy={0.68} r={0.035} fill={eyeCol} />}
    </g>
  );
};
const Jmark: React.FC = () => (
  <g>
    <circle cx={0.5} cy={0.5} r={0.22} fill="none" stroke={GOLD} strokeWidth={0.03} />
    <text x={0.5} y={0.6} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontWeight={700} fontSize={0.32} fill={GOLD}>J</text>
  </g>
);

export const CubeBot: React.FC<{ cx: number; cy: number; s: number; yaw?: number; pitch?: number; e?: Expr; armL?: number; armR?: number; stretch?: number; flame?: number }> =
  ({ cx, cy, s, yaw = 0, pitch = 0.2, e = 'normal', armL = 0, armR = 0, stretch = 1, flame = 1 }) => {
    const w: View = { yaw, pitch, s, cx, cy };
    const ivory: [number, number, number] = [236, 230, 218], gold: [number, number, number] = [241, 197, 109], dark: [number, number, number] = [60, 62, 72];
    const faces: Face[] = [
      ...box('body', [0, 0, 0], [0.5, 0.5 * stretch, 0.5], ivory, { front: () => <Screen e={e} />, back: () => <Jmark /> }),
      // gold edge bands (top rim) and a belly band
      ...box('rim', [0, 0.5 * stretch + 0.03, 0], [0.47, 0.03, 0.47], gold),
      ...box('foot', [0, -0.5 * stretch - 0.04, 0], [0.36, 0.04, 0.36], dark),
      // antenna
      ...box('ant', [0.18, 0.5 * stretch + 0.2, 0], [0.025, 0.16, 0.025], dark),
      ...box('bulb', [0.18, 0.5 * stretch + 0.39, 0], [0.06, 0.06, 0.06], gold),
      // thruster pods ("hands"), raised by armL / armR (0..1)
      ...box('podL', [-0.62, -0.05 + 0.3 * armL, 0], [0.1, 0.16, 0.16], ivory, {}),
      ...box('podR', [0.62, -0.05 + 0.3 * armR, 0], [0.1, 0.16, 0.16], ivory, {}),
      ...box('nozL', [-0.62, -0.25 + 0.3 * armL, 0], [0.07, 0.05, 0.11], dark),
      ...box('nozR', [0.62, -0.25 + 0.3 * armR, 0], [0.07, 0.05, 0.11], dark),
    ];
    const vis = faces.filter((f) => nrm(f.n, w) > 0.02);
    const cen = (f: Face) => { const c = f.pts.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4, a[2] + p[2] / 4] as V3, [0, 0, 0] as V3); return depth(c, w); };
    vis.sort((a, b) => cen(a) - cen(b));
    const [fx, fy] = proj([0, -0.5 * stretch - 0.1, 0], w);
    return (
      <g>
        {/* thruster glow under the body */}
        <ellipse cx={fx} cy={fy + s * 0.12 * flame} rx={s * 0.22} ry={s * 0.18 * flame} fill="url(#flame)" opacity={0.85} />
        {vis.map((f) => (
          <g key={f.key}>
            <polygon points={f.pts.map((p) => proj(p, w).join(',')).join(' ')} fill={f.fill} stroke={f.fill} strokeWidth={s * 0.03} strokeLinejoin="round" />
            {f.decal && <g transform={faceMatrix(f, w)}>{f.decal('')}</g>}
          </g>
        ))}
        {/* bulb glow */}
        <circle cx={proj([0.18, 0.5 * stretch + 0.39, 0], w)[0]} cy={proj([0.18, 0.5 * stretch + 0.39, 0], w)[1]} r={s * 0.12} fill={GOLD} opacity={0.18} />
      </g>
    );
  };

const Defs = () => (
  <defs>
    <radialGradient id="flame" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stopColor="#ffffff" stopOpacity={0.95} /><stop offset="0.35" stopColor="#9fd4ff" stopOpacity={0.6} /><stop offset="1" stopColor="#3a7bd5" stopOpacity={0} /></radialGradient>
  </defs>
);
const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const Label: React.FC<{ x: number; y: number; t: string; sub?: string; w?: number }> = ({ x, y, t, sub, w = 300 }) => (
  <div style={{ position: 'absolute', left: x - w / 2, width: w, top: y, textAlign: 'center' }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: INK }}>{t}</div>
    {sub && <div style={{ fontFamily: SANS, fontSize: 19, color: 'rgba(243,237,226,0.55)', marginTop: 4 }}>{sub}</div>}
  </div>
);

/* ---------------------------------------------------------------- sheet 1: model sheet */
const ModelSheet: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #151a2a, #05060b 70%)' }}>
    <div style={{ position: 'absolute', left: 70, top: 46, fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: GOLD }}>小J · 设定图</div>
    <div style={{ position: 'absolute', left: 74, top: 124, fontFamily: SANS, fontSize: 24, color: 'rgba(243,237,226,0.65)' }}>《掉进黑洞》的向导 · 一个巴掌大的方块机器人 · 象牙白外壳 + 金色包边 · 脸是一块屏幕</div>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      <CubeBot cx={330} cy={560} s={250} yaw={0} pitch={0.08} e="normal" />
      <CubeBot cx={790} cy={560} s={250} yaw={-0.62} pitch={0.28} e="happy" armR={0.8} />
      <CubeBot cx={1250} cy={560} s={250} yaw={-Math.PI / 2 + 0.001} pitch={0.08} e="normal" />
      <CubeBot cx={1680} cy={560} s={250} yaw={Math.PI} pitch={0.08} e="normal" />
      <line x1={70} y1={860} x2={1850} y2={860} stroke="rgba(243,237,226,0.15)" strokeWidth={2} />
    </svg>
    <Label x={330} y={780} t="正面" sub="屏幕上的两只金色眼睛" />
    <Label x={790} y={780} t="四分之三侧" sub="挥手：推进器当手" />
    <Label x={1250} y={780} t="侧面" sub="宽高几乎一样：小方块，不是长条" />
    <Label x={1680} y={780} t="背面" sub="背后刻着 Juno 的 J" />
    <div style={{ position: 'absolute', left: 74, top: 900, width: 1780, fontFamily: SANS, fontSize: 22, lineHeight: 1.7, color: 'rgba(243,237,226,0.6)' }}>
      身材：一个立方体（约 1:1:1），圆角；头顶一根短天线，金色灯泡会随说话闪。两侧是推进器，既是"手"也是"脚"，底部有一团蓝白色的推进光让它悬浮。
      所有表情都在屏幕上完成，身体本身不做人类动作，只做飞、转、歪、抖、拉伸这种"物体"动作。
    </div>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- sheet 2: expressions */
const EXPR: [Expr, string, string][] = [
  ['normal', '平常', '介绍、讲解'], ['blink', '眨眼', '说完一句'], ['wink', '挤眼', '"……大概吧"'], ['happy', '开心', '"恭喜"'],
  ['worried', '担心', '"坏消息"'], ['surprised', '惊讶', '"回头看！"'], ['squint', '眯眼', '"不是我没开灯"'], ['red', '变红', '外面的人看我们'],
];
const Expressions: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #151a2a, #05060b 70%)' }}>
    <div style={{ position: 'absolute', left: 70, top: 46, fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: GOLD }}>小J · 表情</div>
    <div style={{ position: 'absolute', left: 74, top: 124, fontFamily: SANS, fontSize: 24, color: 'rgba(243,237,226,0.65)' }}>全部靠脸上的屏幕：在 360 里离得远也一眼看得懂</div>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      {EXPR.map(([e], i) => <CubeBot key={e} cx={250 + (i % 4) * 470} cy={360 + Math.floor(i / 4) * 380} s={170} yaw={-0.35} pitch={0.18} e={e} flame={0.7} />)}
    </svg>
    {EXPR.map(([, t, sub], i) => <Label key={t} x={250 + (i % 4) * 470} y={490 + Math.floor(i / 4) * 380} t={t} sub={sub} />)}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- sheet 3/4: in the shot */
const Bubble: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
  <div style={{ position: 'absolute', left: x, top: y, maxWidth: 900, whiteSpace: 'nowrap', padding: '18px 26px', borderRadius: 22, background: 'rgba(12,14,24,0.88)', border: `2px solid ${GOLD}`,
    fontFamily: SANS, fontWeight: 700, fontSize: 44, color: INK, lineHeight: 1.35, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>{t}</div>
);
const InShot: React.FC<{ bg: string; bot: { cx: number; cy: number; s: number; yaw: number; e: Expr; armR?: number }; t: string; bx: number; by: number; title: string }> = ({ bg, bot, t, bx, by, title }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Img src={staticFile(bg)} style={{ width: 1920, height: 1080, objectFit: 'cover' }} />
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      <CubeBot cx={bot.cx} cy={bot.cy} s={bot.s} yaw={bot.yaw} pitch={0.22} e={bot.e} armR={bot.armR ?? 0} />
    </svg>
    <Bubble x={bx} y={by} t={t} />
    <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: 'rgba(243,237,226,0.7)', background: 'rgba(0,0,0,0.45)', padding: '6px 14px', borderRadius: 8 }}>{title}</div>
  </AbsoluteFill>
);

export const BotSheets: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {f === 0 && <ModelSheet />}
      {f === 1 && <Expressions />}
      {f === 2 && <InShot bg="bg1.jpg" bot={{ cx: 470, cy: 600, s: 190, yaw: 0.45, e: 'wink', armR: 0.9 }} t="嗨，我是这趟的向导，小J。" bx={600} by={430} title="0:00 · 正前方（示意，360 里它在你左前方）" />}
      {f === 3 && <InShot bg="bg2.jpg" bot={{ cx: 1480, cy: 330, s: 150, yaw: -0.5, e: 'squint' }} t="左边亮、右边暗，不是我没开灯。" bx={640} by={150} title="0:25 · 靠近 · 盘铺满视野" />}
    </AbsoluteFill>
  );
};

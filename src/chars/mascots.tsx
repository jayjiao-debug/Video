import React from 'react';

/* Series mascot candidates. Each is a pure function of props, local coords with feet at (0,0), ~240–330 px tall.
   expr: the shared expression set; costume: the per-episode costume gag; k: the signature-move morph (0 → 1). */
export type Expr = 'curious' | 'shock' | 'think' | 'happy' | 'sad';
export type Costume = 'none' | 'polar' | 'helmet' | 'lifejacket' | 'grad';
export type MP = { expr?: Expr; costume?: Costume; t?: number; k?: number; sq?: number; tilt?: number };

const OL = '#2a2230', LW = 5;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const cel = (id: string, base: string, shade: string, a = 0.58) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={base} /><stop offset={a} stopColor={base} /><stop offset={a} stopColor={shade} /><stop offset="1" stopColor={shade} /></linearGradient>
);
const cap = (x1: number, y1: number, x2: number, y2: number, r: number, fill: string, k: string) => (
  <g key={k}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OL} strokeWidth={r * 2 + LW * 2} strokeLinecap="round" /><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={r * 2} strokeLinecap="round" /></g>
);

/* ---------- shared face kit ---------- */
export const Eyes: React.FC<{ expr: Expr; x: number; y: number; s?: number; col?: string; lid?: string; dilate?: number }> = ({ expr, x, y, s = 1, col = '#1f1a24', lid = '#000', dilate = 0 }) => (
  <g>
    {[-x, x].map((cx, i) => {
      if (expr === 'happy') return <path key={i} d={`M ${cx - 15 * s} ${y + 5 * s} Q ${cx} ${y - 14 * s} ${cx + 15 * s} ${y + 5 * s}`} stroke={col} strokeWidth={6.5 * s} strokeLinecap="round" fill="none" />;
      if (expr === 'shock' && !dilate) return <g key={i}><ellipse cx={cx} cy={y} rx={18 * s} ry={23 * s} fill="#ffffff" stroke={OL} strokeWidth={4} /><circle cx={cx} cy={y + 2 * s} r={5.5 * s} fill={col} /></g>;
      const lx = expr === 'think' ? -5 * s : 0, ly = expr === 'think' ? -6 * s : 0, r = 1 + dilate * 0.45;
      return (
        <g key={i}>
          <ellipse cx={cx + lx} cy={y + ly} rx={13.5 * s * r} ry={18.5 * s * r} fill={col} />
          <circle cx={cx + lx - 4.5 * s * r} cy={y + ly - 7 * s * r} r={5.4 * s * r} fill="#ffffff" />
          <circle cx={cx + lx + 5 * s * r} cy={y + ly + 6 * s * r} r={2.5 * s * r} fill="#ffffff" />
          {expr === 'sad' && <path d={`M ${cx - 20 * s} ${y - 24 * s} L ${cx + 20 * s} ${y - 24 * s} L ${cx + 20 * s} ${y - (i ? 16 : 2) * s} L ${cx - 20 * s} ${y - (i ? 2 : 16) * s} Z`} fill={lid} />}
          {expr === 'think' && <path d={`M ${cx - 17 * s} ${y - 6 * s} L ${cx + 17 * s} ${y - 6 * s}`} stroke={lid} strokeWidth={0} />}
        </g>
      );
    })}
  </g>
);
export const Mouth: React.FC<{ expr: Expr; x: number; y: number; s?: number }> = ({ expr, x, y, s = 1 }) => {
  const g = (d: React.ReactNode) => <g transform={`translate(${x} ${y}) scale(${s})`}>{d}</g>;
  if (expr === 'shock') return g(<><ellipse cx={0} cy={4} rx={15} ry={19} fill="#4a1f2a" stroke={OL} strokeWidth={3} /><ellipse cx={0} cy={15} rx={9} ry={5} fill="#ef7f86" /></>);
  if (expr === 'happy') return g(<><path d="M -19 -4 Q 0 24 19 -4 Z" fill="#4a1f2a" stroke={OL} strokeWidth={3} strokeLinejoin="round" /><ellipse cx={0} cy={9} rx={8} ry={4} fill="#ef7f86" /></>);
  if (expr === 'sad') return g(<path d="M -12 6 Q 0 -6 12 6" stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />);
  if (expr === 'think') return g(<path d="M -11 1 Q -5 -4 1 1 T 13 1" stroke={OL} strokeWidth={4.5} fill="none" strokeLinecap="round" />);
  return g(<ellipse cx={0} cy={2} rx={7} ry={8} fill="#4a1f2a" stroke={OL} strokeWidth={3} />);
};
const Blush: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 13 }) => <>{[-x, x].map((cx) => <ellipse key={cx} cx={cx} cy={y} rx={r} ry={r * 0.6} fill="#ff8f8f" opacity={0.5} />)}</>;

/* ---------- shared costume kit (positioned by each mascot via top-of-head y and half-width) ---------- */
const Hat: React.FC<{ c: Costume; top: number; w: number; hole?: boolean }> = ({ c, top, w }) => {
  if (c === 'polar') return (
    <g>
      <path d={`M ${-w} ${top + 46} C ${-w} ${top - 18} ${w} ${top - 18} ${w} ${top + 46} Z`} fill="#c8402f" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
      {[-0.6, -0.2, 0.2, 0.6].map((k) => <path key={k} d={`M ${k * w} ${top + 4} L ${k * w * 1.05} ${top + 40}`} stroke="#9e2f22" strokeWidth={4} />)}
      <rect x={-w - 8} y={top + 34} width={2 * w + 16} height={26} rx={13} fill="#f2ede2" stroke={OL} strokeWidth={LW} />
    </g>
  );
  if (c === 'helmet') return (
    <g>
      <path d={`M ${-w * 0.72} ${top + 40} C ${-w * 0.72} ${top - 22} ${w * 0.72} ${top - 22} ${w * 0.72} ${top + 40} Z`} fill="#66733f" stroke={OL} strokeWidth={LW} />
      <ellipse cx={0} cy={top + 42} rx={w * 1.28} ry={17} fill="#56622f" stroke={OL} strokeWidth={LW} />
      <path d={`M ${-w * 0.5} ${top + 8} Q 0 ${top - 6} ${w * 0.5} ${top + 8}`} stroke="#8a965e" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
  if (c === 'grad') return (
    <g>
      <path d={`M ${-w * 0.62} ${top + 30} L ${-w * 0.62} ${top + 50} Q 0 ${top + 64} ${w * 0.62} ${top + 50} L ${w * 0.62} ${top + 30} Z`} fill="#26232e" stroke={OL} strokeWidth={LW} />
      <path d={`M 0 ${top - 6} L ${w * 1.2} ${top + 22} L 0 ${top + 46} L ${-w * 1.2} ${top + 22} Z`} fill="#33303c" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
      <path d={`M 0 ${top + 20} L ${w * 0.95} ${top + 26} L ${w * 0.98} ${top + 74}`} stroke="#e8b33f" strokeWidth={5} fill="none" />
      <rect x={w * 0.9} y={top + 70} width={14} height={26} rx={4} fill="#e8b33f" stroke={OL} strokeWidth={3} />
    </g>
  );
  return null;
};
const Vest: React.FC<{ y0: number; y1: number; w: number }> = ({ y0, y1, w }) => (
  <g>
    {[-1, 1].map((s) => (
      <g key={s}>
        <rect x={s < 0 ? -w : 8} y={y0} width={w - 8} height={y1 - y0} rx={16} fill="#f4f1e6" stroke={OL} strokeWidth={LW} />
        {[0.3, 0.6].map((k) => <line key={k} x1={s < 0 ? -w + 6 : 14} x2={s < 0 ? -14 : w - 6} y1={lerp(y0, y1, k)} y2={lerp(y0, y1, k)} stroke="#c9c3b2" strokeWidth={4} />)}
      </g>
    ))}
    <rect x={-w - 4} y={lerp(y0, y1, 0.78)} width={2 * w + 8} height={12} rx={6} fill="#c8402f" stroke={OL} strokeWidth={3} />
  </g>
);

/* ======================== 1 · 问问 Wenwen: the question-mark bean ======================== */
// the antenna is the hook of a "?", the body is its dot; at every reveal it snaps straight into "!"
const Q_PTS = [[0, -212], [0, -244], [0, -262], [44, -266], [44, -292], [44, -322], [-12, -328], [-24, -298]];
const X_PTS = [[0, -212], [0, -246], [0, -262], [0, -276], [0, -292], [0, -308], [0, -322], [0, -338]];
export const Wenwen: React.FC<MP> = ({ expr = 'curious', costume = 'none', t = 0, k = 0, sq = 1, tilt = 0 }) => {
  const droop = expr === 'sad' ? 1 : 0, wob = Math.sin(t * 5) * 3 * (1 - k);
  const P = Q_PTS.map((q, i) => {
    const x = lerp(q[0], X_PTS[i][0], k), y = lerp(q[1], X_PTS[i][1], k);
    const dx = droop * (i > 1 ? (i - 1) * 14 : 0), dy = droop * (i > 1 ? (i - 1) * 9 : 0);
    return [x + dx + (i > 1 ? wob * (i / 7) : 0), y + dy];
  });
  const d = `M ${P[0]} L ${P[1]} C ${P[2]} ${P[3]} ${P[4]} C ${P[5]} ${P[6]} ${P[7]}`;
  const arms = expr === 'shock' ? [[-92, -112, -132, -158], [92, -112, 132, -158]] : expr === 'think' ? [[-92, -90, -116, -64], [90, -96, 44, -84]] : expr === 'happy' ? [[-92, -104, -128, -130], [92, -104, 128, -130]] : [[-92, -92, -118, -66], [92, -92, 118, -66]];
  return (
    <g transform={`rotate(${tilt}) scale(${1 / Math.sqrt(sq)} ${sq})`}>
      <defs>{cel('ww-b', '#f6b93f', '#dc9327')}</defs>
      <ellipse cx={-38} cy={-8} rx={30} ry={14} fill="#c98420" stroke={OL} strokeWidth={LW} />
      <ellipse cx={38} cy={-8} rx={30} ry={14} fill="#c98420" stroke={OL} strokeWidth={LW} />
      <path d={d} stroke={OL} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#f6b93f" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {k > 0.35 && (() => { const o = Math.min(1, (k - 0.35) / 0.4), w = 4 + 10 * o; return <path d={`M -5 -236 L 5 -236 L ${w} -332 Q 0 ${-338 - w * 0.8} ${-w} -332 Z`} fill="#f6b93f" stroke={OL} strokeWidth={LW} strokeLinejoin="round" opacity={o} />; })()}
      <path d="M 0 -215 C 70 -215 100 -140 98 -90 C 96 -40 60 -10 0 -10 C -60 -10 -96 -40 -98 -90 C -100 -140 -70 -215 0 -215 Z" fill="url(#ww-b)" stroke={OL} strokeWidth={LW} />
      <ellipse cx={0} cy={-62} rx={56} ry={40} fill="#fff1d2" />
      <path d="M -62 -176 Q -50 -196 -30 -202" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.75} />
      {costume === 'lifejacket' && <Vest y0={-84} y1={-16} w={76} />}
      {arms.map(([a, b, c, e], i) => cap(a, b, c, e, 13, '#f6b93f', 'arm' + i))}
      <Eyes expr={expr} x={34} y={-128} lid="#f6b93f" />
      <Blush x={62} y={-98} />
      <Mouth expr={expr} x={0} y={-94} />
      {costume !== 'none' && costume !== 'lifejacket' && <Hat c={costume} top={-222} w={82} />}
    </g>
  );
};

/* ======================== 2 · 灯灯 Dengdeng: the lantern spirit ======================== */
// no hands, no legs: it floats and carries the light; the flame is its mood
export const Dengdeng: React.FC<MP> = ({ expr = 'curious', costume = 'none', t = 0, k = 0, sq = 1, tilt = 0 }) => {
  const fl = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 21);
  const flame = expr === 'sad' ? 0.55 : expr === 'shock' ? 1.6 : 1 + k * 0.8;
  const fcol = expr === 'sad' ? ['#cfe6ff', '#7fb6ff'] : ['#fff6d0', '#ffb22e'];
  const bob = -46 + Math.sin(t * 2.2) * 10, sway = Math.sin(t * 2.2 - 0.8) * 10;
  const glow = 0.35 + k * 0.5 + (expr === 'shock' ? 0.3 : 0);
  return (
    <g>
      <defs>
        <radialGradient id="dd-body" cx="0.45" cy="0.42" r="0.62"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.55" stopColor="#ffc458" /><stop offset="1" stopColor="#ee8628" /></radialGradient>
        <radialGradient id="dd-glow"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.8} /><stop offset="0.4" stopColor="#ffb85a" stopOpacity={0.25} /><stop offset="1" stopColor="#ffb85a" stopOpacity={0} /></radialGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={70 - bob * 0.1} ry={11} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bob}) rotate(${tilt}) scale(${1 / Math.sqrt(sq)} ${sq})`}>
        <circle cx={0} cy={-140} r={300} fill="url(#dd-glow)" opacity={glow} />
        <path d={`M 0 -30 Q ${sway * 0.5} -8 ${sway} 12`} stroke="#c8402f" strokeWidth={6} fill="none" />
        <path d={`M ${sway - 12} 8 L ${sway + 12} 8 L ${sway + 16} 46 L ${sway - 16} 46 Z`} fill="#c8402f" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <g transform={`translate(0 -246) scale(${flame * fl} ${flame * fl})`}>
          <path d="M 0 -56 C 22 -30 26 -10 0 2 C -26 -10 -22 -30 0 -56 Z" fill={fcol[1]} stroke={OL} strokeWidth={4 / flame} />
          <path d="M 0 -34 C 10 -20 12 -8 0 -2 C -12 -8 -10 -20 0 -34 Z" fill={fcol[0]} />
        </g>
        <ellipse cx={0} cy={-140} rx={90} ry={100} fill="url(#dd-body)" stroke={OL} strokeWidth={LW} />
        {[0.32, 0.68].map((r) => <ellipse key={r} cx={0} cy={-140} rx={90 * r} ry={100} fill="none" stroke="#d9822b" strokeWidth={3} opacity={0.45} />)}
        <rect x={-50} y={-252} width={100} height={26} rx={10} fill="#5b3a29" stroke={OL} strokeWidth={LW} />
        <rect x={-50} y={-54} width={100} height={26} rx={10} fill="#5b3a29" stroke={OL} strokeWidth={LW} />
        {costume === 'lifejacket' && (
          <g>
            <ellipse cx={0} cy={-104} rx={112} ry={30} fill="none" stroke={OL} strokeWidth={34} />
            <ellipse cx={0} cy={-104} rx={112} ry={30} fill="none" stroke="#f4f1e6" strokeWidth={24} />
            <ellipse cx={0} cy={-104} rx={112} ry={30} fill="none" stroke="#c8402f" strokeWidth={24} strokeDasharray="44 44" />
          </g>
        )}
        <Eyes expr={expr} x={32} y={-150} col="#4a2414" lid="#ffcf6e" />
        <Blush x={58} y={-120} />
        <Mouth expr={expr} x={0} y={-114} s={0.9} />
        {costume === 'polar' && <g>{[-1, 1].map((s) => <circle key={s} cx={s * 92} cy={-150} r={24} fill="#f2a7b8" stroke={OL} strokeWidth={LW} />)}<path d="M -92 -170 C -92 -268 92 -268 92 -170" stroke={OL} strokeWidth={14} fill="none" /><path d="M -92 -170 C -92 -268 92 -268 92 -170" stroke="#c8402f" strokeWidth={6} fill="none" /></g>}
        {(costume === 'helmet' || costume === 'grad') && <Hat c={costume} top={-292} w={62} />}
      </g>
    </g>
  );
};

/* ======================== 3 · 页页 Yeye: the notebook page ======================== */
// its dog-eared corner is an ear that flips up when it learns something; its body is a page charts can be drawn on
export const Yeye: React.FC<MP & { chart?: number }> = ({ expr = 'curious', costume = 'none', t = 0, k = 0, sq = 1, tilt = 0, chart = 0 }) => {
  const ear = expr === 'shock' ? 1 : k, ax = lerp(46, 104, ear), ay = lerp(-190, -258, ear);
  const arms = expr === 'shock' ? [[-84, -120, -126, -164], [84, -120, 126, -164]] : expr === 'think' ? [[-84, -100, -112, -70], [84, -104, 40, -92]] : expr === 'happy' ? [[-84, -116, -122, -146], [84, -116, 122, -146]] : [[-84, -104, -112, -72], [84, -104, 112, -72]];
  const sw = Math.sin(t * 4) * 1.5;
  return (
    <g transform={`rotate(${tilt + sw}) scale(${1 / Math.sqrt(sq)} ${sq})`}>
      <defs>
        {cel('yy-p', '#fdfaf1', '#e9e2cd', 0.62)}
        <clipPath id="yy-clip"><path d="M -84 -216 Q -84 -232 -68 -232 L 46 -232 L 86 -192 L 86 -36 Q 86 -20 70 -20 L -68 -20 Q -84 -20 -84 -36 Z" /></clipPath>
      </defs>
      {cap(-32, -24, -34, -4, 10, '#fdfaf1', 'l1')}{cap(32, -24, 34, -4, 10, '#fdfaf1', 'l2')}
      <path d="M -84 -216 Q -84 -232 -68 -232 L 46 -232 L 86 -192 L 86 -36 Q 86 -20 70 -20 L -68 -20 Q -84 -20 -84 -36 Z" fill="url(#yy-p)" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
      <g clipPath="url(#yy-clip)">
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-90} x2={90} y1={-206 + i * 22} y2={-206 + i * 22} stroke="#9cc3e6" strokeWidth={2.5} />)}
        <line x1={-56} x2={-56} y1={-240} y2={-10} stroke="#e58a8a" strokeWidth={3} />
        {chart > 0 && [[-30, 0.45], [6, 0.7], [42, 1]].map(([x, h], i) => {
          const g = Math.max(0, Math.min(1, chart * 3 - i)) * h * 70;
          return <rect key={i} x={x - 12} y={-34 - g} width={24} height={g} fill={i === 2 ? '#e8b33f' : '#7aa7d6'} stroke={OL} strokeWidth={3} />;
        })}
      </g>
      <path d={`M 46 -232 L 86 -192 L ${ax} ${ay} Z`} fill="#e9e2cd" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
      {costume === 'lifejacket' && <Vest y0={-98} y1={-26} w={78} />}
      {arms.map(([a, b, c, e], i) => cap(a, b, c, e, 9, '#fdfaf1', 'arm' + i))}
      <g transform={chart > 0 ? 'translate(0 -40) scale(0.8)' : undefined}>
        <Eyes expr={expr} x={28} y={-148} lid="#fdfaf1" />
        <Blush x={54} y={-118} r={11} />
        <Mouth expr={expr} x={0} y={-116} s={0.9} />
      </g>
      {(costume === 'polar' || costume === 'helmet' || costume === 'grad') && <Hat c={costume} top={-262} w={72} />}
    </g>
  );
};

/* ======================== 4 · 团子 Tuanzi: the round cat ======================== */
// a one-blob cat with a gold scarf; when surprised its pupils go huge and its tail puffs
export const Tuanzi: React.FC<MP> = ({ expr = 'curious', costume = 'none', t = 0, k = 0, sq = 1, tilt = 0 }) => {
  const puff = expr === 'shock' ? 1 : k, earD = expr === 'sad' ? 1 : 0, blink = expr === 'curious' && (t % 3.2) > 3.05;
  const tw = Math.sin(t * 2.4) * 10;
  return (
    <g transform={`rotate(${tilt}) scale(${1 / Math.sqrt(sq)} ${sq})`}>
      <defs>{cel('tz-b', '#9aa6c0', '#7a86a3')}</defs>
      <path d={`M 80 -40 C 150 -40 ${150 + tw} -110 ${118 + tw} -150 C ${100 + tw} -172 ${84 + tw} -150 ${100 + tw} -140`} stroke={OL} strokeWidth={30 + puff * 22} fill="none" strokeLinecap="round" />
      <path d={`M 80 -40 C 150 -40 ${150 + tw} -110 ${118 + tw} -150 C ${100 + tw} -172 ${84 + tw} -150 ${100 + tw} -140`} stroke="#9aa6c0" strokeWidth={20 + puff * 22} fill="none" strokeLinecap="round" />
      {[-1, 1].map((s) => (
        <g key={s} transform={`rotate(${s * earD * 38} ${s * 58} -176)`}>
          <path d={`M ${s * 30} -190 L ${s * 70} -232 L ${s * 88} -160 Z`} fill="#9aa6c0" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
          <path d={`M ${s * 44} -188 L ${s * 68} -214 L ${s * 78} -170 Z`} fill="#f2a7b8" />
        </g>
      ))}
      <path d="M 0 -200 C 80 -200 112 -150 110 -96 C 108 -40 70 -10 0 -10 C -70 -10 -108 -40 -110 -96 C -112 -150 -80 -200 0 -200 Z" fill="url(#tz-b)" stroke={OL} strokeWidth={LW} />
      <ellipse cx={0} cy={-56} rx={60} ry={40} fill="#f3ebdd" />
      {[-1, 1].map((s) => <ellipse key={s} cx={s * 38} cy={-10} rx={24} ry={13} fill="#f3ebdd" stroke={OL} strokeWidth={LW} />)}
      {costume === 'lifejacket' ? <Vest y0={-80} y1={-16} w={84} /> : (
        <g>
          <path d="M -86 -96 Q 0 -70 86 -96 L 84 -76 Q 0 -50 -84 -76 Z" fill="#e8b33f" stroke={OL} strokeWidth={LW} strokeLinejoin="round" />
          <path d="M 40 -78 L 58 -30 L 34 -34 Z" fill="#e8b33f" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
      {blink ? [-36, 36].map((x) => <path key={x} d={`M ${x - 14} -128 Q ${x} -120 ${x + 14} -128`} stroke="#1f1a24" strokeWidth={6} fill="none" strokeLinecap="round" />)
        : <Eyes expr={expr} x={36} y={-130} lid="#9aa6c0" dilate={expr === 'shock' ? 1 : puff * 0.6} />}
      <path d="M -7 -108 L 7 -108 L 0 -100 Z" fill="#e5778a" stroke={OL} strokeWidth={2.5} strokeLinejoin="round" />
      {expr === 'curious' || expr === 'think' ? <path d="M -14 -96 Q -7 -88 0 -96 Q 7 -88 14 -96" stroke={OL} strokeWidth={3.5} fill="none" strokeLinecap="round" /> : <Mouth expr={expr} x={0} y={-90} s={0.75} />}
      {[-1, 1].map((s) => [0, 1, 2].map((i) => <line key={s + '' + i} x1={s * 58} y1={-104 + i * 9} x2={s * (92 + i * 3)} y2={-110 + i * 12} stroke={OL} strokeWidth={2.6} strokeLinecap="round" />))}
      <Blush x={66} y={-96} r={11} />
      {expr === 'think' && cap(70, -60, 30, -84, 14, '#f3ebdd', 'paw')}
      {(costume === 'polar' || costume === 'helmet' || costume === 'grad') && <Hat c={costume} top={-212} w={80} />}
    </g>
  );
};

export const MASCOTS = [
  { id: 'wenwen', C: Wenwen, name: '问问', py: 'Wènwen', bg: '#fbe9c6', ink: '#3a2a1a',
    pitch: '一颗会好奇的豆子。头上的呆毛是问号，身体是问号下面那个点。',
    move: '招牌动作：每到音乐的 drop、答案揭晓那一下，呆毛"啪"地弹直，问号变成感叹号。' },
  { id: 'dengdeng', C: Dengdeng, name: '灯灯', py: 'Dēngdeng', bg: '#1f2340', ink: '#f6e7c8',
    pitch: '一盏会飘的小灯笼。不需要手和腿，火苗就是它的心情。',
    move: '招牌动作：带着观众走进黑暗的历史现场，答案揭晓时火苗一亮，照亮整个画面。' },
  { id: 'yeye', C: Yeye, name: '页页', py: 'Yèye', bg: '#e3eef6', ink: '#23324a',
    pitch: '一张笔记本内页。折起来的那个角是它的耳朵，身上就是画图表的纸。',
    move: '招牌动作：明白了的时候"耳朵"啪地翘起来；需要讲数据时，图表直接画在它身上。' },
  { id: 'tuanzi', C: Tuanzi, name: '团子', py: 'Tuánzi', bg: '#f4e4e4', ink: '#3a2630',
    pitch: '一只圆滚滚的猫，围着金色围巾（Juno 的颜色）。',
    move: '招牌动作：听到反常识的事，瞳孔瞬间放大、尾巴炸毛。' },
];

import React from 'react';
import {b, clamp, lerp, prog} from '../lib';
import {LATIN, SERIF} from '../look';
import {anim, Create, M, TeX} from '../m3';
import {At, Credit, H, Label, morph, pathOf, view, W, World} from './kit';

/* S2 (b39 → b64), one world, the camera pans left to right:
   a big clock whose hands race (three hours gone in a breath, the elapsed arc sweeps yellow)
   → pan to a painter's canvas where a rose paints itself, beside a graph of how absorbed the painter
   is: high while painting, a red drop the moment it is finished, and the canvas is pushed aside. */
const CK = {x: 960, y: 470, r: 300};
export const ClockFace: React.FC<{p: number; m: number; arc?: number; cx?: number; cy?: number; r?: number; handsO?: number}> = ({p, m, arc = 0, cx = CK.x, cy = CK.y, r = CK.r, handsO = 1}) => (
  <g>
    <Create d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`} p={p} color={M.white} w={5} />
    {Array.from({length: 60}, (_, k) => {
      const a = (k / 60) * Math.PI * 2;
      const big = k % 5 === 0;
      const r0 = r - (big ? 34 : 16);
      return <line key={k} x1={cx + Math.sin(a) * r0} y1={cy - Math.cos(a) * r0} x2={cx + Math.sin(a) * (r - 6)} y2={cy - Math.cos(a) * (r - 6)} stroke={M.white} strokeWidth={big ? 5 : 2} opacity={clamp((p - 0.3 - k / 120) * 3)} />;
    })}
    {arc > 0 ? <path d={arcD(cx, cy, r * 0.5, 0, arc)} fill="none" stroke={M.yellow} strokeWidth={r * 0.18} strokeOpacity={0.35} /> : null}
    {p > 0.6 ? (
      <g opacity={clamp((p - 0.6) / 0.4) * handsO}>
        {Array.from({length: 8}, (_, k) => {
          const a = m - (k + 1) * 0.07;
          return <line key={k} x1={cx} y1={cy} x2={cx + Math.sin(a) * (r - 56)} y2={cy - Math.cos(a) * (r - 56)} stroke={M.yellow} strokeWidth={7} strokeLinecap="round" opacity={0.12 * (1 - k / 8)} />;
        })}
        <line x1={cx} y1={cy} x2={cx + Math.sin(m) * (r - 56)} y2={cy - Math.cos(m) * (r - 56)} stroke={M.yellow} strokeWidth={7} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={cx + Math.sin(m / 12) * (r - 130)} y2={cy - Math.cos(m / 12) * (r - 130)} stroke={M.white} strokeWidth={11} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={12} fill={M.white} />
      </g>
    ) : null}
  </g>
);
const arcD = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const n = 64;
  return pathOf(Array.from({length: n + 1}, (_, k) => {
    const a = a0 + ((a1 - a0) * k) / n;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
  }));
};
/** minute-hand angle for S2: three turns of the hour hand's worth (3 h) in ~3.5 s, easing in and out */
const minuteS2 = (T: number) => anim(T, b(41), b(46) - b(41)) * Math.PI * 2 * 3 + Math.PI * 2 * 0.1;

const rose = (cx: number, cy: number, R: number, upto: number) => {
  const n = Math.max(2, Math.floor(400 * upto));
  return pathOf(Array.from({length: n + 1}, (_, k) => {
    const th = (k / 400) * Math.PI * 2;
    const r = R * Math.cos(4 * th);
    return [cx + r * Math.cos(th), cy + r * Math.sin(th)];
  }));
};
const absorb = (u: number, done: number) => (u < done ? Math.min(1, 0.15 + u * 3) * (0.92 + 0.06 * Math.sin(u * 40)) : 0.12 + 0.8 * Math.exp(-(u - done) * 30));
const OX = 1920; // the painter set sits one screen to the right

export const S2: React.FC<{T: number}> = ({T}) => {
  if (T < b(38.8) || T > b(64.4)) return null;
  const o = clamp(prog(T, b(38.8), b(39.6))) * (1 - prog(T, b(63.6), b(64.3)));
  const v = view(T, [
    [b(39), {x: 960, y: 520, z: 1.12}],
    [b(46), {x: 960, y: 500, z: 1}],
    [b(48.5), {x: OX + 960, y: 520, z: 1}],
    [b(56), {x: OX + 960, y: 520, z: 1}],
    [b(60), {x: OX + 1060, y: 520, z: 1.08}],
  ]);
  const ring = anim(T, b(39.2), 1.4);
  const hours = anim(T, b(41), b(46) - b(41));
  // painter
  const frame = anim(T, b(47), 1);
  const paint = clamp((T - b(48)) / (b(55.5) - b(48)));
  const aside = anim(T, b(56.5), 1.2);
  const gx0 = OX + 1060;
  const gx1 = OX + 1760;
  const gy0 = 720;
  const gh = 440;
  const u = clamp((T - b(48)) / (b(62) - b(48)));
  const done = (b(55.5) - b(48)) / (b(62) - b(48));
  const pts = Array.from({length: Math.max(2, Math.floor(u * 200))}, (_, k) => {
    const uu = k / 200;
    return [gx0 + uu * (gx1 - gx0), gy0 - absorb(uu, done) * gh];
  });
  const dx = gx0 + done * (gx1 - gx0);
  const before = pts.filter(([x]) => x <= dx);
  const after = pts.filter(([x]) => x >= dx - 3);
  const head = pts[pts.length - 1];
  const gax = anim(T, b(47.5), 1.2);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <ClockFace p={ring} m={minuteS2(T)} arc={hours * Math.PI * 2 * 0.25} />
          <g transform={`translate(${-aside * 240},${aside * 70}) rotate(${-aside * 9} ${OX + 520} 470)`} opacity={1 - 0.7 * aside}>
            <Create d={`M ${OX + 240} 210 L ${OX + 800} 210 L ${OX + 800} 730 L ${OX + 240} 730 Z`} p={frame} color={M.white} w={5} />
            {paint > 0 ? <path d={rose(OX + 520, 470, 230, paint)} fill="none" stroke={M.teal} strokeWidth={5} strokeLinecap="round" /> : null}
            {paint > 0.3 ? <path d={rose(OX + 520, 470, 140, clamp((paint - 0.3) / 0.7))} fill="none" stroke={M.gold} strokeWidth={4} strokeLinecap="round" /> : null}
          </g>
          <Create d={`M ${gx0} ${gy0} L ${gx1 + 40} ${gy0}`} p={gax} color={M.white} w={4} />
          <Create d={`M ${gx0} ${gy0} L ${gx0} ${gy0 - gh - 40}`} p={gax} color={M.white} w={4} />
          {before.length > 1 ? <path d={pathOf(before)} fill="none" stroke={M.yellow} strokeWidth={6} strokeLinejoin="round" /> : null}
          {after.length > 1 ? <path d={pathOf(after)} fill="none" stroke={M.red} strokeWidth={6} strokeLinejoin="round" /> : null}
          {head && u > 0 && u < 1 ? <circle cx={head[0]} cy={head[1]} r={11} fill={after.length > 1 ? M.red : M.yellow} /> : null}
          {u > done ? <line x1={dx} y1={gy0} x2={dx} y2={gy0 - gh} stroke={M.greyB} strokeWidth={2.5} strokeDasharray="8 10" /> : null}
        </svg>
        <At x={CK.x} y={CK.y + CK.r + 60} o={anim(T, b(43), 0.8) * (1 - prog(T, b(47), b(48)))}>
          <TeX tex={`+\\,${Math.round(hours * 3 * 10) / 10 === 3 ? '3' : (hours * 3).toFixed(1)}\\ \\text{h}`} size={56} color={M.yellow} />
        </At>
        <At x={gx1 + 50} y={gy0} o={anim(T, b(48), 0.8)} anchor="l">
          <Label size={36}>时间</Label>
        </At>
        <At x={gx0 + 20} y={gy0 - gh - 50} o={anim(T, b(48), 0.8)} anchor="l">
          <Label size={38} c={M.yellow}>投入程度</Label>
        </At>
        <At x={dx} y={gy0 + 40} o={anim(T, b(56), 0.8)}>
          <Label size={32} c={M.greyB}>画完了</Label>
        </At>
      </World>
      <Credit o={anim(T, b(48), 0.8) * (1 - prog(T, b(63), b(64)))}>Csikszentmihalyi 对艺术学生的研究，1960 年代 · 示意</Credit>
    </div>
  );
};

/* S3 (b64 → b96): four people absorbed, four traces in four panels (climbing, chess, dance, surgery),
   then the panels dissolve and the four traces transform (same points, Manim's Transform) into four
   streamlines of one current, more streamlines join and flow, then they gather into the name. */
const PANELS: [number, number, string, string][] = [
  [120, 120, '攀岩', M.teal],
  [980, 120, '下棋', M.blue],
  [120, 500, '跳舞', M.purple],
  [980, 500, '外科手术', M.green],
];
const PW = 820;
const PH = 340;
const N = 120;
const local = (i: number): number[][] => {
  if (i === 0) return Array.from({length: N}, (_, k) => {
    const u = k / (N - 1);
    return [70 + u * 680, 300 - u * 250 + 28 * Math.sin(u * 37) * (1 - u * 0.3)];
  });
  if (i === 1) {
    const kn = [[0, 0], [1, 2], [3, 3], [5, 2], [7, 3], [9, 2], [10, 0], [8, 1], [6, 0], [4, 1]];
    return Array.from({length: N}, (_, k) => {
      const f = (k / (N - 1)) * (kn.length - 1);
      const j = Math.min(kn.length - 2, Math.floor(f));
      const s = f - j;
      return [80 + 66 * lerp(kn[j][0], kn[j + 1][0], s), 60 + 72 * lerp(kn[j][1], kn[j + 1][1], s)];
    });
  }
  if (i === 2) return Array.from({length: N}, (_, k) => {
    const a = (k / (N - 1)) * Math.PI * 2;
    return [410 + 300 * Math.sin(a), 175 + 115 * Math.sin(2 * a)];
  });
  return Array.from({length: N}, (_, k) => {
    const u = k / (N - 1);
    return [70 + u * 680, 175 + (k % 2 ? 70 : -70) * (0.6 + 0.4 * Math.sin(u * 6))];
  });
};
const TRACE = PANELS.map(([x, y], i) => local(i).map(([a, c]) => [x + a, y + c]));
const stream = (i: number, phase: number, n = N) =>
  Array.from({length: n}, (_, k) => {
    const u = k / (n - 1);
    return [60 + u * 1800, 470 + (i - 3.5) * 34 + 110 * Math.sin(u * Math.PI * 2.2 + phase - i * 0.18) * Math.sin(u * Math.PI)];
  });
const STREAM_OF = [2, 3, 4, 5]; // the four traces become the middle four streamlines

export const S3: React.FC<{T: number}> = ({T}) => {
  if (T < b(63.8) || T > b(96.4)) return null;
  const o = clamp(prog(T, b(63.8), b(64.6))) * (1 - prog(T, b(95.6), b(96.3)));
  const v = view(T, [
    [b(64), {x: 960, y: 520, z: 1.04}],
    [b(72), {x: 960, y: 520, z: 0.98}],
    [b(80), {x: 960, y: 500, z: 1}],
    [b(88), {x: 960, y: 480, z: 1.08}],
  ]);
  const boxes = 1 - prog(T, b(72), b(73.5));
  const merge = anim(T, b(73), b(78) - b(73));
  const phase = Math.max(0, T - b(76)) * 2.2;
  const extra = anim(T, b(80), 1.6);
  const gather = anim(T, b(88), 1.6);
  const name = anim(T, b(88.6), 1.3);
  const draw = (i: number) => anim(T, b(64.3) + i * 0.35, b(71) - b(64.3) - 1);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {PANELS.map(([x, y, , c], i) => (
            <g key={i} opacity={boxes}>
              <Create d={`M ${x} ${y} L ${x + PW} ${y} L ${x + PW} ${y + PH} L ${x} ${y + PH} Z`} p={anim(T, b(64) + i * 0.15, 0.9)} color={M.greyB} w={2.5} />
              {i === 1
                ? Array.from({length: 11}, (_, a) => Array.from({length: 5}, (_, bb) => ((a + bb) % 2 ? <rect key={`${a}-${bb}`} x={x + 47 + a * 66} y={y + 24 + bb * 72} width={66} height={72} fill={c} opacity={0.06} /> : null)))
                : null}
            </g>
          ))}
          {/* four traces → four streamlines */}
          {TRACE.map((tr, i) => {
            const target = stream(STREAM_OF[i], phase);
            const pts = morph(tr, target, merge);
            const d = draw(i);
            const shown = merge > 0 ? pts : pts.slice(0, Math.max(2, Math.floor(d * N)));
            const head = shown[shown.length - 1];
            return (
              <g key={i} opacity={1 - gather}>
                <path d={pathOf(shown)} fill="none" stroke={PANELS[i][3]} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                {merge === 0 && d > 0 && d < 1 ? <circle cx={head[0]} cy={head[1]} r={10} fill={PANELS[i][3]} /> : null}
              </g>
            );
          })}
          {/* more streamlines join the current */}
          {[0, 1, 6, 7].map((k, j) => (
            <path key={k} d={pathOf(stream(k, phase))} fill="none" stroke={[M.blueD, M.teal, M.blue, M.purple][j]} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - extra} opacity={0.8 * (1 - gather)} />
          ))}
          {/* gather: all streamlines collapse onto one yellow wave through the centre */}
          {gather > 0 ? <path d={pathOf(stream(3.5, phase).map(([x, y]) => [x, lerp(470, y, 0.6)]))} fill="none" stroke={M.yellow} strokeWidth={6} strokeLinecap="round" opacity={gather} /> : null}
        </svg>
        {PANELS.map(([x, y, label, c], i) => (
          <At key={i} x={x + 22} y={y + 34} o={anim(T, b(64.4) + i * 0.3, 0.6) * boxes} anchor="l">
            <Label c={c} size={36} w={700}>{label}</Label>
          </At>
        ))}
        <At x={960} y={260} o={name}>
          <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 150, color: M.white, letterSpacing: '0.12em'}}>心流</span>
        </At>
        <At x={960} y={660} o={anim(T, b(89.5), 1)}>
          <TeX tex="\textit{flow}" size={88} color={M.yellow} />
        </At>
      </World>
      <Credit o={anim(T, b(90), 0.8)}>
        <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 20}}>Beyond Boredom and Anxiety</span> · Csikszentmihalyi, 1975
      </Credit>
    </div>
  );
};

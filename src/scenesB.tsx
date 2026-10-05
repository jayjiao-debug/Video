import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { L, at, CH, SANS, MONO, ZH, INK, DIM, FAINT, RED, CYAN, GOLD, prog, easeOut, easeIn, easeInOut, lerp, clamp, rnd, pop } from './lib';

/* 04 free fall (Stetson, Fiesta & Eagleman 2007), 05 the memory clock, 06 routine (Avni-Babad & Ritov 2003). */

// ------------------------------------------------------------------ 04 free fall
const TX = 470, TY0 = 300, TY1 = 860; // the 31 m tower, top to net
const mY = (m: number) => TY0 + (m / 31) * (TY1 - TY0);
const BARS: [string, number, string][] = [['看别人跳', 2.17, DIM], ['真实时长', 2.49, INK], ['回忆自己那一跳', 2.96, RED]];

export const Fall: React.FC<{ T: number }> = ({ T }) => {
  const frame = useCurrentFrame();
  const c = CH('fall'); if (T < c.a || T >= c.z) return null;
  const f1 = L('f1'), f2 = L('f2'), f3 = L('f3'), f4 = L('f4'), f5 = L('f5');
  const t0 = at('f1', '背朝下') + 0.1; // the drop starts on "背朝下自由落体"
  const ft = clamp(T - t0, 0, 2.49);
  const depth = 0.5 * (62 / 6.2001) * ft * ft; // 31 m in 2.49 s (a ≈ 10 m/s²)
  const towerO = easeOut(prog(T, c.a + 0.1, c.a + 0.8));
  const timerO = easeOut(prog(T, t0 - 0.4, t0));
  const landed = T >= t0 + 2.49;
  const real = easeOut(prog(T, f2.a, f2.a + 0.3));
  const bars = (k: number) => easeOut(prog(T, f3.a + 0.4 + k * 0.5, f3.a + 1.2 + k * 0.5));
  const plus = pop(T, at('f3', '百分之'));
  const chrono = easeOut(prog(T, f4.a, f4.a + 0.4));
  const cross = easeOut(prog(T, at('f4', '数字'), at('f4', '数字') + 0.3));
  const fin = easeInOut(prog(T, f5.a, f5.a + 0.6));
  const PX = 860, PW = 860, SCALE = PW / 3.0;
  const trail = Array.from({ length: 10 }, (_, k) => {
    const tt = clamp(ft - k * 0.05, 0, 2.49); return 0.5 * 10 * tt * tt;
  });
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* tower */}
        <g opacity={towerO * (1 - 0.65 * fin)}>
          <line x1={TX} x2={TX} y1={TY0} y2={TY1} stroke="rgba(236,232,223,0.3)" strokeWidth={2} />
          {[0, 5, 10, 15, 20, 25, 31].map((m) => (
            <g key={m}>
              <line x1={TX - 12} x2={TX} y1={mY(m)} y2={mY(m)} stroke={DIM} strokeWidth={1.5} />
              <text x={TX - 22} y={mY(m) + 6} textAnchor="end" style={{ fontFamily: MONO, fontSize: 18, fill: DIM }}>{m === 31 ? '31 m' : `${m}`}</text>
            </g>
          ))}
          <path d={`M ${TX + 20} ${TY1 + 6} Q ${TX + 90} ${TY1 + 34 + (landed ? 10 * Math.exp(-(T - t0 - 2.49) * 4) * Math.sin((T - t0 - 2.49) * 20) : 0)} ${TX + 160} ${TY1 + 6}`} stroke={CYAN} strokeWidth={2} fill="none" />
          <text x={TX + 180} y={TY1 + 18} style={{ fontFamily: SANS, fontSize: 20, fill: DIM }}>安全网</text>
          {trail.map((d, k) => k > 0 && ft > 0 && <circle key={k} cx={TX + 90} cy={mY(d)} r={13 - k} fill={RED} opacity={0.18 * (1 - k / 10)} />)}
          <circle cx={TX + 90} cy={mY(depth)} r={14} fill={INK} style={{ filter: 'drop-shadow(0 0 10px rgba(236,232,223,0.6))' }} />
        </g>
        {/* timer */}
        {timerO > 0 && (
          <g opacity={timerO * (1 - fin) * (1 - chrono)}>
            <text x={PX} y={330} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 150, fill: landed && real > 0 ? RED : INK }}>{ft.toFixed(2)}<tspan fontSize={60}> s</tspan></text>
            <text x={PX} y={385} opacity={real} style={{ fontFamily: SANS, fontSize: 28, fill: DIM }}>真实的下落时间</text>
          </g>
        )}
        {/* recalled durations */}
        <g opacity={1 - 0.75 * Math.max(chrono, 0) * (1 - fin) - fin}>
          {BARS.map(([name, v, col], k) => {
            const b = bars(k); if (b <= 0) return null;
            const y = 480 + k * 92;
            return (
              <g key={name}>
                <text x={PX} y={y - 12} style={{ fontFamily: SANS, fontSize: 24, fill: col === DIM ? DIM : INK }}>{name}</text>
                <rect x={PX} y={y} width={v * SCALE * b} height={30} rx={4} fill={col} opacity={col === DIM ? 0.55 : 0.9} />
                <text x={PX + v * SCALE * b + 14} y={y + 26} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, fill: col }}>{(v * b).toFixed(2)} s</text>
              </g>
            );
          })}
          {plus > 0 && <text x={PX + 2.96 * SCALE - 10} y={480 + 2 * 92 - 22} textAnchor="end" opacity={Math.min(1, plus)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, fill: RED }}>+36%</text>}
        </g>
        {/* the perceptual chronometer: digits alternating with their negative, too fast to read */}
        {chrono > 0 && fin < 1 && (
          <g opacity={chrono * (1 - fin)} transform={`translate(${PX + 60} 190)`}>
            <rect x={0} y={0} width={300} height={190} rx={18} fill="#14161b" stroke="rgba(236,232,223,0.4)" strokeWidth={2} />
            <text x={150} y={150} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 150, fill: frame % 2 ? '#cfc9be' : '#5d6068' }}>{frame % 2 ? String(Math.floor(rnd(frame, 3) * 10)) : '8'}</text>
            <text x={150} y={232} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 22, fill: DIM }}>绑在手腕上的闪烁数字屏</text>
            {cross > 0 && (
              <g opacity={cross}>
                <line x1={-20} y1={-20} x2={320} y2={210} stroke={RED} strokeWidth={6} />
                <text x={350} y={110} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 56, fill: RED }}>没看清</text>
                <text x={350} y={150} style={{ fontFamily: MONO, fontSize: 20, fill: DIM }}>和站在地上时一样（p = 0.86）</text>
              </g>
            )}
          </g>
        )}
        {/* conclusion: the same 2.49 s, sparse vs dense memory */}
        {fin > 0 && (
          <g opacity={fin}>
            <text x={960} y={300} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: INK }}>时间没有变慢</text>
            <text x={960} y={380} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: CYAN }}>是记忆变密了</text>
            {[0, 1].map((row) => {
              const y = 560 + row * 170, n = row ? 34 : 9, len = row ? 860 : 620;
              const grow = easeOut(prog(T, f5.a + 0.6 + row * 0.3, f5.a + 1.6 + row * 0.3));
              return (
                <g key={row}>
                  <text x={530} y={y - 24} style={{ fontFamily: SANS, fontSize: 28, fill: row ? CYAN : DIM }}>{row ? '自己跳：记下的瞬间多' : '看别人：记下的瞬间少'}</text>
                  <line x1={530} x2={530 + len * grow} y1={y} y2={y} stroke={row ? CYAN : DIM} strokeWidth={3} />
                  {Array.from({ length: n }, (_, k) => k / n < grow && <circle key={k} cx={530 + (k + 0.5) * (len / n)} cy={y} r={row ? 7 : 6} fill={row ? CYAN : DIM} opacity={0.9} />)}
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 05 the memory clock
export const Memory: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('memory'); if (T < c.a || T >= c.z) return null;
  const m1 = L('m1'), m2 = L('m2');
  const clockO = easeOut(prog(T, c.a + 0.1, c.a + 0.6));
  const detach = easeInOut(prog(T, at('m1', '它是') - 0.1, at('m1', '它是') + 1.0));
  const rows = easeOut(prog(T, m2.a + 0.1, m2.a + 0.8));
  const stretch = easeInOut(prog(T, at('m2', '回想') - 0.1, at('m2', '回想') + 1.0));
  const CXc = 960, CYc = 520, R = 240;
  const hand = (T - c.a) * 1.6;
  const COLS = [CYAN, GOLD, RED, '#9b8cff', '#7fe08a', '#ff9bd2'];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={clockO * (1 - rows)}>
          <circle cx={CXc} cy={CYc} r={R} fill="none" stroke="rgba(236,232,223,0.3)" strokeWidth={2} opacity={1 - detach} />
          <line x1={CXc} y1={CYc} x2={CXc + Math.sin(hand) * R * 0.85} y2={CYc - Math.cos(hand) * R * 0.85} stroke={RED} strokeWidth={3} opacity={1 - detach} />
          <circle cx={CXc} cy={CYc} r={6} fill={RED} />
          {Array.from({ length: 24 }, (_, k) => {
            const a = (k / 24) * Math.PI * 2;
            const x0 = CXc + Math.sin(a) * R, y0 = CYc - Math.cos(a) * R;
            const x1 = 330 + k * 55, y1 = CYc + (rnd(k, 2) - 0.5) * 14;
            const d = clamp(detach * 1.4 - k * 0.016);
            const memoCol = COLS[k % COLS.length];
            return <circle key={k} cx={lerp(x0, x1, d)} cy={lerp(y0, y1, d)} r={lerp(4, 9, d)} fill={d > 0.5 ? memoCol : INK} opacity={0.85} />;
          })}
          {detach > 0.6 && <text x={960} y={CYc - 70} textAnchor="middle" opacity={prog(detach, 0.6, 1)} style={{ fontFamily: SANS, fontSize: 36, fill: INK }}>大脑数的不是秒，是记住的事</text>}
        </g>
        {rows > 0 && [0, 1].map((r) => {
          const y = 430 + r * 270;
          const varied = r === 0, n = varied ? 14 : 4;
          const real = 560, felt = varied ? lerp(560, 1150, stretch) : lerp(560, 300, stretch);
          return (
            <g key={r} opacity={rows}>
              <text x={300} y={y - 80} style={{ fontFamily: SANS, fontSize: 32, fill: INK }}>{varied ? '同样一小时：发生了很多不一样的小事' : '同样一小时：都差不多'}</text>
              {Array.from({ length: n }, (_, k) => {
                const x = 300 + (k + 0.5) * (real / n);
                return varied
                  ? <rect key={k} x={x - 9} y={y - 40 + (rnd(k, 4) - 0.5) * 16} width={24} height={24} rx={k % 3 === 0 ? 12 : 4} fill={COLS[k % COLS.length]} opacity={0.9} transform={`rotate(${rnd(k, 5) * 40} ${x} ${y - 31})`} />
                  : <circle key={k} cx={x} cy={y - 31} r={12} fill="#5a5d66" />;
              })}
              <line x1={300} x2={300 + real} y1={y} y2={y} stroke="rgba(236,232,223,0.35)" strokeWidth={2} strokeDasharray="6 6" />
              <rect x={300} y={y + 18} width={felt} height={36} rx={5} fill={varied ? CYAN : '#5a5d66'} opacity={0.85} />
              <text x={300 + felt + 16} y={y + 46} style={{ fontFamily: SANS, fontSize: 28, fill: varied ? CYAN : DIM }}>回想起来的长度</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 06 routine
const Icon: React.FC<{ kind: number; x: number; y: number; s?: number; o?: number }> = ({ kind, x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {kind === 0 && <g><rect x={-22} y={-14} width={44} height={24} rx={6} fill="none" stroke={INK} strokeWidth={2} /><circle cx={-12} cy={14} r={4} fill={INK} /><circle cx={12} cy={14} r={4} fill={INK} /><line x1={-22} x2={22} y1={-3} y2={-3} stroke={INK} strokeWidth={1.5} /></g>}
    {kind === 1 && <g><rect x={-20} y={-18} width={40} height={26} rx={3} fill="none" stroke={INK} strokeWidth={2} /><line x1={-26} x2={26} y1={16} y2={16} stroke={INK} strokeWidth={2} /><line x1={0} x2={0} y1={8} y2={16} stroke={INK} strokeWidth={2} /></g>}
    {kind === 2 && <g><path d="M -22 -4 L 22 -4 Q 20 18 0 18 Q -20 18 -22 -4 Z" fill="none" stroke={INK} strokeWidth={2} /><line x1={-6} y1={-18} x2={14} y2={-6} stroke={INK} strokeWidth={2} /></g>}
  </g>
);

export const Routine: React.FC<{ T: number }> = ({ T }) => {
  const frame = useCurrentFrame();
  const c = CH('routine'); if (T < c.a || T >= c.z) return null;
  const u2 = L('u2'), u3 = L('u3'), u4 = L('u4');
  const panels = easeOut(prog(T, c.a + 0.3, c.a + 1.0)) * (1 - easeInOut(prog(T, u4.a - 0.1, u4.a + 0.4)));
  const run = T >= u2.a ? Math.min(Math.floor((T - u2.a) / 0.22), 22) : -1;
  const bars = (k: number) => easeOut(prog(T, u3.a + 0.4 + k * 0.4, u3.a + 1.3 + k * 0.4));
  const minus = pop(T, at('u3', '短了'));
  const week = easeOut(prog(T, u4.a + 0.1, u4.a + 0.7));
  const merge = easeInOut(prog(T, at('u4', '一周像') - 0.1, at('u4', '一周像') + 0.9));
  const month = easeInOut(prog(T, at('u4', '一个月') - 0.1, at('u4', '一个月') + 0.7));
  const DIGS = [3, 8, 1, 6, 2, 9, 4, 7, 0, 5, 2, 8, 6, 1, 9, 3, 7, 4, 0, 6, 2, 5, 8];
  const DAYS = ['一', '二', '三', '四', '五', '六', '日'];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {panels > 0 && (
          <g opacity={panels}>
            {[0, 1].map((p) => {
              const x = 260 + p * 720;
              return (
                <g key={p}>
                  <rect x={x} y={310} width={660} height={190} rx={14} fill="rgba(236,232,223,0.03)" stroke="rgba(236,232,223,0.22)" />
                  <text x={x + 24} y={350} style={{ fontFamily: SANS, fontSize: 24, fill: p ? INK : DIM }}>{p ? 'B 组：数不同的数字' : 'A 组：一直数同一个数字'}</text>
                  {run >= 0 && Array.from({ length: Math.min(run + 1, 13) }, (_, k) => {
                    const idx = Math.max(0, run - 12) + k;
                    return <text key={k} x={x + 40 + k * 48} y={450} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, fill: p ? (k === Math.min(run, 12) ? GOLD : INK) : (k === Math.min(run, 12) ? INK : DIM) }} opacity={0.35 + 0.65 * (k / 12)}>{p ? DIGS[idx % DIGS.length] : 5}</text>;
                  })}
                </g>
              );
            })}
            <text x={960} y={280} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: DIM }}>同样时长 · 真实计时 {run >= 0 ? (Math.min(T - u2.a, 5)).toFixed(1) : '0.0'} s</text>
            {[['A 组回想', 128.89, DIM], ['B 组回想', 168.1, CYAN]].map(([name, v, col], k) => {
              const b = bars(k); if (b <= 0) return null;
              const y = 600 + k * 90;
              return (
                <g key={k}>
                  <text x={260} y={y - 12} style={{ fontFamily: SANS, fontSize: 24, fill: INK }}>{name as string}</text>
                  <rect x={260} y={y} width={(v as number) * 7.2 * b} height={30} rx={4} fill={col as string} opacity={0.85} />
                  <text x={260 + (v as number) * 7.2 * b + 14} y={y + 26} style={{ fontFamily: MONO, fontSize: 24, fill: col as string }}>{((v as number) * b).toFixed(0)} mm</text>
                </g>
              );
            })}
            {minus > 0 && <text x={1640} y={640} textAnchor="end" opacity={Math.min(1, minus)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 96, fill: RED }}>−23%</text>}
            {minus > 0 && <text x={1640} y={680} textAnchor="end" opacity={Math.min(1, minus)} style={{ fontFamily: SANS, fontSize: 19, fill: DIM }}>在一条线上标出“感觉有多长”（研究 2，N = 38）</text>}
          </g>
        )}
        {week > 0 && (
          <g opacity={week}>
            {Array.from({ length: 4 }, (_, w) => {
              if (w > 0 && month <= 0) return null;
              return DAYS.map((d, k) => {
                const x0 = 330 + k * 210, x = lerp(x0, 760, merge), yb = 330 + w * 0;
                const wy = w === 0 ? 0 : lerp(-260 - w * 40, 0, month);
                const o = (w === 0 ? 1 : month) * (merge > 0.95 && k > 0 ? 0 : 1);
                return (
                  <g key={`${w}-${k}`} opacity={o} transform={`translate(${x - x0} ${wy})`}>
                    {w === 0 && <text x={x0} y={yb} textAnchor="middle" opacity={1 - merge} style={{ fontFamily: SANS, fontSize: 30, fill: DIM }}>周{d}</text>}
                    <Icon kind={0} x={x0} y={yb + 90} s={1.6} />
                    <Icon kind={1} x={x0} y={yb + 200} s={1.6} />
                    <Icon kind={2} x={x0} y={yb + 310} s={1.6} />
                  </g>
                );
              });
            })}
            {merge > 0.6 && <text x={940} y={560} opacity={prog(merge, 0.6, 1)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 80, fill: INK }}>{month > 0.5 ? '一个月 ≈ 一周' : '一周 ≈ 一天'}</text>}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
export { easeIn, FAINT };

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, ZH, SANS, MONO, INK, DIM, FAINT, RED, BLUE, GOLD, prog, easeOut, easeIn, easeInOut, lerp, clamp, rnd, pop, hit, fmt, mulberry } from './lib';
import { stageStyle } from './camera';
import { TitleLockup } from './logo';

/* Stages 1–3: the hook (the theory, the pair, "P(重逢) = 0"), the title on the drop, "宇宙 ✕ / 数学", and the model:
   a meeting chance that falls 20 % a year → the expected number of meetings left is 1/(1−0.8) = 5; simulated lives;
   "never again after year 10" ≈ 58 %. */

const Stage: React.FC<{ style: React.CSSProperties | null; children: React.ReactNode }> = ({ style, children }) =>
  style ? <AbsoluteFill style={style}><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg></AbsoluteFill> : null;

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

// ------------------------------------------------------------------ hook + title
const pairAt = (T: number) => {
  const sep = easeIn(prog(T, 5.6, 7.6));
  const r = lerp(105, 1400, sep);
  const ang = T * 2.6 + sep * 0.6;
  const cx = 960, cy = 590;
  return { a: [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.42], b: [cx - Math.cos(ang) * r, cy - Math.sin(ang) * r * 0.42], sep };
};

export const Hook: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, 0, CUT.intro, [-30, 0]);
  if (!st) return null;
  const title = CUT.title;
  const word = 'LAST MEETING THEORY';
  const dimForTitle = 1 - 0.93 * easeInOut(prog(T, title - 0.25, title + 0.2));
  const likes = 72.6 * easeOut(prog(T, 1.1, 2.3));
  const ring = easeInOut(prog(T, 2.8, 5.2));
  const ringBreak = prog(T, 5.25, 5.7);
  const p = pairAt(T);
  const trail = (k: 'a' | 'b', col: string) => Array.from({ length: 16 }, (_, i) => {
    const q = pairAt(T - i * 0.025)[k];
    return <circle key={i} cx={q[0]} cy={q[1]} r={19 - i * 0.9} fill={col} opacity={0.32 * (1 - i / 16)} />;
  });
  const zeroO = easeOut(prog(T, 6.1, 6.4));
  const glitch = T > 6.1 && T < 6.6 ? Math.round(Math.sin(T * 140) * 3) : 0;
  return (
    <Stage style={st}>
      <g opacity={dimForTitle}>
        {/* the title of the theory, letter by letter on the beat */}
        <text x={960} y={250} textAnchor="middle" style={{ ...BLACK, fontSize: 104, letterSpacing: '0.06em', fill: INK }}>
          {[...word].map((ch, i) => {
            const a = 0.05 + i * 0.055, k = easeOut(prog(T, a, a + 0.18));
            return <tspan key={i} opacity={k} dy={i === 0 ? 0 : 0}>{ch}</tspan>;
          })}
        </text>
        <text x={960} y={322} textAnchor="middle" opacity={easeOut(prog(T, 1.1, 1.4))} style={{ fontFamily: MONO, fontSize: 36, fill: DIM }}>
          <tspan fill={RED} fontWeight={700}>{likes.toFixed(1)}万</tspan> 人点赞
        </text>
        {/* the pair */}
        {trail('a', INK)}{trail('b', RED)}
        <circle cx={p.a[0]} cy={p.a[1]} r={22} fill={INK} style={{ filter: 'drop-shadow(0 0 14px rgba(242,240,234,0.8))' }} />
        <circle cx={p.b[0]} cy={p.b[1]} r={22} fill={RED} style={{ filter: 'drop-shadow(0 0 14px rgba(255,61,46,0.9))' }} />
        {p.sep < 0.15 && <>
          <text x={p.a[0]} y={p.a[1] - 38} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 32, fill: INK }}>你</text>
          <text x={p.b[0]} y={p.b[1] - 38} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 32, fill: RED }}>TA</text>
        </>}
        {p.sep > 0.02 && <line x1={p.a[0]} y1={p.a[1]} x2={p.b[0]} y2={p.b[1]} stroke="rgba(242,240,234,0.35)" strokeWidth={2} strokeDasharray="10 10" strokeDashoffset={-T * 120} />}
        {/* "课题完成度" ring */}
        {ring > 0 && ringBreak < 1 && (
          <g opacity={1 - ringBreak}>
            <circle cx={960} cy={590} r={210 + 60 * ringBreak} fill="none" stroke={FAINT} strokeWidth={8} />
            <circle cx={960} cy={590} r={210 + 60 * ringBreak} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${2 * Math.PI * 210 * ring} 9999`} transform="rotate(-90 960 590)" style={{ filter: 'drop-shadow(0 0 10px rgba(255,61,46,0.7))' }} />
            <text x={960 + 290} y={600} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 72, fill: INK }}>{Math.round(ring * 100)}%</text>
            <text x={960 + 292} y={644} style={{ fontFamily: SANS, fontSize: 30, fill: DIM }}>课题完成度</text>
          </g>
        )}
        {zeroO > 0 && (
          <g opacity={zeroO} transform={`translate(${glitch} 0)`}>
            <text x={960} y={860} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 96, fill: INK }}>P(重逢) = <tspan fill={RED}>0</tspan></text>
          </g>
        )}
      </g>
      {/* the title, stamped on the drop (the film's own lockup: the "一" is the line between you and TA) */}
      {T > title - 0.05 && <g transform={`translate(${Math.sin(T * 90) * 5 * hit(T, title, 0.12)} 0)`}><TitleLockup T={T} at={title} size={200} cy={620} /></g>}
    </Stage>
  );
};

// ------------------------------------------------------------------ intro: 宇宙 ✕ → 数学
const GLYPHS = ['Σ', '∞', 'p', 'E[N]', '0.8ⁿ', '∏', 'r', '1/(1−r)', 'P', 'k', 'λ', '√', '%', 'n', '∫'];
export const INTRO_Q: [number, number] = [1102, 470];

export const Intro: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.intro, CUT.model, [0, -20], INTRO_Q);
  if (!st) return null;
  const a = CUT.intro;
  const cross = easeOut(prog(T, 11.1, 11.35));
  const out1 = easeInOut(prog(T, 12.1, 12.5));
  const mathO = easeOut(prog(T, 12.4, 12.8));
  const gather = easeInOut(prog(T, 13.3, 14.4));
  const eq = easeOut(prog(T, 14.0, 14.35));
  return (
    <Stage style={st}>
      {/* a slowly turning galaxy behind "宇宙" */}
      <g opacity={1 - out1}>
        {Array.from({ length: 220 }, (_, i) => {
          const r = 40 + rnd(i, 1) * 520, th = rnd(i, 2) * Math.PI * 2 + (T - a) * (0.9 - r / 900) + r / 120;
          return <circle key={i} cx={960 + Math.cos(th) * r} cy={520 + Math.sin(th) * r * 0.45} r={1 + rnd(i, 3) * 2.2} fill={INK} opacity={0.2 + 0.5 * rnd(i, 4)} />;
        })}
        <text x={960} y={560} textAnchor="middle" style={{ ...BLACK, fontSize: 180, fill: INK, letterSpacing: '0.1em' }} opacity={easeOut(prog(T, a, a + 0.3))}>宇宙安排</text>
        {cross > 0 && <line x1={560} y1={600} x2={560 + 800 * cross} y2={430} stroke={RED} strokeWidth={14} strokeLinecap="round" />}
      </g>
      {mathO > 0 && (
        <g opacity={mathO}>
          {Array.from({ length: 60 }, (_, i) => {
            const g = GLYPHS[i % GLYPHS.length];
            const x0 = rnd(i, 5) * 1920, fall = ((T - 12.4) * (260 + rnd(i, 6) * 500) + rnd(i, 7) * 1200) % 1300 - 150;
            const x = lerp(x0, 960 + (rnd(i, 8) - 0.5) * 120, gather), y = lerp(fall, 470 + (rnd(i, 9) - 0.5) * 60, gather);
            return <text key={i} x={x} y={y} textAnchor="middle" opacity={(1 - gather) * (0.25 + 0.5 * rnd(i, 10))} style={{ fontFamily: MONO, fontSize: 24 + rnd(i, 11) * 40, fill: i % 7 === 0 ? RED : INK }}>{g}</text>;
          })}
          <text x={960} y={300} textAnchor="middle" opacity={1 - eq} style={{ ...BLACK, fontSize: 150, fill: INK }}>数学</text>
          {eq > 0 && <text x={960} y={500} textAnchor="middle" opacity={eq} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 112, fill: INK }}>E[见面次数] = <tspan fill={RED}>?</tspan></text>}
        </g>
      )}
    </Stage>
  );
};

// ------------------------------------------------------------------ the model
const X0 = 230, DX = 47, BASE = 780, HMAX = 420, YEARS = 31;
const p = (k: number) => Math.pow(0.8, k);
const partial = (k: number) => (1 - Math.pow(0.8, k + 1)) / 0.2;
// simulated lives: year k has a meeting with probability 0.8^k (year 0 = 1)
const LANES = 6;
const lives = (seed: number, n: number) => Array.from({ length: n }, (_, i) => {
  const r = mulberry(seed * 1000 + i * 31 + 7);
  return Array.from({ length: YEARS }, (_, k) => (k === 0 ? true : r() < p(k)));
});
// pick a seed whose 400 lives come closest to the model's 58 % "no meeting from year 10 on"
const ANALYTIC = (() => { let q = 1; for (let k = 10; k < 200; k++) q *= 1 - p(k); return q; })();
const GRID = (() => {
  let best: boolean[] = [], bd = 9;
  for (let s = 0; s < 60; s++) {
    const L = lives(s + 100, 400).map((l) => !l.slice(10).some(Boolean));
    const f = L.filter(Boolean).length / 400;
    if (Math.abs(f - ANALYTIC) < bd) { bd = Math.abs(f - ANALYTIC); best = L; }
  }
  return best;
})();
const LANE_LIVES = lives(7, LANES);
const GX0 = 1040, GY0 = 300, GC = 26; // grid of 20 × 20 lives
const redCell = (() => { const order = [210, 189, 230, 168, 251, 190, 209]; return order.find((i) => GRID[i]) ?? GRID.findIndex(Boolean); })();
export const MODEL_FOCUS: [number, number] = [GX0 + (redCell % 20) * GC + 10, GY0 + Math.floor(redCell / 20) * GC + 10];

export const Model: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.model, CUT.net, [-24, 0], MODEL_FOCUS);
  if (!st) return null;
  const a = CUT.model;
  const barAt = (k: number) => 15.6 + k * 0.16;
  const sumT = prog(T, 20.8, 23.6);
  const kSum = sumT * (YEARS - 1);
  const asym = easeOut(prog(T, 22.6, 23.2));
  const five = pop(T, 23.8, 0.35);
  const sim = prog(T, 26.0, 26.4);
  const head = lerp(0, YEARS - 1, easeInOut(prog(T, 26.4, 28.9)));
  const fadeChart = 1 - 0.93 * sim;
  const gridO = easeOut(prog(T, 29.6, 30.0));
  const fill = prog(T, 30.0, 32.4) * 400;
  const redSoFar = GRID.slice(0, Math.floor(fill)).filter(Boolean).length;
  const lanesO = (1 - easeInOut(prog(T, 29.4, 29.9))) * sim;
  const yS = (v: number) => BASE - (v / 5) * HMAX;
  return (
    <Stage style={st}>
      <g opacity={fadeChart}>
        <text x={X0} y={200} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, fill: INK }} opacity={easeOut(prog(T, a, a + 0.4))}>
          p<tspan fontSize={30} dy={10}>k</tspan><tspan dy={-10}> = 0.8</tspan><tspan fontSize={30} dy={-22}>k</tspan>
        </text>
        <text x={X0} y={244} opacity={easeOut(prog(T, a + 0.2, a + 0.6))} style={{ fontFamily: SANS, fontSize: 28, fill: DIM }}>假设：每年见面的机会，比前一年少两成</text>
        <line x1={X0 - 20} x2={X0 + DX * YEARS} y1={BASE} y2={BASE} stroke={FAINT} strokeWidth={2} />
        {[0, 5, 10, 15, 20, 25, 30].map((k) => <text key={k} x={X0 + k * DX + 14} y={BASE + 36} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: DIM }}>{k}年</text>)}
        {Array.from({ length: YEARS }, (_, k) => {
          const t = T - barAt(k);
          if (t < 0) return null;
          const drop = easeOut(clamp(t / 0.28));
          const h = HMAX * p(k);
          const y = BASE - h - (1 - drop) * 300;
          const lit = sumT > 0 && k <= kSum;
          return <rect key={k} x={X0 + k * DX} y={y} width={30} height={h} rx={3} fill={lit ? RED : INK} opacity={(lit ? 0.9 : 0.75) * drop} />;
        })}
        {sumT > 0 && (
          <g>
            <polyline fill="none" stroke={GOLD} strokeWidth={4} points={Array.from({ length: Math.floor(kSum) + 1 }, (_, k) => `${X0 + k * DX + 15},${yS(partial(k))}`).join(' ')} style={{ filter: 'drop-shadow(0 0 8px rgba(241,197,109,0.6))' }} />
            <circle cx={X0 + kSum * DX + 15} cy={yS(partial(kSum))} r={10} fill={GOLD} />
          </g>
        )}
        {asym > 0 && <g opacity={asym}>
          <line x1={X0} x2={X0 + (YEARS) * DX} y1={yS(5)} y2={yS(5)} stroke={GOLD} strokeWidth={2} strokeDasharray="12 10" strokeDashoffset={-T * 60} />
          <text x={X0 + 420} y={yS(5) - 16} style={{ fontFamily: MONO, fontSize: 28, fill: GOLD }}>上限 = 1 / (1 − 0.8) = 5</text>
        </g>}
        {sumT > 0 && (
          <g transform={`translate(1700 175)`}>
            <text textAnchor="end" style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>剩下的见面，期望一共</text>
            <text y={five > 0 ? 150 : 140} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: five > 0 ? 170 * (0.85 + 0.15 * Math.min(1.1, five)) : 120, fill: five > 0 ? GOLD : INK }}>
              {five > 0 ? '5' : partial(kSum).toFixed(2)}<tspan fontSize={48} fontFamily={SANS}> 次</tspan>
            </text>
          </g>
        )}
      </g>
      {/* six possible lives: the playhead sweeps the years, each life's last meeting gets a red ring */}
      {lanesO > 0 && (
        <g opacity={lanesO}>
          {LANE_LIVES.map((life, li) => {
            const y = 360 + li * 78;
            const last = life.lastIndexOf(true);
            return (
              <g key={li}>
                <line x1={X0} x2={X0 + DX * (YEARS - 1) + 30} y1={y} y2={y} stroke="rgba(242,240,234,0.18)" strokeWidth={2} />
                {life.map((m, k) => m && k <= head && <circle key={k} cx={X0 + k * DX + 15} cy={y} r={k === last && head >= YEARS - 1.01 ? 11 : 8} fill={k === last && T > 28.9 ? RED : INK} opacity={0.9} />)}
                {T > 28.9 && <circle cx={X0 + last * DX + 15} cy={y} r={22 + 6 * Math.sin((T - 28.9) * 8)} fill="none" stroke={RED} strokeWidth={3} opacity={easeOut(prog(T, 28.9, 29.1))} />}
              </g>
            );
          })}
          <line x1={X0 + head * DX + 15} x2={X0 + head * DX + 15} y1={320} y2={800} stroke={GOLD} strokeWidth={3} opacity={T < 28.95 ? 1 : 0} />
          {T > 28.9 && <text x={X0 + 6 * DX} y={320} opacity={easeOut(prog(T, 28.95, 29.2))} style={{ ...BLACK, fontSize: 44, fill: RED }}>最后一面，在哪一个？</text>}
        </g>
      )}
      {/* 400 lives: red = never met again from year 10 on */}
      {gridO > 0 && (
        <g opacity={gridO}>
          {GRID.map((never, i) => {
            const on = i < fill;
            const x = GX0 + (i % 20) * GC, y = GY0 + Math.floor(i / 20) * GC;
            return <rect key={i} x={x} y={y} width={20} height={20} rx={3} fill={on ? (never ? RED : 'rgba(242,240,234,0.55)') : 'rgba(242,240,234,0.08)'} />;
          })}
          <text x={X0} y={420} style={{ fontFamily: SANS, fontSize: 30, fill: DIM }}>模拟 400 段关系</text>
          <text x={X0} y={470} style={{ fontFamily: SANS, fontSize: 30, fill: INK }}>第 10 年以后，<tspan fill={RED}>再也没见过</tspan>：</text>
          <text x={X0} y={640} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 180, fill: RED }}>{fill > 0 ? Math.round((redSoFar / Math.max(1, Math.floor(fill))) * 100) : 0}%</text>
          <text x={X0} y={700} opacity={easeOut(prog(T, 32.4, 32.8))} style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>模型精确值 ≈ {(ANALYTIC * 100).toFixed(0)}%（基于上面的假设）</text>
        </g>
      )}
    </Stage>
  );
};
export { hit, fmt, BLUE };

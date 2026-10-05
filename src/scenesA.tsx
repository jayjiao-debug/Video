import React from 'react';
import { AbsoluteFill } from 'remotion';
import { L, at, CH, TIMELINE, ZH, SANS, MONO, EN, INK, DIM, FAINT, RED, CYAN, GOLD, prog, easeOut, easeInOut, lerp, clamp, rnd, pop, fmt } from './lib';
import { GoldTitle } from './ui';

/* Hook + title, 01 survey, 02 ratio, 03 log. Each scene shows only inside its chapter window (hard cuts on beats). */

// ------------------------------------------------------------------ the year as a calendar (hook and finale)
export const DAYS = 365, TODAY = 279; // 2026-10-06 is day 279 (Jan 1 2026 is a Thursday)
const CELL = 26, PITCH = 31, COLS = 53, CX0 = (1920 - COLS * PITCH) / 2 + 3, CY0 = 470;
export const cellXY = (d: number) => { const k = d + 3; return [CX0 + Math.floor(k / 7) * PITCH, CY0 + (k % 7) * PITCH]; };
// a handful of remembered days in an ordinary year
export const MEMO = [19, 47, 96, 131, 163, 205, 248];
const MONTHS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

export const Calendar: React.FC<{ fill: number; grey: number; memo: number; future?: (d: number) => { c: string; o: number } | null; o?: number; dim?: number }> = ({ fill, grey, memo, future, o = 1, dim = 0 }) => (
  <g opacity={o}>
    {MONTHS.map((d, m) => { const [x] = cellXY(d); return <text key={m} x={x} y={CY0 - 18} style={{ fontFamily: MONO, fontSize: 18, fill: DIM }}>{m + 1}月</text>; })}
    {Array.from({ length: DAYS }, (_, d) => {
      const [x, y] = cellXY(d);
      const passed = d < fill;
      const isMemo = MEMO.includes(d);
      if (passed) {
        const g = isMemo ? 0 : grey;
        const col = isMemo && memo > 0 ? CYAN : RED;
        const op = (1 - dim) * lerp(0.9, 0.16, g);
        return <rect key={d} x={x} y={y} width={CELL} height={CELL} rx={4} fill={g > 0.5 && !isMemo ? '#3a3c44' : col} opacity={isMemo && memo > 0 ? 0.95 : op}
          style={isMemo && memo > 0 ? { filter: `drop-shadow(0 0 ${8 * memo}px rgba(86,210,226,0.9))` } : undefined} />;
      }
      const f = future?.(d);
      if (f) return <rect key={d} x={x} y={y} width={CELL} height={CELL} rx={4} fill={f.c} opacity={f.o} />;
      return <rect key={d} x={x + 0.75} y={y + 0.75} width={CELL - 1.5} height={CELL - 1.5} rx={4} fill="none" stroke="rgba(236,232,223,0.22)" strokeWidth={1.5} opacity={1 - dim * 0.6} />;
    })}
  </g>
);

export const Hook: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('hook'); if (T >= c.z) return null;
  const h1 = L('h1'), h2 = L('h2'), h3 = L('h3');
  const fill = lerp(190, TODAY, easeOut(prog(T, 0, h1.z - 0.1)));
  const grey = easeInOut(prog(T, at('h2', '好像') , at('h2', '好像') + 1.2));
  const memo = easeOut(prog(T, at('h2', '还没做'), at('h2', '还没做') + 0.5));
  const ending = at('h2', '这一年');
  const fut = (d: number) => {
    if (T < ending) return null;
    const k = prog(T, ending + (d - TODAY) * 0.006, ending + (d - TODAY) * 0.006 + 0.25);
    return k > 0 ? { c: RED, o: 0.18 + 0.25 * Math.sin(Math.PI * k) } : null;
  };
  const dim = easeInOut(prog(T, h3.a, TIMELINE.title));
  const pct = Math.round((fill / DAYS) * 1000) / 10;
  const title = TIMELINE.title;
  const tk = prog(T, title - 0.02, title + 0.4);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={1 - 0.75 * dim}>
          <text x={CX0} y={300} style={{ fontFamily: MONO, fontSize: 28, fill: DIM, letterSpacing: '0.2em' }}>2026</text>
          <text x={CX0} y={392} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 72, fill: INK }}>第 {String(Math.round(fill)).padStart(3, '0')} 天</text>
          <text x={1920 - CX0} y={400} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 104, fill: RED }}>{pct.toFixed(1)}%</text>
          <text x={1920 - CX0} y={300} textAnchor="end" style={{ fontFamily: SANS, fontSize: 28, fill: DIM, letterSpacing: '0.12em' }}>今年已经过去</text>
          <Calendar fill={fill} grey={grey} memo={memo} future={fut} />
          {memo > 0.01 && (
            <text x={960} y={CY0 + 7 * PITCH + 76} textAnchor="middle" opacity={memo * (1 - dim)} style={{ fontFamily: SANS, fontSize: 34, fill: CYAN, letterSpacing: '0.1em' }}>记得住的日子，只有这几天</text>
          )}
        </g>
        {tk > 0 && (
          <g>
            <text x={960} y={392} textAnchor="middle" opacity={easeOut(prog(T, title + 0.1, title + 0.5))} style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.5em', fill: GOLD }}>WHY TIME SPEEDS UP</text>
            <GoldTitle text="越过越快" T={T} at={title} size={150} y={560} step={0.13} id="title" />
            <text x={960} y={650} textAnchor="middle" opacity={easeOut(prog(T, title + 0.5, title + 0.9))} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, letterSpacing: '0.4em', fill: 'rgba(236,232,223,0.7)' }}>VIBE知识大赏</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 01 survey: 1,865 people, 16–80
const AGES = 65, PER = 29, SX0 = 330, SX1 = 1590, SY0 = 800, DY = 13.2;
const sx = (age: number) => SX0 + ((age - 16) / 64) * (SX1 - SX0);
// schematic: how fast "the last ten years" felt, rising with age and levelling off around 50 (shape only)
const curve = (age: number) => 1 - Math.exp(-(age - 10) / 13);
const cy = (age: number) => 640 - 150 * (curve(age) - curve(16)) / (curve(80) - curve(16));

export const Survey: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('survey'); if (T < c.a || T >= c.z) return null;
  const s2 = L('s2'), s3 = L('s3');
  const appear = (i: number) => easeOut(prog(T, c.a + rnd(i, 1) * 0.8, c.a + 0.25 + rnd(i, 1) * 0.8));
  const sayFast = at('s2', '几乎');
  const morph = easeInOut(prog(T, s3.a + 0.3, s3.a + 1.8));
  const dots: React.ReactNode[] = [];
  let n = 0;
  for (let col = 0; col < AGES; col++) for (let r = 0; r < PER; r++) {
    if (n >= 1865) break;
    const i = n++;
    const age = 16 + col;
    const x0 = sx(age) + (rnd(i, 2) - 0.5) * 6, y0 = SY0 - r * DY - (rnd(i, 3) - 0.5) * 4;
    const x1 = sx(age) + (rnd(i, 4) - 0.5) * 10, y1 = cy(age) + (rnd(i, 5) - 0.5) * 18 * (1 - curve(age) * 0.4);
    const red = rnd(i, 6) < 0.93 ? prog(T, sayFast + rnd(i, 7) * 1.2, sayFast + rnd(i, 7) * 1.2 + 0.2) : 0;
    const x = lerp(x0, x1, morph), y = lerp(y0, y1, morph);
    dots.push(<circle key={i} cx={x} cy={y} r={lerp(3.6, 2.6, morph)} fill={red > 0.5 ? RED : INK} opacity={appear(i) * (red > 0.5 ? 0.85 : 0.35)} />);
  }
  const axisO = easeOut(prog(T, c.a, c.a + 0.4));
  const line = easeInOut(prog(T, s3.a + 1.2, s3.a + 2.6));
  const pts = Array.from({ length: 65 }, (_, k) => `${sx(16 + k)},${cy(16 + k)}`);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={axisO}>
          <line x1={SX0 - 20} x2={SX1 + 20} y1={828} y2={828} stroke={FAINT} strokeWidth={1.5} />
          {[16, 30, 40, 50, 60, 70, 80].map((a) => <text key={a} x={sx(a)} y={862} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 20, fill: DIM }}>{a}岁</text>)}
          <text x={SX1 + 20} y={300} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, fill: INK }}>N = {fmt(Math.round(1865 * easeOut(prog(T, c.a + 0.2, c.a + 1.3))))}</text>
          <text x={SX1 + 20} y={336} textAnchor="end" style={{ fontFamily: SANS, fontSize: 20, fill: DIM }}>16–80 岁 · 两个国家</text>
        </g>
        {dots}
        {T > sayFast && morph < 0.6 && (
          <text x={960} y={300} textAnchor="middle" opacity={easeOut(prog(T, sayFast + 0.3, sayFast + 0.7)) * (1 - morph / 0.6)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 60, fill: RED }}>“时间过得很快”</text>
        )}
        {line > 0 && (
          <g>
            <polyline points={pts.join(' ')} fill="none" stroke={RED} strokeWidth={4} strokeDasharray={3000} strokeDashoffset={3000 * (1 - line)} style={{ filter: 'drop-shadow(0 0 8px rgba(255,90,69,0.6))' }} />
            <text x={SX0 - 10} y={330} opacity={line} style={{ fontFamily: SANS, fontSize: 32, fill: INK }}>回头看“过去十年”，过得有多快</text>
            <text x={SX0 - 10} y={372} opacity={line} style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>示意 · 差别不大，50 岁后趋平；问“上周”“上个月”，各年龄几乎一样</text>
            <text x={sx(80) + 8} y={cy(80) - 22} textAnchor="end" opacity={line} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: RED }}>越觉得快 ↑</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 02 ratio: one year in a life of 10 vs 50
export const Ratio: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('ratio'); if (T < c.a || T >= c.z) return null;
  const r2 = L('r2'), r3 = L('r3');
  const BX = 260, BW = 1400, BY = 600, BH = 64;
  const r1 = L('r1');
  const years = Math.min(10, Math.floor(10 * prog(T, r1.a + 0.3, r1.z)));
  const barIn = easeOut(prog(T, c.a, c.a + 0.6));
  const ten = easeOut(prog(T, r2.a, r2.a + 1.0));
  const toFifty = easeInOut(prog(T, r3.a + 0.1, r3.a + 1.4));
  const n = Math.round(lerp(10, 50, toFifty));
  const segW = BW / lerp(10, 50, toFifty);
  const redO = easeOut(prog(T, at('r2', '一年'), at('r2', '一年') + 0.4));
  const age = Math.round(lerp(10, 50, toFifty));
  const frac = toFifty < 0.5 ? '1/10' : '1/50';
  const pct = (100 / lerp(10, 50, toFifty));
  const you = easeOut(prog(T, L('r4').a, L('r4').a + 0.4));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={barIn}>
          <text x={BX} y={BY - 30} style={{ fontFamily: SANS, fontSize: 26, fill: DIM, letterSpacing: '0.1em' }}>你活过的全部时间</text>
          <rect x={BX} y={BY} width={BW * barIn} height={BH} rx={6} fill="rgba(236,232,223,0.07)" stroke="rgba(236,232,223,0.45)" strokeWidth={1.5} />
          {(years > 0 || ten > 0) && Array.from({ length: n - 1 }, (_, k) => {
            const x = BX + segW * (k + 1);
            const o = toFifty > 0 ? 0.35 : k < Math.max(years, ten * 10) - 1 ? 0.5 : 0;
            return <line key={k} x1={x} x2={x} y1={BY + 6} y2={BY + BH - 6} stroke={INK} strokeWidth={1.2} opacity={o} />;
          })}
          {redO > 0 && <rect x={BX + BW - segW} y={BY} width={segW} height={BH} rx={4} fill={RED} opacity={redO} style={{ filter: 'drop-shadow(0 0 12px rgba(255,90,69,0.7))' }} />}
          {redO > 0 && <text x={BX + BW - segW / 2} y={BY + BH + 44} textAnchor="middle" opacity={redO} style={{ fontFamily: SANS, fontSize: 24, fill: RED }}>今年</text>}
        </g>
        {years > 0 && (
          <g>
            <text x={BX} y={470} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 120, fill: INK }}>{ten > 0 ? age : years}<tspan fontSize={48} fontFamily={SANS}> 岁</tspan></text>
            <text x={BX + BW} y={470} textAnchor="end" opacity={redO} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 120, fill: RED }}>{frac}</text>
            <text x={BX + BW} y={530} textAnchor="end" opacity={redO} style={{ fontFamily: MONO, fontSize: 34, fill: DIM }}>一年 = 人生的 {pct.toFixed(pct < 3 ? 1 : 0)}%</text>
          </g>
        )}
        {you > 0 && (
          <g opacity={you}>
            {[[18, '5.6%'], [20, '5%'], [25, '4%']].map(([a, p], i) => (
              <text key={i} x={BX + i * 380} y={850} style={{ fontFamily: MONO, fontSize: 40, fill: i === 1 ? INK : DIM }}>{a}岁 → <tspan fill={RED} fontWeight={700}>{p}</tspan></text>
            ))}
            <text x={BX} y={790} style={{ fontFamily: SANS, fontSize: 30, fill: DIM }}>换成你的年纪：</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 03 log: real life vs felt life
const RX0 = 240, RX1 = 1680, TOPY = 400, BOTY = 700;
const linX = (a: number) => RX0 + (a / 80) * (RX1 - RX0);
const logX = (a: number) => RX0 + (Math.log(a / 3) / Math.log(80 / 3)) * (RX1 - RX0);
const TICKS = [3, 5, 10, 16, 20, 30, 40, 50, 60, 70, 80];

export const LogLife: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('log'); if (T < c.a || T >= c.z) return null;
  const g1 = L('g1'), g2 = L('g2'), g3 = L('g3');
  const rul = easeOut(prog(T, c.a, c.a + 0.6));
  const fan = (k: number) => easeInOut(prog(T, g1.a + 0.6 + k * 0.12, g1.a + 1.2 + k * 0.12));
  const half = easeOut(prog(T, g2.a + 0.2, g2.a + 0.9));
  const out = easeInOut(prog(T, at('g3', '真正'), c.z - 0.1));
  const mid = 16;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={1 - out} transform={`translate(0 ${out * 60})`}>
          {/* rulers */}
          <text x={RX0} y={TOPY - 46} opacity={rul} style={{ fontFamily: SANS, fontSize: 26, fill: INK }}>真实的人生 <tspan fill={DIM} fontSize={20}>每年一样长</tspan></text>
          <line x1={RX0} x2={RX0 + (RX1 - RX0) * rul} y1={TOPY} y2={TOPY} stroke={INK} strokeWidth={2} />
          <text x={RX0} y={BOTY + 74} opacity={rul} style={{ fontFamily: SANS, fontSize: 26, fill: INK }}>感觉上的人生 <tspan fill={DIM} fontSize={20}>每一年按比例变短</tspan></text>
          <line x1={RX0} x2={RX0 + (RX1 - RX0) * rul} y1={BOTY} y2={BOTY} stroke={INK} strokeWidth={2} />
          {TICKS.map((a, k) => {
            const f = fan(k), hot = a === mid;
            return (
              <g key={a} opacity={rul}>
                <line x1={linX(a)} x2={linX(a)} y1={TOPY - 10} y2={TOPY + 10} stroke={INK} strokeWidth={1.5} />
                <text x={linX(a)} y={TOPY - 18} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: hot && half > 0 ? RED : DIM }}>{a}</text>
                <line x1={logX(a)} x2={logX(a)} y1={BOTY - 10} y2={BOTY + 10} stroke={INK} strokeWidth={1.5} />
                <text x={logX(a)} y={BOTY + 36} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: hot && half > 0 ? RED : DIM }}>{a}</text>
                {f > 0 && <line x1={linX(a)} y1={TOPY + 10} x2={lerp(linX(a), logX(a), f)} y2={lerp(TOPY + 10, BOTY - 10, f)} stroke={hot && half > 0 ? RED : 'rgba(236,232,223,0.35)'} strokeWidth={hot && half > 0 ? 3 : 1.2} />}
              </g>
            );
          })}
          {half > 0 && (
            <g opacity={half}>
              <rect x={RX0} y={BOTY - 8} width={(RX1 - RX0) / 2} height={16} fill={RED} opacity={0.35} />
              <text x={(RX0 + RX1) / 2} y={BOTY - 26} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: RED }}>一半</text>
              <rect x={linX(3)} y={TOPY - 8} width={linX(16) - linX(3)} height={16} fill={RED} opacity={0.35} />
              <text x={linX(16)} y={TOPY - 60} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, fill: RED }}>16 岁</text>
              <text x={RX1} y={BOTY + 130} textAnchor="end" style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>模型估算：√(3 × 80) ≈ 16　· 比例理论只是一种解释，不是定律</text>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
export { EN, pop, clamp };

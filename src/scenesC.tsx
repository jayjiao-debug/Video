import React from 'react';
import { AbsoluteFill } from 'remotion';
import { L, at, CH, TIMELINE, FILM_END, ZH, SANS, MONO, EN, INK, DIM, RED, CYAN, GOLD, prog, easeOut, easeIn, easeInOut, lerp, clamp, rnd, pop } from './lib';
import { Calendar, DAYS, TODAY, cellXY } from './scenesA';
import { GoldTitle } from './ui';
import { JUNO } from './brand/identity';

/* 07 first times, 08 the holiday paradox (James 1890), 09 slowing time down (back to the calendar), end card. */

// ------------------------------------------------------------------ 07 two years as strips of 365 days
const SX = 260, SW = 1400;
const firsts = (age: number) => {
  const out: number[] = [];
  const n = age === 10 ? 64 : 6;
  for (let i = 0; out.length < n && i < 2000; i++) {
    const d = Math.floor(rnd(i, age) * 365);
    const summer = d >= 181 && d < 243;
    if (age === 10 && !summer && rnd(i, age + 1) < 0.45) continue; // more of them in the summer
    if (!out.includes(d)) out.push(d);
  }
  return out;
};
const F10 = firsts(10), F25 = firsts(25);
const TAGS: [number, string][] = [[190, '第一次游泳'], [214, '第一次看海'], [60, '第一次自己坐车']];

export const Child: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('child'); if (T < c.a || T >= c.z) return null;
  const c1 = L('c1'), c2 = L('c2'), c3 = L('c3');
  const s10 = easeOut(prog(T, c.a + 0.1, c.a + 0.8));
  const summer = easeOut(prog(T, at('c1', '暑假'), at('c1', '暑假') + 0.6));
  const lit = (k: number) => prog(T, c2.a + 0.2 + k * 0.045, c2.a + 0.4 + k * 0.045);
  const s25 = easeOut(prog(T, c3.a + 0.1, c3.a + 0.7));
  const squash = easeInOut(prog(T, at('c3', '被压缩') - 0.1, at('c3', '被压缩') + 0.9));
  const x10 = (d: number) => SX + (d / 365) * SW;
  // the adult year: grey days shrink to nothing, the few first times keep their width
  const keep = F25.slice().sort((a, b) => a - b);
  const x25 = (d: number) => {
    const plain = SX + (d / 365) * SW;
    const rank = keep.filter((k) => k < d).length;
    const packed = SX + 520 + rank * 40;
    return lerp(plain, packed, squash);
  };
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={s10}>
          <text x={SX} y={300} style={{ fontFamily: SANS, fontSize: 28, fill: INK }}>10 岁的一年</text>
          {summer > 0 && <rect x={x10(181)} y={322 - 18 * summer} width={x10(243) - x10(181)} height={110 + 36 * summer} rx={8} fill="rgba(241,197,109,0.08)" stroke={GOLD} strokeOpacity={0.6 * summer} />}
          {summer > 0 && <text x={(x10(181) + x10(243)) / 2} y={292} textAnchor="middle" opacity={summer} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: GOLD }}>暑假</text>}
          {Array.from({ length: 365 }, (_, d) => {
            const k = F10.indexOf(d), on = k >= 0 ? lit(k) : 0;
            return <rect key={d} x={x10(d)} y={330} width={2.4} height={94} fill={on > 0 ? (k % 3 ? CYAN : GOLD) : 'rgba(236,232,223,0.22)'} opacity={on > 0 ? 0.35 + 0.65 * on : 1} />;
          })}
          {TAGS.map(([d, s], i) => {
            const o = easeOut(prog(T, c2.a + 0.2 + i * 0.6, c2.a + 0.5 + i * 0.6));
            if (o <= 0) return null;
            return (
              <g key={d} opacity={o}>
                <line x1={x10(d) + 1} x2={x10(d) + 1} y1={424} y2={456 + i * 36} stroke={CYAN} strokeWidth={1.5} />
                <text x={x10(d) + 8} y={476 + i * 36} style={{ fontFamily: SANS, fontSize: 28, fill: CYAN }}>{s}</text>
              </g>
            );
          })}
        </g>
        {s25 > 0 && (
          <g opacity={s25}>
            <text x={SX} y={640} style={{ fontFamily: SANS, fontSize: 28, fill: INK }}>25 岁的一年</text>
            {Array.from({ length: 365 }, (_, d) => {
              const isF = keep.includes(d);
              const w = isF ? 6 : 2.4 * (1 - squash);
              if (w <= 0.05) return null;
              return <rect key={d} x={x25(d)} y={670} width={w} height={94} fill={isF ? CYAN : 'rgba(236,232,223,0.22)'} opacity={isF ? 0.95 : 1 - squash * 0.5} />;
            })}
            {squash > 0.5 && <text x={SX + 520 + keep.length * 40 + 30} y={732} opacity={prog(squash, 0.5, 1)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 44, fill: INK }}>记住的，只剩几个画面</text>}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 08 holiday paradox
export const Holiday: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('holiday'); if (T < c.a || T >= c.z) return null;
  const v1 = L('v1'), v2 = L('v2'), v3 = L('v3');
  const q = easeOut(prog(T, c.a + 0.2, c.a + 0.9));
  const qUp = easeInOut(prog(T, v2.a - 0.1, v2.a + 0.6));
  const passTrip = easeOut(prog(T, v2.a + 0.3, v2.a + 1.0));
  const backTrip = easeOut(prog(T, at('v2', '回头看') - 0.1, at('v2', '回头看') + 0.7));
  const routine = easeOut(prog(T, v3.a + 0.1, v3.a + 0.9));
  const X0 = 400;
  const row = (y: number, label: string) => (
    <g>
      <text x={X0 - 30} y={y + 12} textAnchor="end" style={{ fontFamily: SANS, fontSize: 34, fill: INK }}>{label}</text>
      <line x1={X0} x2={1700} y1={y} y2={y} stroke="rgba(236,232,223,0.18)" strokeWidth={2} />
    </g>
  );
  const trip = (x: number, y: number, w: number, o: number) => o > 0 && (
    <g opacity={o}>
      <rect x={x} y={y - 30} width={w} height={60} rx={10} fill="rgba(241,197,109,0.15)" stroke={GOLD} strokeWidth={2} />
      {Array.from({ length: Math.max(3, Math.round(w / 34)) }, (_, k) => <circle key={k} cx={x + (k + 0.5) * (w / Math.max(3, Math.round(w / 34)))} cy={y + (rnd(k, 3) - 0.5) * 18} r={7} fill={[GOLD, CYAN, RED][k % 3]} />)}
      <text x={x + w / 2} y={y - 44} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 28, fill: GOLD }}>旅行的一周</text>
    </g>
  );
  const plain = (x: number, y: number, w: number, o: number) => o > 0 && (
    <g opacity={o}>
      <rect x={x} y={y - 30} width={w} height={60} rx={10} fill="rgba(236,232,223,0.06)" stroke="rgba(236,232,223,0.45)" strokeWidth={2} />
      <text x={x + w / 2} y={y - 44} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 28, fill: DIM }}>平常的一周</text>
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={q} transform={`translate(0 ${-150 * qUp})`}>
          <text x={960} y={450} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: lerp(46, 30, qUp), fill: INK }}>“A time filled with varied and interesting experiences</text>
          <text x={960} y={450 + lerp(60, 40, qUp)} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: lerp(46, 30, qUp), fill: INK }}>seems short in passing, but long as we look back.”</text>
          <text x={960} y={450 + lerp(130, 84, qUp)} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 20, fill: DIM }}>— William James, 1890</text>
        </g>
        {qUp > 0 && (
          <g opacity={qUp}>
            {row(560, '过的时候')}
            {row(790, '回头看')}
            {trip(X0 + 40, 560, 200, passTrip)}
            {passTrip > 0 && <text x={X0 + 260} y={570} opacity={passTrip} style={{ fontFamily: SANS, fontSize: 30, fill: GOLD }}>→ 一晃而过</text>}
            {trip(X0 + 40, 790, lerp(200, 700, backTrip), backTrip)}
            {plain(X0 + 820, 560, 620, routine)}
            {routine > 0 && <text x={X0 + 820 + 620} y={620} textAnchor="end" opacity={routine} style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>过的时候很慢</text>}
            {plain(X0 + 820, 790, lerp(620, 150, easeInOut(prog(T, v3.a + 0.6, v3.a + 1.6))), routine)}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 09 finale: back to the calendar
const LEFT = DAYS - TODAY; // 86 days after today
const NEWS: [number, string][] = [[TODAY + 8, '换一条路回家'], [TODAY + 37, '学一样新东西'], [TODAY + 66, '去没去过的地方']];

export const Slow: React.FC<{ T: number }> = ({ T }) => {
  const c = CH('slow'); if (T < c.a || T >= c.z) return null;
  const e1 = L('e1'), e2 = L('e2'), e3 = L('e3'), e4 = L('e4'), e5 = L('e5');
  const calO = easeOut(prog(T, c.a, c.a + 0.6));
  const nope = easeOut(prog(T, at('e1', '熬夜'), at('e1', '熬夜') + 0.3)) * (1 - prog(T, e2.a, e2.a + 0.3));
  const spark = (d: number) => {
    const i = d - TODAY;
    const k = prog(T, e2.a + 0.3 + (rnd(i, 9) * 1.3), e2.a + 0.6 + (rnd(i, 9) * 1.3));
    return rnd(i, 8) < 0.22 ? k : 0;
  };
  const allGold = easeInOut(prog(T, e5.a, e5.a + 2.2));
  const fut = (d: number) => {
    const s = Math.max(spark(d), allGold * 0.75, NEWS.some(([n], i) => n === d && T > e3.a + 0.3 + i * 0.85) ? 1 : 0);
    return s > 0 ? { c: GOLD, o: 0.25 + 0.75 * s } : null;
  };
  const count = easeOut(prog(T, e4.a, e4.a + 0.3));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={calO}>
          <Calendar fill={TODAY} grey={1} memo={1} future={fut} />
          {NEWS.map(([d, s], i) => {
            const o = easeOut(prog(T, e3.a + 0.3 + i * 0.85, e3.a + 0.6 + i * 0.85));
            if (o <= 0) return null;
            const [x, y] = cellXY(d);
            const lx = 1010 + i * 280, ly = 360;
            return (
              <g key={d} opacity={o * (1 - allGold)}>
                <polyline points={`${x + 13},${y} ${x + 13},${ly + 30} ${lx},${ly + 30} ${lx},${ly + 12}`} fill="none" stroke={GOLD} strokeWidth={1.5} />
                <text x={lx} y={ly} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: GOLD }}>{s}</text>
              </g>
            );
          })}
          {nope > 0 && (
            <g opacity={nope}>
              <text x={960} y={360} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 60, fill: DIM }}>熬夜 <tspan fill={RED}>✕</tspan>　发呆 <tspan fill={RED}>✕</tspan></text>
            </g>
          )}
          {count > 0 && (
            <g opacity={count}>
              <text x={960} y={770} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 26, fill: DIM }}>今年剩下的日子（从 10 月 6 日算）</text>
              <text x={960} y={866} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 92, fill: GOLD }}>{Math.round(LEFT * count)}<tspan fontSize={40} fontFamily={SANS}> 天</tspan></text>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ end card
export const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const at = TIMELINE.endCard;
  if (T < at) return null;
  const t = T - at;
  const o = (a: number, d = 0.35) => easeOut(prog(t, a, a + d));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill style={{ backgroundColor: '#07080b' }}>
      <svg width={1920} height={1080}>
        <defs><radialGradient id="end-g" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.1" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
        <rect width={1920} height={1080} fill="url(#end-g)" />
        <GoldTitle text="越过越快" T={T} at={at} size={110} y={360} step={0.08} id="end" />
        <text x={960} y={490} textAnchor="middle" opacity={o(0.4)} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 54, fill: INK, letterSpacing: '0.04em' }}>你今年做过的“第一次”，是什么？</text>
        <text x={960} y={548} textAnchor="middle" opacity={o(0.7)} style={{ fontFamily: SANS, fontSize: 26, fill: 'rgba(236,232,223,0.6)', letterSpacing: '0.1em' }}>评论区说一个，再 @ 那个总说“一年好快”的人</text>
        <g opacity={o(1.0)}>
          <rect x={960 - 330} y={600} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={637} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(1.2)} style={{ fontFamily: SANS, fontSize: 17, letterSpacing: '0.02em', fill: 'rgba(236,232,223,0.42)' }}>
          <text x={960} y={930} textAnchor="middle">资料：Friedman & Janssen (2010) Acta Psychologica · Wittmann & Lehnhoff (2005) Psychological Reports · Janet (1877) via W. James (1890)</text>
          <text x={960} y={958} textAnchor="middle">Stetson, Fiesta & Eagleman (2007) PLoS ONE · Faber & Gennari (2015) Cognition · Avni-Babad & Ritov (2003) JEP: General</text>
          <text x={960} y={986} textAnchor="middle">“16 岁过一半”为比例理论的模型估算，非测量结果　|　配音为 AI 合成　|　图表为示意</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
export { pop, clamp, CYAN, RED };

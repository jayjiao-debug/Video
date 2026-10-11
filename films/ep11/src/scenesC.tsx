import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, pStop, clamp } from './lib';
import { Subtitle, Glow, Dust } from './ui';

// final chart coordinates
const X0 = 360, XW = 1200, YB = 780, YH = 520;
const xOf = (f: number) => X0 + XW * f;
const yOf = (p: number) => YB - YH * (p / 0.5);
const XP = xOf(1 / Math.E), YP = yOf(1 / Math.E);

const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const DotGrid: React.FC<{ p: number; o: number }> = ({ p, o }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const N = 100, size = 460;
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    const step = size / N;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const i = r * N + c;
        const win = hash(i) < p;
        ctx.fillStyle = win ? 'rgba(214,176,100,0.95)' : 'rgba(111,125,145,0.28)';
        ctx.beginPath();
        ctx.arc(c * step + step / 2, r * step + step / 2, win ? 1.75 : 1.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [p]);
  return <canvas ref={ref} width={size} height={size} style={{ position: 'absolute', left: 230, top: 290, opacity: o }} />;
};

/* S09–S11 · 63.20 → 81.43 (+ dot bloom into the reveal) */
export const Simulation: React.FC<{ t: number }> = ({ t }) => {
  const S = 63.2, G = 65.25, MOR = 71.31, Z = 75.37, GAP = 79.41, R = 81.43;
  const o = Math.min(prog(t, S - 0.2, S + 0.2), 1);
  const pts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => ({ k, at: beatAfter(G, k - 1), p: pStop(10, k) }));
  // current proportion for dots
  let cur = 0;
  let curK = 0;
  pts.forEach((q, i) => {
    if (t >= q.at) {
      const prev = i === 0 ? 0 : pts[i - 1].p;
      cur = lerp(prev, q.p, easeOut(prog(t, q.at, q.at + 0.3)));
      curK = q.k;
    }
  });
  const qO = Math.min(easeOut(prog(t, S + 0.05, S + 0.8)), 1 - prog(t, G - 0.35, G + 0.05));
  const introO = easeOut(prog(t, G, G + 0.6));
  const m = easeInOut(prog(t, MOR, MOR + 1.1));
  const gridO = introO * (1 - prog(t, MOR, MOR + 0.5));
  const s1 = lerp(0.7167, 1, m), dx = lerp(602, 0, m), dy = lerp(143.7, 0, m);
  const z = easeInOut(prog(t, Z, GAP - 0.2));
  const S2 = lerp(1, 2.4, z);
  const xc = lerp(XP, 960, z), yc = lerp(YP, 540, z);
  const fadeRest = 1 - prog(t, GAP, GAP + 0.55);
  const labelsO = lerp(1, 0, easeOut(z)) * fadeRest;
  const curveP = easeInOut(prog(t, MOR + 0.5, MOR + 2.5));
  const markX = lerp(0.08, 1 / Math.E, easeInOut(prog(t, MOR + 2.0, Z)));
  const markY = -markX * Math.log(markX);
  const markO = easeOut(prog(t, MOR + 2.0, MOR + 2.4));
  const axisSwap = easeInOut(prog(t, MOR + 0.2, MOR + 0.9));
  const curvePath = (() => {
    let d = '';
    for (let i = 1; i <= 240; i++) {
      const f = i / 240;
      const v = -f * Math.log(f);
      d += `${i === 1 ? 'M' : 'L'} ${xOf(f).toFixed(1)} ${yOf(v).toFixed(1)} `;
    }
    return d;
  })();
  // gap dot + bloom into reveal
  const inGap = t >= GAP - 0.1;
  const breathe = 1 + 0.25 * Math.sin((t - GAP) * Math.PI * 1.1);
  const bloom = prog(t, R, R + 0.45);
  const vig = lerp(0, 0.75, z);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {qO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: qO }}>
          <div style={{ fontFamily: ZH, fontSize: 80, fontWeight: 600, color: C.paper, letterSpacing: '0.12em' }}>
            如果人生可以<span style={{ color: C.gold }}>重来一万次</span>？
          </div>
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 38, color: C.dim, marginTop: 14 }}>What if you could live it ten thousand times?</div>
        </div>
      )}
      {gridO > 0 && (
        <>
          <DotGrid p={cur} o={gridO} />
          <div style={{ position: 'absolute', left: 230, top: 244, width: 460, opacity: gridO, fontFamily: ZH, fontSize: 22, color: C.dim, letterSpacing: '0.1em' }}>
            一万次人生　<span style={{ color: C.gold }}>●</span> 选中了最好的那位
          </div>
          <div style={{ position: 'absolute', left: 230, top: 770, width: 460, opacity: gridO * (curK ? 1 : 0), fontFamily: ZH, fontSize: 32, color: C.paper }}>
            先看 <span style={{ fontFamily: EN, fontSize: 44, color: C.gold }}>{curK}</span> 位　成功率{' '}
            <span style={{ fontFamily: EN, fontSize: 44, color: C.gold }}>{(cur * 100).toFixed(1)}%</span>
          </div>
        </>
      )}
      {/* chart */}
      <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${xc - S2 * XP}px, ${yc - S2 * YP}px) scale(${S2})` }}>
        <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${s1})`, opacity: introO }}>
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <g opacity={labelsO}>
              {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((v) => (
                <g key={v}>
                  <line x1={X0} x2={X0 + XW} y1={yOf(v)} y2={yOf(v)} stroke={C.paper} strokeOpacity={v === 0 ? 0.45 : 0.08} strokeWidth={v === 0 ? 1.5 : 1} />
                  <text x={X0 - 18} y={yOf(v) + 8} textAnchor="end" fontFamily={EN} fontSize={26} fill={C.dim}>{Math.round(v * 100)}%</text>
                </g>
              ))}
              <text x={X0} y={YB - YH - 26} fontFamily={ZH} fontSize={24} fill={C.dim} letterSpacing="3">成功率</text>
              <g opacity={1 - axisSwap}>
                {pts.map((q) => (
                  <text key={q.k} x={xOf(q.k / 10)} y={YB + 38} textAnchor="middle" fontFamily={EN} fontSize={28} fill={C.dim}>{q.k}</text>
                ))}
                <text x={X0 + XW / 2} y={YB + 86} textAnchor="middle" fontFamily={ZH} fontSize={26} fill={C.dim} letterSpacing="3">只看不选的人数 k（共10人）</text>
              </g>
              <g opacity={axisSwap}>
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <text key={f} x={xOf(f)} y={YB + 38} textAnchor="middle" fontFamily={EN} fontSize={28} fill={C.dim}>{f * 100}%</text>
                ))}
                <text x={X0 + XW / 2} y={YB + 86} textAnchor="middle" fontFamily={ZH} fontSize={26} fill={C.dim} letterSpacing="3">只看不选的比例（人数很多时）</text>
              </g>
            </g>
            {/* discrete polyline */}
            <g opacity={lerp(1, 0.3, prog(t, MOR + 0.5, MOR + 1.5)) * fadeRest}>
              {pts.map((q, i) => {
                if (i === 0) return null;
                const pr = pts[i - 1];
                const lp = easeOut(prog(t, q.at, q.at + 0.25));
                if (lp <= 0) return null;
                const x1 = xOf(pr.k / 10), y1 = yOf(pr.p), x2 = xOf(q.k / 10), y2 = yOf(q.p);
                return <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, lp)} y2={lerp(y1, y2, lp)} stroke={C.gold} strokeWidth={2.5} />;
              })}
              {pts.map((q) => {
                const pp = prog(t, q.at, q.at + 0.25);
                if (pp <= 0) return null;
                return <circle key={q.k} cx={xOf(q.k / 10)} cy={yOf(q.p)} r={lerp(14, 7, easeOut(pp))} fill={C.goldHi} />;
              })}
            </g>
            {/* smooth curve */}
            <path d={curvePath} fill="none" stroke={C.gold} strokeWidth={3.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - curveP}
              opacity={fadeRest} style={{ filter: 'drop-shadow(0 0 8px rgba(201,164,92,0.5))' }} />
            {/* marker */}
            {markO > 0 && !inGap && (
              <g opacity={markO}>
                <line x1={xOf(markX)} x2={xOf(markX)} y1={yOf(markY)} y2={YB} stroke={C.paper} strokeOpacity={0.3} strokeDasharray="6 8" />
                <line x1={X0} x2={xOf(markX)} y1={yOf(markY)} y2={yOf(markY)} stroke={C.paper} strokeOpacity={0.3} strokeDasharray="6 8" />
                <circle cx={xOf(markX)} cy={yOf(markY)} r={16} fill="none" stroke={C.goldHi} strokeWidth={2.5} />
                <circle cx={xOf(markX)} cy={yOf(markY)} r={6} fill={C.goldHi} />
              </g>
            )}
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,${vig}) 100%)` }} />
      {/* the lone dot during the silent bar */}
      {inGap && t < R + 0.5 && (
        <div style={{ position: 'absolute', left: 960, top: 540, opacity: (1 - bloom) * prog(t, GAP - 0.1, GAP + 0.05) }}>
          <Glow x={0} y={0} r={90 * breathe * (1 + bloom * 6)} color="rgba(233,190,110,0.7)" opacity={0.6} />
          <div style={{ position: 'absolute', left: -9 * breathe, top: -9 * breathe, width: 18 * breathe, height: 18 * breathe, borderRadius: '50%',
            background: C.goldHi, boxShadow: `0 0 24px ${C.gold}`, transform: `scale(${1 + bloom * 4})` }} />
        </div>
      )}
      <Subtitle t={t} at={G + 0.35} out={MOR - 0.1} zh="先只看不选前 k 位，再选第一个更好的" en="Skip the first k. Then take the first one better than all of them." />
      <Subtitle t={t} at={Z} out={GAP - 0.05} zh="成功率最高的那个点，在——" en="The best strategy stops at…" />
    </AbsoluteFill>
  );
};

/* S12 · Reveal 81.43 → 85.50 */
export const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const R = 81.43, E = 85.5;
  const o = 1 - prog(t, E - 0.25, E + 0.1);
  const tp = easeOut(prog(t, R, R + 0.7));
  const glow = t < R ? 0 : Math.min(prog(t, R, R + 0.2), 1) * lerp(0.5, 0.16, easeOut(prog(t, R + 0.2, R + 2.4)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={470} r={760} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={R} cx={960} cy={470} seed="reveal" n={110} spread={620} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: prog(t, R, R + 0.18),
        transform: `scale(${lerp(1.14, 1, tp)})`, filter: `blur(${(1 - easeOut(prog(t, R, R + 0.45))) * 14}px)` }}>
        <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 380, lineHeight: 1, letterSpacing: '0.02em',
          backgroundImage: `linear-gradient(180deg, ${C.goldHi} 0%, ${C.gold} 55%, #9c7a3c 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent' }}>
          37%
        </span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 668, textAlign: 'center', opacity: easeOut(prog(t, R + 1.5, R + 2.2)),
        fontFamily: EN, fontStyle: 'italic', fontSize: 34, color: C.dim, letterSpacing: '0.06em' }}>
        1 / e ≈ 36.8%
      </div>
      <Subtitle t={t} at={R + 0.95} out={E - 0.1} zh="先看*37%*，再出手" en="Look at the first 37%. Then leap." y={860} size={60} />
    </AbsoluteFill>
  );
};

export { clamp };

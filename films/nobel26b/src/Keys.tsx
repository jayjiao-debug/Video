/* 《一句话，让钱变便宜》 · key frames for the "高级纪录片" look.
   Look: warm charcoal dark, letterboxed 2.39 frame, soft practical light pools, film grain, shallow-focus foregrounds,
   archival paper + typewriter, hairline data graphics with small-caps labels, documentary slates (place · date · time),
   brand gold only for the thing that matters in the shot. Everything drawn in code. One frame per composition frame. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import sim from '../sim/sim.json';

const W = 1920, H = 1080, BAR = 104; // letterbox bars (2.39 picture inside 16:9; subtitles sit in the lower bar)
const C = {
  bg: '#0d0c0b', bg2: '#171512', paper: '#e8dfcb', paperD: '#d6cbb2', ink: '#1d1a16', ink2: '#4a443b',
  cream: '#efe8da', dim: 'rgba(239,232,218,.55)', faint: 'rgba(239,232,218,.14)', hair: 'rgba(239,232,218,.22)',
  gold: '#e3b765', goldHi: '#f6d58e', goldD: '#a8782f', teal: '#7fa9a4', red: '#c0614a',
};
const F = {
  serif: '"Noto Serif CJK SC", serif', sans: '"Noto Sans CJK SC", sans-serif',
  lat: '"Cormorant Garamond", Georgia, serif', mono: '"JunoMono", "DejaVu Sans Mono", monospace', type: '"DejaVu Sans Mono", monospace',
};
const LNUM: React.CSSProperties = { fontFeatureSettings: "'lnum' 1" };

const useFonts = () => {
  const [h] = useState(() => delayRender('keys-fonts'));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '500 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '700 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '700 20px "JunoMono"']
      .map((f) => document.fonts.load(f, '一句话让钱变便宜0123456789').catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  return ok;
};

/* ---------------------------------------------------------------- shared documentary furniture */
const Grade: React.FC<{ warm?: number }> = ({ warm = 0.1 }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,.62) 100%)' }} />
    <div style={{ position: 'absolute', inset: 0, background: `rgba(255,170,90,${warm})`, mixBlendMode: 'soft-light' }} />
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain0.png')})`, backgroundSize: '1920px 1080px', opacity: 0.11, mixBlendMode: 'overlay' }} />
  </>
);
const Bars: React.FC = () => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
  </>
);
const Slate: React.FC<{ a: string; b?: string }> = ({ a, b }) => (
  <div style={{ position: 'absolute', left: 120, top: BAR + 46, fontFamily: F.mono, fontWeight: 700, fontSize: 19, letterSpacing: '0.32em', color: C.dim }}>
    {a}{b && <span style={{ color: C.gold }}>{'  ·  '}{b}</span>}
  </div>
);
const Chapter: React.FC<{ n: string; t: string }> = ({ n, t }) => (
  <div style={{ position: 'absolute', right: 120, top: BAR + 40, textAlign: 'right' }}>
    <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.gold }}>{n}</div>
    <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', color: C.dim, marginTop: 2 }}>{t}</div>
  </div>
);
const Mark: React.FC = () => (
  <div style={{ position: 'absolute', right: 56, top: 36, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
    <span style={{ color: C.gold }}>◆ </span>Juno · VIBE知识大赏
  </div>
);
const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontFamily: F.sans, fontWeight: 500, fontSize: 50, letterSpacing: '0.05em', color: C.cream, ...LNUM }}>
    {s.split(/(\[[^\]]+\])/).map((x, i) => x.startsWith('[') ? <span key={i} style={{ color: C.goldHi }}>{x.slice(1, -1)}</span> : <span key={i}>{x}</span>)}
  </div>
);
const Frame: React.FC<{ children: React.ReactNode; sub?: string; warm?: number; bg?: string }> = ({ children, sub, warm, bg = C.bg }) => (
  <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    {children}
    <Grade warm={warm} />
    <Bars />
    <Mark />
    {sub && <Sub s={sub} />}
  </AbsoluteFill>
);
const Pool: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number; col?: string }> = ({ x, y, rx, ry, o = 1, col = '255,214,150' }) => (
  <div style={{ position: 'absolute', left: x - rx, top: y - ry, width: rx * 2, height: ry * 2, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${col},${0.2 * o}), rgba(${col},${0.07 * o}) 55%, rgba(${col},0) 100%)` }} />
);

/* ---------------------------------------------------------------- K1 · the statement on the desk */
const TYPED = [
  'Information received since the Federal Open Market',
  'Committee met in June indicates that economic growth',
  'so far this year has been considerably slower than',
  'the Committee had expected. ...',
];
const K1: React.FC = () => (
  <Frame sub="2011年，美联储只说了一句话" warm={0.14}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 46% 46%, #2a241c 0%, #15120f 55%, #0b0a09 100%)' }} />
    <Pool x={860} y={430} rx={760} ry={520} o={1.3} />
    {/* out-of-focus foreground: a pen and the edge of a second sheet */}
    <div style={{ position: 'absolute', left: 1380, top: 640, width: 520, height: 26, borderRadius: 13, background: 'linear-gradient(90deg,#2a2622,#4b4136 60%,#1c1916)', transform: 'rotate(-18deg)', filter: 'blur(7px)', opacity: 0.9 }} />
    <div style={{ position: 'absolute', left: 520, top: 150, width: 960, height: 1180, transform: 'rotate(-4deg)', transformOrigin: '50% 30%' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, #efe7d4 0%, ${C.paper} 55%, #cfc3a8 100%)`, boxShadow: '0 40px 80px rgba(0,0,0,.7), 0 4px 12px rgba(0,0,0,.4)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 30% 18%, rgba(255,250,235,.55), rgba(255,250,235,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 80, top: 70, fontFamily: F.type, fontSize: 19, letterSpacing: '0.18em', color: C.ink2 }}>FOR IMMEDIATE RELEASE</div>
      <div style={{ position: 'absolute', left: 80, top: 104, fontFamily: F.type, fontSize: 19, letterSpacing: '0.12em', color: C.ink2 }}>August 9, 2011</div>
      <div style={{ position: 'absolute', left: 80, top: 168, fontFamily: F.lat, fontWeight: 700, fontSize: 34, letterSpacing: '0.04em', color: C.ink }}>Federal Reserve Press Release</div>
      <div style={{ position: 'absolute', left: 80, top: 214, width: 800, height: 1.5, background: C.ink2, opacity: 0.6 }} />
      {TYPED.map((l, i) => (
        <div key={i} style={{ position: 'absolute', left: 80, top: 252 + i * 38, fontFamily: F.type, fontSize: 21, color: C.ink, opacity: 0.55 }}>{l}</div>
      ))}
      {/* the sentence (exact wording from the statement), the key words under a gold highlighter */}
      <div style={{ position: 'absolute', left: 80, top: 430, width: 820, fontFamily: F.type, fontSize: 25, lineHeight: '46px', color: C.ink }}>
        ...currently anticipates that economic conditions ... are likely to warrant exceptionally low levels for the federal funds rate{' '}
        <span style={{ background: 'linear-gradient(180deg, rgba(227,183,101,0) 18%, rgba(227,183,101,.85) 20%, rgba(227,183,101,.85) 86%, rgba(227,183,101,0) 88%)', padding: '0 4px' }}>at least through mid-2013.</span>
      </div>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', left: 80, top: 640 + i * 38, width: 760 - i * 140, height: 12, background: C.ink, opacity: 0.12 }} />)}
    </div>
    <Slate a="WASHINGTON, D.C." b="2011.08.09  14:15" />
    <Chapter n="I" t="一句话" />
  </Frame>
);

/* ---------------------------------------------------------------- K2 · the market the same afternoon */
const K2: React.FC = () => {
  // illustrative path: drifting, then the drop after 14:15 to the record low 0.20 % (to be replaced by real intraday data)
  const pts = Array.from({ length: 60 }, (_, i) => { const t = i / 59; const base = 0.27 - 0.01 * Math.sin(i * 0.7) * (1 - t); return [t, t < 0.62 ? base : base - 0.07 * Math.min(1, (t - 0.62) / 0.12)]; });
  const X = (t: number) => 260 + t * 1180, Y = (v: number) => 760 - (v - 0.15) * 2600;
  const d = pts.map(([t, v], i) => `${i ? 'L' : 'M'}${X(t)},${Y(v)}`).join(' ');
  return (
    <Frame sub="当天，美国政府借两年钱的利息，跌到[历史最低]">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 55% 50%, #1b1916 0%, #0d0c0b 70%)' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[0.15, 0.2, 0.25, 0.3].map((v) => (
          <g key={v}>
            <line x1={260} x2={1440} y1={Y(v)} y2={Y(v)} stroke={C.hair} strokeWidth={1} strokeDasharray="2 8" />
            <text x={232} y={Y(v) + 7} textAnchor="end" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 24, ...LNUM }} fill={C.dim}>{v.toFixed(2)}%</text>
          </g>
        ))}
        <line x1={X(0.62)} x2={X(0.62)} y1={260} y2={790} stroke={C.gold} strokeOpacity={0.5} strokeWidth={1.2} />
        <text x={X(0.62) + 12} y={286} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.2em' }} fill={C.gold}>14:15 声明发布</text>
        <path d={d} fill="none" stroke={C.cream} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={X(1)} cy={Y(pts[59][1])} r={9} fill={C.goldHi} />
        <circle cx={X(1)} cy={Y(pts[59][1])} r={26} fill={C.gold} opacity={0.18} />
        <text x={X(1) + 30} y={Y(pts[59][1]) + 14} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 64, ...LNUM }} fill={C.goldHi}>0.20%</text>
        <text x={X(1) + 32} y={Y(pts[59][1]) + 52} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em' }} fill={C.gold}>历史最低</text>
        <text x={260} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, letterSpacing: '0.12em' }} fill={C.cream}>两年期美国国债利率</text>
        <text x={260} y={812} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em' }} fill={C.dim}>2011.08.09 · 走势示意（正片用当日真实数据）</text>
      </svg>
      {/* the rate that did not move */}
      <div style={{ position: 'absolute', left: 1560, top: 300, width: 240, padding: '22px 0', border: `1.5px solid ${C.hair}`, textAlign: 'center' }}>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>政策利率</div>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 58, color: C.cream, marginTop: 6, ...LNUM }}>0–0.25%</div>
        <div style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', border: `2px solid ${C.red}`, color: C.red, fontFamily: F.serif, fontWeight: 900, fontSize: 24, letterSpacing: '0.3em', transform: 'rotate(-6deg)' }}>未变</div>
      </div>
      <Slate a="NEW YORK" b="同日收盘" />
    </Frame>
  );
};

/* ---------------------------------------------------------------- K3 · title card */
const K3: React.FC = () => (
  <Frame bg="#080706">
    <Pool x={960} y={500} rx={900} ry={420} o={0.9} />
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="k3g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#9a6b2a" /></linearGradient>
      </defs>
      <circle cx={960} cy={360} r={92} fill="none" stroke={C.gold} strokeWidth={1.4} opacity={0.75} />
      <circle cx={960} cy={360} r={80} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.5} />
      <text x={960} y={352} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', ...LNUM }} fill={C.gold}>2026</text>
      <text x={960} y={388} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 19, letterSpacing: '0.35em' }} fill={C.gold}>经济学奖</text>
      <text x={960} y={590} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 112, letterSpacing: '0.04em' }} fill="url(#k3g)">《一句话，让钱变便宜》</text>
      <line x1={700} x2={1220} y1={660} y2={660} stroke={C.gold} strokeOpacity={0.45} />
      <text x={960} y={712} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>HALL · WOODFORD · 2026</text>
    </svg>
  </Frame>
);

/* ---------------------------------------------------------------- K4 · the laureates (name cards, no faces) */
const Laureate: React.FC<{ x: number; cn: string; en: string; inst: string; born: string; work: string; workSub: string }> = ({ x, cn, en, inst, born, work, workSub }) => (
  <div style={{ position: 'absolute', left: x, top: 230, width: 640, height: 600 }}>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1c1915,#121110)', border: `1px solid ${C.faint}` }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: C.gold }} />
    <div style={{ position: 'absolute', left: 48, top: 56, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.gold }}>Laureate</div>
    <div style={{ position: 'absolute', left: 48, top: 104, fontFamily: F.serif, fontWeight: 900, fontSize: 64, color: C.cream, letterSpacing: '0.04em' }}>{cn}</div>
    <div style={{ position: 'absolute', left: 50, top: 192, fontFamily: F.lat, fontWeight: 600, fontSize: 34, color: C.dim, letterSpacing: '0.04em' }}>{en}</div>
    <div style={{ position: 'absolute', left: 48, top: 262, width: 544, height: 1, background: C.hair }} />
    <div style={{ position: 'absolute', left: 48, top: 290, fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: C.cream }}>{inst}</div>
    <div style={{ position: 'absolute', left: 48, top: 340, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.dim, ...LNUM }}>{born}</div>
    {/* the work, as a small object */}
    <div style={{ position: 'absolute', left: 48, top: 420, width: 544, height: 128, background: 'linear-gradient(180deg,#e7ddc7,#d3c6a9)', boxShadow: '0 12px 30px rgba(0,0,0,.5)' }}>
      <div style={{ position: 'absolute', left: 24, top: 22, fontFamily: F.lat, fontWeight: 700, fontSize: 30, color: C.ink, ...LNUM }}>{work}</div>
      <div style={{ position: 'absolute', left: 24, top: 70, fontFamily: F.sans, fontWeight: 500, fontSize: 22, color: C.ink2, ...LNUM }}>{workSub}</div>
    </div>
  </div>
);
const K4: React.FC = () => (
  <Frame sub="得奖的是：斯坦福的罗伯特·霍尔，和哥伦比亚大学的迈克尔·伍德福德">
    <Pool x={600} y={520} rx={600} ry={460} o={0.9} />
    <Pool x={1320} y={520} rx={600} ry={460} o={0.9} />
    <Laureate x={250} cn="罗伯特·霍尔" en="Robert E. Hall" inst="斯坦福大学" born="1943年生 · 美国" work="J. Political Economy · 1978" workSub="人一辈子怎么花钱" />
    <Laureate x={1030} cn="迈克尔·伍德福德" en="Michael Woodford" inst="哥伦比亚大学" born="1955年生 · 美国" work="Interest and Prices · 2003" workSub="央行的一句话为什么管用" />
    <Slate a="STOCKHOLM" b="2026.10.12  11:45" />
  </Frame>
);

/* ---------------------------------------------------------------- K5 · the 1970s break (BLS annual averages; verify before release) */
const YRS = [1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982];
const INFL = [5.7, 4.4, 3.2, 6.2, 11.0, 9.1, 5.8, 6.5, 7.6, 11.3, 13.5, 10.3, 6.2];
const UNEMP = [4.9, 5.9, 5.6, 4.9, 5.6, 8.5, 7.7, 7.1, 6.1, 5.8, 7.1, 7.6, 9.7];
const K5: React.FC = () => {
  const X = (i: number) => 300 + i * 82, Y = (v: number) => 800 - v * 38;
  const line = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
  return (
    <Frame sub="这次却是：东西越来越贵，工作也[越来越难找]" warm={0.18}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 45%, #241c14 0%, #0d0b09 75%)' }} />
      {/* blurred background: a 1970s gas-station price sign */}
      <div style={{ position: 'absolute', left: 1500, top: 190, width: 330, height: 470, filter: 'blur(6px)', opacity: 0.4 }}>
        <div style={{ position: 'absolute', inset: 0, background: '#1f1a14', border: '6px solid #6b4b2a' }} />
        {['REGULAR', 'PREMIUM'].map((t, i) => (
          <div key={t} style={{ position: 'absolute', left: 30, top: 50 + i * 200 }}>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: '#e9b45a', letterSpacing: '0.2em' }}>{t}</div>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 96, color: '#f1e3c4' }}>{i ? '71' : '65'}<span style={{ fontSize: 50 }}>.9</span></div>
          </div>
        ))}
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {[0, 5, 10, 15].map((v) => <g key={v}><line x1={300} x2={1300} y1={Y(v)} y2={Y(v)} stroke={C.hair} strokeDasharray="2 8" /><text x={276} y={Y(v) + 7} textAnchor="end" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 24, ...LNUM }} fill={C.dim}>{v}%</text></g>)}
        {YRS.map((y, i) => i % 2 === 0 && <text key={y} x={X(i)} y={840} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 24, ...LNUM }} fill={C.dim}>{y}</text>)}
        <rect x={X(3) - 20} y={250} width={X(5) - X(3) + 40} height={560} fill={C.gold} opacity={0.06} />
        <text x={X(3) - 8} y={278} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em' }} fill={C.gold}>第一次石油危机</text>
        <path d={line(INFL)} fill="none" stroke={C.red} strokeWidth={3.4} />
        <path d={line(UNEMP)} fill="none" stroke={C.teal} strokeWidth={3.4} />
        <text x={X(12) + 18} y={Y(INFL[12]) - 4} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.red}>物价涨幅</text>
        <text x={X(12) + 18} y={Y(UNEMP[12]) + 10} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.teal}>失业率</text>
        <text x={300} y={224} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, letterSpacing: '0.12em' }} fill={C.cream}>美国 1970–1982</text>
        <text x={300} y={880} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em' }} fill={C.dim}>数据：美国劳工统计局 · 年均（发布前再核）</text>
      </svg>
      <Chapter n="II" t="老办法失灵" />
    </Frame>
  );
};

/* ---------------------------------------------------------------- K6 · Hall's equation + the simulated life */
const K6: React.FC = () => {
  const inc = (sim as any).hall.income as number[], con = (sim as any).hall.cons as number[];
  const X = (q: number) => 200 + q * 8.6, Y = (v: number) => 840 - (v - 90) * 5.2;
  const d = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
  return (
    <Frame sub="霍尔发现：只有[意外的消息]，才会改变人怎么花钱">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 40% 55%, #1a1814 0%, #0c0b0a 75%)' }} />
      {/* the 1978 paper, out of focus behind */}
      <div style={{ position: 'absolute', left: 1300, top: 430, width: 520, height: 640, background: 'linear-gradient(170deg,#e4dac4,#cbbfa3)', filter: 'blur(6px)', opacity: 0.09, transform: 'rotate(7deg)' }}>
        <div style={{ margin: 50, fontFamily: F.lat, fontWeight: 700, fontSize: 40, color: C.ink }}>Stochastic Implications of the Life Cycle–Permanent Income Hypothesis</div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={200} x2={1580} y1={Y(100)} y2={Y(100)} stroke={C.hair} strokeDasharray="2 8" />
        <path d={d(inc)} fill="none" stroke={C.teal} strokeWidth={2.2} opacity={0.85} />
        <path d={d(con)} fill="none" stroke={C.goldHi} strokeWidth={5} strokeLinejoin="round" />
        <text x={X(20) + 14} y={Y(160) + 6} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26 }} fill={C.teal}>奖金</text>
        <path d={`M${X(20) + 10},${Y(160) + 20} Q${X(26)},${Y(140)} ${X(24)},${Y(104)}`} stroke={C.teal} strokeWidth={1.4} fill="none" />
        <text x={X(24) + 12} y={Y(104) - 12} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.dim}>花钱几乎不动</text>
        <line x1={X(60)} x2={X(60)} y1={300} y2={840} stroke={C.gold} strokeOpacity={0.55} strokeDasharray="4 6" />
        <text x={X(60) + 14} y={330} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.goldHi}>涨薪的消息</text>
        <text x={X(60) + 14} y={366} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.dim}>花钱线立刻整体抬升</text>
        <text x={200} y={880} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em' }} fill={C.dim}>一个人 40 年 · 按霍尔 1978 模型模拟</text>
        <text x={200} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em' }} fill={C.teal}>— 收入</text>
        <text x={340} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em' }} fill={C.goldHi}>— 花钱</text>
      </svg>
      {/* the equation, written in gold */}
      <div style={{ position: 'absolute', right: 150, top: 220, textAlign: 'right' }}>
        <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 92, color: C.goldHi, textShadow: '0 0 30px rgba(227,183,101,.25)' }}>
          C<sub style={{ fontSize: 46 }}>t+1</sub> = C<sub style={{ fontSize: 46 }}>t</sub> + <span style={{ fontFamily: F.serif, fontStyle: 'normal', fontWeight: 900, fontSize: 70 }}>新消息</span>
        </div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, color: C.dim, marginTop: 4, letterSpacing: '0.12em' }}>明天花多少 = 今天花多少 + 意外</div>
      </div>
      <Chapter n="III" t="霍尔" />
    </Frame>
  );
};

/* ---------------------------------------------------------------- K7 · ten windows (Hall & Mishkin 1982) */
const K7: React.FC = () => {
  const hot = [3, 7];
  return (
    <Frame sub="1982年再算：十户里约有八户精打细算，另外两户[钱到手就花]" bg="#07080b" warm={0.06}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0b0f18 0%,#0a0c12 60%,#07080b 100%)' }} />
      {/* the building */}
      <div style={{ position: 'absolute', left: 460, top: 170, width: 1000, height: 820, background: 'linear-gradient(180deg,#1a1c22,#121319)', boxShadow: 'inset 0 0 0 2px #23262e' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={460} x2={1460} y1={190 + i * 20} y2={190 + i * 20} stroke="#ffffff" strokeOpacity={0.025} />)}
        <rect x={440} y={160} width={1040} height={18} fill="#22252d" />
        <rect x={1640} y={360} width={8} height={640} fill="#15171c" />
        <path d="M1644,360 q0,-40 -60,-40 h-30" stroke="#15171c" strokeWidth={8} fill="none" />
        <ellipse cx={1556} cy={330} rx={22} ry={10} fill="#ffd89a" opacity={0.9} />
        <defs><radialGradient id="k7lamp"><stop offset="0" stopColor="#ffd89a" stopOpacity=".22" /><stop offset="1" stopColor="#ffd89a" stopOpacity="0" /></radialGradient></defs>
        <ellipse cx={1556} cy={420} rx={220} ry={320} fill="url(#k7lamp)" />
      </svg>
      {[0, 1].map((row) => [0, 1, 2, 3, 4].map((col) => {
        const i = row * 5 + col, on = hot.includes(i);
        const x = 540 + col * 180, y = 250 + row * 300;
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 120, height: 190 }}>
            {on && <div style={{ position: 'absolute', left: -60, top: -60, width: 240, height: 310, background: 'radial-gradient(closest-side, rgba(255,205,120,.35), rgba(255,205,120,0))' }} />}
            <div style={{ position: 'absolute', inset: 0, background: on ? 'linear-gradient(180deg,#ffe4a8,#f0b456)' : 'linear-gradient(180deg,#3a3122,#2a241a)', border: '6px solid #0d0e12' }} />
            <div style={{ position: 'absolute', left: 54, top: 0, width: 6, height: 190, background: '#0d0e12' }} />
            <div style={{ position: 'absolute', left: -10, right: -10, top: 188, height: 8, background: '#2a2d35' }} />
            {!on && <div style={{ position: 'absolute', left: 8, top: 8, width: 40, height: 174, background: 'linear-gradient(90deg, rgba(120,90,50,.35), rgba(120,90,50,0))' }} />}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 206, textAlign: 'center', fontFamily: F.lat, fontWeight: 700, fontSize: on ? 40 : 30, color: on ? C.goldHi : C.dim, ...LNUM }}>{on ? '+1000' : '+13'}</div>
          </div>
        );
      }))}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <text x={160} y={330} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.cream}>每户发 1000</text>
        <text x={160} y={380} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 24 }} fill={C.dim}>第一个季度多花了多少</text>
        <text x={160} y={880} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em' }} fill={C.dim}>HALL & MISHKIN 1982 · 按模型示意</text>
      </svg>
      <Chapter n="III" t="霍尔" />
    </Frame>
  );
};

/* ---------------------------------------------------------------- K8 · Woodford's laboratory: three equations */
const Eq: React.FC<{ y: number; label: string; children: React.ReactNode; plain: string }> = ({ y, label, children, plain }) => (
  <div style={{ position: 'absolute', left: 300, top: y, width: 1320 }}>
    <div style={{ position: 'absolute', left: 0, top: 18, fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', color: C.dim }}>{label}</div>
    <div style={{ position: 'absolute', left: 180, top: 0, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64, color: C.cream, ...LNUM }}>{children}</div>
    <div style={{ position: 'absolute', left: 182, top: 86, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.dim }}>{plain}</div>
  </div>
);
const Ex: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: C.goldHi, textShadow: '0 0 24px rgba(246,213,142,.45)', borderBottom: `2px solid ${C.gold}` }}>{children}</span>
);
const K8: React.FC = () => (
  <Frame sub="伍德福德发现：大家觉得[明天]会涨价，今天就会涨">
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 75% at 50% 50%, #1b1a17 0%, #0b0a09 80%)' }} />
    {/* a dark glass panel, lit from above */}
    <div style={{ position: 'absolute', left: 240, top: 200, width: 1440, height: 640, background: 'linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.015))', border: `1px solid ${C.faint}`, boxShadow: '0 40px 120px rgba(0,0,0,.6)' }} />
    <div style={{ position: 'absolute', left: 240, top: 200, width: 1440, height: 2, background: 'linear-gradient(90deg, rgba(227,183,101,0), rgba(227,183,101,.7), rgba(227,183,101,0))' }} />
    <div style={{ position: 'absolute', left: 300, top: 232, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: C.gold }}>Interest and Prices · 2003</div>
    <Eq y={300} label="需求" plain="今天花多少，取决于大家对明天的预期和利率">x<sub>t</sub> = <Ex>E<sub>t</sub>x<sub>t+1</sub></Ex> − σ(i<sub>t</sub> − <Ex>E<sub>t</sub>π<sub>t+1</sub></Ex> − r<sup>n</sup>)</Eq>
    <Eq y={480} label="物价" plain="今天涨多少，取决于大家觉得明天涨多少">π<sub>t</sub> = β<Ex>E<sub>t</sub>π<sub>t+1</sub></Ex> + κx<sub>t</sub></Eq>
    <Eq y={660} label="央行" plain="物价涨了，就加息">i<sub>t</sub> = φ<sub>π</sub>π<sub>t</sub> + φ<sub>x</sub>x<sub>t</sub></Eq>
    <div style={{ position: 'absolute', right: 270, top: 236, fontFamily: F.serif, fontWeight: 700, fontSize: 24, color: C.goldHi, letterSpacing: '0.12em' }}>E = 大家的预期</div>
    <Chapter n="IV" t="伍德福德" />
  </Frame>
);

/* ---------------------------------------------------------------- K9 · the experiment: say it, don't move it */
const K9: React.FC = () => {
  const fg = (sim as any).fg;
  const X = (q: number) => 260 + q * 52, Y = (v: number) => 560 - v * 30;
  const d = (a: number[]) => a.slice(0, 25).map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
  return (
    <Frame sub="利率不用动，[话说清楚]就够了">
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 45% 50%, #1b1916 0%, #0c0b0a 75%)' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <line x1={260} x2={1520} y1={Y(0)} y2={Y(0)} stroke={C.hair} />
        <text x={236} y={Y(0) + 8} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22 }} fill={C.dim}>正常</text>
        <rect x={X(0)} y={250} width={X(8) - X(0)} height={620} fill={C.teal} opacity={0.06} />
        <text x={X(0) + 12} y={280} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em' }} fill={C.teal}>经济下滑 · 利率已经是 0</text>
        <path d={d(fg.x_no)} fill="none" stroke={C.red} strokeWidth={3.4} />
        <path d={d(fg.x_fg)} fill="none" stroke={C.goldHi} strokeWidth={5} />
        <text x={X(3)} y={Y(fg.x_no[3]) + 46} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.red}>只管今天</text>
        <text x={X(10)} y={Y(fg.x_fg[10]) - 40} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.goldHi}>先说一句"低利率会保持更久"</text>
        <text x={260} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em' }} fill={C.cream}>经济活动 · 伍德福德模型实验</text>
        <text x={260} y={900} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: '0.24em' }} fill={C.dim}>按新凯恩斯模型模拟 · 只示意方向</text>
      </svg>
      <div style={{ position: 'absolute', left: 1580, top: 330, width: 230, padding: '20px 0', border: `1.5px solid ${C.hair}`, textAlign: 'center' }}>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>利率</div>
        <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 70, color: C.cream, ...LNUM }}>0%</div>
        <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, color: C.gold, letterSpacing: '0.2em' }}>一分没动</div>
      </div>
      <Chapter n="IV" t="伍德福德" />
    </Frame>
  );
};

const KEYS = [K1, K2, K3, K4, K5, K6, K7, K8, K9];
export const KEY_COUNT = KEYS.length;
export const Keys: React.FC = () => {
  const ok = useFonts();
  const f = useCurrentFrame();
  const K = KEYS[Math.min(KEYS.length - 1, f)];
  return (
    <>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; font-weight: 500; }`}</style>
      {ok && <K />}
    </>
  );
};

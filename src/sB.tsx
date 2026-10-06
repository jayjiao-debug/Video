import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, SANS, MONO, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, hit, clamp } from './lib';
import { stageStyle, keyCam } from './camera';
import { useLook, Look } from './look';
import { Notice } from './ui';

/* Stage B (CUT.atus → CUT.dunbar): 1946, Berkson. A town of 70 people; badges for 胆囊炎 (pink) and 糖尿病 (mint),
   independent. The hospital admits each illness with the same chance (50%, independent), so two illnesses get you in
   75% of the time. Inside the hospital the two illnesses "look related" (a fourfold table, the form Berkson's paper
   was about). Stage C (CUT.dunbar → CUT.drop): Paris 2020: 343 inpatients, 15 daily smokers (4.4%) vs ~25% of France,
   a push notification "尼古丁能防新冠？", the 限购 stamp. Stage D (CUT.drop → CUT.pay), the second drop: the claim
   is struck through, smokers did worse, and the hospital door becomes a giant sieve people fall through. */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
const Stage: React.FC<{ style: React.CSSProperties | null; children: React.ReactNode }> = ({ style, children }) =>
  style ? <AbsoluteFill style={style}><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg></AbsoluteFill> : null;

export const Figure: React.FC<{ x: number; y: number; s?: number; col: string; o?: number; a?: boolean; b?: boolean; L: Look; badge?: number }> = ({ x, y, s = 1, col, o = 1, a, b, L, badge = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-16} r={8} fill={col} />
    <path d="M -13 12 C -13 -2, 13 -2, 13 12 Z" fill={col} />
    {a && <circle cx={-9} cy={-30} r={6.5 * badge} fill={L.accent} stroke="#140a17" strokeWidth={2} />}
    {b && <circle cx={9} cy={-30} r={6.5 * badge} fill={L.second} stroke="#140a17" strokeWidth={2} />}
  </g>
);

// ------------------------------------------------------------------ 1946: Berkson's hospital
// exactly independent in the town (4·25 = 10·10); admitted: 3 of 4 with both, 5 of 10 with each single illness
const ORDER = Array.from({ length: 49 }, (_, i) => i).sort((p, q) => rnd(p, 21) - rnd(q, 21));
const TOWN = Array.from({ length: 49 }, (_, i) => {
  const r = ORDER.indexOf(i);
  const a = r < 14, b = r < 4 || (r >= 14 && r < 24);
  const admit = r < 3 || (r >= 4 && r < 9) || (r >= 14 && r < 19);
  return { a, b, admit, x: 250 + (i % 7) * 86, y: 340 + Math.floor(i / 7) * 74 };
});
const ADM = TOWN.map((p, i) => (p.admit ? i : -1)).filter((i) => i >= 0);
const tab = (rows: typeof TOWN) => ({
  ab: rows.filter((p) => p.a && p.b).length, a_: rows.filter((p) => p.a && !p.b).length,
  _b: rows.filter((p) => !p.a && p.b).length, __: rows.filter((p) => !p.a && !p.b).length,
});
const T_ALL = tab(TOWN), T_HOSP = tab(TOWN.filter((p) => p.admit));
const HX = 1180, HY = 250, HW = 560, HH = 540; // hospital box
const wardPos = (k: number): [number, number] => [HX + 90 + (k % 5) * 90, HY + 220 + Math.floor(k / 5) * 90];

const Fourfold: React.FC<{ L: Look; x: number; y: number; t: ReturnType<typeof tab>; title: string; verdict: string; vcol: string; k: number }> = ({ L, x, y, t, title, verdict, vcol, k }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <text x={150} y={-30} textAnchor="middle" style={{ ...BLACK, fontSize: 30, fill: L.ink }}>{title}</text>
    <text x={-14} y={62} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, fill: L.accent }}>胆囊炎 有</text>
    <text x={-14} y={142} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, fill: L.dim }}>无</text>
    <text x={75} y={4} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, fill: L.second }}>糖尿病 有</text>
    <text x={225} y={4} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, fill: L.dim }}>无</text>
    {[[t.ab, 0, 0], [t.a_, 1, 0], [t._b, 0, 1], [t.__, 1, 1]].map(([v, c, r], j) => (
      <g key={j}>
        <rect x={c * 150} y={20 + r * 80} width={146} height={76} rx={10} fill="rgba(255,242,246,0.05)" stroke={L.faint} strokeWidth={2} />
        <text x={c * 150 + 73} y={20 + r * 80 + 52} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, fill: L.ink }}>{v}</text>
      </g>
    ))}
    <text x={150} y={232} textAnchor="middle" style={{ ...BLACK, fontSize: 34, fill: vcol }}>{verdict}</text>
  </g>
);

export const Berkson: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, CUT.atus, CUT.dunbar, [-20, 0]);
  if (!st) return null;
  const a = CUT.atus;
  const cam = keyCam(T, [
    [a, 1.08, 960, 520, 960, 520], [49.4, 1.0, 960, 540, 960, 540], [52.5, 1.0, 960, 540, 960, 540], [53.2, 1.0, 960, 540, 960, 540],
    [54.6, 1.0, 960, 540, 960, 540], [55.3, 1.1, 960, 560, 960, 540],
  ]);
  // year odometer 2026 → 1946
  const yr = Math.round(lerp(2026, 1946, easeInOut(prog(T, a + 0.05, a + 0.9))));
  const yearK = easeOut(prog(T, a, a + 0.2));
  const yShrink = easeInOut(prog(T, 47.3, 47.9));
  const townK = easeOut(prog(T, 47.7, 48.3));
  const badges = easeOut(prog(T, 49.6, 50.2));
  const hosp = easeOut(prog(T, 49.7, 50.3));
  const tables = easeOut(prog(T, 52.6, 53.1)) * (1 - prog(T, 54.5, 54.9));
  const rule = easeOut(prog(T, 54.8, 55.3));
  return (
    <Stage style={st}>
      <g transform={cam.t}>
        {/* 1946 */}
        {yearK > 0 && (
          <g opacity={yearK * (1 - prog(T, 52.4, 52.7))} transform={`translate(${lerp(0, 560, yShrink)} ${lerp(0, -330, yShrink)}) scale(${lerp(1, 0.32, yShrink)})`} style={{ transformOrigin: '960px 470px', transformBox: 'view-box' } as React.CSSProperties}>
            <text x={960} y={470} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 260, fill: L.ink, filter: `drop-shadow(0 0 30px ${L.accentGlow})` }}>{yr}</text>
            <g opacity={easeOut(prog(T, a + 0.9, a + 1.3))}>
              <text x={960} y={570} textAnchor="middle" style={{ ...BLACK, fontSize: 46, fill: L.accent }}>Joseph Berkson</text>
              <text x={960} y={622} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: L.dim }}>医生 · 统计学家 · 研究医院数据</text>
            </g>
          </g>
        )}
        {/* the town */}
        {townK > 0 && (
          <g>
            <text x={230} y={250} style={{ ...BLACK, fontSize: 34, fill: L.ink }} opacity={townK}>全体人群</text>
            <g opacity={badges} transform="translate(230 286)">
              <circle cx={8} cy={-8} r={9} fill={L.accent} /><text x={24} y={0} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: L.accent }}>胆囊炎</text>
              <circle cx={130} cy={-8} r={9} fill={L.second} /><text x={146} y={0} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: L.second }}>糖尿病</text>
              <text x={270} y={0} style={{ fontFamily: SANS, fontSize: 22, fill: L.dim }}>两种病互不相干</text>
            </g>
            {TOWN.map((p, i) => {
              const k = ADM.indexOf(i);
              const go = k >= 0 ? easeInOut(prog(T, 50.4 + k * 0.08, 51.2 + k * 0.08)) : 0;
              const [wx, wy] = k >= 0 ? wardPos(k) : [p.x, p.y];
              const x = lerp(p.x, wx, go), y = lerp(p.y, wy, go) - Math.sin(Math.PI * go) * 60;
              const ill = p.a || p.b;
              const col = go > 0.5 ? L.ink : ill ? 'rgba(255,242,246,0.85)' : 'rgba(255,242,246,0.4)';
              return <Figure key={i} L={L} x={x} y={y} s={1.35} col={col} a={p.a} b={p.b} o={easeOut(prog(T, 47.7 + rnd(i, 4) * 0.6, 48.1 + rnd(i, 4) * 0.6))} badge={badges} />;
            })}
          </g>
        )}
        {/* the hospital */}
        {hosp > 0 && (
          <g opacity={hosp} transform={`translate(0 ${30 * (1 - hosp)})`}>
            <rect x={HX} y={HY} width={HW} height={HH} rx={28} fill="rgba(255,242,246,0.04)" stroke={L.ink} strokeOpacity={0.5} strokeWidth={3} />
            <rect x={HX + HW / 2 - 34} y={HY - 34} width={68} height={68} rx={12} fill={L.accent} />
            <path d={`M ${HX + HW / 2 - 18} ${HY} h 36 M ${HX + HW / 2} ${HY - 18} v 36`} stroke="#fff" strokeWidth={10} />
            <text x={HX + 40} y={HY + 90} style={{ ...BLACK, fontSize: 36, fill: L.ink }}>医院</text>
            <text x={HX + 40} y={HY + 130} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, fill: L.dim }}>住院病人</text>
            <rect x={HX - 8} y={HY + 300} width={16} height={130} rx={6} fill={L.accent} opacity={0.8} />
          </g>
        )}
        {/* inside the hospital: they look related */}
        {tables > 0 && (
          <g>
            <rect x={100} y={150} width={1720} height={720} rx={30} fill="rgba(12,6,14,0.97)" opacity={tables} />
            <g transform="translate(960 470) scale(1.25) translate(-960 -470)">
            <Fourfold L={L} x={380} y={330} t={T_ALL} title="全体人群" verdict="毫无关系" vcol={L.second} k={tables} />
            <Fourfold L={L} x={1240} y={330} t={T_HOSP} title="住院病人" verdict="看起来有关系！" vcol={L.accent} k={tables * easeOut(prog(T, 53.0, 53.4))} />
            <text x={960} y={470} textAnchor="middle" opacity={tables} style={{ ...BLACK, fontSize: 64, fill: L.dim }}>→</text>
            </g>
            <text x={960} y={800} textAnchor="middle" opacity={tables} style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>示意数据 · 伯克森 1946 年论文讨论的正是这种"四格表"</text>
          </g>
        )}
        {/* the rule */}
        {rule > 0 && (
          <g opacity={rule}>
            <rect x={140} y={170} width={1680} height={680} rx={30} fill="rgba(12,6,14,0.92)" />
            {[{ n: 1, p: 0.5, y: 380 }, { n: 2, p: 0.75, y: 600 }].map(({ n, p, y }, j) => {
              const k = easeOut(prog(T, 55.0 + j * 0.35, 55.6 + j * 0.35));
              return (
                <g key={n}>
                  <Figure L={L} x={420} y={y + 14} s={2.6} col={L.ink} a b={n === 2} />
                  <text x={520} y={y + 4} style={{ ...BLACK, fontSize: 38, fill: L.ink }}>{n === 1 ? '一种病' : '两种病'}</text>
                  <rect x={760} y={y - 30} width={800} height={44} rx={22} fill="rgba(255,242,246,0.1)" />
                  <rect x={760} y={y - 30} width={800 * p * k} height={44} rx={22} fill={n === 2 ? L.accent : L.second} style={{ filter: `drop-shadow(0 0 10px ${n === 2 ? L.accentGlow : L.secondGlow})` }} />
                  <text x={1590} y={y + 6} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, fill: L.ink }}>{Math.round(p * 100 * k)}%</text>
                </g>
              );
            })}
            <text x={760} y={260} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: L.dim }}>住院的概率（示意）</text>
          </g>
        )}
      </g>
    </Stage>
  );
};

// ------------------------------------------------------------------ Paris 2020
const NIN = 343, SMOKERS = 15; // 15 / 343 = 4.4%
const SMOKER_SET = new Set(Array.from({ length: SMOKERS }, (_, k) => Math.floor(rnd(k, 31) * NIN)));
export const Paris: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, CUT.dunbar, CUT.drop, [0, -16]);
  if (!st) return null;
  const a = CUT.dunbar;
  const cam = keyCam(T, [[a, 1, 960, 540, 960, 540], [61.0, 1, 960, 540, 960, 540], [61.9, 1.25, 620, 560, 800, 540], [64.6, 1.25, 620, 560, 800, 540], [65.4, 1, 960, 540, 960, 540]]);
  const head = easeOut(prog(T, a + 0.4, a + 0.9));
  const grid = easeOut(prog(T, 58.0, 58.8));
  const smk = easeOut(prog(T, 61.1, 61.6));
  const bar1 = easeOut(prog(T, 62.2, 63.0));
  const bar2 = easeOut(prog(T, 64.8, 65.8));
  const note = prog(T, 67.5, 67.95);
  const stamp = pop(T, 70.6, 0.22);
  const box = easeOut(prog(T, 70.4, 70.8));
  const pct = 100 * SMOKERS / NIN;
  const BX = 1180, BY = 760, BH = 520; // bars baseline and full height (= 30%)
  return (
    <Stage style={st}>
      <g transform={cam.t}>
        <g opacity={head}>
          <text x={150} y={170} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', fill: L.dim }}>2020 · 04 · 巴黎</text>
          <text x={150} y={232} style={{ ...BLACK, fontSize: 50, fill: L.ink }}>Pitié-Salpêtrière 医院</text>
          <text x={150} y={280} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: L.dim }}>{NIN} 名新冠住院病人</text>
        </g>
        {/* 343 inpatients */}
        <g opacity={grid}>
          {Array.from({ length: NIN }, (_, i) => {
            const c = i % 21, r = Math.floor(i / 21);
            const s = SMOKER_SET.has(i);
            const o = easeOut(prog(T, 58.0 + (i / NIN) * 0.8, 58.2 + (i / NIN) * 0.8));
            return <circle key={i} cx={170 + c * 40} cy={350 + r * 26} r={s ? 8 + 4 * smk : 7} fill={s && smk > 0 ? L.accent : 'rgba(255,242,246,0.45)'} opacity={o * (s ? 1 : 1 - 0.5 * smk)} style={s && smk > 0 ? { filter: `drop-shadow(0 0 8px ${L.accentGlow})` } : undefined} />;
          })}
          {smk > 0 && <text x={170} y={810} opacity={smk} style={{ ...BLACK, fontSize: 30, fill: L.accent }}>每天抽烟的：{SMOKERS} 人</text>}
        </g>
        {/* bars */}
        <line x1={BX - 40} y1={BY} x2={BX + 560} y2={BY} stroke={L.dim} strokeWidth={2} opacity={bar1} />
        {bar1 > 0 && (
          <g>
            <rect x={BX} y={BY - BH * (pct / 30) * bar1} width={200} height={BH * (pct / 30) * bar1} rx={8} fill={L.accent} style={{ filter: `drop-shadow(0 0 14px ${L.accentGlow})` }} />
            <text x={BX + 100} y={BY - BH * (pct / 30) * bar1 - 20} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, fill: L.accent }}>{(pct * bar1).toFixed(1)}%</text>
            <text x={BX + 100} y={BY + 44} textAnchor="middle" style={{ ...BLACK, fontSize: 28, fill: L.ink }}>新冠住院病人</text>
          </g>
        )}
        {bar2 > 0 && (
          <g>
            <rect x={BX + 300} y={BY - BH * (25 / 30) * bar2} width={200} height={BH * (25 / 30) * bar2} rx={8} fill="rgba(255,242,246,0.75)" />
            <text x={BX + 400} y={BY - BH * (25 / 30) * bar2 - 20} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, fill: L.ink }}>≈{Math.round(25 * bar2)}%</text>
            <text x={BX + 400} y={BY + 44} textAnchor="middle" style={{ ...BLACK, fontSize: 28, fill: L.ink }}>法国人整体</text>
          </g>
        )}
        {bar1 > 0 && <text x={BX - 40} y={BY + 90} opacity={bar1} style={{ fontFamily: SANS, fontSize: 18, fill: L.dim }}>每天吸烟比例 · Miyara 等 2020（预印本）· 法国整体约四分之一</text>}
      </g>
      {/* the push notification */}
      {note > 0 && T < 73.9 && (
        <g transform={`translate(1300 ${lerp(-120, 150, easeOut(note))})`}>
          <Notice L={L} title="尼古丁能防新冠？" body="住院病人里，吸烟者少得出奇" />
          <text x={400} y={52} textAnchor="end" style={{ fontFamily: SANS, fontSize: 16, fill: 'rgba(255,242,246,0.45)' }}>示意</text>
        </g>
      )}
      {/* 限购 */}
      {box > 0 && (<>
        <rect width={1920} height={1080} fill="rgba(8,4,10,0.6)" opacity={box} />
        <g transform={`translate(960 600) scale(${0.9 + 0.1 * box})`} opacity={box}>
          <rect x={-300} y={-150} width={600} height={300} rx={26} fill="#f6eef2" />
          <rect x={-300} y={-150} width={600} height={70} rx={26} fill={L.second} />
          <rect x={-300} y={-100} width={600} height={20} fill={L.second} />
          <text x={0} y={-102} textAnchor="middle" style={{ ...BLACK, fontSize: 36, fill: '#1b0e1f' }}>尼古丁贴片</text>
          <text x={0} y={10} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: '#1b0e1f' }}>药店 · 2020.04.25 起</text>
          <text x={0} y={70} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: '#3a2a3e' }}>每次最多一个月用量 · 禁止网购</text>
          {stamp > 0 && (
            <g transform={`rotate(-12) scale(${2.2 - 1.2 * Math.min(1, stamp)})`} opacity={Math.min(1, stamp * 2)}>
              <rect x={-150} y={-70} width={300} height={140} rx={16} fill="none" stroke="#e8283c" strokeWidth={10} />
              <text x={0} y={36} textAnchor="middle" style={{ ...BLACK, fontSize: 100, fill: '#e8283c' }}>限购</text>
            </g>
          )}
        </g>
      </>)}
    </Stage>
  );
};

// ------------------------------------------------------------------ the second drop: struck through, then the sieve
const FALL = Array.from({ length: 140 }, (_, i) => ({ x: (rnd(i, 41) - 0.5) * 1000, t0: rnd(i, 42) * 2.4, pass: rnd(i, 43) < 0.35, sick: rnd(i, 44) < 0.5 }));
export const Drop: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, CUT.drop, CUT.pay, [0, 0]);
  if (!st) return null;
  const a = CUT.drop;
  const strike = easeOut(prog(T, a + 0.05, a + 0.35));
  const flip = easeOut(prog(T, a + 0.5, a + 0.9));
  const toSieve = easeInOut(prog(T, 77.2, 77.9));
  const sv = easeOut(prog(T, 77.4, 78.0));
  const cy = 600, rx = 640, ry = 150;
  return (
    <Stage style={st}>
      {/* part 1: the claim, struck */}
      <g opacity={1 - toSieve} transform={`translate(0 ${-200 * toSieve})`}>
        <g transform="translate(960 230)">
          <Notice L={L} title="尼古丁能防新冠？" body="住院病人里，吸烟者少得出奇" />
          <line x1={-380} y1={10} x2={-380 + 760 * strike} y2={10} stroke="#e8283c" strokeWidth={10} strokeLinecap="round" />
        </g>
        <g opacity={flip} transform={`translate(960 ${560 + 30 * (1 - flip)})`}>
          <text x={-40} y={0} textAnchor="end" style={{ ...BLACK, fontSize: 92, fill: L.ink }}>吸烟者</text>
          <text x={0} y={0} style={{ ...BLACK, fontSize: 92, fill: L.accent, filter: `drop-shadow(0 0 18px ${L.accentGlow})` }}>重症风险 ↑</text>
          <text x={0} y={90} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: L.dim }}>多项研究汇总 · 尼古丁贴片临床试验：无效</text>
        </g>
      </g>
      {/* part 2: the sieve */}
      {sv > 0 && (
        <g opacity={sv}>
          {FALL.map((f, i) => {
            const t = ((T - 77.4 - f.t0) % 2.4 + 2.4) % 2.4;
            if (T < 77.4 + f.t0) return null;
            const y0 = -60, yRim = cy - 20;
            let y: number, o = 1;
            if (t < 0.6) y = lerp(y0, yRim, easeIn(t / 0.6));
            else if (f.pass) { y = yRim + (t - 0.6) * 520; o = 1 - prog(t, 1.4, 2.0); }
            else { y = yRim - Math.abs(Math.sin((t - 0.6) * 6)) * 30 * Math.exp(-(t - 0.6) * 3); o = 1 - prog(t, 1.6, 2.3); }
            const col = f.pass ? L.accent : 'rgba(255,242,246,0.75)';
            return <Figure key={i} L={L} x={960 + f.x * (y > yRim ? 0.8 : 1)} y={y} s={1.3} col={col} o={o} a={f.sick} b={!f.sick && f.pass} />;
          })}
          {/* rim + mesh */}
          <ellipse cx={960} cy={cy} rx={rx} ry={ry} fill="rgba(255,79,139,0.06)" stroke={L.accent} strokeWidth={6} style={{ filter: `drop-shadow(0 0 16px ${L.accentGlow})` }} />
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 15 }, (_, c) => {
            const u = (c - 7) / 7.6, v = (r - 4) / 4.6;
            if (u * u + v * v > 0.92) return null;
            return <ellipse key={`${r}-${c}`} cx={960 + u * rx} cy={cy + v * ry} rx={13} ry={5} fill="none" stroke={L.accent} strokeOpacity={0.55} strokeWidth={2} />;
          }))}
          <rect x={560} y={110} width={800} height={150} rx={24} fill="rgba(12,6,14,0.85)" />
          <text x={960} y={190} textAnchor="middle" style={{ ...BLACK, fontSize: 64, fill: L.ink }}>医院大门 = <tspan fill={L.accent}>筛子</tspan></text>
          <text x={960} y={236} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: L.dim }}>只看筛进来的人，看到的关系，是筛子造的</text>
        </g>
      )}
    </Stage>
  );
};
export { clamp, hit, MONO };

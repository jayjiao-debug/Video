import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, hit, pop, EN, ZH, GOLD, INK, RED } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import EUROPE from './europe.json';

/* S7, 2011 → what happened (b232–b282).
   Rauch, Göttsche, Brähler & Engel (German Economic Review 12(3), 2011) tested the EU-27 members' reported
   macroeconomic data (1999–2009) against Benford's law: Greece deviated the most; Romania, Latvia and Belgium were
   also flagged. The map is schematic (only the named countries are marked).
   The suspense: the union is checked west to east, the line holds on "是——", near misses flicker, and Greece lands
   on the strongest accent (b247, 126.0 s). The payoff: in October 2009 the new government revised the deficit from
   the forecast 3.7 % of GDP to about 12.5 % (ESM, "Safeguarding the euro"); in May 2010 the euro area and the IMF
   agreed a €110 bn rescue (€80 bn + €30 bn). */
export const S7_IN = b(232) - 0.3, S7_OUT = b(282) + 0.3;

export const LINES_S7: Line[] = [
  [b(232) + 0.1, b(240) - 0.1, '2011年，研究者检查了欧盟各国上报的数据。', 'In 2011, researchers checked the data EU members had reported.'],
  [b(240) + 0.06, b(247) - 0.12, '离本福特定律最远的，是——', "The furthest from Benford's law was..."],
  [b(247) + 0.04, b(252) - 0.1, '[希腊]。', 'Greece.'],
  [b(252) + 0.06, b(260) - 0.1, '2009年，希腊新政府承认：赤字被严重低报。', "In 2009 Greece's new government admitted the deficit had been badly understated:"],
  [b(260) + 0.06, b(268) - 0.1, '不是3.7%，而是约12.5%——三倍多。', 'not 3.7% of GDP, but about 12.5%. More than three times as much.'],
  [b(268) + 0.06, b(276) - 0.1, '2010年，欧盟和IMF紧急救助：1100亿欧元。', 'In 2010 the euro area and the IMF put together a €110 billion rescue.'],
  [b(276) + 0.06, b(282) - 0.15, '偏离不等于造假，但值得多看一眼。', "A deviation isn't proof of fraud, but it's worth a second look."],
];

type Country = { iso: string; name: string; zh: string; eu: boolean; d: string; cx: number; cy: number };
const C = EUROPE as Country[];
const EU = C.filter((c) => c.eu).sort((a, z) => a.cx - z.cx);
const FLAG = ['ROU', 'LVA', 'BEL'];
const SCAN0 = b(233), SCAN1 = b(243);
const checkedAt = (iso: string) => SCAN0 + (SCAN1 - SCAN0) * (EU.findIndex((c) => c.iso === iso) / (EU.length - 1));
const REVEAL = b(247);

export const S7: React.FC<{ T: number }> = ({ T }) => {
  if (T < S7_IN || T > S7_OUT) return null;
  const o = easeOut(prog(T, S7_IN, S7_IN + 0.6)) * (1 - easeInOut(prog(T, S7_OUT - 0.5, S7_OUT)));
  const greece = easeOut(prog(T, REVEAL, REVEAL + 0.25));
  const flags = easeOut(prog(T, b(244), b(245)));
  const toGR = easeInOut(prog(T, REVEAL + 0.1, b(251)));
  const gr = C.find((c) => c.iso === 'GRC')!;
  const s = lerp(0.92, 1.75, toGR) * (1 + 0.03 * prog(T, b(251), S7_OUT));
  // Greece ends right of centre, leaving the left for the numbers
  const X = lerp(960, 1300, toGR), Y = lerp(540 + 150 * 0.92, 470, toGR);
  const tx = (X - 960) / s - gr.cx + 960, ty = (Y - 540) / s - gr.cy + 540;
  const tx0 = 0, ty0 = -150;
  const TX = lerp(tx0, tx, toGR), TY = lerp(ty0, ty, toGR);
  const flash = hit(T, REVEAL, 0.14);
  // near misses flicker while the line waits on "是——"
  const tease = (iso: string) => (T > b(244) && T < REVEAL ? 0.5 + 0.5 * Math.sin((T - b(244)) * 9 + iso.length) : 0);
  const panel = easeOut(prog(T, b(252), b(253)));
  const actual = easeOut(prog(T, b(260) + 0.1, b(261)));
  const rescue = easeOut(prog(T, b(268) + 0.1, b(269)));
  const deficitO = panel * (1 - easeInOut(prog(T, b(268) - 0.25, b(268) + 0.2)));
  const BAR = { x: 220, bot: 700, w: 130, k: 30 }; // 1 % of GDP = 30 px
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a12', opacity: o }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960,540) scale(${s}) translate(${-960 + TX},${-540 + TY})`}>
          {C.map((c) => {
            const chk = c.eu ? easeOut(prog(T, checkedAt(c.iso), checkedAt(c.iso) + 0.35)) : 0;
            const isGR = c.iso === 'GRC', isFlag = FLAG.includes(c.iso);
            const fill = !c.eu ? '#121826' : isGR && greece > 0 ? RED : isFlag && flags > 0 ? '#e0a050' : chk > 0 ? '#3a3a3e' : '#22283a';
            const scanFlash = c.eu ? Math.max(0, 1 - Math.abs(T - checkedAt(c.iso)) / 0.35) : 0;
            return (
              <g key={c.iso}>
                <path d={c.d} fill={fill} stroke={c.eu ? '#5a6480' : '#1c2234'} strokeWidth={1.2 / s} opacity={isFlag && flags > 0 ? 0.45 + 0.4 * tease(c.iso) + 0.15 * flags : 1} />
                {scanFlash > 0 && <path d={c.d} fill={GOLD} opacity={0.5 * scanFlash} />}
              </g>
            );
          })}
          {greece > 0 && <circle cx={gr.cx} cy={gr.cy} r={(30 + 60 * prog(T, REVEAL, REVEAL + 1.2)) / s} fill="none" stroke={RED} strokeWidth={3 / s} opacity={1 - prog(T, REVEAL + 0.4, REVEAL + 1.6)} />}
        </g>
        {/* the deficit: forecast vs revised, against the euro area's 3 % ceiling */}
        {deficitO > 0.01 && (
          <g opacity={deficitO}>
            <text x={BAR.x - 20} y={185} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: INK }}>希腊 2009 年财政赤字 · 占 GDP</text>
            <line x1={BAR.x - 30} x2={BAR.x + 2 * BAR.w + 120} y1={BAR.bot - 3 * BAR.k} y2={BAR.bot - 3 * BAR.k} stroke="rgba(243,237,226,0.5)" strokeWidth={2} strokeDasharray="8 6" />
            <text x={BAR.x + 2 * BAR.w + 130} y={BAR.bot - 3 * BAR.k + 8} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.65)' }}>欧元区上限 3%</text>
            <rect x={BAR.x} y={BAR.bot - 3.7 * BAR.k} width={BAR.w} height={3.7 * BAR.k} fill="#8a8a8e" />
            <text x={BAR.x + BAR.w / 2} y={BAR.bot - 3.7 * BAR.k - 16} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: INK, fontVariantNumeric: 'lining-nums' }}>3.7%</text>
            <text x={BAR.x + BAR.w / 2} y={BAR.bot + 40} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.7)' }}>原先上报</text>
            <rect x={BAR.x + BAR.w + 60} y={BAR.bot - 12.5 * BAR.k * actual} width={BAR.w} height={12.5 * BAR.k * actual} fill={RED} />
            {actual > 0.05 && (
              <text x={BAR.x + 1.5 * BAR.w + 60} y={BAR.bot - 12.5 * BAR.k * actual - 18} textAnchor="middle" transform={`translate(${BAR.x + 1.5 * BAR.w + 60},${BAR.bot - 12.5 * BAR.k - 30}) scale(${0.7 + 0.3 * pop(T, b(260) + 0.1, 0.35)}) translate(${-(BAR.x + 1.5 * BAR.w + 60)},${-(BAR.bot - 12.5 * BAR.k - 30)})`}
                style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: RED, fontVariantNumeric: 'lining-nums' }}>≈12.5%</text>
            )}
            <text x={BAR.x + 1.5 * BAR.w + 60} y={BAR.bot + 40} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.7)' }} opacity={actual}>修正后</text>
          </g>
        )}
        {/* the rescue */}
        {rescue > 0.01 && (
          <g opacity={rescue}>
            <text x={420} y={420} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 150, fill: GOLD, fontVariantNumeric: 'lining-nums' }}>€1100<tspan fontSize={70} fontFamily={ZH}> 亿</tspan></text>
            <text x={420} y={490} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 30, fill: INK }}>2010 年 5 月 · 第一轮救助</text>
            <text x={420} y={540} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.65)' }}>欧元区各国 800 亿 + 国际货币基金组织 300 亿</text>
          </g>
        )}
      </svg>
      <AbsoluteFill style={{ backgroundColor: RED, opacity: 0.16 * flash }} />
      {/* what is being checked */}
      <div style={{ position: 'absolute', top: 120, right: 70, textAlign: 'right', opacity: easeOut(prog(T, b(234), b(235))) * (1 - easeInOut(prog(T, b(246), b(247)))) }}>
        <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, color: INK, lineHeight: 1, fontVariantNumeric: 'lining-nums' }}>1999 – 2009</div>
        <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.65)', letterSpacing: '0.1em', marginTop: 8 }}>欧盟 27 国上报的经济数据</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: ZH, fontSize: 18, color: 'rgba(243,237,226,0.42)', opacity: easeOut(prog(T, b(236), b(237))) }}>
        地图为示意 · Rauch, Göttsche, Brähler & Engel (2011) · 赤字与救助数据：欧洲稳定机制（ESM）
      </div>
      <SubBand />
      <Chapter T={T} at={b(232)} out={b(252)} text="2011 · 欧 盟 经 济 数 据" />
      <Chapter T={T} at={b(252) + 0.2} out={b(282)} text="2009 – 2010 · 希 腊 债 务 危 机" />
      <Subs T={T} lines={LINES_S7} />
    </AbsoluteFill>
  );
};

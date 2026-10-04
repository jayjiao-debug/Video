import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, EN, ZH, GOLD, INK, RED } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import EUROPE from './europe.json';

/* S7, 2011 (b232–b264): Rauch, Göttsche, Brähler & Engel (German Economic Review 12(3), 2011) tested the EU-27
   members' reported macroeconomic data (1999–2009) against Benford's law. Greece deviated the most; Romania,
   Latvia and Belgium were also flagged. The map is schematic: only the countries the study named are marked.
   One place to look at a time: the whole union is checked west to east, then the camera goes to Greece. */
export const S7_IN = b(232) - 0.3, S7_OUT = b(264) + 0.3;

export const LINES_S7: Line[] = [
  [b(232) + 0.1, b(240) - 0.1, '2011年，研究者用同一把尺子，', 'In 2011, researchers used the same ruler'],
  [b(240) + 0.06, b(248) - 0.1, '检查欧盟各国上报的经济数据。', 'on the economic data EU members had reported.'],
  [b(248) + 0.06, b(256) - 0.1, '离本福特定律最远的，是[希腊]。', "The furthest from Benford's law was Greece."],
  [b(256) + 0.06, b(264) - 0.15, '偏离不等于造假，但值得多看一眼。', "A deviation isn't proof of fraud, but it's worth a second look."],
];

type Country = { iso: string; name: string; zh: string; eu: boolean; d: string; cx: number; cy: number };
const C = EUROPE as Country[];
const EU = C.filter((c) => c.eu).sort((a, z) => a.cx - z.cx);
const FLAG = ['ROU', 'LVA', 'BEL'];
const SCAN0 = b(233), SCAN1 = b(246);
const checkedAt = (iso: string) => {
  const k = EU.findIndex((c) => c.iso === iso);
  return SCAN0 + (SCAN1 - SCAN0) * (k / (EU.length - 1));
};

export const S7: React.FC<{ T: number }> = ({ T }) => {
  if (T < S7_IN || T > S7_OUT) return null;
  const o = easeOut(prog(T, S7_IN, S7_IN + 0.6)) * (1 - easeInOut(prog(T, S7_OUT - 0.5, S7_OUT)));
  const greece = easeOut(prog(T, b(248) + 0.1, b(249)));
  const flags = easeOut(prog(T, b(249), b(250)));
  const toGR = easeInOut(prog(T, b(248), b(252)));
  const gr = C.find((c) => c.iso === 'GRC')!;
  // camera: whole union, then toward Greece (kept above the subtitles)
  const s = lerp(0.92, 1.9, toGR) * (1 + 0.03 * prog(T, b(252), S7_OUT));
  const tx = lerp(0, 960 - gr.cx, toGR), ty = lerp(-150, 430 - gr.cy, toGR);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a12', opacity: o }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960,${540}) scale(${s}) translate(${-960 + tx},${-540 + ty})`}>
          {C.map((c) => {
            const chk = c.eu ? easeOut(prog(T, checkedAt(c.iso), checkedAt(c.iso) + 0.35)) : 0;
            const isGR = c.iso === 'GRC', isFlag = FLAG.includes(c.iso);
            const fill = !c.eu ? '#121826' : isGR && greece > 0 ? RED : isFlag && flags > 0 ? '#e0a050' : chk > 0 ? '#3a3a3e' : '#22283a';
            const flash = c.eu ? Math.max(0, 1 - Math.abs(T - checkedAt(c.iso)) / 0.35) : 0;
            return (
              <g key={c.iso}>
                <path d={c.d} fill={fill} stroke={c.eu ? '#5a6480' : '#1c2234'} strokeWidth={1.2 / s} opacity={isFlag && flags > 0 ? 0.55 + 0.45 * flags : 1} />
                {flash > 0 && <path d={c.d} fill={GOLD} opacity={0.5 * flash} />}
              </g>
            );
          })}
          {/* names for the countries the study pointed at */}
          {C.filter((c) => FLAG.includes(c.iso)).map((c) => (
            <text key={c.iso} x={c.cx} y={c.cy} textAnchor="middle" opacity={flags * (1 - 0.6 * toGR)} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 22 / s, fill: '#ffd9a0' }}>{c.zh}</text>
          ))}
          {greece > 0 && (
            <g>
              <circle cx={gr.cx} cy={gr.cy} r={(30 + 50 * prog(T, b(248) + 0.1, b(250))) / s} fill="none" stroke={RED} strokeWidth={3 / s} opacity={1 - prog(T, b(249), b(251))} />
            </g>
          )}
        </g>
      </svg>
      {/* what is being checked */}
      <div style={{ position: 'absolute', top: 120, right: 70, textAlign: 'right', opacity: easeOut(prog(T, b(234), b(235))) * (1 - easeInOut(prog(T, b(248), b(249)))) }}>
        <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, color: INK, lineHeight: 1, fontVariantNumeric: 'lining-nums' }}>1999 – 2009</div>
        <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.65)', letterSpacing: '0.1em', marginTop: 8 }}>欧盟 27 国上报的经济数据</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: ZH, fontSize: 18, color: 'rgba(243,237,226,0.42)', opacity: easeOut(prog(T, b(236), b(237))) }}>
        示意 · 只标出研究点名的国家 · Rauch, Göttsche, Brähler & Engel (2011)
      </div>
      <SubBand />
      <Chapter T={T} at={b(232)} out={b(264)} text="2011 · 欧 盟 经 济 数 据" />
      <Subs T={T} lines={LINES_S7} />
    </AbsoluteFill>
  );
};

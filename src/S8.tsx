import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, EN, ZH, GOLD, INK, RED, benford } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S8 (b264–b294): which numbers follow the law. A log axis from 1 to 10^11; each kind of number is a range bar.
   Kinds that grow naturally and span many orders of magnitude (population, prices, river lengths, bills, file sizes)
   follow it. Narrow or assigned numbers don't: heights all sit between 1 and 2 metres, Chinese mobile numbers all
   start with 1 because they are assigned that way, lottery numbers are drawn evenly. Then: made-up numbers are too
   even. Ranges are indicative (示意). */
export const S8_IN = b(282) - 0.3, S8_OUT = b(294) + 0.3;

export const LINES_S8: Line[] = [
  [b(282) + 0.06, b(288) - 0.1, '自然增长、跨越数量级的数，才偏爱1；', 'Only numbers that grow naturally across orders of magnitude favour 1;'],
  [b(288) + 0.06, b(294) - 0.15, '人编的数，往往{太平均}。', 'made-up numbers tend to be too even.'],
]

const AX = { x0: 330, x1: 1560 }, DEC = 11; // 1 … 10^11
const ax = (e: number) => AX.x0 + ((AX.x1 - AX.x0) * e) / DEC; // e = log10(value)
const YES: [string, number, number][] = [['人口', 3, 9.2], ['股价（元）', 0, 3.4], ['河流长度（公里）', 1, 3.8], ['账单（元）', 0.5, 4.5], ['文件大小（KB）', 0, 7]];
const NO: [string, number, number, string][] = [['身高（米）', 0.17, 0.3, '都在 1 米几'], ['手机号', 10.1, 10.3, '规定以 1 开头'], ['彩票号', 0, 1.53, '均匀抽取']];
const TICKS = ['1', '10', '100', '1千', '1万', '10万', '100万', '1千万', '1亿', '10亿', '100亿', '1千亿'];

export const S8: React.FC<{ T: number }> = ({ T }) => {
  if (T < S8_IN || T > S8_OUT) return null;
  const o = easeOut(prog(T, S8_IN, S8_IN + 0.6)) * (1 - easeInOut(prog(T, S8_OUT - 0.5, S8_OUT)));
  const axO = 1 - easeInOut(prog(T, b(288) - 0.4, b(288) + 0.3));
  const evenO = easeOut(prog(T, b(288), b(289)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0c14', opacity: o }}>
      <svg width={1920} height={1080}>
        <defs><linearGradient id="g8" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#c8913a" /></linearGradient></defs>
        <g opacity={axO}>
          {/* the axis */}
          <line x1={AX.x0} x2={AX.x1} y1={170} y2={170} stroke="rgba(243,237,226,0.35)" strokeWidth={2} />
          {TICKS.map((t, k) => (
            <g key={k}>
              <line x1={ax(k)} x2={ax(k)} y1={162} y2={178} stroke="rgba(243,237,226,0.5)" strokeWidth={2} />
              <text x={ax(k)} y={146} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 600, fontSize: 22, fill: 'rgba(243,237,226,0.6)' }}>{t}</text>
            </g>
          ))}
          {/* kinds that follow the law: wide ranges */}
          {YES.map(([name, e0, e1], k) => {
            const a = easeOut(prog(T, b(282) + k * 0.28, b(282) + k * 0.28 + 0.5));
            const y = 230 + k * 62;
            return (
              <g key={name} opacity={a}>
                <text x={AX.x0 - 24} y={y + 9} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: INK }}>{name}</text>
                <rect x={ax(e0)} y={y - 12} width={(ax(e1) - ax(e0)) * a} height={24} rx={12} fill="url(#g8)" />
                <text x={ax(e1) + 18} y={y + 10} style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, fill: GOLD }} opacity={easeOut(prog(T, b(284), b(285)))}>✓</text>
              </g>
            );
          })}

        </g>
        {/* made-up numbers are too even */}
        {evenO > 0.01 && (
          <g opacity={evenO}>
            {[0, 1].map((side) => (
              <g key={side} transform={`translate(${side ? 1040 : 380},250)`}>
                <text x={250} y={-30} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: side ? RED : GOLD }}>{side ? '人编的数' : '真实的数'}</text>
                {Array.from({ length: 9 }, (_, k) => {
                  const h = side ? 0.111 * 1100 * (0.9 + 0.2 * ((k * 37) % 7) / 7) : benford(k + 1) * 1100;
                  return (
                    <g key={k}>
                      <rect x={k * 56} y={420 - h * easeOut(prog(T, b(288) + k * 0.04, b(288) + 0.5 + k * 0.04))} width={44} height={h * easeOut(prog(T, b(288) + k * 0.04, b(288) + 0.5 + k * 0.04))} fill={side ? RED : 'url(#g8)'} opacity={side ? 0.8 : 1} />
                      <text x={k * 56 + 22} y={456} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, fill: INK }}>{k + 1}</text>
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: ZH, fontSize: 18, color: 'rgba(243,237,226,0.42)', opacity: axO }}>范围为示意</div>
      <SubBand />
      <Chapter T={T} at={b(282)} out={b(294)} text="哪 些 数 偏 爱 1" />
      <Subs T={T} lines={LINES_S8} />
    </AbsoluteFill>
  );
};

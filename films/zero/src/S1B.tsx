import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, rnd, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S1b, the break (b96–b128; the music drops out): three sweeteners found by accident, told by objects, no actors.
   1878 saccharin: Constantin Fahlberg (Johns Hopkins, Remsen's lab) spilled a compound on his hands and found a
   roll sweet at dinner (Science History Institute, "The Pursuit of Sweet"). 1965 aspartame: James Schlatter (G.D.
   Searle, an ulcer-drug project) licked a finger to pick up a sheet of paper (Univ. of Bristol, Molecule of the Month).
   1975 sucralose: Shashikant Phadnis (Queen Elizabeth College, London, with Tate & Lyle) heard "testing" as
   "tasting" (Chemistry World). Sweetness multiples from the US FDA: saccharin 200–700×. */
export const S1B_IN = b(96) - 0.2, S1B_OUT = b(128) + 0.3;

export const LINES_S1B: Line[] = [
  [b(96) + 0.3, b(104) - 0.1, '这些甜味剂，大多是"不小心"尝出来的。', 'Most of these sweeteners were found by accident.'],
  [b(104) + 0.06, b(110) - 0.1, '1878年，手上沾的实验品：[糖精]。', '1878: a chemist found his dinner roll sweet. Saccharin.'],
  [b(110) + 0.06, b(116) - 0.1, '1965年，舔手指翻纸：[阿斯巴甜]。', '1965: a licked finger to turn a page. Aspartame.'],
  [b(116) + 0.06, b(122) - 0.1, '1975年，听错了一个词：[三氯蔗糖]。', '1975: "testing" heard as "tasting". Sucralose.'],
  [b(122) + 0.06, b(128) - 0.1, '太甜了：一点点就够，热量几乎可忽略。', 'So sweet that a trace will do, and the calories all but vanish.'],
];

const INKC = '#2a1d10', PAPER = '#efe4c8';

const Bread: React.FC = () => (
  <g>
    <ellipse cx={0} cy={70} rx={190} ry={34} fill="#d9cfbd" />
    <ellipse cx={0} cy={64} rx={170} ry={26} fill="#efe8da" />
    <path d="M-130,50 C-140,-10 -80,-60 0,-62 C80,-60 140,-10 130,50 Z" fill="#c98a43" />
    <path d="M-120,46 C-124,0 -70,-44 0,-46 C70,-44 124,0 120,46 Z" fill="#dca05a" />
    {[-60, 0, 60].map((x) => <path key={x} d={`M${x - 30},${-20} Q${x},${-40} ${x + 30},${-14}`} stroke="#a8692c" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    {/* the flask beside it */}
    <g transform="translate(230,-10)">
      <path d="M-18,-110 L18,-110 L18,-50 L62,60 Q66,74 50,74 L-50,74 Q-66,74 -62,60 L-18,-50 Z" fill="rgba(220,235,255,0.25)" stroke="#d8d0c0" strokeWidth={3} />
      <path d="M-40,20 L40,20 L58,62 Q60,70 50,70 L-50,70 Q-60,70 -58,62 Z" fill="rgba(246,207,120,0.55)" />
    </g>
  </g>
);

const Notebook: React.FC<{ lift: number }> = ({ lift }) => (
  <g>
    <rect x={-200} y={-120} width={300} height={220} fill="#e9dfc4" transform="rotate(-4)" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-180} y={-96 + i * 24} width={i % 3 === 2 ? 160 : 240} height={5} fill={INKC} opacity={0.28} transform="rotate(-4)" />)}
    {/* the sheet being picked up: its corner lifts */}
    <g transform={`translate(20,-60) rotate(${6 - 10 * lift})`}>
      <path d={`M0,0 L240,0 L240,${200 - 40 * lift} L${200 - 30 * lift},${220 + 6 * lift} L0,220 Z`} fill={PAPER} />
      <path d={`M240,${200 - 40 * lift} L${200 - 30 * lift},${220 + 6 * lift} L${215 - 10 * lift},${196 - 30 * lift} Z`} fill="#d6c9a6" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={22} y={26 + i * 26} width={i === 6 ? 110 : 190} height={5} fill={INKC} opacity={0.25} />)}
      {/* the fingertip mark, in gold */}
      <ellipse cx={206} cy={190} rx={16} ry={20} fill="none" stroke={GOLD} strokeWidth={2.5} opacity={0.9} />
      <ellipse cx={206} cy={190} rx={10} ry={13} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.7} />
      <ellipse cx={206} cy={190} rx={4} ry={6} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.6} />
    </g>
  </g>
);

const Phone: React.FC<{ ring: number }> = ({ ring }) => (
  <g transform={`rotate(${ring * 3 * Math.sin(ring * 40)})`}>
    <path d="M-150,60 L-120,-30 Q-110,-50 -80,-50 L80,-50 Q110,-50 120,-30 L150,60 Q154,80 130,80 L-130,80 Q-154,80 -150,60 Z" fill="#1c1a1a" />
    <circle cx={0} cy={20} r={52} fill="#2c2a28" stroke="#5a5650" strokeWidth={3} />
    {Array.from({ length: 10 }, (_, i) => { const a = -Math.PI * 0.15 + (i / 10) * Math.PI * 1.6; return <circle key={i} cx={Math.cos(a) * 36} cy={20 + Math.sin(a) * 36} r={8} fill="#0e0d0c" stroke="#6a665e" strokeWidth={1.5} />; })}
    <circle cx={0} cy={20} r={14} fill="#d8cfbd" />
    {/* the handset lifted a little off its cradle */}
    <g transform={`translate(0,${-74 - 10 * ring}) rotate(${-4 * ring})`}>
      <path d="M-150,0 Q-160,-26 -130,-30 L130,-30 Q160,-26 150,0 L120,14 Q100,4 80,10 L-80,10 Q-100,4 -120,14 Z" fill="#232120" />
      <ellipse cx={-128} cy={-6} rx={30} ry={20} fill="#2c2a28" /><ellipse cx={128} cy={-6} rx={30} ry={20} fill="#2c2a28" />
    </g>
  </g>
);

const ITEMS = [
  { at: b(104), year: '1878', what: '糖精', who: '康斯坦丁·法尔贝格 · 约翰斯·霍普金斯大学', mult: '200–700 倍' },
  { at: b(110), year: '1965', what: '阿斯巴甜', who: '詹姆斯·施拉特 · G.D. 西尔公司', mult: '约 200 倍' },
  { at: b(116), year: '1975', what: '三氯蔗糖', who: '沙希坎特·法德尼斯 · 伦敦伊丽莎白女王学院', mult: '约 600 倍' },
];

export const S1B: React.FC<{ T: number }> = ({ T }) => {
  if (T < S1B_IN || T > S1B_OUT) return null;
  const o = easeOut(prog(T, S1B_IN, S1B_IN + 0.6)) * (1 - easeInOut(prog(T, S1B_OUT - 0.5, S1B_OUT)));
  const row = easeInOut(prog(T, b(122), b(123) + 0.3)); // all three gather in a row
  const intro = easeOut(prog(T, b(96) + 0.4, b(97) + 0.4)) * (1 - easeInOut(prog(T, b(103), b(104))));
  return (
    <AbsoluteFill style={{ backgroundColor: '#120c07', opacity: o }}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id="s1b-pool" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#ffcf8a" stopOpacity="0.28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#2a1b10" />
        {Array.from({ length: 28 }, (_, i) => <rect key={i} x={0} y={i * 40} width={1920} height={2} fill="#1c1209" opacity={0.6} />)}
        <rect width={1920} height={1080} fill="url(#s1b-pool)" />
        {/* the opening: three empty specimen cards */}
        <g opacity={intro}>
          {[0, 1, 2].map((k) => <rect key={k} x={360 + k * 420} y={330} width={360} height={300} fill="none" stroke="rgba(246,207,120,0.35)" strokeDasharray="10 8" strokeWidth={2} />)}
          <text x={960} y={720} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 36, fill: 'rgba(243,237,226,0.6)' }}>serendipity</text>
        </g>
        {ITEMS.map((it, k) => {
          const inK = easeOut(prog(T, it.at, it.at + 0.6));
          if (inK <= 0) return null;
          const next = k < 2 ? easeInOut(prog(T, ITEMS[k + 1].at - 0.2, ITEMS[k + 1].at + 0.4)) : 0;
          const away = Math.max(next * (1 - row), 0);
          // centre stage, then off to the side, then into the final row
          const cx = lerp(lerp(960, -400, away), 380 + k * 580, row);
          const cy = lerp(470, 470, row), sc = lerp(1, 0.72, row);
          const show = inK * (1 - away);
          const local = T - it.at;
          return (
            <g key={k} opacity={Math.max(show, row)} transform={`translate(${cx},${cy + (1 - inK) * 30}) scale(${sc})`}>
              <g transform="translate(0,-40)">
                {k === 0 && <Bread />}
                {k === 1 && <Notebook lift={easeInOut(prog(local, 0.6, 2.2))} />}
                {k === 2 && <Phone ring={prog(local, 0.3, 1.4) * (1 - prog(local, 1.4, 1.6))} />}
              </g>
              <text x={0} y={-200} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 84, fill: INK, fontVariantNumeric: 'lining-nums' }}>{it.year}</text>
              <text x={0} y={150} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: GOLD }}>{it.what}</text>
              <text x={0} y={196} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.7)' }}>{it.who}</text>
              <text x={0} y={244} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: GOLD }} opacity={row}>{`甜度：蔗糖的 ${it.mult}`}</text>
              {k === 2 && local > 0.4 && row < 0.5 && (
                <g opacity={easeOut(prog(local, 0.4, 0.9)) * (1 - row * 2)}>
                  <text x={-260} y={-110} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 52, fill: INK }}>"testing"</text>
                  <text x={260} y={-110} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 52, fill: GOLD }} opacity={easeOut(prog(local, 1.4, 1.9))}>"tasting"</text>
                  <text x={0} y={-112} textAnchor="middle" style={{ fontFamily: EN, fontSize: 48, fill: 'rgba(243,237,226,0.6)' }} opacity={easeOut(prog(local, 1.2, 1.6))}>→</text>
                </g>
              )}
            </g>
          );
        })}
        {/* the dust of a quiet lab */}
        {Array.from({ length: 50 }, (_, i) => {
          const x = rnd(i, 31) * 1920, y = (rnd(i, 32) * 1080 + (T - b(96)) * (6 + rnd(i, 33) * 10)) % 1080;
          return <circle key={i} cx={x + 16 * Math.sin(T * 0.4 + i)} cy={y} r={1 + rnd(i, 34) * 2} fill="#ffe2b0" opacity={0.25 * rnd(i, 35)} />;
        })}
      </svg>
      <SubBand />
      <Chapter T={T} at={b(97)} out={b(128)} text="意 外 的 甜" />
      <Subs T={T} lines={LINES_S1B} />
    </AbsoluteFill>
  );
};

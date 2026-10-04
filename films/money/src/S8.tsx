import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S8, after (b199–b238): what happened to paper and to gold.
   A  b199–b207  $1 of 1971 buys what $8.25 buys today (US CPI; officialdata.org): eight bowls of noodles become one.
   B  b207–b219  gold: $35 an ounce in 1971, about $4,200 in early October 2026; the counter lands on the hit b212 (108.18 s).
   C  b219–b228  97% of the money in the UK is bank deposits, not notes and coins (Bank of England, Quarterly Bulletin 2014 Q1).
   D  b228–b238  the digits come loose and fall like rain (into S9's sea). */
export const S8_IN = b(199) - 0.3, S8_OUT = b(238) + 0.4;

export const LINES_S8: Line[] = [
  [b(199) + 0.06, b(207) - 0.1, '1971年的1美元，今天只剩约八分之一的购买力。', 'A dollar from 1971 now buys about an eighth of what it did.'],
  [b(207) + 0.06, b(218) - 0.1, '而1盎司黄金，从35美元涨到了[4000多美元]。', 'An ounce of gold went from $35 to over $4,000.'],
  [b(219), b(228) - 0.1, '今天，[97%]的钱，只是银行账上的数字。', 'Today, 97% of money is just numbers in bank accounts.'],
  [b(228) + 0.06, b(238) - 0.1, '你手机里的余额，也只是一行数字。', 'The balance on your phone is just a line of digits too.'],
];

const COOL = '#bcd4ff';

const Bowl: React.FC<{ x: number; y: number; s: number; o: number; steam?: number; T: number; i: number }> = ({ x, y, s, o, steam = 1, T, i }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-60,0 L60,0 Q56,46 0,52 Q-56,46 -60,0 Z" fill="#1a140f" stroke={GOLD} strokeWidth={3} />
    <path d="M-50,0 Q-30,-14 0,-10 Q30,-16 50,0" fill="none" stroke="#e8c995" strokeWidth={4} />
    <path d="M-20,52 L20,52 L16,62 L-16,62 Z" fill="#1a140f" stroke={GOLD} strokeWidth={2.5} />
    {[-22, 0, 22].map((dx, k) => (
      <path key={k} d={`M${dx},-24 q8,-12 0,-24 q-8,-12 0,-24`} fill="none" stroke="rgba(243,237,226,0.5)" strokeWidth={3} strokeLinecap="round"
        opacity={steam * (0.5 + 0.5 * Math.sin(T * 2 + k + i))} transform={`translate(0,${-4 * Math.sin(T * 1.5 + k + i)})`} />
    ))}
  </g>
);

const Bowls: React.FC<{ T: number }> = ({ T }) => {
  const t0 = b(199);
  const go = (i: number) => (i === 0 ? 0 : easeInOut(prog(T, t0 + 1.6 + (8 - i) * 0.18, t0 + 2.2 + (8 - i) * 0.18)));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <text x={960} y={250} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 34, fill: 'rgba(243,237,226,0.75)', letterSpacing: '0.12em' }} opacity={easeOut(prog(T, t0, t0 + 0.4))}>1 美元能买到的东西</text>
      {Array.from({ length: 8 }, (_, i) => {
        const appear = easeOut(prog(T, t0 + 0.15 + i * 0.08, t0 + 0.45 + i * 0.08));
        const gone = go(i);
        const x = 960 + (i - 3.5) * 190;
        return <Bowl key={i} x={lerp(x, i === 0 ? 960 : x, gone)} y={500 + gone * 30} s={0.95} o={appear * (1 - gone)} T={T} i={i} />;
      })}
      {/* the one that is left moves to the centre */}
      <g opacity={easeOut(prog(T, t0 + 2.3, t0 + 2.8))}>
        <Bowl x={960} y={500} s={1.25} o={1} T={T} i={0} />
      </g>
      <g opacity={easeOut(prog(T, t0 + 0.2, t0 + 0.6)) * (1 - prog(T, t0 + 2.0, t0 + 2.4))}>
        <text x={960} y={680} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: INK }}>1971</text>
      </g>
      <g opacity={easeOut(prog(T, t0 + 2.6, t0 + 3.0))}>
        <text x={960} y={690} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: GOLD }}>今天</text>
        <text x={960} y={740} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>按美国CPI：1971年的1美元 ≈ 今天的8.25美元</text>
      </g>
    </svg>
  );
};

/** B: two gold columns, 35 and ~4,200 */
const roll = (T: number) => {
  const t = prog(T, b(208), b(212));
  return Math.round(lerp(35, 4200, Math.pow(t, 2.2)));
};
const Columns: React.FC<{ T: number }> = ({ T }) => {
  const H = 560, base = 800, xL = 760, xR = 1160, w = 150;
  const v = roll(T);
  const hR = Math.max(4, (v / 4200) * H);
  const landed = T >= b(212);
  const p = pop(T, b(212), 0.3);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="col-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7a5318" /><stop offset="0.6" stopColor="#d9a645" /><stop offset="1" stopColor="#fff0c0" /></linearGradient>
      </defs>
      <line x1={600} y1={base} x2={1320} y2={base} stroke="rgba(243,237,226,0.3)" strokeWidth={2} />
      <rect x={xL - w / 2} y={base - (35 / 4200) * H} width={w} height={(35 / 4200) * H} fill="url(#col-g)" />
      <text x={xL} y={base - 30} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: INK }}>$35</text>
      <text x={xL} y={base + 46} textAnchor="middle" style={{ fontFamily: EN, fontSize: 30, fill: 'rgba(243,237,226,0.65)' }}>1971</text>
      <rect x={xR - w / 2} y={base - hR} width={w} height={hR} fill="url(#col-g)" style={{ filter: landed ? 'drop-shadow(0 0 30px rgba(246,207,120,0.5))' : 'none' }} />
      <text x={xR} y={base - hR - 34} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 92 * (1 + 0.12 * (landed ? p * (1 - prog(T, b(212), b(213))) : 0)), fill: GOLD, fontVariantNumeric: 'tabular-nums lining-nums' }}>
        {landed ? '$4,000+' : `$${v.toLocaleString('en-US')}`}
      </text>
      <text x={xR} y={base + 46} textAnchor="middle" style={{ fontFamily: EN, fontSize: 30, fill: 'rgba(243,237,226,0.65)' }}>2026</text>
      <text x={960} y={base + 100} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.5)' }} opacity={easeOut(prog(T, b(212), b(213)))}>每盎司黄金的美元价格 · 2026年10月初约4,200美元</text>
    </svg>
  );
};

/** C: 100 squares; 97 become digits, 3 stay notes and coins */
const CASH = new Set([12, 47, 83]);
const cellXY = (i: number) => [1060 + (i % 10) * 62, 210 + Math.floor(i / 10) * 62];
const Grid: React.FC<{ T: number; fall: number }> = ({ T, fall }) => {
  const t0 = b(219);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={1 - fall}>
        <text x={420} y={520} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 210, fill: GOLD, filter: 'drop-shadow(0 0 30px rgba(246,207,120,0.35))' }} opacity={easeOut(prog(T, t0 + 1.4, t0 + 1.8))}>97%</text>
        <text x={420} y={590} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 30, fill: INK }} opacity={easeOut(prog(T, t0 + 1.6, t0 + 2))}>是银行账上的数字</text>
        <text x={420} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }} opacity={easeOut(prog(T, t0 + 1.8, t0 + 2.2))}>以英国为例 · 英格兰银行 2014</text>
        <g opacity={easeOut(prog(T, t0 + 2.4, t0 + 2.8))}>
          <rect x={250} y={690} width={34} height={22} fill="#e8dcc0" rx={2} />
          <text x={300} y={709} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.7)' }}>3% 是纸币和硬币</text>
        </g>
      </g>
    </svg>
  );
};
const Cells: React.FC<{ T: number; fall: number }> = ({ T, fall }) => {
  const t0 = b(219);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 100 }, (_, i) => {
        const [x, y] = cellXY(i);
        const appear = easeOut(prog(T, t0 + i * 0.006, t0 + 0.3 + i * 0.006));
        const flip = CASH.has(i) ? 0 : easeInOut(prog(T, t0 + 0.6 + rnd(i, 1) * 0.9, t0 + 0.9 + rnd(i, 1) * 0.9));
        // D: everything lets go and falls, on its own clock, a little faster each row
        const tf = Math.max(0, T - (b(228) + 0.2 + rnd(i, 2) * 1.6));
        const dy = fall > 0 ? 0.5 * 2400 * tf * tf : 0;
        const digit = String(Math.floor(rnd(i, 3) * 10));
        if (CASH.has(i)) {
          return <rect key={i} x={x - 22} y={y - 14 + dy} width={44} height={28} rx={3} fill="#e8dcc0" opacity={appear * (1 - prog(T, b(228), b(229)))} />;
        }
        return (
          <g key={i} opacity={appear}>
            <rect x={x - 24} y={y - 24} width={48} height={48} rx={4} fill="none" stroke="rgba(243,237,226,0.25)" opacity={1 - flip} />
            <rect x={x - 24} y={y - 24} width={48} height={48} rx={4} fill="#e8dcc0" opacity={0.85 * (1 - flip)} />
            <text x={x} y={y + 14 + dy} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: COOL, filter: 'drop-shadow(0 0 8px rgba(160,190,255,0.7))' }} opacity={flip * (1 - prog(dy, 600, 900))}>{digit}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** D: the rain of digits across the whole frame, and a phone showing a balance */
const Rain: React.FC<{ T: number }> = ({ T }) => {
  const t0 = b(228);
  const k = easeIn(prog(T, t0 + 1.5, b(238)));
  const n = Math.floor(30 + 260 * k);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const speed = 500 + rnd(i, 1) * 700, x = rnd(i, 2) * 1920;
        const y = ((T - t0) * speed + rnd(i, 3) * 1400) % 1300 - 100;
        return <text key={i} x={x} y={y} style={{ fontFamily: EN, fontWeight: 700, fontSize: 18 + rnd(i, 4) * 26, fill: COOL }} opacity={0.15 + 0.5 * rnd(i, 5)}>{Math.floor(rnd(i, 6) * 10)}</text>;
      })}
    </svg>
  );
};
const Phone: React.FC<{ T: number }> = ({ T }) => {
  const t0 = b(228);
  const o = easeOut(prog(T, t0 + 0.4, t0 + 0.9)) * (1 - prog(T, b(236), b(238)));
  const bal = '3,286.50'; // an example balance
  return (
    <div style={{ position: 'absolute', left: 960 - 170, top: 170, width: 340, height: 640, borderRadius: 48, border: '3px solid rgba(243,237,226,0.55)', background: 'rgba(8,10,16,0.85)', opacity: o, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
      <div style={{ position: 'absolute', top: 16, left: 130, width: 80, height: 10, borderRadius: 5, background: 'rgba(243,237,226,0.3)' }} />
      <div style={{ position: 'absolute', top: 220, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.6)', letterSpacing: '0.2em' }}>余额</div>
        <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, color: COOL, marginTop: 10, textShadow: '0 0 18px rgba(160,190,255,0.5)', fontVariantNumeric: 'tabular-nums lining-nums' }}>¥{bal}</div>
      </div>
    </div>
  );
};

export const S8: React.FC<{ T: number }> = ({ T }) => {
  if (T < S8_IN || T > S8_OUT) return null;
  const o = easeOut(prog(T, S8_IN, S8_IN + 0.5)) * (1 - easeIn(prog(T, S8_OUT - 0.5, S8_OUT)));
  const shot = T < b(207) ? 'A' : T < b(219) - 0.2 ? 'B' : 'C';
  const xa = 1 - easeInOut(prog(T, b(207) - 0.25, b(207) + 0.1));
  const xb = easeInOut(prog(T, b(207) - 0.1, b(207) + 0.3)) * (1 - easeInOut(prog(T, b(219) - 0.4, b(219))));
  const fall = T > b(228) + 0.2 ? 1 : 0;
  return (
    <AbsoluteFill style={{ opacity: o, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #14110f 0%, #07070a 70%, #040406 100%)' }}>
      {/* a faint ledger grid: the stage for numbers */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
        {Array.from({ length: 33 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1080} stroke={GOLD} strokeWidth={0.6} />)}
        {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1920} y2={i * 60} stroke={GOLD} strokeWidth={0.6} />)}
      </svg>
      {shot === 'A' || xa > 0 ? <AbsoluteFill style={{ opacity: xa }}><Bowls T={T} /></AbsoluteFill> : null}
      {xb > 0 && <AbsoluteFill style={{ opacity: xb }}><Columns T={T} /></AbsoluteFill>}
      {shot === 'C' && <AbsoluteFill style={{ opacity: easeOut(prog(T, b(219) - 0.2, b(219) + 0.2)) }}><Grid T={T} fall={easeIn(prog(T, b(228), b(229)))} /><Cells T={T} fall={fall} /></AbsoluteFill>}
      {T > b(228) && <Rain T={T} />}
      {T > b(228) && <Phone T={T} />}
      <Chapter T={T} at={b(199) + 0.3} out={b(236)} text="1971年之后" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S8} />
    </AbsoluteFill>
  );
};

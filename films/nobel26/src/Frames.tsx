import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ZH, SANS, MONO, INK, DIM, GOLD, SILVER, BRONZE, RED, rnd } from './lib';
import { CornerMark } from './brand/CornerMark';

/* Style frames for 《谁会拿诺奖》 (for the owner's approval before animating):
   0 = the podium (three name plates, the favourite lit), 1 = Athey's search-ad auction, 2 = Pakes's car-substitution flows. */

const GLOW = 'rgba(241,197,109,0.6)';

/* ---------------------------------------------------------------- shared stage */
const Fonts = () => (
  <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
    .gold { background: linear-gradient(180deg, #fff3cf 0%, #f1c56d 45%, #c8913a 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }`}</style>
);
const Finish: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)' }} />
    <AbsoluteFill style={{ opacity: 0.05 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
    <CornerMark o={1} />
  </>
);
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\])/).filter(Boolean).map((seg, i) => seg.startsWith('[')
    ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center' }}>
    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)', fontVariantNumeric: 'lining-nums' }}><Rich s={s} /></span>
  </div>
);
/** dark hall: curtain folds, a reflective floor from y = floorY, spotlights */
const Hall: React.FC<{ floorY?: number; spots?: { x: number; w: number; a: number; warm?: boolean }[] }> = ({ floorY = 820, spots = [] }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05060c" /><stop offset="1" stopColor="#0d1120" /></linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a2c" /><stop offset="1" stopColor="#04050a" /></linearGradient>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
      {spots.map((s, i) => (
        <linearGradient key={i} id={`cone${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.warm ? '#ffe2a8' : '#dfe6ff'} stopOpacity={0.5 * s.a} /><stop offset="1" stopColor={s.warm ? '#ffcf7a' : '#c9d4ff'} stopOpacity={0.06 * s.a} />
        </linearGradient>
      ))}
    </defs>
    <rect width={1920} height={1080} fill="url(#wall)" />
    {/* curtain folds */}
    {Array.from({ length: 34 }, (_, i) => <rect key={i} x={i * 58} y={0} width={30} height={floorY} fill="#fff" opacity={0.012 + 0.012 * rnd(i)} />)}
    <rect y={floorY} width={1920} height={1080 - floorY} fill="url(#floor)" />
    <line x1={0} y1={floorY} x2={1920} y2={floorY} stroke="#2a3350" strokeWidth={2} opacity={0.7} />
    {spots.map((s, i) => (
      <g key={i}>
        <polygon points={`${s.x - 22},-20 ${s.x + 22},-20 ${s.x + s.w},${floorY + 30} ${s.x - s.w},${floorY + 30}`} fill={`url(#cone${i})`} filter="url(#soft)" />
        <ellipse cx={s.x} cy={floorY + 40} rx={s.w * 1.05} ry={46} fill={s.warm ? '#ffd690' : '#d8e0ff'} opacity={0.16 * s.a} filter="url(#soft)" />
        {Array.from({ length: 26 }, (_, k) => { const t = rnd(k, i + 3), y = 40 + t * (floorY - 80), half = 22 + (s.w - 22) * (y / floorY);
          return <circle key={k} cx={s.x + (rnd(k, i + 7) * 2 - 1) * half * 0.8} cy={y} r={1.2 + 2.2 * rnd(k, i + 9)} fill="#fff6dc" opacity={0.25 * s.a * rnd(k, i + 11)} />; })}
      </g>
    ))}
  </svg>
);

/* ---------------------------------------------------------------- frame 0: the podium */
type Seat = { x: number; h: number; w: number; n: string; col: string; zh: string; en: string; inst: string; lit: number; icon: 'car' | 'tax' | 'search' };
const SEATS: Seat[] = [
  { x: 560, h: 210, w: 360, n: '2', col: SILVER, zh: '理查德·布伦德尔', en: 'Richard Blundell', inst: '伦敦大学学院 UCL', lit: 0.55, icon: 'tax' },
  { x: 960, h: 300, w: 380, n: '1', col: GOLD, zh: '阿里尔·帕克斯', en: 'Ariel Pakes', inst: '哈佛大学 Harvard', lit: 1, icon: 'car' },
  { x: 1360, h: 150, w: 360, n: '3', col: BRONZE, zh: '苏珊·阿西', en: 'Susan Athey', inst: '斯坦福大学 Stanford', lit: 0.55, icon: 'search' },
];
const Icon: React.FC<{ k: Seat['icon']; c: string }> = ({ k, c }) => {
  if (k === 'car') return <path d="M -26 6 L -26 -2 L -18 -4 L -10 -14 L 10 -14 L 18 -4 L 26 -2 L 26 6 Z" fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" />;
  if (k === 'tax') return <g fill="none" stroke={c} strokeWidth={3}><rect x={-18} y={-20} width={36} height={40} rx={4} /><line x1={-10} y1={-8} x2={10} y2={-8} /><line x1={-10} y1={2} x2={10} y2={2} /><text x={0} y={16} fill={c} stroke="none" fontSize={12} textAnchor="middle" fontFamily={MONO}>%</text></g>;
  return <g fill="none" stroke={c} strokeWidth={3}><rect x={-28} y={-11} width={56} height={22} rx={11} /><circle cx={-16} cy={0} r={5} /><line x1={-12} y1={4} x2={-8} y2={8} /></g>;
};
const Podium: React.FC = () => {
  const floor = 860;
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Hall floorY={floor} spots={[{ x: 560, w: 260, a: 0.45 }, { x: 960, w: 320, a: 1, warm: true }, { x: 1360, w: 260, a: 0.45 }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {SEATS.map((s, i) => (
            <linearGradient key={i} id={`face${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2236" /><stop offset="1" stopColor="#0b0e18" /></linearGradient>
          ))}
          {SEATS.map((s, i) => (
            <radialGradient key={i} id={`medal${i}`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="0.25" stopColor={s.col} /><stop offset="1" stopColor="#3a2c18" /></radialGradient>
          ))}
        </defs>
        {SEATS.map((s, i) => {
          const top = floor - s.h, x0 = s.x - s.w / 2, d = 26; // depth of the top face
          return (
            <g key={i}>
              {/* reflection on the floor */}
              <rect x={x0} y={floor} width={s.w} height={s.h * 0.35} fill={s.col} opacity={0.035 * s.lit} />
              <polygon points={`${x0},${top} ${x0 + s.w},${top} ${x0 + s.w - 18},${top - d} ${x0 + 18},${top - d}`} fill="#2b3150" />
              <rect x={x0} y={top} width={s.w} height={s.h} fill={`url(#face${i})`} />
              <rect x={x0} y={top} width={s.w} height={4} fill={s.col} opacity={0.8 * s.lit} />
              {/* medal disc with the place numeral */}
              <circle cx={s.x} cy={top + Math.min(110, s.h * 0.48)} r={52} fill={`url(#medal${i})`} opacity={0.35 + 0.65 * s.lit} style={{ filter: s.lit > 0.9 ? `drop-shadow(0 0 22px ${GLOW})` : 'none' }} />
              <text x={s.x} y={top + Math.min(110, s.h * 0.48) + 20} textAnchor="middle" fontFamily={ZH} fontWeight={900} fontSize={58} fill="#1a1206" opacity={0.85}>{s.n}</text>
            </g>
          );
        })}
      </svg>
      {/* the standing name plates */}
      {SEATS.map((s, i) => {
        const top = floor - s.h - 26;
        return (
          <div key={i} style={{ position: 'absolute', left: s.x - 170, width: 340, top: top - 210, height: 196, borderRadius: 18, background: 'linear-gradient(180deg, rgba(24,28,46,0.94), rgba(10,12,20,0.94))',
            border: `2px solid ${s.lit > 0.9 ? GOLD : 'rgba(243,237,226,0.22)'}`, boxShadow: s.lit > 0.9 ? `0 0 46px ${GLOW}` : '0 10px 30px rgba(0,0,0,0.6)', opacity: 0.55 + 0.45 * s.lit,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width={70} height={46} viewBox="-35 -23 70 46"><Icon k={s.icon} c={s.lit > 0.9 ? GOLD : s.col} /></svg>
            <div className={s.lit > 0.9 ? 'gold' : undefined} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 40, color: s.lit > 0.9 ? undefined : INK, whiteSpace: 'nowrap' }}>{s.zh}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: '0.12em', color: DIM }}>{s.en}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 21, color: 'rgba(243,237,226,0.55)' }}>{s.inst}</div>
          </div>
        );
      })}
      <Finish />
      <Sub s="呼声最高的：[阿里尔·帕克斯]，哈佛" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- frame 1: the search-ad auction */
const BIDS = [3.2, 2.85, 2.4, 1.9, 1.75, 1.6, 1.4, 1.2, 1.05, 0.9, 0.8, 0.65, 0.55, 0.45, 0.4, 0.3];
const Auction: React.FC = () => {
  const slots = [{ y: 390, b: 3.2, name: 'A 店 · 轻量跑鞋' }, { y: 520, b: 2.85, name: 'B 店 · 专业竞速' }, { y: 650, b: 2.4, name: 'C 店 · 学生特价' }];
  return (
    <AbsoluteFill style={{ background: '#04050b' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="screen" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stopColor="#1b2a4a" stopOpacity={0.9} /><stop offset="1" stopColor="#04050b" stopOpacity={0} /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#screen)" />
        {/* the losing bids: a neat field below the slots, dimmed */}
        {BIDS.slice(3).map((b, i) => {
          const col = i % 7, row = Math.floor(i / 7), x = 420 + col * 180 + (row ? 90 : 0), y = 856 + row * 72;
          return (
            <g key={i} opacity={0.5}>
              <rect x={x - 66} y={y - 24} width={132} height={48} rx={24} fill="rgba(20,26,44,0.9)" stroke="rgba(200,210,240,0.3)" strokeWidth={2} />
              <text x={x} y={y + 10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill="#8f9abd">¥{b.toFixed(2)}</text>
              <line x1={x - 40} y1={y} x2={x + 40} y2={y} stroke="#8f9abd" strokeWidth={2} opacity={0.6} />
            </g>
          );
        })}
      </svg>
      {/* the search bar */}
      <div style={{ position: 'absolute', left: 460, width: 1000, top: 200, height: 112, borderRadius: 56, background: 'linear-gradient(180deg, rgba(36,44,70,0.95), rgba(18,22,38,0.95))', border: '2px solid rgba(243,237,226,0.3)',
        boxShadow: '0 0 60px rgba(90,130,220,0.25)', display: 'flex', alignItems: 'center', paddingLeft: 44, gap: 26 }}>
        <svg width={48} height={48} viewBox="0 0 48 48"><circle cx={20} cy={20} r={13} fill="none" stroke={INK} strokeWidth={4} /><line x1={30} y1={30} x2={42} y2={42} stroke={INK} strokeWidth={5} strokeLinecap="round" /></svg>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: INK }}>跑鞋</span>
        <span style={{ width: 4, height: 54, background: GOLD, marginLeft: -16 }} />
      </div>
      {/* the three ad slots, filled by the winning bids */}
      {slots.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: 460, width: 1000, top: s.y, height: 104, borderRadius: 18, background: 'rgba(14,18,32,0.92)', border: `2px solid ${i === 0 ? GOLD : 'rgba(241,197,109,0.45)'}`,
          boxShadow: i === 0 ? `0 0 34px ${GLOW}` : 'none', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 22 }}>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: '#1a1206', background: GOLD, borderRadius: 8, padding: '4px 12px' }}>广告位 {i + 1}</span>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK, flexGrow: 1 }}>{s.name}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: GOLD }}>¥{s.b.toFixed(2)}</span>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: DIM }}>/ 每次点击</span>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 772, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.45)' }}>其余出价 · 落选</div>
      <Finish />
      <Sub s="你每搜一次，几个广告位就[当场拍卖]" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- frame 2: where do the buyers go? */
type CarK = 'sedan' | 'hatch' | 'suv' | 'pickup';
const BODY: Record<CarK, [number, number][]> = {
  sedan: [[-0.5, 0.12], [-0.5, 0.25], [-0.46, 0.29], [-0.3, 0.31], [-0.17, 0.45], [0.1, 0.46], [0.24, 0.32], [0.47, 0.28], [0.5, 0.21], [0.5, 0.12]],
  hatch: [[-0.5, 0.12], [-0.5, 0.31], [-0.44, 0.45], [0.1, 0.47], [0.25, 0.33], [0.47, 0.29], [0.5, 0.22], [0.5, 0.12]],
  suv: [[-0.5, 0.14], [-0.5, 0.5], [-0.46, 0.54], [0.12, 0.54], [0.26, 0.38], [0.47, 0.35], [0.5, 0.27], [0.5, 0.14]],
  pickup: [[-0.5, 0.15], [-0.5, 0.34], [-0.1, 0.34], [-0.08, 0.53], [0.14, 0.53], [0.27, 0.38], [0.47, 0.35], [0.5, 0.27], [0.5, 0.15]],
};
const GLASS: Record<CarK, [number, number][]> = {
  sedan: [[-0.27, 0.32], [-0.16, 0.43], [0.09, 0.44], [0.2, 0.32]],
  hatch: [[-0.4, 0.33], [-0.36, 0.43], [0.09, 0.45], [0.21, 0.33]],
  suv: [[-0.44, 0.38], [-0.42, 0.51], [0.11, 0.51], [0.22, 0.38]],
  pickup: [[-0.05, 0.37], [-0.04, 0.5], [0.13, 0.5], [0.23, 0.37]],
};
const Car: React.FC<{ x: number; y: number; L: number; k: CarK; col: string; id: string }> = ({ x, y, L, k, col, id }) => {
  const P = (pts: [number, number][]) => pts.map(([u, v]) => `${x + u * L},${y - v * L}`).join(' ');
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.35" stopColor={col} /><stop offset="1" stopColor="#0a0a10" /></linearGradient></defs>
      <ellipse cx={x} cy={y + 4} rx={L * 0.56} ry={10} fill="#000" opacity={0.55} />
      <polygon points={P(BODY[k])} fill={`url(#${id})`} stroke="#000" strokeOpacity={0.5} strokeWidth={2} strokeLinejoin="round" />
      <polygon points={P(GLASS[k])} fill="#9fb6d8" opacity={0.55} />
      <line x1={x - 0.02 * L} y1={y - 0.14 * L} x2={x - 0.02 * L} y2={y - (k === 'suv' ? 0.36 : k === 'pickup' ? 0.36 : 0.3) * L} stroke="#000" strokeOpacity={0.35} strokeWidth={2} />
      <rect x={x + 0.455 * L} y={y - (k === 'suv' || k === 'pickup' ? 0.31 : 0.25) * L} width={0.04 * L} height={0.035 * L} rx={3} fill="#fff4cf" />
      <rect x={x - 0.5 * L} y={y - (k === 'suv' ? 0.42 : k === 'pickup' ? 0.31 : k === 'hatch' ? 0.27 : 0.24) * L} width={0.025 * L} height={0.05 * L} rx={2} fill="#ff4a3a" />
      {[-0.32, 0.32].map((u) => (
        <g key={u}><circle cx={x + u * L} cy={y - 0.11 * L} r={0.11 * L} fill="#0b0b0e" /><circle cx={x + u * L} cy={y - 0.11 * L} r={0.055 * L} fill="#5b6070" /></g>
      ))}
    </g>
  );
};
const CARS: { k: CarK; col: string; label: string; flow: number }[] = [
  { k: 'sedan', col: '#c33a32', label: '这辆涨价', flow: 0 },
  { k: 'sedan', col: '#b8453c', label: '最像的轿车', flow: 1 },
  { k: 'hatch', col: '#4f7fbf', label: '两厢车', flow: 0.45 },
  { k: 'suv', col: '#58606e', label: 'SUV', flow: 0.18 },
  { k: 'pickup', col: '#7b6a4a', label: '皮卡', flow: 0.05 },
];
const Cars: React.FC = () => {
  const floor = 700, xs = [300, 640, 960, 1280, 1620], L = 270;
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Hall floorY={floor} spots={[{ x: 300, w: 230, a: 0.8, warm: true }, { x: 640, w: 230, a: 0.75, warm: true }, { x: 960, w: 200, a: 0.35 }, { x: 1280, w: 200, a: 0.3 }, { x: 1620, w: 200, a: 0.25 }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* showroom floor lines */}
        {Array.from({ length: 22 }, (_, i) => { const u = i / 21; return <line key={i} x1={960 + (u - 0.5) * 2200} y1={floor} x2={960 + (u - 0.5) * 5200} y2={1080} stroke="#fff" strokeOpacity={0.035} strokeWidth={2} />; })}
        {/* the buyers of the car whose price went up */}
        {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={300 + (rnd(i) - 0.5) * 210} cy={300 + rnd(i, 1) * 90} r={7} fill={INK} opacity={0.75} />)}
        {/* where they go: thick to the most similar car, thin to the pickup */}
        {CARS.map((c, i) => i === 0 ? null : (
          <path key={i} d={`M 330 330 C ${430 + i * 60} ${170 - i * 18}, ${xs[i] - 120} ${200 - i * 10}, ${xs[i]} ${floor - L * 0.62}`} fill="none" stroke={c.flow > 0.9 ? GOLD : '#e9e2d0'} strokeOpacity={0.25 + 0.75 * c.flow}
            strokeWidth={2 + 26 * c.flow} strokeLinecap="round" style={{ filter: c.flow > 0.9 ? `drop-shadow(0 0 12px ${GLOW})` : 'none' }} />
        ))}
        {CARS.map((c, i) => <Car key={i} x={xs[i]} y={floor} L={L} k={c.k} col={c.col} id={`car${i}`} />)}
      </svg>
      {/* price tag on the first car, labels under each */}
      <div style={{ position: 'absolute', left: 190, top: 420, padding: '8px 18px', borderRadius: 12, background: 'rgba(14,16,26,0.92)', border: `2px solid ${RED}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK }}>
        价格 <span style={{ color: RED }}>↑ 10%</span>
      </div>
      {CARS.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: xs[i] - 150, width: 300, top: floor + 28, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 34, color: i === 1 ? GOLD : i === 0 ? RED : 'rgba(243,237,226,0.7)' }}>{c.label}</div>
      ))}
      <Finish />
      <Sub s="口味不同，买家会跑向[最像的那辆]" />
    </AbsoluteFill>
  );
};

export const Frames: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fonts />
      {f === 0 && <Podium />}
      {f === 1 && <Auction />}
      {f === 2 && <Cars />}
    </AbsoluteFill>
  );
};

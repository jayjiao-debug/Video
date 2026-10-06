import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PlateShot, Shot, Rise, BigNum, Kicker, AMBER, AMBER_GLOW, STEEL, STEEL_GLOW, INK, DIM, SANS, ZH, MONO, EN, CUT, FILM_END, rnd, hit, prog, easeOut, easeIn, easeInOut, lerp, clamp } from './cine';
import { JUNO } from './brand/identity';

/* 《冰下捉鬼》 v2 (≈122 s): told as a detective story so anyone can follow it.
   The universe has been "shooting" at us for 100 years (cosmic rays); the bullets bend in magnetic fields, so we
   can't see the shooter. A witness flies straight: the neutrino. It passes through almost everything, so to catch
   it you need something huge and clear: a cubic kilometre of Antarctic ice. 2017: a witness points to the first
   shooter, a black hole 4 billion light years away. What it is for: a second pair of eyes on the universe.
   Sets drawn in code (scenes.tsx); type sits between the letterbox bars (y 128 … 952). */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
type O = React.FC<{ T: number; u: number }>;
const Chip: React.FC<{ T: number; at: number; x: number; y: number; text: string; color?: string; out?: number }> = ({ T, at, x, y, text, color = STEEL, out }) => {
  const k = easeOut(prog(T, at, at + 0.3)) * (out !== undefined ? 1 - prog(T, out, out + 0.3) : 1);
  if (k <= 0) return null;
  const w = [...text].length * 38 + 56;
  return (
    <g opacity={k} transform={`translate(${x} ${y + 16 * (1 - k)})`}>
      <rect x={0} y={-46} width={w} height={64} rx={32} fill="rgba(4,10,20,0.6)" stroke={color} strokeWidth={2} />
      <text x={28} y={0} style={{ ...BLACK, fontSize: 34, fill: color }}>{text}</text>
    </g>
  );
};

const RaysO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={0.3} text="SINCE 1912 · COSMIC RAYS" x={150} y={230} out={11.8} />
    <Rise T={T} at={0.4} text="宇宙射线" x={150} y={330} size={84} color={AMBER} glow={AMBER_GLOW} out={11.8} />
    {T > 3.7 && T < 12.1 && (
      <g opacity={easeOut(prog(T, 3.7, 4.0)) * (1 - prog(T, 11.8, 12.1))}>
        <text x={150} y={420} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>能量，最高可达人类最强加速器的</text>
        <BigNum T={T} at={3.9} to={1000000} x={150} y={530} size={100} color={AMBER} glow={AMBER_GLOW} suffix=" 倍" dur={1.2} />
      </g>
    )}
    <g opacity={easeOut(prog(T, 7.5, 7.8)) * (1 - prog(T, 11.8, 12.1))}>
      <text x={300} y={760} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: INK }}>枪手：？</text>
    </g>
    {T > 10.8 && (
      <g opacity={easeOut(prog(T, 10.8, 11.1)) * (1 - prog(T, 11.8, 12.1))}>
        <text x={1260} y={250} textAnchor="middle" style={{ ...BLACK, fontSize: 30, fill: INK }}>看起来从这里来</text>
      </g>
    )}
  </svg>
);

const PrizeO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={14.35} text="THE NOBEL PRIZE IN PHYSICS · 2026" x={1020} y={330} />
    <Rise T={T} at={14.5} text="Francis Halzen" x={1020} y={450} size={96} font={EN} weight={700} color={AMBER} glow={AMBER_GLOW} per={0.03} />
    <Rise T={T} at={14.9} text="弗朗西斯·哈尔岑" x={1024} y={530} size={46} color={INK} />
    <Rise T={T} at={15.2} text="威斯康星大学麦迪逊分校 · 1944 年生" x={1024} y={590} size={28} color={DIM} weight={700} per={0.015} />
    <g opacity={easeOut(prog(T, 17.2, 17.6))}>
      <rect x={1020} y={640} width={640} height={2} fill={AMBER} opacity={0.6} />
      <text x={1024} y={700} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, fill: INK }}>在南极冰下，找宇宙的"枪手"</text>
    </g>
  </svg>
);

const CurveO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={20.5} text="WHY WE COULDN'T FIND THE SHOOTER" x={150} y={210} />
    <text x={330} y={680} textAnchor="middle" opacity={easeOut(prog(T, 20.6, 21.0))} style={{ ...BLACK, fontSize: 30, fill: INK }}>源头</text>
    <text x={1600} y={740} textAnchor="middle" opacity={easeOut(prog(T, 20.6, 21.0))} style={{ ...BLACK, fontSize: 30, fill: INK }}>地球</text>
    <Chip T={T} at={21.2} x={700} y={260} text="宇宙射线：带电 → 被磁场掰弯" color={AMBER} out={32.2} />
    <Chip T={T} at={23.6} x={1180} y={360} text="到达方向 ≠ 来源" color={INK} out={26.2} />
    <Chip T={T} at={26.4} x={760} y={840} text="中微子 · 目击者" color={STEEL} />
    <Chip T={T} at={29.7} x={1180} y={230} text="不带电" />
    <Chip T={T} at={30.1} x={1180} y={320} text="不拐弯" />
    <Chip T={T} at={30.5} x={1180} y={410} text="几乎挡不住" />
  </svg>
);

const BodyO: O = ({ T }) => {
  const block = easeOut(prog(T, 38.5, 39.6));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={32.7} text="EVERY SECOND" x={150} y={250} out={38.3} />
      <BigNum T={T} at={32.75} to={100000000000000} x={150} y={370} size={100} color={AMBER} glow={AMBER_GLOW} suffix="" dur={1.4} out={38.3} />
      <Rise T={T} at={33.1} text="个中微子，穿过你的身体" x={155} y={440} size={38} color={INK} weight={700} out={38.3} />
      {T > 35.5 && (
        <g opacity={easeOut(prog(T, 35.5, 35.8)) * (1 - prog(T, 38.3, 38.6))}>
          <text x={1770} y={360} textAnchor="end" style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', fill: DIM }}>一辈子被撞上的概率</text>
          <text x={1770} y={500} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 150, fill: STEEL, filter: `drop-shadow(0 0 20px ${STEEL_GLOW})` }}>≈ 1/4</text>
        </g>
      )}
      {block > 0 && (
        <g opacity={block}>
          <rect x={960 - 380 * block} y={560 - 300 * block} width={760 * block} height={600 * block} fill="rgba(143,220,255,0.10)" stroke={STEEL} strokeWidth={3} style={{ filter: `drop-shadow(0 0 16px ${STEEL_GLOW})` }} />
          <text x={960} y={600} textAnchor="middle" opacity={prog(block, 0.7, 1)} style={{ ...BLACK, fontSize: 52, fill: INK }}>又大 · 又透明 · 又黑</text>
        </g>
      )}
    </svg>
  );
};

const PoleO: O = ({ T }) => {
  const mag = easeOut(prog(T, 44.0, 44.5));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={40.85} text="1988 · FRANCIS HALZEN" x={150} y={240} />
      <Rise T={T} at={41.0} text="南极冰" x={150} y={340} size={90} color={INK} />
      <Rise T={T} at={41.4} text="地球上最大、最纯、最稳定的一块冰" x={155} y={400} size={28} color={DIM} weight={700} per={0.015} />
      {mag > 0 && (
        <g opacity={mag}>
          {[{ x: 520, label: '表层：满是气泡', bub: true }, { x: 860, label: '深层：气泡被压没，透明', bub: false }].map((m, i) => (
            <g key={i} transform={`translate(${m.x} 640) scale(${0.85 + 0.15 * mag})`}>
              <circle r={120} fill={m.bub ? '#9fc0d8' : '#0e3a66'} stroke={INK} strokeWidth={3} />
              {m.bub ? Array.from({ length: 26 }, (_, k) => <circle key={k} cx={(rnd(k, 1) - 0.5) * 190} cy={(rnd(k, 2) - 0.5) * 190} r={4 + rnd(k, 3) * 10} fill="#ffffff" opacity={0.7} />)
                : <circle r={100} fill="#4fb4ff" opacity={0.18} />}
              <text x={0} y={175} textAnchor="middle" style={{ ...BLACK, fontSize: 28, fill: m.bub ? DIM : STEEL }}>{m.label}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

const DiveO: O = ({ T }) => {
  const ruler = easeOut(prog(T, 50.3, 50.9));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {ruler > 0 && (
        <g opacity={ruler}>
          <line x1={1760} y1={180} x2={1760} y2={900} stroke={INK} strokeOpacity={0.5} strokeWidth={2} />
          {[{ y: 230, t: '1450 米' }, { y: 560, t: '1950 米' }, { y: 880, t: '2450 米' }].map((m) => (
            <g key={m.t}><line x1={1740} y1={m.y} x2={1780} y2={m.y} stroke={INK} strokeWidth={2} /><text x={1720} y={m.y + 10} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 34, fill: INK }}>{m.t}</text></g>
          ))}
        </g>
      )}
      <BigNum T={T} at={52.0} to={5160} x={150} y={330} size={130} color={AMBER} glow={AMBER_GLOW} suffix="" dur={0.8} />
      {T > 52.1 && <text x={520} y={330} opacity={easeOut(prog(T, 52.1, 52.4))} style={{ ...BLACK, fontSize: 44, fill: INK }}>只"眼睛"</text>}
      {T > 52.4 && <text x={155} y={390} opacity={easeOut(prog(T, 52.4, 52.7))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>86 根线 · 每根 60 个光学传感器</text>}
      <Rise T={T} at={54.6} text="1 km³ · 2010.12" x={150} y={500} size={64} font={EN} weight={700} color={STEEL} glow={STEEL_GLOW} per={0.03} />
      <Rise T={T} at={54.9} text="一整立方公里的冰 · 造价 2.79 亿美元" x={155} y={555} size={28} color={DIM} weight={700} per={0.015} />
    </svg>
  );
};

const CubeO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={57.1} text="HOW IT SEES" x={150} y={240} />
    {T > 60.2 && <g opacity={easeOut(prog(T, 60.2, 60.5)) * (1 - prog(T, 62.2, 62.5))}>
      <Rise T={T} at={60.2} text="蓝光" x={150} y={380} size={110} color={STEEL} glow={STEEL_GLOW} />
      <Rise T={T} at={60.45} text="切伦科夫辐射" x={155} y={440} size={32} color={INK} weight={700} />
    </g>}
    {T > 62.4 && (
      <g opacity={easeOut(prog(T, 62.4, 62.8))}>
        <text x={150} y={360} style={{ ...BLACK, fontSize: 44, fill: INK }}>颜色 = 光到达的先后</text>
        <defs><linearGradient id="tgrad" x1="0" x2="1"><stop offset="0" stopColor="hsl(0 95% 60%)" /><stop offset="0.5" stopColor="hsl(115 95% 60%)" /><stop offset="1" stopColor="hsl(230 95% 60%)" /></linearGradient></defs>
        <rect x={150} y={390} width={420} height={18} rx={9} fill="url(#tgrad)" />
        <text x={150} y={445} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>先</text>
        <text x={570} y={445} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>后</text>
        <text x={150} y={520} opacity={easeOut(prog(T, 63.6, 64))} style={{ ...BLACK, fontSize: 40, fill: STEEL }}>→ 反推它从哪个方向来</text>
      </g>
    )}
  </svg>
);

const RareO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={65.3} text="NEEDLE IN A HAYSTACK" x={150} y={240} out={70.8} />
    <g opacity={easeOut(prog(T, 65.4, 65.8)) * (1 - prog(T, 70.7, 71.0))}>
      <text x={150} y={360} style={{ ...BLACK, fontSize: 60, fill: INK }}>每年 · 几十亿次闪光</text>
      {T > 67.8 && <text x={150} y={500} opacity={easeOut(prog(T, 67.8, 68.1))} style={{ fontFamily: EN, fontWeight: 700, fontSize: 130, fill: AMBER, filter: `drop-shadow(0 0 18px ${AMBER_GLOW})` }}>1 / 100,000,000</text>}
      {T > 68.1 && <text x={155} y={560} opacity={easeOut(prog(T, 68.1, 68.4))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>来自宇宙深处的中微子</text>}
    </g>
    {T > 70.95 && (
      <g opacity={easeOut(prog(T, 70.95, 71.3))}>
        <Kicker T={T} at={70.95} text="2013 · SCIENCE" x={150} y={240} />
        <BigNum T={T} at={71.0} to={28} x={150} y={400} size={170} color={AMBER} glow={AMBER_GLOW} suffix="" dur={2.2} />
        <Rise T={T} at={71.3} text="第一批来自太阳系外的高能中微子" x={155} y={470} size={32} color={INK} weight={700} per={0.015} />
      </g>
    )}
  </svg>
);

const DropO: O = ({ T }) => {
  const alert = easeOut(prog(T, 77.9, 78.3));
  const k1 = hit(T, 73.85, 0.2);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${-14 * k1 * Math.sin(T * 80)} 0)`}>
        <Kicker T={T} at={73.85} text="IceCube-170922A" x={150} y={240} />
        <Rise T={T} at={73.9} text="2017.09.22" x={150} y={360} size={100} font={EN} weight={700} color={INK} per={0.03} />
        <Rise T={T} at={74.2} text="≈ 300 TeV" x={155} y={430} size={48} font={EN} weight={700} color={AMBER} />
      </g>
      {alert > 0 && (
        <g opacity={alert}>
          <rect x={1300} y={560} width={470} height={250} rx={18} fill="rgba(4,10,20,0.75)" stroke={STEEL} strokeOpacity={0.6} strokeWidth={2} />
          <text x={1330} y={610} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', fill: '#ff6a5a' }}>● ALERT · &lt; 1 MIN</text>
          {[{ t: 78.4, s: 'Fermi 伽马射线卫星' }, { t: 79.0, s: 'MAGIC 望远镜 · 拉帕尔马' }, { t: 79.6, s: '全球天文台跟进' }].map((r, i) => (
            <g key={i} opacity={easeOut(prog(T, r.t, r.t + 0.25))}>
              <circle cx={1342} cy={660 + i * 50} r={7} fill={AMBER} />
              <text x={1362} y={669 + i * 50} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: INK }}>{r.s}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

const BlazarO: O = ({ T }) => {
  const stamp = easeOut(prog(T, 86.6, 86.9));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={81.6} text="TXS 0506+056 · BLAZAR" x={150} y={250} />
      <BigNum T={T} at={81.65} to={40} x={150} y={420} size={190} color={AMBER} glow={AMBER_GLOW} suffix="" dur={0.6} />
      {T > 81.8 && <text x={390} y={420} opacity={easeOut(prog(T, 81.8, 82.1))} style={{ ...BLACK, fontSize: 70, fill: AMBER }}>亿光年</text>}
      <Rise T={T} at={84.6} text="中心是黑洞" x={1080} y={820} size={40} color={INK} weight={900} />
      <Rise T={T} at={84.9} text="喷流正对地球" x={1080} y={880} size={40} color={STEEL} weight={900} />
      <text x={150} y={880} opacity={easeOut(prog(T, 82.2, 82.6))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: STEEL }}>地球 · IceCube</text>
      {stamp > 0 && (
        <g transform={`translate(1260 300) rotate(-10) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
          <rect x={-190} y={-60} width={380} height={110} rx={12} fill="none" stroke={AMBER} strokeWidth={6} />
          <text x={0} y={20} textAnchor="middle" style={{ ...BLACK, fontSize: 58, fill: AMBER }}>枪手 #1</text>
        </g>
      )}
    </svg>
  );
};

const GalaxyO: O = ({ T }) => {
  const nu = easeInOut(prog(T, 93.6, 95.4));
  const q = easeOut(prog(T, 97.3, 97.7));
  const eyes = easeOut(prog(T, 99.5, 100.2));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={89.7} text="2023 · SCIENCE · 10 YEARS OF DATA" x={150} y={240} out={97.0} />
      <g opacity={1 - prog(T, 97.0, 97.3)}>
        <text x={150} y={340} opacity={1 - nu} style={{ ...BLACK, fontSize: 60, fill: INK }}>可见光里的银河</text>
        <text x={150} y={340} opacity={nu} style={{ ...BLACK, fontSize: 60, fill: STEEL, filter: `drop-shadow(0 0 16px ${STEEL_GLOW})` }}>中微子里的银河</text>
      </g>
      {q > 0 && (
        <g opacity={q}>
          <rect x={0} y={128} width={1920} height={824} fill="rgba(2,6,14,0.6)" />
          <text x={960} y={330} textAnchor="middle" style={{ ...BLACK, fontSize: 76, fill: INK }}>这有什么用？</text>
          {eyes > 0 && [{ x: 700, label: '光', sub: '1609 · 第一台天文望远镜', c: AMBER, g: AMBER_GLOW }, { x: 1220, label: '中微子', sub: '2010 · IceCube', c: STEEL, g: STEEL_GLOW }].map((e, i) => {
            const k = easeOut(prog(T, 99.5 + i * 0.8, 100.1 + i * 0.8));
            return (
              <g key={i} opacity={k} transform={`translate(${e.x} 600)`}>
                <ellipse rx={150} ry={80} fill="none" stroke={e.c} strokeWidth={6} style={{ filter: `drop-shadow(0 0 14px ${e.g})` }} />
                <circle r={46} fill={e.c} opacity={0.85} />
                <circle r={18} fill="#02060e" />
                <text x={0} y={140} textAnchor="middle" style={{ ...BLACK, fontSize: 44, fill: e.c }}>{e.label}</text>
                <text x={0} y={185} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: DIM }}>{e.sub}</text>
              </g>
            );
          })}
          {T > 102.3 && <text x={960} y={470} textAnchor="middle" opacity={easeOut(prog(T, 102.3, 102.7))} style={{ ...BLACK, fontSize: 40, fill: AMBER }}>人类的第二双眼睛</text>}
        </g>
      )}
    </svg>
  );
};

const YearsO: O = ({ T }) => {
  const tl = easeInOut(prog(T, 106.0, 107.4));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={128} width={1920} height={824} fill="rgba(2,6,14,0.45)" />
      <line x1={360} y1={600} x2={360 + 1200 * tl} y2={600} stroke={AMBER} strokeWidth={6} style={{ filter: `drop-shadow(0 0 12px ${AMBER_GLOW})` }} />
      <circle cx={360} cy={600} r={14} fill={STEEL} />
      {tl > 0.95 && <circle cx={1560} cy={600} r={18} fill={AMBER} />}
      <text x={360} y={680} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 60, fill: STEEL }}>1988</text>
      <text x={360} y={730} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>一个想法</text>
      {tl > 0.95 && <>
        <text x={1560} y={680} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 60, fill: AMBER }}>2026</text>
        <text x={1560} y={730} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>诺贝尔奖</text>
      </>}
      <BigNum T={T} at={108.7} to={38} x={960} y={520} size={180} color={AMBER} glow={AMBER_GLOW} suffix="" anchor="middle" dur={0.9} />
      {T > 108.9 && <text x={1115} y={520} opacity={easeOut(prog(T, 108.9, 109.2))} style={{ ...BLACK, fontSize: 60, fill: AMBER }}>年</text>}
    </svg>
  );
};

const EndO: O = ({ T }) => {
  const t = T - CUT.end;
  const o = (x: number, d = 0.35) => easeOut(prog(t, x, x + d));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <text x={960} y={200} textAnchor="middle" opacity={o(0.1)} style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.6em', fill: DIM }}>NOBEL PRIZE IN PHYSICS 2026</text>
      <text x={960} y={300} textAnchor="middle" opacity={o(0)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 110, fill: AMBER, letterSpacing: '0.12em', filter: `drop-shadow(0 0 20px ${AMBER_GLOW})` }}>冰下捉鬼</text>
      <Rise T={T} at={CUT.end + 0.5} text="你愿意为一个想法，等38年吗？" x={960} y={470} size={62} anchor="middle" color={INK} />
      <text x={960} y={535} textAnchor="middle" opacity={o(0.9)} style={{ fontFamily: SANS, fontSize: 28, fill: DIM, letterSpacing: '0.06em' }}>评论区说说你等过最久的一件事</text>
      <g opacity={o(1.1)}>
        <rect x={960 - 330} y={590} width={660} height={56} rx={28} fill="none" stroke={AMBER} strokeOpacity={0.85} strokeWidth={2} />
        <text x={960} y={627} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', fill: INK }}>{JUNO.follow}</text>
      </g>
      <g opacity={o(1.3)} style={{ fontFamily: SANS, fontSize: 17, fill: 'rgba(238,246,251,0.5)' }}>
        <text x={960} y={730} textAnchor="middle">资料：瑞典皇家科学院 2026 年物理学奖公告 · IceCube Neutrino Observatory · Science (2013, 2018, 2023) · UW–Madison · CERN Courier · Symmetry Magazine</text>
        <text x={960} y={758} textAnchor="middle">"枪手""目击者"为比喻 · 2017 年的耀变体是首个高能中微子源的有力候选 · "100 万亿/秒""一生约 1/4"为物理学家估算 · 画面为示意绘制</text>
      </g>
      <rect width={1920} height={1080} fill="#000" opacity={black} />
    </svg>
  );
};

export const SHOTS: Shot[] = [
  { a: 0, z: CUT.intro, plate: 'rays', kb: { s: [1.0, 1.14], ox: 1430, oy: 560 }, overlay: RaysO },
  { a: CUT.intro, z: CUT.curve, plate: 'prize', kb: { s: [1.1, 1.0], x: [-40, 0] }, overlay: PrizeO },
  { a: CUT.curve, z: CUT.body, plate: 'curve', kb: { s: [1.0, 1.06] }, overlay: CurveO, focus: [1600, 560] },
  { a: CUT.body, z: CUT.pole, plate: 'body', kb: { s: [1.04, 1.12], oy: 600 }, overlay: BodyO },
  { a: CUT.pole, z: CUT.dive, plate: 'pole', kb: { s: [1.02, 1.08], x: [0, -30] }, overlay: PoleO, focus: [1360, 620] },
  { a: CUT.dive, z: CUT.cube, plate: 'pole', kb: { s: [1.0, 1.04] }, overlay: DiveO },
  { a: CUT.cube, z: CUT.rare, plate: 'cube', kb: { s: [0.92, 1.04] }, overlay: CubeO },
  { a: CUT.rare, z: CUT.drop, plate: 'event', kb: { s: [0.98, 1.04] }, overlay: RareO },
  { a: CUT.drop, z: CUT.blazar, plate: 'event', kb: { s: [1.04, 1.12] }, overlay: DropO, focus: [1000, 560] },
  { a: CUT.blazar, z: CUT.galaxy, plate: 'blazar', kb: { s: [1.3, 1.0], ox: 1260, oy: 500 }, overlay: BlazarO },
  { a: CUT.galaxy, z: CUT.years, plate: 'galaxy', kb: { s: [1.02, 1.12] }, overlay: GalaxyO },
  { a: CUT.years, z: CUT.end, plate: 'night', kb: { s: [1.0, 1.06] }, overlay: YearsO },
  { a: CUT.end, z: FILM_END + 1, plate: 'night', kb: { s: [1.08, 1.0] }, overlay: EndO },
];
export const CUTS = SHOTS.slice(1).map((s) => s.a);

/* the gold title on the music hit at 12.2 s */
export const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = CUT.title, z = a + 2.05;
  if (T < a - 0.05 || T > z + 0.3) return null;
  const out = easeInOut(prog(T, z - 0.15, z + 0.25));
  const sh = Math.sin(T * 90) * 8 * hit(T, a, 0.12);
  const k = (d: number, dur = 0.25) => easeOut(prog(T, a + d, a + d + dur));
  const chars = [...'冰下捉鬼'];
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${sh}px, 0)` }}>
      <AbsoluteFill style={{ backgroundColor: 'rgba(2,6,14,0.6)' }} />
      <svg width={1920} height={1080}>
        <text x={960} y={360} textAnchor="middle" opacity={k(0.3)} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.6em', fill: DIM }}>NOBEL PRIZE IN PHYSICS 2026</text>
        {chars.map((c, i) => {
          const kk = easeOut(prog(T, a + i * 0.05, a + i * 0.05 + 0.18));
          return <text key={i} x={960 + (i - 1.5) * 230} y={620 + (1 - kk) * 40} textAnchor="middle" opacity={kk} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 210, fill: AMBER, filter: `drop-shadow(0 0 26px ${AMBER_GLOW})` }}>{c}</text>;
        })}
        <line x1={960 - 460 * k(0.2, 0.4)} y1={690} x2={960 + 460 * k(0.2, 0.4)} y2={690} stroke={STEEL} strokeWidth={3} style={{ filter: `drop-shadow(0 0 10px ${STEEL_GLOW})` }} />
        <text x={960} y={760} textAnchor="middle" opacity={k(0.5)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', fill: DIM }}>VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};

export { clamp, PlateShot, rnd, lerp };

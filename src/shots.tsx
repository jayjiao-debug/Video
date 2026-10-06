import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PlateShot, Shot, Rise, BigNum, Kicker, AMBER, AMBER_GLOW, STEEL, STEEL_GLOW, INK, DIM, SANS, ZH, MONO, EN, fb, CUT, FILM_END, rnd, hit, prog, easeOut, easeIn, easeInOut, lerp, clamp } from './cine';
import { JUNO } from './brand/identity';

/* 《冰下捉鬼》 shot list. Sets are drawn in code (scenes.tsx); overlays are in each set's 1920×1080 frame, with type
   kept between the letterbox bars (y 128 … 952). Gold = the prize and the numbers, ice blue = the detector. */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
type O = React.FC<{ T: number; u: number }>;

const BodyO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={3.0} text="EVERY SECOND" x={150} y={300} out={7.9} />
    <BigNum T={T} at={3.05} to={100000000000000} x={150} y={420} size={110} color={AMBER} glow={AMBER_GLOW} suffix="" dur={1.6} out={7.9} />
    <Rise T={T} at={3.4} text="个中微子，穿过你的身体" x={155} y={490} size={40} color={INK} weight={700} out={7.9} />
    <g opacity={easeOut(prog(T, 5.95, 6.3)) * (1 - prog(T, 7.9, 8.1))}>
      <text x={1770} y={420} textAnchor="end" style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.3em', fill: DIM }}>你感觉到的</text>
      <text x={1770} y={560} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 160, fill: STEEL, filter: `drop-shadow(0 0 20px ${STEEL_GLOW})` }}>0</text>
    </g>
  </svg>
);

const PrizeO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={10.3} text="THE NOBEL PRIZE IN PHYSICS · 2026" x={1020} y={330} />
    <Rise T={T} at={10.5} text="Francis Halzen" x={1020} y={450} size={96} font={EN} weight={700} color={AMBER} glow={AMBER_GLOW} per={0.03} />
    <Rise T={T} at={10.9} text="弗朗西斯·哈尔岑" x={1024} y={530} size={46} color={INK} />
    <Rise T={T} at={11.2} text="威斯康星大学麦迪逊分校 · 1944 年生" x={1024} y={590} size={28} color={DIM} weight={700} per={0.015} />
    <g opacity={easeOut(prog(T, 12.6, 13.0))}>
      <rect x={1020} y={640} width={640} height={2} fill={AMBER} opacity={0.6} />
      <text x={1024} y={700} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: INK }}>IceCube 中微子天文台 · 天体物理高能中微子</text>
    </g>
  </svg>
);

const EarthO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={15.4} text="NEUTRINO · 中微子" x={150} y={250} />
    {[{ t: 17.95, s: '不带电' }, { t: 19.4, s: '几乎没有质量' }].map((c, i) => {
      const k = easeOut(prog(T, c.t, c.t + 0.3));
      return k > 0 ? (
        <g key={i} opacity={k} transform={`translate(${150} ${330 + i * 90 + 20 * (1 - k)})`}>
          <rect x={0} y={-48} width={c.s.length * 44 + 60} height={66} rx={33} fill="rgba(79,180,255,0.12)" stroke={STEEL} strokeWidth={2} />
          <text x={30} y={0} style={{ ...BLACK, fontSize: 38, fill: STEEL }}>{c.s}</text>
        </g>
      ) : null;
    })}
    <Rise T={T} at={21.1} text="直穿地球" x={1500} y={860} size={56} color={INK} />
    <Rise T={T} at={21.3} text="几乎什么都挡不住它" x={1505} y={910} size={26} color={DIM} weight={700} />
  </svg>
);

const LivesO: O = ({ T }) => {
  const bars = easeOut(prog(T, 24.4, 25.2));
  const spark = hit(T, 28.15, 0.5);
  const fade = 1 - easeIn(prog(T, 30.7, 31.2));
  const cube = easeOut(prog(T, 30.9, 32.2));
  const X0 = 360, X1 = 1500;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={fade}>
        <Kicker T={T} at={24.5} text="ONE LIFETIME · 80 YEARS" x={X0} y={250} />
        {[0, 1, 2, 3].map((i) => {
          const y = 330 + i * 130, hitHere = i === 2;
          return (
            <g key={i}>
              <text x={X0 - 30} y={y + 12} textAnchor="end" style={{ ...BLACK, fontSize: 30, fill: DIM }}>{['你', 'TA', '我', '他'][i]}</text>
              <rect x={X0} y={y - 6} width={(X1 - X0) * bars} height={12} rx={6} fill="rgba(238,246,251,0.18)" />
              {T > 28.1 && hitHere && (
                <g transform={`translate(${lerp(X0, X1, 0.57)} ${y})`}>
                  <circle r={14 + 60 * (1 - spark)} fill="none" stroke={AMBER} strokeWidth={3} opacity={spark} />
                  <circle r={12} fill={AMBER} style={{ filter: `drop-shadow(0 0 14px ${AMBER_GLOW})` }} />
                </g>
              )}
              {T > 28.3 && <text x={X1 + 30} y={y + 12} opacity={easeOut(prog(T, 28.3, 28.6))} style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: hitHere ? AMBER : DIM }}>{hitHere ? '1 次' : '0 次'}</text>}
            </g>
          );
        })}
        {T > 28.2 && <text x={X1} y={880} textAnchor="end" opacity={easeOut(prog(T, 28.2, 28.5))} transform={`translate(${X1} 880) scale(${1 + 0.08 * hit(T, 28.2, 0.2)}) translate(${-X1} -880)`} style={{ fontFamily: EN, fontWeight: 700, fontSize: 130, fill: AMBER, filter: `drop-shadow(0 0 20px ${AMBER_GLOW})` }}>≈ 1/4</text>}
      </g>
      {cube > 0 && (() => {
        const s = 40 + 320 * cube, cx = 960, cy = 560, d = s * 0.45;
        const F = [[cx - s, cy - s + d], [cx + s - d, cy - s + d], [cx + s - d, cy + s], [cx - s, cy + s]];
        const B = F.map(([x, y]) => [x + d, y - d]);
        const e = (p: number[], q: number[], k: string) => <line key={k} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={STEEL} strokeWidth={3} style={{ filter: `drop-shadow(0 0 10px ${STEEL_GLOW})` }} />;
        return (
          <g opacity={cube}>
            {[0, 1, 2, 3].map((i) => e(F[i], F[(i + 1) % 4], `f${i}`))}
            {[0, 1, 2, 3].map((i) => e(B[i], B[(i + 1) % 4], `b${i}`))}
            {[0, 1, 2, 3].map((i) => e(F[i], B[i], `c${i}`))}
            <text x={cx - d / 2} y={cy + s + 60} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 52, fill: INK }}>1 km</text>
          </g>
        );
      })()}
    </svg>
  );
};

const PoleO: O = ({ T }) => {
  const ruler = easeOut(prog(T, 40.6, 41.2));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={33.8} text="1988 · SOUTH POLE" x={150} y={250} out={39.3} />
      <Rise T={T} at={34.0} text="南极点" x={150} y={340} size={84} color={INK} out={39.3} />
      <Rise T={T} at={34.3} text="冰厚约 2800 米 · 极夜" x={155} y={400} size={28} color={DIM} weight={700} out={39.3} />
      {ruler > 0 && (
        <g opacity={ruler}>
          <line x1={1760} y1={180} x2={1760} y2={900} stroke={INK} strokeOpacity={0.5} strokeWidth={2} />
          {[{ y: 230, t: '1450 米' }, { y: 560, t: '1950 米' }, { y: 880, t: '2450 米' }].map((m) => (
            <g key={m.t}><line x1={1740} y1={m.y} x2={1780} y2={m.y} stroke={INK} strokeWidth={2} /><text x={1720} y={m.y + 10} textAnchor="end" style={{ fontFamily: EN, fontWeight: 700, fontSize: 34, fill: INK }}>{m.t}</text></g>
          ))}
        </g>
      )}
      <BigNum T={T} at={42.65} to={86} x={150} y={330} size={130} color={STEEL} glow={STEEL_GLOW} suffix="" dur={0.6} />
      {T > 42.7 && <text x={390} y={330} opacity={easeOut(prog(T, 42.7, 43))} style={{ ...BLACK, fontSize: 44, fill: INK }}>个孔</text>}
      <BigNum T={T} at={43.6} to={5160} x={150} y={480} size={130} color={AMBER} glow={AMBER_GLOW} suffix="" dur={0.8} />
      {T > 43.7 && <text x={520} y={480} opacity={easeOut(prog(T, 43.7, 44))} style={{ ...BLACK, fontSize: 44, fill: INK }}>只"眼睛"</text>}
    </svg>
  );
};

const CubeO: O = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={45.9} text="ICECUBE · 2010.12" x={150} y={240} />
    <BigNum T={T} at={46.0} to={1} x={150} y={380} size={150} color={AMBER} glow={AMBER_GLOW} suffix="" dur={0.2} />
    {T > 46.1 && <text x={250} y={380} opacity={easeOut(prog(T, 46.1, 46.4))} style={{ fontFamily: EN, fontWeight: 700, fontSize: 90, fill: AMBER }}>km³</text>}
    <Rise T={T} at={46.4} text="一整立方公里的冰" x={155} y={450} size={36} color={INK} weight={700} />
    <Rise T={T} at={47.3} text="造价 2.79 亿美元" x={155} y={505} size={28} color={DIM} weight={700} />
    {T > 53.8 && (
      <g opacity={easeOut(prog(T, 53.85, 54.2))}>
        <Rise T={T} at={53.85} text="蓝光" x={1500} y={340} size={110} color={STEEL} glow={STEEL_GLOW} />
        <Rise T={T} at={54.1} text="切伦科夫辐射" x={1505} y={400} size={32} color={INK} weight={700} />
      </g>
    )}
  </svg>
);

const EventO: O = ({ T }) => {
  const alert = easeOut(prog(T, 70.0, 70.4));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={57.1} text="2013 · SCIENCE" x={150} y={240} out={65.6} />
      <BigNum T={T} at={57.3} to={28} x={150} y={400} size={170} color={AMBER} glow={AMBER_GLOW} suffix="" dur={3.6} out={65.6} />
      <Rise T={T} at={57.6} text="个来自太阳系外的中微子" x={155} y={470} size={34} color={INK} weight={700} out={65.6} />
      {T > 61.4 && T < 65.9 && (
        <g opacity={easeOut(prog(T, 61.45, 61.8)) * (1 - prog(T, 65.4, 65.8))}>
          <text x={150} y={600} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>能量：1987 年超新星中微子 ×</text>
          <BigNum T={T} at={61.6} to={1000000} x={150} y={720} size={120} color={AMBER} glow={AMBER_GLOW} suffix="" dur={1.4} />
        </g>
      )}
      {T > 65.8 && (
        <g opacity={easeOut(prog(T, 65.85, 66.2))}>
          <Kicker T={T} at={65.85} text="IceCube-170922A" x={150} y={240} />
          <Rise T={T} at={65.9} text="2017.09.22" x={150} y={360} size={100} font={EN} weight={700} color={INK} per={0.03} />
          <Rise T={T} at={66.2} text="≈ 300 TeV" x={155} y={430} size={48} font={EN} weight={700} color={AMBER} />
        </g>
      )}
      {alert > 0 && (
        <g opacity={alert}>
          <rect x={1300} y={560} width={470} height={250} rx={18} fill="rgba(4,10,20,0.75)" stroke={STEEL} strokeOpacity={0.6} strokeWidth={2} />
          <text x={1330} y={610} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', fill: '#ff6a5a' }}>● ALERT · &lt; 1 MIN</text>
          {[{ t: 70.5, s: 'Fermi 伽马射线卫星' }, { t: 71.1, s: 'MAGIC 望远镜 · 拉帕尔马' }, { t: 71.7, s: '全球天文台跟进' }].map((r, i) => (
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
  const k1 = hit(T, 73.85, 0.2);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${-14 * k1 * Math.sin(T * 80)} 0)`}>
        <Kicker T={T} at={73.9} text="TXS 0506+056 · BLAZAR" x={150} y={250} />
        <BigNum T={T} at={73.95} to={40} x={150} y={420} size={190} color={AMBER} glow={AMBER_GLOW} suffix="" dur={0.5} />
        {T > 74.1 && <text x={390} y={420} opacity={easeOut(prog(T, 74.1, 74.4))} style={{ ...BLACK, fontSize: 70, fill: AMBER }}>亿光年</text>}
        <Rise T={T} at={77.05} text="中心是黑洞" x={1080} y={820} size={40} color={INK} weight={900} />
        <Rise T={T} at={77.3} text="喷流正对地球" x={1080} y={880} size={40} color={STEEL} weight={900} />
      </g>
      <text x={150} y={880} opacity={easeOut(prog(T, 74.5, 75))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: STEEL }}>地球 · IceCube</text>
    </svg>
  );
};

const GalaxyO: O = ({ T }) => {
  const nu = easeInOut(prog(T, 83.4, 85.2));
  const tl = easeInOut(prog(T, 89.9, 91.0));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={82.0} text="2023 · SCIENCE · 10 YEARS OF DATA" x={150} y={240} out={89.6} />
      <g opacity={(1 - prog(T, 89.4, 89.8))}>
        <text x={150} y={340} opacity={1 - nu} style={{ ...BLACK, fontSize: 60, fill: INK }}>可见光里的银河</text>
        <text x={150} y={340} opacity={nu} style={{ ...BLACK, fontSize: 60, fill: STEEL, filter: `drop-shadow(0 0 16px ${STEEL_GLOW})` }}>中微子里的银河</text>
      </g>
      {tl > 0 && (
        <g opacity={tl}>
          <rect x={0} y={128} width={1920} height={824} fill="rgba(2,6,14,0.6)" />
          <line x1={360} y1={560} x2={360 + 1200 * tl} y2={560} stroke={AMBER} strokeWidth={6} style={{ filter: `drop-shadow(0 0 12px ${AMBER_GLOW})` }} />
          <circle cx={360} cy={560} r={14} fill={STEEL} />
          <circle cx={1560} cy={560} r={tl > 0.95 ? 18 : 0} fill={AMBER} />
          <text x={360} y={640} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 60, fill: STEEL }}>1988</text>
          <text x={360} y={690} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>提出想法</text>
          {tl > 0.95 && <>
            <text x={1560} y={640} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 60, fill: AMBER }}>2026</text>
            <text x={1560} y={690} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>诺贝尔奖</text>
          </>}
          <BigNum T={T} at={90.2} to={38} x={960} y={490} size={170} color={AMBER} glow={AMBER_GLOW} suffix="" anchor="middle" dur={0.9} />
          {T > 90.4 && <text x={1110} y={490} opacity={easeOut(prog(T, 90.4, 90.7))} style={{ ...BLACK, fontSize: 60, fill: AMBER }}>年</text>}
        </g>
      )}
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
        <text x={960} y={730} textAnchor="middle">资料：瑞典皇家科学院 2026 年物理学奖公告 · IceCube Neutrino Observatory · Science (2013, 2018, 2023) · CERN Courier · Symmetry Magazine</text>
        <text x={960} y={758} textAnchor="middle">"100 万亿/秒""一生约 1/4"为物理学家估算 · 探测器与天体为示意绘制</text>
      </g>
      <rect width={1920} height={1080} fill="#000" opacity={black} />
    </svg>
  );
};

export const SHOTS: Shot[] = [
  { a: 0, z: CUT.intro, plate: 'body', kb: { s: [1.04, 1.16], y: [0, 10], oy: 600 }, overlay: BodyO },
  { a: CUT.intro, z: CUT.model, plate: 'prize', kb: { s: [1.1, 1.0], x: [-40, 0] }, overlay: PrizeO },
  { a: CUT.model, z: fb(64), plate: 'earth', kb: { s: [0.96, 1.08] }, overlay: EarthO },
  { a: fb(64), z: CUT.net, plate: 'lives', kb: { s: [1.0, 1.04] }, overlay: LivesO },
  { a: CUT.net, z: CUT.atus, plate: 'pole', kb: { s: [1.02, 1.08], x: [0, -30] }, overlay: PoleO },
  { a: CUT.atus, z: CUT.dunbar, plate: 'cube', kb: { s: [0.92, 1.06] }, overlay: CubeO },
  { a: CUT.dunbar, z: CUT.drop, plate: 'event', kb: { s: [1.0, 1.1] }, overlay: EventO },
  { a: CUT.drop, z: CUT.pay, plate: 'blazar', kb: { s: [1.3, 1.0], ox: 1260, oy: 500 }, overlay: BlazarO },
  { a: CUT.pay, z: CUT.end, plate: 'galaxy', kb: { s: [1.02, 1.12] }, overlay: GalaxyO },
  { a: CUT.end, z: FILM_END + 1, plate: 'night', kb: { s: [1.08, 1.0] }, overlay: EndO },
];
export const CUTS = SHOTS.slice(1).map((s) => s.a);

/* the gold title on the first drop */
export const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = CUT.title, z = CUT.intro;
  if (T < a - 0.05 || T > z + 0.3) return null;
  const out = easeInOut(prog(T, z - 0.15, z + 0.25));
  const sh = Math.sin(T * 90) * 8 * hit(T, a, 0.12);
  const k = (d: number, dur = 0.25) => easeOut(prog(T, a + d, a + d + dur));
  const chars = [...'冰下捉鬼'];
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${sh}px, 0)` }}>
      <AbsoluteFill style={{ backgroundColor: 'rgba(2,6,14,0.55)' }} />
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

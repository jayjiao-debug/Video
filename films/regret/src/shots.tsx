import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PlateShot, Shot, Rise, BigNum, Kicker, AMBER, AMBER_GLOW, STEEL, STEEL_GLOW, INK, DIM, SANS, ZH, MONO, EN, fb, CUT, FILM_END, rnd, hit, prog, easeOut, easeIn, easeInOut, lerp, clamp } from './cine';
import { JUNO } from './brand/identity';

/* 《没走的路》 shot list. Sets: drawn in code (scenes.tsx). Every overlay is in the plate's own
   1920×1080 frame; type sits between the letterbox bars (y 128 … 952). */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

// ------------------------------------------------------------------ overlays
const HourglassSand: React.FC<{ T: number; u: number }> = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    {Array.from({ length: 40 }, (_, i) => {
      const f = ((T * 0.9 + i / 40) % 1);
      return <circle key={i} cx={628 + Math.sin(i * 7.3) * 3} cy={lerp(400, 690, f)} r={1.6} fill="#ffe2a8" opacity={0.7 * (1 - f)} />;
    })}
  </svg>
);

const ForkLights: React.FC<{ T: number; u: number }> = ({ T }) => {
  // the fork junction and the two branches (plate coords)
  const J: [number, number] = [922, 600], Lb: [number, number] = [420, 360], Rb: [number, number] = [1480, 360];
  const along = (p: [number, number], f: number) => [lerp(J[0], p[0], f), lerp(J[1], p[1], f)];
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
      {Array.from({ length: 14 }, (_, i) => {
        const f = ((T * 0.22 + i / 14) % 1);
        const [x1, y1] = along(Lb, f), [x2, y2] = along(Rb, f);
        return (
          <g key={i}>
            <circle cx={x1} cy={y1} r={3.2 * (1 - f) + 1} fill={STEEL} opacity={0.55 * (1 - f)} />
            <circle cx={x2} cy={y2} r={4 * (1 - f) + 1.4} fill={AMBER} opacity={0.85 * (1 - f)} style={{ filter: `drop-shadow(0 0 6px ${AMBER_GLOW})` }} />
          </g>
        );
      })}
    </svg>
  );
};

const LetterQ: React.FC<{ T: number; u: number }> = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={10.4} text="1994 · CORNELL · GILOVICH & MEDVEC" x={150} y={250} />
    <Rise T={T} at={12.85} text="你这辈子，" x={150} y={420} size={96} />
    <Rise T={T} at={13.25} text="最后悔什么？" x={150} y={540} size={96} color={AMBER} glow={AMBER_GLOW} />
  </svg>
);

const CorridorWhy: React.FC<{ T: number; u: number }> = ({ T }) => {
  const ring = easeOut(prog(T, 39.1, 39.6));
  const pct = T < 39.2 ? 0 : Math.min(99, Math.round(99 * easeOut(prog(T, 39.2, 41.2))));
  const stuck = T > 41.2 ? (Math.floor(T * 7) % 2 ? 1 : 0.55) : 1;
  const conf = easeOut(prog(T, 42.7, 44.6));
  const D: [number, number] = [662, 540]; // the open door
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={33.8} text="WHY" x={150} y={250} out={45.5} />
      {/* done: closed */}
      <g opacity={easeOut(prog(T, 35.8, 36.2)) * (1 - prog(T, 38.9, 39.3) * 0.6)}>
        <circle cx={1300} cy={420} r={70} fill="none" stroke={STEEL} strokeWidth={6} style={{ filter: `drop-shadow(0 0 12px ${STEEL_GLOW})` }} />
        <path d="M 1268 422 l 22 22 l 44 -48" fill="none" stroke={STEEL} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <Rise T={T} at={35.9} text="做错的事" x={1400} y={400} size={56} color={STEEL} />
        <Rise T={T} at={36.2} text="有结局，会被消化" x={1400} y={460} size={34} color={DIM} weight={700} />
      </g>
      {/* not done: never closes */}
      {ring > 0 && (
        <g opacity={ring}>
          <circle cx={D[0]} cy={D[1]} r={120} fill="none" stroke="rgba(244,184,96,0.18)" strokeWidth={10} />
          <circle cx={D[0]} cy={D[1]} r={120} fill="none" stroke={AMBER} strokeWidth={10} strokeLinecap="round" pathLength={100} strokeDasharray={`${pct} 100`} transform={`rotate(-90 ${D[0]} ${D[1]})`} style={{ filter: `drop-shadow(0 0 16px ${AMBER_GLOW})` }} />
          <text x={D[0]} y={D[1] + 18} textAnchor="middle" opacity={stuck} style={{ fontFamily: EN, fontWeight: 700, fontSize: 64, fill: AMBER }}>{pct}%</text>
          <text x={D[0]} y={D[1] + 175} textAnchor="middle" style={{ ...BLACK, fontSize: 34, fill: AMBER }}>没做的事 · 补完中……</text>
        </g>
      )}
      {conf > 0 && (
        <g opacity={conf * (1 - prog(T, 45.4, 45.75))}>
          <Rise T={T} at={42.7} text="“当时我能行”" x={1250} y={640} size={52} color={INK} />
          <rect x={1250} y={680} width={460} height={18} rx={9} fill="rgba(245,239,228,0.15)" />
          <rect x={1250} y={680} width={460 * (0.3 + 0.68 * conf)} height={18} rx={9} fill={AMBER} style={{ filter: `drop-shadow(0 0 10px ${AMBER_GLOW})` }} />
          <text x={1250} y={740} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: DIM }}>离那一刻越远，越笃定</text>
        </g>
      )}
    </svg>
  );
};

const WindowIdeal: React.FC<{ T: number; u: number }> = ({ T }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <Kicker T={T} at={46.0} text="2018 · DAVIDAI & GILOVICH" x={1160} y={250} />
    <BigNum T={T} at={49.1} to={72} x={1160} y={500} size={240} color={AMBER} glow={AMBER_GLOW} />
    <Rise T={T} at={49.5} text="没成为想成为的人" x={1165} y={580} size={52} color={INK} />
    <BigNum T={T} at={53.15} to={28} x={1160} y={760} size={120} color={STEEL} glow={STEEL_GLOW} />
    <Rise T={T} at={53.4} text="没尽到该尽的责任" x={1400} y={740} size={38} color={DIM} weight={700} />
  </svg>
);

const EYES = Array.from({ length: 40 }, (_, i) => ({ x: 140 + (i % 10) * 180 + rnd(i, 2) * 60, y: 200 + Math.floor(i / 10) * 70 + rnd(i, 3) * 30, p: rnd(i, 4) }));
const StageSpot: React.FC<{ T: number; u: number }> = ({ T }) => {
  const eyesOn = easeOut(prog(T, 60.5, 61.3));
  const half = easeOut(prog(T, 67.6, 68.2)), quarter = easeOut(prog(T, 70.9, 71.4));
  const shirt = easeOut(prog(T, 63.7, 64.2));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <Kicker T={T} at={57.1} text="2000 · THE SPOTLIGHT EFFECT" x={960} y={180} anchor="middle" />
      {/* eyes in the dark */}
      {EYES.map((e, i) => {
        const imag = e.p < 0.5 ? 1 : 0, real = e.p < 0.25 ? 1 : 0;
        const on = T < 67.6 ? eyesOn * (0.35 + 0.15 * Math.sin(T * 3 + i)) : lerp(eyesOn * 0.4, imag, half) * (T > 70.9 ? lerp(1, real ? 1 : 0.08, quarter) : 1);
        const col = T > 70.9 && real ? AMBER : INK;
        return (
          <g key={i} opacity={on}>
            <ellipse cx={e.x - 9} cy={e.y} rx={5} ry={3} fill={col} style={{ filter: `drop-shadow(0 0 6px ${col === AMBER ? AMBER_GLOW : 'rgba(255,255,255,0.7)'})` }} />
            <ellipse cx={e.x + 9} cy={e.y} rx={5} ry={3} fill={col} />
          </g>
        );
      })}
      {/* the T-shirt in the spotlight */}
      {shirt > 0 && (
        <g transform={`translate(941 ${lerp(560, 640, shirt)})`} opacity={shirt}>
          <path d="M -90 -70 L -40 -95 Q 0 -70 40 -95 L 90 -70 L 120 -20 L 80 0 L 75 -25 L 75 95 L -75 95 L -75 -25 L -80 0 L -120 -20 Z" fill="#f0ece4" stroke="#20242a" strokeWidth={3} />
          <text x={0} y={30} textAnchor="middle" style={{ ...BLACK, fontSize: 46, fill: '#c03030' }}>?!</text>
        </g>
      )}
      <g>
        <BigNum T={T} at={67.6} to={50} x={300} y={780} size={150} color={INK} glow="rgba(255,255,255,0.4)" out={71.0} />
        {T > 67.8 && T < 71.3 && <Rise T={T} at={67.8} text="你以为会注意到的人" x={305} y={840} size={34} color={DIM} weight={700} />}
        <BigNum T={T} at={70.95} from={50} to={25} x={300} y={780} size={190} color={AMBER} glow={AMBER_GLOW} dur={0.35} />
        <Rise T={T} at={71.2} text="实际注意到的人" x={305} y={850} size={36} color={AMBER} weight={700} />
      </g>
    </svg>
  );
};

const TrainSlam: React.FC<{ T: number; u: number }> = ({ T }) => {
  const k1 = hit(T, 73.85, 0.18), k2 = hit(T, 77.46, 0.18);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 18 }, (_, i) => {
        const y = 300 + rnd(i, 5) * 400, f = ((T * 1.6 + rnd(i, 6)) % 1);
        return <line key={i} x1={1920 - f * 2600} y1={y} x2={1920 - f * 2600 + 500} y2={y} stroke="rgba(255,236,200,0.5)" strokeWidth={2 + 3 * rnd(i, 7)} />;
      })}
      <g transform={`translate(${-14 * k1 * Math.sin(T * 80)} 0)`}>
        <Rise T={T} at={73.9} text="高估 ×2" x={150} y={330} size={60} color={STEEL} per={0.05} />
        <Rise T={T} at={74.1} text="别人的目光" x={150} y={470} size={130} color={INK} per={0.05} />
      </g>
      <g transform={`translate(${-14 * k2 * Math.sin(T * 80)} 0)`}>
        <Rise T={T} at={77.5} text="低估" x={150} y={640} size={60} color={AMBER} per={0.05} />
        <Rise T={T} at={77.7} text="遗憾的寿命" x={150} y={780} size={130} color={AMBER} glow={AMBER_GLOW} per={0.05} />
      </g>
    </svg>
  );
};

const PINGS = Array.from({ length: 109 }, (_, i) => ({ x: 120 + rnd(i, 11) * 1680, y: 420 + rnd(i, 12) * 520, t: 82.1 + rnd(i, 13) * 3.6 }));
const EarthCount: React.FC<{ T: number; u: number }> = ({ T }) => {
  const n = PINGS.filter((p) => T >= p.t).length;
  const bars = easeOut(prog(T, 86.6, 87.4));
  const two = easeOut(prog(T, 89.6, 90.3));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {PINGS.map((p, i) => {
        const h = hit(T, p.t, 0.6);
        if (T < p.t) return null;
        return <g key={i} opacity={1 - 0.6 * bars}><circle cx={p.x} cy={p.y} r={4} fill={AMBER} /><circle cx={p.x} cy={p.y} r={4 + 40 * (1 - h)} fill="none" stroke={AMBER} strokeWidth={2} opacity={h} /></g>;
      })}
      <Kicker T={T} at={82.0} text="2022 · WORLD REGRET SURVEY" x={150} y={230} />
      <g opacity={1 - bars}>
        <text x={150} y={390} style={{ fontFamily: EN, fontWeight: 700, fontSize: 150, fill: INK }}>{n}</text>
        <text x={480} y={390} style={{ ...BLACK, fontSize: 48, fill: DIM }}>个国家</text>
        <BigNum T={T} at={83.6} to={23000} x={150} y={530} size={110} color={AMBER} glow={AMBER_GLOW} suffix="+" dur={1.2} />
        <text x={720} y={530} opacity={easeOut(prog(T, 84.6, 85))} style={{ ...BLACK, fontSize: 44, fill: DIM }}>条后悔</text>
      </g>
      {bars > 0 && (
        <g opacity={bars}>
          <rect x={0} y={128} width={1920} height={824} fill="rgba(4,6,10,0.55)" />
          <Rise T={T} at={86.6} text="30岁以后" x={960} y={270} size={50} color={DIM} anchor="middle" weight={700} />
          <rect x={620} y={820 - 220 * bars - 220 * two} width={260} height={220 * bars + 220 * two} rx={10} fill={AMBER} style={{ filter: `drop-shadow(0 0 24px ${AMBER_GLOW})` }} />
          <rect x={1040} y={820 - 220 * bars} width={260} height={220 * bars} rx={10} fill={STEEL} opacity={0.85} />
          <text x={750} y={880} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: AMBER }}>没做</text>
          <text x={1170} y={880} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: STEEL }}>做错</text>
          {two > 0.5 && <BigNum T={T} at={90.0} to={2} from={1} x={750} y={360} size={150} color={AMBER} glow={AMBER_GLOW} suffix="×" anchor="middle" dur={0.3} />}
        </g>
      )}
    </svg>
  );
};

const EndCard: React.FC<{ T: number; u: number }> = ({ T }) => {
  const t = T - CUT.end;
  const o = (x: number, d = 0.35) => easeOut(prog(t, x, x + d));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={0} width={1920} height={1080} fill="rgba(4,6,10,0.35)" />
      <text x={960} y={300} textAnchor="middle" opacity={o(0)} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 110, fill: INK, letterSpacing: '0.12em', filter: `drop-shadow(0 0 20px ${AMBER_GLOW})` }}>没走的路</text>
      <text x={960} y={196} textAnchor="middle" opacity={o(0.1)} style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.6em', fill: DIM }}>THE ROAD NOT TAKEN</text>
      <Rise T={T} at={CUT.end + 0.5} text="你那条没走的路，是什么？" x={960} y={480} size={64} anchor="middle" color={AMBER} glow={AMBER_GLOW} />
      <text x={960} y={545} textAnchor="middle" opacity={o(0.9)} style={{ fontFamily: SANS, fontSize: 28, fill: DIM, letterSpacing: '0.06em' }}>写在评论区，就当是迈出去的第一步</text>
      <g opacity={o(1.1)}>
        <rect x={960 - 330} y={600} width={660} height={56} rx={28} fill="none" stroke={AMBER} strokeOpacity={0.85} strokeWidth={2} />
        <text x={960} y={637} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', fill: INK }}>{JUNO.follow}</text>
      </g>
      <g opacity={o(1.3)} style={{ fontFamily: SANS, fontSize: 17, fill: 'rgba(245,239,228,0.5)' }}>
        <text x={960} y={760} textAnchor="middle">资料：Gilovich & Medvec (1994) JPSP；(1995) Psychological Review · Davidai & Gilovich (2018) Emotion · Gilovich, Medvec & Savitsky (2000) JPSP · Pink (2022) World Regret Survey</text>
        <text x={960} y={788} textAnchor="middle">注：1994 年"84%"来自 32 人的小样本；2023 年 2600 人的重复实验里，短期结果重现，长期差距明显缩小（Richardson & Gilovich, RSOS）</text>
      </g>
      <rect width={1920} height={1080} fill="#000" opacity={black} />
    </svg>
  );
};

// ------------------------------------------------------------------ the shot list
export const SHOTS: Shot[] = [
  { a: 0, z: fb(21), plate: 'walker', kb: { s: [1.06, 1.2], x: [0, -30], y: [0, 14], ox: 811, oy: 700 }, focus: [811, 700] },
  { a: fb(21), z: fb(26), plate: 'hourglass', kb: { s: [1.12, 1.22], x: [50, 0] }, overlay: HourglassSand },
  { a: fb(26), z: CUT.intro, plate: 'fork', kb: { s: [1.0, 1.28], y: [0, -40], ox: 922, oy: 600 }, overlay: ForkLights, focus: [922, 600] },
  { a: CUT.intro, z: CUT.model, plate: 'letter', kb: { s: [1.18, 1.06], ry: [-8, 0], x: [60, 160] }, dark: 0.25, overlay: LetterQ },
  { a: CUT.model, z: fb(64), plate: 'road', kb: { s: [1.05, 1.22], y: [0, 30] }, dark: 0.45 },
  { a: fb(64), z: CUT.net, plate: 'fork', kb: { s: [1.35, 1.6], ry: [6, -4], ox: 1392, oy: 365 }, dark: 0.45, overlay: ForkLights, focus: [1392, 365] },
  { a: CUT.net, z: CUT.atus, plate: 'corridor', kb: { s: [1.0, 1.32], ox: 662, oy: 540 }, dark: 0.2, overlay: CorridorWhy },
  { a: CUT.atus, z: CUT.dunbar, plate: 'window', kb: { s: [1.06, 1.16], x: [-30, 30] }, dark: 0.15, overlay: WindowIdeal },
  { a: CUT.dunbar, z: CUT.drop, plate: 'stage', kb: { s: [1.14, 1.0], y: [-40, 0] }, dark: 0.1, overlay: StageSpot },
  { a: CUT.drop, z: CUT.pay, plate: 'train', kb: { s: [1.15, 1.35], x: [0, -60] }, dark: 0.35, overlay: TrainSlam },
  { a: CUT.pay, z: CUT.end, plate: 'earth', kb: { s: [1.0, 1.16], y: [0, -20], ox: 1354, oy: 331 }, dark: 0.2, overlay: EarthCount, focus: [1354, 331] },
  { a: CUT.end, z: FILM_END + 1, plate: 'pier', kb: { s: [1.12, 1.0] }, dark: 0.1, overlay: EndCard },
];
export const CUTS = SHOTS.slice(1).map((s) => s.a);

// ------------------------------------------------------------------ the balance (15.3 → 33.5), screen space
export const Balance: React.FC<{ T: number }> = ({ T }) => {
  if (T < 15.3 || T > 33.7) return null;
  const inK = easeOut(prog(T, 15.4, 16.0)) * (1 - prog(T, 33.2, 33.6));
  const week = easeOut(prog(T, 17.25, 17.8));
  const life = prog(T, 24.5, 24.85);
  const did = T < 24.5 ? lerp(50, 53, week) : lerp(53, 16, easeOut(life));
  const not = 100 - did;
  const slam = hit(T, 24.85, 0.25);
  const ang = (not - did) * 0.36 + Math.sin(T * 18) * 1.5 * slam + (T > 22.4 && T < 24.5 ? Math.sin(T * 9) * 1.2 : 0);
  const P: [number, number] = [960, 660], Lh = 560;
  const rad = (ang * Math.PI) / 180;
  const end = (s: number): [number, number] => [P[0] + s * Lh * Math.cos(rad), P[1] + s * Lh * Math.sin(rad)];
  const [lx, ly] = end(-1), [rx, ry] = end(1);
  const shake = 10 * slam * Math.sin(T * 70);
  const scale = T < 24.5 ? '最近 7 天' : '一辈子';
  return (
    <AbsoluteFill style={{ opacity: inK, transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <svg width={1920} height={1080}>
        <Kicker T={T} at={15.4} text="1994 · GILOVICH & MEDVEC" x={960} y={200} anchor="middle" />
        <text x={960} y={300} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 64, fill: INK, letterSpacing: '0.3em', filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.8))' }}>{scale}</text>
        {/* beam */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={6} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
        <path d={`M ${P[0]} ${P[1]} l -40 90 l 80 0 z`} fill="rgba(245,239,228,0.85)" />
        {/* weights */}
        <g transform={`translate(${lx} ${ly})`}>
          <circle r={18} fill={STEEL} style={{ filter: `drop-shadow(0 0 12px ${STEEL_GLOW})` }} />
          <text x={0} y={-150} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: T > 24.5 ? 110 : 150, fill: STEEL, filter: `drop-shadow(0 0 18px ${STEEL_GLOW})` }}>{Math.round(did)}%</text>
          <text x={0} y={-80} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: STEEL }}>后悔「做了」</text>
          {T > 20.0 && T < 24.5 && <text x={0} y={80} textAnchor="middle" opacity={easeOut(prog(T, 20.05, 20.4))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>说错的话 · 冲动的决定</text>}
        </g>
        <g transform={`translate(${rx} ${ry})`}>
          <circle r={18 + 8 * (T > 24.5 ? 1 : 0)} fill={AMBER} style={{ filter: `drop-shadow(0 0 ${T > 24.5 ? 30 : 12}px ${AMBER_GLOW})` }} />
          <text x={0} y={-150} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: T > 24.5 ? 200 : 150, fill: AMBER, filter: `drop-shadow(0 0 22px ${AMBER_GLOW})` }}>{Math.round(not)}%</text>
          <text x={0} y={-80} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: AMBER }}>后悔「没做」</text>
          {T > 27.6 && <text x={0} y={90} textAnchor="middle" opacity={easeOut(prog(T, 27.65, 28.0))} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: DIM }}>没去的地方 · 没说出口的话</text>}
        </g>
        {slam > 0.05 && <circle cx={rx} cy={ry} r={30 + 220 * (1 - slam)} fill="none" stroke={AMBER} strokeWidth={4} opacity={slam} />}
        {T > 30.5 && (
          <g opacity={easeOut(prog(T, 30.55, 30.9))}>
            <text x={960} y={880} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, fill: DIM }}>上一周 <tspan fill={STEEL}>53</tspan> : <tspan fill={AMBER}>47</tspan>　→　一辈子 <tspan fill={STEEL}>16</tspan> : <tspan fill={AMBER}>84</tspan></text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ title on the first drop
export const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = CUT.title, z = CUT.intro;
  if (T < a - 0.05 || T > z + 0.3) return null;
  const out = easeInOut(prog(T, z - 0.15, z + 0.25));
  const sh = Math.sin(T * 90) * 8 * hit(T, a, 0.12);
  const k = (d: number, dur = 0.25) => easeOut(prog(T, a + d, a + d + dur));
  const chars = [...'没走的路'];
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${sh}px, 0)` }}>
      <AbsoluteFill style={{ backgroundColor: 'rgba(3,5,8,0.45)' }} />
      <svg width={1920} height={1080}>
        <text x={960} y={360} textAnchor="middle" opacity={k(0.3)} style={{ fontFamily: MONO, fontSize: 28, letterSpacing: '0.7em', fill: DIM }}>THE ROAD NOT TAKEN</text>
        {chars.map((c, i) => {
          const kk = easeOut(prog(T, a + i * 0.05, a + i * 0.05 + 0.18));
          return <text key={i} x={960 + (i - 1.5) * 230} y={620 + (1 - kk) * 40} textAnchor="middle" opacity={kk} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 210, fill: i === 1 ? AMBER : INK, filter: `drop-shadow(0 0 ${i === 1 ? 30 : 16}px ${i === 1 ? AMBER_GLOW : 'rgba(0,0,0,0.8)'})` }}>{c}</text>;
        })}
        <line x1={960 - 460 * k(0.2, 0.4)} y1={690} x2={960 + 460 * k(0.2, 0.4)} y2={690} stroke={AMBER} strokeWidth={3} style={{ filter: `drop-shadow(0 0 10px ${AMBER_GLOW})` }} />
        <text x={960} y={760} textAnchor="middle" opacity={k(0.5)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', fill: DIM }}>VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};

export { clamp, PlateShot };

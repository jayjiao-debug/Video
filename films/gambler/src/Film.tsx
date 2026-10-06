import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { EV, BEAT, FILM_END, ZH, SANS, MONO, prog, easeOut, easeIn, easeInOut, clamp, lerp, hit, pop, rnd } from './lib';
import { LOOKS, LookCtx } from './look';
import { JUNO } from './brand/identity';
import { Subtitles } from './subs';

/* 《大脑是个赌徒》 rough demo. One set: a dark table under a hanging lamp. The bets are cards (face down = the brain's
   guess, flipped = what the music did). A gauge on the right is the anticipation (示意, not a measurement). No chips,
   no money on the table (platform review). */

const GOLD = '#f1c56d', GOLD_GLOW = 'rgba(241,197,109,0.75)', RED = '#ff4a3a', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.5)';
const CREAM = '#efe6d2', BACK = '#1b2440';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

/* ---------- timing helpers ---------- */
const down = (k: number) => EV.title + k * 4 * BEAT;              // bar downbeats after the title
const beatsBefore = (t: number, n: number) => t - n * BEAT;
const between = (T: number, a: number, z: number) => T >= a && T < z;

/** lamp intensity */
const lamp = (T: number) => {
  let v = 1;
  v -= 0.72 * prog(T, EV.cut1, EV.cut1 + 0.08) * (1 - prog(T, EV.replay - 0.1, EV.replay + 0.3)); // the drop that didn't come
  v -= 0.25 * prog(T, EV.break, EV.break + 1.5) * (1 - prog(T, EV.riser, EV.riser + 1));          // quiet break
  v -= 0.9 * prog(T, EV.hush, EV.hush + 0.05) * (1 - prog(T, EV.pickup - 0.02, EV.pickup));        // one beat of nothing
  v += 0.6 * hit(T, EV.pickup, 0.5) + 0.25 * hit(T, EV.drop, 0.4) + 0.4 * hit(T, EV.title, 0.4);
  return v;
};

/** the anticipation gauge, 0..1 (示意) */
const gauge = (T: number) => {
  if (T < EV.cut1) return lerp(0.08, 0.86, easeIn(prog(T, 0, EV.cut1)));
  if (T < EV.replay) return lerp(0.86, 0.06, easeOut(prog(T, EV.cut1, EV.cut1 + 0.7)));
  if (T < EV.title) return lerp(0.06, 0.88, easeIn(prog(T, EV.replay, EV.title)));
  if (T < EV.break) {
    let v = lerp(1, 0.32, easeOut(prog(T, EV.title, EV.title + 3)));
    for (let k = 2; k <= 7; k++) v += 0.1 * hit(T, down(k), 0.6);
    return v;
  }
  if (T < EV.riser) return 0.3;
  if (T < EV.breath2) return lerp(0.3, 0.93, easeInOut(prog(T, EV.riser, EV.breath2)));
  if (T < EV.pickup) return 0.93 + 0.07 * prog(T, EV.breath2, EV.hush) + 0.02 * Math.sin(T * 40);
  return lerp(1.15, 0.5, easeOut(prog(T, EV.pickup, EV.pickup + 6)));
};

/* ---------- pieces ---------- */
const Room: React.FC<{ T: number }> = ({ T }) => {
  const L = lamp(T);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #07070a 0%, #0c0a08 55%, #120d09 100%)' }} />
      {/* table top */}
      <div style={{ position: 'absolute', left: -200, right: -200, top: 380, bottom: -100, background: 'linear-gradient(180deg, #2a1d12 0%, #1a120b 60%, #0e0a06 100%)', transform: 'perspective(1200px) rotateX(38deg)', transformOrigin: '50% 0%' }} />
      {/* lamp pool */}
      <AbsoluteFill style={{ opacity: clamp(L, 0, 1.6), background: 'radial-gradient(ellipse 46% 40% at 50% 54%, rgba(255,196,120,0.30) 0%, rgba(255,170,90,0.10) 45%, rgba(0,0,0,0) 72%)', mixBlendMode: 'screen' }} />
      {/* the lamp itself */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <line x1={960} y1={0} x2={960} y2={70} stroke="#2a2420" strokeWidth={4} />
        <path d="M 880 120 Q 960 60 1040 120 Z" fill="#2e2620" />
        <ellipse cx={960} cy={121} rx={80} ry={9} fill={`rgba(255,214,150,${clamp(0.35 + 0.6 * L, 0, 1)})`} style={{ filter: 'blur(3px)' }} />
      </svg>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${clamp(1 - L, 0, 0.92)})` }} />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ x: number; y: number; w?: number; flip: number; face?: React.ReactNode; tone?: 'cream' | 'gold' | 'red'; rot?: number; o?: number; lift?: number }> =
  ({ x, y, w = 190, flip, face, tone = 'cream', rot = 0, o = 1, lift = 0 }) => {
    const h = w * 1.42;
    const sx = Math.abs(Math.cos(Math.PI * clamp(flip)));
    const showFace = flip >= 0.5;
    const bg = tone === 'gold' ? `linear-gradient(160deg, #ffe4a3, ${GOLD} 55%, #c8913a)` : tone === 'red' ? 'linear-gradient(160deg, #ff8d7e, #d8322a)' : `linear-gradient(160deg, #fff8ea, ${CREAM})`;
    const glow = tone === 'gold' && showFace ? `0 0 40px ${GOLD_GLOW}` : '0 18px 30px rgba(0,0,0,0.55)';
    return (
      <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2 - lift, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scaleX(${Math.max(0.02, sx)})`, borderRadius: w * 0.07,
        background: showFace ? bg : `repeating-linear-gradient(45deg, ${BACK} 0 10px, #222d50 10px 20px)`, border: showFace ? '2px solid rgba(0,0,0,0.25)' : `3px solid ${GOLD}`, boxShadow: glow,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showFace ? face : <div style={{ width: w * 0.42, height: w * 0.42, transform: 'rotate(45deg)', border: `2px solid ${GOLD}`, opacity: 0.8 }} />}
      </div>
    );
  };

const FaceText: React.FC<{ s: string; size?: number; color?: string; font?: string }> = ({ s, size = 92, color = '#1a1410', font = ZH }) => (
  <span style={{ fontFamily: font, fontWeight: 900, fontSize: size, color, letterSpacing: '0.02em', textAlign: 'center', lineHeight: 1.1 }}>{s}</span>
);

const Gauge: React.FC<{ T: number }> = ({ T }) => {
  const v = gauge(T);
  const o = 1 - prog(T, FILM_END - 5, FILM_END - 4.4);
  const H = 520, top = 230, x = 1700;
  const fill = clamp(v, 0, 1) * H;
  const over = clamp(v - 1, 0, 0.3) / 0.3;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <rect x={x} y={top} width={46} height={H} rx={23} fill="rgba(255,255,255,0.05)" stroke="rgba(243,237,226,0.25)" strokeWidth={2} />
      <rect x={x + 6} y={top + H - fill + 6} width={34} height={Math.max(0, fill - 12)} rx={17} fill={GOLD} style={{ filter: `drop-shadow(0 0 ${12 + 30 * over}px ${GOLD_GLOW})` }} />
      <text x={x + 23} y={top + H + 50} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, fill: INK, letterSpacing: '0.1em' }}>期待值</text>
      <text x={x + 23} y={top + H + 80} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 18, fill: DIM }}>（示意）</text>
    </svg>
  );
};

const Big: React.FC<{ s: string; x: number; y: number; size: number; color?: string; o?: number; sc?: number; font?: string; glow?: string; weight?: number }> =
  ({ s, x, y, size, color = INK, o = 1, sc = 1, font = ZH, glow, weight = 900 }) => o <= 0.001 ? null : (
    <div style={{ position: 'absolute', left: x - 900, width: 1800, top: y - size * 0.6, textAlign: 'center', opacity: o, transform: `scale(${sc})`,
      fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: '0.04em', filter: glow ? `drop-shadow(0 0 22px ${glow})` : undefined, whiteSpace: 'pre' }}>{s}</div>
  );

const vis = (T: number, a: number, z: number, fi = 0.3, fo = 0.4) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));

/* ---------- scenes ---------- */
const Opening: React.FC<{ T: number }> = ({ T }) => {
  if (T > EV.title + 3.4) return null;
  // the bet card: face down, flips to 空 (red) when the drop is taken away, back down for the replay, gold 嘭 on the title
  let flip = 0, tone: 'red' | 'gold' = 'red', face = '空';
  if (T >= EV.cut1 && T < EV.replay) flip = easeOut(prog(T, EV.cut1, EV.cut1 + 0.25)) * (1 - easeInOut(prog(T, EV.replay - 0.3, EV.replay)));
  if (T >= EV.title) { flip = easeOut(prog(T, EV.title, EV.title + 0.18)); tone = 'gold'; face = '嘭'; }
  const sh = Math.sin(T * 70) * 10 * hit(T, EV.title, 0.2);
  const tremble = T < EV.cut1 ? Math.sin(T * 50) * 2.5 * prog(T, 4, EV.cut1) : T < EV.title && T > EV.replay ? Math.sin(T * 50) * 2.5 * prog(T, 12, EV.title) : 0;
  const counts = [[EV.cut1, '3', '2', '1'], [EV.title, '3', '2', '1']] as const;
  return (
    <AbsoluteFill style={{ transform: `translate(${sh}px,0)` }}>
      <Card o={1 - prog(T, EV.title + 0.12, EV.title + 0.35)} x={960 + tremble} y={560} w={230} flip={flip} tone={tone} face={<FaceText s={face} size={130} color={tone === 'gold' ? '#2a1a06' : '#fff4ef'} />} />
      {counts.map(([at, ...ns]) => ns.map((n, i) => {
        const t0 = beatsBefore(at as number, 3 - i);
        const o = vis(T, t0, t0 + BEAT, 0.06, 0.15);
        return <Big key={`${at}${i}`} s={n} x={960} y={250} size={170} color={GOLD} o={o} sc={1 + 0.25 * (1 - easeOut(prog(T, t0, t0 + 0.2)))} font={MONO} glow={GOLD_GLOW} weight={700} />;
      }))}
      <Big s="押空了" x={960} y={250} size={120} color={RED} o={vis(T, EV.cut1 + 0.3, EV.replay - 0.2, 0.15, 0.3)} sc={1 + 0.2 * (1 - easeOut(prog(T, EV.cut1 + 0.3, EV.cut1 + 0.5)))} />
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.title, z = a + 3.3;
  if (T < a - 0.05 || T > z + 0.4) return null;
  const out = easeInOut(prog(T, z - 0.2, z + 0.3));
  const chars = [...'大脑是个赌徒'];
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <AbsoluteFill style={{ backgroundColor: 'rgba(4,3,2,0.62)' }} />
      {chars.map((c, i) => {
        const k = easeOut(prog(T, a + 0.12 + i * 0.045, a + 0.12 + i * 0.045 + 0.18));
        return <div key={i} style={{ position: 'absolute', left: 960 + (i - 2.5) * 200 - 100, width: 200, top: 360 + (1 - k) * 40, textAlign: 'center', opacity: k,
          fontFamily: ZH, fontWeight: 900, fontSize: 180, color: GOLD, filter: `drop-shadow(0 0 26px ${GOLD_GLOW})` }}>{c}</div>;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: easeOut(prog(T, a + 0.5, a + 0.9)), fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', color: DIM }}>{JUNO.series}</div>
    </AbsoluteFill>
  );
};

const CHORDS = ['C', 'G', 'Am', 'F', 'C', 'G'];
const Chords: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.title + 3.0, z = 33.2;
  if (T < a || T > z + 1) return null;
  const o = vis(T, a, z + 0.8, 0.5, 0.8);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {CHORDS.map((c, i) => {
        const t = down(i + 2);
        const fl = easeOut(prog(T, t, t + 0.22));
        const x = 960 + (i - 2.5) * 215;
        const ok = vis(T, t + 0.1, t + 1.6, 0.15, 0.4);
        return (
          <React.Fragment key={i}>
            <Card x={x} y={600} w={170} flip={fl} face={<FaceText s={c} size={84} font={MONO} />} lift={10 * hit(T, t, 0.3)} />
            <Big s="押中 ✓" x={x} y={370 - 30 * prog(T, t, t + 1.6)} size={36} color={GOLD} o={ok} font={SANS} weight={700} />
          </React.Fragment>
        );
      })}
      <Big s="（和弦为示意）" x={960} y={850} size={22} color={DIM} o={1} font={SANS} weight={400} />
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ T: number }> = ({ T }) => {
  const a = 32.6, z = EV.break + 0.2;
  if (T < a || T > z + 0.6) return null;
  const o = vis(T, a, z + 0.5, 0.4, 0.6);
  const n1 = vis(T, 32.7, 40.6, 0.3, 0.4), n2 = vis(T, 36.95, 40.6, 0.3, 0.4);
  const g = easeOut(prog(T, 40.8, 41.3));
  const cell = (cx: number, cy: number, title: string, sub: string, on: number, good: boolean) => (
    <div style={{ position: 'absolute', left: cx - 250, top: cy - 120, width: 500, height: 240, borderRadius: 18, opacity: g,
      background: good ? `rgba(241,197,109,${0.08 + 0.32 * on})` : 'rgba(255,255,255,0.04)', border: `2px solid ${good ? `rgba(241,197,109,${0.3 + 0.7 * on})` : 'rgba(243,237,226,0.15)'}`,
      boxShadow: good && on > 0 ? `0 0 ${50 * on}px ${GOLD_GLOW}` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 52, color: good ? GOLD : DIM }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 28, color: good ? INK : DIM }}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Big s="745 首" x={760} y={420} size={130} color={GOLD} o={n1} font={SANS} glow={GOLD_GLOW} />
      <Big s="80,000 个和弦" x={1160} y={620} size={110} color={INK} o={n2} font={SANS} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: g, fontFamily: SANS, fontSize: 26, color: DIM, letterSpacing: '0.2em' }}>2019 · Current Biology · Cheung 等</div>
      <div style={{ position: 'absolute', left: 300, top: 300, width: 140, opacity: g, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'right' }}>很有把握</div>
      <div style={{ position: 'absolute', left: 300, top: 560, width: 140, opacity: g, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'right' }}>毫无把握</div>
      <div style={{ position: 'absolute', left: 470, top: 205, width: 500, opacity: g, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'center' }}>被骗了（意外）</div>
      <div style={{ position: 'absolute', left: 990, top: 205, width: 500, opacity: g, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK, textAlign: 'center' }}>押中了（不意外）</div>
      {cell(720, 380, '上头', '确定 → 意外', easeOut(prog(T, 43.53, 43.9)), true)}
      {cell(1240, 380, '无聊', '全在意料之中', 0, false)}
      {cell(720, 640, '乱', '像噪音', 0, false)}
      {cell(1240, 640, '上头', '没底 → 押中', easeOut(prog(T, 46.11, 46.5)), true)}
    </AbsoluteFill>
  );
};

const Brain: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.break + 0.3, z = EV.riser + 0.4;
  if (T < a || T > z + 0.5) return null;
  const o = vis(T, a, z + 0.4, 0.8, 0.6);
  const n1 = easeOut(prog(T, 54.93, 55.4)), n2 = easeOut(prog(T, 58.26, 58.7));
  const node = (x: number, y: number, on: number, label: string, sub: string) => (
    <g>
      <circle cx={x} cy={y} r={26 + 40 * on} fill={GOLD} opacity={0.15 * on} />
      <circle cx={x} cy={y} r={20} fill={on > 0 ? GOLD : 'rgba(243,237,226,0.25)'} style={{ filter: on > 0 ? `drop-shadow(0 0 ${24 * on}px ${GOLD_GLOW})` : undefined }} />
      <text x={x} y={y + 80} textAnchor="middle" opacity={0.3 + 0.7 * on} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 46, fill: on > 0 ? GOLD : INK }}>{label}</text>
      <text x={x} y={y + 118} textAnchor="middle" opacity={0.3 + 0.7 * on} style={{ fontFamily: SANS, fontSize: 24, fill: DIM }}>{sub}</text>
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d="M 620 560 C 600 360 780 250 960 260 C 1160 250 1330 360 1310 540 C 1300 650 1220 700 1120 700 C 1080 760 980 770 930 720 C 820 730 640 700 620 560 Z" fill="rgba(243,237,226,0.04)" stroke="rgba(243,237,226,0.35)" strokeWidth={3} />
      <path d="M 960 270 C 940 360 990 430 960 520 C 930 600 980 660 950 720" fill="none" stroke="rgba(243,237,226,0.15)" strokeWidth={2} />
      {node(830, 470, n1, '等', '尾状核 · 高潮前')}
      {node(1100, 500, n2, '到', '伏隔核 · 高潮时')}
      <text x={960} y={830} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 22, fill: DIM }}>Salimpoor 等 2011 · Nature Neuroscience（示意）</text>
    </svg>
  );
};

const Countdown: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.riser, z = EV.hush;
  if (T < a || T > EV.pickup + 0.05) return null;
  const left = Math.max(0, EV.breath2 - T);
  const over = T >= EV.breath2;
  const o = vis(T, a, z + 0.02, 0.4, 0.05);
  const tremble = (i: number) => Math.sin(T * (38 + i * 7)) * 6 * easeIn(prog(T, EV.build, EV.hush)) * (over ? 1.5 : 1);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Big s={`距离 drop  ${left.toFixed(1)} 秒`} x={960} y={230} size={64} color={over ? RED : INK} o={1} font={MONO} weight={700} />
      {[0, 1, 2, 3].map((i) => <Card key={i} x={960 + (i - 1.5) * 230 + tremble(i)} y={600} w={190} flip={0} rot={tremble(i) * 0.3} />)}
      <Big s="+1 小节" x={960} y={360} size={96} color={RED} o={vis(T, EV.breath2 + 0.05, EV.hush + 0.02, 0.1, 0.05)} sc={1 + 0.3 * (1 - easeOut(prog(T, EV.breath2, EV.breath2 + 0.25)))} />
    </AbsoluteFill>
  );
};

const Win: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.pickup, z = 92.0;
  if (T < a - 0.01 || T > z + 0.6) return null;   // the silent beat stays pure black
  const o = 1 - prog(T, z - 0.2, z + 0.5);
  // v1 energy, on the real beats: the flip itself is the hit (starts on the hit frame, done in 3 frames),
  // the group punches in, and the second accent lands on the clap two beats later (EV.drop)
  const sh = Math.sin(T * 80) * 16 * hit(T, a, 0.25) + Math.sin(T * 70) * 8 * hit(T, EV.drop, 0.2);
  const punch = 1 + 0.14 * hit(T, a, 0.22) + 0.05 * hit(T, EV.drop, 0.2);
  const faces = ['押', '中', '了', '！'];
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translate(${sh}px, ${sh * 0.4}px) scale(${punch})`, transformOrigin: '50% 56%' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(241,197,109,${0.5 * hit(T, a, 0.6) + 0.2 * hit(T, EV.drop, 0.4)}) 0%, rgba(0,0,0,0) 60%)` }} />
      {faces.map((f, i) => {
        const t = a + i * 0.03;
        return <Card key={i} x={960 + (i - 1.5) * 230} y={600} w={190} flip={T < t ? 0 : 0.5 + 0.5 * easeOut(prog(T, t, t + 0.1))} tone="gold" face={<FaceText s={f} size={110} color="#2a1a06" />} lift={30 * hit(T, t, 0.35) + 14 * hit(T, EV.drop, 0.3)} />;
      })}
      {Array.from({ length: 40 }, (_, i) => {
        const ang = rnd(i) * Math.PI * 2, sp = 300 + 700 * rnd(i, 1), t = T - a;
        if (t < 0 || t > 1.6) return null;
        const r = sp * easeOut(clamp(t / 1.6));
        return <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(ang) * r, top: 600 + Math.sin(ang) * r * 0.7, width: 10, height: 10, borderRadius: 5, background: GOLD, opacity: 1 - t / 1.6, boxShadow: `0 0 12px ${GOLD_GLOW}` }} />;
      })}
    </AbsoluteFill>
  );
};

const Bids: React.FC<{ T: number }> = ({ T }) => {
  const a = 92.2, z = 100.1;
  if (T < a || T > z + 0.5) return null;
  const o = vis(T, a, z + 0.4, 0.4, 0.5);
  const vals = [0.35, 0.8, 0.55, 0.95, 0.25, 0.65];
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <text x={960} y={190} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 26, fill: DIM, letterSpacing: '0.2em' }}>2013 · Science · Salimpoor 等（示意）</text>
      {vals.map((v, i) => {
        const x = 960 + (i - 2.5) * 210, base = 760;
        const k = easeOut(prog(T, a + 0.6 + i * 0.25, a + 1.6 + i * 0.25));
        const k2 = easeOut(prog(T, 96.73 + i * 0.12, 97.6 + i * 0.12));
        return (
          <g key={i}>
            <rect x={x - 60} y={base - 380 * v * k} width={50} height={380 * v * k} rx={6} fill={GOLD} style={{ filter: `drop-shadow(0 0 10px ${GOLD_GLOW})` }} />
            <rect x={x + 10} y={base - 380 * v * k2} width={50} height={380 * v * k2} rx={6} fill={CREAM} />
            <text x={x} y={base + 50} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 26, fill: INK }}>{`新歌 ${i + 1}`}</text>
          </g>
        );
      })}
      <g style={{ fontFamily: SANS, fontSize: 26 }}>
        <rect x={640} y={870} width={26} height={26} fill={GOLD} /><text x={680} y={892} style={{ fill: INK }}>奖赏区活跃度</text>
        <rect x={1000} y={870} width={26} height={26} fill={CREAM} /><text x={1040} y={892} style={{ fill: INK }}>愿意出的钱</text>
      </g>
    </svg>
  );
};

const Pile: React.FC<{ T: number }> = ({ T }) => {
  const a = 100.2, z = 104.3;
  if (T < a || T > z + 0.6) return null;
  const o = vis(T, a, z + 0.5, 0.3, 0.6);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {Array.from({ length: 140 }, (_, i) => {
        const t0 = a + rnd(i) * 2.6, k = easeIn(prog(T, t0, t0 + 0.7));
        if (T < t0) return null;
        const x = 960 + (rnd(i, 1) - 0.5) * 700 * (0.4 + 0.6 * rnd(i, 3));
        const yEnd = 760 - 160 * (1 - Math.abs(x - 960) / 420) * rnd(i, 4);
        return <Card key={i} x={x} y={lerp(-150, yEnd, k)} w={70} flip={0} rot={(rnd(i, 2) - 0.5) * 70} />;
      })}
      <Big s="你听过的所有歌" x={960} y={250} size={64} color={GOLD} o={easeOut(prog(T, a + 0.8, a + 1.3))} glow={GOLD_GLOW} />
    </AbsoluteFill>
  );
};

const Takeaways: React.FC<{ T: number }> = ({ T }) => {
  const a = 104.3, z = 116.4;
  if (T < a || T > z + 0.6) return null;
  const o = vis(T, a, z + 0.5, 0.3, 0.6);
  const items: [number, string, string][] = [[104.32, '副歌重复', '让你押中'], [107.46, 'drop 前停一下', '让你多押一会儿'], [111.42, '儿歌 / 噪音', '太好猜 / 没法猜']];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {items.map(([t, h, s], i) => {
        const fl = easeOut(prog(T, t, t + 0.25));
        const x = 960 + (i - 1) * 470;
        return <Card key={i} x={x} y={560} w={330} flip={fl} tone={i === 2 ? 'cream' : 'gold'} face={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <FaceText s={h} size={h.length > 6 ? 40 : 50} color="#2a1a06" /><span style={{ fontFamily: SANS, fontSize: 32, color: '#3a2a10' }}>{s}</span>
          </div>} />;
      })}
    </AbsoluteFill>
  );
};

const Closing: React.FC<{ T: number }> = ({ T }) => {
  const a = EV.outro, z = 120.5;
  if (T < a || T > z + 0.6) return null;
  const o = vis(T, a, z + 0.5, 0.6, 0.6);
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${lerp(1, 1.12, prog(T, a, z))})` }}><Card x={960} y={600} w={230} flip={0} rot={Math.sin(T * 1.5) * 1.5} /></AbsoluteFill>;
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = 120.5;
  if (T < a) return null;
  const k = (d: number) => easeOut(prog(T, a + d, a + d + 0.4));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(4,3,2,${0.75 * k(0)})` }} />
      <Big s="大脑是个赌徒" x={960} y={300} size={100} color={GOLD} o={k(0)} glow={GOLD_GLOW} />
      <Big s={'你最近被哪首歌"骗"到了？'} x={960} y={470} size={60} o={k(0.4)} />
      <Big s="评论区说说那一秒" x={960} y={545} size={28} color={DIM} o={k(0.8)} font={SANS} weight={400} />
      <div style={{ position: 'absolute', left: 960 - 330, top: 600, width: 660, height: 56, borderRadius: 28, border: `2px solid ${GOLD}`, opacity: k(1.0), display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: INK }}>{JUNO.follow}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', opacity: 0.6 * k(1.2), fontFamily: SANS, fontSize: 17, color: INK, lineHeight: 1.8 }}>
        资料：Cheung 等 2019 Current Biology · Gold 等 2019 J Neurosci · Salimpoor 等 2011 Nature Neuroscience、2013 Science · Huron《Sweet Anticipation》2006<br />
        "赌""押注"为比喻 · 期待值和大脑示意图不是测量数据 · 背景音乐为演示重新剪辑
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ at?: number }> = ({ at }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = at ?? frame / fps;
  const mark = easeOut(prog(T, EV.title + 3.4, EV.title + 4.2)) * (1 - prog(T, 120.2, 120.6));
  return (
    <LookCtx.Provider value={LOOKS.night}>
      <AbsoluteFill style={{ backgroundColor: '#050403' }}>
        <style>{`
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        `}</style>
        <Room T={T} />
        <Opening T={T} />
        <Chords T={T} />
        <Grid T={T} />
        <Brain T={T} />
        <Countdown T={T} />
        <Win T={T} />
        <Bids T={T} />
        <Pile T={T} />
        <Takeaways T={T} />
        <Closing T={T} />
        {T < 120.4 && <Gauge T={T} />}
        <TitleCard T={T} />
        <EndCard T={T} />
        <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)' }} />
        <AbsoluteFill style={{ opacity: 0.07, pointerEvents: 'none' }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 70%)' }} />
        <Subtitles T={T} />
        {mark > 0.001 && (
          <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
            <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
          </div>
        )}
      </AbsoluteFill>
    </LookCtx.Provider>
  );
};

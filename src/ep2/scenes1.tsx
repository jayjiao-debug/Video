import React, { useMemo } from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { C, ZH, EN, beats, beatAfter, prog, easeOut, easeIn, easeInOut, lerp, inOut } from '../lib';
import { Subtitle, YearStamp, Dust, Glow } from '../ui';
import { CanvasLayer, rnd, glowDot, Term, Times, Sub } from './common';
import { PeepFig } from '../v/scenesV';
import { Telescope, Wobble } from './ink';

/* ---------- shared starfield ---------- */
export const STARS = new Array(2400).fill(0).map((_, i) => ({
  x: 60 + rnd(`sx${i}`) * 1800,
  y: 250 + rnd(`sy${i}`) * 560,
  r: 0.6 + Math.pow(rnd(`sr${i}`), 3) * 2.2,
  a: 0.35 + rnd(`sa${i}`) * 0.6,
  u: rnd(`su${i}`),
}));

/* ---------- S01–S02 · stars become city lights (0 → 16.75) ---------- */
const HERO = [
  [300, 190], [620, 320], [880, 150], [1150, 280], [1480, 170], [1700, 360], [460, 470], [1020, 470], [1340, 420], [760, 560],
];
type Bld = { x: number; w: number; h: number };
const BLDS: Bld[] = (() => {
  const out: Bld[] = [];
  let x = -20;
  let i = 0;
  while (x < 1940) {
    const w = 70 + rnd(`bw${i}`) * 110;
    const h = 120 + rnd(`bh${i}`) * 230 + (Math.abs(x - 960) < 420 ? 60 : 0);
    out.push({ x, w, h });
    x += w + 4 + rnd(`bg${i}`) * 8;
    i++;
  }
  return out;
})();
const WINDOWS = (() => {
  const ws: { x: number; y: number; b: number }[] = [];
  BLDS.forEach((b, bi) => {
    for (let yy = 1080 - b.h + 18; yy < 1060; yy += 26) {
      for (let xx = b.x + 12; xx < b.x + b.w - 14; xx += 20) ws.push({ x: xx, y: yy, b: bi });
    }
  });
  // deterministic shuffle
  return ws.map((w, i) => ({ w, k: rnd(`wk${i}`) })).sort((a, b) => a.k - b.k).map((o) => o.w);
})();
const INTRO_N = 360;
const introStars = new Array(INTRO_N).fill(0).map((_, i) => {
  const g = i % 10;
  const isHero = i < 10;
  const ang = rnd(`ia${i}`) * Math.PI * 2;
  const rad = Math.pow(rnd(`ir${i}`), 0.7) * 300;
  const x = isHero ? HERO[g][0] : Math.min(1880, Math.max(40, HERO[g][0] + Math.cos(ang) * rad * 1.3));
  const y = isHero ? HERO[g][1] : Math.min(600, Math.max(60, HERO[g][1] + Math.sin(ang) * rad * 0.6));
  return { g, isHero, x, y, r: isHero ? 4.2 : 0.9 + Math.pow(rnd(`irr${i}`), 3) * 1.9, a: isHero ? 1 : 0.35 + rnd(`iaa${i}`) * 0.55, delay: isHero ? 0 : 0.05 + rnd(`id${i}`) * 0.7, win: WINDOWS[i % WINDOWS.length] };
});

export const TA: [string, string, string, string?][] = [
  ['DocStethoscope', 'Smile', 'Bun'],                    // doctor
  ['BlazerPantsWB', 'Smile', 'ShortWavy', 'GlassRound'], // office
  ['EasingBW', 'Calm', 'Hijab'],                         // designer
  ['WalkingBW', 'Calm', 'Short'],                        // commuter
  ['BlazerPantsBW', 'Smile', 'Long'],                    // lawyer
  ['EasingWB', 'Cheeky', 'Beanie'],                      // artist
  ['PointingFingerBW', 'Smile', 'LongCurly'],            // teacher
  ['CrossedArmsBW', 'Calm', 'ShavedSides'],              // engineer
];
const TA_ORDER = [3, 5, 1, 6, 0, 7, 2, 4];

export const Intro2: React.FC<{ t: number }> = ({ t }) => {
  const BL = beats[13] - beats[12];
  const hits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => j * BL * 0.5);
  const rise = easeOut(prog(t, 2.0, 2.9));
  const riseY = (1 - rise) * 420;
  const dim = 1 - 0.65 * easeInOut(prog(t, 5.07, 5.6));
  const worldO = 1 - easeInOut(prog(t, 7.45, 8.05));
  const qO = Math.min(easeOut(prog(t, 5.07, 5.7)), 1 - prog(t, 7.9, 8.05));
  const qBlur = (1 - easeOut(prog(t, 5.07, 5.5))) * 8;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: worldO }}>
        {/* skyline */}
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${riseY}px)`, opacity: rise }}>
          <defs>
            <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1e2c" /><stop offset="1" stopColor="#0d0f16" /></linearGradient>
          </defs>
          {BLDS.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={1080 - b.h} width={b.w} height={b.h} fill="url(#bld)" />
              <line x1={b.x} x2={b.x + b.w} y1={1080 - b.h} y2={1080 - b.h} stroke={C.gold} strokeOpacity={0.12} />
            </g>
          ))}
        </svg>
        <CanvasLayer t={t} draw={(ctx) => {
          introStars.forEach((s, i) => {
            const ig = hits[s.g] + s.delay * 0.5;
            if (t < ig - 0.02) return;
            const on = s.isHero ? spring({ frame: (t - ig) * 30, fps: 30, config: { damping: 12, stiffness: 120 } }) : easeOut(prog(t, ig, ig + 0.6));
            const mStart = 2.15 + (s.win.x / 1920) * 0.8 + rnd(`ms${i}`) * 0.25;
            const m = easeInOut(prog(t, mStart, mStart + 1.1));
            const wx = s.win.x, wy = s.win.y + riseY;
            const x = lerp(s.x, wx + 4, m), y = lerp(s.y, wy + 6, m) - Math.sin(m * Math.PI) * 40;
            const a = s.a * Math.min(on, 1) * dim;
            if (m < 0.9) {
              const flare = s.isHero ? 1 + 2.2 * Math.max(0, 1 - (t - ig) * 1.6) : 1;
              glowDot(ctx, x, y, s.r * flare * (1 - m * 0.4), a * (1 - prog(m, 0.8, 0.9) * 0.5), '240,213,154', s.isHero ? 6 : 3.5);
            }
            if (m > 0.8) {
              ctx.fillStyle = `rgba(233,194,122,${a * prog(m, 0.8, 1) * 0.9})`;
              ctx.fillRect(wx, wy, 8, 12);
            }
          });
        }} />
        {/* the many possible "Ta": 4 women, 4 men, different looks and jobs */}
        {TA.map((c, i) => {
          const at = 5.25 + TA_ORDER.indexOf(i) * 0.13;
          const p = easeOut(prog(t, at, at + 0.6));
          return (
            <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 36}px)`, filter: i === 0 ? 'grayscale(1) sepia(0.3) brightness(1.04)' : undefined }}>
              <PeepFig kind="stand" body={c[0]} face={c[1]} hair={c[2]} acc={c[3]} flip={i >= 4} glow={false} x={960 + (i - 3.5) * 228} y={1098} h={450} />
            </div>
          );
        })}
      </AbsoluteFill>
      <Subtitle t={t} at={0.15} out={2.4} zh="银河系里，有几千亿颗星星" en="Our galaxy holds hundreds of billions of stars." y={620} />
      <Subtitle t={t} at={2.55} out={4.75} zh="你的城市里，有几百万个人" en="Your city holds millions of people." y={330} />
      {qO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', opacity: qO, filter: `blur(${qBlur}px)` }}>
          <div style={{ fontFamily: ZH, fontSize: 84, fontWeight: 600, color: C.paper, letterSpacing: '0.12em', textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
            为什么，偏偏遇不到<span style={{ color: C.gold }}>Ta</span>？
          </div>
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 38, color: C.dim, marginTop: 14 }}>So why can't you meet the one?</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- S03 · Title ---------- */
export const Title2: React.FC<{ t: number }> = ({ t }) => {
  const at = 16.63;
  const o = 1 - prog(t, 20.45, 20.8);
  const tp = easeOut(prog(t, at, at + 0.7));
  const glow = t < at ? 0 : Math.min(prog(t, at, at + 0.25), 1) * lerp(0.42, 0.16, easeOut(prog(t, at + 0.25, at + 2.2)));
  const sweep = lerp(-60, 160, easeInOut(prog(t, at + 0.05, at + 1.5)));
  const lineP = easeOut(prog(t, at + 0.5, at + 1.6));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={500} r={720} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={at} cx={960} cy={500} seed="title2" />
      {/* constellation: two stars joined */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={560} y1={250} x2={lerp(560, 1360, lineP)} y2={lerp(250, 230, lineP)} stroke={C.gold} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="2 8" />
        <circle cx={560} cy={250} r={5} fill={C.goldHi} opacity={easeOut(prog(t, at, at + 0.4))} />
        <circle cx={1360} cy={230} r={5} fill={C.goldHi} opacity={lineP} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 318, textAlign: 'center', opacity: easeOut(prog(t, at + 0.2, at + 0.8)) }}>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginRight: 22, opacity: 0.7 }} />
        <span style={{ fontFamily: ZH, fontSize: 26, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</span>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginLeft: 8, opacity: 0.7 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: prog(t, at, at + 0.2),
        transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
        <span style={{ fontFamily: ZH, fontSize: 176, fontWeight: 900, letterSpacing: '0.12em',
          backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          《缘分方程》
        </span>
      </div>
      <div style={{ position: 'absolute', left: 960 - 330, top: 640, width: 660, height: 2, background: C.rouge, opacity: 0.85,
        transform: `scaleX(${lineP})`, boxShadow: '0 0 8px rgba(184,72,59,0.6)' }} />
      <Subtitle t={t} at={at + 0.6} out={21} zh="遇见Ta的概率，能算吗？" en="The Odds of Meeting the One" y={745} size={72} enSize={38} showEn band={false} />
    </AbsoluteFill>
  );
};

/* ---------- S04 · Green Bank, 1961 (20.69 → 28.79) ---------- */
const bgStars = (ctx: CanvasRenderingContext2D, a: number, n = 260) => {
  for (let i = 0; i < n; i++) {
    const s = STARS[i];
    glowDot(ctx, s.x, s.y - 200, s.r, s.a * a * 0.8, '235,228,210', 3);
  }
};

export const Dish: React.FC<{ t: number }> = ({ t }) => {
  const S = 20.69, E = 26.773;
  const o = Math.min(prog(t, S, S + 0.4), 1 - prog(t, E - 0.25, E + 0.1));
  const d = easeOut(prog(t, S + 0.3, S + 1.2));
  const pulses = [0, 2, 4, 6, 8, 10].map((k) => beatAfter(S + 1.9, k));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <CanvasLayer t={t} draw={(ctx) => bgStars(ctx, easeOut(prog(t, S, S + 1)))} />
      <YearStamp t={t} at={S} out={E + 0.6} year="1961" place="绿岸 · WEST VIRGINIA" />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs><Wobble id="wobDish" /></defs>
        <g transform={`translate(1400 ${832 + (1 - d) * 40})`} opacity={d} filter="url(#wobDish)">
          <Telescope tilt={-28}>
            {pulses.map((p, i) => {
              const k = prog(t, p, p + 2.2);
              if (k <= 0 || k >= 1) return null;
              const r = lerp(30, 520, easeOut(k));
              return <path key={i} d={`M ${-r * 0.55} ${-280 - r * 0.8} A ${r} ${r} 0 0 1 ${r * 0.55} ${-280 - r * 0.8}`} fill="none" stroke={C.goldHi} strokeWidth={4} strokeLinecap="round" opacity={0.7 * (1 - k)} />;
            })}
          </Telescope>
        </g>
      </svg>
      <div style={{ opacity: easeOut(prog(t, S + 0.5, S + 1.2)), transform: `translateY(${(1 - easeOut(prog(t, S + 0.5, S + 1.3))) * 40}px)` }}>
        <PeepFig body="ShirtCoat" face="Explaining" hair="Pomp" acc="GlassRound" x={560} y={860} h={500} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, height: 280, background: 'linear-gradient(180deg, #0d1017 0%, #090a0f 100%)' }} />
      <Subtitle t={t} at={S + 0.2} out={23.6} zh="天文学家德雷克，一直在监听外星信号" en="Astronomer Frank Drake wanted to know" />
      <Subtitle t={t} at={23.75} out={E - 0.1} zh="银河系里，有多少文明能和我们对话？" en="how many civilisations in our galaxy could talk to us." />
    </AbsoluteFill>
  );
};

/* ---------- S05–S06 · the equation, then filtering the sky (28.79 → 49.04) ---------- */
export const DRAKE: { sym: React.ReactNode; label: string }[] = [
  { sym: <Sub a="R" b="*" />, label: '恒星诞生' },
  { sym: <Sub a="f" b="p" />, label: '有行星' },
  { sym: <Sub a="n" b="e" />, label: '宜居行星' },
  { sym: <Sub a="f" b="l" />, label: '出现生命' },
  { sym: <Sub a="f" b="i" />, label: '出现智慧' },
  { sym: <Sub a="f" b="c" />, label: '能发信号' },
  { sym: 'L', label: '文明寿命' },
];
const KEEP = [1, 0.72, 0.5, 0.34, 0.22, 0.13, 0.07, 0.035];

export const EquationSky: React.FC<{ t: number }> = ({ t }) => {
  const S = 26.773, F = 33.855, R = 37.4, X = 45.0, E = 49.041;
  const o = Math.min(prog(t, S, S + 0.3), 1);
  const up = easeInOut(prog(t, F, F + 0.9));
  const rowY = lerp(420, 40, up), rowS = lerp(1, 0.8, up);
  const rowO = 1 - easeInOut(prog(t, X + 0.3, X + 1.3));
  const steps = [1, 2, 3, 4, 5, 6, 7].map((k) => beatAfter(F + 0.5, k - 1));
  let cur = 0;
  steps.forEach((s, i) => { if (t >= s) cur = i + 1; });
  const skyO = easeOut(prog(t, F, F + 0.8)) * (1 - easeInOut(prog(t, X + 0.2, X + 1.6)));
  const roll = easeInOut(prog(t, X + 0.3, X + 2.6));
  const yr = t < X + 0.3 ? '1961' : String(Math.round(lerp(1961, 2010, roll)));
  const place = t < X + 0.3 ? '绿岸 · WEST VIRGINIA' : roll < 1 ? '……' : '英国 · WARWICK';
  const resO = inOut(t, R + 0.25, X + 0.1, 0.6, 0.4);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <YearStamp t={t} at={S - 1.6} out={F + 0.5} year="1961" place="绿岸 · WEST VIRGINIA" />
      <YearStamp t={t} at={X + 0.1} out={E + 0.6} year={yr} place={place} />
      <CanvasLayer t={t} opacity={skyO} draw={(ctx) => {
        STARS.forEach((s, i) => {
          // time this star gets filtered out
          let dieAt = 999;
          for (let k = 1; k < KEEP.length; k++) if (s.u >= KEEP[k] && dieAt === 999) dieAt = steps[k - 1];
          const fade = 1 - prog(t, dieAt, dieAt + 0.5);
          if (fade <= 0) return;
          const survivor = s.u < KEEP[Math.min(cur, 7)];
          const goldness = survivor ? prog(cur, 3, 7) : 0;
          const rgb = goldness > 0.5 ? '240,213,154' : '225,222,210';
          glowDot(ctx, s.x, s.y + 60, s.r * 1.45 * (1 + goldness * 0.8), Math.min(1, s.a * 1.25) * fade * (0.75 + goldness * 0.25), rgb, 3.5);
        });
      }} />
      {/* equation row */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: rowY, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        transform: `scale(${rowS})`, transformOrigin: '50% 0', opacity: rowO }}>
        <Term sym="N" label="文明数量" o={easeOut(prog(t, S, S + 0.4))} hi={0} />
        <div style={{ fontFamily: EN, fontSize: 64, color: C.dim, margin: '0 18px', opacity: easeOut(prog(t, S, S + 0.4)), lineHeight: '80px' }}>=</div>
        {DRAKE.map((d, i) => {
          const at = beatAfter(S, i + 1);
          const hi = t >= steps[i] ? Math.min(1, prog(t, steps[i], steps[i] + 0.3)) * (i === cur - 1 ? 1 : 0.55) : 0;
          return (
            <React.Fragment key={i}>
              {i > 0 && <Times o={easeOut(prog(t, at - 0.1, at + 0.2))} />}
              <Term sym={d.sym} label={d.label} o={easeOut(prog(t, at, at + 0.4))} hi={hi} />
            </React.Fragment>
          );
        })}
      </div>
      {resO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: resO }}>
          <div style={{ display: 'inline-block', padding: '26px 60px', background: 'radial-gradient(ellipse, rgba(15,16,22,0.92) 40%, rgba(15,16,22,0) 75%)' }}>
            <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 88, color: C.goldHi, letterSpacing: '0.02em' }}>1,000 ~ 100,000,000</div>
          </div>
        </div>
      )}
      <Subtitle t={t} at={S + 0.15} out={29.9} zh="1961年，他写下了一个公式" />
      <Subtitle t={t} at={30.05} out={F - 0.1} zh="把没法回答的大问题，拆成一串小问题" en="Break an impossible question into small ones you can estimate." />
      <Subtitle t={t} at={F + 0.2} out={R - 0.05} zh="每乘一项，星星就少一些" en="Each term filters the sky." />
      <Subtitle t={t} at={R + 0.1} out={41.35} zh="当年的答案：1000 到 1亿个文明" en="The 1961 answer: 1,000 to 100 million civilisations." />
      <Subtitle t={t} at={41.5} out={X - 0.1} zh="但至今，我们还没收到过|一条外星信号" />
      <Subtitle t={t} at={X + 0.15} out={E - 0.15} zh="49年后，一个单身的经济学家借走了它" en="Forty-nine years later, a single economist borrowed it." />
    </AbsoluteFill>
  );
};

export { easeIn };

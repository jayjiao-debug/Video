import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, inOut } from '../lib';
import { Subtitle, Glow, LineIcon } from '../ui';
import { CanvasLayer, rnd, glowDot } from './common';
import { STARS } from './scenes1';
import { HANDOFF } from './scenes2';
import { PeepFig } from '../v/scenesV';
import { INK, CREAM, Wobble, Telescope, Ufo, Heart, Sparkle } from './ink';

const win = (t: number, S: number, E: number, fin = 0.4) => Math.min(prog(t, S, S + fin), 1 - prog(t, E - 0.25, E + 0.1));

/* ---------- S13 · one in 155,000 (85.5 → 93.6) ---------- */
/* field geometry: 13 × 2 = 26 equal districts, one gold dot in each */
const FX0 = 125, FX1 = 1795, FY0 = 140, FY1 = 780, NC = 13, NR = 2;
const CWD = (FX1 - FX0) / NC, CHT = (FY1 - FY0) / NR;
const HERO_C = 6, HERO_R = 1;
const HERO = { x: FX0 + (HERO_C + 0.5) * CWD, y: FY0 + (HERO_R + 0.5) * CHT };
const edge = (x: number, y: number) => {
  const m = Math.min(x - FX0, FX1 - x, y - FY0, FY1 - y);
  return Math.max(0, Math.min(1, m / 50));
};
const FIELD = (() => {
  const out: { x: number; y: number; a: number; c: number }[] = [];
  for (let i = 0; i < 36000; i++) {
    const x = FX0 + rnd(`fx${i}`) * (FX1 - FX0), y = FY0 + rnd(`fy${i}`) * (FY1 - FY0);
    const c = Math.floor((x - FX0) / CWD) + NC * Math.floor((y - FY0) / CHT);
    out.push({ x, y, a: (0.28 + 0.4 * rnd(`fa${i}`)) * (0.25 + 0.75 * edge(x, y)), c });
  }
  return out;
})();
const GOLDS = Array.from({ length: NC * NR }, (_, k) => {
  const cc = k % NC, rr = Math.floor(k / NC);
  const hero = cc === HERO_C && rr === HERO_R;
  return {
    c: k, hero,
    x: hero ? HERO.x : FX0 + (cc + 0.2 + 0.6 * rnd(`gx${k}`)) * CWD,
    y: hero ? HERO.y : FY0 + (rr + 0.2 + 0.6 * rnd(`gy${k}`)) * CHT,
    d: rnd(`gd${k}`),
  };
});
const HERO_CELL = HERO_C + NC * HERO_R;

export const Grid155: React.FC<{ t: number }> = ({ t }) => {
  const S = 85.5, B = 89.54, E = 93.6;
  const o = 1 - prog(t, E - 0.25, E + 0.1);
  const reveal = easeInOut(prog(t, S + 0.3, S + 1.9)) * 1300;
  const drift = easeInOut(prog(t, S + 1.1, S + 2.1));
  const hx = lerp(HANDOFF.x, HERO.x, drift), hy = lerp(HANDOFF.y, HERO.y, drift);
  const pulse = 1 + 0.15 * Math.sin((t - S) * Math.PI);
  const lab1 = easeOut(prog(t, S + 1.0, S + 1.6)) * (1 - prog(t, B - 0.3, B));
  const leg = easeOut(prog(t, S + 2.2, S + 2.8));
  const lines = easeInOut(prog(t, B + 0.05, B + 0.8));
  const dimP = easeInOut(prog(t, B + 0.7, B + 1.4));
  const lab2 = easeOut(prog(t, B + 0.1, B + 0.7));
  const box = easeOut(prog(t, B + 0.9, B + 1.5));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <CanvasLayer t={t} draw={(ctx) => {
        for (const f of FIELD) {
          const d = Math.hypot(f.x - HANDOFF.x, (f.y - HANDOFF.y) * 1.5);
          const r = Math.max(0, Math.min(1, (reveal - d) / 140));
          if (r <= 0) continue;
          const dim = f.c === HERO_CELL ? 1 : lerp(1, 0.3, dimP);
          ctx.fillStyle = `rgba(178,186,204,${f.a * r * dim})`;
          ctx.fillRect(f.x, f.y, 1.7, 1.7);
        }
        // district lines
        if (lines > 0) {
          ctx.strokeStyle = `rgba(201,164,92,${0.4 * lines})`;
          ctx.lineWidth = 1.2;
          for (let c = 1; c < NC; c++) {
            const x = FX0 + c * CWD;
            ctx.beginPath(); ctx.moveTo(x, FY0 + 10); ctx.lineTo(x, lerp(FY0 + 10, FY1 - 10, lines)); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(FX0 + 10, FY0 + CHT); ctx.lineTo(lerp(FX0 + 10, FX1 - 10, lines), FY0 + CHT); ctx.stroke();
        }
        if (box > 0) {
          ctx.strokeStyle = `rgba(240,213,154,${0.95 * box})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(FX0 + HERO_C * CWD + 1, FY0 + HERO_R * CHT + 1, CWD - 2, CHT - 2);
        }
        // the other 25 gold dots
        GOLDS.forEach((g) => {
          if (g.hero) return;
          const at = S + 1.7 + g.d * 1.2;
          const p = easeOut(prog(t, at, at + 0.35));
          if (p <= 0) return;
          const flare = 1 + 1.4 * Math.max(0, 1 - (t - at) * 2.5);
          glowDot(ctx, g.x, g.y, 4 * flare, p * lerp(1, 0.45, dimP), '240,213,154', 5);
        });
        glowDot(ctx, hx, hy, 5.5 * pulse, 1, '240,213,154', 7);
      }} />
      {/* phase 1 label: what the crowd is */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', opacity: lab1, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: ZH, fontSize: 50, fontWeight: 600, color: C.paper, letterSpacing: '0.06em', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>约404万 伦敦女性</span>
        <span style={{ display: 'inline-block', width: 60 }} />
        <span style={{ opacity: leg, fontFamily: ZH, fontSize: 50, fontWeight: 600, color: C.goldHi, letterSpacing: '0.06em', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
          <span style={{ fontSize: 34, verticalAlign: '0.15em', marginRight: 14 }}>●</span>适合他的 26 个
        </span>
      </div>
      {/* phase 2 label */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', opacity: lab2 }}>
        <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 84, color: C.goldHi, fontVariantNumeric: 'lining-nums', textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>1 / 155,000</span>
      </div>
      <Subtitle t={t} at={S + 0.2} out={B - 0.1} zh="约404万伦敦女性里，只有*26*个" en="Of about four million women in London, twenty-six." />
      <Subtitle t={t} at={B + 0.05} out={E - 0.1} zh="差不多每*15.5万*人里，才有1个" en="Roughly one in every 155,000." />
    </AbsoluteFill>
  );
};

/* ---------- S14 · aliens vs a girlfriend (93.6 → 97.64) ---------- */
const InkCard: React.FC<{ x: number; y: number; w: number; h: number; p: number; id: string; children?: React.ReactNode; art?: React.ReactNode }> = ({ x, y, w, h, p, id, children, art }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${lerp(0.94, 1, p)})` }}>
    <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs><Wobble id={id} scale={3} /></defs>
      <g filter={`url(#${id})`}>
        <rect x={6} y={6} width={w - 12} height={h - 12} rx={20} fill={CREAM} stroke={INK} strokeWidth={6} />
        {art}
      </g>
    </svg>
    {children}
  </div>
);

export const Aliens: React.FC<{ t: number }> = ({ t }) => {
  const S = 93.6, E = 97.64;
  const o = win(t, S, E, 0.3);
  const a1 = easeOut(prog(t, S, S + 0.6)), a2 = easeOut(prog(t, beatAfter(S, 1), beatAfter(S, 1) + 0.6));
  const mid = easeOut(prog(t, beatAfter(S, 2), beatAfter(S, 2) + 0.5));
  const CW = 460, CH = 400, TOP = 110;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <InkCard x={190} y={TOP} w={CW} h={CH} p={a1} id="wobA" art={
        <>
          <line x1={30} y1={362} x2={430} y2={362} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          {[60, 110, 330, 390].map((x, i) => <line key={i} x1={x} y1={368} x2={x + 20} y2={368} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
          <g transform="translate(150 362) scale(0.5)"><Telescope tilt={30} /></g>
          <path d="M 222 150 Q 250 120 262 128 M 240 176 Q 276 136 292 150" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray="3 12" />
          <g transform="translate(345 105) rotate(-8) scale(0.72)"><Ufo /></g>
          <Sparkle x={70} y={70} s={1.1} /><Sparkle x={200} y={48} s={0.7} /><Sparkle x={410} y={215} s={0.8} /><Sparkle x={105} y={160} s={0.6} />
        </>
      } />
      <InkCard x={1270} y={TOP} w={CW} h={CH} p={a2} id="wobB" art={
        <>
          <g transform="translate(365 88) rotate(12) scale(0.85)"><Heart /></g>
          <g transform="translate(92 120) rotate(-14) scale(0.45)"><Heart /></g>
          <g transform="translate(400 190) rotate(10) scale(0.32)"><Heart /></g>
          <Sparkle x={300} y={40} s={0.7} /><Sparkle x={60} y={230} s={0.8} />
        </>
      }>
        <PeepFig body="Sweater" face="Smile" hair="Long" x={CW / 2 - 10} y={CH - 6} h={330} glow={false} />
      </InkCard>
      {[{ x: 190, p: a1, zh: '找到外星文明' }, { x: 1270, p: a2, zh: '找到女朋友' }].map((it, i) => (
        <div key={i} style={{ position: 'absolute', left: it.x, width: CW, top: TOP + CH + 26, textAlign: 'center', fontFamily: ZH, fontSize: 52, fontWeight: 600, color: C.paper, letterSpacing: '0.06em', opacity: it.p, whiteSpace: 'nowrap' }}>{it.zh}</div>
      ))}
      <div style={{ position: 'absolute', left: 700, width: 520, top: 220, textAlign: 'center', opacity: mid, transform: `scale(${lerp(1.2, 1, mid)})` }}>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 150, color: C.goldHi, lineHeight: 1, fontVariantNumeric: 'lining-nums' }}>≈100×</div>
        <div style={{ fontFamily: ZH, fontSize: 40, color: C.paper, opacity: 0.85, marginTop: 22, letterSpacing: '0.04em' }}>只容易这么一点</div>
      </div>
      <Subtitle t={t} at={S + 0.2} out={E - 0.1} zh="找女朋友，只比找外星人容易约*100倍*" en="A girlfriend: only about 100 times easier to find than aliens." />
    </AbsoluteFill>
  );
};

/* ---------- S15 · your number (97.64 → 105.74) ---------- */
const ROWS: [string, string][] = [
  ['你的城市人口', '10,000,000'], ['× 性别符合', '50%'], ['× 年龄相仿', '15%'], ['× 单身', '40%'], ['× 学历相当', '30%'],
  ['× 你心动', '10%'], ['× Ta也心动', '10%'], ['× 合得来', '30%'],
];

export const YourNumber: React.FC<{ t: number }> = ({ t }) => {
  const S = 97.64, E = 105.74;
  const o = win(t, S, E);
  const resAt = beatAfter(S, 8);
  const rp = easeOut(prog(t, resAt, resAt + 0.5));
  const lineP = easeOut(prog(t, resAt + 0.7, resAt + 1.6));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 470, top: 40, width: 980, padding: '28px 60px 26px', boxSizing: 'border-box',
        border: `1.5px solid rgba(201,164,92,0.55)`, background: 'linear-gradient(180deg, rgba(26,29,42,0.9), rgba(15,16,22,0.9))',
        opacity: easeOut(prog(t, S, S + 0.5)), boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: ZH, fontSize: 46, color: C.paper, letterSpacing: '0.14em' }}>你的缘分方程</div>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 34, color: C.rouge, border: `3px solid ${C.rouge}`, padding: '2px 12px', transform: 'rotate(-6deg)' }}>示例</div>
        </div>
        {ROWS.map(([l, v], i) => {
          const p = easeOut(prog(t, beatAfter(S, i), beatAfter(S, i) + 0.35));
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', height: 62, opacity: p, transform: `translateX(${(1 - p) * -16}px)`,
              borderBottom: '1px solid rgba(235,228,210,0.08)' }}>
              <span style={{ fontFamily: ZH, fontSize: 42, color: C.paper, letterSpacing: '0.04em' }}>{l}</span>
              <span style={{ fontFamily: EN, fontSize: 52, color: i === 0 ? C.paper : C.gold }}>{v}</span>
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, opacity: rp }}>
          <span style={{ fontFamily: ZH, fontSize: 46, color: C.goldHi, letterSpacing: '0.1em' }}>= 约</span>
          <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 80, color: C.goldHi }}>270 <span style={{ fontFamily: ZH, fontSize: 42 }}>人</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6, opacity: easeOut(prog(t, resAt + 0.5, resAt + 1.0)) }}>
          <span style={{ fontFamily: ZH, fontSize: 40, color: C.paper, opacity: 0.8, letterSpacing: '0.06em' }}>你的数字：</span>
          <span style={{ display: 'inline-block', width: 260, height: 2, background: C.gold, transform: `scaleX(${lineP})`, transformOrigin: 'left' }} />
        </div>
      </div>
      <Subtitle t={t} at={S + 0.15} out={101.55} zh="换成你的城市、你的标准" en="Try it with your city and your standards." />
      <Subtitle t={t} at={101.7} out={E - 0.1} zh="算出你的数字，写在评论区" en="Work out your number. Post it in the comments." />
    </AbsoluteFill>
  );
};

/* ---------- S16–S18 · the true ending (105.74 → 121.95) ---------- */
const PEOPLE = new Array(26).fill(0).map((_, j) => ({ x: 330 + rnd(`px${j}`) * 1260, y: 250 + rnd(`py${j}`) * 380 }));
const HIM = 4, ROSE = 19;
PEOPLE[HIM] = { x: 600, y: 470 };
PEOPLE[ROSE] = { x: 1320, y: 420 };
const MEET = { x: 960, y: 445 };

export const Story: React.FC<{ t: number }> = ({ t }) => {
  const S = 105.74, M = 109.78, T = 115.87, E = 121.95;
  const o = Math.min(prog(t, S - 0.1, S + 0.5), 1 - prog(t, E - 0.25, E + 0.1));
  const himGlow = easeOut(prog(t, S + 0.8, S + 2.2));
  const others = lerp(1, 0.3, easeInOut(prog(t, M, M + 0.8)));
  const lantern = easeOut(prog(t, T, T + 1.5));
  const move = easeInOut(prog(t, M + 0.3, M + 3.9));
  const merge = easeOut(prog(t, M + 3.8, M + 4.4));
  const hp = { x: lerp(PEOPLE[HIM].x, MEET.x - 14, move), y: lerp(PEOPLE[HIM].y, MEET.y, move) };
  const rp = { x: lerp(PEOPLE[ROSE].x, MEET.x + 14, move), y: lerp(PEOPLE[ROSE].y, MEET.y, move) };
  const threadO = easeOut(prog(t, M + 0.6, M + 1.4));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <CanvasLayer t={t} draw={(ctx) => {
        PEOPLE.forEach((p, j) => {
          if (j === HIM || j === ROSE) return;
          const a = others * (0.85 + 0.15 * lantern);
          glowDot(ctx, p.x, p.y, 4 + lantern * 1.5, a, lantern > 0.3 ? '236,176,98' : '240,213,154', 4 + lantern * 5);
        });
        if (threadO > 0) {
          ctx.strokeStyle = `rgba(184,72,59,${0.85 * threadO})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(184,72,59,0.6)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(hp.x, hp.y);
          ctx.quadraticCurveTo((hp.x + rp.x) / 2, Math.max(hp.y, rp.y) + 60 * (1 - move), rp.x, rp.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        glowDot(ctx, hp.x, hp.y, 5 + himGlow * 2 + merge * 2, 1, '240,213,154', 5 + himGlow * 4 + merge * 6);
        glowDot(ctx, rp.x, rp.y, 5 + merge * 4, lerp(others, 1, easeOut(prog(t, M, M + 0.6))), '240,213,154', 5 + merge * 6);
      }} />

      {(() => {
        const dO = Math.min(easeOut(prog(t, 112.9, 113.8)), 1 - easeInOut(prog(t, T - 0.4, T + 0.2)));
        if (dO <= 0) return null;
        return (
          <AbsoluteFill style={{ opacity: dO }}>
            <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #3a2616 0%, #1a110b 55%, #0c0806 100%)' }} />
            <CanvasLayer t={t} draw={(ctx) => {
              for (let i = 0; i < 30; i++) {
                const x = rnd(`dk${i}`) * 1920, y = 80 + rnd(`dl${i}`) * 520, r = 24 + rnd(`dm${i}`) * 60;
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, 'rgba(255,190,110,0.26)'); g.addColorStop(1, 'rgba(255,190,110,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
              }
            }} />
            <PeepFig body="ButtonShirt" face="Smile" hair="ShortWavy" x={700} y={760} h={470} glow={false} />
            <PeepFig body="Coffee" face="Smile" hair="Bangs" x={1220} y={760} h={470} flip glow={false} />
            <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
              <defs><radialGradient id="candleL"><stop offset="0" stopColor="#ffd08a" stopOpacity="0.55" /><stop offset="1" stopColor="#ff9c50" stopOpacity="0" /></radialGradient></defs>
              <circle cx={960} cy={640} r={300} fill="url(#candleL)" />
              <rect x={0} y={680} width={1920} height={20} fill="#3a2616" />
              <rect x={0} y={700} width={1920} height={380} fill="#4a2820" opacity={0.96} />
              <rect x={948} y={590} width={24} height={92} fill="#efe6d0" />
              <path d="M 960 556 Q 972 576 960 590 Q 948 576 960 556 Z" fill="#ffd27a" />
              <path d="M 860 680 L 860 630 M 844 590 Q 860 640 876 590 Z M 1060 680 L 1060 630 M 1044 590 Q 1060 640 1076 590 Z" stroke="#e9e2d3" strokeWidth={4} fill="rgba(160,40,50,0.6)" />
            </svg>
          </AbsoluteFill>
        );
      })()}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: easeOut(prog(t, T + 0.25, T + 0.9)) }}>
        <span style={{ fontFamily: ZH, fontWeight: 600, fontSize: 60, color: C.goldHi, letterSpacing: '0.06em' }}><span style={{ fontFamily: EN, fontSize: 70 }}>26</span> 人之一</span>
      </div>
      <Subtitle t={t} at={S + 0.15} out={M - 0.1} zh="但故事，还没有结束" en="But the story didn't end there." />
      <Subtitle t={t} at={M + 0.1} out={112.7} zh="几年后，一次朋友的晚餐上" en="A few years later, at a dinner with friends," />
      <Subtitle t={t} at={112.82} out={T - 0.1} zh="他偶然遇见了Rose。后来，他们结婚了" en="he met Rose by chance. They married." />
      <Subtitle t={t} at={T + 0.25} out={118.75} zh="她，恰好就是那*26*个人之一" en="She was one of the twenty-six." />
      <Subtitle t={t} at={118.9} out={E - 0.1} zh="小概率，不等于不会发生" en="Unlikely is not impossible." />
    </AbsoluteFill>
  );
};

/* ---------- S19–S20 · the boat (121.95 → 130.5) ---------- */
const ridge = (seed: string, base: number, amp: number) => {
  let d = `M -20 1080 L -20 ${base}`;
  for (let x = -20; x <= 1940; x += 40) {
    const y = base - amp * (0.5 + 0.5 * Math.sin(x / 210 + rnd(seed) * 6)) * (0.6 + 0.4 * Math.sin(x / 83 + rnd(seed + 'b') * 6));
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ' L 1940 1080 Z';
};
const RIDGES = [ridge('m1', 600, 150), ridge('m2', 630, 100), ridge('m3', 655, 60)];
const RIPPLES = new Array(46).fill(0).map((_, i) => ({ x: rnd(`rx${i}`) * 1920, y: 700 + Math.pow(rnd(`ryy${i}`), 1.4) * 360, w: 30 + rnd(`rw${i}`) * 120 }));

const Boat: React.FC<{ lantern: number }> = ({ lantern }) => (
  <g>
    <path d="M -150 0 Q -120 34 0 38 Q 120 34 158 -6 Q 60 10 -150 0 Z" fill="#0a0b10" stroke="#3a4152" strokeWidth={1.2} />
    <path d="M -80 2 Q -60 -62 0 -66 Q 62 -62 82 4 Z" fill="#12151e" stroke="#2a2f3d" strokeWidth={1.5} />
    <line x1={120} y1={-4} x2={120} y2={-70} stroke="#0a0b10" strokeWidth={3} />
    <line x1={120} y1={-70} x2={146} y2={-70} stroke="#0a0b10" strokeWidth={2} />
    <circle cx={146} cy={-54} r={60} fill="url(#lanternGlow)" opacity={lantern} />
    <rect x={139} y={-66} width={14} height={20} rx={4} fill="#e9a24e" opacity={0.9 * lantern + 0.1} />
  </g>
);

export const River: React.FC<{ t: number }> = ({ t }) => {
  const S = 121.95, F = 125.99, END = 130.5;
  const o = Math.min(prog(t, S - 0.1, S + 0.6), 1 - easeInOut(prog(t, 129.2, END)));
  const bx = lerp(430, 900, prog(t, S, END));
  const by = 682 + Math.sin(t * 2.2) * 2.5;
  const cal = easeInOut(prog(t, S + 0.2, S + 1.8));
  const seal = easeOut(prog(t, S + 1.7, S + 2.1));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <CanvasLayer t={t} draw={(ctx) => {
        STARS.forEach((s, i) => { if (i < 700) glowDot(ctx, s.x, (s.y - 250) * 0.72 + 40, s.r * 0.9, s.a * 0.75, '235,228,210', 3); });
      }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a27" /><stop offset="1" stopColor="#07080c" /></linearGradient>
          <radialGradient id="mist" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#9aa8bd" stopOpacity="0.16" /><stop offset="1" stopColor="#9aa8bd" stopOpacity="0" /></radialGradient>
          <radialGradient id="lanternGlow"><stop offset="0" stopColor="#ffcf86" stopOpacity="0.75" /><stop offset="1" stopColor="#ffb760" stopOpacity="0" /></radialGradient>
          <linearGradient id="streak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9a24e" stopOpacity="0.45" /><stop offset="1" stopColor="#e9a24e" stopOpacity="0" /></linearGradient>
        </defs>
        <path d={RIDGES[0]} fill="#1b2131" />
        <path d={RIDGES[1]} fill="#151a27" />
        <ellipse cx={960} cy={650} rx={1100} ry={70} fill="url(#mist)" />
        <path d={RIDGES[2]} fill="#10141e" />
        <rect x={0} y={680} width={1920} height={400} fill="url(#water)" />
        {RIPPLES.map((r, i) => <line key={i} x1={r.x} x2={r.x + r.w} y1={r.y} y2={r.y} stroke="#9aa8bd" strokeOpacity={0.08 + 0.1 * ((r.y - 700) / 360)} strokeWidth={1.2} />)}
        {/* reflection */}
        <g transform={`translate(${bx} ${by + 62}) scale(1.4 -1.4)`} opacity={0.13}><Boat lantern={1} /></g>
        <ellipse cx={bx + 204} cy={by + 120} rx={9} ry={80} fill="url(#streak)" opacity={0.55} />
        <g transform={`translate(${bx} ${by}) scale(1.4)`}><Boat lantern={1} /></g>
      </svg>
      <div style={{ position: 'absolute', left: 1540, top: 150, writingMode: 'vertical-rl', fontFamily: '"Ma Shan Zheng", serif', fontSize: 92, color: C.paper,
        letterSpacing: '0.12em', opacity: 0.92, clipPath: `inset(0 0 ${(1 - cal) * 100}% 0)`, textShadow: '0 0 20px rgba(0,0,0,0.6)' }}>
        百年修得同船渡
      </div>
      <div style={{ position: 'absolute', left: 1500, top: 150 + 7 * 92 * 1.12 + 20, width: 54, height: 54, background: C.rouge, color: '#f3e7d3', opacity: seal,
        fontFamily: '"Ma Shan Zheng", serif', fontSize: 38, lineHeight: '54px', textAlign: 'center', transform: `scale(${lerp(1.4, 1, seal)})`, borderRadius: 4 }}>缘</div>
      <Subtitle t={t} at={S + 0.15} out={F - 0.05} zh="老话说：百年修得同船渡" en="An old saying: a hundred years of fate to share one boat." />
      <Subtitle t={t} at={F + 0.1} out={END + 1} zh="能遇见任何一个人，|本来就是天文数字" en="Meeting anyone at all is astronomically unlikely." y={300} size={84} band={false} />
      <Subtitle t={t} at={127.4} out={END + 1} zh="这，大概就是*缘分*" en="That, perhaps, is what fate means." y={520} size={100} weight={700} band={false} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: easeOut(prog(t, 127.9, 128.6)) }}>
        <span style={{ fontFamily: ZH, fontSize: 34, color: C.gold, letterSpacing: '0.3em' }}>《缘分方程》 · VIBE知识大赏</span>
      </div>
    </AbsoluteFill>
  );
};

export { Glow };

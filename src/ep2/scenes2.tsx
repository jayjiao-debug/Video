import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, inOut } from '../lib';
import { Subtitle, YearStamp, Dust, Glow } from '../ui';
import { CanvasLayer, rnd, glowDot, Term, Times } from './common';
import { STARS, DRAKE } from './scenes1';
import { PeepFig } from '../v/scenesV';
import { Mug, Steam } from './ink';

/* ---------- S07–S08 · a lit window, 2010 (49.04 → 63.20) ---------- */
const CALC = ['×0.51', '×13%', '×0.20', '×26%', '×5%', '≈ ?'];
const BACKUS = ['英国人口', '女性', '住伦敦', '24–34岁', '大学学历', '他心动', '她也心动', '合得来', '单身'];

export const Window: React.FC<{ t: number }> = ({ t }) => {
  const S = 49.041, M = 58.15, E = 63.2;
  const o = Math.min(prog(t, S - 0.25, S + 0.3), 1 - prog(t, E - 0.25, E + 0.1));
  const Q = 55.45; // "same formula" line: the room dims, Drake's equation shows
  const dim = 1 - 0.62 * easeInOut(prog(t, Q, Q + 0.7));
  const breathe = 0.92 + 0.06 * Math.sin(t * Math.PI * 0.5);
  const cols = [900, 1170, 1440], rows = [170, 500, 830];
  const drakeO = inOut(t, Q + 0.1, M + 0.45, 0.4, 0.45);
  const drakeUp = easeInOut(prog(t, M, M + 0.45)) * 60;
  const bandO = easeOut(prog(t, Q, Q + 0.6));
  const BL = 0.50625;
  const b0 = beatAfter(M + 0.45, 0);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #181c28 0%, #12151e 100%)' }} />
        {/* window with the London night */}
        <div style={{ position: 'absolute', left: 1080, top: 110, width: 660, height: 560, overflow: 'hidden', background: 'linear-gradient(180deg, #1b2342 0%, #2a2a3c 100%)' }}>
          <CanvasLayer t={t} w={660} h={560} draw={(ctx) => { STARS.forEach((s, i) => { if (i < 160) glowDot(ctx, (s.x * 0.37) % 660, (s.y - 250) * 0.5, s.r, s.a * 0.8, '235,228,210', 3); }); }} />
          <svg width={660} height={560} style={{ position: 'absolute', left: 0, top: 0 }}>
            <g fill="#141826">
              <rect x={420} y={130} width={56} height={430} /><rect x={410} y={200} width={76} height={70} />
              <path d="M 420 130 L 448 50 L 476 130 Z" />
              {[[0, 330, 120], [110, 280, 90], [200, 360, 110], [300, 300, 100], [500, 340, 80], [570, 290, 100]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={560 - y} />)}
            </g>
            <circle cx={448} cy={235} r={22} fill="#e9d6a0" opacity={0.85} />
            {new Array(70).fill(0).map((_, i) => <rect key={i} x={(i * 53) % 640 + 8} y={320 + ((i * 37) % 220)} width={7} height={10} fill="#e9c27a" opacity={0.35 + ((i * 13) % 10) / 20} />)}
          </svg>
          <div style={{ position: 'absolute', left: 325, top: 0, width: 12, height: 560, background: '#2a2f3f' }} />
          <div style={{ position: 'absolute', left: 0, top: 270, width: 660, height: 12, background: '#2a2f3f' }} />
        </div>
        <div style={{ position: 'absolute', left: 1070, top: 100, width: 680, height: 580, border: '12px solid #2a2f3f', boxSizing: 'border-box' }} />
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><radialGradient id="lampI"><stop offset="0" stopColor="#ffe3a8" stopOpacity="0.85" /><stop offset="1" stopColor="#ffb760" stopOpacity="0" /></radialGradient></defs>
          <circle cx={1240} cy={760} r={380} fill="url(#lampI)" opacity={breathe * 0.75} />
          <path d="M 1210 700 L 1290 700 L 1270 650 L 1230 650 Z" fill="#b8483b" />
          <line x1={1250} y1={700} x2={1250} y2={790} stroke="#2a1d12" strokeWidth={6} />
          <rect x={1215} y={786} width={70} height={10} rx={3} fill="#2a1d12" />
          <rect x={1360} y={784} width={110} height={10} fill="#efe6d0" transform="rotate(-4 1415 789)" />
        </svg>
        <PeepFig body="Geek" face="Calm" hair="ShortWavy" x={760} y={930} h={600} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 790, height: 290, background: 'linear-gradient(180deg, #3a2818 0px, #3a2818 18px, #1c140d 18px, #120d09 100%)' }} />
        {/* coffee + steam */}
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <g transform="translate(1105 800)"><Mug /></g>
          <g transform="translate(1105 700)"><Steam t={t} /></g>
        </svg>
        {/* his calculations drifting up from the laptop */}
        {CALC.map((c, k) => {
          const at = beatAfter(49.6, 2 * k);
          const p = prog(t, at, at + 2.6);
          if (p <= 0 || p >= 1) return null;
          const a = Math.min(easeOut(prog(p, 0, 0.2)), 1 - easeInOut(prog(p, 0.6, 1)));
          const x = 848 + (k % 3) * 30 + Math.sin(p * Math.PI * 1.2 + k) * 12;
          const y = 640 - easeOut(p) * 230;
          return <div key={k} style={{ position: 'absolute', left: x, top: y, fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 58,
            color: C.goldHi, opacity: a * 0.95, transform: `rotate(${(k % 2 ? 1 : -1) * 6}deg)`, textShadow: '0 2px 10px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{c}</div>;
        })}
      </AbsoluteFill>
      <YearStamp t={t} at={S - 0.6} out={E + 0.6} year="2010" place="英国 · WARWICK" />
      {/* equation morph band */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, height: 360, opacity: bandO,
        background: 'linear-gradient(180deg, rgba(15,16,22,0) 0%, rgba(15,16,22,0.88) 25%, rgba(15,16,22,0.88) 75%, rgba(15,16,22,0) 100%)' }} />
      {drakeO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', opacity: drakeO * 0.9, transform: `translateY(${-drakeUp}px) scale(0.8)` }}>
          <Term sym="N" label="文明数量" o={1} />
          <div style={{ fontFamily: EN, fontSize: 64, color: C.dim, margin: '0 18px', lineHeight: '80px' }}>=</div>
          {DRAKE.map((d, i) => (
            <React.Fragment key={i}>{i > 0 && <Times o={1} />}<Term sym={d.sym} label={d.label} o={1} /></React.Fragment>
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', left: 190, width: 1540, top: 440, display: 'flex', flexWrap: 'wrap', rowGap: 26, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 72, color: C.goldHi, opacity: easeOut(prog(t, b0 - 0.1, b0 + 0.25)), marginRight: 18 }}>N =</div>
        {BACKUS.map((b, i) => {
          const at = b0 + i * BL * 0.5;
          const p = easeOut(prog(t, at, at + 0.35));
          return (
            <React.Fragment key={i}>
              {i === 4 && <div style={{ flexBasis: '100%', height: 0 }} />}
              {i > 0 && <span style={{ fontFamily: EN, fontSize: 50, color: C.gold, margin: '0 14px', opacity: p }}>×</span>}
              <span style={{ fontFamily: ZH, fontSize: 50, color: C.paper, letterSpacing: '0.02em', opacity: p, display: 'inline-block',
                transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 4}px)` }}>{b}</span>
            </React.Fragment>
          );
        })}
      </div>
      <Subtitle t={t} at={S + 0.2} out={51.8} zh="经济学博士彼得·巴克斯，单身" en="Peter Backus: economics PhD, single." />
      <Subtitle t={t} at={51.95} out={55.3} zh="2010年，他写了篇论文：|《我为什么没有女朋友》" />
      <Subtitle t={t} at={55.45} out={M - 0.1} zh="他用同一个公式，算算自己的机会" en="He used the same formula to work out his own odds." />
      <Subtitle t={t} at={M + 0.15} out={60.4} zh="星星，换成了人" en="Stars became people." />
      <Subtitle t={t} at={60.55} out={E - 0.1} zh="他一项一项地乘了下去……" en="He multiplied, term by term…" />
    </AbsoluteFill>
  );
};

/* ---------- S09–S12 · the funnel, the silence, the ring of 26 (63.0 → 86.6) ---------- */
const ND = 3000;
const DOTS = (() => {
  const base = new Array(ND).fill(0).map((_, i) => ({
    x: 800 + rnd(`fx${i}`) * 980,
    y: 190 + rnd(`fy${i}`) * 600,
    r: 1.6 + rnd(`fr${i}`) * 1.4,
    k: rnd(`fk${i}`),
  }));
  const order = base.map((d, i) => ({ i, k: d.k })).sort((a, b) => a.k - b.k);
  const rank = new Array(ND);
  order.forEach((o, r) => { rank[o.i] = r; });
  return base.map((d, i) => ({ ...d, rank: rank[i] as number }));
})();
const VIS = [3000, 2412, 1246, 740, 479, 181, 69, 33, 26];
const COUNT = [60975000, 31097250, 4042643, 808529, 210217, 10511, 526, 53];
const CHIPS = [['51%', '女性'], ['13%', '住在伦敦'], ['20%', '24–34岁'], ['26%', '大学学历'], ['5%', '他觉得有吸引力'], ['5%', '她也觉得他有吸引力'], ['10%', '合得来'], ['50%', '单身']];
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
export const RING = (j: number) => {
  const a = (j / 26) * Math.PI * 2 - Math.PI / 2 + (rnd(`ra${j}`) - 0.5) * 0.12;
  return { x: 960 + Math.cos(a) * (560 + (rnd(`rr${j}`) - 0.5) * 60), y: 450 + Math.sin(a) * (300 + (rnd(`ry${j}`) - 0.5) * 40) };
};
export const HANDOFF = { x: 960, y: 450 };

export const Funnel: React.FC<{ t: number }> = ({ t }) => {
  const S = 63.2, G = 65.25, P = 71.308, C8 = 72.32, Z = 75.37, GAP = 79.412, R = 81.432, H = 85.5;
  const o = Math.min(prog(t, S - 0.1, S + 0.4), 1);
  const steps = [1, 2, 3, 4, 5, 6, 7].map((k) => beatAfter(G, 2 * (k - 1)));
  let cur = 0;
  steps.forEach((s, i) => { if (t >= s) cur = i + 1; });
  const cp = cur === 0 ? 1 : easeOut(prog(t, steps[cur - 1], steps[cur - 1] + 0.5));
  const lo = Math.log(COUNT[Math.max(0, cur - 1)]), hi = Math.log(COUNT[cur]);
  const shown = Math.exp(lerp(lo, hi, cp));
  const uiO = easeOut(prog(t, S, S + 0.6)) * (1 - easeInOut(prog(t, GAP - 0.1, GAP + 0.4)));
  const numBlur = easeInOut(prog(t, 76.3, 78.6)) * 6;
  const gather = easeInOut(prog(t, P, P + 2.6));
  const toRing = easeInOut(prog(t, GAP + 0.1, R - 0.1));
  const bright = t < R ? lerp(1, 0.45, easeInOut(prog(t, GAP, GAP + 0.4))) : lerp(0.45, 1, easeOut(prog(t, R, R + 0.3)));
  const collapse = easeInOut(prog(t, H, H + 0.8));
  const endO = 1 - prog(t, H + 0.6, H + 1.0);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <CanvasLayer t={t} draw={(ctx) => {
        DOTS.forEach((d, i) => {
          let dieAt = 999;
          for (let k = 1; k < VIS.length - 1; k++) if (d.rank >= VIS[k] && dieAt === 999) dieAt = steps[k - 1];
          if (d.rank >= 26 && d.rank < 33) dieAt = GAP;
          const fade = 1 - prog(t, dieAt, dieAt + 0.45);
          if (fade <= 0) return;
          const intro = easeOut(prog(t, S + (d.x - 800) / 980 * 0.6, S + 0.5 + (d.x - 800) / 980 * 0.6));
          const survivor = d.rank < VIS[Math.min(cur + 1, 8)];
          const gold = survivor && cur >= 4 ? 1 : 0.35 + 0.65 * prog(cur, 0, 4) * (survivor ? 1 : 0);
          let x = d.x, y = d.y;
          if (d.rank < 33) { x = lerp(d.x, 1290, gather * 0.35); y = lerp(d.y, 490, gather * 0.35); }
          if (d.rank < 26) {
            const rg = RING(d.rank);
            x = lerp(x, rg.x, toRing); y = lerp(y, rg.y, toRing);
            x = lerp(x, HANDOFF.x, collapse); y = lerp(y, HANDOFF.y, collapse);
          }
          const dyingTint = t > dieAt ? '111,125,145' : gold > 0.6 ? '240,213,154' : '222,218,205';
          const a = (d.rank < 26 ? bright * (d.rank === 0 ? 1 : endO) : 1) * fade * intro * (0.55 + 0.45 * gold);
          glowDot(ctx, x, y, d.r * (d.rank < 26 ? 1.5 + (t > R ? 0.6 : 0) : 1), a, dyingTint, d.rank < 33 ? 5 : 3);
        });
      }} />
      {/* counter + chips */}
      <div style={{ position: 'absolute', left: 90, top: 110, opacity: uiO }}>
        <div style={{ fontFamily: ZH, fontSize: 40, color: C.paper, opacity: 0.8, letterSpacing: '0.12em' }}>{cur === 0 ? '英国人口' : '剩下的人'}</div>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 116, color: C.goldHi, lineHeight: 1.1, filter: `blur(${numBlur}px)`, opacity: 1 - numBlur / 12 }}>{fmt(shown)}</div>
        <div style={{ marginTop: 26 }}>
          {CHIPS.map(([pc, lb], i) => {
            const at = i < 7 ? steps[i] : C8;
            const p = easeOut(prog(t, at, at + 0.4));
            const active = (i === cur - 1 && t < C8) || (i === 7 && t > C8);
            return (
              <div key={i} style={{ height: 58, display: 'flex', alignItems: 'baseline', gap: 18, opacity: p * (active ? 1 : 0.55), transform: `translateX(${(1 - p) * -20}px)` }}>
                <span style={{ fontFamily: EN, fontSize: 48, color: C.gold, width: 150, textAlign: 'right' }}>× {pc}</span>
                <span style={{ fontFamily: ZH, fontSize: 40, color: C.paper, letterSpacing: '0.04em' }}>{lb}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', right: 110, top: 40, fontFamily: ZH, fontSize: 28, color: C.dim, letterSpacing: '0.15em', opacity: 0.8 * uiO }}>
        点的数量按比例示意 · 数字来自巴克斯2010年的计算
      </div>
      <Subtitle t={t} at={S + 0.2} out={67.15} zh="每个条件，看起来都不过分" />
      <Subtitle t={t} at={67.3} out={71.2} zh="可乘在一起，人就少得可怕" />
      <Subtitle t={t} at={C8 + 0.1} out={Z - 0.1} zh="最后一项：还得单身" />
      <Subtitle t={t} at={Z + 0.05} out={R - 0.1} zh="整个伦敦，适合他的人还剩——" en="In all of London, the number left is…" />
    </AbsoluteFill>
  );
};

export const Reveal26: React.FC<{ t: number }> = ({ t }) => {
  const R = 81.43, E = 85.5;
  const o = 1 - prog(t, E - 0.25, E + 0.1);
  const tp = easeOut(prog(t, R, R + 0.7));
  const glow = t < R ? 0 : Math.min(prog(t, R, R + 0.2), 1) * lerp(0.45, 0.14, easeOut(prog(t, R + 0.2, R + 2.4)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={450} r={700} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={R} cx={960} cy={450} seed="r26" n={100} spread={560} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: prog(t, R, R + 0.18),
        transform: `scale(${lerp(1.14, 1, tp)})`, filter: `blur(${(1 - easeOut(prog(t, R, R + 0.45))) * 14}px)` }}>
        <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 400, lineHeight: 1,
          backgroundImage: `linear-gradient(180deg, ${C.goldHi} 0%, ${C.gold} 55%, #9c7a3c 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
          26
        </span>
      </div>
      <Subtitle t={t} at={R + 0.95} out={E - 0.1} zh="整个伦敦，只有*26*个" en="In all of London: twenty-six." y={900} size={96} />
    </AbsoluteFill>
  );
};

export { lerp };

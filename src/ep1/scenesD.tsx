import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, inOut } from './lib';
import { RedString, Card, cardX, stringY, Subtitle, Chip, YouMarker, LineIcon, Glow } from './ui';

const R_SCORES = [6, 8, 5, 7, 4, 6, 9, 5, 7, 3];
const win = (t: number, S: number, E: number, fin = 0.4) => Math.min(prog(t, S, S + fin), 1 - prog(t, E - 0.25, E + 0.1));

/* S13 · The rule 85.50 → 93.60 */
export const Rule: React.FC<{ t: number }> = ({ t }) => {
  const S = 85.5, E = 93.6;
  const o = win(t, S, E);
  const flipAt = [beatAfter(S, 1), beatAfter(S, 2), beatAfter(S, 3), beatAfter(S, 5), beatAfter(S, 6), beatAfter(S, 7), beatAfter(S, 11)];
  const sealAt = beatAfter(S, 12);
  const band = easeOut(prog(t, S + 0.1, S + 0.9));
  const std = easeOut(prog(t, beatAfter(S, 4), beatAfter(S, 4) + 0.5));
  const yB = stringY(cardX(0)) + 250;
  let you = 0;
  flipAt.forEach((f, i) => { if (t >= f - 0.25) you = i; });
  const youX = lerp(cardX(Math.max(0, you - 1)), cardX(you), easeInOut(prog(t, flipAt[you] - 0.25, flipAt[you])));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <RedString />
      {R_SCORES.map((sc, i) => {
        const x = cardX(i);
        const f = i < 7 ? easeInOut(prog(t, flipAt[i], flipAt[i] + 0.3)) : 0;
        let dim = 0, glow = 0, gold = 0;
        if (i >= 3 && i <= 5) dim = 0.6 * prog(t, flipAt[i] + 0.35, flipAt[i] + 0.7);
        if (i === 1) glow = std * (1 - prog(t, sealAt, sealAt + 0.5)) * 0.8;
        if (i === 6) { gold = easeOut(prog(t, sealAt - 0.1, sealAt + 0.2)); glow = gold; }
        if (i >= 7) dim = 0.65 * prog(t, sealAt + 0.3, sealAt + 0.9);
        const seal = i === 6 ? prog(t, sealAt, sealAt + 0.22) : 0;
        return <Card key={i} x={x} y={stringY(x)} n={i + 1} score={sc} flip={f} dim={dim} glow={glow} gold={gold} seal={seal}
          opacity={easeOut(prog(t, S, S + 0.4))} />;
      })}
      {/* phase bands */}
      <div style={{ position: 'absolute', left: cardX(0) - 70, top: yB, width: (cardX(2) - cardX(0) + 140) * band, height: 6, background: C.slate }} />
      <div style={{ position: 'absolute', left: cardX(3) - 62, top: yB, width: (cardX(9) - cardX(3) + 132) * band, height: 6, background: C.gold }} />
      <div style={{ position: 'absolute', left: cardX(0) - 70, top: yB + 20, width: cardX(2) - cardX(0) + 140, textAlign: 'center', opacity: band,
        fontFamily: ZH, fontSize: 28, color: C.slateHi, letterSpacing: '0.15em' }}>探索期 · 只看不选</div>
      <div style={{ position: 'absolute', left: cardX(3) - 62, top: yB + 20, width: cardX(9) - cardX(3) + 132, textAlign: 'center', opacity: band,
        fontFamily: ZH, fontSize: 28, color: C.gold, letterSpacing: '0.15em' }}>决定期 · 遇到更好的，就选</div>
      <Chip x={cardX(1)} y={stringY(cardX(1)) - 72} text="标准：8分" color={C.gold} fill={false} o={std * (1 - prog(t, sealAt + 0.8, sealAt + 1.2))} />
      <Subtitle t={t} at={S + 0.1} out={beatAfter(S, 8) - 0.1} zh="前*37%*：只看不选，建立你的标准" en="First 37%: just look. Learn what good means." />
      <Subtitle t={t} at={beatAfter(S, 8)} out={E - 0.1} zh="之后：遇到第一个比前面都好的，*就是Ta*" en="After that: the first one better than everyone before. That's them." />
    </AbsoluteFill>
  );
};

/* S14 · Scale 93.60 → 97.64 */
export const Scale: React.FC<{ t: number }> = ({ t }) => {
  const S = 93.6, E = 97.64;
  const o = win(t, S, E);
  const steps = [
    { at: S, n: 10, k: 3, p: '39.9%' },
    { at: beatAfter(S, 2), n: 100, k: 37, p: '37.1%' },
    { at: beatAfter(S, 4), n: 1000, k: 368, p: '36.8%' },
  ];
  let cur = 0;
  steps.forEach((s, i) => { if (t >= s.at) cur = i; });
  const sw = easeOut(prog(t, steps[cur].at, steps[cur].at + 0.35));
  const st = steps[cur];
  const x0 = 360, w = 1200, y = 470;
  const ticks = (n: number, op: number) =>
    new Array(n).fill(0).map((_, i) => (
      <line key={i} x1={x0 + (w * (i + 0.5)) / n} x2={x0 + (w * (i + 0.5)) / n} y1={y - 40} y2={y + 40}
        stroke={i < Math.round(n / Math.E) ? C.slateHi : C.paper} strokeOpacity={op * (n > 200 ? 0.55 : 0.75)} strokeWidth={n > 200 ? 0.8 : n > 50 ? 1.5 : 3} />
    ));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: EN, fontSize: 96, color: C.paper }}>
        <span style={{ fontFamily: ZH, fontSize: 40, color: C.dim, marginRight: 22, verticalAlign: 'middle' }}>人数</span>
        <span style={{ color: C.gold, display: 'inline-block', opacity: sw, transform: `translateY(${(1 - sw) * 14}px)` }}>{st.n}</span>
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x={x0} y={y - 52} width={w / Math.E} height={104} fill={C.slate} opacity={0.18} />
        {cur > 0 && <g>{ticks(steps[cur - 1].n, 1 - sw)}</g>}
        <g>{ticks(st.n, sw)}</g>
        <line x1={x0 + w / Math.E} x2={x0 + w / Math.E} y1={y - 70} y2={y + 70} stroke={C.gold} strokeWidth={3} />
        <text x={x0 + w / Math.E} y={y - 86} textAnchor="middle" fontFamily={EN} fontSize={40} fill={C.gold}>37%</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: ZH, fontSize: 36, color: C.paper, opacity: sw, letterSpacing: '0.06em' }}>
        先看 <span style={{ fontFamily: EN, fontSize: 50, color: C.slateHi }}>{st.k}</span> 位　·　成功率{' '}
        <span style={{ fontFamily: EN, fontSize: 50, color: C.gold }}>{st.p}</span>
      </div>
      <Subtitle t={t} at={S + 0.3} out={E - 0.1} zh="人数再多，答案都稳稳停在*37%*附近" en="However many people, the answer stays near 37%." />
    </AbsoluteFill>
  );
};

/* S15 · Your timeline 97.64 → 105.74 */
export const Ruler: React.FC<{ t: number }> = ({ t }) => {
  const S = 97.64, M = 99.66, L = 101.7, E = 105.74;
  const o = win(t, S, E);
  const x0 = 310, w = 1300, y = 470, h = 74;
  const xa = (age: number) => x0 + ((age - 20) / 15) * w;
  const rp = easeOut(prog(t, S, S + 0.8));
  const mAge = lerp(20, 20 + 15 / Math.E, easeInOut(prog(t, M, M + 1.6)));
  const mO = easeOut(prog(t, M - 0.2, M + 0.2));
  const regions = easeOut(prog(t, L + 0.9, L + 1.5));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: x0, top: y, width: w, height: h, opacity: rp, transform: `translateY(${(1 - rp) * 20}px)`,
        background: 'linear-gradient(180deg, #c6a870 0%, #a88c58 55%, #8b7147 100%)', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', borderRadius: 3 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.22,
          background: 'repeating-linear-gradient(90deg, rgba(60,40,20,0.5) 0px, rgba(60,40,20,0) 3px, rgba(60,40,20,0) 17px)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${((mAge - 20) / 15) * 100}%`, background: C.slate, opacity: 0.45 * regions }} />
        <div style={{ position: 'absolute', left: `${((mAge - 20) / 15) * 100}%`, top: 0, bottom: 0, right: 0, background: C.gold, opacity: 0.3 * regions }} />
        <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
          {new Array(31).fill(0).map((_, i) => {
            const major = i % 2 === 0;
            const tp = prog(t, S + 0.2 + i * 0.02, S + 0.5 + i * 0.02);
            return <line key={i} x1={(w * i) / 30} x2={(w * i) / 30} y1={0} y2={(major ? 30 : 15) * tp} stroke="#3a2a18" strokeWidth={major ? 2.5 : 1.5} />;
          })}
        </svg>
      </div>
      {[20, 25, 30, 35].map((a) => (
        <div key={a} style={{ position: 'absolute', left: xa(a) - 60, width: 120, top: y + h + 16, textAlign: 'center', opacity: rp,
          fontFamily: EN, fontSize: 34, color: C.dim }}>{a}<span style={{ fontFamily: ZH, fontSize: 20, marginLeft: 3 }}>岁</span></div>
      ))}
      {/* marker */}
      <div style={{ position: 'absolute', left: xa(mAge), top: y - 44, opacity: mO }}>
        <svg width={40} height={30} style={{ position: 'absolute', left: -20, top: 0 }}><path d="M4 4 L36 4 L20 26 Z" fill={C.gold} /></svg>
        <div style={{ position: 'absolute', left: -1.5, top: 28, width: 3, height: h + 26, background: C.goldHi, boxShadow: `0 0 10px ${C.gold}` }} />
        <div style={{ position: 'absolute', left: -200, width: 400, top: -150, textAlign: 'center', opacity: easeOut(prog(t, L, L + 0.5)),
          transform: `scale(${lerp(1.15, 1, easeOut(prog(t, L, L + 0.5)))})` }}>
          <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 110, color: C.gold, lineHeight: 1 }}>25.5</span>
          <span style={{ fontFamily: ZH, fontSize: 40, color: C.gold, marginLeft: 6 }}>岁</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: x0, width: xa(25.5) - x0, top: y + h + 80, textAlign: 'center', opacity: regions,
        fontFamily: ZH, fontSize: 30, color: C.slateHi, letterSpacing: '0.1em' }}>多认识，多了解</div>
      <div style={{ position: 'absolute', left: xa(25.5), width: x0 + w - xa(25.5), top: y + h + 80, textAlign: 'center', opacity: regions,
        fontFamily: ZH, fontSize: 30, color: C.gold, letterSpacing: '0.1em' }}>遇到比之前都好的，认真考虑</div>
      <Subtitle t={t} at={S + 0.2} out={L - 0.1} zh="假如你打算在20到35岁之间，遇见对的人" en="Say you hope to meet the right person between 20 and 35." />
      <Subtitle t={t} at={L + 0.1} out={E - 0.1} zh="*37%*的位置，是*25.5岁*" en="37% of the way there is 25.5." />
    </AbsoluteFill>
  );
};

/* S16 · Not only dating 105.74 → 109.78 */
const USE_ICONS: { zh: string; en: string; d: string[]; c?: [number, number, number][] }[] = [
  { zh: '看房', en: 'Renting', d: ['M12 48 L50 16 L88 48', 'M22 42 V88 H78 V42', 'M42 88 V62 H58 V88'] },
  { zh: '招聘', en: 'Hiring', d: ['M14 36 H86 V84 H14 Z', 'M38 36 V24 H62 V36', 'M14 56 H86'] },
  { zh: '找车位', en: 'Parking', d: ['M10 66 L20 44 H76 L88 60 V72 H10 Z', 'M28 44 L36 30 H62 L72 44'], c: [[28, 74, 8], [72, 74, 8]] },
  { zh: '选offer', en: 'Job offers', d: ['M24 10 H64 L80 26 V90 H24 Z', 'M64 10 V26 H80', 'M36 56 L48 68 L68 44'] },
];

export const Uses: React.FC<{ t: number }> = ({ t }) => {
  const S = 105.74, E = 109.78;
  const o = win(t, S, E, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {USE_ICONS.map((u, i) => {
        const at = beatAfter(S, i * 2);
        const p = prog(t, at, at + 0.7);
        const tp = easeOut(prog(t, at + 0.15, at + 0.6));
        const x = 465 + i * 330;
        return (
          <div key={i} style={{ position: 'absolute', left: x - 110, top: 300, width: 220, textAlign: 'center', opacity: p > 0 ? 1 : 0 }}>
            <div style={{ display: 'inline-block' }}><LineIcon d={u.d} circles={u.c} p={p} size={150} /></div>
            <div style={{ opacity: tp, transform: `translateY(${(1 - tp) * 12}px)`, fontFamily: ZH, fontSize: 44, color: C.paper, marginTop: 18, letterSpacing: '0.1em' }}>{u.zh}</div>
            <div style={{ opacity: tp, fontFamily: EN, fontStyle: 'italic', fontSize: 28, color: C.dim, marginTop: 4 }}>{u.en}</div>
          </div>
        );
      })}
      <Subtitle t={t} at={S + 0.2} out={E - 0.1} zh="看房、招聘、找车位……过了就没了的选择" en="Flats, hires, parking spots: any choice you can't take back." />
    </AbsoluteFill>
  );
};

/* S17 · Variants 109.78 → 115.87 */
export const Variants: React.FC<{ t: number }> = ({ t }) => {
  const S = 109.78, B = beatAfter(112.8), E = 115.87;
  const o = win(t, S, E);
  const x0 = 460, w = 1000;
  const row = (y: number, at: number, target: number, label: string, en: string, color: string, icon?: boolean) => {
    const ro = easeOut(prog(t, at, at + 0.5));
    const mv = easeInOut(prog(t, at + 0.5, at + 1.5));
    const v = lerp(1 / Math.E, target, mv);
    return (
      <div style={{ position: 'absolute', left: 0, top: 0, opacity: ro }}>
        <div style={{ position: 'absolute', left: x0, top: y - 92, fontFamily: ZH, fontSize: 36, color: C.paper, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          {icon && (
            <svg width={40} height={28} style={{ marginRight: 14, verticalAlign: '-3px' }}>
              <rect x={1} y={1} width={38} height={26} fill={C.cardBack} />
              <path d="M1 1 L20 17 L39 1" fill="none" stroke="#9c8b6a" strokeWidth={1.5} />
              <circle cx={20} cy={17} r={5} fill={C.rouge} />
            </svg>
          )}
          {label}
          <span style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, color: C.dim, marginLeft: 16 }}>{en}</span>
        </div>
        <div style={{ position: 'absolute', left: x0, top: y, width: w, height: 2, background: C.paper, opacity: 0.3 }} />
        <div style={{ position: 'absolute', left: x0 + w / Math.E - 1, top: y - 14, width: 2, height: 30, background: C.gold, opacity: 0.35 }} />
        <div style={{ position: 'absolute', left: x0 - 70, top: y - 16, fontFamily: EN, fontSize: 26, color: C.dim }}>0%</div>
        <div style={{ position: 'absolute', left: x0 + w + 20, top: y - 16, fontFamily: EN, fontSize: 26, color: C.dim }}>100%</div>
        <div style={{ position: 'absolute', left: x0 + w * v, top: y }}>
          <div style={{ position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', background: color, boxShadow: `0 0 16px ${color}` }} />
          <div style={{ position: 'absolute', left: -100, width: 200, top: 22, textAlign: 'center', fontFamily: EN, fontWeight: 600, fontSize: 58, color }}>
            {Math.round(v * 100)}%
          </div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {row(330, S, 0.25, '对方也可能拒绝你', 'If they might say no', C.rouge)}
      {row(590, B, 0.61, '可以回头，像开普勒', 'If you can go back', C.gold, true)}
      <Subtitle t={t} at={S + 0.15} out={B - 0.1} zh="对方有一半可能拒绝你？*25%*就出手" en="If they might say no half the time: leap at 25%." />
      <Subtitle t={t} at={B + 0.1} out={E - 0.1} zh="还能回头，像开普勒那样？*61%*" en="If you can go back, like Kepler: 61%." />
    </AbsoluteFill>
  );
};

/* S18 · Twist 115.87 → 121.95 */
export const Twist: React.FC<{ t: number }> = ({ t }) => {
  const S = 115.87, M = 118.9, E = 121.95;
  const o = win(t, S, E);
  const r = 210, cx = 960, cy = 450, circ = 2 * Math.PI * r;
  const g = easeOut(prog(t, S + 0.1, S + 1.2)) * 0.368;
  const d = easeInOut(prog(t, M, M + 1.0)) * 0.632;
  const sw = easeInOut(prog(t, M, M + 0.6));
  const cam = lerp(1.05, 1, prog(t, S, E));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.slate} strokeOpacity={0.15} strokeWidth={22} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.gold} strokeWidth={22} strokeDasharray={`${circ * g} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`} style={{ filter: 'drop-shadow(0 0 10px rgba(201,164,92,0.5))' }} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.slateHi} strokeOpacity={0.55} strokeWidth={22} strokeDasharray={`${circ * d} ${circ}`}
            transform={`rotate(${-90 + 360 * 0.368} ${cx} ${cy})`} />
        </svg>
        <div style={{ position: 'absolute', left: cx - 200, width: 400, top: cy - 70, textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - sw, fontFamily: EN, fontWeight: 600, fontSize: 120, color: C.gold, lineHeight: '140px' }}>37%</div>
          <div style={{ position: 'absolute', inset: 0, opacity: sw, fontFamily: EN, fontWeight: 600, fontSize: 120, color: C.slateHi, lineHeight: '140px' }}>63%</div>
        </div>
      </AbsoluteFill>
      <Subtitle t={t} at={S + 0.25} out={M - 0.1} zh="但最好的策略，成功率也只有*37%*" en="But even the best strategy works only 37% of the time." />
      <Subtitle t={t} at={M + 0.05} out={E - 0.1} zh="*63%*的时候，最好的人依然会错过" en="63% of the time, you still miss the best one." />
    </AbsoluteFill>
  );
};

/* S19–S20 · Ending 121.95 → 130.5 */
export const Ending: React.FC<{ t: number }> = ({ t }) => {
  const S = 121.95, F = 125.99, END = 130.5;
  const o = Math.min(prog(t, S, S + 0.5), 1 - easeInOut(prog(t, 129.2, END)));
  const glide = lerp(140, -140, easeInOut(prog(t, S, F + 1)));
  const cardsO = 1 - easeInOut(prog(t, F, F + 1.0));
  const sy = 250;
  const sagY = (x: number) => stringY(x, sy);
  const stringGlow = 0.5 + 0.5 * easeOut(prog(t, F, F + 1.5));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `translateX(${glide}px) scale(0.86)`, transformOrigin: '50% 30%' }}>
        <RedString y0={sy} opacity={stringGlow} />
        {R_SCORES.map((sc, i) => {
          const x = cardX(i);
          const lantern = i <= 5 ? easeOut(prog(t, S + 0.3 + i * 0.2, S + 1.0 + i * 0.2)) : 0;
          return (
            <div key={i} style={{ opacity: cardsO }}>
              {lantern > 0 && <Glow x={x} y={sagY(x) + 110} r={170} color="rgba(236,170,90,0.6)" opacity={lantern * 0.75} />}
              <Card x={x} y={sagY(x)} n={i + 1} score={sc} flip={i <= 6 ? 1 : 0} gold={i === 6 ? 1 : 0} glow={i === 6 ? 0.6 : 0}
                dim={i >= 7 ? 0.6 : lerp(0.35, 0, lantern)} />
            </div>
          );
        })}
      </AbsoluteFill>
      <Subtitle t={t} at={S + 0.1} out={F - 0.05} zh="所以错过了，不是你不够好" en="So if you missed them, it wasn't because you weren't enough." y={650} size={52} />
      <Subtitle t={t} at={123.4} out={F - 0.05} zh="是那些相遇，教会了你什么是*好*" en="Those meetings taught you what good looks like." y={800} size={52} />
      <Subtitle t={t} at={F + 0.15} out={END + 1} zh="爱情没有最优解" en="Love has no optimal solution." y={560} size={76} weight={600} enSize={34} />
      <Subtitle t={t} at={127.0} out={END + 1} zh="但每一次认真的相遇，都算数" en="But every sincere meeting counts." y={740} size={54} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', opacity: easeOut(prog(t, 127.9, 128.6)) }}>
        <div style={{ fontFamily: ZH, fontSize: 26, color: C.gold, letterSpacing: '0.4em' }}>《第几个人》 · VIBE知识大赏</div>
        <div style={{ fontFamily: ZH, fontSize: 18, color: C.dim, letterSpacing: '0.3em', marginTop: 12 }}>数学模型演示 · 非恋爱建议</div>
      </div>
    </AbsoluteFill>
  );
};

export { inOut };

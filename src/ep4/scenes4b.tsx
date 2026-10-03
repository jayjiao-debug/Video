import React from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp } from '../lib';
import { Subtitle, Glow } from '../ui';
import { PeepFig } from '../v/scenesV';
import { INK, CREAM, ROUGE } from '../ep3/props';
import { Trophy, IconHeart, IconShield, IconEye, PlayCard, Avatar, STRATS } from './props4';
import { YOU } from './scenes4a';

const GAP = 79.412, R = 81.432;
const svgAbs = { position: 'absolute' as const, left: 0, top: 0, overflow: 'visible' as const };

/* ---------- S07–S08 · the rule, and the paradox (63.20 → 81.43) ---------- */
const ROWS: [number, string, string, string][] = [[2, '600 : 600', '平', ''], [1, '199 : 204', '输', ''], [3, '600 : 600', '平', ''], [4, '少一点', '输', '*']];
export const Rule4: React.FC<{ t: number }> = ({ t }) => {
  const S = 63.2;
  const o = Math.min(prog(t, S - 0.1, S + 0.35), 1 - prog(t, R - 0.2, R + 0.05));
  const gapDim = 1 - 0.5 * easeInOut(prog(t, GAP, GAP + 0.4));
  const av = easeOut(prog(t, S, S + 0.6));
  const l1 = easeOut(prog(t, 63.6, 64.2)), l2 = easeOut(prog(t, 67.45, 68.1));
  const cardO = 1 - easeInOut(prog(t, 71.1, 71.6));
  const tbl = easeOut(prog(t, 71.4, 72.0));
  return (
    <AbsoluteFill style={{ opacity: o * gapDim }}>
      <Avatar s={STRATS[0]} d={300} x={400} y={390} o={av} ring={C.goldHi} glow={0.5} lsize={44} />
      {cardO > 0 && (
        <div style={{ position: 'absolute', left: 700, top: 170, width: 1040, height: 380, opacity: cardO * av, transform: 'rotate(-1.5deg)', background: CREAM, border: `6px solid ${INK}`, borderRadius: 12, padding: '30px 44px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 58px, rgba(90,125,176,0.25) 58px 60px)' }}>
          <div style={{ fontFamily: ZH, fontSize: 30, color: '#6b5a44', letterSpacing: '0.2em' }}>“一报还一报” · 全部规则</div>
          <div style={{ fontFamily: '"Ma Shan Zheng", serif', fontSize: 56, color: INK, marginTop: 34, opacity: l1, transform: `translateX(${(1 - l1) * -20}px)` }}>① 第一轮：先合作</div>
          <div style={{ fontFamily: '"Ma Shan Zheng", serif', fontSize: 54, color: INK, marginTop: 22, opacity: l2, transform: `translateX(${(1 - l2) * -20}px)`, whiteSpace: 'nowrap' }}>② 之后：你怎么对我，我就怎么对你</div>
        </div>
      )}
      {tbl > 0 && (
        <div style={{ position: 'absolute', left: 700, top: 130, width: 1060, opacity: tbl }}>
          <div style={{ fontFamily: ZH, fontSize: 34, color: C.paper, marginBottom: 18 }}>它的单场比分 <span style={{ color: C.dim, fontSize: 26 }}>（每场200轮）</span></div>
          {ROWS.map(([si, sc, res, star], i) => {
            const p = easeOut(prog(t, beatAfter(71.5, i), beatAfter(71.5, i) + 0.35));
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', height: 104, borderTop: `2px solid rgba(235,228,210,0.15)`, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
                <div style={{ width: 90, height: 90, position: 'relative' }}><Avatar s={STRATS[si]} d={78} x={45} y={45} label={false} /></div>
                <div style={{ width: 300, fontFamily: ZH, fontSize: 38, color: C.paper, marginLeft: 16 }}>对{STRATS[si].name}</div>
                <div style={{ width: 380, fontFamily: EN, fontWeight: 600, fontSize: 56, color: C.goldHi, textAlign: 'center' }}>{sc}{star && <span style={{ fontSize: 30, color: C.dim }}>{star}</span>}</div>
                <div style={{ width: 96, height: 60, borderRadius: 10, marginLeft: 40, background: res === '输' ? ROUGE : 'rgba(235,228,210,0.25)', border: `3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontWeight: 700, fontSize: 36, color: CREAM }}>{res}</div>
              </div>
            );
          })}
          <div style={{ fontFamily: ZH, fontSize: 24, color: C.dim, marginTop: 12 }}>按3/5/1/0计分；* 为示意</div>
        </div>
      )}
      <Subtitle t={t} at={S + 0.15} out={67.3} zh="它叫“一报还一报”，|规则只有两句：" />
      <Subtitle t={t} at={67.45} out={71.2} zh="第一轮，先合作；|之后，你怎么对我，我就怎么对你" />
      <Subtitle t={t} at={71.35} out={75.2} zh="奇怪的是：|它一场都没有赢过对手" />
      <Subtitle t={t} at={75.35} out={R - 0.1} zh="每一场都没赢，|总分加起来却是——" />
    </AbsoluteFill>
  );
};

/* ---------- S09–S10 · the leaderboard, why, and the second tournament (81.43 → 101.6) ---------- */
const BARS = [1, 0.97, 0.955, 0.94, 0.93, 0.9, 0.87, 0.85, 0.8, 0.76, 0.7, 0.62, 0.55, 0.45];
const ORDER = [0, 6, 8, 7, 12, 3, 10, 13, 11, 9, 4, 2, 5, 1];
export const Board4: React.FC<{ t: number }> = ({ t }) => {
  const S = R, E = 101.6;
  const o = Math.min(prog(t, S, S + 0.2), 1 - prog(t, E - 0.25, E + 0.1));
  const shift = easeInOut(prog(t, 85.3, 86.1));
  const bO = 1 - easeInOut(prog(t, 93.4, 93.9));
  const cA = easeOut(prog(t, 85.6, 86.3)), cB = easeOut(prog(t, 89.6, 90.3));
  const t2 = easeOut(prog(t, 93.7, 94.3)) * (1 - easeInOut(prog(t, 97.4, 97.9)));
  const champ = easeOut(prog(t, 97.7, 98.4));
  const glow = t < R ? 0 : Math.min(prog(t, R, R + 0.2), 1) * lerp(0.4, 0.12, easeOut(prog(t, R + 0.2, R + 2.4)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={700} y={200} r={600} color="rgba(233,178,110,0.9)" opacity={glow * bO} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: bO, transform: `translateX(${-300 * shift}px) scale(${lerp(1, 0.86, shift)})`, transformOrigin: '420px 400px' }}>
        <div style={{ position: 'absolute', left: 420, top: 70, fontFamily: ZH, fontSize: 34, color: C.paper }}>总分排行 <span style={{ fontSize: 24, color: C.dim }}>（示意）</span></div>
        {ORDER.map((si, k) => {
          const p = easeOut(prog(t, R + k * 0.05, R + 0.6 + k * 0.05));
          const y = 130 + k * 42;
          return (
            <div key={k} style={{ position: 'absolute', left: 420, top: y, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, position: 'relative' }}><Avatar s={STRATS[si]} d={36} x={19} y={19} label={false} /></div>
              <div style={{ height: 26, width: 900 * BARS[k] * p, borderRadius: 6, background: k === 0 ? C.goldHi : 'rgba(235,228,210,0.35)', boxShadow: k === 0 ? '0 0 24px rgba(240,213,154,0.6)' : 'none' }} />
              {k === 0 && <div style={{ fontFamily: ZH, fontSize: 32, color: C.goldHi, opacity: p, whiteSpace: 'nowrap' }}>一报还一报 · 第1名</div>}
            </div>
          );
        })}
      </div>
      {/* why it won */}
      {[[cA, 150, '遇到好人', 2, true], [cB, 430, '遇到坏人', 1, false]].map(([p, y, lbl, si, good], i) => (p as number) > 0 && (
        <div key={i} style={{ position: 'absolute', left: 1080, top: y as number, width: 740, height: 240, opacity: (p as number) * bO, transform: `translateY(${(1 - (p as number)) * 20}px)`, background: 'rgba(235,228,210,0.06)', border: `3px solid rgba(235,228,210,0.25)`, borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 70, height: 70, position: 'relative' }}><Avatar s={STRATS[0]} d={66} x={35} y={35} label={false} ring={C.goldHi} /></div>
            <div style={{ fontFamily: EN, fontSize: 36, color: C.dim }}>vs</div>
            <div style={{ width: 70, height: 70, position: 'relative' }}><Avatar s={STRATS[si as number]} d={66} x={35} y={35} label={false} /></div>
            <div style={{ fontFamily: ZH, fontSize: 36, color: good ? C.goldHi : C.paper, marginLeft: 10 }}>{lbl as string}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {Array.from({ length: 12 }, (_, k) => {
              const q = prog(t, (i ? 89.9 : 85.9) + k * 0.12, (i ? 90.1 : 86.1) + k * 0.12);
              const v = good ? 3 : k === 0 ? 0 : 1;
              return <div key={k} style={{ width: 46, height: 46, borderRadius: 8, opacity: q, background: good ? C.goldHi : k === 0 ? ROUGE : 'rgba(235,228,210,0.3)', border: `3px solid ${INK}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: EN, fontWeight: 700, fontSize: 26, color: INK }}>{v}</div>;
            })}
          </div>
          <div style={{ fontFamily: ZH, fontSize: 28, color: C.dim, marginTop: 14 }}>{good ? '一起合作，每轮都拿3分' : '只吃第一轮的亏，之后不再上当'}</div>
        </div>
      ))}
      {/* second tournament */}
      {t2 > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: t2 }}>
          <div style={{ fontFamily: ZH, fontSize: 44, color: C.paper }}>第二届比赛</div>
          <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 150, color: C.goldHi, lineHeight: 1.1 }}>62<span style={{ fontFamily: ZH, fontSize: 52, color: C.paper, marginLeft: 10 }}>个程序</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 30px)', gap: 12, justifyContent: 'center', marginTop: 26 }}>
            {Array.from({ length: 62 }, (_, k) => <div key={k} style={{ width: 30, height: 30, borderRadius: 15, background: k === 20 ? C.goldHi : 'rgba(235,228,210,0.55)', border: `3px solid ${INK}`, opacity: prog(t, 93.8 + k * 0.02, 94.0 + k * 0.02) }} />)}
          </div>
          <div style={{ fontFamily: ZH, fontSize: 30, color: C.dim, marginTop: 22 }}>来自6个国家 · 年纪最小的参赛者只有10岁</div>
        </div>
      )}
      {champ > 0 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: champ }}>
          <Glow x={960} y={400} r={560} color="rgba(233,178,110,0.9)" opacity={0.3} />
          <Avatar s={STRATS[0]} d={320} x={960} y={390} ring={C.goldHi} glow={0.8} lsize={46} />
          <svg width={1920} height={1080} style={svgAbs}>
            <g transform={`translate(1240 ${560 + (1 - champ) * 30}) scale(1.1)`}><Trophy /></g>
          </svg>
        </div>
      )}
      <Subtitle t={t} at={R + 0.9} out={85.4} zh="每一场都没赢，|却拿了*总冠军*" />
      <Subtitle t={t} at={85.55} out={89.4} zh="因为遇到好人，|它们一起拿高分" />
      <Subtitle t={t} at={89.55} out={93.5} zh="遇到坏人，|它也只吃一次亏" />
      <Subtitle t={t} at={93.65} out={97.5} zh="第二届，62个程序来挑战" />
      <Subtitle t={t} at={97.65} out={E - 0.1} zh="冠军，*还是它*" />
    </AbsoluteFill>
  );
};

/* ---------- S11 · four traits (101.7 → 115.87) ---------- */
const TRAITS: [string, string, React.FC][] = [['善良', '从不先使坏', () => <IconHeart />], ['会反击', '被辜负了，要回应', () => <IconShield />], ['会原谅', '对方改了，马上和好', () => <IconHeart bandage />], ['简单', '让别人看得懂你', () => <IconEye />]];
export const Four4: React.FC<{ t: number }> = ({ t }) => {
  const S = 101.6, E = 115.87;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const ats = [104.6, 107.45, 110.35, 113.15];
  const cur = ats.filter((a) => t >= a).length - 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: ZH, fontSize: 46, color: C.paper, opacity: easeOut(prog(t, S + 0.1, S + 0.7)) }}>
        赢家的<span style={{ color: C.goldHi }}>四个特点</span>
      </div>
      {TRAITS.map(([h, d, I], i) => {
        const p = t >= ats[i] - 0.1 ? spring({ frame: (t - ats[i] + 0.1) * 30, fps: 30, config: { damping: 13, stiffness: 150 } }) : 0;
        const on = i === cur ? 1 : 0;
        return (
          <div key={i} style={{ position: 'absolute', left: 290 + i * 350, top: 180, width: 310, height: 440, opacity: Math.min(1, p) * (on || cur > i ? 1 : 0.5) , transform: `translateY(${(1 - Math.min(1, p)) * 40 - on * 14}px) rotate(${[-2, 1.5, -1, 2][i]}deg)`,
            background: CREAM, border: `5px solid ${INK}`, borderRadius: 16, boxShadow: on ? '0 0 40px rgba(240,213,154,0.55), 0 20px 40px rgba(0,0,0,0.5)' : '0 16px 36px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 }}>
            <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 34, color: '#8a7456' }}>{i + 1}</div>
            <svg width={160} height={150} viewBox="-80 -75 160 150" style={{ overflow: 'visible', marginTop: 6 }}><I /></svg>
            <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 62, color: INK, marginTop: 10 }}>{h}</div>
            <div style={{ fontFamily: ZH, fontSize: 28, color: '#5c4a36', marginTop: 14, textAlign: 'center', padding: '0 18px' }}>{d}</div>
          </div>
        );
      })}
      <Subtitle t={t} at={S + 0.15} out={104.45} zh="阿克塞尔罗德总结：|赢家有四个特点" />
      <Subtitle t={t} at={104.6} out={107.3} zh="*善良*：从不先使坏" />
      <Subtitle t={t} at={107.45} out={110.2} zh="*会反击*：被辜负了，要回应" />
      <Subtitle t={t} at={110.35} out={113.0} zh="*会原谅*：对方改了，马上和好" />
      <Subtitle t={t} at={113.15} out={E - 0.1} zh="*简单*：让别人看得懂你" />
    </AbsoluteFill>
  );
};

/* ---------- S12 · back to the office (115.87 → 121.95) ---------- */
export const Outro4: React.FC<{ t: number }> = ({ t }) => {
  const S = 115.87, E = 121.95;
  const o = Math.min(prog(t, S - 0.2, S + 0.4), 1 - prog(t, E - 0.25, E + 0.1));
  const card = easeOut(prog(t, S + 0.6, S + 1.3));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #2c2a2a 0%, #181a22 60%, #101117 100%)' }} />
      <Glow x={960} y={420} r={620} color="rgba(233,178,110,0.9)" opacity={0.14} />
      <PeepFig {...YOU} face="Smile" x={620} y={800} h={520} />
      <PeepFig body="ButtonShirt" face="Smile" hair="ShortMessy" x={1300} y={800} h={540} flip />
      <div style={{ position: 'absolute', left: 885, top: 330 + (1 - card) * 30, opacity: card, transform: 'rotate(-4deg)' }}><PlayCard kind="c" w={150} hi={card} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, height: 290, background: 'linear-gradient(180deg, #3a2818 0px, #3a2818 16px, #1c140d 16px, #120d09 100%)' }} />
      <Subtitle t={t} at={S + 0.15} out={118.85} zh="所以，好人真的会赢" />
      <Subtitle t={t} at={119.0} out={E - 0.1} zh="只是，不是“傻”好人" />
    </AbsoluteFill>
  );
};

/* ---------- S13 · the line to remember (121.95 → 130.5) ---------- */
export const Final4: React.FC<{ t: number }> = ({ t }) => {
  const S = 121.95, END = 130.5;
  const o = Math.min(prog(t, S - 0.2, S + 0.5), 1 - easeInOut(prog(t, 129.2, END)));
  const endO = easeOut(prog(t, 126.4, 127.2));
  const a = easeOut(prog(t, S + 0.2, S + 0.9));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={380} r={520} color="rgba(233,178,110,0.9)" opacity={0.18 * a * (1 - 0.5 * endO)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 50, opacity: a * (1 - 0.55 * endO), transform: `translateY(${(1 - a) * 30}px)` }}>
        <div style={{ transform: 'rotate(-6deg)' }}><PlayCard kind="c" w={200} hi={0.6} /></div>
        <svg width={170} height={170} viewBox="-85 -85 170 170" style={{ overflow: 'visible', marginBottom: 40 }}><g transform="scale(1.3)"><IconShield /></g></svg>
      </div>
      <Subtitle t={t} at={S + 0.3} out={126.3} zh="先伸出手，|也别忘了保护自己" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: endO }}>
        <div style={{ fontFamily: ZH, fontSize: 72, fontWeight: 700, color: C.paper, letterSpacing: '0.1em' }}>《好人会赢吗》</div>
        <div style={{ fontFamily: ZH, fontSize: 36, color: C.gold, marginTop: 18, letterSpacing: '0.12em' }}>你遇到过“一报还一报”吗？评论区聊聊</div>
        <div style={{ fontFamily: ZH, fontSize: 26, color: C.dim, marginTop: 26, letterSpacing: '0.2em' }}>VIBE知识大赏 · 参考：Robert Axelrod《合作的进化》1984</div>
      </div>
    </AbsoluteFill>
  );
};

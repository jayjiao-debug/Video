import React from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { C, ZH, EN, beats, beatAfter, prog, easeOut, easeIn, easeInOut, lerp, inOut, swing, clamp } from './lib';
import { RedString, Card, cardX, stringY, Subtitle, Dust, Glow, Chip, YouMarker, LineIcon } from './ui';

const cardLand = (t: number, at: number) => {
  const f = Math.max(0, (t - at) * 30);
  const s = spring({ frame: f, fps: 30, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  return { dy: -90 * (1 - s), op: prog(t, at, at + 0.14), rot: swing(t, at, 7) };
};

/* S01–S02 · 0 → 16.63 */
export const Intro: React.FC<{ t: number }> = ({ t }) => {
  const hits = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map((i) => beats[i]);
  const sP = easeOut(prog(t, 0.0, 0.8));
  // camera: slow drift, then pull back
  const push = 1;
  const pull = easeInOut(prog(t, 10.57, 12.9));
  const scale = lerp(push, 0.9, pull);
  const tx = 0;
  const ty = lerp(0, -40, pull);
  const dimAll = easeInOut(prog(t, 12.61, 13.4)) * 0.7;
  const worldO = 1 - easeInOut(prog(t, 15.6, 16.35));
  const flipAt = beats[13];
  const dropAt = beats[17];
  const qO = Math.min(easeOut(prog(t, 12.61, 13.5)), 1 - prog(t, 16.5, 16.66));
  const qBlur = (1 - easeOut(prog(t, 12.61, 13.3))) * 8;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, opacity: worldO }}>
        <RedString p={sP} />
        {hits.map((h, i) => {
          if (t < h - 0.02) return null;
          const { dy, op, rot } = cardLand(t, h);
          const x = cardX(i);
          let extraDy = 0, extraRot = 0, o = op;
          let flip = 0;
          if (i === 0) {
            flip = easeInOut(prog(t, flipAt, flipAt + 0.45));
            const dp = prog(t, dropAt, dropAt + 1.1);
            extraDy = 300 * easeIn(dp);
            extraRot = 10 * easeIn(dp);
            o = op * (1 - prog(t, dropAt + 0.3, dropAt + 1.1));
          }
          return (
            <Card key={i} x={x} y={stringY(x)} n={i + 1} score={6} flip={flip} dy={dy + extraDy} rot={rot + extraRot} opacity={o}
              dim={i === 0 ? 0 : dimAll} />
          );
        })}
      </AbsoluteFill>
      <Subtitle t={t} at={1.0} out={5.6} zh="假如这一生，你会遇见*10*个可能的人" en="Say you'll meet ten people who could be the one." />
      <Subtitle t={t} at={6.5} out={10.45} zh="他们一个一个出现，错过了，就不能回头" en="They arrive one at a time. Let one go, and they're gone." />
      {qO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: qO, filter: `blur(${qBlur}px)` }}>
          <div style={{ fontFamily: ZH, fontSize: 84, fontWeight: 600, color: C.paper, letterSpacing: '0.12em' }}>
            你该在<span style={{ color: C.gold }}>第几个人</span>，停下来？
          </div>
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 38, color: C.dim, marginTop: 14 }}>When should you stop looking?</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* S03 · Title 16.63 → 20.69 */
export const Title: React.FC<{ t: number }> = ({ t }) => {
  const at = 16.63;
  const o = 1 - prog(t, 20.45, 20.8);
  const tp = easeOut(prog(t, at, at + 0.7));
  const glow = t < at ? 0 : Math.min(prog(t, at, at + 0.25), 1) * lerp(0.42, 0.16, easeOut(prog(t, at + 0.25, at + 2.2)));
  const sweep = lerp(-60, 160, easeInOut(prog(t, at + 0.05, at + 1.5)));
  const lineP = easeOut(prog(t, at + 0.5, at + 1.4));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={500} r={720} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={at} cx={960} cy={500} seed="title" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 318, textAlign: 'center', opacity: easeOut(prog(t, at + 0.2, at + 0.8)) }}>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginRight: 22, opacity: 0.7 }} />
        <span style={{ fontFamily: ZH, fontSize: 26, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</span>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginLeft: 8, opacity: 0.7 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: prog(t, at, at + 0.2),
        transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
        <span style={{ fontFamily: ZH, fontSize: 176, fontWeight: 900, letterSpacing: '0.12em',
          backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none' }}>
          《第几个人》
        </span>
      </div>
      <div style={{ position: 'absolute', left: 960 - 330, top: 640, width: 660, height: 2, background: C.rouge, opacity: 0.85,
        transform: `scaleX(${lineP})`, boxShadow: '0 0 8px rgba(184,72,59,0.6)' }} />
      <Subtitle t={t} at={at + 0.6} out={21} zh="什么时候，该停止相亲？" en="When to Stop Looking" y={712} size={50} enSize={36} />
    </AbsoluteFill>
  );
};

/* S04 · Rules 20.69 → 28.79 */
const ICONS = {
  shuffle: ['M18 30 h40 v54 h-40 z', 'M34 20 h40 v54', 'M50 12 h40 v54', 'M12 94 q 30 -14 60 0', 'M66 88 l 8 6 -8 6'],
  door: ['M24 12 h52 v80 h-52 z', 'M24 92 h52'],
  crown: ['M14 76 L20 32 L38 54 L50 22 L62 54 L80 32 L86 76 Z', 'M14 86 h72'],
};

export const Rules: React.FC<{ t: number }> = ({ t }) => {
  const S = 20.69, E = 28.79;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const rows = [
    { at: 20.69, zh: '顺序随机，一个一个见', en: 'They come in random order, one at a time.', icon: 'shuffle', n: '①' },
    { at: 22.71, zh: '当场决定，拒绝了不能回头', en: 'Decide on the spot. No going back.', icon: 'door', n: '②' },
    { at: 24.75, zh: '你只想要最好的那一个', en: 'You only want the very best one.', icon: 'crown', n: '③' },
  ] as const;
  const cam = 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: 'absolute', left: 110, top: 96, opacity: easeOut(prog(t, S, S + 0.6)) }}>
        <div style={{ fontFamily: ZH, fontSize: 34, color: C.paper, letterSpacing: '0.4em' }}>游戏规则</div>
        <div style={{ width: 200, height: 1.5, background: C.gold, opacity: 0.6, margin: '12px 0' }} />
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, color: C.gold }}>The rules of the game</div>
      </div>
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        {rows.map((r, i) => {
          const p = prog(t, r.at, r.at + 0.8);
          const tp = easeOut(prog(t, r.at + 0.12, r.at + 0.6));
          const y = 285 + i * 185;
          const doorClose = r.icon === 'door' ? lerp(0.25, 1, easeInOut(prog(t, r.at + 0.5, r.at + 1.1))) : 1;
          return (
            <div key={i} style={{ position: 'absolute', left: 545, top: y, display: 'flex', alignItems: 'center', gap: 46 }}>
              <div style={{ width: 120, height: 120, position: 'relative', opacity: p > 0 ? 1 : 0 }}>
                <LineIcon d={ICONS[r.icon]} p={p} size={120} />
                {r.icon === 'door' && p > 0.3 && (
                  <div style={{ position: 'absolute', left: 120 * 0.26, top: 120 * 0.14, width: 120 * 0.5, height: 120 * 0.76, background: 'rgba(201,164,92,0.28)',
                    border: `2px solid ${C.gold}`, transformOrigin: 'left', transform: `scaleX(${doorClose})` }} />
                )}
              </div>
              <div style={{ opacity: tp, transform: `translateY(${(1 - tp) * 16}px)` }}>
                <div style={{ fontFamily: ZH, fontSize: 58, fontWeight: 500, color: C.paper, letterSpacing: '0.08em' }}>
                  <span style={{ color: C.gold, marginRight: 18 }}>{r.n}</span>{r.zh}
                </div>
                <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 30, color: C.dim, marginTop: 6, marginLeft: 80 }}>{r.en}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: 'absolute', right: 110, bottom: 70, fontFamily: ZH, fontSize: 22, color: C.dim, letterSpacing: '0.2em',
        opacity: 0.8 * easeOut(prog(t, 21.6, 22.4)) }}>
        数学模型演示 · 非恋爱建议
      </div>
    </AbsoluteFill>
  );
};

/* S05 · Too early / too late 28.79 → 36.90 */
const E_SCORES = [5, 7, 4, 6, 3, 10, 5, 8, 6, 4];

export const TooEarlyLate: React.FC<{ t: number }> = ({ t }) => {
  const S = 28.79, M = 32.83, E = 36.9;
  const o = Math.min(prog(t, S, S + 0.4), 1 - prog(t, E - 0.25, E + 0.1));
  const part2 = t >= M - 0.05;
  const half = (beats[100] - beats[60]) / 80; // half-beat
  const walk = (i: number) => M + 0.25 + i * half * 1;
  // part 1 flips
  const p1Flip = (i: number) => {
    if (i === 0) return beatAfter(S, 0) + 0.05;
    if (i === 1) return beatAfter(S, 1);
    if (i >= 2 && i <= 6) return beatAfter(S, i + 1);
    return 999;
  };
  const cam = 1;
  let youX = cardX(0), youO = 1;
  if (!part2) {
    youX = t < beatAfter(S, 1) ? cardX(0) : lerp(cardX(0), cardX(1), easeInOut(prog(t, beatAfter(S, 1), beatAfter(S, 1) + 0.3)));
  } else {
    let idx = 0;
    for (let i = 0; i < 10; i++) if (t >= walk(i)) idx = i;
    const prev = Math.max(0, idx - 1);
    youX = lerp(cardX(prev), cardX(idx), easeInOut(prog(t, walk(idx), walk(idx) + 0.2)));
  }
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <RedString />
        {E_SCORES.map((sc, i) => {
          const x = cardX(i);
          let flip = 0, dim = 0, glow = 0, gold = 0;
          if (!part2) {
            const fa = p1Flip(i);
            flip = easeInOut(prog(t, fa, fa + 0.35));
            if (i >= 2) dim = 0.35 * flip; // "later you'd learn..."
            if (i === 5) { glow = flip; gold = flip; dim = 0; }
          } else {
            const back = 1 - easeInOut(prog(t, M, M + 0.25));
            const fa = walk(i);
            const f2 = easeInOut(prog(t, fa, fa + 0.22));
            flip = Math.max(back * (i <= 6 ? 1 : 0), f2);
            const passed = i < 9 && t > walk(i + 1) + 0.1;
            dim = passed ? 0.75 * prog(t, walk(i + 1) + 0.1, walk(i + 1) + 0.5) : 0;
            if (i === 5) { glow = f2 * (1 - dim); gold = f2; }
          }
          return <Card key={i} x={x} y={stringY(x)} n={i + 1} score={sc} flip={flip} dim={dim} glow={glow} gold={gold} />;
        })}
        {!part2 && (
          <>
            <Chip x={cardX(1)} y={stringY(cardX(1)) - 70} text="选了Ta" o={easeOut(prog(t, beatAfter(S, 1) + 0.3, beatAfter(S, 1) + 0.7)) * (1 - prog(t, M - 0.2, M))} />
            <Chip x={cardX(5)} y={stringY(cardX(5)) - 70} text="最好的那位，在后面" color={C.gold} fill={false}
              o={easeOut(prog(t, beatAfter(S, 6) + 0.3, beatAfter(S, 6) + 0.8)) * (1 - prog(t, M - 0.2, M))} />
          </>
        )}
        {part2 && (
          <>
            <Chip x={cardX(5)} y={stringY(cardX(5)) - 70} text="错过了" color={C.dim} fill={false}
              o={0.9 * easeOut(prog(t, walk(6) + 0.2, walk(6) + 0.6)) * (1 - prog(t, E - 0.3, E))} />
            <Chip x={cardX(9)} y={stringY(cardX(9)) - 70} text="只能是Ta" o={easeOut(prog(t, walk(9) + 0.3, walk(9) + 0.7))} />
          </>
        )}
        <YouMarker x={youX} y={stringY(youX) + 232} o={easeOut(prog(t, S + 0.2, S + 0.6)) * (part2 ? prog(t, M + 0.1, M + 0.3) : 1 - prog(t, M - 0.25, M))} />
      </AbsoluteFill>
      <Subtitle t={t} at={beatAfter(S, 1)} out={M - 0.1} zh="*太早*：更好的，还在后面" en="Too early: someone better was still coming." />
      <Subtitle t={t} at={M + 0.3} out={E - 0.1} zh="*太晚*：最好的，早已错过" en="Too late: the best one already passed." />
    </AbsoluteFill>
  );
};

export { clamp, inOut };

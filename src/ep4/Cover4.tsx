import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from '../lib';
import { Background, Vignette, Grain, Glow } from '../ui';
import { Avatar, STRATS, PlayCard } from './props4';

export const Cover4: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const tall = h > w;
  const cx = w / 2, cy = tall ? 900 : h * 0.66;
  const rx = tall ? 400 : w * 0.36, ry = tall ? 330 : h * 0.24;
  const d = tall ? 120 : 104;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Background />
      <Glow x={cx} y={cy} r={tall ? 520 : 560} color="rgba(233,178,110,0.9)" opacity={0.25} />
      {STRATS.slice(1).map((s, i) => {
        const a = (i / 13) * Math.PI * 2 - Math.PI / 2;
        return <Avatar key={i} s={s} d={d} x={cx + Math.cos(a) * rx} y={cy + Math.sin(a) * ry} label={false} o={0.72} />;
      })}
      <Avatar s={STRATS[0]} d={tall ? 300 : 250} x={cx} y={cy} ring={C.goldHi} glow={0.9} lsize={tall ? 44 : 38} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: tall ? 110 : 70, textAlign: 'center' }}>
        <div style={{ fontFamily: ZH, fontSize: tall ? 34 : 30, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏 · 好人会赢吗</div>
        <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: tall ? 124 : w > 1600 ? 120 : 104, color: C.paper, letterSpacing: '0.06em', lineHeight: 1.22, marginTop: 24, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>
          {tall ? (<>做好人，<br />注定<span style={{ color: C.gold }}>吃亏</span>吗？</>) : (<>做好人，注定<span style={{ color: C.gold }}>吃亏</span>吗？</>)}
        </div>
      </div>
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

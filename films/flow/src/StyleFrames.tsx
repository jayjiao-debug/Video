import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp, FPS, mulberry} from './lib';
import {C, dot, glow, Light, Night} from './look';
import {BigNum, Corner, Credit, Sub, Tag} from './ui';

/* Style frames for the flow film, in the reference look. A: the cold open, one person at work while
   the clock races (hours like minutes) and a current of light streams past. B: the flow channel,
   challenge against skill: anxiety above (red jitter), boredom below (grey, slow), gold particles
   streaming through the channel between. C: the paradox of work, 54% vs 17%, as particle bars.
   D: the brain, frontal "self-monitor" quieting (a hedged 'studies suggest'). */
export const LOOK_FRAMES = 24 * FPS;

const STREAM = (() => {
  const r = mulberry(4);
  return Array.from({length: 1400}, () => ({y: r(), sp: 0.3 + r(), ph: r(), w: r()}));
})();

const Desk: React.FC<{t: number}> = ({t}) => {
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the current: light streaming left to right, bending around the worker
    for (const s of STREAM) {
      const x = ((s.ph + t * 0.08 * s.sp) % 1) * 2200 - 140;
      const y0 = 160 + s.y * 620;
      const dy = (y0 - 470) / 310;
      const bend = Math.exp(-Math.pow((x - 960) / 260, 2)) * Math.sign(dy || 1) * 70 * (1 - Math.abs(dy));
      const y = y0 + bend;
      ctx.strokeStyle = `rgba(241,197,109,${0.08 + 0.18 * s.w})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 26 * s.sp, y);
      ctx.stroke();
    }
    // the worker and a lamp pool
    glow(ctx, 960, 520, 70, 0.12);
    glow(ctx, 960, 500, 9, 1, true);
    // the clock, top right: hands racing
    const cx = 1500;
    const cy = 300;
    const R = 110;
    ctx.strokeStyle = 'rgba(241,197,109,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R);
      ctx.lineTo(cx + Math.sin(a) * (R - 12), cy - Math.cos(a) * (R - 12));
      ctx.stroke();
    }
    const m = t * 3.2;
    for (const [a, l, w] of [
      [m, R - 22, 2],
      [m / 12, R - 50, 3.5],
    ] as const) {
      ctx.strokeStyle = 'rgba(255,226,170,0.95)';
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l);
      ctx.stroke();
    }
    // motion trail of the minute hand
    for (let k = 1; k < 14; k++) {
      const a = m - k * 0.12;
      dot(ctx, cx + Math.sin(a) * (R - 26), cy - Math.cos(a) * (R - 26), 2, 0.5 * (1 - k / 14));
    }
  };
  return <Light draw={draw} deps={[t]} bloom={1} />;
};

const CH = {x0: 360, y0: 800, x1: 1500, y1: 140};
const JIT = (() => {
  const r = mulberry(9);
  return Array.from({length: 2600}, () => ({u: r(), v: r(), ph: r() * 6.28, sp: 0.5 + r()}));
})();
const Channel: React.FC<{t: number}> = ({t}) => {
  const W = CH.x1 - CH.x0;
  const H = CH.y0 - CH.y1;
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(241,197,109,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(CH.x0, CH.y1 - 20);
    ctx.lineTo(CH.x0, CH.y0);
    ctx.lineTo(CH.x1 + 30, CH.y0);
    ctx.stroke();
    // channel edges
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(241,197,109,0.45)';
    for (const off of [-0.12, 0.12]) {
      ctx.beginPath();
      ctx.moveTo(CH.x0 + W * Math.max(0, -off), CH.y0 - H * Math.max(0, off));
      ctx.lineTo(CH.x0 + W * Math.min(1, 1 - off), CH.y0 - H * Math.min(1, 1 + off));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const p of JIT) {
      const d = p.v - p.u; // >0 above the diagonal (too hard), <0 below (too easy)
      let x = CH.x0 + p.u * W;
      let y = CH.y0 - p.v * H;
      if (Math.abs(d) < 0.12) {
        // in the channel: stream up the diagonal
        const s = (p.u + t * 0.06 * p.sp) % 1;
        x = CH.x0 + s * W;
        y = CH.y0 - (s + d) * H;
        dot(ctx, x, y, 1.6, 0.85);
      } else if (d > 0) {
        x += Math.sin(t * 20 * p.sp + p.ph) * 3;
        y += Math.cos(t * 23 * p.sp + p.ph) * 3;
        ctx.fillStyle = `rgba(232,115,90,${0.35 + 0.25 * clamp(d * 3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        y += Math.sin(t * 0.5 * p.sp + p.ph) * 2;
        ctx.fillStyle = 'rgba(170,180,200,0.22)';
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  return <Light draw={draw} deps={[t]} bloom={0.9} />;
};

const BARS = (() => {
  const r = mulberry(17);
  return Array.from({length: 3000}, () => [r(), r(), r()]);
})();
const Paradox: React.FC<{t: number}> = ({t}) => {
  const draw = (ctx: CanvasRenderingContext2D) => {
    for (const [k, frac, x0] of [
      [0, 0.54, 620],
      [1, 0.17, 1120],
    ] as const) {
      const w = 220;
      const h = 560 * frac;
      ctx.strokeStyle = 'rgba(241,197,109,0.4)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x0, 780 - 560, w, 560);
      for (let i = 0; i < BARS.length / 2; i++) {
        const [u, v, ph] = BARS[i + k * 1500];
        if (v > frac) continue;
        dot(ctx, x0 + u * w, 780 - (v / frac) * h + Math.sin(t * 2 + ph * 6) * 1.5, 1.5, 0.75);
      }
    }
  };
  return <Light draw={draw} deps={[t]} bloom={0.9} />;
};

const BRAIN = (() => {
  const r = mulberry(23);
  const blobs = [
    [820, 420, 230, 170],
    [1000, 360, 230, 160],
    [1160, 430, 190, 150],
    [930, 540, 220, 90],
    [1210, 600, 110, 60],
  ];
  const out: [number, number][] = [];
  while (out.length < 4200) {
    const x = 560 + r() * 840;
    const y = 180 + r() * 520;
    if (blobs.some(([cx, cy, a, b]) => ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 < 1)) out.push([x, y]);
  }
  return out;
})();
const Brain: React.FC<{t: number}> = ({t}) => {
  const draw = (ctx: CanvasRenderingContext2D) => {
    const r = mulberry(3);
    for (const [x, y] of BRAIN) {
      const front = clamp((760 - x) / 160);
      const tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + r() * 6.28);
      const a = (0.25 + 0.5 * tw) * (1 - 0.8 * front);
      dot(ctx, x, y, 1.5, a);
    }
    ctx.strokeStyle = 'rgba(241,197,109,0.55)';
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.ellipse(700, 420, 150, 150, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  return <Light draw={draw} deps={[t]} bloom={0.9} />;
};

export const Look: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const k = Math.floor(T / 6);
  const t = T - k * 6;
  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Night />
      {k === 0 ? (
        <>
          <Desk t={t} />
          <Sub T={t} at={0} out={99} zh="你有没有过：做一件事，一抬头，[天黑了]？" en="Ever looked up from something and found it was dark outside?" />
        </>
      ) : k === 1 ? (
        <>
          <Channel t={t} />
          <Tag x={CH.x0 - 20} y={CH.y1 - 60} text="挑战 ↑" anchor="right" size={26} color={C.gold} />
          <Tag x={CH.x1 + 40} y={CH.y0 - 14} text="技能 →" size={26} color={C.gold} />
          <Tag x={560} y={260} text="焦虑" size={34} color={C.red} />
          <Tag x={1280} y={640} text="无聊" size={34} color={C.grey} />
          <Tag x={1180} y={230} text="心流" size={40} color={C.gold} />
          <Sub T={t} at={0} out={99} zh="难一点，焦虑；易一点，无聊；刚刚好，就是[心流]" en="Too hard: anxiety. Too easy: boredom. Just right: flow." />
        </>
      ) : k === 2 ? (
        <>
          <Paradox t={t} />
          <BigNum T={t} at={0} out={99} x={530} y={80} value="54%" zh="上班时" en="AT WORK" size={110} align="center" />
          <BigNum T={t} at={0} out={99} x={1230} y={80} value="17%" zh="下班后" en="IN LEISURE" size={110} align="center" />
          <Sub T={t} at={0} out={99} zh="可上班时，大家还是[更想]去做别的事" en="Yet at work, people still wished they were doing something else." />
          <Credit T={t} at={0} out={99} text="Csikszentmihalyi & LeFevre, JPSP, 1989 · 78 名芝加哥上班族" />
        </>
      ) : (
        <>
          <Brain t={t} />
          <Tag x={420} y={180} text="“自我监控”变安静（研究提示）" size={26} color={C.gold} />
          <Sub T={t} at={0} out={99} zh="即兴演奏时，大脑前额叶的一部分[安静]下来" en="During improvisation, part of the prefrontal cortex goes quiet." />
          <Credit T={t} at={0} out={99} text="Limb & Braun, PLoS ONE, 2008 · 6 位爵士钢琴家" />
        </>
      )}
      <Corner />
    </AbsoluteFill>
  );
};

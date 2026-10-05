import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from './lib';
import {SANS} from './look';
import {anim, C3, Create, M, Sub3, TeX, Write} from './m3';

/* Style frames for the flow film in the 3Blue1Brown look. 6 s each; within each frame the pieces
   build with Manim-like timing (axes Create, labels Write, curves Create, fills fade in). */
export const TB_FRAMES = 24 * FPS;
const W = 1920;
const H = 1080;

// ------------------------------------------------------------------ 1. time: a clock and two number lines
const TimeFrame: React.FC<{t: number}> = ({t}) => {
  const cx = 560;
  const cy = 400;
  const R = 220;
  const ring = anim(t, 0, 1.2);
  const ticks = anim(t, 0.6, 1);
  const m = t * 2.4;
  const lines = anim(t, 1.6, 1.4);
  const map = anim(t, 2.8, 1.6);
  // real time 0..3 h on the top line; the same marks squeezed on the felt line
  const L0 = 1000;
  const L1 = 1780;
  const real = (k: number) => L0 + (k / 6) * (L1 - L0);
  const felt = (k: number) => L0 + (k / 6) * (L1 - L0) * 0.22;
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}`} p={ring} color={M.white} w={4} />
        {Array.from({length: 12}, (_, k) => {
          const a = (k / 12) * Math.PI * 2;
          return <Create key={k} d={`M ${cx + Math.sin(a) * (R - 26)} ${cy - Math.cos(a) * (R - 26)} L ${cx + Math.sin(a) * (R - 6)} ${cy - Math.cos(a) * (R - 6)}`} p={ticks} color={M.white} w={4} />;
        })}
        {ring > 0.99 ? (
          <>
            <line x1={cx} y1={cy} x2={cx + Math.sin(m) * (R - 50)} y2={cy - Math.cos(m) * (R - 50)} stroke={M.yellow} strokeWidth={6} strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={cx + Math.sin(m / 12) * (R - 110)} y2={cy - Math.cos(m / 12) * (R - 110)} stroke={M.white} strokeWidth={8} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={9} fill={M.white} />
          </>
        ) : null}
        {/* number lines */}
        <Create d={`M ${L0} 300 L ${L1} 300`} p={lines} color={M.white} w={3} />
        <Create d={`M ${L0} 560 L ${L1} 560`} p={lines} color={M.white} w={3} />
        {Array.from({length: 7}, (_, k) => (
          <g key={k}>
            <Create d={`M ${real(k)} 288 L ${real(k)} 312`} p={lines} color={M.white} w={3} />
            <Create d={`M ${felt(k)} 548 L ${felt(k)} 572`} p={map} color={M.blue} w={3} />
            <Create d={`M ${real(k)} 312 L ${felt(k)} 548`} p={map} color={M.blue} w={2} />
          </g>
        ))}
      </svg>
      {Array.from({length: 4}, (_, k) => (
        <Write key={k} p={anim(t, 1.9 + k * 0.1, 0.8)} style={{left: real(k * 2) - 30, top: 240, width: 60, textAlign: 'center'}}>
          <TeX tex={`${k}\\,\\text{h}`} size={34} />
        </Write>
      ))}
      <Write p={anim(t, 1.8, 0.8)} style={{left: L0 - 150, top: 280}}>
        <span style={{fontFamily: SANS, fontSize: 30, color: M.white}}>实际</span>
      </Write>
      <Write p={anim(t, 3.2, 0.8)} color={M.blue} style={{left: L0 - 150, top: 540}}>
        <span style={{fontFamily: SANS, fontSize: 30}}>感觉</span>
      </Write>
      <Sub3 T={t} at={0.2} out={99} zh={<>你有没有过：做一件事，一抬头，<C3 c={M.yellow}>天黑了</C3>？</>} en="Ever looked up from something and found it was dark?" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. the flow channel
const AX = {x0: 520, y0: 780, x1: 1460, y1: 140};
const ChannelFrame: React.FC<{t: number}> = ({t}) => {
  const ax = anim(t, 0, 1.2);
  const diag = anim(t, 1.2, 1);
  const band = anim(t, 2, 1);
  const lab = anim(t, 2.6, 1);
  const Wd = AX.x1 - AX.x0;
  const Hd = AX.y0 - AX.y1;
  const P = (s: number, c: number) => [AX.x0 + s * Wd, AX.y0 - c * Hd];
  const e = 0.13;
  const bandPath = `M ${P(0, 0)[0]} ${P(0, 0)[1]} L ${P(0, e).join(' ')} L ${P(1 - e, 1).join(' ')} L ${P(1, 1).join(' ')} L ${P(1, 1 - e).join(' ')} L ${P(e, 0).join(' ')} Z`;
  // a learner: a staircase that stays in the channel (skill up, then challenge up)
  const steps: [number, number][] = [[0.05, 0.05]];
  for (let k = 0; k < 7; k++) {
    const [s, c] = steps[steps.length - 1];
    steps.push([s + 0.12, c]);
    steps.push([s + 0.12, c + 0.12]);
  }
  const path = steps.map(([s, c], i) => `${i ? 'L' : 'M'} ${P(s, c).join(' ')}`).join(' ');
  const walk = anim(t, 3.2, 2.4);
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={bandPath} fill={M.yellow} fillOpacity={0.18 * band} stroke="none" />
        <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x1 + 40} ${AX.y0}`} p={ax} color={M.blue} w={4} />
        <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x0} ${AX.y1 - 40}`} p={ax} color={M.red} w={4} />
        <polygon points={`${AX.x1 + 52},${AX.y0} ${AX.x1 + 28},${AX.y0 - 10} ${AX.x1 + 28},${AX.y0 + 10}`} fill={M.blue} opacity={ax} />
        <polygon points={`${AX.x0},${AX.y1 - 52} ${AX.x0 - 10},${AX.y1 - 28} ${AX.x0 + 10},${AX.y1 - 28}`} fill={M.red} opacity={ax} />
        <Create d={`M ${P(0, 0).join(' ')} L ${P(1, 1).join(' ')}`} p={diag} color={M.white} w={3} dash="10 10" />
        <Create d={path} p={walk} color={M.yellow} w={5} />
        {walk > 0 ? (() => {
          const k = Math.min(steps.length - 1, Math.floor(walk * (steps.length - 1)));
          const [s, c] = steps[k];
          const [x, y] = P(s, c);
          return <circle cx={x} cy={y} r={11} fill={M.yellow} />;
        })() : null}
      </svg>
      <Write p={anim(t, 0.8, 0.8)} color={M.blue} style={{left: AX.x1 + 70, top: AX.y0 - 26}}>
        <span style={{fontFamily: SANS, fontSize: 34}}>技能 </span>
        <TeX tex="s" size={40} color={M.blue} />
      </Write>
      <Write p={anim(t, 0.8, 0.8)} color={M.red} style={{left: AX.x0 - 40, top: AX.y1 - 110}}>
        <span style={{fontFamily: SANS, fontSize: 34}}>挑战 </span>
        <TeX tex="c" size={40} color={M.red} />
      </Write>
      <Write p={lab} color={M.red} style={{left: 640, top: 250}}>
        <span style={{fontFamily: SANS, fontSize: 38}}>焦虑 </span>
        <TeX tex="c \gg s" size={40} color={M.red} />
      </Write>
      <Write p={lab} color={M.blue} style={{left: 1180, top: 610}}>
        <span style={{fontFamily: SANS, fontSize: 38}}>无聊 </span>
        <TeX tex="c \ll s" size={40} color={M.blue} />
      </Write>
      <Write p={anim(t, 2.9, 1)} color={M.yellow} style={{left: 900, top: 150}}>
        <span style={{fontFamily: SANS, fontSize: 42}}>心流 </span>
        <TeX tex="c \approx s" size={44} color={M.yellow} />
      </Write>
      <Sub3 T={t} at={0.2} out={99} zh={<>难度和能力<C3 c={M.yellow}>刚好</C3>对上，才是心流</>} en="Flow lives where challenge and skill match." />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3. the 85% rule: a Gaussian and its 1σ tail
const GaussFrame: React.FC<{t: number}> = ({t}) => {
  const x0 = 360;
  const x1 = 1560;
  const yb = 700;
  const sx = (x1 - x0) / 8; // −4σ..4σ
  const X = (z: number) => (x0 + x1) / 2 + z * sx;
  const Y = (z: number) => yb - 520 * Math.exp(-z * z / 2);
  const curve = Array.from({length: 161}, (_, k) => {
    const z = -4 + k * 0.05;
    return `${k ? 'L' : 'M'} ${X(z).toFixed(1)} ${Y(z).toFixed(1)}`;
  }).join(' ');
  const tail = `M ${X(-4)} ${yb} ` + Array.from({length: 61}, (_, k) => {
    const z = -4 + k * 0.05;
    return `L ${X(z).toFixed(1)} ${Y(z).toFixed(1)}`;
  }).join(' ') + ` L ${X(-1)} ${yb} Z`;
  const ax = anim(t, 0, 1);
  const cv = anim(t, 0.8, 1.4);
  const sh = anim(t, 2.2, 1);
  const eq = anim(t, 3, 1.2);
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={tail} fill={M.yellow} fillOpacity={0.45 * sh} stroke="none" />
        <Create d={`M ${x0 - 40} ${yb} L ${x1 + 40} ${yb}`} p={ax} color={M.white} w={3} />
        {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
          <Create key={z} d={`M ${X(z)} ${yb - 10} L ${X(z)} ${yb + 10}`} p={ax} color={M.white} w={3} />
        ))}
        <Create d={curve} p={cv} color={M.blue} w={5} />
        <Create d={`M ${X(-1)} ${yb} L ${X(-1)} ${Y(-1) - 30}`} p={sh} color={M.yellow} w={3} dash="8 8" />
      </svg>
      {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
        <Write key={z} p={anim(t, 0.6 + (z + 3) * 0.05, 0.6)} style={{left: X(z) - 40, top: yb + 22, width: 80, textAlign: 'center'}}>
          <TeX tex={z === 0 ? '0' : `${z}\\sigma`} size={32} color={z === -1 ? M.yellow : M.white} />
        </Write>
      ))}
      <Write p={eq} style={{left: 1230, top: 300}}>
        <TeX tex="\Phi(-1) \approx 0.1587" size={64} color={M.yellow} />
      </Write>
      <Write p={anim(t, 3.6, 1)} style={{left: 1234, top: 390}}>
        <span style={{fontFamily: SANS, fontSize: 30, color: M.greyB}}>最优错误率 ≈ 15.87%（模型推导）</span>
      </Write>
      <Sub3 T={t} at={0.2} out={99} zh={<>答对约 <C3 c={M.yellow}>85%</C3> 的时候，学得最快</>} en="Learning is fastest at about 85% correct (a model result)." />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4. 54% vs 17%
const BarsFrame: React.FC<{t: number}> = ({t}) => {
  const ax = anim(t, 0, 1);
  const b1 = anim(t, 1, 1.4);
  const b2 = anim(t, 1.5, 1.4);
  const yb = 760;
  const sc = 9; // px per %
  return (
    <AbsoluteFill style={{background: M.bg}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M 600 ${yb} L 1320 ${yb}`} p={ax} color={M.white} w={3} />
        <rect x={700} y={yb - 54 * sc * b1} width={180} height={54 * sc * b1} fill={M.blue} fillOpacity={0.75} stroke={M.blue} strokeWidth={4} />
        <rect x={1040} y={yb - 17 * sc * b2} width={180} height={17 * sc * b2} fill={M.grey} fillOpacity={0.6} stroke={M.greyB} strokeWidth={4} />
      </svg>
      <Write p={anim(t, 2.2, 0.8)} style={{left: 700, top: yb - 54 * sc - 80, width: 180, textAlign: 'center'}}>
        <TeX tex="54\%" size={60} color={M.blue} />
      </Write>
      <Write p={anim(t, 2.6, 0.8)} style={{left: 1040, top: yb - 17 * sc - 80, width: 180, textAlign: 'center'}}>
        <TeX tex="17\%" size={60} color={M.greyB} />
      </Write>
      <Write p={anim(t, 0.6, 0.8)} style={{left: 700, top: yb + 20, width: 180, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 32, color: M.white}}>上班时</span>
      </Write>
      <Write p={anim(t, 0.7, 0.8)} style={{left: 1040, top: yb + 20, width: 180, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 32, color: M.white}}>下班后</span>
      </Write>
      <Write p={anim(t, 3.4, 1)} style={{left: 1300, top: 330}}>
        <TeX tex="\frac{54}{17} \approx 3.2" size={56} color={M.yellow} />
      </Write>
      <Sub3 T={t} at={0.2} out={99} zh={<>上班时的心流，是下班后的 <C3 c={M.yellow}>3 倍</C3>多</>} en="Flow at work: more than three times as often as in leisure." />
      <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.4)'}}>Csikszentmihalyi & LeFevre, JPSP, 1989 · n = 78</div>
    </AbsoluteFill>
  );
};

export const Tb: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const k = Math.floor(T / 6);
  const t = T - k * 6;
  const F = [TimeFrame, ChannelFrame, GaussFrame, BarsFrame][Math.min(3, k)];
  return (
    <>
      <F t={t} />
      <div style={{position: 'absolute', top: 36, right: 48, fontFamily: SANS, fontSize: 19, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)'}}>
        <span style={{color: M.gold}}>◆ Juno</span> · VIBE知识大赏
      </div>
    </>
  );
};

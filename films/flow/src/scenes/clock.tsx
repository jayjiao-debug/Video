import React from 'react';
import {b, clamp, inOut, keys, prog} from '../lib';
import {LATIN, SANS, SERIF} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';

/* The clock (S1 cold open, S10 callback), the title card and the end card, in the 3b1b look.
   S1: the clock draws itself and its hands speed up (hours passing like minutes); two number lines,
   real time and felt time, the felt marks squeezed together; at b31 it all folds into the title.
   S10: the clock again, its hands slowing to a stop. */
const W = 1920;
const H = 1080;
const CX = 560;
const CY = 410;
const R = 230;

/** minute-hand angle in S1: speeds up from ~0.3 to ~3 turns per second */
export const minuteS1 = (t: number) => 2 * t + 0.33 * t * t;
/** minute-hand angle in S10 (t from b273): fast, slowing to a stop at b305 */
export const minuteS10 = (t: number) => {
  const D = b(305) - b(273);
  const u = Math.min(t, D);
  return 14 * (u - (u * u) / (2 * D)) + 20;
};

const Clock: React.FC<{p: number; m: number; o: number; dx?: number}> = ({p, m, o, dx = 0}) => (
  <g opacity={o} transform={`translate(${dx},0)`}>
    <Create d={`M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R}`} p={p} color={M.white} w={4} />
    {Array.from({length: 12}, (_, k) => {
      const a = (k / 12) * Math.PI * 2;
      return <Create key={k} d={`M ${CX + Math.sin(a) * (R - 26)} ${CY - Math.cos(a) * (R - 26)} L ${CX + Math.sin(a) * (R - 6)} ${CY - Math.cos(a) * (R - 6)}`} p={clamp((p - 0.4) / 0.6)} color={M.white} w={4} />;
    })}
    {p > 0.6 ? (
      <g opacity={clamp((p - 0.6) / 0.4)}>
        {Array.from({length: 8}, (_, k) => {
          // a faint smear behind the minute hand when it is fast
          const a = m - (k + 1) * 0.07;
          return <line key={k} x1={CX} y1={CY} x2={CX + Math.sin(a) * (R - 50)} y2={CY - Math.cos(a) * (R - 50)} stroke={M.yellow} strokeWidth={6} strokeLinecap="round" opacity={0.12 * (1 - k / 8)} />;
        })}
        <line x1={CX} y1={CY} x2={CX + Math.sin(m) * (R - 50)} y2={CY - Math.cos(m) * (R - 50)} stroke={M.yellow} strokeWidth={6} strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={CX + Math.sin(m / 12) * (R - 115)} y2={CY - Math.cos(m / 12) * (R - 115)} stroke={M.white} strokeWidth={9} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={10} fill={M.white} />
      </g>
    ) : null}
  </g>
);

const L0 = 1020;
const L1 = 1780;
export const S1: React.FC<{T: number}> = ({T}) => {
  const out = 1 - prog(T, b(30.6), b(31.1));
  const ring = anim(T, 0.05, 1.3);
  const lines = anim(T, b(9), 1.2);
  const map = anim(T, b(11), 1.6);
  const squeeze = keys(T, [[b(11), 1], [b(13), 0.22], [b(19), 0.22], [b(22), 0.12]]);
  const real = (k: number) => L0 + (k / 6) * (L1 - L0);
  const felt = (k: number) => L0 + (k / 6) * (L1 - L0) * squeeze;
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: out}}>
        <Clock p={ring} m={minuteS1(T)} o={1} dx={(1 - anim(T, b(8.3), 1.4)) * (960 - CX)} />
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
      <div style={{opacity: out}}>
        {Array.from({length: 4}, (_, k) => (
          <Write key={k} p={anim(T, b(9.5) + k * 0.12, 0.8)} style={{left: real(k * 2) - 30, top: 238, width: 60, textAlign: 'center'}}>
            <TeX tex={`${k}\\,\\text{h}`} size={34} />
          </Write>
        ))}
        <Write p={anim(T, b(9.3), 0.8)} style={{left: L0 - 150, top: 280}}>
          <span style={{fontFamily: SANS, fontSize: 30, color: M.white}}>实际</span>
        </Write>
        <Write p={anim(T, b(12), 0.8)} color={M.blue} style={{left: L0 - 150, top: 540}}>
          <span style={{fontFamily: SANS, fontSize: 30}}>感觉</span>
        </Write>
        <Write p={anim(T, b(13.5), 0.8)} color={M.greyB} style={{left: L0, top: 600}}>
          <span style={{fontFamily: SANS, fontSize: 22}}>示意</span>
        </Write>
      </div>
    </>
  );
};

/** the motif: a single smooth wave, drawn left to right */
export const wave = (x0: number, x1: number, y: number, amp: number, n = 120) =>
  Array.from({length: n + 1}, (_, k) => {
    const u = k / n;
    const x = x0 + u * (x1 - x0);
    const yy = y - amp * Math.sin(u * Math.PI * 3) * Math.sin(u * Math.PI);
    return `${k ? 'L' : 'M'} ${x.toFixed(1)} ${yy.toFixed(1)}`;
  }).join(' ');

export const TitleCard: React.FC<{T: number}> = ({T}) => {
  const o = 1 - prog(T, b(38.2), b(39));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={wave(700, 1220, 640, 34)} p={anim(T, b(31), 1.4)} color={M.yellow} w={5} />
      </svg>
      <Write p={anim(T, b(31.5), 1)} color="rgba(255,255,255,0.6)" style={{left: 0, right: 0, top: 270, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontSize: 26, letterSpacing: '0.4em', fontVariantNumeric: 'lining-nums'}}>FLOW · CSIKSZENTMIHALYI · 1975</span>
      </Write>
      <Write p={anim(T, b(31), 1.1)} style={{left: 0, right: 0, top: 330, textAlign: 'center'}}>
        <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 170, letterSpacing: '0.14em'}}>心流</span>
      </Write>
      <Write p={anim(T, b(32.5), 1)} style={{left: 0, right: 0, top: 700, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 38, fontWeight: 600}}>为什么有时候，时间会消失？</span>
      </Write>
      <Write p={anim(T, b(33.5), 1)} color="rgba(255,255,255,0.5)" style={{left: 0, right: 0, top: 760, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 28}}>Why does time sometimes disappear?</span>
      </Write>
      <Write p={anim(T, b(34.5), 1)} color={M.gold} style={{left: 0, right: 0, top: 830, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 18, letterSpacing: '0.3em'}}>— Juno · VIBE知识大赏 —</span>
      </Write>
    </div>
  );
};

export const S10: React.FC<{T: number}> = ({T}) => {
  const t = T - b(273);
  const o = inOut(T, b(273), b(311) + 0.3, 0.5, 0.8);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <g transform={`translate(${960 - CX},${0})`}>
        <Clock p={anim(T, b(273), 1.3)} m={minuteS10(t)} o={1} />
      </g>
    </svg>
  );
};

const QUESTION = '你最近一次忘了时间，是在做什么？';
const SOURCES = 'Csikszentmihalyi 1975, 1990 · Csikszentmihalyi & LeFevre 1989 · Limb & Braun 2008 · Wilson et al. 2019 · Keller & Bless 2008 · Ashe 1975';
export const EndCard: React.FC<{T: number}> = ({T}) => {
  const t0 = b(311);
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M 960 118 A 52 52 0 1 1 959.99 118`} p={anim(T, t0, 1.2)} color={M.gold} w={3} />
        <Create d={wave(760, 1160, 500, 22)} p={anim(T, t0 + 0.8, 1.2)} color={M.yellow} w={4} />
      </svg>
      <Write p={anim(T, t0 + 0.5, 0.8)} color={M.gold} style={{left: 0, right: 0, top: 128, textAlign: 'center'}}>
        <span style={{fontFamily: LATIN, fontWeight: 600, fontSize: 62, lineHeight: '84px'}}>J</span>
      </Write>
      <Write p={anim(T, t0 + 0.3, 1)} style={{left: 0, right: 0, top: 270, textAlign: 'center'}}>
        <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 96, letterSpacing: '0.12em'}}>《心流》</span>
      </Write>
      <Write p={anim(T, t0 + 1.2, 1)} style={{left: 0, right: 0, top: 570, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 44}}>{QUESTION}</span>
      </Write>
      <div style={{position: 'absolute', left: 0, right: 0, top: 670, display: 'flex', justifyContent: 'center', opacity: anim(T, t0 + 1.8, 0.6)}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, color: M.white, border: `2px solid ${M.gold}`, borderRadius: 999, padding: '8px 30px', letterSpacing: '0.06em'}}>关注 Juno · 每期一个反直觉的知识</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: SANS, fontSize: 17, color: 'rgba(255,255,255,0.38)', opacity: anim(T, t0 + 2.2, 0.6)}}>{SOURCES}</div>
    </>
  );
};

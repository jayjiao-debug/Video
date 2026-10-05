import React from 'react';
import {b, clamp, inOut, mulberry, prog} from '../lib';
import {SANS} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';

/* S5 (b128–b161): the pager study. 78 people as dots (6 × 13); each beep flashes a ring on one person
   and sends a point flying into a small challenge–skill plot, coloured by where it lands (flow yellow,
   anxiety red, boredom blue, apathy grey); a day counter runs through the week (time compressed;
   one point per beep shown for a sample of beeps).
   S6 (b161–b185): the result as bars, 54% vs 17%, the ratio; "wished to be elsewhere" at work; TV. */
const W = 1920;
const H = 1080;
const PEOPLE = Array.from({length: 78}, (_, i) => [180 + (i % 13) * 52, 300 + Math.floor(i / 13) * 64]);
const PX = {x0: 1150, y0: 760, x1: 1750, y1: 220};
export const BEEPS = (() => {
  const r = mulberry(31);
  const n = 560;
  const t0 = b(136);
  const t1 = b(159);
  return Array.from({length: n}, (_, k) => {
    const t = t0 + ((k + r() * 0.8) / n) * (t1 - t0);
    const who = Math.floor(r() * 78);
    const s = Math.min(0.98, Math.max(0.02, 0.5 + (r() - 0.5) * 0.9));
    const c = Math.min(0.98, Math.max(0.02, s + (r() - 0.5) * 0.7));
    return {t, who, s, c};
  });
})();
const colourOf = (s: number, c: number) => (s > 0.5 && c > 0.5 && Math.abs(c - s) < 0.2 ? M.yellow : c - s > 0.15 ? M.red : s - c > 0.15 ? M.blue : M.grey);
const PP = (s: number, c: number) => [PX.x0 + s * (PX.x1 - PX.x0), PX.y0 - c * (PX.y0 - PX.y1)];

export const S5: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(128), b(161) + 0.2, 0.6, 0.3);
  const people = anim(T, b(128.5), 1.5);
  const ax = anim(T, b(136), 1);
  const day = Math.min(7, 1 + Math.floor(clamp((T - b(136)) / (b(159) - b(136))) * 7));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {PEOPLE.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill="none" stroke={M.white} strokeWidth={2.5} opacity={clamp(people * 1.5 - i / 78)} />
        ))}
        <Create d={`M ${PX.x0} ${PX.y0} L ${PX.x1 + 20} ${PX.y0}`} p={ax} color={M.blue} w={3} />
        <Create d={`M ${PX.x0} ${PX.y0} L ${PX.x0} ${PX.y1 - 20}`} p={ax} color={M.red} w={3} />
        {BEEPS.map((e, k) => {
          const u = (T - e.t) / 0.7;
          if (u < 0) return null;
          const [x0, y0] = PEOPLE[e.who];
          const [x1, y1] = PP(e.s, e.c);
          const f = clamp(u);
          const x = x0 + (x1 - x0) * (1 - Math.pow(1 - f, 3));
          const y = y0 + (y1 - y0) * (1 - Math.pow(1 - f, 3)) - Math.sin(f * Math.PI) * 80;
          const ring = u < 1 ? <circle cx={x0} cy={y0} r={9 + u * 22} fill="none" stroke={M.yellow} strokeWidth={2} opacity={1 - u} /> : null;
          return (
            <g key={k}>
              {ring}
              <circle cx={x} cy={y} r={4} fill={colourOf(e.s, e.c)} opacity={0.9} />
            </g>
          );
        })}
      </svg>
      <Write p={anim(T, b(129), 0.8)} style={{left: 180, top: 210}}>
        <span style={{fontFamily: SANS, fontSize: 32}}>78 位芝加哥上班族</span>
      </Write>
      <Write p={anim(T, b(136.5), 0.8)} color={M.blue} style={{left: PX.x1 - 40, top: PX.y0 + 16}}>
        <TeX tex="s" size={36} color={M.blue} />
      </Write>
      <Write p={anim(T, b(136.5), 0.8)} color={M.red} style={{left: PX.x0 - 40, top: PX.y1 - 40}}>
        <TeX tex="c" size={36} color={M.red} />
      </Write>
      {T > b(136) ? (
        <div style={{position: 'absolute', left: 180, top: 720, fontFamily: SANS, fontSize: 34, color: M.white, opacity: anim(T, b(136), 0.6)}}>
          第 <TeX tex={`${day}`} size={40} color={M.yellow} /> 天 · 每天约 8 次随机“哔”
        </div>
      ) : null}
      <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.4)', opacity: anim(T, b(144), 0.6)}}>Csikszentmihalyi & LeFevre, JPSP, 1989 · 示意</div>
    </div>
  );
};

export const S6: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(161) - 0.1, b(185), 0.3, 0.45);
  const yb = 760;
  const sc = 9;
  const b1 = anim(T, b(161), 1);
  const b2 = anim(T, b(161.5), 1);
  const tv = anim(T, b(177), 1.2);
  const bars = 1 - prog(T, b(176.5), b(177.5)) * 0.7;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={bars}>
          <Create d={`M 520 ${yb} L 1240 ${yb}`} p={anim(T, b(160.5), 0.6)} color={M.white} w={3} />
          <rect x={620} y={yb - 54 * sc * b1} width={180} height={54 * sc * b1} fill={M.blue} fillOpacity={0.75} stroke={M.blue} strokeWidth={4} />
          <rect x={960} y={yb - 17 * sc * b2} width={180} height={17 * sc * b2} fill={M.grey} fillOpacity={0.6} stroke={M.greyB} strokeWidth={4} />
          {/* "wished to be elsewhere": an arrow at the work bar */}
          <Create d={`M 560 ${yb - 54 * sc - 40} C 470 ${yb - 54 * sc - 120}, 400 ${yb - 300}, 420 ${yb - 200}`} p={anim(T, b(169.5), 1)} color={M.red} w={4} />
        </g>
        {/* TV: a set, a screen, a lazy dot */}
        <g opacity={tv}>
          <Create d="M 1360 360 L 1760 360 L 1760 640 L 1360 640 Z" p={tv} color={M.white} w={4} />
          <Create d="M 1520 360 L 1480 290 M 1600 360 L 1640 290" p={tv} color={M.white} w={3} />
          <Create d="M 1500 640 L 1480 690 M 1620 640 L 1640 690" p={tv} color={M.white} w={3} />
        </g>
      </svg>
      <div style={{opacity: bars}}>
        <Write p={anim(T, b(162), 0.8)} style={{left: 620, top: yb - 54 * sc - 80, width: 180, textAlign: 'center'}}>
          <TeX tex="54\%" size={60} color={M.blue} />
        </Write>
        <Write p={anim(T, b(162.5), 0.8)} style={{left: 960, top: yb - 17 * sc - 80, width: 180, textAlign: 'center'}}>
          <TeX tex="17\%" size={60} color={M.greyB} />
        </Write>
        <Write p={anim(T, b(161.2), 0.8)} style={{left: 620, top: yb + 20, width: 180, textAlign: 'center'}}>
          <span style={{fontFamily: SANS, fontSize: 32}}>上班时</span>
        </Write>
        <Write p={anim(T, b(161.4), 0.8)} style={{left: 960, top: yb + 20, width: 180, textAlign: 'center'}}>
          <span style={{fontFamily: SANS, fontSize: 32}}>下班后</span>
        </Write>
        <Write p={anim(T, b(164), 1)} style={{left: 1300, top: 200}}>
          <TeX tex="\frac{54}{17} \approx 3.2" size={56} color={M.yellow} />
        </Write>
        <Write p={anim(T, b(170), 1)} color={M.red} style={{left: 180, top: 520, width: 300}}>
          <span style={{fontFamily: SANS, fontSize: 30}}>更常回答：“想做点别的”</span>
        </Write>
      </div>
      <Write p={anim(T, b(178), 1)} style={{left: 1360, top: 720, width: 400, textAlign: 'center'}}>
        <span style={{fontFamily: SANS, fontSize: 30}}>
          放松 <span style={{color: M.yellow}}>↑</span> 　专注 <span style={{color: M.blue}}>↓</span> 　挑战 <span style={{color: M.red}}>↓</span>
        </span>
      </Write>
      <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.4)'}}>{T < b(177) ? 'Csikszentmihalyi & LeFevre, JPSP, 1989 · n = 78' : 'Kubey & Csikszentmihalyi, 1990'}</div>
    </div>
  );
};

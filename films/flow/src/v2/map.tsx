import React from 'react';
import {b, clamp, mulberry, prog} from '../lib';
import {anim, Create, M, TeX} from '../m3';
import {ClockFace} from './s23';
import {At, Credit, H, Label, pathOf, view, W, World} from './kit';

/* The challenge–skill map. One world, used three times:
   S4 (b96 → b128) it is built: axes, the red region (too hard), the blue one (too easy), the yellow
   channel, a learner climbing a staircase inside it.
   S5 (b128 → b161) the camera slides right to make room for 78 workers; their pagers beep and every
   answer flies into the map as a dot, coloured by where it lands (illustrative, not the data).
   MapEnd (b273 → b311) it returns: a game keeping its player on the line, then 躺平 / 硬撑 / the
   channel, the camera pushes into the dot in the channel and the clock from S2 comes back, slowing. */
export const AX = {x0: 560, y0: 800, x1: 1480, y1: 170};
export const P = (s: number, c: number) => [AX.x0 + s * (AX.x1 - AX.x0), AX.y0 - c * (AX.y0 - AX.y1)];
const E = 0.12;
const poly = (pts: number[][]) => pathOf(pts) + ' Z';

export const MapBase: React.FC<{T: number; axes: number; diag: number; red: number; blue: number; band: number; dim?: number}> = ({axes, diag, red, blue, band, dim = 1}) => (
  <>
    <path d={poly([P(0, E), P(0, 1), P(1 - E, 1)])} fill={M.red} fillOpacity={0.22 * red * dim} />
    <path d={poly([P(E, 0), P(1, 0), P(1, 1 - E)])} fill={M.blue} fillOpacity={0.2 * blue * dim} />
    <path d={poly([P(0, 0), P(0, E), P(1 - E, 1), P(1, 1), P(1, 1 - E), P(E, 0)])} fill={M.yellow} fillOpacity={0.24 * band * dim} />
    {band > 0 ? (
      <>
        <path d={pathOf([P(0, E), P(1 - E, 1)])} stroke={M.yellow} strokeWidth={2.5} strokeOpacity={0.7 * band} fill="none" />
        <path d={pathOf([P(E, 0), P(1, 1 - E)])} stroke={M.yellow} strokeWidth={2.5} strokeOpacity={0.7 * band} fill="none" />
      </>
    ) : null}
    {Array.from({length: 9}, (_, k) => (
      <g key={k} opacity={0.14 * axes}>
        <line x1={P((k + 1) / 10, 0)[0]} x2={P((k + 1) / 10, 1)[0]} y1={AX.y0} y2={AX.y1} stroke={M.blue} strokeWidth={1.5} />
        <line x1={AX.x0} x2={AX.x1} y1={P(0, (k + 1) / 10)[1]} y2={P(0, (k + 1) / 10)[1]} stroke={M.blue} strokeWidth={1.5} />
      </g>
    ))}
    <Create d={pathOf([P(0, 0), P(1, 1)])} p={diag} color={M.white} w={3} dash="12 12" />
    <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x1 + 50} ${AX.y0}`} p={axes} color={M.blue} w={5} />
    <Create d={`M ${AX.x0} ${AX.y0} L ${AX.x0} ${AX.y1 - 50}`} p={axes} color={M.red} w={5} />
    {axes > 0.9 ? (
      <g opacity={(axes - 0.9) * 10}>
        <polygon points={`${AX.x1 + 74},${AX.y0} ${AX.x1 + 46},${AX.y0 - 12} ${AX.x1 + 46},${AX.y0 + 12}`} fill={M.blue} />
        <polygon points={`${AX.x0},${AX.y1 - 74} ${AX.x0 - 12},${AX.y1 - 46} ${AX.x0 + 12},${AX.y1 - 46}`} fill={M.red} />
      </g>
    ) : null}
  </>
);
const AxisLabels: React.FC<{o: number}> = ({o}) => (
  <>
    <At x={AX.x1 + 92} y={AX.y0} o={o} anchor="l">
      <Label c={M.blue} size={40} w={600}>技能 </Label>
      <TeX tex="s" size={44} color={M.blue} />
    </At>
    <At x={AX.x0 - 30} y={AX.y1 - 70} o={o} anchor="r">
      <Label c={M.red} size={40} w={600}>挑战 </Label>
      <TeX tex="c" size={44} color={M.red} />
    </At>
  </>
);

// the staircase of a learner who keeps the challenge rising with their skill
const STEPS: number[][] = (() => {
  const st: number[][] = [[0.06, 0.06]];
  for (let k = 0; k < 6; k++) {
    const [s, c] = st[st.length - 1];
    st.push([s + 0.13, c]);
    st.push([s + 0.13, c + 0.13]);
  }
  return st;
})();
const walkerAt = (w: number) => {
  const f = w * (STEPS.length - 1);
  const i = Math.min(STEPS.length - 2, Math.floor(f));
  const u = f - i;
  return [STEPS[i][0] + (STEPS[i + 1][0] - STEPS[i][0]) * u, STEPS[i][1] + (STEPS[i + 1][1] - STEPS[i][1]) * u];
};

// S5: 78 workers and their beeps
const PEOPLE = Array.from({length: 78}, (_, i) => [-560 + (i % 13) * 58, 250 + Math.floor(i / 13) * 70]);
export const BEEPS = (() => {
  const r = mulberry(31);
  const n = 320;
  const t0 = b(140);
  const t1 = b(159);
  return Array.from({length: n}, (_, k) => {
    const t = t0 + ((k + r() * 0.8) / n) * (t1 - t0);
    const who = Math.floor(r() * 78);
    const s = Math.min(0.97, Math.max(0.03, 0.5 + (r() - 0.5) * 0.9));
    const c = Math.min(0.97, Math.max(0.03, s + (r() - 0.5) * 0.75));
    return {t, who, s, c};
  });
})();
const colourOf = (s: number, c: number) => (Math.abs(c - s) <= E ? M.yellow : c > s ? M.red : M.blue);

export const MapScene: React.FC<{T: number}> = ({T}) => {
  if (T < b(95.8) || T > b(161.3)) return null;
  const o = clamp(prog(T, b(95.8), b(96.6))) * (1 - prog(T, b(160.4), b(161.2)));
  const v = view(T, [
    [b(96), {x: 1020, y: 500, z: 1.1}],
    [b(103), {x: 1020, y: 490, z: 1}],
    [b(121), {x: 1020, y: 490, z: 1}],
    [b(127.5), {x: 1080, y: 470, z: 1.06}],
    [b(129), {x: 1080, y: 470, z: 1.06}],
    [b(133), {x: 520, y: 500, z: 0.8}],
  ]);
  const axes = anim(T, b(96.3), 1.2);
  const diag = anim(T, b(100), 1);
  const red = anim(T, b(103.3), 1);
  const blue = anim(T, b(109.3), 1);
  const band = anim(T, b(115.3), 1);
  const walk = anim(T, b(121.5), b(127.5) - b(121.5));
  const walkO = 1 - prog(T, b(129), b(130.5));
  const shown = STEPS.slice(0, Math.max(2, Math.ceil(walk * (STEPS.length - 1)) + 1));
  const [ws, wc] = walkerAt(walk);
  const shownPts = [...shown.slice(0, -1), [ws, wc]].map(([s, c]) => P(s, c));
  const regionWords = 1 - 0.65 * prog(T, b(129), b(131));
  const people = anim(T, b(131), 1.6);
  const day = Math.min(7, 1 + Math.floor(clamp((T - b(140)) / (b(159) - b(140))) * 7));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <MapBase T={T} axes={axes} diag={diag} red={red} blue={blue} band={band} dim={1 - 0.4 * prog(T, b(139), b(141))} />
          {walk > 0 ? (
            <g opacity={walkO}>
              <path d={pathOf(shownPts)} fill="none" stroke={M.yellow} strokeWidth={6} strokeLinejoin="round" />
              <circle cx={P(ws, wc)[0]} cy={P(ws, wc)[1]} r={14} fill={M.yellow} />
            </g>
          ) : null}
          {PEOPLE.map(([x, y], i) => {
            const ring = BEEPS.filter((e) => e.who === i && T >= e.t - 0.0001 && T < e.t + 0.6).length > 0;
            return (
              <g key={i} opacity={clamp(people * 1.6 - i / 78)}>
                <circle cx={x} cy={y} r={13} fill="none" stroke={ring ? M.yellow : M.white} strokeWidth={3} />
                <circle cx={x} cy={y - 26} r={7} fill="none" stroke={ring ? M.yellow : M.white} strokeWidth={2.5} />
              </g>
            );
          })}
          {/* the first beeps are shown one by one (rings), then the stream */}
          {BEEPS.map((e, k) => {
            const u = (T - e.t) / 0.8;
            if (u < 0) return null;
            const [x0, y0] = PEOPLE[e.who];
            const [x1, y1] = P(e.s, e.c);
            const f = clamp(u);
            const ee = 1 - Math.pow(1 - f, 3);
            const x = x0 + (x1 - x0) * ee;
            const y = y0 + (y1 - y0) * ee - Math.sin(f * Math.PI) * 120;
            return (
              <g key={k}>
                {u < 1 ? <circle cx={x0} cy={y0} r={13 + u * 30} fill="none" stroke={M.yellow} strokeWidth={2.5} opacity={1 - u} /> : null}
                <circle cx={x} cy={y} r={u < 1 ? 7 : 6} fill={colourOf(e.s, e.c)} opacity={0.92} />
              </g>
            );
          })}
        </svg>
        <AxisLabels o={axes} />
        <At x={P(0.22, 0.8)[0]} y={P(0.22, 0.8)[1]} o={red * regionWords}>
          <Label c={M.red} size={60} w={700}>焦虑 </Label>
          <TeX tex="c \gg s" size={50} color={M.red} />
        </At>
        <At x={P(0.8, 0.2)[0]} y={P(0.8, 0.2)[1]} o={blue * regionWords}>
          <Label c={M.blue} size={60} w={700}>无聊 </Label>
          <TeX tex="c \ll s" size={50} color={M.blue} />
        </At>
        <At x={P(0.62, 0.62)[0] - 30} y={P(0.62, 0.62)[1] - 30} o={band * regionWords}>
          <div style={{transform: 'rotate(-34deg)'}}>
            <Label c={M.yellow} size={58} w={700}>心流 </Label>
            <TeX tex="c \approx s" size={50} color={M.yellow} />
          </div>
        </At>
        <At x={-560} y={170} o={people} anchor="l">
          <Label size={44} w={700}>78 位芝加哥上班族</Label>
        </At>
        <At x={-560} y={740} o={anim(T, b(140), 0.6)} anchor="l">
          <Label size={42}>第 </Label>
          <TeX tex={`${day}`} size={56} color={M.yellow} />
          <Label size={42}> 天 · 每天约 8 次随机“哔”</Label>
        </At>
      </World>
      <Credit o={anim(T, b(140), 0.8)}>Csikszentmihalyi & LeFevre, JPSP, 1989 · 经验取样法 · 点为示意</Credit>
    </div>
  );
};

/* MapEnd (b273 → b311): the map comes back. A game adjusts its difficulty (red steps) to a player whose
   skill keeps growing, so the dot stays on the line; then the regions are renamed 躺平 / 硬撑, the dot
   settles in the channel, the camera pushes into it and the S2 clock appears around it, slowing to a
   stop while the hands fade. */
const GAME = (() => {
  // player skill rises smoothly; the game re-tunes the challenge every so often to sit just above it
  const pts: number[][] = [];
  let c = 0.1;
  for (let k = 0; k <= 160; k++) {
    const s = 0.08 + (k / 160) * 0.8;
    if (k % 20 === 0) c = s + 0.04;
    pts.push([s, c]);
  }
  return pts;
})();
export const MapEnd: React.FC<{T: number}> = ({T}) => {
  if (T < b(272.8) || T > b(311.3)) return null;
  const o = clamp(prog(T, b(272.8), b(273.6))) * (1 - prog(T, b(309.6), b(311)));
  const dot = [0.66, 0.68];
  const v = view(T, [
    [b(273), {x: 1020, y: 490, z: 0.98}],
    [b(281), {x: 1020, y: 490, z: 1}],
    [b(284), {x: P(0.7, 0.72)[0], y: P(0.7, 0.72)[1], z: 1.9}],
    [b(288.5), {x: P(0.7, 0.72)[0], y: P(0.7, 0.72)[1], z: 1.9}],
    [b(291), {x: 1020, y: 490, z: 1}],
    [b(300.5), {x: 1020, y: 490, z: 1}],
    [b(303.5), {x: P(dot[0], dot[1])[0], y: P(dot[0], dot[1])[1] + 40, z: 1.25}],
  ]);
  const game = anim(T, b(274.5), b(281) - b(274.5));
  const gameO = 1 - prog(T, b(288.5), b(290));
  const gn = Math.max(2, Math.floor(game * GAME.length));
  const head = GAME[gn - 1];
  const wobble = T > b(281) ? 0.012 * Math.sin((T - b(281)) * 5) : 0;
  const rename = anim(T, b(289.2), 1);
  const settle = anim(T, b(295.2), 1.4);
  const fromP = [0.86, 0.5];
  const ds = fromP[0] + (dot[0] - fromP[0]) * settle;
  const dc = fromP[1] + (dot[1] - fromP[1]) * settle;
  const clockP = anim(T, b(301.5), 1.6);
  const minute = 6 + 10 * (1 - Math.exp(-Math.max(0, T - b(301.5)) / 1.4));
  const handsO = 1 - prog(T, b(305.5), b(308));
  const mapDim = 1 - 0.75 * prog(T, b(301), b(303));
  const [cx, cy] = P(dot[0], dot[1]);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g opacity={mapDim}>
            <MapBase T={T} axes={1} diag={1} red={1} blue={1} band={1 + 0.6 * settle} />
            <g opacity={gameO}>
              <path d={pathOf(GAME.slice(0, gn).map(([s, c]) => P(s, c)))} fill="none" stroke={M.red} strokeWidth={5} strokeLinejoin="round" />
              <path d={pathOf(GAME.slice(0, gn).map(([s]) => P(s, s)))} fill="none" stroke={M.blue} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
              <circle cx={P(head[0], head[1] + wobble)[0]} cy={P(head[0], head[1] + wobble)[1]} r={13} fill={M.yellow} />
            </g>
            {T > b(289) ? <circle cx={P(ds, dc)[0]} cy={P(ds, dc)[1]} r={14} fill={M.yellow} opacity={anim(T, b(289), 0.6)} /> : null}
          </g>
          {clockP > 0 ? <ClockFace p={clockP} m={minute} cx={cx} cy={cy} r={330} handsO={handsO} /> : null}
          {T > b(301) ? <circle cx={cx} cy={cy} r={14} fill={M.yellow} /> : null}
        </svg>
        <div style={{opacity: mapDim}}>
          <AxisLabels o={1} />
          <At x={P(0.22, 0.8)[0]} y={P(0.22, 0.8)[1]} o={1 - rename}>
            <Label c={M.red} size={60} w={700}>焦虑</Label>
          </At>
          <At x={P(0.8, 0.2)[0]} y={P(0.8, 0.2)[1]} o={1 - rename}>
            <Label c={M.blue} size={60} w={700}>无聊</Label>
          </At>
          <At x={P(0.22, 0.8)[0]} y={P(0.22, 0.8)[1]} o={rename}>
            <Label c={M.red} size={64} w={700}>硬撑</Label>
          </At>
          <At x={P(0.8, 0.2)[0]} y={P(0.8, 0.2)[1]} o={rename}>
            <Label c={M.blue} size={64} w={700}>躺平</Label>
          </At>
          <At x={P(head[0], head[1])[0] - 40} y={P(head[0], head[1])[1] - 70} o={anim(T, b(282), 0.6) * gameO} anchor="r">
            <Label c={M.yellow} size={34} w={600}>差一点点</Label>
          </At>
          <At x={P(0.9, 0.62)[0] + 10} y={P(0.9, 0.62)[1]} o={anim(T, b(275), 0.6) * (1 - prog(T, b(281), b(282)))} anchor="l">
            <Label c={M.red} size={30}>游戏难度</Label>
          </At>
          <At x={P(0.9, 0.9)[0] + 20} y={P(0.9, 0.9)[1] + 50} o={anim(T, b(275), 0.6) * (1 - prog(T, b(281), b(282)))} anchor="l">
            <Label c={M.blue} size={30}>你的水平</Label>
          </At>
        </div>
      </World>
      <Credit o={anim(T, b(275), 0.8) * gameO}>Keller & Bless, 2008：自适应难度让人更常进入心流 · 示意</Credit>
    </div>
  );
};

import React from 'react';
import {b, clamp, inOut, lerp, prog} from '../lib';
import {SANS} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';

/* S8 (b209–b241): just hard enough. (1) The normal curve and its 1σ tail, Φ(−1) ≈ 0.1587: the model's
   optimal error rate. (2) It becomes learning speed against accuracy: low at chance, low at 100%,
   peaking at about 85% (schematic). (3) An adaptive game: skill (blue) rises; a fixed slow speed bores,
   a fast ramp overwhelms, the adaptive difficulty (yellow) steps to match every 30 pieces. */
const W = 1920;
const H = 1080;
const X0 = 360;
const X1 = 1560;
const YB = 700;
const gauss = (z: number) => Math.exp(-z * z / 2);
const toD = (p: number[][]) => p.map(([x, y], k) => `${k ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
const gaussPts = Array.from({length: 161}, (_, k) => {
  const z = -4 + k * 0.05;
  return [(X0 + X1) / 2 + z * ((X1 - X0) / 8), YB - 520 * gauss(z)];
});
// learning speed against accuracy (50% → 100%), peak at 85% (schematic)
const speedPts = Array.from({length: 161}, (_, k) => {
  const u = k / 160;
  const f = Math.pow(u, 2.1) * Math.pow(1 - u, 0.9);
  const fmax = Math.pow(0.7, 2.1) * Math.pow(0.3, 0.9);
  return [X0 + u * (X1 - X0), YB - 520 * (f / fmax)];
});

export const S8: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(209), b(241), 0.45, 0.45);
  const ax = anim(T, b(209.5), 1);
  const cv = anim(T, b(210.5), 1.8);
  const sh = anim(T, b(216.5), 1);
  const morph = anim(T, b(225), 1.6);
  const part3 = prog(T, b(232.5), b(233.5));
  const curve = gaussPts.map((p, k) => [lerp(p[0], speedPts[k][0], morph), lerp(p[1], speedPts[k][1], morph)]);
  const tail = `M ${gaussPts[0][0]} ${YB} ` + toD(gaussPts.slice(0, 61)).replace(/^M/, 'L') + ` L ${gaussPts[60][0]} ${YB} Z`;
  const peakX = X0 + 0.7 * (X1 - X0);
  // part 3: adaptive difficulty over 300 pieces
  const g = {x0: 360, x1: 1560, y0: 760, y1: 200};
  const piece = clamp((T - b(234)) / (b(240) - b(234))) * 300;
  const skill = (n: number) => 0.15 + 0.6 * (1 - Math.exp(-n / 140)) + 0.03 * Math.sin(n / 9);
  const GX = (n: number) => g.x0 + (n / 300) * (g.x1 - g.x0);
  const GY = (v: number) => g.y0 - v * (g.y0 - g.y1);
  const line = (fn: (n: number) => number, upto: number) => toD(Array.from({length: Math.max(2, Math.floor(upto / 2))}, (_, k) => [GX(k * 2), GY(fn(k * 2))]));
  const adaptive = (n: number) => skill(Math.floor(n / 30) * 30);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={1 - part3}>
          <path d={tail} fill={M.yellow} fillOpacity={0.45 * sh * (1 - morph)} />
          <Create d={`M ${X0 - 40} ${YB} L ${X1 + 40} ${YB}`} p={ax} color={M.white} w={3} />
          {cv > 0 ? <path d={toD(curve.slice(0, Math.max(2, Math.floor(cv * 161))))} fill="none" stroke={morph > 0.5 ? M.yellow : M.blue} strokeWidth={5} /> : null}
          {morph > 0.95 ? <Create d={`M ${peakX} ${YB} L ${peakX} ${YB - 540}`} p={anim(T, b(226.5), 0.8)} color={M.yellow} w={3} dash="8 8" /> : null}
        </g>
        <g opacity={part3}>
          <Create d={`M ${g.x0} ${g.y0} L ${g.x1 + 30} ${g.y0}`} p={part3} color={M.white} w={3} />
          <Create d={`M ${g.x0} ${g.y0} L ${g.x0} ${g.y1 - 30}`} p={part3} color={M.white} w={3} />
          {piece > 2 ? (
            <>
              <path d={line(() => 0.15, piece)} fill="none" stroke={M.grey} strokeWidth={4} strokeDasharray="10 8" />
              <path d={line((n) => 0.1 + n / 260, piece)} fill="none" stroke={M.red} strokeWidth={4} />
              <path d={line(skill, piece)} fill="none" stroke={M.blue} strokeWidth={4} />
              <path d={line(adaptive, piece)} fill="none" stroke={M.yellow} strokeWidth={5} />
            </>
          ) : null}
        </g>
      </svg>
      <div style={{opacity: 1 - part3}}>
        <div style={{opacity: 1 - morph}}>
          <Write p={anim(T, b(217.2), 1.2)} style={{left: 1230, top: 300}}>
            <TeX tex="\Phi(-1) \approx 0.1587" size={64} color={M.yellow} />
          </Write>
          <Write p={anim(T, b(218.2), 1)} style={{left: 1234, top: 390}}>
            <span style={{fontFamily: SANS, fontSize: 28, color: M.greyB}}>最优错误率 ≈ 15.87%</span>
          </Write>
        </div>
        <div style={{opacity: morph}}>
          <Write p={anim(T, b(226), 0.8)} color={M.yellow} style={{left: peakX - 70, top: YB - 610}}>
            <TeX tex="\approx 85\%" size={50} color={M.yellow} />
          </Write>
          <Write p={anim(T, b(226.5), 0.8)} color={M.red} style={{left: X0 - 60, top: YB + 20}}>
            <span style={{fontFamily: SANS, fontSize: 28}}>太难：等于瞎猜</span>
          </Write>
          <Write p={anim(T, b(226.8), 0.8)} color={M.blue} style={{left: X1 - 120, top: YB + 20}}>
            <span style={{fontFamily: SANS, fontSize: 28}}>全对：学不到</span>
          </Write>
          <Write p={anim(T, b(226), 0.8)} style={{left: X0 - 40, top: 120}}>
            <span style={{fontFamily: SANS, fontSize: 28}}>学得多快（示意）</span>
          </Write>
          <Write p={anim(T, b(226), 0.8)} style={{left: X1 + 50, top: YB - 20}}>
            <span style={{fontFamily: SANS, fontSize: 28}}>答对率</span>
          </Write>
        </div>
      </div>
      <div style={{opacity: part3}}>
        <Write p={anim(T, b(234), 0.8)} color={M.yellow} style={{left: 1580, top: 330}}>
          <span style={{fontFamily: SANS, fontSize: 28}}>自适应：每 30 块调一次</span>
        </Write>
        <Write p={anim(T, b(234.3), 0.8)} color={M.blue} style={{left: 1580, top: 390}}>
          <span style={{fontFamily: SANS, fontSize: 28}}>你的水平</span>
        </Write>
        <Write p={anim(T, b(234.6), 0.8)} color={M.red} style={{left: 1580, top: 230}}>
          <span style={{fontFamily: SANS, fontSize: 28}}>越来越快</span>
        </Write>
        <Write p={anim(T, b(234.9), 0.8)} color={M.grey} style={{left: 1580, top: 640}}>
          <span style={{fontFamily: SANS, fontSize: 28}}>一直很慢</span>
        </Write>
        <Write p={anim(T, b(234), 0.8)} style={{left: 360, top: 790}}>
          <span style={{fontFamily: SANS, fontSize: 24, color: M.greyB}}>俄罗斯方块式游戏 · 速度</span>
        </Write>
      </div>
      <div style={{position: 'absolute', right: 52, bottom: 30, fontFamily: SANS, fontSize: 18, color: 'rgba(255,255,255,0.4)'}}>{T < b(233) ? 'Wilson et al., Nature Communications, 2019 · 模型推导' : 'Keller & Bless, PSPB, 2008'}</div>
    </div>
  );
};

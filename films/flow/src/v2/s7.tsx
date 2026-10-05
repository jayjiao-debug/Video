import React from 'react';
import {b, clamp, keys, lerp, prog} from '../lib';
import {anim, Create, M, TeX} from '../m3';
import {At, Credit, H, Label, learn, pathOf, phi, Phi, view, W, World} from './kit';

/* S7 (b185 → b221): why 85%. A two-answer question: each answer is a fuzzy impression in your head, a
   bell curve (A teal, B purple) at ±m with width σ. Where they overlap you answer wrong: Φ(−m/σ), half the overlap area.
   Practice sharpens them (σ → 0.85σ): the overlap that disappears is the improvement, in yellow.
   Far apart, almost nothing to gain; on top of each other, almost nothing either; in between, the most.
   Then the camera pulls back to the cold open's plot, and sweeping m traces the same curve, peaking at
   about 85% correct (exactly Φ(1) ≈ 84.1% in the limit of a small step; this is the Wilson et al. model). */
const BX0 = 100;
const BW = 820;
const BY = 640;
const HS = 800; // px per unit of density
const ux = (u: number) => BX0 + ((u + 4) / 8) * BW;
const pdf = (u: number, mu: number, s: number) => phi((u - mu) / s) / s;
const NU = 220;
const bell = (mu: number, s: number) => pathOf(Array.from({length: NU + 1}, (_, k) => {
  const u = -4 + (8 * k) / NU;
  return [ux(u), BY - pdf(u, mu, s) * HS];
}));
const overlap = (m: number, s: number) => pathOf([[ux(-4), BY], ...Array.from({length: NU + 1}, (_, k) => {
  const u = -4 + (8 * k) / NU;
  return [ux(u), BY - Math.min(pdf(u, -m, s), pdf(u, m, s)) * HS];
}), [ux(4), BY]]) + ' Z';
const SH = 0.85;
// chance of answering wrong = half the overlap area (each answer equally likely) = Φ(−m/σ)
const err = (m: number, s: number) => Phi(-m / s);

// the right-hand plot (accuracy 50% → 100%, learning speed), the cold open's axes again
const PX0 = 1060;
const PX1 = 1780;
const PY = 640;
const PH = 380;
const px = (a: number) => PX0 + ((a - 0.5) / 0.5) * (PX1 - PX0);
const py = (v: number) => PY - v * PH;
const CURVE = Array.from({length: 161}, (_, k) => {
  const d = (k / 160) * 3.2;
  return [px(Phi(d)), py(learn(d))];
});

export const S7: React.FC<{T: number}> = ({T}) => {
  if (T < b(184.8) || T > b(221.4)) return null;
  const o = clamp(prog(T, b(184.8), b(185.4))) * (1 - prog(T, b(220.6), b(221.3)));
  const v = view(T, [
    [b(185), {x: 510, y: 470, z: 1.5}],
    [b(207.4), {x: 510, y: 470, z: 1.5}],
    [b(209.4), {x: 960, y: 480, z: 1}],
  ]);
  const sm = (x: number) => x * x * (3 - 2 * x);
  // separation and width over time
  const m = keys(T, [[b(185), 0.5], [b(208.6), 0.5], [b(209.6), 2.6], [b(212.8), 2.6], [b(213.8), 0.12], [b(217.2), 0.12], [b(219.6), 2.6], [b(220.6), 1]], sm);
  const sharpen = (a: number) => anim(T, b(a), 1.4) * (1 - prog(T, b(a) + 1.9, b(a) + 2.3));
  const sh = T < b(217.2) ? Math.max(sharpen(203.3), sharpen(209.9), sharpen(214.2)) : 1;
  const s = lerp(1, SH, sh);
  const ghost = sh > 0.02;
  const axis = anim(T, b(185.3), 1);
  const bells = anim(T, b(186.5), 1.4);
  const ov = anim(T, b(197.3), 1);
  const plot = anim(T, b(209), 1.2);
  const ends = (a: number) => anim(T, b(a), 0.5);
  const sweep = T >= b(217.2);
  const d = m; // with σ = 1 the curve's parameter is m
  const gain = err(m, 1) - err(m, SH);
  const errNow = err(m, sweep ? 1 : s);
  const peak = anim(T, b(220.2), 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <Create d={`M ${ux(-4) - 20} ${BY} L ${ux(4) + 20} ${BY}`} p={axis} color={M.white} w={4} />
          {/* the improvement: what the overlap loses when the bells sharpen */}
          {(ghost || sweep) && ov > 0 ? <path d={overlap(m, 1)} fill={M.yellow} fillOpacity={0.85} /> : null}
          {ov > 0 ? <path d={overlap(m, ghost || sweep ? (sweep ? SH : s) : 1)} fill="#8f2f29" fillOpacity={ov} /> : null}
          {ghost || sweep ? (
            <g opacity={0.5}>
              <path d={bell(-m, 1)} fill="none" stroke={M.teal} strokeWidth={2.5} strokeDasharray="8 8" />
              <path d={bell(m, 1)} fill="none" stroke={M.purple} strokeWidth={2.5} strokeDasharray="8 8" />
            </g>
          ) : null}
          <Create d={bell(-m, sweep ? SH : s)} p={bells} color={M.teal} w={6} />
          <Create d={bell(m, sweep ? SH : s)} p={anim(T, b(187.3), 1.4)} color={M.purple} w={6} />
          {/* plot */}
          <g opacity={plot}>
            <Create d={`M ${PX0} ${PY} L ${PX1 + 40} ${PY}`} p={plot} color={M.white} w={4} />
            <Create d={`M ${PX0} ${PY} L ${PX0} ${PY - PH - 50}`} p={plot} color={M.white} w={4} />
            {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((a) => (
              <line key={a} x1={px(a)} x2={px(a)} y1={PY - 10} y2={PY + 10} stroke={M.white} strokeWidth={3} />
            ))}
          </g>
          {ends(210.6) > 0 ? <circle cx={px(Phi(2.6))} cy={py(learn(2.6))} r={12 * ends(210.6)} fill={M.blue} /> : null}
          {ends(214.8) > 0 ? <circle cx={px(Phi(0.12))} cy={py(learn(0.12))} r={12 * ends(214.8)} fill={M.red} /> : null}
          {sweep ? <path d={pathOf(CURVE.filter(([x]) => x <= px(Phi(T < b(219.6) ? d : 3.2)) + 0.0001))} fill="none" stroke={M.yellow} strokeWidth={6} /> : null}
          {sweep ? <circle cx={px(Phi(d))} cy={py(learn(d))} r={14} fill={M.yellow} /> : null}
          {peak > 0 ? <line x1={px(Phi(1))} x2={px(Phi(1))} y1={py(1) + 14} y2={PY} stroke={M.yellow} strokeWidth={3} strokeDasharray="10 9" opacity={peak} /> : null}
        </svg>
        <At x={ux(-m) - 10} y={BY - pdf(0, 0, sweep ? SH : s) * HS - 40} o={anim(T, b(188), 0.6)}>
          <Label c={M.teal} size={44} w={700}>A</Label>
        </At>
        <At x={ux(m) + 10} y={BY - pdf(0, 0, sweep ? SH : s) * HS - 40} o={anim(T, b(188.6), 0.6)}>
          <Label c={M.purple} size={44} w={700}>B</Label>
        </At>
        <At x={ux(-4) + 10} y={170} o={ov} anchor="l">
          <Label c={M.red} size={38} w={700}>答错 </Label>
          <TeX tex={`${(errNow * 100).toFixed(errNow < 0.05 ? 1 : 0)}\\%`} size={42} color={M.red} />
        </At>
        <At x={ux(-4) + 10} y={232} o={(ghost || sweep ? 1 : 0) * anim(T, b(204), 0.6)} anchor="l">
          <Label c={M.yellow} size={38} w={700}>改进 </Label>
          <TeX tex={`${(gain * 100).toFixed(1)}\\%`} size={42} color={M.yellow} />
        </At>
        <At x={(PX0 + PX1) / 2} y={PY + 50} o={plot}>
          <Label c={M.greyB} size={34}>答对 </Label>
          <TeX tex="50\% \quad\longrightarrow\quad 100\%" size={34} color={M.greyB} />
        </At>
        <At x={PX0 + 20} y={PY - PH - 60} o={plot} anchor="l">
          <Label size={36}>学得多快</Label>
        </At>
        <At x={px(Phi(1))} y={py(1) - 80} o={peak} s={0.7 + 0.3 * peak}>
          <div style={{border: `3px solid ${M.yellow}`, padding: '6px 22px 12px'}}>
            <TeX tex="\approx 85\%" size={78} color={M.yellow} />
          </div>
        </At>
      </World>
      <Credit o={anim(T, b(186), 0.8)}>Wilson, Shenhav, Straccia & Cohen, Nature Communications, 2019 · 精确值 Φ(1) ≈ 84.1%</Credit>
    </div>
  );
};

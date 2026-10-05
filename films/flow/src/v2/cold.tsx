import React from 'react';
import {b, clamp, keys, prog} from '../lib';
import {LATIN, SANS, SERIF} from '../look';
import {anim, Create, M, TeX, Write} from '../m3';
import {wave} from '../scenes/clock';
import {At, Credit, H, Label, learn, pathOf, Phi, view, W, World} from './kit';

/* Cold open (0 → b31): the 85% hook, built as one piece of maths the viewer watches being found.
   A number line (how many you get right) → the marker tries 100% (too easy: nothing to learn) and
   50% (guessing: nothing to learn) → the number line becomes the x-axis of a plot, both ends sit at
   zero, so the best point must be in between → the curve draws itself with a tracker riding its tip
   → the peak lands on ≈85% on a beat → the camera pushes into the peak and the title opens from it. */
const X0 = 260;
const X1 = 1660;
const Y = 640;
const HP = 400;
export const ax = (a: number) => X0 + a * (X1 - X0);
export const ay = (v: number) => Y - v * HP;
const AP = Phi(1); // 0.8413: the peak's accuracy
// the curve from 50% to 100%, parametrised by the difficulty Δ (accuracy Φ(Δ), speed Δ·φ(Δ))
const CURVE = Array.from({length: 161}, (_, k) => {
  const d = (k / 160) * 4.2;
  return [ax(Phi(d)), ay(learn(d))];
});

export const ColdOpen: React.FC<{T: number}> = ({T}) => {
  if (T > b(31.6)) return null;
  const v = view(T, [
    [0, {x: 960, y: 640, z: 1.1}],
    [b(10), {x: 960, y: 640, z: 1.1}],
    [b(12), {x: 960, y: 470, z: 1}],
    [b(27.6), {x: 960, y: 470, z: 1}],
    [b(31), {x: ax(AP), y: ay(1), z: 6}],
  ]);
  // the marker's accuracy: '?' wanders, then tries 100%, then 50%, then rides the curve, then settles on the peak
  const draw = anim(T, b(17.6), b(21.4) - b(17.6));
  const tipA = Phi(draw * 4.2);
  const a = T < b(17.6)
    ? keys(T, [[b(5.3), 0.7], [b(6.6), 0.32], [b(8), 0.9], [b(9.3), 0.62], [b(10.2), 0.62], [b(11.2), 1], [b(14.2), 1], [b(15.2), 0.5]], (x) => x * x * (3 - 2 * x))
    : T < b(21.4) ? tipA : keys(T, [[b(21.4), tipA], [b(22.8), AP]], (x) => x * x * (3 - 2 * x));
  const mx = ax(a);
  const axisP = anim(T, b(0.4), 1.1);
  const yAxis = anim(T, b(10.6), 1.1);
  const fadeAll = 1 - prog(T, b(29), b(30.6));
  const dotE = anim(T, b(11.3), 0.5);
  const dotG = anim(T, b(15.3), 0.5);
  const onCurve = T >= b(17.6) && T < b(23.2);
  const tipY = T < b(21.4) ? ay(learn(draw * 4.2)) : ay(learnAt(a));
  const peak = anim(T, b(23), 0.6);
  const markerO = clamp(prog(T, b(2.2), b(2.9))) * (1 - prog(T, b(23), b(23.6)));
  const pct = Math.round(a * 100);
  return (
    <>
      <World v={v}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <g opacity={fadeAll}>
            {/* faint grid, appears with the y-axis */}
            {Array.from({length: 11}, (_, k) => (
              <line key={k} x1={ax(k / 10)} x2={ax(k / 10)} y1={Y} y2={Y - HP - 40} stroke={M.blue} strokeOpacity={0.16 * yAxis} strokeWidth={1.5} />
            ))}
            {[0.25, 0.5, 0.75, 1].map((q) => (
              <line key={q} x1={X0} x2={X1} y1={ay(q)} y2={ay(q)} stroke={M.blue} strokeOpacity={0.16 * yAxis} strokeWidth={1.5} />
            ))}
            <Create d={`M ${X0 - 30} ${Y} L ${X1 + 40} ${Y}`} p={axisP} color={M.white} w={4} />
            {Array.from({length: 11}, (_, k) => {
              const o = anim(T, b(0.9) + k * 0.05, 0.4);
              return <line key={k} x1={ax(k / 10)} x2={ax(k / 10)} y1={Y - 12 * o} y2={Y + 12 * o} stroke={M.white} strokeWidth={3} />;
            })}
            <Create d={`M ${X0} ${Y} L ${X0} ${Y - HP - 70}`} p={yAxis} color={M.white} w={4} />
            {yAxis > 0.9 ? <polygon points={`${X0},${Y - HP - 92} ${X0 - 11},${Y - HP - 66} ${X0 + 11},${Y - HP - 66}`} fill={M.white} opacity={(yAxis - 0.9) * 10} /> : null}
            {/* the curve, drawn by the tracker */}
            <Create d={pathOf(CURVE)} p={draw} color={M.yellow} w={6} />
            {/* the drop line from the peak */}
            <Create d={`M ${ax(AP)} ${ay(1) + 14} L ${ax(AP)} ${Y}`} p={peak} color={M.yellow} w={3} dash="10 9" />
          </g>
          {/* the two zero ends */}
          <g opacity={fadeAll}>
            {dotE > 0 ? <circle cx={ax(1)} cy={Y} r={13 * dotE} fill={M.blue} /> : null}
            {dotG > 0 ? <circle cx={ax(0.5)} cy={Y} r={13 * dotG} fill={M.red} /> : null}
          </g>
          {/* tracker dot on the curve / the peak */}
          {onCurve || T >= b(23.2) ? <circle cx={onCurve ? mx : ax(AP)} cy={onCurve ? tipY : ay(1)} r={(14 + 6 * peak) / Math.pow(v.z, 0.75)} fill={M.yellow} /> : null}
          {T >= b(23.2) ? <circle cx={ax(AP)} cy={ay(1)} r={14 + 6 * peak} fill="none" stroke={M.yellow} strokeWidth={2} opacity={0.6 * (1 - prog(T, b(23), b(25)))} transform={`translate(${ax(AP)} ${ay(1)}) scale(${1 + 3 * prog(T, b(23), b(25))}) translate(${-ax(AP)} ${-ay(1)})`} /> : null}
          {/* marker under the axis */}
          <g opacity={markerO * fadeAll}>
            <line x1={mx} x2={mx} y1={Y - 16} y2={Y + 16} stroke={M.yellow} strokeWidth={4} />
            <polygon points={`${mx},${Y + 62} ${mx - 15},${Y + 88} ${mx + 15},${Y + 88}`} fill={M.yellow} />
          </g>
        </svg>
        {/* axis labels */}
        {Array.from({length: 11}, (_, k) => (
          <At key={k} x={ax(k / 10)} y={Y + 38} o={anim(T, b(1.2) + k * 0.05, 0.5) * fadeAll * (k % 5 === 0 ? 1 : 0.55)}>
            <TeX tex={`${k * 10}\\%`} size={k % 5 === 0 ? 34 : 26} color={M.greyB} />
          </At>
        ))}
        <At x={X1 + 48} y={Y - 2} o={anim(T, b(1.6), 0.6) * fadeAll} anchor="l">
          <Label size={34} c={M.greyB}>答对</Label>
        </At>
        <At x={X0 + 24} y={Y - HP - 82} o={anim(T, b(11.4), 0.6) * (1 - prog(T, b(27.6), b(28.8)))} anchor="l">
          <Label size={36}>学得多快</Label>
        </At>
        <At x={mx} y={Y + 122} o={markerO * fadeAll}>
          {T < b(5.3) ? <TeX tex="?" size={52} color={M.yellow} /> : <TeX tex={`${pct}\\%`} size={46} color={M.yellow} />}
        </At>
        <At x={ax(1)} y={Y - 58} o={dotE * fadeAll}>
          <Label size={36} c={M.blue} w={600}>太简单</Label>
        </At>
        <At x={ax(0.5)} y={Y - 58} o={dotG * fadeAll * (1 - prog(T, b(17.6), b(18.4)))}>
          <Label size={36} c={M.red} w={600}>瞎猜</Label>
        </At>
        {/* the answer */}
        <At x={ax(AP)} y={ay(1) - 110} o={peak * (1 - prog(T, b(27.6), b(28.8)))} s={0.6 + 0.4 * peak}>
          <div style={{border: `3px solid ${M.yellow}`, padding: '10px 26px 16px', borderRadius: 4}}>
            <TeX tex="\approx 85\%" size={104} color={M.yellow} />
          </div>
        </At>
      </World>
      <Credit o={anim(T, b(23.5), 0.6) * fadeAll}>Wilson, Shenhav, Straccia & Cohen · Nature Communications, 2019 · 理论推导</Credit>
    </>
  );
};
// learning speed at accuracy a (inverse of Φ by bisection; only used while settling onto the peak)
const learnAt = (a: number) => {
  let lo = 0;
  let hi = 6;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (Phi(m) < a) lo = m;
    else hi = m;
  }
  return learn((lo + hi) / 2);
};

/* The title opens out of the peak the camera pushed into: a yellow glow fills the frame for a breath,
   then 心流 writes itself exactly on the b31 hit. */
export const Title2: React.FC<{T: number}> = ({T}) => {
  if (T < b(29.5) || T > b(39.2)) return null;
  const glow = clamp(prog(T, b(29.6), b(31))) * (1 - prog(T, b(31), b(32.2)));
  const o = 1 - prog(T, b(38.2), b(39));
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,0,${0.55 * glow}) 0%, rgba(255,255,0,${0.12 * glow}) 30%, rgba(0,0,0,0) 62%)`}} />
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
          <span style={{fontFamily: SANS, fontSize: 38, fontWeight: 600}}>难度刚刚好的时候，时间会消失</span>
        </Write>
        <Write p={anim(T, b(33.5), 1)} color="rgba(255,255,255,0.5)" style={{left: 0, right: 0, top: 760, textAlign: 'center'}}>
          <span style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 28}}>When it is just hard enough, time disappears</span>
        </Write>
        <Write p={anim(T, b(34.5), 1)} color={M.gold} style={{left: 0, right: 0, top: 830, textAlign: 'center'}}>
          <span style={{fontFamily: SANS, fontSize: 18, letterSpacing: '0.3em'}}>— Juno · VIBE知识大赏 —</span>
        </Write>
      </div>
    </>
  );
};

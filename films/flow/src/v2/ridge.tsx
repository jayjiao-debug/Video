import React from 'react';
import {b, clamp, lerp, prog} from '../lib';
import {anim, Create, M, TeX} from '../m3';
import {At, Credit, H, Label, pathOf, W} from './kit';

/* The ridge (t0 → t0+40 beats): the cold open's curve gets its second dimension.
   Accuracy depends on two things, the learner's skill s and the challenge c; in the model it is
   Φ(s/c), so the learning speed is (s/c)·φ(s/c), largest wherever s/c = 1, i.e. along the diagonal.
   Camera: starts straight down on a flat s–c plane (it looks like a 2D chart) → tilts into 3D while
   the speed rises out of the plane as height → orbits the ridge → returns straight down, where the
   ridge is a yellow band between "too hard" and "too easy": Csikszentmihalyi's flow channel. */

type V3 = [number, number, number];
const N = 48;
const EPS = 0.16; // softens the corner where s and c both go to 0 (schematic; the ridge stays on s = c)
const HZ = 0.42;
const g = (r: number) => r * Math.exp(-(r * r - 1) / 2);
const height = (s: number, c: number) => g((s + EPS) / (c + EPS));
const P3 = (s: number, c: number, h: number): V3 => [s - 0.5, c - 0.5, h];

type Cam3 = {az: number; el: number; d: number; tz: number};
const camKeys = (T: number, ks: [number, Cam3][]): Cam3 => {
  if (T <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [ta, a] = ks[i];
    const [tb, bb] = ks[i + 1];
    if (T <= tb) {
      const k = anim(T, ta, tb - ta);
      return {az: lerp(a.az, bb.az, k), el: lerp(a.el, bb.el, k), d: lerp(a.d, bb.d, k), tz: lerp(a.tz, bb.tz, k)};
    }
  }
  return ks[ks.length - 1][1];
};
const projector = (c: Cam3, fov = 34) => {
  const az = (c.az * Math.PI) / 180;
  const el = (c.el * Math.PI) / 180;
  const tgt: V3 = [0, 0, c.tz];
  const pos: V3 = [tgt[0] + c.d * Math.cos(el) * Math.cos(az), tgt[1] + c.d * Math.cos(el) * Math.sin(az), tgt[2] + c.d * Math.sin(el)];
  const f: V3 = [-Math.cos(el) * Math.cos(az), -Math.cos(el) * Math.sin(az), -Math.sin(el)];
  const r: V3 = [-Math.sin(az), Math.cos(az), 0];
  const u: V3 = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const k = H / 2 / Math.tan((fov * Math.PI) / 360);
  return (p: V3) => {
    const d = [p[0] - pos[0], p[1] - pos[1], p[2] - pos[2]];
    const z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
    const s = k / Math.max(z, 0.05);
    return [W / 2 + (d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) * s, H / 2 - 60 - (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) * s, z];
  };
};
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const STOPS = [hex('#14304a'), hex('#29ABCA'), hex('#5CD0B3'), hex('#FFFF00')];
const cmap = (v: number) => {
  const x = Math.pow(clamp(v), 4) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  return STOPS[i].map((q, j) => lerp(q, STOPS[i + 1][j], f));
};

export const Ridge: React.FC<{T: number; t0: number}> = ({T, t0}) => {
  const B = (i: number) => b(t0 + i);
  if (T < B(-0.2) || T > B(40.2)) return null;
  const fin = clamp(prog(T, B(0), B(0.8))) * (1 - prog(T, B(39.3), B(40)));
  const top: Cam3 = {az: -90, el: 90, d: 2.6, tz: 0};
  const cam = camKeys(T, [
    [B(0), top],
    [B(5.5), top],
    [B(10.5), {az: -104, el: 27, d: 2.7, tz: 0.1}],
    [B(17.5), {az: -76, el: 23, d: 2.55, tz: 0.12}],
    [B(22.5), {az: -70, el: 30, d: 2.6, tz: 0.1}],
    [B(27), top],
  ]);
  const pj = projector(cam);
  // the speed rises out of the plane, then is pressed flat again as the camera returns overhead
  const grow = anim(T, B(6), B(11) - B(6)) * (1 - anim(T, B(23), B(27) - B(23)));
  const colour = anim(T, B(5.6), 1.4);
  const axes = anim(T, B(0.3), 1.2);
  const ridge = anim(T, B(12), 1.6);
  const tag = anim(T, B(17.3), 0.7) * (1 - prog(T, B(22.2), B(23)));
  const chan = anim(T, B(27.5), 1.2);
  const words = (i: number) => anim(T, B(28) + i * 0.35, 0.8);

  // quads, far to near
  const L = [-0.35, -0.6, 0.72];
  const ll = Math.hypot(...L);
  const quads: {d: string; z: number; fill: string}[] = [];
  const pts: number[][][] = [];
  const hs: number[][] = [];
  for (let i = 0; i <= N; i++) {
    pts.push([]);
    hs.push([]);
    for (let j = 0; j <= N; j++) {
      const s = i / N;
      const c = j / N;
      const h = height(s, c);
      hs[i].push(h);
      pts[i].push(pj(P3(s, c, h * HZ * grow)));
    }
  }
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const a = pts[i][j];
      const bq = pts[i + 1][j];
      const cq = pts[i + 1][j + 1];
      const dq = pts[i][j + 1];
      const h = (hs[i][j] + hs[i + 1][j] + hs[i + 1][j + 1] + hs[i][j + 1]) / 4;
      // surface normal from the height gradient (in world units)
      const dzs = ((hs[i + 1][j] + hs[i + 1][j + 1] - hs[i][j] - hs[i][j + 1]) / 2) * HZ * grow * N;
      const dzc = ((hs[i][j + 1] + hs[i + 1][j + 1] - hs[i][j] - hs[i + 1][j]) / 2) * HZ * grow * N;
      const nl = Math.hypot(dzs, dzc, 1);
      const lam = clamp((-dzs * L[0] - dzc * L[1] + L[2]) / nl / ll);
      const shade = lerp(1, 0.55 + 0.6 * lam, grow);
      const base = cmap(h).map((q, k) => lerp([22, 34, 44][k], q, colour) * shade);
      const chk = (i + j) % 2 ? 1 : 0.9; // the faint checker of a maths surface
      quads.push({
        d: `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${bq[0].toFixed(1)} ${bq[1].toFixed(1)} L ${cq[0].toFixed(1)} ${cq[1].toFixed(1)} L ${dq[0].toFixed(1)} ${dq[1].toFixed(1)} Z`,
        z: (a[2] + bq[2] + cq[2] + dq[2]) / 4,
        fill: `rgb(${base.map((q) => Math.round(clamp(q * chk, 0, 255))).join(',')})`,
      });
    }
  quads.sort((p, q) => q.z - p.z);

  const O = pj(P3(-0.05, -0.05, 0));
  const sEnd = pj(P3(1.12, -0.05, 0));
  const cEnd = pj(P3(-0.05, 1.12, 0));
  const zEnd = pj(P3(-0.05, -0.05, 0.62));
  const ridgePts = Array.from({length: 41}, (_, k) => {
    const s = k / 40;
    return pj(P3(s, s, HZ * grow + 0.004));
  });
  const tagP = pj(P3(0.62, 0.62, HZ * grow + 0.02));
  const band = (off: number) => pathOf([pj(P3(Math.max(0, -off), Math.max(0, off), 0.005)), pj(P3(Math.min(1, 1 - off), Math.min(1, 1 + off), 0.005))]);
  const at = (s: number, c: number) => pj(P3(s, c, HZ * grow * height(s, c) + 0.01));
  const anx = at(0.2, 0.78);
  const bor = at(0.8, 0.2);
  const flo = at(0.5, 0.5);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: fin}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Create d={`M ${O[0]} ${O[1]} L ${sEnd[0]} ${sEnd[1]}`} p={axes} color={M.blue} w={5} />
        <Create d={`M ${O[0]} ${O[1]} L ${cEnd[0]} ${cEnd[1]}`} p={axes} color={M.red} w={5} />
        <Create d={`M ${O[0]} ${O[1]} L ${zEnd[0]} ${zEnd[1]}`} p={grow * clamp(prog(T, B(7), B(9)))} color={M.white} w={4} />
        {quads.map((q, k) => (
          <path key={k} d={q.d} fill={q.fill} stroke="rgba(88,196,221,0.22)" strokeWidth={0.7} />
        ))}
        <Create d={pathOf(ridgePts)} p={ridge} color={M.yellow} w={7} />
        <Create d={band(0.13)} p={chan} color={M.white} w={3} dash="12 10" />
        <Create d={band(-0.13)} p={chan} color={M.white} w={3} dash="12 10" />
      </svg>
      <At x={sEnd[0] + 18} y={sEnd[1] + 4} o={axes} anchor="l">
        <Label c={M.blue} size={38} w={600}>技能 </Label>
        <TeX tex="s" size={42} color={M.blue} />
      </At>
      <At x={cEnd[0]} y={cEnd[1] - 36} o={axes}>
        <Label c={M.red} size={38} w={600}>挑战 </Label>
        <TeX tex="c" size={42} color={M.red} />
      </At>
      <At x={zEnd[0]} y={zEnd[1] - 34} o={grow * (1 - chan)}>
        <Label size={34}>学得多快</Label>
      </At>
      <At x={tagP[0]} y={tagP[1] - 70} o={tag}>
        <div style={{border: `2px solid ${M.yellow}`, padding: '6px 18px', background: 'rgba(0,0,0,0.6)'}}>
          <Label c={M.yellow} size={34} w={600}>正确率 </Label>
          <TeX tex="\approx 85\%" size={40} color={M.yellow} />
        </div>
      </At>
      <At x={anx[0]} y={anx[1]} o={words(0)}>
        <Label c={M.red} size={54} w={700}>焦虑</Label>
      </At>
      <At x={bor[0]} y={bor[1]} o={words(1)}>
        <Label c={M.blue} size={54} w={700}>无聊</Label>
      </At>
      <At x={flo[0] + 6} y={flo[1] - 6} o={words(2)}>
        <div style={{transform: 'rotate(-45deg)', background: 'rgba(0,0,0,0.78)', border: `2px solid ${M.yellow}`, padding: '2px 22px 6px'}}>
          <Label c={M.yellow} size={52} w={700}>心流</Label>
        </div>
      </At>
      <Credit o={anim(T, B(30), 0.8)}>Wilson et al., Nature Communications, 2019：85% 法则与心流 · Csikszentmihalyi, 1975：心流通道 · 曲面为示意</Credit>
    </div>
  );
};

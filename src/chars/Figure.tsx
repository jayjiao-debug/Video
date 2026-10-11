import React from 'react';
import { Pose, Fig, fit, capsule, circle, smooth, add, HANDS, handTf, P, pt } from './rig';

export type Mat = 'coat' | 'trousers' | 'boots' | 'skin' | 'hat' | 'scarf' | 'glove';
export type Part = { d: string; mat: Mat; far: boolean; k: string; tf?: string; joint?: P };
export type Style = {
  id: string; name: string; en: string;
  part: (p: Part) => React.ReactNode;
  joint?: (q: P, far: boolean, k: string) => React.ReactNode;
  face: (k: string) => React.ReactNode;          // drawn in head-local coords (centre 0,0, facing +x)
  defs?: React.ReactNode;
  filter?: string;                                 // applied to the whole figure
  over?: (f: Fig, k: string) => React.ReactNode; // e.g. puppet rods
  head?: (k: string) => React.ReactNode;          // replaces the default head + face (head-local coords)
  thick?: number;                                  // limb thickness multiplier (e.g. chunky clay)
};

/* Build the ordered list of painted parts for a pose. Styles never touch the skeleton. */
export const parts = (f: Fig, t: number, st?: Style) => {
  const L: Part[] = [], th = st?.thick ?? 1;
  const J = (q: P, far: boolean, k: string) => L.push({ d: '', mat: 'coat', far, k, joint: q });
  const arm = (far: boolean) => {
    const e = far ? f.eF : f.eN, w = far ? f.wF : f.wN, ha = far ? f.haF : f.haN, sfx = far ? 'F' : 'N';
    L.push({ d: capsule(f.S, e, 11 * th, 9.5 * th), mat: 'coat', far, k: 'ua' + sfx });
    L.push({ d: capsule(e, w, 9.5 * th, 8 * th), mat: 'coat', far, k: 'fa' + sfx });
    HANDS[(far ? f.pose.handF : f.pose.handN)].forEach((d, i) => L.push({ d, mat: 'glove', far, k: `h${sfx}${i}`, tf: handTf(w, ha) }));
    J(f.S, far, 'jS' + sfx); J(e, far, 'jE' + sfx);
  };
  const leg = (far: boolean) => {
    const k = far ? f.kF : f.kN, a = far ? f.ankF : f.ankN, toe = far ? f.toeF : f.toeN, heel = far ? f.heelF : f.heelN, sh = far ? f.shinF : f.shinN, sfx = far ? 'F' : 'N';
    const hip = add(f.H, f.n, far ? -3 : 2);
    L.push({ d: capsule(hip, k, 14 * th, 11.5 * th), mat: 'trousers', far, k: 'th' + sfx });
    L.push({ d: capsule(k, a, 11.5 * th, 9.5 * th), mat: 'trousers', far, k: 'sh' + sfx });
    L.push({ d: capsule(add(a, sh, -26), a, 11 * th, 10.5 * th), mat: 'boots', far, k: 'bs' + sfx });
    L.push({ d: capsule(heel, toe, 10 * th, 7.5 * th), mat: 'boots', far, k: 'ft' + sfx });
    J(k, far, 'jK' + sfx);
  };
  const o = (b: P, along: number, across: number): P => [b[0] + f.u[0] * along + f.n[0] * across, b[1] + f.u[1] * along + f.n[1] * across];

  arm(true); leg(true); leg(false);
  // scarf tail streams back in the wind (behind the coat)
  const base = o(f.N, -4, -12), tail: P[] = [], tail2: P[] = [];
  for (let i = 0; i <= 6; i++) {
    const c = o(base, -i * 7 + Math.sin(t * 7 - i * 0.9) * i * 1.6, -i * 13);
    const w = 8 - i * 0.6;
    tail.push(o(c, w, 0)); tail2.unshift(o(c, -w, 0));
  }
  L.push({ d: smooth([...tail, ...tail2]), mat: 'scarf', far: true, k: 'tail' });
  // coat
  L.push({
    d: smooth([o(f.N, -2, -14 * th), o(f.N, -16, -27 * th), o(f.H, 10, -29 * th), o(f.H, -52, -35 * th), o(f.H, -54, 33 * th), o(f.H, 8, 28 * th), o(f.N, -34, 25 * th), o(f.N, -4, 15 * th)]),
    mat: 'coat', far: false, k: 'coat',
  });
  L.push({ d: capsule(o(f.N, 3, -17), o(f.N, 3, 17), 11, 11), mat: 'scarf', far: false, k: 'scarf' });
  // head (local coords, rotated with the head)
  const htf = `translate(${pt(f.headC)}) rotate(${f.headA.toFixed(1)})`;
  if (st?.head) L.push({ d: '', mat: 'skin', far: false, k: 'headX' });
  else {
  L.push({ d: circle([0, 0], 31), mat: 'skin', far: false, k: 'skull', tf: htf });
  L.push({ d: circle([28, 6], 8), mat: 'skin', far: false, k: 'nose', tf: htf });
  L.push({ d: 'M -32 -10 C -34 -36 -18 -47 0 -47 C 18 -47 33 -37 31 -10 Z', mat: 'hat', far: false, k: 'cap', tf: htf });
  L.push({ d: capsule([-33, -11], [31, -11], 7.5, 7.5), mat: 'hat', far: false, k: 'brim', tf: htf });
  L.push({ d: circle([-8, -51], 8.5), mat: 'hat', far: false, k: 'pom', tf: htf });
  }
  arm(false);
  return { L, htf };
};

export const Figure: React.FC<{ pose: Pose; st: Style; t: number; x: number; y: number; s: number; flip?: boolean }> = ({ pose, st, t, x, y, s, flip }) => {
  const f = fit(pose);
  const { L, htf } = parts(f, t, st);
  const out: React.ReactNode[] = [];
  L.forEach((p) => {
    if (p.joint) { if (st.joint) out.push(st.joint(p.joint, p.far, p.k)); return; }
    if (p.k === 'headX') { out.push(<g key="head" transform={htf}>{st.head!('h')}</g>); return; }
    out.push(st.part(p));
    if (p.k === 'pom') out.push(<g key="face" transform={htf}>{st.face('face')}</g>);
  });
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})`}>
      <g filter={st.filter}>{out}</g>
      {st.over && st.over(f, 'over')}
    </g>
  );
};

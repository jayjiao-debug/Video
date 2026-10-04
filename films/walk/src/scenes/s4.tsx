import React from 'react';
import {makeCam} from '../cam';
import {b, clamp, easeOut, inOut, keys, mulberry, prog} from '../lib';
import {C, dot, glow, Light} from '../look';
import {Chapter, Credit, Tag} from '../ui';
import {at, WOODS} from '../walks';

/* S4, the quiet section (b96–b128): Pólya's walk. A wood seen from above (tree crowns of faint gold
   dots between the paths). A young couple (two warm lights side by side) and Pólya (one cool light)
   wander at random and keep running into each other: each meeting flashes and is counted. */
const P = [0, 0, 0, 0];
const A = [0, 0, 0];
const B = [0, 0, 0];

const TREES = (() => {
  const r = mulberry(31);
  const out: number[][] = [];
  for (let x = -12; x < 12; x++)
    for (let z = -12; z < 12; z++)
      for (let j = 0; j < 2; j++) {
        const tx = x + 0.2 + r() * 0.6;
        const tz = z + 0.2 + r() * 0.6;
        const n = 5 + Math.floor(r() * 5);
        for (let k = 0; k < n; k++) out.push([tx + (r() - 0.5) * 0.26, tz + (r() - 0.5) * 0.26, 0.22 + r() * 0.3]);
      }
  return out;
})();

/** step index at time T: the four meetings land on b100, b108, b116, b124 */
const stepAt = (T: number) => keys(T, [[b(96), 0], [b(100), WOODS.meet[0]], [b(108), WOODS.meet[1]], [b(116), WOODS.meet[2]], [b(124), WOODS.meet[3]], [b(128), WOODS.meet[3] + 4]]);
const pos = (s: number) => {
  at(WOODS.a, 0, s, A);
  at(WOODS.b, 0, s, B);
  return [A[0], A[1], B[0] + WOODS.off[0], B[1] + WOODS.off[1]];
};
const MID = (s: number) => {
  // a slow, smoothed centre between the walkers for the camera
  let x = 0;
  let z = 0;
  let n = 0;
  for (let k = s - 8; k <= s + 8; k += 1) {
    const p = pos(clamp(k, 0, 64));
    x += p[0] + p[2];
    z += p[1] + p[3];
    n += 2;
  }
  return [x / n, z / n];
};

const glowC = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number, rgb: string) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(0.25, `rgba(${rgb},${a * 0.45})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
  ctx.fill();
};

export const S4: React.FC<{T: number}> = ({T}) => {
  const fin = inOut(T, b(96), b(128), 0.7, 0.6);
  const s = stepAt(T);
  const m = MID(s);
  const rise = easeOut(prog(T, b(124.5), b(128)));
  const cam = makeCam([m[0] - 0.6, 8.5 + rise * 6, m[1] + 6.8 + rise * 2], [m[0], 0, m[1] + 0.3], 44, 960, 450);
  const p = pos(s);
  const draw = (ctx: CanvasRenderingContext2D) => {
    // paths
    ctx.lineWidth = 1;
    for (let a = -12; a <= 12; a++)
      for (const dir of [0, 1]) {
        ctx.strokeStyle = `rgba(241,197,109,${0.07 * fin})`;
        ctx.beginPath();
        for (let k = -12; k <= 12; k += 1) {
          cam.project(dir ? k : a, 0, dir ? a : k, P);
          if (k === -12) ctx.moveTo(P[0], P[1]);
          else ctx.lineTo(P[0], P[1]);
        }
        ctx.stroke();
      }
    // trees
    for (const [x, z, a] of TREES) {
      cam.project(x, 0, z, P);
      if (P[3] > 0 && P[0] > -20 && P[0] < 1940 && P[1] > -20 && P[1] < 1100) dot(ctx, P[0], P[1], clamp(P[3] * 0.005, 1.1, 3), a * fin);
    }
    // footprints (recent)
    for (let k = Math.max(0, s - 10); k <= s; k += 0.25) {
      const q = pos(k);
      const f = (1 - (s - k) / 10) * 0.35 * fin;
      cam.project(q[0], 0, q[1], P);
      dot(ctx, P[0], P[1], 1.4, f);
      cam.project(q[2], 0, q[3], P);
      ctx.fillStyle = `rgba(205,220,255,${f})`;
      ctx.beginPath();
      ctx.arc(P[0], P[1], 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // meetings
    WOODS.meet.forEach((mk, i) => {
      const tm = [b(100), b(108), b(116), b(124)][i];
      const u = (T - tm) / 1.2;
      if (u < 0 || u > 1) return;
      const q = pos(mk);
      cam.project(q[0], 0, q[1], P);
      ctx.strokeStyle = `rgba(255,226,160,${(1 - u) * 0.8 * fin})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(P[0], P[1], 12 + easeOut(u) * 80, 0, Math.PI * 2);
      ctx.stroke();
      glow(ctx, P[0], P[1], 18, (1 - u) * 0.6 * fin, true);
    });
    // the couple: two warm lights side by side
    cam.project(p[0] - 0.09, 0, p[1] + 0.05, P);
    glow(ctx, P[0], P[1], 7, 0.9 * fin, true);
    cam.project(p[0] + 0.09, 0, p[1] - 0.05, P);
    glow(ctx, P[0], P[1], 7, 0.9 * fin, true);
    // Pólya: one cool light
    cam.project(p[2], 0, p[3], P);
    glowC(ctx, P[0], P[1], 7, 0.9 * fin, '205,220,255');
  };
  cam.project(p[0], 0, p[1], P);
  const cpx = P[0];
  const cpy = P[1];
  cam.project(p[2], 0, p[3], P);
  const names = inOut(T, b(96.5), b(99.6), 0.6, 0.4) * fin;
  const count = WOODS.meet.reduce((n, _mk, i) => (T >= [b(100), b(108), b(116), b(124)][i] ? i + 1 : n), 0);
  const lastT = [b(100), b(108), b(116), b(124)][Math.max(0, count - 1)];
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <Chapter T={T} at={b(96)} out={b(104)} text="苏 黎 世 · 郊 外 树 林" />
      <Tag x={cpx} y={cpy - 52} text="一对情侣" anchor="center" size={24} color={C.gold} o={names} />
      <Tag x={P[0]} y={P[1] + 22} text="波利亚" anchor="center" size={24} color="rgba(215,226,255,0.9)" o={names} />
      {count > 0 ? (
        <div style={{position: 'absolute', left: 130, top: 330, opacity: fin * inOut(T, b(100), b(126), 0.3, 0.6)}}>
          <div style={{fontFamily: '"Juno Sans", sans-serif', fontWeight: 800, fontSize: 130, lineHeight: 1, color: '#f6cf78', textShadow: '0 0 18px rgba(241,197,109,0.45)', transform: `scale(${1 + 0.12 * (1 - easeOut(clamp((T - lastT) / 0.35)))})`, transformOrigin: 'left center'}}>
            第 {count} 次
          </div>
          <div style={{fontFamily: '"Juno Sans", sans-serif', fontWeight: 600, fontSize: 30, color: C.ink, marginTop: 16, letterSpacing: '0.04em'}}>{count === 1 ? '撞见同一对情侣' : '又撞见了'}</div>
        </div>
      ) : null}
      <Credit T={T} at={b(104)} out={b(128)} text="Pólya, “Two Incidents”, 1970" />
    </>
  );
};

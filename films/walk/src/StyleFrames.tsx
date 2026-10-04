import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {makeCam} from './cam';
import {clamp, FPS, mulberry} from './lib';
import {bird, C, dot, glow, Light, Night, SERIF, textPoints} from './look';
import {BigNum, Caption, Corner, Credit, Sub, Tag} from './ui';
import {at, DRUNK, homeBy, W2, W3} from './walks';

/* Style frames for 《醉汉与小鸟》: four 6-second looks in the reference style, rendered as stills for
   the owner to approve before the film is built. A: the drunk man on the street grid. B: 2,000 walkers
   on the plane. C: 1,600 birds in space. D: "34%" made of birds. */
export const LOOK_FRAMES = 24 * FPS;
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];
const V = [0, 0, 0];

// ------------------------------------------------------------------ A. the drunk man
const DrunkFrame: React.FC<{t: number}> = ({t}) => {
  const s = 6 + t * 7; // steps
  const w = DRUNK.w;
  const wob = (k: number) => {
    // a drunk's stumble: a sideways sway that is zero on every corner
    at(w, 0, k, V);
    const r = mulberry(Math.floor(k) * 31 + 5);
    const amp = 0.07 * Math.sin((k % 1) * Math.PI) * (r() - 0.5) * 2;
    const a1 = [0, 0, 0];
    at(w, 0, Math.floor(k) + 1, a1);
    const a0 = [0, 0, 0];
    at(w, 0, Math.floor(k), a0);
    const dx = a1[0] - a0[0];
    const dz = a1[1] - a0[1];
    return [V[0] - dz * amp, V[1] + dx * amp];
  };
  const head = wob(s);
  const camT: [number, number, number] = [head[0] * 0.55, 0, head[1] * 0.55];
  const cam = makeCam([camT[0] - 1.2, 6.2, camT[2] + 7.2], camT, 44);
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the street grid, fading with distance from the walker
    ctx.lineWidth = 1.4;
    for (let k = -12; k <= 12; k++)
      for (let m = -12; m < 12; m++) {
        for (const [x0, z0, x1, z1] of [
          [k, m, k, m + 1],
          [m, k, m + 1, k],
        ]) {
          cam.project(x0, 0, z0, P);
          cam.project(x1, 0, z1, Q);
          if (P[3] === 0 || Q[3] === 0) continue;
          const dd = Math.hypot((x0 + x1) / 2 - head[0], (z0 + z1) / 2 - head[1]);
          const a = 0.32 * Math.exp(-dd / 6) + 0.03;
          ctx.strokeStyle = `rgba(241,197,109,${a})`;
          ctx.beginPath();
          ctx.moveTo(P[0], P[1]);
          ctx.lineTo(Q[0], Q[1]);
          ctx.stroke();
        }
      }
    // blocks: faint lit windows inside each block
    const r = mulberry(4);
    for (let x = -10; x < 10; x++)
      for (let z = -10; z < 10; z++)
        for (let j = 0; j < 3; j++) {
          cam.project(x + 0.2 + r() * 0.6, 0, z + 0.2 + r() * 0.6, P);
          if (P[3] > 0) dot(ctx, P[0], P[1], 1.1, 0.12 + r() * 0.12);
        }
    // home: a ring on the ground
    ctx.strokeStyle = 'rgba(255,226,160,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 48; k++) {
      cam.project(0.32 * Math.cos((k / 48) * Math.PI * 2), 0, 0.32 * Math.sin((k / 48) * Math.PI * 2), P);
      if (k === 0) ctx.moveTo(P[0], P[1]);
      else ctx.lineTo(P[0], P[1]);
    }
    ctx.stroke();
    cam.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], 9, 0.5, true);
    // the trail: every step he has taken, fading behind him
    ctx.lineCap = 'round';
    const from = Math.max(0, s - 60);
    let prev: number[] | null = null;
    for (let k = from; k <= s; k += 0.125) {
      const p = wob(k);
      cam.project(p[0], 0, p[1], P);
      if (prev) {
        const a = 0.75 * Math.pow((k - from) / (s - from + 1e-6), 1.6);
        ctx.strokeStyle = `rgba(255,214,140,${a})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(P[0], P[1]);
        ctx.stroke();
      }
      prev = [P[0], P[1]];
    }
    cam.project(head[0], 0, head[1], P);
    glow(ctx, P[0], P[1], 11, 0.95, true);
  };
  cam.project(0, 0, 0, P);
  return (
    <>
      <Light draw={draw} deps={[t]} bloom={1} />
      <Tag x={P[0]} y={P[1] + 18} text="家" anchor="center" size={26} color={C.gold} />
      <Sub T={t} at={0} out={99} zh="一个醉汉，每到路口就[随便]挑一条路" en="A drunk man picks a street at random at every corner." />
    </>
  );
};

// ------------------------------------------------------------------ B. 2,000 walkers on the plane
// a fixed sub-lattice offset per walker, so the swarm reads as particles and not as a pixel grid
const JIT = (() => {
  const r = mulberry(77);
  return Float32Array.from({length: W2.n * 2}, () => (r() - 0.5) * 0.8);
})();
const PlaneFrame: React.FC<{t: number}> = ({t}) => {
  const s = 120 + t * 40;
  const G = 10.5;
  const ox = 1120;
  const oy = 480;
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = 1;
    for (let i = 0; i < W2.n; i++) {
      const home = W2.back[i] >= 0 && W2.back[i] <= s;
      ctx.strokeStyle = home ? 'rgba(255,214,140,0.16)' : 'rgba(170,180,210,0.07)';
      ctx.beginPath();
      for (let k = 0; k <= 10; k++) {
        at(W2, i, s - 10 + k, V);
        const x = ox + (V[0] + JIT[i * 2]) * G;
        const y = oy + (V[1] + JIT[i * 2 + 1]) * G;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      at(W2, i, s, V);
      dot(ctx, ox + (V[0] + JIT[i * 2]) * G, oy + (V[1] + JIT[i * 2 + 1]) * G, home ? 1.9 : 1.3, home ? 0.85 : 0.3);
    }
    glow(ctx, ox, oy, 14, 0.7, true);
  };
  const pct = Math.round((100 * homeBy(W2, s)) / W2.n);
  return (
    <>
      <Light draw={draw} deps={[t]} bloom={0.9} />
      <BigNum T={t} at={0} out={99} x={130} y={330} value={`${pct}%`} zh="已经回过一次家" en="RETURNED HOME" />
      <Sub T={t} at={0} out={99} zh="二维平面上，走得再远，最后[都会]回来" en="On a plane, every walker eventually comes home." />
      <Credit T={t} at={0} out={99} text="模拟 · 2,000 个二维随机游走" />
    </>
  );
};

// ------------------------------------------------------------------ C. 1,600 birds in space
const SpaceFrame: React.FC<{t: number}> = ({t}) => {
  const s = 220 + t * 40;
  const phi = 0.5 + t * 0.12;
  const R = 78;
  const cam = makeCam([R * Math.sin(phi), R * 0.32, R * Math.cos(phi)], [0, -2, 0], 40, 1060, 520);
  const draw = (ctx: CanvasRenderingContext2D) => {
    // home: a glowing point inside three faint rings
    ctx.lineWidth = 1.2;
    for (const ax of [0, 1, 2]) {
      ctx.strokeStyle = 'rgba(241,197,109,0.35)';
      ctx.beginPath();
      for (let k = 0; k <= 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        const c = 4 * Math.cos(a);
        const d = 4 * Math.sin(a);
        const xyz = ax === 0 ? [c, d, 0] : ax === 1 ? [c, 0, d] : [0, c, d];
        cam.project(xyz[0], xyz[1], xyz[2], P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    for (let i = 0; i < W3.n; i++) {
      const home = W3.back[i] >= 0 && W3.back[i] <= s;
      at(W3, i, s - 0.6, V);
      cam.project(V[0], V[1], V[2], Q);
      at(W3, i, s, V);
      cam.project(V[0], V[1], V[2], P);
      if (P[3] === 0) continue;
      const sz = clamp(P[3] * 0.11, 0.6, 2.6);
      const fog = clamp(1.25 - P[2] / 110, 0.25, 1);
      bird(ctx, P[0], P[1], sz, Math.atan2(P[1] - Q[1], P[0] - Q[0]), (home ? 0.95 : 0.45) * fog, s * 3 + i);
    }
    cam.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], 12, 0.8, true);
  };
  return (
    <>
      <Light draw={draw} deps={[t]} bloom={0.9} />
      <BigNum T={t} at={0} out={99} x={130} y={330} value={`${Math.round((100 * homeBy(W3, s)) / W3.n)}%`} zh="回过家的小鸟" en="BIRDS THAT RETURNED" />
      <Sub T={t} at={0} out={99} zh="可一旦能[上下]飞，大多数就再也回不来了" en="Give them a third dimension, and most never return." />
      <Credit T={t} at={0} out={99} text="模拟 · 1,600 个三维随机游走" />
    </>
  );
};

// ------------------------------------------------------------------ D. "34%" made of birds
const NumberFrame: React.FC<{t: number}> = ({t}) => {
  const pts = textPoints('34%', `900 400px ${SERIF}`, 960, 330, 5200, 3);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const r = mulberry(9);
    for (let i = 0; i < pts.length; i++) {
      const ph = r() * 6.28;
      const sp = 0.6 + r();
      const x = pts[i][0] + 2.2 * Math.sin(t * sp + ph);
      const y = pts[i][1] + 2.2 * Math.cos(t * sp * 1.3 + ph);
      bird(ctx, x, y, 1 + r() * 0.9, ph + Math.sin(t + ph) * 0.4, 0.5 + 0.4 * r(), t * 9 + ph);
    }
    // the ones that never come back drift off
    for (let i = 0; i < 260; i++) {
      const a = r() * 6.28;
      const d = 520 + r() * 520 + t * 30 * (0.5 + r());
      bird(ctx, 960 + Math.cos(a) * d, 360 + Math.sin(a) * d * 0.55, 1 + r(), a, 0.22 * r(), t * 8 + i);
    }
  };
  return (
    <>
      <Light draw={draw} deps={[t]} bloom={1} />
      <Caption T={t} at={0} out={99} zh="小鸟回家的概率" en="PÓLYA'S RETURN PROBABILITY · 3D" y={560} />
      <Sub T={t} at={0} out={99} zh="醉汉一定能回家，小鸟只有[34%]" en="A drunk man will find his way home. A drunk bird may get lost forever." />
      <Credit T={t} at={0} out={99} text="Pólya, 1921 · Mathematische Annalen" />
    </>
  );
};

export const Look: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const k = Math.floor(T / 6);
  const t = T - k * 6;
  const F = [DrunkFrame, PlaneFrame, SpaceFrame, NumberFrame][Math.min(3, k)];
  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Night />
      <F t={t} />
      <Corner />
    </AbsoluteFill>
  );
};


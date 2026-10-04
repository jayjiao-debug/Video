import React from 'react';
import {makeCam, type Cam} from '../cam';
import {b, camAt, clamp, easeInOut, easeOut, inOut, lerp, mulberry, prog, stepOnBeat, type Key} from '../lib';
import {bird, C, dot, glow, LATIN, Light, motif, SERIF, SANS} from '../look';
import {at, DRUNK} from '../walks';
import {Tag} from '../ui';

/* S1, the cold open: 2 a.m., a drunk man (one gold light) steps out of his door onto a city of
   lit streets and staggers one block per beat; the camera starts low and close, rises to show the
   whole grid, then tilts up as a bird lifts into the night. b31: the title card, built from the
   same objects. S10 comes back to this street (drawStreet is shared). */

const V = [0, 0, 0];
const P = [0, 0, 0, 0];
const Q = [0, 0, 0, 0];

/** the drunk man's position at fractional step k, with a sideways sway that is zero on corners */
export const drunkAt = (k: number) => {
  const w = DRUNK.w;
  const k0 = Math.floor(k);
  const a0 = at(w, 0, k0, [0, 0, 0]);
  const a1 = at(w, 0, k0 + 1, [0, 0, 0]);
  at(w, 0, k, V);
  const r = mulberry(k0 * 31 + 5);
  const amp = 0.09 * Math.sin((k % 1) * Math.PI) * (r() - 0.5) * 2;
  return [V[0] - (a1[1] - a0[1]) * amp, V[1] + (a1[0] - a0[0]) * amp];
};

const LAMPS = (() => {
  const r = mulberry(12);
  const out: [number, number, number][] = [];
  for (let x = -14; x <= 14; x++) for (let z = -14; z <= 14; z++) if (r() < 0.16) out.push([x, z, 0.4 + r() * 0.6]);
  return out;
})();
const WINDOWS = (() => {
  const r = mulberry(4);
  const out: [number, number, number][] = [];
  for (let x = -14; x < 14; x++) for (let z = -14; z < 14; z++) for (let j = 0; j < 4; j++) out.push([x + 0.18 + r() * 0.64, z + 0.18 + r() * 0.64, 0.08 + r() * 0.16]);
  return out;
})();

/** the street: grid, windows, lamps, home ring, the man's trail and the man. `grid` fades the city. */
export const drawStreet = (ctx: CanvasRenderingContext2D, cam: Cam, k: number, o: {grid: number; trailFrom?: number; home?: number; man?: number}) => {
  const head = drunkAt(k);
  const g = o.grid;
  if (g > 0.003) {
    ctx.lineWidth = 1.3;
    for (let a = -14; a <= 14; a++)
      for (let m = -14; m < 14; m++) {
        for (let dir = 0; dir < 2; dir++) {
          const x0 = dir ? m : a;
          const z0 = dir ? a : m;
          const x1 = dir ? m + 1 : a;
          const z1 = dir ? a : m + 1;
          cam.project(x0, 0, z0, P);
          cam.project(x1, 0, z1, Q);
          if (P[3] === 0 || Q[3] === 0) continue;
          const dd = Math.hypot((x0 + x1) / 2 - head[0], (z0 + z1) / 2 - head[1]);
          const al = (0.3 * Math.exp(-dd / 6) + 0.035) * g;
          ctx.strokeStyle = `rgba(241,197,109,${al})`;
          ctx.beginPath();
          ctx.moveTo(P[0], P[1]);
          ctx.lineTo(Q[0], Q[1]);
          ctx.stroke();
        }
      }
    for (const [x, z, a] of WINDOWS) {
      cam.project(x, 0, z, P);
      if (P[3] > 0) dot(ctx, P[0], P[1], clamp(P[3] * 0.012, 0.6, 2.2), a * g);
    }
    for (const [x, z, a] of LAMPS) {
      cam.project(x, 0, z, P);
      if (P[3] > 0) glow(ctx, P[0], P[1], clamp(P[3] * 0.02, 1, 4), 0.22 * a * g);
    }
  }
  // home: a ring on the ground
  const h = o.home ?? 1;
  if (h > 0.003) {
    ctx.strokeStyle = `rgba(255,226,160,${0.85 * h})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      cam.project(0.3 * Math.cos((i / 48) * Math.PI * 2), 0, 0.3 * Math.sin((i / 48) * Math.PI * 2), P);
      if (i === 0) ctx.moveTo(P[0], P[1]);
      else ctx.lineTo(P[0], P[1]);
    }
    ctx.stroke();
    cam.project(0, 0, 0, P);
    glow(ctx, P[0], P[1], clamp(P[3] * 0.03, 3, 10), 0.55 * h, true);
  }
  // the trail: every step he has taken tonight, older steps fainter
  const man = o.man ?? 1;
  if (man > 0.003 && k > 0.01) {
    ctx.lineCap = 'round';
    const from = o.trailFrom ?? 0;
    let px = 0;
    let py = 0;
    let first = true;
    for (let s = from; s <= k + 1e-6; s += 0.125) {
      const p = drunkAt(Math.min(s, k));
      cam.project(p[0], 0, p[1], P);
      if (!first) {
        const age = (k - s) / 30;
        ctx.strokeStyle = `rgba(255,214,140,${man * (0.12 + 0.68 * Math.exp(-age * 2.2))})`;
        ctx.lineWidth = clamp(P[3] * 0.02, 1.2, 3);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(P[0], P[1]);
        ctx.stroke();
      }
      px = P[0];
      py = P[1];
      first = false;
    }
  }
  if (man > 0.003) {
    cam.project(head[0], 0, head[1], P);
    glow(ctx, P[0], P[1], clamp(P[3] * 0.035, 5, 14), 0.95 * man, true);
  }
};

// ------------------------------------------------------------------ the cold open
const BIRD_UP = b(25);
const birdPos = (T: number, head: number[]): [number, number, number] => {
  const u = Math.max(0, T - BIRD_UP);
  // it rises from the man's corner, spiralling up and away
  return [head[0] + Math.sin(u * 1.6) * 0.8 * u, 0.2 + u * 1.25 + u * u * 0.05, head[1] - u * 1.1 + Math.cos(u * 1.6) * 0.6 * u];
};

const S1_HEAD = (T: number) => drunkAt(stepOnBeat(Math.min(T, b(31)), 1));

export const S1: React.FC<{T: number}> = ({T}) => {
  const k = stepOnBeat(Math.min(T, b(31)), 1);
  const head = drunkAt(k);
  const tgt = [head[0] * 0.75, 0, head[1] * 0.75];
  const hd = S1_HEAD(BIRD_UP);
  const bp = birdPos(T, hd);
  const KEYS: Key[] = [
    [0, [-0.6, 1.3, 2.4], [0, 0.1, 0]],
    [b(9), [-1.2, 4.2, 5.6], [0, 0, 0]],
    [b(19), [-1.6, 9.5, 10.5], [0, 0, 0]],
    [b(25), [-1.6, 8.5, 10.5], [0, 0.5, 0]],
    [b(31), [-2.4, 6.5, 9.5], [0, 0.5, 0]],
  ];
  const c = camAt(KEYS, T);
  const follow = 1 - prog(T, b(25), b(30)) * 0.5;
  // from b25 the camera finds the bird and follows it up, the street sinking to the bottom of frame
  const wb = easeInOut(prog(T, b(25), b(29)));
  const pos: [number, number, number] = [c.pos[0] + tgt[0] * follow, c.pos[1], c.pos[2] + tgt[2] * follow];
  const look: [number, number, number] = [lerp(c.look[0] + tgt[0] * follow, bp[0], wb * 0.9), lerp(c.look[1], bp[1] - 1.2, wb * 0.9), lerp(c.look[2] + tgt[2] * follow, bp[2], wb * 0.9)];
  const cam = makeCam(pos, look, 46);
  const o = 1 - prog(T, b(31) - 0.05, b(31) + 0.35);
  const draw = (ctx: CanvasRenderingContext2D) => {
    drawStreet(ctx, cam, k, {grid: easeOut(prog(T, 0, 1.4)) * o, home: o, man: o});
    // the bird
    if (T > BIRD_UP) {
      for (let i = 24; i >= 0; i--) {
        const tt = T - i * 0.05;
        if (tt < BIRD_UP) continue;
        const q = birdPos(tt, hd);
        cam.project(q[0], q[1], q[2], P);
        if (P[3] > 0) dot(ctx, P[0], P[1], 2, 0.6 * (1 - i / 25) * o);
      }
      cam.project(bp[0], bp[1], bp[2], P);
      const q = birdPos(T - 0.05, hd);
      cam.project(q[0], q[1], q[2], Q);
      if (P[3] > 0) {
        bird(ctx, P[0], P[1], clamp(P[3] * 0.006, 3.5, 6.5), Math.atan2(P[1] - Q[1], P[0] - Q[0]), 0.95 * o, T * 22);
        glow(ctx, P[0], P[1], 4, 0.35 * o);
      }
    }
  };
  cam.project(0, 0, 0, P);
  const homeTag = inOut(T, 0.4, b(20), 0.6, 0.6);
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <Tag x={P[0]} y={P[1] + 14} text="家" anchor="center" size={26} color={C.gold} o={homeTag * o} />
    </>
  );
};

// ------------------------------------------------------------------ the title card (b31 → b39)
const TITLE = ['醉', '汉', '与', '小', '鸟'];

export const TitleCard: React.FC<{T: number}> = ({T}) => {
  const out = prog(T, b(38), b(39));
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the motif draws itself from the hit; at the end it splits into the next scene's two points
    motif(ctx, 960, 300, 1.25, 1 - prog(T, b(38.6), b(39)), easeOut(prog(T, b(31), b(34))), easeInOut(out));
  };
  const words = 1 - easeOut(out);
  const rise = -24 * easeInOut(out);
  const pour = easeInOut(prog(T, b(35), b(36)));
  const col = `rgb(${Math.round(lerp(255, 246, pour))},${Math.round(lerp(246, 207, pour))},${Math.round(lerp(230, 120, pour))})`;
  return (
    <>
      <Light draw={draw} deps={[T]} bloom={1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', opacity: words, transform: `translateY(${rise}px)`}}>
        <div style={{fontFamily: LATIN, fontVariantNumeric: 'lining-nums', fontSize: 24, letterSpacing: '0.42em', color: 'rgba(243,239,230,0.6)', opacity: inOut(T, b(32), 999, 0.5, 0)}}>RANDOM WALKS · PÓLYA · 1921</div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 132, letterSpacing: '0.1em', marginTop: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4}}>
          {['《', ...TITLE, '》'].map((ch, i) => {
            const at = i === 0 ? b(31) : i === TITLE.length + 1 ? b(31) + (TITLE.length * (b(32) - b(31))) / 2 : b(31) + ((i - 1) * (b(32) - b(31))) / 2;
            const k = clamp((T - at) / 0.16);
            if (k <= 0) return <span key={i} style={{opacity: 0}}>{ch}</span>;
            const sc = 1.35 - 0.35 * easeOut(k);
            return (
              <span key={i} style={{display: 'inline-block', color: col, opacity: k, transform: `scale(${sc})`, textShadow: `0 0 ${18 + 24 * pour}px rgba(241,197,109,${0.25 + 0.4 * pour}), 0 4px 18px rgba(0,0,0,0.8)`}}>
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.ink, marginTop: 18, opacity: inOut(T, b(33), 999, 0.5, 0), letterSpacing: '0.06em'}}>醉汉能回家，小鸟为什么不能？</div>
        <div style={{fontFamily: LATIN, fontStyle: 'italic', fontSize: 26, color: 'rgba(243,239,230,0.5)', marginTop: 8, opacity: inOut(T, b(33.5), 999, 0.5, 0)}}>A drunk man finds his way home. Why can’t a bird?</div>
        <div style={{fontFamily: SANS, fontSize: 18, color: 'rgba(241,197,109,0.6)', marginTop: 26, letterSpacing: '0.3em', opacity: inOut(T, b(34), 999, 0.6, 0)}}>— Juno · VIBE知识大赏 —</div>
      </div>
    </>
  );
};

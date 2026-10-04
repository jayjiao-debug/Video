import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {makeCam} from './cam';
import {FPS, mulberry} from './lib';
import {C, dot, glow, Light, Night} from './look';
import {BigNum, Corner, Credit, Sub, Tag} from './ui';
import {flash, kuramoto, order, phase} from './sync';

/* Style frames for 《没有指挥》 in the reference look. A1/A2: a mangrove river at night, 3,000
   fireflies outlining the trees (and their reflection), first flashing at random, then all at once.
   B: 32 metronomes on one board. C: the Millennium Bridge, a crowd that starts to sway together.
   D: the idea in one picture: runners on a circular track drifting into one bunch. */
export const LOOK_FRAMES = 30 * FPS;

// ------------------------------------------------------------------ fireflies
const TREES = [
  [180, 470, 150, 120],
  [430, 455, 190, 150],
  [700, 480, 140, 105],
  [930, 445, 210, 165],
  [1200, 470, 170, 130],
  [1450, 455, 200, 150],
  [1720, 478, 150, 110],
];
const BANK = 560;
const FLIES = (() => {
  const r = mulberry(3);
  const out: [number, number][] = [];
  while (out.length < 3000) {
    const t = TREES[Math.floor(r() * TREES.length)];
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = t[0] + Math.cos(a) * d * t[2];
    const y = t[1] + Math.sin(a) * d * t[3] * 0.8;
    if (y < BANK - 4) out.push([x, y]);
  }
  return out;
})();
const FIRE = kuramoto({n: 3000, seconds: 24, hz: 1.966, spread: 0.07, K: (t) => (t < 2 ? 0 : Math.min(4, (t - 2) * 0.5)), seed: 7});

/** the moment nearest `near` when the synced fireflies are at the top of a flash */
const peakNear = (near: number) => {
  let best = near;
  let bv = -1;
  for (let t = near - 0.3; t <= near + 0.3; t += 1 / 60) {
    let v = 0;
    for (let i = 0; i < 300; i++) v += flash(phase(FIRE, i, t));
    if (v > bv) {
      bv = v;
      best = t;
    }
  }
  return best;
};
const PEAK = peakNear(17);

const Fireflies: React.FC<{t: number; at: number}> = ({t, at}) => {
  const tt = at + t;
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the river: a faint horizon line and a few ripples
    ctx.strokeStyle = 'rgba(241,197,109,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, BANK);
    ctx.lineTo(1920, BANK);
    ctx.stroke();
    const rr = mulberry(5);
    for (let k = 0; k < 40; k++) {
      const y = BANK + 20 + rr() * 300;
      const x = rr() * 1920;
      ctx.strokeStyle = `rgba(200,210,235,${0.05 + rr() * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40 + rr() * 120, y);
      ctx.stroke();
    }
    // trunks: faint lines from each crown down to the bank
    for (const [x, y, w, h] of TREES) {
      ctx.strokeStyle = 'rgba(241,197,109,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.5);
      ctx.lineTo(x - w * 0.05, BANK);
      ctx.moveTo(x, y + h * 0.4);
      ctx.lineTo(x + w * 0.18, BANK);
      ctx.stroke();
    }
    for (let i = 0; i < FLIES.length; i++) {
      const f = flash(phase(FIRE, i, tt));
      const [x, y] = FLIES[i];
      dot(ctx, x, y, 1.1, 0.2);
      if (f > 0.02) {
        glow(ctx, x, y, 2.2, 0.8 * f, f > 0.5);
        // reflection
        const ry = 2 * BANK - y + 8;
        dot(ctx, x + Math.sin(ry * 0.08 + tt * 2) * 3, ry, 1.6, 0.28 * f);
      }
    }
  };
  return <Light draw={draw} deps={[t, at]} bloom={1.1} />;
};

// ------------------------------------------------------------------ metronomes
const MET = kuramoto({n: 32, seconds: 30, hz: 1.2, spread: 0.06, K: (t) => (t < 1 ? 0 : 1.6), seed: 11});
const Metronomes: React.FC<{t: number; at: number}> = ({t, at}) => {
  const tt = at + t;
  const draw = (ctx: CanvasRenderingContext2D) => {
    // the board resting on two cans
    const sway = Math.sin(phase(MET, 0, tt)) * order(MET, tt) * 6;
    ctx.strokeStyle = 'rgba(241,197,109,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300 + sway, 742);
    ctx.lineTo(1620 + sway, 742);
    ctx.stroke();
    for (const cx of [520, 1400]) {
      ctx.beginPath();
      ctx.ellipse(cx, 770, 46, 26, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 32; i++) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      const x = 420 + col * 154 + row * 18 + sway;
      const y = 740 - row * 140;
      const s = 0.85 - row * 0.12;
      const a = 0.4 + 0.15 * (3 - row);
      // body: a trapezoid
      ctx.strokeStyle = `rgba(241,197,109,${a})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 30 * s, y);
      ctx.lineTo(x - 14 * s, y - 110 * s);
      ctx.lineTo(x + 14 * s, y - 110 * s);
      ctx.lineTo(x + 30 * s, y);
      ctx.closePath();
      ctx.stroke();
      // the arm
      const ang = 0.5 * Math.sin(phase(MET, i, tt));
      const px = x;
      const py = y - 16 * s;
      const tx = px + Math.sin(ang) * 120 * s;
      const ty = py - Math.cos(ang) * 120 * s;
      ctx.strokeStyle = `rgba(255,226,170,${a + 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      glow(ctx, px + Math.sin(ang) * 80 * s, py - Math.cos(ang) * 80 * s, 3 * s, 0.7, true);
    }
  };
  return <Light draw={draw} deps={[t, at]} bloom={0.9} />;
};

// ------------------------------------------------------------------ the bridge
const WALK = kuramoto({n: 400, seconds: 30, hz: 1.0, spread: 0.1, K: (t) => (t < 1 ? 0 : 1.2), seed: 21});
const CROWD = (() => {
  const r = mulberry(8);
  return Array.from({length: 400}, () => [r() * 2 - 1, (r() - 0.5) * 0.7, r()] as [number, number, number]);
})();
const Bridge: React.FC<{t: number; at: number}> = ({t, at}) => {
  const tt = at + t;
  const cam = makeCam([-14, 6, 15], [0, 0, 0], 40, 960, 470);
  const P = [0, 0, 0, 0];
  const Q = [0, 0, 0, 0];
  const draw = (ctx: CanvasRenderingContext2D) => {
    const R = order(WALK, tt);
    const sway = Math.sin(phase(WALK, 0, tt)) * R * 0.25;
    const deckZ = (x: number) => sway * Math.sin(((x + 1) / 2) * Math.PI);
    const L = 10;
    // river banks
    ctx.strokeStyle = 'rgba(241,197,109,0.15)';
    ctx.lineWidth = 1;
    for (const x of [-L, L]) {
      cam.project(x, -0.6, -6, P);
      cam.project(x, -0.6, 6, Q);
      ctx.beginPath();
      ctx.moveTo(P[0], P[1]);
      ctx.lineTo(Q[0], Q[1]);
      ctx.stroke();
    }
    // deck edges + low cables
    for (const e of [-0.45, 0.45]) {
      ctx.strokeStyle = 'rgba(241,197,109,0.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const u = k / 60;
        const x = -L + u * 2 * L;
        cam.project(x, 0, e + deckZ(u * 2 - 1), P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(241,197,109,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let k = 0; k <= 60; k++) {
        const u = k / 60;
        const x = -L + u * 2 * L;
        cam.project(x, 0.35 - 0.3 * Math.sin(u * Math.PI * 3) ** 2, e * 1.6 + deckZ(u * 2 - 1), P);
        if (k === 0) ctx.moveTo(P[0], P[1]);
        else ctx.lineTo(P[0], P[1]);
      }
      ctx.stroke();
    }
    // the crowd: each walker sways sideways with its own step phase
    for (let i = 0; i < CROWD.length; i++) {
      const [u, z, sp] = CROWD[i];
      const x = (((u + tt * 0.02 * (0.5 + sp)) % 1) + 1) % 1;
      const step = Math.sin(phase(WALK, i, tt)) * 0.06;
      cam.project(-L + x * 2 * L, 0.05, z + step + deckZ(x * 2 - 1), P);
      dot(ctx, P[0], P[1], 2.2, 0.85);
    }
  };
  return <Light draw={draw} deps={[t, at]} bloom={0.9} />;
};

// ------------------------------------------------------------------ the idea: a circular track
const RING = kuramoto({n: 60, seconds: 30, hz: 0.25, spread: 0.05, K: (t) => (t < 1 ? 0 : 0.9), seed: 31});
const Track: React.FC<{t: number; at: number}> = ({t, at}) => {
  const tt = at + t;
  const draw = (ctx: CanvasRenderingContext2D) => {
    const cx = 1100;
    const cy = 450;
    const R = 280;
    ctx.strokeStyle = 'rgba(241,197,109,0.35)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < RING.n; i++) {
      const p = phase(RING, i, tt);
      const x = cx + Math.cos(p) * R;
      const y = cy + Math.sin(p) * R;
      sx += Math.cos(p);
      sy += Math.sin(p);
      glow(ctx, x, y, 3.2, 0.8, true);
    }
    // the crowd's average: an arrow that grows as they agree
    sx /= RING.n;
    sy /= RING.n;
    ctx.strokeStyle = 'rgba(255,226,170,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + sx * R, cy + sy * R);
    ctx.stroke();
    glow(ctx, cx, cy, 5, 0.6, true);
  };
  return <Light draw={draw} deps={[t, at]} bloom={0.9} />;
};

export const Look: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const k = Math.floor(T / 6);
  const t = T - k * 6;
  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Night cy={40} />
      {k === 0 ? (
        <>
          <Fireflies t={t} at={0} />
          <Sub T={t} at={0} out={99} zh="泰国的河边，几千只萤火虫各闪各的" en="A Thai riverbank: thousands of fireflies, each flashing on its own." />
        </>
      ) : k === 1 ? (
        <>
          <Fireflies t={t} at={PEAK - 3.05} />
          <Sub T={t} at={0} out={99} zh="几分钟后，整片树林[一起]闪" en="Minutes later, the whole riverbank flashes as one." />
        </>
      ) : k === 2 ? (
        <>
          <Metronomes t={t} at={18} />
          <Tag x={960} y={120} text="32 个节拍器 · 放在同一块木板上" anchor="center" size={26} color={C.gold} />
          <Sub T={t} at={0} out={99} zh="木板一晃，32 个节拍器[自己]对齐了" en="The board sways, and 32 metronomes fall into step on their own." />
        </>
      ) : k === 3 ? (
        <>
          <Bridge t={t} at={18} />
          <Sub T={t} at={0} out={99} zh="桥一晃，人就跟着晃；人一齐晃，桥晃得更[厉害]" en="The bridge sways, people sway with it; the more they agree, the more it sways." />
          <Credit T={t} at={0} out={99} text="London Millennium Bridge, June 2000" />
        </>
      ) : (
        <>
          <Track t={t} at={k === 4 ? 0.5 : 14} />
          <BigNum T={t} at={0} out={99} x={130} y={330} value={`${Math.round(order(RING, k === 4 ? 0.5 + t : 14 + t) * 100)}%`} zh="步调一致的程度" en="ORDER PARAMETER r" />
          <Sub T={t} at={0} out={99} zh="谁都不当指挥，只是[往大家那边]靠一点点" en="No one leads. Each one just leans a little toward the crowd." />
        </>
      )}
      <Corner />
    </AbsoluteFill>
  );
};

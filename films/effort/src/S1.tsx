import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, rnd, pop, camAt, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex, project } from './three-kit';
import { useModels } from './useModels';
import { materials } from './models';
import { EnvFor, Spot, softTex } from './kit';

/* S1, cold open (b0–b31; the title stamps on b32 = 16.61 s).
   A  b0–b8   the belief: a gold straight line, effort ×2 → reward ×2.
   B  b8–b16  1915, a British munitions shop: a bench under a brass lamp, the wall clock running round to 70 hours.
   C  b16–b24 two batches of shells: 56 hours a week and 70 hours a week make about the same number.
   D  b24–b31 "Where did the 14 extra hours go?"
   Output model (shape of Pencavel 2014, Fig. 4): proportional to hours below 49; above, rising at a decreasing rate to a
   maximum near 63 and back down, so that 70 h ≈ 56 h. f(h) = h (h ≤ 49); 49 + (h−49) − (h−49)²/28 (h > 49). */
export const S1_IN = 0, S1_OUT = b(31);
export const output = (h: number) => (h <= 49 ? h : 49 + (h - 49) - ((h - 49) * (h - 49)) / 28);

export const LINES_S1: Line[] = [
  [b(0) + 0.5, b(8) - 0.1, '你以为：付出翻倍，回报也翻倍。', 'You think: double the effort, double the reward.'],
  [b(8) + 0.06, b(16) - 0.1, '一百多年前，英国军工厂里，女工每周干到70小时。', 'A century ago, women in British munitions works put in up to 70 hours a week.'],
  [b(16) + 0.06, b(24) - 0.1, '可产出，和每周干56小时的时候几乎一样。', 'Yet they produced about as much as in a 56-hour week.'],
  [b(24) + 0.06, b(30) - 0.12, '多干的14个小时，[去哪了]？', 'So where did the extra 14 hours go?'],
];

export const TOP = 0.76;

// ---------------- A: the straight line ----------------
const Belief: React.FC<{ T: number }> = ({ T }) => {
  const x0 = 520, y0 = 800, s = 300; // one unit = 300 px
  const draw = easeOut(prog(T, 0, 2.6));
  const len = Math.hypot(2 * s, 2 * s) * 1.12;
  const o = (a: number, d = 0.4) => easeOut(prog(T, a, a + d));
  const push = 1 + 0.06 * easeInOut(prog(T, 0, b(8)));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 55%' }}>
      <g stroke="rgba(243,237,226,0.07)" strokeWidth={1}>
        {Array.from({ length: 25 }, (_, i) => <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={1080} />)}
        {Array.from({ length: 15 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={1920} y2={i * 80} />)}
      </g>
      <g stroke="rgba(243,237,226,0.5)" strokeWidth={2}>
        <line x1={x0} y1={y0} x2={x0 + 2.4 * s} y2={y0} />
        <line x1={x0} y1={y0} x2={x0} y2={y0 - 2.3 * s} />
      </g>
      <text x={x0 + 2.4 * s} y={y0 + 44} textAnchor="end" style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.75)' }}>付出</text>
      <text x={x0 - 22} y={y0 - 2.3 * s + 10} textAnchor="end" style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.75)' }}>回报</text>
      <line x1={x0} y1={y0} x2={x0 + 2.2 * s} y2={y0 - 2.2 * s} stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} style={{ filter: 'drop-shadow(0 0 12px rgba(246,207,120,0.6))' }} />
      {[1, 2].map((k) => {
        const at = 0.9 + k * 0.7;
        return (
          <g key={k} opacity={o(at)}>
            <line x1={x0 + k * s} y1={y0} x2={x0 + k * s} y2={y0 - k * s} stroke="rgba(246,207,120,0.35)" strokeDasharray="6 8" />
            <line x1={x0} y1={y0 - k * s} x2={x0 + k * s} y2={y0 - k * s} stroke="rgba(246,207,120,0.35)" strokeDasharray="6 8" />
            <circle cx={x0 + k * s} cy={y0 - k * s} r={10 * pop(T, at)} fill={GOLD} />
            <text x={x0 + k * s + 22} y={y0 - k * s + 10} style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: INK }}>×{k}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------------- B–D: the shop ----------------
const brickTex = () => canvasTex(1024, 1024, (g) => {
  g.fillStyle = '#2a1712'; g.fillRect(0, 0, 1024, 1024);
  const bw = 128, bh = 48;
  for (let r = 0; r < 1024 / bh; r++) for (let c = -1; c < 1024 / bw + 1; c++) {
    const x = c * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
    const k = rnd(r * 40 + c, 1);
    g.fillStyle = `rgb(${90 + k * 40},${44 + k * 20},${32 + k * 14})`;
    g.fillRect(x + 4, y + 4, bw - 8, bh - 8);
    for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd(r * 40 + c, i + 3) * 0.12})`; g.fillRect(x + 4 + rnd(r, i) * (bw - 10), y + 4 + rnd(c, i) * (bh - 10), 2 + rnd(i, r) * 6, 2); }
  }
});

/** the wall-clock hand angle: runs round fast while the hours pile up (its own clock) */
const weekHours = (T: number) => 70 * easeInOut(prog(T, b(8) + 0.3, b(15)));
const clockSpin = (T: number) => (weekHours(T) / 12) * Math.PI * 2;

// two batches: 11 shells each (≈ 54 units of output at 56 h and at 70 h); 70 h takes longer to fill
const N = 11;
const GROUP = (g: number) => ({ x: g === 0 ? -0.36 : 0.36 });
const SH = 0.62; // shells drawn at 0.62 × 0.45 m ≈ 0.28 m, so a batch of 11 reads at a glance
const slot = (g: number, i: number) => {
  const row = i < 4 ? 0 : i < 7 ? 1 : 2, col = i < 4 ? i : i < 7 ? i - 4 : i - 7;
  const n = row === 1 ? 3 : 4;
  return [GROUP(g).x + (col - (n - 1) / 2) * 0.095, TOP, -0.12 + row * 0.09] as [number, number, number];
};
// the shells arrive on their own clock: batch 56 h over ~2.4 s, batch 70 h over ~3 s (both start at b16)
const arrive = (g: number, i: number) => b(16) + 0.3 + (g === 0 ? 2.4 : 3.0) * Math.pow((i + 0.5) / N, 0.9);

const KEYS: Key[] = [
  [b(8), [-0.75, TOP + 0.45, 1.25], [0.05, TOP + 0.3, -0.4]],
  [b(15), [-0.35, TOP + 0.5, 1.45], [0.0, TOP + 0.15, -0.1]],
  [b(16), [0.0, TOP + 0.75, 1.75], [0.0, TOP + 0.1, 0]],
  [b(24), [0.0, TOP + 0.8, 1.85], [0.0, TOP + 0.1, 0]],
  [b(31), [0.0, TOP + 1.3, 1.3], [0.0, TOP + 0.05, 0]],
];

export const Shop: React.FC<{ T: number; keys: Key[]; m: Record<string, THREE.Group>; shells: (T: number) => { p: [number, number, number]; s: number; o: number }[]; dim?: number; aperture?: number }> = ({ T, keys, m, shells, dim = 1, aperture = 0.01 }) => {
  const table = useMemo(() => {
    const c = m.table.clone(true);
    const bb = new THREE.Box3().setFromObject(c);
    c.position.y += TOP - bb.max.y;
    materials(c).forEach((x) => { x.color = new THREE.Color('#6a5442'); x.roughness = 0.8; });
    return c;
  }, [m.table]);
  const brick = useMemo(() => { const t = brickTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; }, []);
  const lamp = useMemo(() => m.lamp.clone(true), [m.lamp]);
  const clock = useMemo(() => m.wallclock.clone(true), [m.wallclock]);
  const shellClones = useMemo(() => Array.from({ length: 2 * N }, () => m.shell.clone(true)), [m.shell]);
  const shellMats = useMemo(() => materials(m.shell), [m.shell]);
  const list = shells(T);
  const fl = 0.95 + 0.05 * Math.sin(T * 7.3) * Math.sin(T * 3.1);
  const spin = clockSpin(T);
  return (
    <Stage bloom={0.45} threshold={0.88} seed={Math.floor(T * 30) % 97} focus={Math.hypot(...camAt(keys, T).pos.map((v, i) => v - camAt(keys, T).look[i]))} aperture={aperture} maxblur={0.012}>
      <CamRig T={T} keys={keys} fov={32} />
      <ambientLight intensity={0.03 * dim} color="#8090b0" />
      <Spot position={[0, TOP + 0.62, 0.05]} target={[0, TOP, 0]} angle={0.85} penumbra={0.75} intensity={2.2 * fl * dim} color="#ffbe7a" near={0.05} far={4} />
      <pointLight position={[-1.2, TOP + 0.8, 1.2]} intensity={0.25 * dim} decay={2} color="#6f8cff" />
      {/* a second lamp further down the shop washes the brick wall and the clock */}
      <Spot position={[0.9, TOP + 0.9, 0.2]} target={[0.15, TOP + 0.5, -0.75]} angle={0.6} penumbra={1} intensity={1.4 * dim} color="#ffb46a" near={0.1} far={4} />
      <primitive object={lamp} position={[0, TOP + 0.62, 0.05]} />
      <primitive object={table} />
      {/* the back wall with the clock */}
      <mesh position={[0, 1.2, -0.75]} receiveShadow><planeGeometry args={[6, 3]} /><meshStandardMaterial map={brick} roughness={0.95} color="#b09080" /></mesh>
      <group position={[0.15, TOP + 0.62, -0.72]}>
        <primitive object={clock} rotation={[0, 0, 0]} />
        {/* our own hands over the face so they can run */}
        <mesh position={[0, 0.17, 0.035]} rotation={[0, 0, -spin]}><boxGeometry args={[0.006, 0.12, 0.003]} /><meshStandardMaterial color="#111" /></mesh>
      </group>
      {list.map((s, i) => s.o > 0.01 && (
        <group key={i} position={s.p} scale={s.s * SH}><primitive object={shellClones[i]} /></group>
      ))}
      <EnvFor mats={shellMats} intensity={0.5} />
      {/* dust in the lamp light */}
      {Array.from({ length: 40 }, (_, i) => {
        const z = (rnd(i, 1) - 0.5) * 0.8, y = TOP + 0.05 + rnd(i, 2) * 0.55 + 0.01 * Math.sin(T * 0.4 + i);
        const sz = 0.002 + rnd(i, 3) * 0.003;
        return <sprite key={i} position={[(rnd(i, 4) - 0.5) * 0.9 + 0.01 * Math.sin(T * 0.3 + i), y, z]} scale={[sz, sz, sz]}><spriteMaterial map={softTex()} color="#ffe2b0" transparent opacity={0.4 * rnd(i, 5) * dim} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>;
      })}
    </Stage>
  );
};

/** every shell of both batches, standing (for the title card's background) */
export const allShells = (_T: number) => Array.from({ length: 2 * N }, (_, k) => { const p = slot(k < N ? 0 : 1, k % N); return { p, s: 1, o: 1 }; });

const shellsS1 = (T: number) => {
  const out: { p: [number, number, number]; s: number; o: number }[] = [];
  for (let g = 0; g < 2; g++) for (let i = 0; i < N; i++) {
    const at = arrive(g, i);
    const k = easeOut(prog(T, at, at + 0.25));
    const p = slot(g, i);
    out.push({ p: [p[0], p[1] + (1 - k) * 0.08, p[2]], s: 0.9 + 0.1 * k, o: T >= b(16) ? k : 0 });
  }
  // in B, a few shells stand on the bench already (the work in progress)
  if (T < b(16)) for (let i = 0; i < 5; i++) out[i] = { p: [-0.22 + i * 0.11, TOP, -0.05 + (i % 2) * 0.07], s: 1, o: 1 };
  return out;
};

export const S1: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['table', 'lamp', 'wallclock', 'shell']);
  if (T > S1_OUT || !m) return null;
  const o = 1 - easeIn(prog(T, b(30), S1_OUT));
  const inShop = T >= b(8);
  const hours = Math.round(weekHours(T));
  const lbl = (g: number) => {
    const p = project(KEYS, T, [GROUP(g).x, TOP + 0.36, -0.02], 32);
    const n = Array.from({ length: N }, (_, i) => i).filter((i) => T >= arrive(g, i)).length;
    return { p, n };
  };
  const tagO = easeOut(prog(T, b(16) + 0.2, b(16) + 0.6)) * (1 - prog(T, b(29), b(30)));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {!inShop && <Belief T={T} />}
      {inShop && <Shop T={T} keys={KEYS} m={m} shells={shellsS1} />}
      {inShop && T < b(16) && (
        <div style={{ position: 'absolute', right: 150, top: 300, textAlign: 'right', opacity: easeOut(prog(T, b(9), b(10))) }}>
          <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.7)', letterSpacing: '0.1em' }}>本周工时</div>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 120, lineHeight: 1, color: hours >= 70 ? GOLD : INK, fontVariantNumeric: 'tabular-nums lining-nums' }}>{Math.max(0, hours)}<span style={{ fontFamily: ZH, fontSize: 40 }}> 小时</span></div>
        </div>
      )}
      {tagO > 0.01 && [0, 1].map((g) => {
        const { p, n } = lbl(g);
        return (
          <div key={g} style={{ position: 'absolute', left: p.x - 160, top: p.y - 140, width: 320, textAlign: 'center', opacity: tagO }}>
            <div style={{ fontFamily: ZH, fontSize: 30, color: 'rgba(243,237,226,0.8)' }}>每周 <b style={{ fontFamily: EN, fontSize: 52, color: g ? GOLD : INK }}>{g ? 70 : 56}</b> 小时</div>
            <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.6)', marginTop: 2 }}>造出 <b style={{ fontFamily: EN, fontSize: 40, color: INK }}>{n}</b> 箱炮弹</div>
          </div>
        );
      })}
      <Chapter T={T} at={b(8) + 0.3} out={b(24)} text="1915年 · 英国 · 军工厂" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S1} />
    </AbsoluteFill>
  );
};

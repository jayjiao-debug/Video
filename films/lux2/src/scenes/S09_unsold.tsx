/* S09 · unsold (73.304 – 81.404). The back room: stacks of unsold boxes in depth, a conveyor running diagonally
   into a furnace. The cut lands on the bag riding the belt (matching S08's last frame). 74.065: the furnace
   shutter flies up, orange light floods the room and throws the boxes' shadows toward us; layered flame cut-outs
   (red, orange, a holo tip) flicker on their own clock. 75.584 a gold odometer above the mouth starts to roll;
   it lands on £ 28,600,000 exactly on 77.356 as the bag goes in. 79.384 (pre-drop gap): every light dies; only
   embers drift up in the dark until the drop. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, easeIn, impulse, slam, clamp } from '../scene';
import { HeroBag, Cut, rect, circle, archFrame, ring } from '../foil';
import { Backdrop, MirrorFloor, Word } from '../kit';
import { useGlow, useHolo, Box, CutM, wob, Caption, rectHole, velvet, radialTex } from './S06_lib';
import { Spot, DIAMOND } from './S06_waiting';

const PR = 72, PY = 300;
const SHUT = 74.065, ROLL = 75.584, LAND = 77.356, GAP = 79.384;
const FUR: [number, number, number] = [0.35, 0, -0.72];        // furnace front plate (local)
const MOUTH = { w: 520, h: 560, y: 100 };                        // px: opening width, height, sill height
const YAW = 0.616, BELT_END: [number, number, number] = [0.3, 0, -0.6], SPEED = 0.25;
/* belt items: local x along the belt at film time T (0 = the furnace mouth) */
const itemX = (x0: number, T: number) => x0 + SPEED * (T - 73.304);

const plate = () => rect(-480, -1250, 960, 1250) + ' ' + `M ${MOUTH.w / 2} ${-MOUTH.y} L ${MOUTH.w / 2} ${-MOUTH.y - MOUTH.h + MOUTH.w / 2} A ${MOUTH.w / 2} ${MOUTH.w / 2} 0 0 0 ${-MOUTH.w / 2} ${-MOUTH.y - MOUTH.h + MOUTH.w / 2} L ${-MOUTH.w / 2} ${-MOUTH.y} Z`;
/* the odometer: £ 2 8 , 6 0 0 , 0 0 0 */
const GLYPHS = ['£', 'd', 'd', ',', 'd', 'd', 'd', ',', 'd', 'd', 'd'];
const GW = (g: string) => (g === ',' ? 24 : g === '£' ? 64 : 58);
const LAYOUT = (() => { let x = 0; const out = GLYPHS.map((g) => { const c = x + GW(g) / 2; x += GW(g) + 4; return c; }); const W = x - 4; return out.map((c) => c - W / 2); })();
const DIGITS = GLYPHS.map((g, i) => (g === 'd' ? i : -1)).filter((i) => i >= 0);   // 8 wheels, most significant first
const PLATE_W = 760, PLATE_H = 290, WIN_H = 94;
const counterPlate = () => [rect(-PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H), ...DIGITS.map((i) => rectHole(LAYOUT[i] - 26, -WIN_H / 2, 52, WIN_H))].join(' ');
const counterFrame = () => rect(-PLATE_W / 2 - 8, -PLATE_H / 2 - 8, PLATE_W + 16, PLATE_H + 16) + ' ' + rectHole(-PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H);
const winFrames = () => DIGITS.map((i) => rect(LAYOUT[i] - 28.5, -WIN_H / 2 - 2.5, 57, WIN_H + 5) + ' ' + rectHole(LAYOUT[i] - 26, -WIN_H / 2, 52, WIN_H)).join(' ');
const PITCH = 0.1;

/* flames: four paper-cut flame CARDS (one continuous silhouette each), every card has 4 cut variants that swap
   like stop-motion paper puppetry, on their own clock */
let rs = 11; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
const flameCard = (W: number, h0: number, aMin: number, aMax: number, n: number) => {
  const peaks = Array.from({ length: n }, () => ({ c: (rnd() - 0.5) * W * 0.92, w: 40 + rnd() * 70, a: aMin + rnd() * (aMax - aMin), lean: (rnd() - 0.5) * 30 }));
  const pts: string[] = [];
  for (let x = -W / 2; x <= W / 2 + 0.1; x += 5) {
    const e = Math.sqrt(Math.max(0, 1 - Math.pow((2 * x) / W, 4)));
    let y = h0; for (const p of peaks) { const d = Math.abs(x - p.c - p.lean * 0.3); if (d < p.w) y += p.a * Math.pow(1 - d / p.w, 1.9); }
    pts.push(`${x.toFixed(1)} ${(-y * e).toFixed(1)}`);
  }
  return `M ${-W / 2} 0 L ${pts.join(' L ')} L ${W / 2} 0 Z`;
};
const LAYERS = [
  { z: -0.12, W: 560, h0: 140, a: [180, 380], n: 8, kind: 'glow' as const, color: '#c2200a', k: 0.9 },
  { z: -0.09, W: 540, h0: 100, a: [120, 300], n: 10, kind: 'glow' as const, color: '#ff5a14', k: 1.0 },
  { z: -0.065, W: 520, h0: 70, a: [90, 220], n: 10, kind: 'glow' as const, color: '#ff9a2a', k: 1.15 },
  { z: -0.05, W: 480, h0: 30, a: [50, 140], n: 7, kind: 'holo' as const, color: '#ffffff', k: 0 },
  { z: -0.035, W: 500, h0: 40, a: [40, 110], n: 12, kind: 'glow' as const, color: '#ffd870', k: 1.5 },
].map((L) => ({ ...L, cards: Array.from({ length: 4 }, () => flameCard(L.W, L.h0, L.a[0], L.a[1], L.n)) }));

const EMBERS = Array.from({ length: 34 }, (_, i) => { const h = (k: number) => { const s = Math.sin((i + 1) * (k + 7) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  return { x: (h(1) - 0.5) * 0.5, z: (h(2) - 0.5) * 0.12, v: 0.04 + h(3) * 0.07, ph: h(4), s: 0.6 + h(5) * 1.2, sw: h(6) * 6 }; });

const StackBox: React.FC<{ w: number; h: number; d: number; crimson?: boolean; dia?: boolean } & JSX.IntrinsicElements['group']> = ({ w, h, d, crimson, dia, ...g }) => (
  <group {...g}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={velvet(crimson ? '#5a0a16' : '#0d0907')}><boxGeometry args={[w, h, d]} /></mesh>
    <Cut d={rect(-w * 500, -h * 1000 + 3, w * 1000, 3) + ' ' + rect(-w * 500, -h * 1000 * 0.78, w * 1000, 2)} kind="gold" position={[0, 0, d / 2 + 0.0005]} depth={0.0008} bevel={0} shadow={false} />
    {dia && <Cut d={DIAMOND(Math.min(w, h) * 110)} kind="gold" position={[0, h * 0.4, d / 2 + 0.001]} depth={0.0012} bevel={0.0003} />}
  </group>
);
const stack = (x: number, z: number, n: number, seed: number, crim = -1) => Array.from({ length: n }, (_, i) => {
  const h = (k: number) => { const s = Math.sin((i + 1) * (k + seed) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  return { x: x + (h(1) - 0.5) * 0.04, z: z + (h(2) - 0.5) * 0.03, w: 0.2 + h(3) * 0.12, hh: 0.09 + h(4) * 0.06, d: 0.16 + h(5) * 0.08, r: (h(6) - 0.5) * 0.12, crimson: i === crim || h(8) > 0.8, dia: true };
}).reduce<{ y: number; out: JSX.Element[] }>((acc, b, i) => {
  acc.out.push(<StackBox key={`${seed}-${i}`} w={b.w} h={b.hh} d={b.d} crimson={b.crimson} dia={b.dia} position={[b.x, acc.y, b.z]} rotation={[0, b.r, 0]} />);
  acc.y += b.hh; return acc;
}, { y: 0, out: [] }).out;

const Set: React.FC<{ T: number }> = ({ T }) => {
  const open = easeOut(prog(T, SHUT, SHUT + 0.38));
  const dead = easeOut(prog(T, GAP, GAP + 0.18));                  // the gap: everything dies
  const surge = impulse(T, SHUT, 0.5);
  const build = easeIn(prog(T, GAP + 0.3, 81.4));                  // the gap builds: glow and embers grow into the drop
  const fire = (0.55 + 0.45 * open) * (1 - dead);
  const flameH = fire * (1 + 0.25 * surge) + 0.18 * dead * (1 - build) + 0.45 * build * dead;
  const flick = 0.85 + 0.15 * wob(T * 2.2, 3);
  const rollU = prog(T, ROLL, LAND), value = 28600000 * (1 - Math.pow(1 - rollU, 4));
  const land = slam(T, LAND, 0.1), kick = impulse(T, LAND, 0.25) + 0.6 * impulse(T, SHUT, 0.3);
  const holoTip = useHolo(0.7); (holoTip as THREE.ShaderMaterial).uniforms.k.value = 0.7 * fire;
  const glowM = useMemo(() => LAYERS.map((L) => new THREE.MeshBasicMaterial({ color: new THREE.Color(L.color).multiplyScalar(L.k || 1), toneMapped: false, transparent: true })), []);
  glowM.forEach((m) => { m.opacity = clamp(flameH * 1.2); });
  const inner = useGlow('#6a1606', 1.0); inner.opacity = 0.35 + 0.65 * fire;
  const core = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff8a3a').multiplyScalar(1.6), map: radialTex(), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), []);
  core.opacity = clamp(0.3 * dead + 0.7 * build * dead);
  const hole = useGlow('#ff8a30', 1.6); hole.opacity = 0.85 * (1 - open);
  const leak = useGlow('#ff7a20', 1.6); leak.opacity = (1 - open) * (0.6 + 0.4 * wob(T * 3, 1));
  const ember = useGlow('#ff8a30', 2.2);
  const bx = itemX(-1.05, T);
  const reel = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1c130a' }), []);
  const digitCol = '#f0cf86';
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      {/* ---------- the furnace ---------- */}
      <group position={FUR}>
        <CutM d={plate()} m={velvet('#120a07')} depth={0.02} />
        <Cut d={archFrame(MOUTH.w + 36, MOUTH.h + 18, 18)} kind="gold" position={[0, MOUTH.y / 1000, 0.021]} depth={0.002} bevel={0.0005} />
        {Array.from({ length: 14 }, (_, i) => { const a = Math.PI + (i / 13) * Math.PI; const r = MOUTH.w / 2 + 46; return <Cut key={i} d={circle(0, 0, 6)} kind="gold" position={[Math.cos(a) * r / 1000, (MOUTH.y + MOUTH.h - MOUTH.w / 2) / 1000 - Math.sin(a) * r / 1000, 0.021]} depth={0.003} />; })}
        {[-1, 1].map((s) => <Cut key={s} d={rect(-4, -1250, 8, 1250 - MOUTH.y - MOUTH.h + MOUTH.w / 2 + 40)} kind="gold" position={[s * 0.36, 0, 0.021]} depth={0.001} bevel={0} shadow={false} />)}
        {/* the interior and the fire */}
        <CutM d={rect(-300, -720, 600, 720)} m={inner} position={[0, 0, -0.16]} depth={0.001} bevel={0} shadow={false} />
        {dead > 0 && <mesh material={core} position={[0, 0.16, -0.13]} scale={0.4 + 1.1 * build}><planeGeometry args={[0.7, 0.5]} /></mesh>}
        {LAYERS.map((L, li) => { const v = Math.floor(T * 7.5 + li * 1.7) % 4, sy = Math.max(0.02, flameH * (0.9 + 0.12 * wob(T * (1.4 + li * 0.25), li)));
          return <group key={li} position={[0.01 * wob(T * 0.8, li + 3), MOUTH.y / 1000, L.z]} scale={[1, sy, 1]}>
            <CutM d={L.cards[v]} m={L.kind === 'holo' ? holoTip : glowM[li]} depth={0.001} bevel={0} shadow={false} />
          </group>; })}
        {/* the shutter: hides behind the plate when it flies up */}
        <group position={[0, MOUTH.y / 1000 + open * 0.62, -0.02]}>
          <CutM d={rect(-290, -MOUTH.h - 20, 580, MOUTH.h + 20) + ' ' + `M ${PR} ${-PY} A ${PR} ${PR} 0 1 1 ${-PR} ${-PY} A ${PR} ${PR} 0 1 1 ${PR} ${-PY} Z`} m={velvet('#160d09')} depth={0.006} />
          <Cut d={Array.from({ length: 18 }, (_, i) => rect(-286, -MOUTH.h + i * 32, 572, 2.5)).filter((_, i) => Math.abs(-MOUTH.h + i * 32 + PY) > PR + 14).join(' ')} kind="gold" color="#6a5226" position={[0, 0, 0.0065]} depth={0.0006} bevel={0} shadow={false} />
          <Cut d={ring(0, -PY, PR, PR + 14)} kind="gold" position={[0, 0, 0.007]} depth={0.004} bevel={0.001} />
          {Array.from({ length: 8 }, (_, i) => <Cut key={i} d={circle(Math.cos(i * Math.PI / 4) * (PR + 7), -PY + Math.sin(i * Math.PI / 4) * (PR + 7), 2.5)} kind="gold" position={[0, 0, 0.0115]} depth={0.002} bevel={0} shadow={false} />)}
          <CutM d={circle(0, -PY, PR)} m={hole} position={[0, 0, -0.004]} depth={0.001} bevel={0} shadow={false} />
        </group>
        {open < 0.999 && <CutM d={rect(-260, -6, 520, 6)} m={leak} position={[0, MOUTH.y / 1000 + 0.004, 0.0]} depth={0.001} bevel={0} shadow={false} />}
        {/* embers rising out of the mouth (more of them once the fire is out) */}
        {EMBERS.map((e, i) => { const life = ((T * e.v * (3 + 4 * build) + e.ph) % 1); if (open <= 0) return null;
          const y = MOUTH.y / 1000 + 0.02 + life * (0.55 + 0.35 * dead), a = (1 - life) * (dead > 0 ? 0.7 + 0.8 * build : 0.5);
          return <CutM key={i} d={circle(0, 0, 2.2)} m={ember} position={[e.x + 0.02 * Math.sin(T * 1.3 + e.sw), y, 0.03 + e.z]} scale={e.s * a + 0.001} depth={0.0005} bevel={0} shadow={false} />; })}
        {/* the odometer above the mouth */}
        <group position={[0, 0.9, 0.024]}>
          <CutM d={counterPlate()} m={velvet('#0e0907')} depth={0.008} />
          <Cut d={counterFrame()} kind="gold" position={[0, 0, 0.0085]} depth={0.002} bevel={0.0005} />
          <Cut d={winFrames()} kind="gold" position={[0, 0, 0.0085]} depth={0.0012} bevel={0} shadow={false} />
          {DIGITS.map((gi) => <mesh key={'r' + gi} material={reel} position={[LAYOUT[gi] / 1000, 0, -0.016]}><planeGeometry args={[0.054, 0.098]} /></mesh>)}
          {dead < 0.6 && GLYPHS.map((g, i) => g === 'd' ? null : <Word key={i} text={g} size={g === ',' ? 0.1 : 0.11} kind="cream" color={g === ',' ? digitCol : '#f0cf86'} position={[LAYOUT[i] / 1000, g === ',' ? -0.022 : 0.0, 0.014]} />)}
          {dead < 0.6 && DIGITS.map((gi, k) => {
            const place = 10 ** (7 - k), v = (value / place) % 10, d0 = Math.floor(v), lower = value % place, f = place === 1 ? v - d0 : Math.min(1, Math.max(0, lower - (place - 1))), dd = (d0 + 1) % 10;
            const fr = T >= LAND ? 0 : f;
            return <group key={gi} position={[LAYOUT[gi] / 1000, 0, -0.012]}>
              <Word text={String(T >= LAND ? Math.floor(28600000 / place + 1e-6) % 10 : d0)} size={0.118} kind="cream" color={digitCol} position={[0, fr * PITCH, 0]} />
              {fr > 0.01 && <Word text={String(dd)} size={0.118} kind="cream" color={digitCol} position={[0, (fr - 1) * PITCH, 0]} />}
            </group>;
          })}
        </group>
      </group>

      {/* ---------- the conveyor, running diagonally into the mouth ---------- */}
      <group position={BELT_END} rotation={[0, YAW, 0]}>
        <Box w={1.75} h={0.03} d={0.24} position={[-0.8, 0.085, 0]} color="#09080d" />
        {[-1, 1].map((s) => <Box key={s} w={1.75} h={0.012} d={0.006} kind="gold" position={[-0.8, 0.11, s * 0.123]} />)}
        {[-1.55, -1.1, -0.65, -0.2].map((x) => <Box key={x} w={0.012} h={0.085} d={0.2} kind="gold" position={[x, 0, 0]} />)}
        {/* belt slats moving */}
        {Array.from({ length: 22 }, (_, i) => { const x = -1.66 + ((i * 0.08 + SPEED * T) % 1.76); return <Box key={i} w={0.004} h={0.001} d={0.22} kind="gold" color="#7a5e2c" position={[x, 0.1155, 0]} />; })}
        {/* the boxes and the bag on the belt */}
        {[-1.95, -1.55, -0.62, -0.25].map((x0, i) => { const x = itemX(x0, T); if (x < -1.68 || x > 0.22) return null;
          return <StackBox key={i} w={0.17} h={0.1} d={0.13} crimson={i === 2} dia position={[x, 0.116, 0]} rotation={[0, 0.0, 0]} />; })}
        {bx < 0.2 && <HeroBag position={[bx, 0.116, 0.01]} scale={0.78} swing={2 * Math.sin(T * 2.1)} />}
      </group>

      {/* ---------- the stacks of unsold stock, in depth ---------- */}
      {stack(-0.8, -0.95, 6, 3, 2)}
      {stack(-0.42, -1.15, 7, 5)}
      {stack(1.0, -0.6, 5, 8, 1)}
      {stack(1.12, -1.05, 7, 13)}
      {stack(-1.05, 0.5, 3, 17)}
      {stack(0.95, 0.35, 2, 21, 0)}

      {/* light: a dim key; the fire as a second shadow light out of the mouth; the gap kills them all */}
      <Spot p={[-0.2, 2.4, 1.1]} at={[0.0, 0.3, -0.3]} angle={0.55} i={(7 + 3 * kick) * (1 - dead)} color="#ffdcb8" shadow />
      <Spot p={[0.38, 0.38, -0.82]} at={[-0.4, 0.12, 0.6]} angle={1.1} i={(6 + 14 * open + 5 * surge + 4 * kick) * (1 - dead) * flick + 6 * build * dead} color="#ff7a2c" shadow pen={0.6} />
      <pointLight position={[0.35, 0.45, -0.45]} intensity={(0.6 + 1.8 * open) * (1 - dead) * flick + 1.2 * build * dead} distance={3} color="#ff6a20" decay={2} />
      <Spot p={[2.4, 1.4, 1.0]} at={[0.6, 0.5, -0.6]} angle={0.45} i={3 * (1 - dead)} color="#ffb070" pen={0.9} />
      <ambientLight intensity={(0.03 + 0.04 * open) * (1 - dead)} color="#ffb080" />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => <Caption T={T} t0={77.6} t1={81.2} text="同年9月，博柏利宣布停止销毁" />;

export const S09: SceneDef = {
  id: 'S09_unsold', t0: 73.304, t1: 81.404, x: 112, enter: 'cut', Set, Overlay, env: 0.2,
  keys: [
    { t: 73.304, pos: [0.35, 0.4, 0.2], look: [0.35, 0.39, -0.72], fov: 33, ap: 0.006, bloom: 0.8 },
    { t: 74.0, pos: [0.35, 0.4, 0.1], look: [0.35, 0.39, -0.72], fov: 33, ap: 0.006, bloom: 0.8 },
    { t: 74.75, pos: [0.0, 0.52, 1.0], look: [0.15, 0.36, -0.5], fov: 35, ap: 0.004, bloom: 0.85 },
    { t: 75.329, pos: [-0.2, 0.5, 1.12], look: [-0.05, 0.32, -0.32], fov: 35, ap: 0.004, bloom: 0.8 },
    { t: 76.4, pos: [-0.12, 0.62, 1.3], look: [0.1, 0.42, -0.45], fov: 35, ap: 0.004, bloom: 0.8 },
    { t: LAND, pos: [0.22, 0.95, 1.45], look: [0.35, 0.46, -0.7], fov: 35, ap: 0.004, bloom: 0.85 },
    { t: GAP, pos: [0.27, 0.88, 1.1], look: [0.35, 0.42, -0.7], fov: 35, ap: 0.004, bloom: 0.85 },
    { t: 81.38, pos: [0.35, 0.46, -0.1], look: [0.35, 0.36, -0.75], fov: 33, ap: 0.006, bloom: 1.1 },
  ],
  lines: [
    { t: 73.4, end: 76.9, text: '卖不掉的呢？宁可销毁，也不打折。' },
    { t: 77.4, end: 81.2, text: '2018年，博柏利销毁了2860万英镑存货。' },
  ],
  hits: [[SHUT, 0.4], [LAND, 0.7]],
};

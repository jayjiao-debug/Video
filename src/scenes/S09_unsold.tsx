/* S09 · unsold (73.304 – 81.404). The back room: stacks of unsold boxes in depth, a conveyor running diagonally
   into a furnace. The cut lands on the bag riding the belt (matching S08's last frame). 74.065: the furnace
   shutter flies up, orange light floods the room and throws the boxes' shadows toward us; layered flame cut-outs
   (red, orange, a holo tip) flicker on their own clock. 75.584 a gold odometer above the mouth starts to roll;
   it lands on £ 28,600,000 exactly on 77.356 as the bag goes in. 79.384 (pre-drop gap): every light dies; only
   embers drift up in the dark until the drop. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { prog, easeOut, impulse, slam } from '../scene';
import { HeroBag, Cut, rect, circle, archFrame } from '../foil';
import { Backdrop, MirrorFloor, Word } from '../kit';
import { useGlow, useHolo, Box, CutM, flame, wob, Caption, rectHole } from './S06_lib';
import { Spot, DIAMOND } from './S06_waiting';

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

/* flames: three layers of tongues */
let rs = 11; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
const LAYERS = [
  { z: -0.11, n: 9, w: [80, 140], h: [240, 560], kind: 'glow' as const, color: '#ff3a0c', k: 0.7 },
  { z: -0.075, n: 11, w: [50, 95], h: [150, 420], kind: 'glow' as const, color: '#ff8a20', k: 1.0 },
  { z: -0.045, n: 7, w: [28, 55], h: [90, 260], kind: 'holo' as const, color: '#ffffff', k: 0 },
  { z: -0.03, n: 9, w: [26, 55], h: [50, 150], kind: 'glow' as const, color: '#ffd560', k: 1.4 },
].map((L, li) => ({ ...L, tongues: Array.from({ length: L.n }, (_, i) => ({
  x: -230 + (460 * (i + 0.5)) / L.n + (rnd() - 0.5) * 50, d: flame(L.w[0] + rnd() * (L.w[1] - L.w[0]), L.h[0] + rnd() * (L.h[1] - L.h[0]), (rnd() - 0.5) * 110), seed: li * 10 + i })) }));

const EMBERS = Array.from({ length: 34 }, (_, i) => { const h = (k: number) => { const s = Math.sin((i + 1) * (k + 7) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  return { x: (h(1) - 0.5) * 0.5, z: (h(2) - 0.5) * 0.12, v: 0.04 + h(3) * 0.07, ph: h(4), s: 0.6 + h(5) * 1.2, sw: h(6) * 6 }; });

const StackBox: React.FC<{ w: number; h: number; d: number; crimson?: boolean; dia?: boolean } & JSX.IntrinsicElements['group']> = ({ w, h, d, crimson, dia, ...g }) => (
  <group {...g}>
    <Box w={w} h={h} d={d} kind={crimson ? 'lacquer' : 'black'} color={crimson ? '#5a0614' : undefined} />
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
  const fire = open * (1 - dead);
  const flick = 0.85 + 0.15 * wob(T * 2.2, 3);
  const rollU = prog(T, ROLL, LAND), value = 28600000 * (1 - Math.pow(1 - rollU, 4));
  const land = slam(T, LAND, 0.1), kick = impulse(T, LAND, 0.25) + 0.6 * impulse(T, SHUT, 0.3);
  const holoTip = useHolo(0.9); (holoTip as THREE.ShaderMaterial).uniforms.k.value = 0.9 * fire;
  const glowM = useMemo(() => LAYERS.map((L) => new THREE.MeshBasicMaterial({ color: new THREE.Color(L.color).multiplyScalar(L.k || 1), toneMapped: false, transparent: true })), []);
  glowM.forEach((m) => { m.opacity = fire; });
  const inner = useGlow('#5a1004', 1.0); inner.opacity = 0.2 * (1 - dead) + 0.8 * fire;
  const leak = useGlow('#ff7a20', 1.6); leak.opacity = (1 - open) * (0.6 + 0.4 * wob(T * 3, 1));
  const ember = useGlow('#ff8a30', 2.2);
  const bx = itemX(-1.05, T);
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      {/* ---------- the furnace ---------- */}
      <group position={FUR}>
        <Cut d={plate()} kind="black" depth={0.02} />
        <Cut d={archFrame(MOUTH.w + 36, MOUTH.h + 18, 18)} kind="gold" position={[0, MOUTH.y / 1000, 0.021]} depth={0.002} bevel={0.0005} />
        {Array.from({ length: 14 }, (_, i) => { const a = Math.PI + (i / 13) * Math.PI; const r = MOUTH.w / 2 + 46; return <Cut key={i} d={circle(0, 0, 6)} kind="gold" position={[Math.cos(a) * r / 1000, (MOUTH.y + MOUTH.h - MOUTH.w / 2) / 1000 - Math.sin(a) * r / 1000, 0.021]} depth={0.003} />; })}
        {[-1, 1].map((s) => <Cut key={s} d={rect(-4, -1250, 8, 1250 - MOUTH.y - MOUTH.h + MOUTH.w / 2 + 40)} kind="gold" position={[s * 0.36, 0, 0.021]} depth={0.001} bevel={0} shadow={false} />)}
        {/* the interior and the fire */}
        <CutM d={rect(-300, -720, 600, 720)} m={inner} position={[0, 0, -0.16]} depth={0.001} bevel={0} shadow={false} />
        {LAYERS.map((L, li) => <group key={li} position={[0, MOUTH.y / 1000, L.z]}>
          {L.tongues.map((tg) => { const sy = Math.max(0.02, fire * (0.72 + 0.32 * (0.5 + 0.5 * wob(T * (1.6 + li * 0.3), tg.seed)))); return (
            <group key={tg.seed} position={[tg.x / 1000, 0, 0]} rotation={[0, 0, 0.09 * wob(T * 1.1, tg.seed + 4)]} scale={[1 + 0.08 * wob(T * 2.3, tg.seed + 9), sy, 1]}>
              <CutM d={tg.d} m={L.kind === 'holo' ? holoTip : glowM[li]} depth={0.001} bevel={0} shadow={false} />
            </group>); })}
        </group>)}
        {/* the shutter: hides behind the plate when it flies up */}
        <group position={[0, MOUTH.y / 1000 + open * 0.62, -0.02]}>
          <Cut d={rect(-290, -MOUTH.h - 20, 580, MOUTH.h + 20)} kind="black" color="#121018" depth={0.006} />
          <Cut d={Array.from({ length: 18 }, (_, i) => rect(-286, -MOUTH.h + i * 32, 572, 2.5)).join(' ')} kind="gold" color="#6a5226" position={[0, 0, 0.0065]} depth={0.0006} bevel={0} shadow={false} />
        </group>
        {open < 0.999 && <CutM d={rect(-260, -6, 520, 6)} m={leak} position={[0, MOUTH.y / 1000 + 0.004, 0.0]} depth={0.001} bevel={0} shadow={false} />}
        {/* embers rising out of the mouth (more of them once the fire is out) */}
        {EMBERS.map((e, i) => { const life = ((T * e.v * 3 + e.ph) % 1); const show = open > 0 ? 1 : 0; if (!show) return null;
          const y = MOUTH.y / 1000 + 0.02 + life * (0.55 + 0.25 * dead), a = (1 - life) * (dead > 0 ? 1 : 0.5);
          return <CutM key={i} d={circle(0, 0, 2.2)} m={ember} position={[e.x + 0.02 * Math.sin(T * 1.3 + e.sw), y, 0.03 + e.z]} scale={e.s * a + 0.001} depth={0.0005} bevel={0} shadow={false} />; })}
        {/* the odometer above the mouth */}
        <group position={[0, 0.9, 0.024]}>
          <Cut d={counterPlate()} kind="black" color="#08070c" depth={0.008} />
          <Cut d={counterFrame()} kind="gold" position={[0, 0, 0.0085]} depth={0.002} bevel={0.0005} />
          <Cut d={winFrames()} kind="gold" color="#b8913f" position={[0, 0, 0.0085]} depth={0.0012} bevel={0} shadow={false} />
          {dead < 0.6 && GLYPHS.map((g, i) => g === 'd' ? null : <Word key={i} text={g} size={g === ',' ? 0.07 : 0.11} kind="gold" position={[LAYOUT[i] / 1000, g === ',' ? -0.034 : 0.0, 0.012]} />)}
          {dead < 0.6 && DIGITS.map((gi, k) => {
            const place = 10 ** (7 - k), v = (value / place) % 10, d0 = Math.floor(v), lower = value % place, f = place === 1 ? v - d0 : Math.min(1, Math.max(0, lower - (place - 1))), dd = (d0 + 1) % 10;
            const fr = T >= LAND ? 0 : f;
            return <group key={gi} position={[LAYOUT[gi] / 1000, 0, -0.012]}>
              <Word text={String(T >= LAND ? Math.floor(28600000 / place + 1e-6) % 10 : d0)} size={0.118} kind="gold" position={[0, fr * PITCH, 0]} />
              {fr > 0.01 && <Word text={String(dd)} size={0.118} kind="gold" position={[0, (fr - 1) * PITCH, 0]} />}
            </group>;
          })}
          <pointLight position={[0, 0, -0.004]} intensity={(0.05 + 0.12 * land + 0.15 * impulse(T, LAND, 0.3)) * (1 - dead * 0.85)} distance={0.6} color="#ffd9a0" decay={2} />
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
      <Spot p={[-0.2, 2.4, 1.1]} at={[0.0, 0.3, -0.3]} angle={0.5} i={(5 + 2 * kick) * (1 - dead)} color="#ffdcb8" shadow />
      <Spot p={[0.38, 0.35, -0.82]} at={[-0.4, 0.12, 0.6]} angle={1.0} i={(10 + 5 * kick) * fire * flick} color="#ff7a2c" shadow pen={0.6} />
      <pointLight position={[0.35, 0.4, -0.5]} intensity={0.9 * fire * flick} distance={2.5} color="#ff6a20" decay={2} />
      <Spot p={[2.4, 1.2, 1.0]} at={[0.6, 0.6, -0.6]} angle={0.4} i={(0.8 + 1.4 * open) * (1 - dead)} color="#29e6ff" pen={0.9} />
      <Spot p={[-2.4, 1.2, 1.0]} at={[-0.3, 0.4, -0.4]} angle={0.5} i={3 * (1 - dead)} color="#ff3ec8" pen={0.9} />
      <ambientLight intensity={0.012 * (1 - dead)} />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => <Caption T={T} t0={77.6} t1={81.2} text="同年9月，博柏利宣布停止销毁" />;

export const S09: SceneDef = {
  id: 'S09_unsold', t0: 73.304, t1: 81.404, x: 112, enter: 'cut', Set, Overlay, env: 0.2,
  keys: [
    { t: 73.304, pos: [-0.36, 0.42, 1.42], look: [-0.42, 0.27, -0.25], fov: 34, ap: 0.004, bloom: 0.7 },
    { t: 75.5, pos: [-0.5, 0.42, 0.72], look: [-0.08, 0.3, -0.38], fov: 33, ap: 0.006, bloom: 0.8 },
    { t: LAND, pos: [0.08, 0.6, 0.8], look: [0.34, 0.66, -0.7], fov: 34, ap: 0.005, bloom: 0.85 },
    { t: GAP, pos: [0.18, 0.6, 0.6], look: [0.35, 0.62, -0.7], fov: 34, ap: 0.005, bloom: 0.85 },
    { t: 81.38, pos: [0.3, 0.45, 0.25], look: [0.36, 0.34, -0.72], fov: 33, ap: 0.008, bloom: 0.9 },
  ],
  lines: [
    { t: 73.4, end: 76.9, text: '卖不掉的呢？宁可销毁，也不打折。' },
    { t: 77.4, end: 81.2, text: '2018年，博柏利销毁了2860万英镑存货。' },
  ],
  hits: [[SHUT, 0.4], [LAND, 0.7]],
};

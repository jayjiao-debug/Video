/* S05 · queue (32.806 – 40.907). Hard match cut on the A hit: S04's stepped blueprint arch becomes the stepped
   gold arch of a deco boutique door (same size, same place in frame, ◆ keystone). A velvet rope is closed across
   the red runner; a doorman stands by it. The camera pulls back and cranes up over the shopfront to reveal a long
   queue of still black paper silhouettes along the lit display windows, swoops down to the far end of the line
   and trucks along it toward the door (rope and stanchions sliding past in front, figures in depth behind,
   their long shadows thrown by the light pouring out of the door). 37.616: one warm pulse from the doorway. */
import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { impulse, prog, easeOut } from '../scene';
import { HeroBag, Cut, rect, circle, archFrame, cutGeo } from '../foil';
import { Backdrop, MirrorFloor } from '../kit';
import { Spot, Caption, hash } from './S03_parts';

/* S05 materials see a WARM environment of their own: the shared club env has a cyan strip on the +x side, and looking
   down the shopfront every grazing gold/velvet surface mirrored it as teal. A material's own envMap overrides the scene's. */
const warm = { t: null as THREE.Texture | null };
const warmEnv = (gl: THREE.WebGLRenderer) => {
  if (warm.t) return warm.t;
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#000');
  const strip = (w: number, h: number, pos: [number, number, number], rot: [number, number, number], col: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); sc.add(m); };
  strip(6, 1.2, [0, 4, 0], [Math.PI / 2, 0, 0], '#fff2dc', 2.0);
  strip(0.6, 4, [-3.2, 1.6, 0.8], [0, Math.PI / 2.3, 0], '#ffb070', 2.2);
  strip(0.6, 4, [3.2, 1.6, 0.8], [0, -Math.PI / 2.3, 0], '#ffd29a', 2.2);
  strip(4, 0.5, [0, 0.4, 3.6], [0, Math.PI, 0], '#ffc860', 2.6);
  strip(3, 0.6, [0, 2.4, -3.6], [0, 0, 0], '#b07040', 1.6);
  strip(10, 10, [0, -3, 0], [Math.PI / 2, 0, 0], '#1a1008', 1);
  const pm = new THREE.PMREMGenerator(gl); warm.t = pm.fromScene(sc, 0.015).texture; pm.dispose(); return warm.t;
};
const mc = new Map<string, THREE.MeshPhysicalMaterial>();
const plainGold = (c = '#e8b860') => mc.get('g' + c) ?? (mc.set('g' + c, new THREE.MeshPhysicalMaterial({ color: c, metalness: 1, roughness: 0.28, clearcoat: 0.3, envMap: warm.t, envMapIntensity: 1 })), mc.get('g' + c)!);
const velvet2 = (c = '#0b0a10') => mc.get('v' + c) ?? (mc.set('v' + c, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color('#6a4a30'), sheenRoughness: 0.5, envMap: warm.t, envMapIntensity: 0.6 })), mc.get('v' + c)!);
const WarmEnv: React.FC = () => { const { gl } = useThree(); const t = warmEnv(gl); if (velvet.envMap !== t) { velvet.envMap = t; velvet.needsUpdate = true; } return null; };
const MCut: React.FC<{ d: string; m: THREE.Material; depth?: number; bevel?: number; shadow?: boolean } & JSX.IntrinsicElements['group']> = ({ d, m, depth, bevel, shadow = true, ...g }) => {
  const geo = useMemo(() => cutGeo(d, depth, bevel), [d, depth, bevel]);
  return <group {...g}><mesh geometry={geo} material={m} castShadow={shadow} receiveShadow={shadow} /></group>;
};
const GCut: React.FC<{ d: string; color?: string; depth?: number; bevel?: number; shadow?: boolean } & JSX.IntrinsicElements['group']> = ({ color, ...p }) => <MCut m={plainGold(color)} {...p} />;
const BCut: React.FC<{ d: string; color?: string; depth?: number; bevel?: number; shadow?: boolean } & JSX.IntrinsicElements['group']> = ({ color, ...p }) => <MCut m={velvet2(color)} {...p} />;

const PULSE = 37.616;
/* door geometry = S04's arch × F (R 0.31, spring 0.64, echoes +0.045/+0.09/+0.135) */
const F = 0.6, DX = 0.9, FZ = -0.55;
const R = 0.31 * F, SPR = 0.64 * F;
const archSolid = (w: number, spr: number) => { const r = w / 2; return `M ${-r} 0 L ${-r} ${-spr} A ${r} ${r} 0 0 1 ${r} ${-spr} L ${r} 0 Z`; };
/** an arch frame of a given outer half-width (mm) over a fixed spring line (so all arches share it, like S04) */
const archRing = (rOut: number, t: number, spr: number) => archFrame(rOut * 2, spr + rOut, t);

/* ---------------------------------------------------------------- people (profile, facing +x), mm, feet at y = 0
   fashion-plate silhouettes: one smooth outline each (face profile, sloped shoulders, coat, legs, shoes) + add-ons */
const WOMAN = 'M -12 0 L -14 -10 Q -17 -70 -15 -128 L -34 -132 Q -40 -220 -33 -300 Q -32 -346 -24 -366 Q -18 -378 -10 -381 L -10 -390 Q -28 -394 -27 -418 Q -25 -446 2 -447 Q 24 -446 25 -424 L 31 -412 L 25 -408 L 26 -401 L 21 -396 Q 16 -391 10 -389 L 11 -379 Q 28 -373 30 -352 Q 33 -300 27 -250 Q 36 -200 38 -132 L 16 -128 Q 13 -70 17 -14 L 34 -6 L 33 0 Z';
const MAN = 'M -16 0 L -18 -10 Q -20 -80 -18 -150 L -40 -154 Q -44 -240 -40 -320 Q -40 -360 -32 -372 Q -22 -382 -12 -384 L -12 -394 Q -27 -398 -26 -420 Q -24 -448 2 -449 Q 25 -448 26 -426 L 30 -413 L 25 -410 L 26 -403 L 22 -398 Q 17 -392 11 -390 L 12 -382 Q 32 -378 36 -356 Q 40 -300 34 -240 Q 40 -200 40 -154 L 20 -150 Q 18 -80 20 -14 L 38 -6 L 37 0 Z';
type Who = { h: number; man?: boolean; hat?: boolean; bun?: boolean; pony?: boolean; long?: boolean; bag?: 'hand' | 'tote'; phone?: boolean };
const parts = (p: Who): string[] => {
  const out = [p.man ? MAN : WOMAN];
  if (p.hat) out.push(rect(-42, -440, 86, 7), 'M -24 -440 L -20 -472 Q 2 -478 24 -472 L 28 -440 Z');
  if (p.bun) out.push(circle(-24, -432, 14));
  if (p.long) out.push('M -27 -420 Q -38 -380 -32 -336 L -14 -348 Q -18 -380 -12 -394 Z');
  if (p.pony) out.push('M -22 -428 Q -52 -404 -42 -350 Q -30 -384 -14 -410 Z');
  if (p.bag === 'hand') out.push('M 18 -246 Q 34 -276 50 -246 L 46 -246 Q 34 -268 22 -246 Z', rect(14, -246, 44, 32));
  if (p.bag === 'tote') out.push('M -30 -356 L -36 -350 L -58 -262 L -18 -262 L -24 -330 Z');
  if (p.phone) out.push('M 14 -364 L 26 -370 L 52 -438 L 42 -444 Z');
  return out;
};
const QUEUE: Who[] = Array.from({ length: 15 }, (_, i) => {
  const man = [1, 4, 6, 9, 12].includes(i);
  return { h: (man ? 455 : 425) + (hash(i, 1) - 0.5) * 40, man, hat: man && i % 2 === 0, bun: !man && i % 3 === 0, pony: !man && i % 3 === 1, long: !man && i % 3 === 2,
    bag: !man && i % 2 === 0 ? 'hand' : i === 7 || i === 11 ? 'tote' : undefined, phone: i === 3 || i === 10 };
});
const Person: React.FC<{ who: Who; flip?: boolean } & JSX.IntrinsicElements['group']> = ({ who, flip, ...g }) => {
  const ps = useMemo(() => parts(who), [who]);
  return (
    <group {...g}>
      <group scale={[(flip ? -1 : 1) * who.h / 440, who.h / 440, 1]}>
        {ps.map((d, i) => <BCut key={i} d={d} color="#07060b" depth={0.004} bevel={0.0014} />)}
        {/* gilt edge on the side that faces the door light: a gold copy just behind, nudged toward the door */}
        {ps.map((d, i) => <GCut key={'g' + i} d={d} depth={0.002} bevel={0} position={[0.0028, 0.0012, -0.003]} shadow={false} />)}
        {who.phone && <mesh position={[0.05, 0.445, 0.006]} rotation={[0, 0, -0.4]}><planeGeometry args={[0.014, 0.024]} /><meshBasicMaterial color={new THREE.Color('#d6ecff').multiplyScalar(1.0)} toneMapped={false} /></mesh>}
      </group>
    </group>
  );
};

/* ---------------------------------------------------------------- rope line */
const POSTS = Array.from({ length: 11 }, (_, i) => 0.6 - i * 0.34);
const ROPE_Z = 0.2, POST_H = 0.17;
const ropeGeo = (a: [number, number, number], b: [number, number, number], sag = 0.045) => {
  const pts = Array.from({ length: 17 }, (_, i) => { const u = i / 16; return new THREE.Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u); });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0042, 8, false);
};
const Post: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 0.004, 0]} material={plainGold('#e8b860')} castShadow><cylinderGeometry args={[0.026, 0.03, 0.008, 24]} /></mesh>
    <mesh position={[0, POST_H / 2, 0]} material={plainGold('#e8b860')} castShadow><cylinderGeometry args={[0.0065, 0.0065, POST_H, 12]} /></mesh>
    <mesh position={[0, POST_H + 0.01, 0]} material={plainGold('#e8b860')} castShadow><sphereGeometry args={[0.014, 16, 12]} /></mesh>
  </group>
);
const velvet = new THREE.MeshPhysicalMaterial({ color: '#4a0612', roughness: 0.7, sheen: 1, sheenColor: new THREE.Color('#c0283c'), sheenRoughness: 0.5 });
const RopeLine: React.FC = () => {
  const geos = useMemo(() => [
    ...POSTS.slice(0, -1).map((x, i) => ropeGeo([x, POST_H, ROPE_Z], [POSTS[i + 1], POST_H, ROPE_Z])),
    ropeGeo([DX - 0.2, POST_H, -0.18], [DX + 0.2, POST_H, -0.18], 0.035),
  ], []);
  return (
    <group>
      {POSTS.map((x) => <Post key={x} x={x} z={ROPE_Z} />)}
      <Post x={DX - 0.2} z={-0.18} /><Post x={DX + 0.2} z={-0.18} />
      {geos.map((g, i) => <mesh key={i} geometry={g} material={velvet} castShadow />)}
    </group>
  );
};

/* ---------------------------------------------------------------- the facade */
const WINDOWS = [1.62, 2.42, 3.22, 4.02, 0.2, -0.62, -1.44, -2.26];
const LW = R - 0.013; // each door leaf (inner opening half-width)
const frameP = (x: number, y: number, w: number, h: number, t: number) => `${rect(x, y, w, h)} M ${x + t} ${y + t} L ${x + t} ${y + h - t} L ${x + w - t} ${y + h - t} L ${x + w - t} ${y + t} Z`;
const CHAMP = '#f7d7a8';
const Facade: React.FC<{ glow: number; door: number; open: number }> = ({ glow, door, open }) => (
  <group position={[0, 0, FZ]}>
    <BCut d={rect(-3400, -1250, 11000, 1250)} color="#0b0a10" depth={0.01} />
    {/* the upper storeys right of the crown: black, so the street beyond reads as night (and hides the stage gap) */}
    <BCut d={rect(1250, -3200, 6400, 1960)} color="#07060a" depth={0.01} position={[0, 0, -0.01]} shadow={false} />
    <BCut d={rect(-3400, -3200, 2900, 1960)} color="#07060a" depth={0.01} position={[0, 0, -0.01]} shadow={false} />
    <GCut d={rect(-3400, -1252, 11000, 12)} depth={0.014} position={[0, 0, 0.004]} />
    <GCut d={rect(-3400, -1214, 11000, 4)} depth={0.012} position={[0, 0, 0.004]} />
    <GCut d={rect(-3400, -46, 11000, 6)} depth={0.012} position={[0, 0, 0.004]} />
    {/* pilasters: three fluted gold lines each */}
    {[0.61, -0.21, -1.03, -1.85, -2.67, 1.22, 2.02, 2.82, 3.62, 4.42].map((x) => <group key={x} position={[x, 0, 0.006]}>
      {[-16, 0, 16].map((o) => <GCut key={o} d={rect(o - 2, -1180, 4, 1120)} depth={0.006} bevel={0} shadow={false} />)}
      <GCut d={rect(-30, -1204, 60, 18)} depth={0.01} />
    </group>)}
    {/* display windows: arched, warm, each with a small bag on a plinth */}
    {WINDOWS.map((x, i) => <group key={x} position={[x, 0.16, 0]}>
      <Cut d={archSolid(300, 330)} kind="glow" color="#ffb46a" glow={glow * 0.5 - 1} depth={0.002} bevel={0} position={[0, 0, 0.003]} shadow={false} />
      <GCut d={archFrame(316, 488, 9)} depth={0.016} position={[0, 0, 0.005]} />
      <BCut d={rect(-80, -60, 160, 60)} depth={0.02} position={[0, 0, 0.012]} />
      <GCut d={rect(-84, -62, 168, 4)} depth={0.022} position={[0, 0, 0.012]} />
      <Cut d={rect(-150, -6, 300, 4)} kind="glow" color="#ffcf8f" glow={0.6} depth={0.002} bevel={0} position={[0, 0.0, 0.03]} shadow={false} />
      {x < 2 && <HeroBag position={[0, 0.062, 0.026]} scale={0.5} leather={i % 2 ? '#8c0c20' : '#1a1418'} tag={false} light={0} />}
    </group>)}
    {/* the door: S04's arch, scaled; glass leaves over a warm glow */}
    <group position={[DX, 0, 0.006]}>
      <Cut d={archSolid(R * 2000 - 26, SPR * 1000)} kind="glow" color="#ffd7a0" glow={door - 1} depth={0.002} bevel={0} shadow={false} />
      <GCut d={rect(-R * 1000, -SPR * 1000, R * 2000, 5)} depth={0.008} bevel={0} position={[0, 0, 0.004]} />
      {/* two glass leaves (frosted, gold frames) that swing open toward the street on the hit */}
      {[-1, 1].map((sd) => <group key={sd} position={[sd * LW, 0, 0.01]} rotation={[0, sd * open * 1.2, 0]}>
        <Cut d={rect(sd < 0 ? 0 : -LW * 1000, -SPR * 1000 + 3, LW * 1000, SPR * 1000 - 3)} kind="glow" color="#ffcf8f" glow={-0.6} depth={0.002} bevel={0} shadow={false} />
        <GCut d={frameP(sd < 0 ? 0 : -LW * 1000, -SPR * 1000 + 3, LW * 1000, SPR * 1000 - 3, 7) + ' ' + rect(sd < 0 ? 0 : -LW * 1000, -SPR * 500, LW * 1000, 4)} depth={0.006} bevel={0} position={[0, 0, 0.003]} />
        <GCut d={rect(sd < 0 ? LW * 1000 - 24 : -LW * 1000 + 16, -232, 8, 46)} depth={0.012} position={[0, 0, 0.004]} />
      </group>)}
      <GCut d={archRing(R * 1000, 5, SPR * 1000)} depth={0.012} position={[0, 0, 0.006]} />
      <GCut d={archRing(R * 1000 - 13, 2.4, SPR * 1000)} color={CHAMP} depth={0.006} bevel={0} position={[0, 0, 0.007]} shadow={false} />
      <GCut d={archRing((0.31 + 0.045) * F * 1000, 4, SPR * 1000)} depth={0.01} position={[0, 0, 0.002]} />
      <GCut d={archRing((0.31 + 0.09) * F * 1000, 2.2, SPR * 1000)} color={CHAMP} depth={0.006} bevel={0} position={[0, 0, 0.001]} shadow={false} />
      <GCut d={archRing((0.31 + 0.135) * F * 1000, 4, SPR * 1000)} depth={0.01} position={[0, 0, 0.0]} />
      <GCut d="M 0 -14 L 10 0 L 0 14 L -10 0 Z" depth={0.006} position={[0, SPR + R, 0.012]} />
      {/* stepped deco crown above the cornice */}
      <BCut d="M -260 -1250 L -260 -1310 L -170 -1310 L -170 -1370 L -80 -1370 L -80 -1430 L 80 -1430 L 80 -1370 L 170 -1370 L 170 -1310 L 260 -1310 L 260 -1250 Z" color="#0b0a10" depth={0.01} position={[0, 0, -0.006]} />
      <GCut d="M -260 -1310 L -170 -1310 L -170 -1370 L -80 -1370 L -80 -1430 L 80 -1430 L 80 -1370 L 170 -1370 L 170 -1310 L 260 -1310 L 260 -1302 L 162 -1302 L 162 -1362 L 72 -1362 L 72 -1422 L -72 -1422 L -72 -1362 L -162 -1362 L -162 -1302 L -260 -1302 Z" depth={0.012} position={[0, 0, -0.004]} />
      <GCut d="M 0 -1400 L 18 -1376 L 0 -1352 L -18 -1376 Z" depth={0.012} position={[0, 0, 0.0]} />
    </group>
  </group>
);

/* ---------------------------------------------------------------- the set */
const Set: React.FC<{ T: number }> = ({ T }) => {
  const p = impulse(T, PULSE, 0.35), hit = impulse(T, 32.806, 0.3);
  const glow = 0.72 + 0.6 * p + 0.25 * hit;
  const open = easeOut(prog(T, 32.806, 33.35)), door = 0.7 + 0.55 * open + 0.6 * p + 0.5 * hit;
  return (
    <group>
      <WarmEnv />
      <Backdrop burst="gold" burstY={1.2} n={40} position={[DX, 0, 0]} />
      <MirrorFloor />
      <Facade glow={glow} door={door} open={open} />
      {/* the red runner to the door */}
      <mesh position={[DX, 0.003, -0.08]} receiveShadow><boxGeometry args={[0.32, 0.004, 0.94]} /><meshPhysicalMaterial color="#5a0614" roughness={0.75} sheen={1} sheenColor="#ff4060" /></mesh>
      <RopeLine />
      {/* the doorman by the closed rope */}
      <Person who={{ h: 480, man: true }} flip position={[DX + 0.3, 0, -0.32]} rotation={[0, 0.3, 0]} />
      {/* the queue, nearest the door first */}
      {QUEUE.map((w, i) => <Person key={i} who={w} position={[0.56 - i * 0.235 + (hash(i, 8) - 0.5) * 0.05, 0, -0.04 + (hash(i, 9) - 0.5) * 0.08]} rotation={[0, -0.5, 0]} />)}
      {/* light pours out of the door along the line */}
      <Spot pos={[DX - 0.02, 0.36, FZ + 0.12]} at={[-1.2, 0.05, 0.35]} intensity={(1.0 + 1.8 * open) * (1 + 0.9 * p + 0.5 * hit)} angle={0.9} penumbra={0.6} color="#ffc98a" shadow decay={1.6} />
      <Spot pos={[-0.6, 2.6, 2.2]} at={[-0.6, 0.3, -0.4]} intensity={13} angle={0.75} penumbra={0.9} color="#fff0d8" shadow />
      <Spot pos={[-2.6, 1.4, 1.8]} at={[-1.2, 0.35, -0.4]} intensity={4} angle={0.6} penumbra={0.9} color="#ffd9b0" />
      <ambientLight intensity={0.03} />
    </group>
  );
};

const Overlay: React.FC<{ T: number }> = ({ T }) => <Caption T={T} t0={37} t1={40.7} text="一种解释：模仿欲望（勒内·基拉尔）" />;

/* match: S04 ends with the camera 0.45 above its arch base, looking at 0.43 above it, 2.36 m away. Scaled by F about the door.
   Moves: hold on the door while it opens → pull back + pan left that resolves on bar 34.828 (queue against the windows)
   → glide to the far end, settling on bar 36.853 → truck back along the line, accelerating into the whip at 40.907. */
const D0 = 2.36 * F;
export const S05: SceneDef = {
  id: 'S05_queue', t0: 32.806, t1: 40.907, x: 56, enter: 'cut', Set, Overlay,
  keys: [
    { t: 32.806, pos: [DX, 0.45 * F, FZ + D0], look: [DX, 0.43 * F, FZ], fov: 34, ap: 0.004, bloom: 0.6 },
    { t: 33.6, pos: [DX - 0.04, 0.3, FZ + D0 + 0.22], look: [DX - 0.02, 0.27, FZ], fov: 34, ap: 0.004, bloom: 0.6 },
    { t: 34.83, pos: [-0.25, 0.42, 1.6], look: [-0.85, 0.3, -0.3], fov: 34, ap: 0.003, bloom: 0.6 },
    { t: 36.85, pos: [-2.55, 0.33, 0.68], look: [-0.7, 0.3, -0.2], fov: 34, ap: 0.003, bloom: 0.6 },
    { t: 38.88, pos: [-1.25, 0.31, 0.52], look: [0.4, 0.3, -0.25], fov: 34, ap: 0.004, bloom: 0.6 },
    { t: 40.607, pos: [0.18, 0.3, 0.55], look: [DX, 0.3, -0.45], fov: 34, ap: 0.004, bloom: 0.62 },
  ],
  lines: [
    { t: 32.9, end: 36.75, text: '第一步：门口限流，让人排队。' },
    { t: 36.85, end: 40.8, text: '我们想要的，往往是别人想要的。' },
  ],
  hits: [[PULSE, 0.3]],
  bg: '#030308', env: 0.35,
};

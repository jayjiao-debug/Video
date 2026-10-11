/* S06 · waiting (40.907 – 57.106), v2: one boutique, two systems.
   Whip-pan in onto a warm-lit vitrine: a dashed gold outline where the bag stood, a "sold out" card; the camera
   pushes in and resolves on the bar (42.932); the take-a-number post drops ticket 37 on the 43.436 accent.
   44.957: the camera trucks right along the shop: a black lacquer counter, a brass rail above it (想要 · 多巴胺)
   and a gold inlay along its front (喜欢), a tall arched shop window behind, the bag waiting in its box at the end.
   47.0: two pens of light start along rail and inlay (the room is never frozen). 49.008 break: the room light
   falls; only the pens and one key. 51.033 (bar): the shop window switches ON (信号) and the 想要 light shoots up
   the window's centre mullion; the room fills with warm window light. The pen falls back and runs flat along the
   counter; at 55.083 it reaches the bag (拿到): nothing, while the 喜欢 inlay lifts a little under the box.
   Push into the bag in its box, bright, for the match cut to S07's bottle. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { pop, prog, easeOut, easeInOut, swing, impulse, clamp, lerp } from '../scene';
import { HeroBag, Cut, rect, archFrame, rays, circle, ring } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Word, Beam } from '../kit';
import { FoilText } from './S10_kit';
import { strokePath, resample, bagOutline, Ribbon, useGlow, useHolo, glassMat, Box, CutM, monotone, rectHole, velvet } from './S06_lib';

const BREAK = 49.008, SIG_T = 51.033, GET_T = 55.083;
/** a spot that really aims where we say (its target lives in our group, so it follows the stage's x) */
export const Spot: React.FC<{ p: [number, number, number]; at: [number, number, number]; angle: number; i: number; color?: string | THREE.Color; shadow?: boolean; pen?: number }> = ({ p, at, angle, i, color = '#fff0d8', shadow = false, pen = 0.7 }) => {
  const tgt = useMemo(() => new THREE.Object3D(), []);
  return <>
    <primitive object={tgt} position={at} />
    <spotLight position={p} target={tgt} angle={angle} penumbra={pen} intensity={i} color={color} castShadow={shadow} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} decay={2} />
  </>;
};
export const DIAMOND = (s: number) => `M 0 ${-s} L ${s * 0.72} 0 L 0 ${s} L ${-s * 0.72} 0 Z`;
const WARM = '#0e0907';

/* the shop (metres, local) */
const VX = -1.0;                                       // vitrine
const CX0 = -0.45, CX1 = 1.55, CH = 0.4, CZ = -0.12, CD = 0.3;   // counter
const RAIL_Z = -0.36, YW = 0.58, PEAK = 0.42;          // 想要 rail
const LIKE_Y = 0.33, LIKE_Z = CZ + CD / 2 + 0.002;     // 喜欢 inlay on the counter front
const WX = 0.58, WZ = -0.62, WW = 640, WH = 800, WY = 0.5;   // the shop window (px for the path)
const XS = WX, XG = 1.2;                               // signal, got-it
const X0 = -0.3, X1 = 1.5;
const want = (x: number) => YW + PEAK * (x < XS ? Math.exp(-(((x - XS) / 0.022) ** 2)) : Math.exp(-(((x - XS) / 0.07) ** 2)));
const like = (x: number) => LIKE_Y + 0.04 * Math.exp(-(((x - XG) / 0.07) ** 2));
const N = 360;
const WANT: [number, number][] = Array.from({ length: N + 1 }, (_, i) => { const x = X0 + ((X1 - X0) * i) / N; return [x, want(x)]; });
const LIKE: [number, number][] = Array.from({ length: N + 1 }, (_, i) => { const x = X0 + ((X1 - X0) * i) / N; return [x, like(x)]; });
const penX = monotone([[46.9, X0], [BREAK, 0.18], [SIG_T, XS], [GET_T, XG], [56.95, 1.45]]);

const OUTLINE = bagOutline().map((l, i) => strokePath(resample(l, 2), i === 2 ? 2.2 : 3.4, i === 2 ? 7 : 12, i === 2 ? 7 : 8)).join(' ');
/* the window: arched panes, a wall with the arch cut out, mullions */
const archPath = (w: number, h: number) => { const r = w / 2; return `M ${-r} 0 L ${-r} ${-(h - r)} A ${r} ${r} 0 0 1 ${r} ${-(h - r)} L ${r} 0 Z`; };
const WALL = [rect(-3000, -2400, 6000, 2400 - WH), rect(-3000, -WH, 3000 - WW / 2, WH + WY * 1000), rect(WW / 2, -WH, 3000 - WW / 2, WH + WY * 1000), rect(-WW / 2, 0, WW, WY * 1000),
  rect(-WW / 2, -WH, WW, WW / 2) + ` M ${WW / 2} ${-(WH - WW / 2)} A ${WW / 2} ${WW / 2} 0 0 0 ${-WW / 2} ${-(WH - WW / 2)} Z`].join(' ');
const MULL = [rect(-5, -WH, 10, WH), rect(-WW / 2, -WH * 0.36 - 4, WW, 8), rect(-WW / 2, -WH * 0.68 - 4, WW, 8), rect(-WW / 4 - 3, -WH * 0.68, 6, WH * 0.68), rect(WW / 4 - 3, -WH * 0.68, 6, WH * 0.68)].join(' ');

const Set: React.FC<{ T: number }> = ({ T }) => {
  const lit = 1 - easeOut(prog(T, BREAK, BREAK + 0.9));          // the room lights, down in the break
  const shop = easeOut(prog(T, 44.6, 46.2));                       // the counter's light comes up with line 2
  const ticket = pop(T, 43.436, 0.26);
  const plaques = easeOut(prog(T, 45.3, 45.9));
  const px = penX(T), drawn = clamp((px - X0) / (X1 - X0)), pens = T >= 46.9;
  // the window switches on like a shop light: two blips, then on
  const win = easeOut(prog(T, SIG_T - 0.02, SIG_T + 0.15));            // a clean 5-frame snap up, no dips
  const sigKick = prog(T, SIG_T - 0.02, SIG_T + 0.09) * (1 - easeOut(prog(T, SIG_T + 0.09, SIG_T + 0.7)));   // 3-frame attack, ~18-frame decay
  const penVis = 1 - prog(Math.min(px, X1), XG - 0.3, XG - 0.12);
  const got = easeOut(prog(T, GET_T - 0.2, GET_T + 0.8));
  const ribbonHolo = useGlow('#ff9a30', 0.7), flare = useGlow('#ffd890', 1.6); flare.opacity = clamp(sigKick);
  const core = useGlow('#ffe4b0', 1.5), likeM = useGlow('#ffc860', 1.35);
  const head = useGlow('#ffe4b0', 1.5); head.opacity = penVis;
  const pane = useGlow('#ffb45a', 0.85); pane.opacity = win;
  const glare = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff4e0', transparent: true, opacity: 0.035, depthWrite: false, toneMapped: false }), []);
  const wy = want(Math.min(px, X1)), ly = like(Math.min(px, X1));
  const satin = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#c8994a', metalness: 1, roughness: 0.55 }), []);
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor tint="#2a241e" />
      {/* ---------- the boutique niche around the vitrine ---------- */}
      <Cut d={archFrame(880, 1120, 26)} kind="gold" position={[VX, 0, -0.78]} />
      <Cut d={archFrame(940, 1170, 6)} kind="gold" color="#b08a48" position={[VX, 0, -0.82]} shadow={false} />

      {/* ---------- the vitrine ---------- */}
      <group position={[VX, 0, -0.15]}>
        <Box w={0.56} h={0.3} d={0.36} kind="lacquer" color={WARM} />
        <Cut d={rect(-272, -284, 544, 5) + ' ' + rect(-272, -20, 544, 5)} kind="gold" position={[0, 0, 0.181]} depth={0.001} bevel={0} shadow={false} />
        <Cut d={DIAMOND(18)} kind="gold" position={[0, 0.15, 0.181]} depth={0.002} bevel={0.0006} />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => <Box key={i} w={0.008} h={0.44} d={0.008} kind="gold" position={[sx * 0.246, 0.3, sz * 0.156]} />)}
        <Box w={0.49} h={0.44} d={0.006} position={[0, 0.3, -0.15]} kind="lacquer" color="#060403" />
        <Box w={0.54} h={0.026} d={0.36} position={[0, 0.74, 0]} kind="lacquer" color={WARM} />
        <Cut d={rect(-272, -6, 544, 4)} kind="gold" position={[0, 0.756, 0.181]} depth={0.001} bevel={0} shadow={false} />
        <Box w={0.4} h={0.022} d={0.26} position={[0, 0.3, -0.02]} kind="lacquer" color={WARM} />
        <Cut d={rect(-200, -4, 400, 3)} kind="gold" position={[0, 0.322, 0.111]} depth={0.001} bevel={0} shadow={false} />
        <Cut d={OUTLINE} kind="gold" depth={0.0012} bevel={0} position={[0, 0.324, -0.06]} />
        <PaperCard w={0.15} h={0.075} lines={[['暂时缺货', 0.36, '900'], ['可登记等候', 0.2, '700', '#7a5a22']]} position={[-0.1, 0.375, 0.075]} rotation={[-0.14, 0.18, -0.02]} />
        <mesh material={glassMat()} position={[0, 0.52, 0.158]}><planeGeometry args={[0.488, 0.43]} /></mesh>
        <mesh material={glare} position={[-0.1, 0.55, 0.16]} rotation={[0, 0, -0.7]}><planeGeometry args={[0.026, 0.6]} /></mesh>
        <mesh material={glare} position={[-0.05, 0.55, 0.16]} rotation={[0, 0, -0.7]}><planeGeometry args={[0.01, 0.6]} /></mesh>
        <Spot p={[0, 0.72, 0.03]} at={[0, 0.32, -0.05]} angle={0.75} i={1.8 * lit + 0.1} color="#ffd9a8" pen={0.85} />
      </group>

      {/* ---------- take a number: between the case and the counter ---------- */}
      <group position={[-0.6, 0, 0.1]} rotation={[0, -0.2, 0]}>
        <Cut d={circle(0, 0, 46)} kind="gold" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} depth={0.004} />
        <Box w={0.012} h={0.46} d={0.012} kind="gold" />
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[0.052, 0.052, 0.034, 48]} /><meshPhysicalMaterial color="#120c08" roughness={0.4} clearcoat={0.8} /></mesh>
        <Cut d={ring(0, 0, 45, 52)} kind="gold" position={[0, 0.5, 0.017]} depth={0.002} bevel={0} />
        <Word text="请取号" size={0.022} kind="gold" weight="700" position={[0, 0.514, 0.02]} />
        <Cut d={rect(-30, -2, 60, 4)} kind="black" color="#000000" position={[0, 0.485, 0.018]} depth={0.001} bevel={0} shadow={false} />
        {ticket > 0 && <group position={[0, 0.485, 0.02]} rotation={[0, 0, (swing(T, 43.62, 7) * Math.PI) / 180]}>
          <group scale={[1, Math.max(0.01, ticket), 1]}>
            <Cut d={rect(-35, 0, 70, 98)} kind="gold" position={[0, 0.0, -0.002]} depth={0.001} bevel={0} />
            <PaperCard w={0.064} h={0.092} lines={[['No.', 0.13, '700', '#7a5a22'], ['37', 0.44, '900']]} position={[0, -0.049, 0.001]} />
          </group>
        </group>}
      </group>

      {/* ---------- the shop window: a wall with an arched window, panes that switch on ---------- */}
      <group position={[WX, WY, WZ]}>
        <CutM d={WALL} m={velvet('#0c0806')} position={[0, 0, -0.01]} depth={0.01} />
        <CutM d={archPath(WW, WH)} m={pane} position={[0, 0, -0.02]} depth={0.001} bevel={0} shadow={false} />
        <CutM d={archPath(WW, WH)} m={velvet("#060403")} position={[0, 0, -0.03]} depth={0.002} bevel={0} shadow={false} />
        <CutM d={archFrame(WW + 44, WH + 22, 22)} m={satin} position={[0, 0, 0.002]} depth={0.006} />
        <CutM d={MULL} m={satin} position={[0, 0, -0.008]} depth={0.006} />
        <Box w={WW / 1000 + 0.12} h={0.03} d={0.08} kind="lacquer" color={WARM} position={[0, -0.03, 0.03]} />
        {/* the plaque on the wall beside it */}
        <group position={[-0.17, YW + PEAK - WY + 0.02, 0.012]} scale={plaques}>
          <Cut d={rect(-70, -34, 140, 68)} kind="lacquer" color="#0a0705" depth={0.006} />
          <Cut d={rect(-70, -34, 140, 68) + ' ' + rectHole(-64, -28, 128, 56)} kind="gold" position={[0, 0, 0.0065]} depth={0.001} bevel={0} />
          <FoilText text="信号" glyph={0.04} position={[0, 0, 0.009]} />
        </group>
      </group>
      {/* light spilling through the window once it is on (behind the wall, so the mullions cast shadows) */}
      <Spot p={[WX + 0.05, 1.05, WZ - 0.35]} at={[WX + 0.1, 0.3, 0.3]} angle={0.62} i={14 * win} color="#ffc47a" shadow pen={0.5} />

      {/* ---------- the counter ---------- */}
      <group>
        <Box w={CX1 - CX0} h={CH} d={CD} kind="lacquer" color={WARM} position={[(CX0 + CX1) / 2, 0, CZ]} />
        <Cut d={rect(CX0 * 1000, -CH * 1000, (CX1 - CX0) * 1000, 6)} kind="gold" position={[0, 0, LIKE_Z]} depth={0.002} bevel={0} shadow={false} />
        <Cut d={rect(CX0 * 1000, -24, (CX1 - CX0) * 1000, 10)} kind="gold" position={[0, 0, LIKE_Z]} depth={0.002} bevel={0} shadow={false} />
        <Cut d={Array.from({ length: 20 }, (_, i) => rect(CX0 * 1000 + 50 + i * 100 - 1, -CH * 1000 + 120, 2, CH * 1000 - 170)).join(' ')} kind="gold" color="#5a4320" position={[0, 0, LIKE_Z]} depth={0.0005} bevel={0} shadow={false} />
        {/* the 想要 rail on brass brackets */}
        <mesh position={[(X0 + X1) / 2, YW, RAIL_Z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.004, 0.004, X1 - X0 + 0.1, 12]} /><meshPhysicalMaterial color="#c99a4a" metalness={1} roughness={0.55} /></mesh>
        {[-0.25, 0.2, 1.0, 1.45].map((x) => <mesh key={x} material={satin} position={[x, (YW + CH) / 2, RAIL_Z]}><boxGeometry args={[0.006, YW - CH, 0.006]} /></mesh>)}
        {/* labels at the start of each line */}
        <group scale={plaques} position={[0.02, YW + 0.075, RAIL_Z]}>
          <FoilText text="想要" glyph={0.062} position={[-0.04, 0, 0]} />
          <FoilText text="多巴胺" glyph={0.026} fill="#f3ede2" weight="700" position={[0.12, -0.016, 0]} />
        </group>
        <group scale={plaques} position={[0.02, CH + 0.04, CZ + CD / 2 - 0.03]}>
          <Cut d={rect(-60, -32, 120, 64)} kind="lacquer" color="#0a0705" position={[0, 0, -0.004]} depth={0.004} />
          <Cut d={rect(-60, -32, 120, 64) + ' ' + rectHole(-55, -27, 110, 54)} kind="gold" position={[0, 0, 0.0005]} depth={0.001} bevel={0} />
          <FoilText text="喜欢" glyph={0.038} position={[0, 0, 0.003]} />
          <Box w={0.004} h={0.01} d={0.004} kind="gold" position={[0, -0.042, -0.004]} />
        </group>
        {/* the bag in its box at the end of the counter */}
        <group position={[XG, CH, CZ]}>
          <Box w={0.34} h={0.07} d={0.22} kind="lacquer" color="#100a08" />
          <Cut d={rect(-170, -48, 340, 8)} kind="gold" position={[0, 0, 0.1105]} depth={0.001} bevel={0} shadow={false} />
          <Cut d={'M -140 0 Q -120 -40 -90 -26 Q -60 -60 -30 -30 Q 0 -66 30 -30 Q 60 -58 92 -28 Q 122 -44 142 0 Z'} kind="paper" color="#c9b0a4" position={[0, 0.06, -0.02]} depth={0.0015} />
          <HeroBag position={[0, 0.03, 0.0]} scale={0.62} light={0.8} swing={swing(T, 45.0, 4)} />
          <PaperCard w={0.1} h={0.05} lines={[['拿到', 0.6, '900']]} position={[-0.215, 0.07, 0.07]} rotation={[0, 0.3, 0.06]} />
        </group>
      </group>

      {/* ---------- the two lines of light ---------- */}
      {pens && <>
        <group position={[0, 0, RAIL_Z + 0.012]}>
          <Ribbon pts={WANT} w={0.011} u={drawn} material={ribbonHolo} />
          <Ribbon pts={WANT} w={0.0045} u={drawn} material={core} z={0.003} />
          {drawn < 0.999 && <>
            {penVis > 0.01 && <CutM d={DIAMOND(10)} m={head} position={[px, wy, 0.005]} depth={0.001} bevel={0} shadow={false} />}
            {penVis > 0.01 && <pointLight position={[px, wy, 0.08]} intensity={0.08 * penVis} distance={0.45} color="#ffe2b8" decay={2} />}
          </>}
          {sigKick > 0.02 && <CutM d={rays(16, 26, 140, 0, Math.PI * 2 * (15 / 16), 0.05)} m={flare} position={[XS, YW + PEAK, 0.006]} scale={0.55 + 0.35 * prog(T, SIG_T, SIG_T + 0.7)} depth={0.001} bevel={0} shadow={false} />}
        </group>
        <group position={[0, 0, LIKE_Z + 0.003]}>
          <Ribbon pts={LIKE} w={0.008} u={drawn} material={likeM} />
          {drawn < 0.999 && <CutM d={DIAMOND(8)} m={likeM} position={[px, ly, 0.002]} depth={0.001} bevel={0} shadow={false} />}
        </group>
      </>}

      {/* light: vitrine key, shop key, warm rims; the break keeps one key, then the window takes over */}
      <Spot p={[VX - 0.25, 2.3, 1.2]} at={[VX, 0.42, -0.15]} angle={0.34} i={16 * lit} shadow={T < 50} />
      <Spot p={[0.5, 2.4, 1.3]} at={[0.6, 0.45, -0.2]} angle={0.5} i={shop * lerp(14, 5, 1 - lit)} shadow />
      <Spot p={[XG + 0.1, 1.9, 0.6]} at={[XG, 0.5, CZ]} angle={0.16} i={2 + 9 * got} color="#ffe6c4" pen={0.6} />
      <Spot p={[-2.4, 1.0, 1.1]} at={[-0.4, 0.45, -0.2]} angle={0.55} i={6 * lit} color="#ffb070" pen={0.9} />
      <Spot p={[2.6, 1.1, 1.0]} at={[0.8, 0.5, -0.2]} angle={0.5} i={4 * lit + 3 * win} color="#ffd9a8" pen={0.9} />
      {lit > 0.01 && <Beam from={[VX, 2.4, -0.15]} len={2.2} r={0.42} o={0.04 * lit} />}
      <ambientLight intensity={0.006 + 0.012 * lit + 0.01 * win} color="#ffe2c0" />
    </group>
  );
};

export const S06: SceneDef = {
  id: 'S06_waiting', t0: 40.907, t1: 57.106, x: 70, enter: 'whip', Set, env: 0.2,
  keys: [
    { t: 41.207, pos: [-1.3, 0.54, 1.02], look: [-0.86, 0.47, -0.15], fov: 34, ap: 0.005, bloom: 0.65 },
    { t: 42.932, pos: [-1.06, 0.5, 0.76], look: [-0.82, 0.46, -0.12], fov: 33, ap: 0.006, bloom: 0.65 },
    { t: 43.9, pos: [-1.0, 0.5, 0.72], look: [-0.78, 0.46, -0.1], fov: 33, ap: 0.006, bloom: 0.65 },
    { t: 45.3, pos: [0.58, 0.8, 1.32], look: [0.62, 0.56, -0.3], fov: 36, ap: 0.003, bloom: 0.62 },
    { t: 48.9, pos: [0.6, 0.79, 1.2], look: [0.62, 0.56, -0.3], fov: 36, ap: 0.003, bloom: 0.65 },
    { t: SIG_T, pos: [0.56, 0.78, 1.02], look: [0.58, 0.62, -0.4], fov: 36, ap: 0.003, bloom: 0.72 },
    { t: 53.058, pos: [0.8, 0.75, 1.02], look: [0.88, 0.52, -0.3], fov: 36, ap: 0.003, bloom: 0.7 },
    { t: GET_T, pos: [1.0, 0.73, 1.08], look: [1.12, 0.46, -0.2], fov: 36, ap: 0.004, bloom: 0.7 },
    { t: 57.08, pos: [1.2, 0.62, 0.52], look: [1.2, 0.47, -0.12], fov: 34, ap: 0.006, bloom: 0.72 },
  ],
  lines: [
    { t: 41.0, end: 44.9, text: '第二步：等候名单，让你买不到。' },
    { t: 45.0, end: 48.9, text: '大脑里，"想要"和"喜欢"是两套系统。' },
    { t: 49.2, end: 53.0, text: '学会以后，多巴胺在信号出现时就放电，' },
    { t: 53.1, end: 57.0, text: '而不是真正拿到手的那一刻。' },
  ],
};

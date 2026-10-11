/* S06 · waiting (40.907 – 57.106). Whip in to a boutique niche: an empty vitrine, only a dashed gold outline
   where the bag stood, a "sold out" card, and beside it a take-a-number post whose ticket (37) drops out on the
   43.436 accent. 45.0: the camera trucks right to an instrument board with two gold rails, 想要 and 喜欢; their
   marker posts (信号, 拿到) rise on the fill. 49.008 the break: the room goes dark, one follow-spot stays on two
   pens of light. The 想要 pen spikes at the signal lamp on the 51.033 downbeat and is flat again by 拿到 (55.083),
   where only the 喜欢 line lifts a little. Slow push to the little bag on the 拿到 post (match cut into S07). */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneDef } from '../scene';
import { pop, prog, easeOut, easeInOut, swing, impulse, clamp, lerp } from '../scene';
import { HeroBag, Cut, rect, archFrame, rays, circle, ring } from '../foil';
import { Backdrop, MirrorFloor, PaperCard, Word, Beam } from '../kit';
import { strokePath, resample, bagOutline, Ribbon, useGlow, useHolo, glassMat, Box, CutM, monotone, rectHole } from './S06_lib';

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

/* the instrument board (metres, board-group local; the board stands at z = −0.55) */
const X0 = 0.2, X1 = 1.5, XS = 0.62, XG = 1.12, YW = 0.56, YL = 0.4, PEAK = 0.25;
const want = (x: number) => YW + PEAK * (x < XS + 0.025 ? Math.exp(-(((x - XS - 0.025) / 0.026) ** 2)) : Math.exp(-(((x - XS - 0.025) / 0.075) ** 2)));
const like = (x: number) => YL + 0.05 * Math.exp(-(((x - XG - 0.02) / 0.06) ** 2));
const N = 320;
const WANT: [number, number][] = Array.from({ length: N + 1 }, (_, i) => { const x = X0 + ((X1 - X0) * i) / N; return [x, want(x)]; });
const LIKE: [number, number][] = Array.from({ length: N + 1 }, (_, i) => { const x = X0 + ((X1 - X0) * i) / N; return [x, like(x)]; });
/** the pens' x at film time T: through the signal on the bar downbeat 51.033, through 拿到 on 55.083 */
const penX = monotone([[49.4, X0], [SIG_T, XS + 0.025], [GET_T, XG + 0.02], [56.95, 1.42]]);

const OUTLINE = bagOutline().map((l, i) => strokePath(resample(l, 2), i === 2 ? 2.2 : 3.4, i === 2 ? 7 : 12, i === 2 ? 7 : 8)).join(' ');

const Set: React.FC<{ T: number }> = ({ T }) => {
  const lit = 1 - easeOut(prog(T, BREAK, BREAK + 0.8));          // the room lights, gone in the break
  const ch = easeOut(prog(T, 44.9, 46.2));                         // the board's light comes up with line 2
  const ticket = pop(T, 43.436, 0.26);
  const rails = easeInOut(prog(T, 45.05, 46.4));
  const postS = pop(T, 46.981, 0.3), postG = pop(T, 48.246, 0.3);
  const px = penX(T), drawn = clamp((px - X0) / (X1 - X0)), pens = T >= 49.4;
  const sig = T >= SIG_T ? 1 : 0, sigKick = impulse(T, SIG_T, 0.3);
  const got = easeOut(prog(T, GET_T - 0.2, GET_T + 0.8));
  const holoArch = useHolo(0.9); (holoArch as THREE.ShaderMaterial).uniforms.k.value = 0.1 + 0.6 * lit;
  const ribbonHolo = useHolo(1.25), flare = useHolo(1.6);
  const core = useGlow('#fff2e6', 1.7), likeM = useGlow('#ffc860', 1.25);
  const lamp = useGlow('#ffe9c4', 3.2); lamp.opacity = 0.12 + 0.88 * sig;
  const glare = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.035, depthWrite: false, toneMapped: false }), []);
  glare.opacity = 0.035 * lit;
  const wy = want(Math.min(px, X1)), ly = like(Math.min(px, X1));
  const follow = lerp(Math.min(px, 1.3), XG, got);
  return (
    <group>
      <Backdrop burst="none" />
      <MirrorFloor />
      {/* far stage-left, only the whip passes these: streaks of foil */}
      {[-4.9, -4.55, -4.2, -3.8, -3.45, -3.1].map((x, i) => <Cut key={x} d={rect(-6, -1300, i % 2 ? 6 : 12, 1300)} kind={i % 3 ? 'gold' : 'holo'} position={[x, 0, -0.9 + (i % 3) * 0.3]} shadow={false} />)}
      {/* the boutique niche: a gold arch and a holo hairline arch behind the vitrine */}
      <Cut d={archFrame(880, 1120, 26)} kind="gold" position={[-0.45, 0, -0.78]} />
      <CutM d={archFrame(960, 1180, 7)} m={holoArch} position={[-0.45, 0, -0.84]} shadow={false} />

      {/* ---------- the vitrine ---------- */}
      <group position={[-0.45, 0, -0.15]}>
        <Box w={0.56} h={0.3} d={0.36} />
        <Cut d={rect(-272, -284, 544, 5) + ' ' + rect(-272, -20, 544, 5)} kind="gold" position={[0, 0, 0.181]} depth={0.001} bevel={0} shadow={false} />
        <Cut d={DIAMOND(18)} kind="gold" position={[0, 0.15, 0.181]} depth={0.002} bevel={0.0006} />
        {/* the case: gold posts, a black back, crystal panes, a lid */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => <Box key={i} w={0.008} h={0.44} d={0.008} kind="gold" position={[sx * 0.246, 0.3, sz * 0.156]} />)}
        <Box w={0.49} h={0.44} d={0.006} position={[0, 0.3, -0.15]} kind="lacquer" color="#040306" />
        <Box w={0.54} h={0.026} d={0.36} position={[0, 0.74, 0]} />
        <Cut d={rect(-272, -6, 544, 4)} kind="gold" position={[0, 0.756, 0.181]} depth={0.001} bevel={0} shadow={false} />
        <Box w={0.4} h={0.022} d={0.26} position={[0, 0.3, -0.02]} />
        <Cut d={rect(-200, -4, 400, 3)} kind="gold" position={[0, 0.322, 0.111]} depth={0.001} bevel={0} shadow={false} />
        {/* where the bag was: a dashed gold outline, standing off the back so it throws a shadow on it */}
        <Cut d={OUTLINE} kind="gold" depth={0.0012} bevel={0} position={[0, 0.324, -0.06]} />
        {/* the sold-out card, propped on the riser */}
        <PaperCard w={0.14} h={0.07} lines={[['暂时缺货', 0.36, '900'], ['可登记等候', 0.2, '700', '#7a5a22']]} position={[-0.11, 0.37, 0.075]} rotation={[-0.14, 0.22, -0.02]} />
        <mesh material={glassMat()} position={[0, 0.52, 0.158]}><planeGeometry args={[0.488, 0.43]} /></mesh>
        <mesh material={glassMat()} position={[-0.245, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.31, 0.43]} /></mesh>
        <mesh material={glassMat()} position={[0.245, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.31, 0.43]} /></mesh>
        <mesh material={glare} position={[-0.1, 0.55, 0.16]} rotation={[0, 0, -0.7]}><planeGeometry args={[0.026, 0.6]} /></mesh>
        <mesh material={glare} position={[-0.05, 0.55, 0.16]} rotation={[0, 0, -0.7]}><planeGeometry args={[0.01, 0.6]} /></mesh>
        <Spot p={[0, 0.72, 0.03]} at={[0, 0.32, -0.05]} angle={0.7} i={1.1 * lit + 0.04} color="#ffe2b8" pen={0.85} />
      </group>

      {/* ---------- take a number: beside the case ---------- */}
      <group position={[-0.08, 0, 0.06]} rotation={[0, -0.25, 0]}>
        <Cut d={circle(0, 0, 46)} kind="gold" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} depth={0.004} />
        <Box w={0.012} h={0.46} d={0.012} kind="gold" />
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[0.052, 0.052, 0.034, 48]} /><meshPhysicalMaterial color="#0a0910" roughness={0.5} clearcoat={0.6} /></mesh>
        <Cut d={ring(0, 0, 45, 52)} kind="gold" position={[0, 0.5, 0.017]} depth={0.002} bevel={0} />
        <Word text="请取号" size={0.019} kind="gold" weight="700" position={[0, 0.512, 0.02]} />
        <Cut d={rect(-30, -2, 60, 4)} kind="black" color="#000000" position={[0, 0.485, 0.018]} depth={0.001} bevel={0} shadow={false} />
        {ticket > 0 && <group position={[0, 0.485, 0.02]} rotation={[0, 0, (swing(T, 43.62, 7) * Math.PI) / 180]}>
          <group scale={[1, Math.max(0.01, ticket), 1]}>
            <Cut d={rect(-35, 0, 70, 98)} kind="holo" position={[0, 0.0, -0.002]} depth={0.001} bevel={0} />
            <PaperCard w={0.064} h={0.092} lines={[['No.', 0.13, '700', '#7a5a22'], ['37', 0.44, '900']]} position={[0, -0.049, 0.001]} />
          </group>
        </group>}
      </group>

      {/* ---------- the instrument board: two systems ---------- */}
      <group position={[0, 0, -0.55]}>
        {/* two end posts on floor discs hold the rails */}
        {[X0 - 0.02, X1 + 0.02].map((x) => <React.Fragment key={x}>
          <Box w={0.008} h={YW + 0.06} d={0.008} kind="gold" position={[x, 0, 0]} />
          <Cut d={circle(0, 0, 26)} kind="gold" rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, 0]} depth={0.003} />
        </React.Fragment>)}
        {[YW, YL].map((y) => <group key={y} position={[X0, y, 0.0]} scale={[Math.max(0.001, rails), 1, 1]}>
          <mesh position={[(X1 - X0) / 2, 0, 0]} castShadow><boxGeometry args={[X1 - X0, 0.006, 0.006]} /><meshPhysicalMaterial color="#f0c46a" metalness={1} roughness={0.25} /></mesh>
        </group>)}
        {rails > 0.05 && <>
          <Word text="想要" size={0.1} kind="holo" position={[X0 - 0.1, YW + 0.012, 0]} scale={easeOut(prog(T, 45.2, 45.6))} />
          <Word text="多巴胺" size={0.034} kind="cream" weight="700" position={[X0 - 0.1, YW - 0.066, 0]} scale={easeOut(prog(T, 45.4, 45.8))} />
          <Word text="喜欢" size={0.1} kind="gold" position={[X0 - 0.1, YL + 0.012, 0]} scale={easeOut(prog(T, 45.5, 45.9))} />
        </>}
        {/* the signal post and its lamp */}
        {postS > 0 && <group position={[XS, 0, 0]} scale={[1, postS, 1]}>
          <Box w={0.006} h={0.86} d={0.006} kind="gold" />
          <Cut d={circle(0, 0, 18)} kind="gold" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} depth={0.003} />
          <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.02, 40]} /><meshPhysicalMaterial color="#0a0910" roughness={0.4} clearcoat={0.8} /></mesh>
          <Cut d={ring(0, 0, 34, 40)} kind="gold" position={[0, 0.88, 0.011]} depth={0.002} bevel={0} />
          <CutM d={DIAMOND(22)} m={lamp} position={[0, 0.88, 0.012]} depth={0.002} bevel={0} shadow={false} />
          <Word text="信号" size={0.056} kind="gold" position={[0.115, 0.88, 0]} />
        </group>}
        {/* the "got it" post: the little bag */}
        {postG > 0 && <group position={[XG, 0, 0]} scale={[1, postG, 1]}>
          <Box w={0.006} h={0.84} d={0.006} kind="gold" />
          <Cut d={circle(0, 0, 18)} kind="gold" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} depth={0.003} />
          <Cut d={rect(-62, -6, 124, 6)} kind="gold" position={[0, 0.846, -0.012]} depth={0.024} />
          <HeroBag position={[0, 0.846, 0]} scale={0.3} swing={swing(T, 48.4, 10)} />
          <Word text="拿到" size={0.056} kind="gold" position={[0.12, 0.9, 0]} />
        </group>}
        {/* the two curves, drawn by two pens of light */}
        {pens && <>
          <Ribbon pts={WANT} w={0.012} u={drawn} material={ribbonHolo} z={0.012} />
          <Ribbon pts={WANT} w={0.0034} u={drawn} material={core} z={0.016} />
          <Ribbon pts={LIKE} w={0.008} u={drawn} material={likeM} z={0.012} />
          {drawn < 0.999 && <>
            <CutM d={DIAMOND(10)} m={core} position={[px, wy, 0.02]} depth={0.001} bevel={0} shadow={false} />
            <CutM d={DIAMOND(8)} m={likeM} position={[px, ly, 0.02]} depth={0.001} bevel={0} shadow={false} />
            <pointLight position={[px, wy, 0.06]} intensity={0.06} distance={0.45} color="#ffd8f4" decay={2} />
          </>}
          {/* the moment it fires: a star of holo foil at the peak, gone in a breath */}
          {sigKick > 0.03 && <CutM d={rays(14, 26, 120, 0, Math.PI * 2 * (13 / 14), 0.06)} m={flare} position={[XS + 0.025, YW + PEAK, 0.02]} scale={0.45 + 0.4 * (1 - sigKick)} depth={0.001} bevel={0} shadow={false} />}
        </>}
      </group>

      {/* light: a key on the vitrine, a key on the board, magenta/cyan kickers; the break keeps one follow-spot */}
      <Spot p={[-0.7, 2.3, 1.3]} at={[-0.45, 0.42, -0.15]} angle={0.34} i={10 * lit} shadow />
      <Spot p={[lerp(0.8, follow, 1 - lit), 2.4, 0.9]} at={[lerp(0.8, follow, 1 - lit), lerp(0.55, 0.68, got), -0.55]} angle={lerp(0.44, 0.24, 1 - lit)} i={ch * lerp(11, 9, 1 - lit) + 3 * got} shadow />
      <Spot p={[-2.4, 1.1, 1.1]} at={[-0.2, 0.45, -0.3]} angle={0.55} i={7 * lit} color="#ff3ec8" pen={0.9} />
      <Spot p={[2.6, 1.2, 1.2]} at={[0.2, 0.4, -0.2]} angle={0.45} i={5 * lit} color="#29e6ff" pen={0.9} />
      <Spot p={[XG + 0.15, 1.7, 0.4]} at={[XG, 0.84, -0.55]} angle={0.1} i={5 * got} color="#ffe6c4" pen={0.6} />
      {lit > 0.01 && <Beam from={[-0.45, 2.4, -0.15]} len={2.2} r={0.42} o={0.04 * lit} />}
      <Beam from={[follow, 2.4, -0.5]} len={1.9} r={0.28} o={0.035 * (1 - lit)} />
      <ambientLight intensity={0.01 + 0.025 * lit} />
    </group>
  );
};

export const S06: SceneDef = {
  id: 'S06_waiting', t0: 40.907, t1: 57.106, x: 70, enter: 'whip', Set, env: 0.45,
  keys: [
    { t: 41.207, pos: [-0.9, 0.5, 1.0], look: [-0.38, 0.46, -0.12], fov: 34, ap: 0.005, bloom: 0.7, roll: -0.05 },
    { t: 43.25, pos: [-0.52, 0.5, 0.72], look: [-0.3, 0.45, -0.08], fov: 32, ap: 0.006, bloom: 0.7 },
    { t: 44.9, pos: [-0.12, 0.56, 0.95], look: [0.12, 0.5, -0.3], fov: 33, ap: 0.005, bloom: 0.7 },
    { t: 46.7, pos: [0.6, 0.6, 1.05], look: [0.72, 0.6, -0.55], fov: 34, ap: 0.004, bloom: 0.65 },
    { t: 48.9, pos: [0.44, 0.64, 1.0], look: [0.64, 0.62, -0.55], fov: 34, ap: 0.004, bloom: 0.7 },
    { t: SIG_T, pos: [0.4, 0.66, 0.68], look: [0.66, 0.64, -0.55], fov: 34, ap: 0.006, bloom: 0.85 },
    { t: GET_T, pos: [0.9, 0.64, 0.76], look: [1.1, 0.62, -0.55], fov: 34, ap: 0.005, bloom: 0.85 },
    { t: 57.08, pos: [1.07, 0.82, 0.24], look: [1.12, 0.84, -0.55], fov: 33, ap: 0.009, bloom: 0.9 },
  ],
  lines: [
    { t: 41.0, end: 44.9, text: '第二步：等候名单，让你买不到。' },
    { t: 45.0, end: 48.9, text: '大脑里，"想要"和"喜欢"是两套系统。' },
    { t: 49.2, end: 53.0, text: '学会以后，多巴胺在信号出现时就放电，' },
    { t: 53.1, end: 57.0, text: '而不是真正拿到手的那一刻。' },
  ],
};

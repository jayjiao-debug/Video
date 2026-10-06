import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { A_DIR, N_DIR, toWorld, buildTerrain, terrainMat, waterMat, skyMat, dotsMat, glowTex } from './world13';

/* ep13 style test (≈19 s): the river world, the crane up that turns it into the challenge × skill chart,
   and the title on the track's first drop (16.62 s). Captions here stand in for the owner's voiceover. */
export const FT_FRAMES = 570;
const DROP = 16.62, FOV = 42;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (T: number, a: number, b: number) => clamp((T - a) / (b - a));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/* the bright one: speed is the story (fast while gaming, crawling through homework) */
const speed = (T: number) => {
  const slow = prog(T, 2.7, 3.6) * (1 - prog(T, 5.6, 6.6));
  return lerp(2.3, 0.45, slow) * (T > 6 ? lerp(1, 0.75, prog(T, 6, 8)) : 1);
};
const uYou = (T: number) => { const dt = 1 / 60; let u = 1, t = 0; while (t + dt <= T) { u += speed(t + dt / 2) * dt; t += dt; } return u + speed((t + T) / 2) * (T - t); };
const youPos = (T: number) => { const u = uYou(T); return toWorld(u, 0.12 * Math.sin(T * 0.9), 0.26 + 0.04 * Math.sin(T * 2.1)); };
const flowPhase = (T: number) => uYou(T) * 0.9 + T * 0.35;

/* camera: shots blended with eased windows; the last one is the crane to the top-down chart */
type Shot = { pos: THREE.Vector3; look: THREE.Vector3; top: number };
const CENTER = V(8.0, 0, -5.9);
const shots = (T: number): Shot[] => {
  const y = youPos(T), a = A_DIR, n = N_DIR;
  const at = (k: number, m: number, h: number) => y.clone().addScaledVector(a, k).addScaledVector(n, m).add(V(0, h, 0));
  const H = lerp(25.5, 24.3, eo(prog(T, DROP, DROP + 2.4)));
  return [
    { pos: at(-2.6, -0.35, 0.8), look: at(5, 0.6, 0.6), top: 0 },                      // A chase, low and fast
    { pos: at(0.2, -2.7, 1.15), look: at(3.4, -7.5, 0.15), top: 0 },                     // B over the flats
    { pos: at(-3.6, -0.2, 1.7), look: at(5, 0.4, 0.5), top: 0 },                         // C behind, both sides
    { pos: at(-4.6, -3.0, 2.0), look: at(3.0, 4.6, 2.2), top: 0 },                        // D up at the cliffs
    { pos: at(-2.6, -1.8, 3.6), look: at(4, -5.5, 0), top: 0 },                          // E rising over the flats
    { pos: CENTER.clone().add(V(0.0, H, 0.6)), look: CENTER.clone(), top: 1 },           // F top-down: the chart
  ];
};
const CUTS: [number, number][] = [[2.6, 3.5], [5.7, 6.6], [8.3, 9.2], [10.7, 11.6], [12.6, 15.7]];
const camAt = (T: number) => {
  const S = shots(T);
  let cur = S[0];
  for (let i = 0; i < CUTS.length; i++) {
    const [a, b] = CUTS[i];
    if (T >= b) { cur = S[i + 1]; continue; }
    if (T > a) { const k = eio(prog(T, a, b)); cur = { pos: cur.pos.clone().lerp(S[i + 1].pos, k), look: cur.look.clone().lerp(S[i + 1].look, k), top: lerp(cur.top, S[i + 1].top, k) }; }
    break;
  }
  const up = V(0, 1, 0).lerp(V(0, 0, -1), cur.top).normalize();
  const m = new THREE.Matrix4().lookAt(cur.pos, cur.look, up);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  return { pos: cur.pos, q, top: cur.top };
};
const project = (T: number, p: THREE.Vector3, w: number, h: number) => {
  const c = camAt(T);
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 600);
  cam.position.copy(c.pos); cam.quaternion.copy(c.q); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const v = p.clone().project(cam);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
};

/* look */
const HOR = new THREE.Color('#8f979f'), ZEN = new THREE.Color('#1f2733'), SUN = new THREE.Color('#ffc996');
const SKY = new THREE.Color('#7d8796'), GROUND = new THREE.Color('#2e2a2a');
const SUN_DIR = A_DIR.clone().addScaledVector(N_DIR, -0.42).add(V(0, 0.2, 0)).normalize();

const World: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const c = camAt(T);
  camera.position.copy(c.pos); camera.quaternion.copy(c.q);
  (camera as THREE.PerspectiveCamera).fov = FOV; (camera as THREE.PerspectiveCamera).near = 0.05; (camera as THREE.PerspectiveCamera).far = 600;
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();

  const geo = useMemo(() => buildTerrain(), []);
  const tMat = useMemo(() => terrainMat(), []);
  const wMat = useMemo(() => waterMat(), []);
  const sMat = useMemo(() => skyMat(), []);
  const dMat = useMemo(() => dotsMat(), []);
  const dust = useMemo(() => {
    let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const N = 900, p = new Float32Array(N * 3), sz = new Float32Array(N), base: [number, number, number][] = [];
    for (let i = 0; i < N; i++) { base.push([r() * 46 - 4, (r() - 0.5) * 12, 0.15 + r() * r() * 4.5]); sz[i] = 0.4 + r() * 1.2; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sz, 1));
    return { g, base };
  }, []);
  { // dust drifts downstream with the air
    const p = dust.g.getAttribute('position') as THREE.BufferAttribute;
    dust.base.forEach(([u, d, y], i) => { const w = toWorld(u + T * 0.35 + 0.3 * Math.sin(T * 0.5 + i), d + 0.2 * Math.sin(T * 0.3 + i * 1.7), y + 0.15 * Math.sin(T * 0.7 + i)); p.setXYZ(i, w.x, w.y, w.z); });
    p.needsUpdate = true;
  }

  const you = youPos(T);
  const fogD = lerp(0.046, 0.011, c.top);
  const boring = prog(T, 3.0, 4.0) * (1 - prog(T, 5.8, 6.8));
  const ember = lerp(0.25, 1, prog(T, 8.6, 10.0)) * lerp(1, 0.55, prog(T, 11, 12.5));
  const flare = Math.exp(-Math.max(0, T - DROP) * 1.6) * (T >= DROP ? 1 : 0);
  for (const m of [tMat, wMat]) {
    m.uniforms.uFog.value.copy(HOR); m.uniforms.uFogD.value = fogD; m.uniforms.uSunDir.value.copy(SUN_DIR); m.uniforms.uSun.value.copy(SUN);
    m.uniforms.uYou.value.copy(you); m.uniforms.uYouI.value = lerp(1, 0.55, boring) * (1 + 1.5 * flare);
  }
  tMat.uniforms.uSky.value.copy(SKY); tMat.uniforms.uGround.value.copy(GROUND); tMat.uniforms.uEmber.value = ember * lerp(1, 0.45, c.top); tMat.uniforms.uT.value = T;
  wMat.uniforms.uFlow.value = flowPhase(T); wMat.uniforms.uGlow.value = lerp(1, 0.35, boring) * (1 + 1.8 * flare) * lerp(1, 1.35, c.top); wMat.uniforms.uHorizon.value.copy(HOR);
  sMat.uniforms.uZen.value.copy(ZEN); sMat.uniforms.uHor.value.copy(HOR); sMat.uniforms.uSun.value.copy(SUN); sMat.uniforms.uSunDir.value.copy(SUN_DIR);
  dMat.uniforms.uFog.value.copy(HOR); dMat.uniforms.uFogD.value = fogD; dMat.uniforms.uA.value = lerp(0.55, 0.15, c.top); dMat.uniforms.uSize.value = 34;

  // the trail: where the bright one was a moment ago
  const trail = Array.from({ length: 16 }, (_, k) => ({ p: youPos(Math.max(0, T - (k + 1) * 0.045)), o: 0.5 * (1 - k / 16) ** 2 }));
  const tex = glowTex();
  const youScale = lerp(1, 4.2, c.top);
  return (
    <>
      <mesh material={sMat} position={c.pos}><sphereGeometry args={[400, 32, 16]} /></mesh>
      <mesh geometry={geo} material={tMat} />
      <mesh material={wMat} rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.02, -10]}><planeGeometry args={[110, 110, 1, 1]} /></mesh>
      <points geometry={dust.g} material={dMat} />
      {trail.map((t, i) => (
        <sprite key={i} position={t.p} scale={[0.22 * youScale, 0.22 * youScale, 1]}>
          <spriteMaterial map={tex} color="#ffd08a" transparent opacity={t.o} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </sprite>
      ))}
      <sprite position={you} scale={[1.3 * youScale * (1 + flare), 1.3 * youScale * (1 + flare), 1]}>
        <spriteMaterial map={tex} color="#ffb870" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      <sprite position={you} scale={[0.3 * youScale, 0.3 * youScale, 1]}>
        <spriteMaterial map={tex} color="#ffffff" transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
    </>
  );
};

/* ---------- 2D layer: captions (VO stand-in), chart labels, title ---------- */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const LINES: [number, number, string][] = [
  [0.0, 2.85, '打游戏，一抬头，天亮了'],
  [3.05, 5.9, '写作业，十分钟，像过了一小时'],
  [6.1, 8.55, '同一个你，为什么差这么多？'],
  [8.8, 10.8, '太难，会焦虑'],
  [11.0, 12.85, '太简单，会无聊'],
  [13.1, 15.75, '只有难度，刚好跟上能力'],
];
const Caption: React.FC<{ T: number }> = ({ T }) => {
  const l = LINES.find(([a, b]) => T >= a && T < b);
  if (!l) return null;
  const o = Math.min(prog(T, l[0], l[0] + 0.12), 1 - prog(T, l[1] - 0.12, l[1]));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 74, textAlign: 'center', opacity: o, fontFamily: SANS, fontWeight: 500, fontSize: 40, letterSpacing: '0.06em', color: 'rgba(255,248,238,0.94)', textShadow: '0 2px 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)' }}>{l[2]}</div>
  );
};

const ChartOverlay: React.FC<{ T: number; w: number; h: number }> = ({ T, w, h }) => {
  const top = camAt(T).top;
  const show = prog(T, 14.3, 15.2) * (1 - prog(T, DROP - 0.05, DROP + 0.5));
  if (show <= 0.001) return null;
  const P = (s: number, c: number) => project(T, V(s, 0, -c), w, h);
  const o = P(0, 0), xs = P(15.5, 0), ys = P(0, 15.5);
  const draw = eo(prog(T, 14.3, 15.4));
  const lab = (s: number, c: number, txt: string, col: string, at: number, size = 46) => {
    const p = P(s, c), k = eo(prog(T, at, at + 0.5));
    return <div style={{ position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * k})`, opacity: k * show, fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '0.2em', color: col, textShadow: '0 0 3px rgba(0,0,0,.8), 0 2px 26px rgba(0,0,0,.85)' }}>{txt}</div>;
  };
  return (
    <>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity: show * top }}>
        <defs><marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="rgba(255,244,228,.9)" /></marker></defs>
        <line x1={o.x} y1={o.y} x2={lerp(o.x, xs.x, draw)} y2={lerp(o.y, xs.y, draw)} stroke="rgba(255,244,228,.9)" strokeWidth={3} markerEnd="url(#ah)" />
        <line x1={o.x} y1={o.y} x2={lerp(o.x, ys.x, draw)} y2={lerp(o.y, ys.y, draw)} stroke="rgba(255,244,228,.9)" strokeWidth={3} markerEnd="url(#ah)" />
      </svg>
      {lab(16.3, -1.0, '能力', 'rgba(255,244,228,.95)', 14.9, 30)}
      {lab(-1.5, 14.6, '挑战', 'rgba(255,244,228,.95)', 14.9, 30)}
      {lab(3.4, 11.8, '焦虑', '#fff1e6', 14.6)}
      {lab(12.0, 3.6, '无聊', '#fff1e6', 14.8)}
    </>
  );
};

const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < DROP - 0.02) return null;
  const k = prog(T, DROP, DROP + 0.18), s = 1.12 - 0.12 * eo(prog(T, DROP, DROP + 0.7));
  const sub = eo(prog(T, DROP + 0.6, DROP + 1.3));
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${s})`, opacity: k, fontFamily: SERIF, fontWeight: 700, fontSize: 210, letterSpacing: '0.18em', marginLeft: '0.18em', color: '#fff6ea', textShadow: '0 0 40px rgba(255,190,120,.55), 0 6px 40px rgba(0,0,0,.45)' }}>心流</div>
      <div style={{ opacity: sub, marginTop: 6, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.7em', marginLeft: '0.7em', color: 'rgba(255,236,214,.85)', textShadow: '0 2px 16px rgba(0,0,0,.6)' }}>FLOW</div>
    </div>
  );
};

const Grain: React.FC<{ T: number; w: number; h: number }> = ({ T, w, h }) => {
  const f = Math.floor(T * 24), r = (k: number) => ((Math.sin(f * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  return <img src={staticFile('ep12_grain.png')} style={{ position: 'absolute', left: -12 + r(1) * 12, top: -12 + r(2) * 12, width: w + 24, height: h + 24, opacity: 0.16, mixBlendMode: 'overlay' }} />;
};

export const FlowTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const T = frame / 30;
  const flash = T >= DROP ? Math.exp(-(T - DROP) * 7) * 0.5 : 0;
  const fadeIn = prog(T, 0, 0.25), fadeOut = 1 - prog(T, 18.3, 19.0);
  return (
    <AbsoluteFill style={{ background: '#0b0d10' }}>
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ fov: FOV, near: 0.05, far: 600, position: [0, 1, 4] }}>
          <World T={T} />
        </ThreeCanvas>
        {/* grade: vignette + warm lift + grain */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(8,6,6,.55) 100%)' }} />
        <ChartOverlay T={T} w={width} h={height} />
        <Title T={T} />
        <AbsoluteFill style={{ background: `rgba(255,236,210,${flash})`, mixBlendMode: 'screen' }} />
        <Grain T={T} w={width} h={height} />
        <div style={{ position: 'absolute', top: 44, right: 56, fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: '0.28em', color: 'rgba(255,244,230,.6)' }}>
          <span style={{ fontFamily: MONO, color: '#ffbf86' }}>▸ </span>Juno<span style={{ color: '#ffbf86' }}> · </span>VIBE知识大赏
        </div>
        <Caption T={T} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

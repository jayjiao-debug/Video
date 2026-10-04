import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, canvasTex } from './three-kit';
import { useModels, useAsset } from './useModels';
import { materials } from './models';
import { EnvFor, gradientSky, softTex } from './kit';
import { staticFile } from 'remotion';

/* S9, Yap (b238–b294). Furness, The Island of Stone Money (1910); rai quarried on Palau, ~400–450 km away, brought back
   on rafts towed by canoes (Habele Institute; Rai stone). One stone was lost at sea on the way back; nobody saw it again,
   yet the family that owned it was still counted rich.
   A  b238–b250  the island at dusk: great stone wheels standing in a row under the palms.
   B  b250–b260  at sea: a canoe tows a raft with a stone on it.
   C  b260–b270  underwater: the stone sinks through blue water and settles on the sand.
   D  b270–b294  it lies there; the camera rises slowly toward the light above (to S10). */
export const S9_IN = b(238) - 0.4, S9_OUT = b(294) + 0.4;

export const LINES_S9: Line[] = [
  [b(239), b(250) - 0.1, '一百多年前，太平洋雅浦岛上的人，用巨大的石轮当钱。', 'A century ago, on Yap in the Pacific, people used giant stone wheels as money.'],
  [b(250) + 0.06, b(260) - 0.1, '石头要从四百多公里外的帕劳凿好，再用独木舟拖回来。', 'The stones were carved on Palau, 400 km away, and towed home behind canoes.'],
  [b(260) + 0.06, b(270) - 0.1, '有一块，在运回来的路上遇上风暴，沉进了海底。', 'One of them was lost in a storm on the way back and sank to the sea floor.'],
  [b(270) + 0.06, b(280) - 0.1, '没人再见过它，可全岛都承认：它的主人依然富有。', 'No one ever saw it again, yet the whole island agreed its owner was still rich.'],
  [b(280) + 0.06, b(286) - 0.1, '钱的价值，从来不在纸、不在石头，', "Money's value was never in the paper, or the stone;"],
  [b(286) + 0.06, b(294) - 0.1, '而在于你相信：[明天，别人还会收下它]。', 'it is in your belief that tomorrow, someone else will still accept it.'],
];

const SKY_STOPS: [number, string][] = [[0, '#141c3a'], [0.3, '#3a3456'], [0.44, '#c0664a'], [0.5, '#ffb070'], [0.52, '#5a3a3a'], [1, '#0a0c12']];
let WN: THREE.Texture | null = null;
const waterNormals = () => {
  if (!WN) {
    WN = new THREE.TextureLoader().load(staticFile('tex/waternormals.jpg'));
    WN.wrapS = WN.wrapT = THREE.RepeatWrapping;
  }
  return WN;
};
const loadWN = () => new Promise<THREE.Texture>((res) => { const t = waterNormals(); if (t.image) res(t); else new THREE.TextureLoader().load(staticFile('tex/waternormals.jpg'), (x) => { x.wrapS = x.wrapT = THREE.RepeatWrapping; WN = x; res(x); }); });

const Sea: React.FC<{ T: number; sky: THREE.Texture; wn: THREE.Texture; y?: number }> = ({ T, sky, wn, y = 0 }) => {
  const mat = useMemo(() => {
    const n = wn.clone(); n.needsUpdate = true; n.repeat.set(60, 60);
    return new THREE.MeshStandardMaterial({ color: '#0b2232', roughness: 0.12, metalness: 0.0, normalMap: n, normalScale: new THREE.Vector2(0.6, 0.6) });
  }, [wn]);
  mat.normalMap!.offset.set(T * 0.004, T * 0.007);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={mat}><planeGeometry args={[2000, 2000]} /></mesh>
      <EnvFor mats={[mat]} intensity={0.25} />
    </>
  );
};

let PALM: THREE.Texture | null = null;
const palmTex = () => PALM ?? (PALM = canvasTex(512, 1024, (g) => {
  g.clearRect(0, 0, 512, 1024);
  g.strokeStyle = '#0b0a0c'; g.fillStyle = '#0b0a0c'; g.lineCap = 'round';
  g.lineWidth = 22; g.beginPath(); g.moveTo(250, 1024); g.bezierCurveTo(260, 760, 300, 520, 270, 300); g.stroke();
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI + (k / 8) * Math.PI + (rnd(k, 1) - 0.5) * 0.3;
    const L = 200 + rnd(k, 2) * 60;
    g.lineWidth = 8; g.beginPath(); g.moveTo(270, 300);
    const ex = 270 + Math.cos(a) * L, ey = 300 + Math.sin(a) * L * 0.55 + L * 0.35;
    g.quadraticCurveTo(270 + Math.cos(a) * L * 0.5, 300 + Math.sin(a) * L * 0.5 - 40, ex, ey); g.stroke();
    for (let j = 1; j < 14; j++) {
      const t = j / 14, px = lerp(270, ex, t), py = lerp(300, ey, t) - 40 * Math.sin(Math.PI * t);
      g.lineWidth = 3; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a + 1.2) * 34 * (1 - t * 0.5), py + 30 * (1 - t * 0.4)); g.stroke();
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a - 1.2) * 34 * (1 - t * 0.5), py + 30 * (1 - t * 0.4)); g.stroke();
    }
  }
}));

// ---------------- A: the island ----------------
const STONES = [
  { x: -4.5, s: 1.4, ry: 0.25 }, { x: -1.8, s: 2.4, ry: 0.1 }, { x: 1.4, s: 3.2, ry: -0.05 }, { x: 4.6, s: 1.9, ry: 0.2 }, { x: 7.0, s: 1.2, ry: 0.3 },
];
const KEYS_A: Key[] = [
  [b(238) - 0.4, [-9, 1.6, 9], [-2, 1.4, 0]],
  [b(250), [3, 1.3, 8.5], [4, 1.5, 0]],
];

const stoneMat = (g: THREE.Group) => { materials(g).forEach((m) => { m.color = new THREE.Color('#b8ad9c'); m.roughness = 0.95; }); return g; };

const Island: React.FC<{ T: number; wheel: THREE.Group; sky: THREE.Texture; wn: THREE.Texture }> = ({ T, wheel, sky, wn }) => {
  const stones = useMemo(() => STONES.map(() => stoneMat(wheel.clone(true))), [wheel]);
  const palm = palmTex();
  return (
    <Stage bloom={0.5} threshold={0.85} seed={Math.floor(T * 30) % 97} fov={34} near={0.1} far={2500}>
      <CamRig T={T} keys={KEYS_A} fov={34} />
      <fog attach="fog" args={['#4a3a44', 30, 400]} />
      <mesh><sphereGeometry args={[600, 48, 24]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
      <hemisphereLight args={['#7a6a90', '#20160f', 0.6]} />
      <directionalLight position={[60, 12, -90]} intensity={2.4} color="#ffae6a" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-camera-near={1} shadow-camera-far={300} shadow-bias={-0.0005} />
      <Sea T={T} sky={sky} wn={wn} y={-0.4} />
      {/* the shore: a low sandy rise */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 6]} receiveShadow><circleGeometry args={[40, 64]} /><meshStandardMaterial color="#6a5a46" roughness={1} /></mesh>
      {STONES.map((s, i) => {
        const g = stones[i];
        return <group key={i} position={[s.x, s.s / 2 - 0.05, 0]} rotation={[Math.PI / 2, 0, s.ry]} scale={s.s / 2}><primitive object={g} /></group>;
      })}
      {[[-12, 0, -6, 9], [-7, 0, -10, 11], [10, 0, -5, 10], [14, 0, -11, 12], [0, 0, -14, 10]].map(([x, y, z, h], i) => (
        <sprite key={i} position={[x, y + h / 2, z]} scale={[h / 2, h, 1]} center={new THREE.Vector2(0.5, 0.5)}>
          <spriteMaterial map={palm} transparent depthWrite={false} fog />
        </sprite>
      ))}
    </Stage>
  );
};

// ---------------- B: at sea ----------------
const KEYS_B: Key[] = [
  [b(250) - 0.3, [10, 3.2, 14], [0, 0.6, 0]],
  [b(260), [4, 2.4, 16], [-3, 0.5, 0]],
];
const AtSea: React.FC<{ T: number; canoe: THREE.Group; wheel: THREE.Group; sky: THREE.Texture; wn: THREE.Texture }> = ({ T, canoe, wheel, sky, wn }) => {
  const c = useMemo(() => canoe.clone(true), [canoe]);
  const st = useMemo(() => stoneMat(wheel.clone(true)), [wheel]);
  const sway = 0.04 * Math.sin(T * 1.3), heave = 0.08 * Math.sin(T * 0.9);
  const x = (T - b(250)) * 0.6;
  return (
    <Stage bloom={0.5} threshold={0.85} seed={Math.floor(T * 30) % 97} fov={34} near={0.1} far={2500}>
      <CamRig T={T} keys={KEYS_B.map(([t, p, l]) => [t, [p[0] + x, p[1], p[2]], [l[0] + x, l[1], l[2]]] as Key)} fov={34} />
      <fog attach="fog" args={['#3a3040', 40, 500]} />
      <mesh><sphereGeometry args={[600, 48, 24]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
      <hemisphereLight args={['#7a6a90', '#10161f', 0.55]} />
      <directionalLight position={[60, 10, -90]} intensity={2.2} color="#ffae6a" />
      <Sea T={T} sky={sky} wn={wn} />
      <primitive object={c} position={[x + 2, -0.15 + heave, 0]} rotation={[sway, Math.PI / 2, 0]} />
      {/* the raft, towed behind */}
      <group position={[x - 7, -0.1 + 0.06 * Math.sin(T * 1.1 + 1), 0.3]} rotation={[0.03 * Math.sin(T * 1.4), 0, 0.04 * Math.sin(T)]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, 0.05, (i - 4) * 0.28]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.13, 0.13, 3.4, 10]} /><meshStandardMaterial color="#8a7a50" roughness={0.9} /></mesh>
        ))}
        <group position={[0, 0.18, 0]} scale={1.2}><primitive object={st} /></group>
      </group>
      {/* tow rope */}
      <mesh position={[x - 3.5, 0.2, 0.15]} rotation={[0, 0, Math.PI / 2 - 0.02]}><cylinderGeometry args={[0.025, 0.025, 5.6, 6]} /><meshStandardMaterial color="#c8b27a" roughness={0.9} /></mesh>
    </Stage>
  );
};

// ---------------- C + D: under water ----------------
const SINK0 = b(261), SAND = -6, LAND = b(268);
const stoneDepth = (T: number) => (T < LAND ? lerp(-0.6, SAND + 0.15, easeIn(Math.pow(prog(T, SINK0, LAND), 0.85))) : SAND + 0.15);
const KEYS_C: Key[] = [
  [b(260) - 0.3, [3.5, -1.0, 4.5], [0, -0.8, 0]],
  [LAND, [3.2, -4.6, 4.2], [0, -5.6, 0]],
  [b(280), [-2.8, -4.9, 4.4], [0, -5.7, 0]],
  [b(294) + 0.4, [-1.2, -0.6, 3.0], [0, 1.5, -0.5]],
];
let SHAFT: THREE.Texture | null = null;
const shaftTex = () => SHAFT ?? (SHAFT = canvasTex(64, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(200,240,255,0.9)'); gr.addColorStop(1, 'rgba(200,240,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  const h = g.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = h; g.fillRect(0, 0, 64, 512);
}));
let CAUSTIC: THREE.Texture | null = null;
const causticTex = () => CAUSTIC ?? (CAUSTIC = (() => {
  const t = canvasTex(512, 512, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = 'rgba(180,240,255,0.5)';
    for (let i = 0; i < 90; i++) { g.lineWidth = 1 + rnd(i, 1) * 3; g.beginPath(); const x = rnd(i, 2) * 512, y = rnd(i, 3) * 512, r = 20 + rnd(i, 4) * 50; g.ellipse(x, y, r, r * (0.5 + rnd(i, 5) * 0.5), rnd(i, 6) * 3, 0, Math.PI * 2); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6);
  return t;
})());

const Under: React.FC<{ T: number; wheel: THREE.Group }> = ({ T, wheel }) => {
  const st = useMemo(() => stoneMat(wheel.clone(true)), [wheel]);
  const y = stoneDepth(T);
  const k = prog(T, SINK0, LAND);
  const landed = T >= LAND;
  const c = causticTex();
  c.offset.set(T * 0.03, T * 0.02);
  const rise = easeInOut(prog(T, b(284), b(294) + 0.4));
  return (
    <Stage bloom={0.45} threshold={0.85} seed={Math.floor(T * 30) % 97} fov={34} bg="#06202c" near={0.05} far={300}>
      <CamRig T={T} keys={KEYS_C} fov={34} />
      <fog attach="fog" args={['#06202c', 2, 18]} />
      <hemisphereLight args={['#6fc4e0', '#0a2430', 1.6]} />
      <directionalLight position={[2, 20, 3]} intensity={1.2 + 1.5 * rise} color="#bfefff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-near={1} shadow-camera-far={40} />
      {/* sand, with moving caustics laid over it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND, 0]} receiveShadow><planeGeometry args={[80, 80, 60, 60]} /><meshStandardMaterial color="#8c8466" roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND + 0.01, 0]}><planeGeometry args={[80, 80]} /><meshBasicMaterial map={c} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      {/* the surface seen from below */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}><planeGeometry args={[200, 200]} /><meshBasicMaterial color={new THREE.Color('#3f9ab8').multiplyScalar(0.6 + 0.6 * rise)} transparent opacity={0.6} side={THREE.DoubleSide} fog={false} toneMapped={false} /></mesh>
      {/* light shafts */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[(i - 4) * 1.7 + Math.sin(T * 0.3 + i) * 0.3, -2.6, -1.5 - rnd(i, 1) * 3]} rotation={[0, 0, 0.18 + 0.05 * Math.sin(T * 0.2 + i)]}>
          <planeGeometry args={[0.6 + rnd(i, 2), 7]} />
          <meshBasicMaterial map={shaftTex()} transparent opacity={(0.08 + 0.08 * rnd(i, 3)) * (1 + rise)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <group position={[0, y, 0]} rotation={[landed ? 0.05 : 0.6 * (1 - k) + 0.05, k * 1.2, landed ? 0.04 : 0.3 * (1 - k)]} scale={1.2}><primitive object={st} /></group>
      {/* bubbles from the stone as it falls; a puff of sand where it lands */}
      {Array.from({ length: 40 }, (_, i) => {
        const t0 = SINK0 + rnd(i, 1) * (LAND - SINK0), t = T - t0;
        if (t < 0 || t > 3) return null;
        const s = 0.03 + rnd(i, 2) * 0.05;
        return <sprite key={i} position={[(rnd(i, 3) - 0.5) * 1.5, stoneDepth(t0) + t * (1.5 + rnd(i, 4)), (rnd(i, 5) - 0.5) * 1.5]} scale={[s, s, s]}><spriteMaterial map={softTex()} color="#d8f6ff" transparent opacity={0.6 * (1 - t / 3)} depthWrite={false} /></sprite>;
      })}
      {landed && T < LAND + 3 && Array.from({ length: 30 }, (_, i) => {
        const t = T - LAND, a = rnd(i, 1) * Math.PI * 2, v = 0.6 + rnd(i, 2);
        const s = (0.3 + rnd(i, 3) * 0.5) * (0.5 + t);
        return <sprite key={i} position={[Math.cos(a) * v * Math.sqrt(t) * 1.4, SAND + 0.1 + 0.4 * Math.sqrt(t) * rnd(i, 4), Math.sin(a) * v * Math.sqrt(t) * 1.4]} scale={[s, s, s]}><spriteMaterial map={softTex()} color="#a69a78" transparent opacity={0.35 * (1 - t / 3)} depthWrite={false} /></sprite>;
      })}
    </Stage>
  );
};

export const S9: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['stonewheel', 'canoe']);
  const wn = useAsset('waternormals', loadWN);
  const sky = useMemo(() => gradientSky(SKY_STOPS, { x: 0.25, y: 0.49, r: 0.3, color: 'rgba(255,170,100,0.85)' }), []);
  if (T < S9_IN || T > S9_OUT || !m || !wn) return null;
  const o = easeOut(prog(T, S9_IN, S9_IN + 0.6)) * (1 - easeIn(prog(T, S9_OUT - 0.5, S9_OUT)));
  const shot = T < b(250) ? 'A' : T < b(260) ? 'B' : 'C';
  const xB = easeInOut(prog(T, b(250) - 0.3, b(250) + 0.1));
  const xC = easeInOut(prog(T, b(260) - 0.3, b(260) + 0.2));
  const route = easeOut(prog(T, b(251), b(252))) * (1 - prog(T, b(259), b(260)));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {(shot === 'A' || xB < 1) && <Island T={T} wheel={m.stonewheel} sky={sky} wn={wn} />}
      {(shot === 'B' || (T >= b(250) - 0.3 && xC < 1)) && <AbsoluteFill style={{ opacity: shot === 'B' ? xB : 1 - xC }}><AtSea T={T} canoe={m.canoe} wheel={m.stonewheel} sky={sky} wn={wn} /></AbsoluteFill>}
      {T >= b(260) - 0.3 && <AbsoluteFill style={{ opacity: xC }}><Under T={T} wheel={m.stonewheel} /></AbsoluteFill>}
      {route > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: route }}>
          <g transform="translate(1440,170)">
            <rect x={-30} y={-50} width={420} height={180} rx={8} fill="rgba(5,6,11,0.55)" stroke="rgba(246,207,120,0.35)" />
            <circle cx={30} cy={90} r={8} fill={INK} /><text x={30} y={60} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: INK }}>帕劳</text>
            <circle cx={330} cy={10} r={8} fill={GOLD} /><text x={330} y={50} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: GOLD }}>雅浦</text>
            <path d="M40,86 Q180,10 320,12" fill="none" stroke={GOLD} strokeWidth={2.5} strokeDasharray="8 8" />
            <text x={180} y={110} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.7)' }}>约 400–450 公里</text>
          </g>
        </svg>
      )}
      <Chapter T={T} at={b(239) + 0.2} out={b(259)} text="约1900年 · 雅浦岛" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S9} />
    </AbsoluteFill>
  );
};

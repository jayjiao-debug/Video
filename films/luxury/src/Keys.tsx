/* Style and scene key frames for 《你买的不是包》: one frame per shot (render frames 0, 1, 2 …).
   The same bag travels through every set: workshop → boutique vitrine → the door → the waiting list → the price →
   home → the unsold → the fakes → the breakdown. */
import React, { useMemo } from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { Stage, Cam } from './Stage';
import { Bag, BAG } from './Bag';
import { RingBox, Watch, Perfume, Scarf, GiftBox } from './Props';
import { stoneTex, cardTex, silhouetteTex, shutterTex, plasterTex } from './ltex';
import { oakTex, glowTex, nightTex } from './tex';
import { GOLD, INK } from './art';
import { font } from './brand/lib';
import { JUNO } from './brand/identity';

const cone = () => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,236,200,0.9)'); gr.addColorStop(1, 'rgba(255,236,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

/** a visible beam of light from above (additive cone) */
const Beam: React.FC<{ pos: [number, number, number]; h: number; r: number; o: number; color?: string }> = ({ pos, h, r, o, color = '#ffe6bf' }) => {
  const t = useMemo(cone, []);
  return <mesh position={[pos[0], pos[1] - h / 2, pos[2]]}><cylinderGeometry args={[0.02, r, h, 48, 1, true]} /><meshBasicMaterial map={t} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>;
};
const Tag: React.FC<{ lines: [string, number, string?][]; w: number; h: number; tw?: number; th?: number } & JSX.IntrinsicElements['mesh']> = ({ lines, w, h, tw = 512, th = 320, ...m }) => {
  const t = useMemo(() => cardTex(lines, tw, th), []); // eslint-disable-line react-hooks/exhaustive-deps
  return <mesh castShadow {...m}><planeGeometry args={[w, h]} /><meshStandardMaterial map={t} roughness={0.85} side={THREE.DoubleSide} /></mesh>;
};

/** a spot light whose target is part of the scene (R3F does not add the target by itself) */
const Spot: React.FC<{ position: [number, number, number]; target: [number, number, number]; angle: number; penumbra: number; intensity: number; color: string; distance?: number; decay?: number; castShadow?: boolean; map?: number }> =
  ({ position, target, angle, penumbra, intensity, color, distance = 6, decay = 2, castShadow }) => {
    const l = useMemo(() => new THREE.SpotLight(), []);
    l.position.set(...position); l.angle = angle; l.penumbra = penumbra; l.intensity = intensity; l.color.set(color); l.distance = distance; l.decay = decay;
    l.castShadow = !!castShadow; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0003;
    l.target.position.set(...target); l.target.updateMatrixWorld();
    return <><primitive object={l} /><primitive object={l.target} /></>;
  };

/* ------------------------------------------------------------------ sets */
const Workshop: React.FC = () => {
  const tx = useMemo(() => ({ oak: oakTex(), wall: plasterTex(), bulb: glowTex('rgba(255,210,140,1)', 'rgba(255,160,60,0)') }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.4, 1.2]} /><meshStandardMaterial map={tx.oak} color="#8a7a66" roughness={0.75} /></mesh>
      <mesh position={[0, 0.8, -0.5]} receiveShadow><planeGeometry args={[4, 2]} /><meshStandardMaterial map={tx.wall} roughness={1} /></mesh>
      {/* a hide draped over the back of the bench, offcuts, an awl, a spool */}
      {[[-0.5, 0.05, -0.28, 0.2, 0.05], [-0.46, 0.13, -0.3, 0.14, 0.045]].map(([x, y, z, a, r], i) => <mesh key={i} position={[x, y, z]} rotation={[0, a, Math.PI / 2]} castShadow receiveShadow><cylinderGeometry args={[r, r, 0.42, 32]} /><meshStandardMaterial color={i ? '#3d2418' : '#5a1a1c'} roughness={0.55} /></mesh>)}
      {[[0.3, 0.2, 0.4], [0.42, 0.28, 1.4], [0.36, 0.12, 2.6]].map(([x, z, a], i) => <mesh key={i} position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, a]} receiveShadow><circleGeometry args={[0.04, 5]} /><meshStandardMaterial color="#5a1a1c" roughness={0.6} /></mesh>)}
      <group position={[0.28, 0.008, 0.05]} rotation={[0, 0.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.012, 0.012, 0.09, 16]} /><meshStandardMaterial color="#3a2a1a" roughness={0.5} /></mesh>
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.003, 0.08, 8]} /><meshStandardMaterial color="#aaa" metalness={1} roughness={0.3} /></mesh>
      </group>
      <mesh position={[-0.28, 0.025, 0.12]} castShadow><cylinderGeometry args={[0.02, 0.02, 0.05, 24]} /><meshStandardMaterial color="#d9c9a6" roughness={0.8} /></mesh>
      {/* the bare bulb: the only light */}
      <mesh position={[-0.1, 0.62, 0.05]}><sphereGeometry args={[0.025, 24, 24]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>
      <mesh position={[-0.1, 1.0, 0.05]}><cylinderGeometry args={[0.002, 0.002, 0.74, 6]} /><meshStandardMaterial color="#111" /></mesh>
      <sprite position={[-0.1, 0.62, 0.05]} scale={[0.4, 0.4, 1]}><spriteMaterial map={tx.bulb} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <pointLight position={[-0.1, 0.6, 0.05]} intensity={1.6} distance={3} decay={2} color="#ffb867" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <ambientLight intensity={0.05} color="#8899aa" />
      {/* the bag, unfinished-looking (matte, no sheen), with a paper tag */}
      <Bag position={[0, 0, 0]} rotation={[0, -0.35, 0]} sheen={0} />
      <Tag lines={[['€ 53', 96]]} w={0.07} h={0.045} position={[0.13, 0.19, 0.11]} rotation={[0.1, -0.5, 0.25]} />
      <mesh position={[0.1, 0.235, 0.08]} rotation={[0, 0, 0.9]}><cylinderGeometry args={[0.0006, 0.0006, 0.08, 4]} /><meshStandardMaterial color="#ddd" /></mesh>
    </group>
  );
};

const Boutique: React.FC<{ empty?: boolean; card?: boolean; price?: boolean }> = ({ empty, card, price }) => {
  const tx = useMemo(() => ({ marble: stoneTex('marble'), trav: stoneTex('travertine') }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={tx.marble} roughness={0.12} metalness={0.1} /></mesh>
      {/* back wall: travertine with brass reveals */}
      <mesh position={[0, 2, -1.6]} receiveShadow><planeGeometry args={[8, 4]} /><meshStandardMaterial map={tx.trav} color="#6a5a48" roughness={0.8} /></mesh>
      {[-1.8, -0.9, 0.9, 1.8].map((x) => <mesh key={x} position={[x, 2, -1.59]}><boxGeometry args={[0.02, 4, 0.01]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.3} /></mesh>)}
      {/* plinth and the glass case */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 0.9, 0.5]} /><meshStandardMaterial map={tx.trav} roughness={0.6} /></mesh>
      <mesh position={[0, 0.905, 0]}><boxGeometry args={[0.62, 0.01, 0.52]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.25} /></mesh>
      <mesh position={[0, 0.91 + 0.24, 0]}><boxGeometry args={[0.56, 0.48, 0.46]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.07} roughness={0.02} clearcoat={1} depthWrite={false} /></mesh>
      {[[-0.28, -0.23], [0.28, -0.23], [-0.28, 0.23], [0.28, 0.23]].map(([x, z], i) => <mesh key={i} position={[x, 1.15, z]}><boxGeometry args={[0.006, 0.48, 0.006]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.25} /></mesh>)}
      {!empty && <Bag position={[0, 0.915, 0]} rotation={[0, -0.25, 0]} />}
      {price && <Tag lines={[['€ 2,600', 70]]} w={0.11} h={0.05} position={[0.2, 0.93, 0.17]} rotation={[-1.1, 0, -0.2]} />}
      {card && <Tag lines={[['暂时缺货', 46, '900 46px "Noto Serif CJK SC", serif'], ['可登记等候', 30, '500 30px "Noto Sans CJK SC", sans-serif']]} w={0.2} h={0.125} position={[0, 0.97, 0.04]} rotation={[-0.35, 0, 0]} />}
      {/* the key light: a tight spot straight down onto the case, and its beam in the air */}
      <Spot position={[0, 3.2, 0.2]} angle={0.16} penumbra={0.55} intensity={38} distance={6} decay={2} color="#ffe2b8" castShadow target={[0, 0.9, 0]} />
      <Beam pos={[0, 3.2, 0.2]} h={2.3} r={0.42} o={0.07} />
      {/* faint warm wash on the back wall, cool fill */}
      <Spot position={[0, 3.6, -0.6]} angle={0.9} penumbra={1} intensity={3} distance={6} decay={2} color="#ffcf9a" target={[0, 1.4, -1.6]} />
      <ambientLight intensity={0.03} color="#8090b0" />
    </group>
  );
};

const Door: React.FC = () => {
  const tx = useMemo(() => ({ marble: stoneTex('marble'), sil: silhouetteTex() }), []);
  const rope = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 0.86, 0), new THREE.Vector3(-0.3, 0.66, 0), new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(0.3, 0.66, 0), new THREE.Vector3(0.6, 0.86, 0)]), 64, 0.018, 12, false), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 8]} /><meshStandardMaterial map={tx.marble} roughness={0.1} metalness={0.1} /></mesh>
      {/* stanchions and the velvet rope */}
      {[-0.6, 0.6].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.015, 0]} castShadow><cylinderGeometry args={[0.13, 0.15, 0.03, 40]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.2} /></mesh>
          <mesh position={[0, 0.45, 0]} castShadow><cylinderGeometry args={[0.022, 0.022, 0.9, 24]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.2} /></mesh>
          <mesh position={[0, 0.92, 0]} castShadow><sphereGeometry args={[0.04, 24, 24]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.2} /></mesh>
        </group>))}
      <mesh geometry={rope} castShadow><meshPhysicalMaterial color="#6e0f18" roughness={0.9} sheen={1} sheenColor={new THREE.Color('#ff5a6a')} sheenRoughness={0.4} /></mesh>
      {/* the glass front and the queue outside, backlit by the street */}
      <mesh position={[0, 1.4, -2.2]}><planeGeometry args={[6, 2.8]} /><meshBasicMaterial color="#5f6f92" toneMapped={false} /></mesh>
      <mesh position={[0, 1.0, -2.15]}><planeGeometry args={[4.6, 1.7]} /><meshBasicMaterial map={tx.sil} transparent opacity={0.85} toneMapped={false} /></mesh>
      <mesh position={[0, 1.4, -2.1]}><planeGeometry args={[6, 2.8]} /><meshPhysicalMaterial color="#c8d4ec" transparent opacity={0.4} roughness={0.6} /></mesh>
      {[-2, -0.7, 0.7, 2].map((x) => <mesh key={x} position={[x, 1.4, -2.08]}><boxGeometry args={[0.06, 2.8, 0.06]} /><meshStandardMaterial color="#141414" metalness={0.6} roughness={0.4} /></mesh>)}
      {/* cold street light through the glass, long shadows toward us */}
      <directionalLight position={[0.3, 1.2, -4]} intensity={1.6} color="#9fb6e6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <Spot position={[0, 3, 1]} angle={0.5} penumbra={0.8} intensity={5} color="#ffd8a8" distance={6} decay={2} target={[0, 0.6, 0]} />
      <ambientLight intensity={0.04} />
    </group>
  );
};

const Wine: React.FC = () => {
  const tx = useMemo(() => ({ marble: stoneTex('marble') }), []);
  const glass = useMemo(() => {
    const p = [[0, 0], [0.035, 0], [0.036, 0.004], [0.006, 0.01], [0.004, 0.09], [0.012, 0.1], [0.038, 0.13], [0.043, 0.17], [0.036, 0.21], [0.035, 0.212]].map(([x, y]) => new THREE.Vector2(x, y));
    const w = [[0, 0.1], [0.012, 0.102], [0.034, 0.13], [0.039, 0.15], [0, 0.15]].map(([x, y]) => new THREE.Vector2(x, y));
    return { glass: new THREE.LatheGeometry(p, 64), wine: new THREE.LatheGeometry(w, 64) };
  }, []);
  const G = ({ x, warm }: { x: number; warm: boolean }) => (
    <group position={[x, 0, 0]}>
      <mesh geometry={glass.glass} castShadow><meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.02} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh geometry={glass.wine}><meshPhysicalMaterial color="#5a0612" roughness={0.05} clearcoat={1} emissive="#3a0208" emissiveIntensity={warm ? 0.6 : 0.1} /></mesh>
      <Tag lines={[[warm ? '$ 90' : '$ 10', 80]]} w={0.07} h={0.044} position={[0.075, 0.024, 0.03]} rotation={[0, -0.2, 0]} />
    </group>);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4, 4]} /><meshStandardMaterial map={tx.marble} roughness={0.15} /></mesh>
      <G x={-0.13} warm={false} /><G x={0.13} warm />
      <Spot position={[0.13, 1.4, 0.2]} angle={0.14} penumbra={0.6} intensity={14} color="#ffd9a8" distance={3} decay={2} castShadow target={[0.13, 0.1, 0]} />
      <Spot position={[-0.13, 1.4, 0.2]} angle={0.14} penumbra={0.6} intensity={3} color="#9fb2d8" distance={3} decay={2} castShadow target={[-0.13, 0.1, 0]} />
      <Beam pos={[0.13, 1.4, 0.2]} h={1.2} r={0.17} o={0.06} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

const Home: React.FC = () => {
  const tx = useMemo(() => ({ oak: oakTex(), night: nightTex(), lamp: glowTex('rgba(255,210,150,1)', 'rgba(255,170,90,0)') }), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[3, 1.6]} /><meshStandardMaterial map={tx.oak} color="#9a8a76" roughness={0.5} /></mesh>
      <mesh position={[0, 1, -0.7]}><planeGeometry args={[4, 2.2]} /><meshStandardMaterial color="#26221f" roughness={1} /></mesh>
      <mesh position={[-0.75, 0.75, -0.69]}><planeGeometry args={[0.7, 0.9]} /><meshBasicMaterial map={tx.night} toneMapped={false} color="#888" /></mesh>
      {/* the box it came in, open, tissue paper */}
      <group position={[0.38, 0, -0.08]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow><boxGeometry args={[0.42, 0.12, 0.3]} /><meshStandardMaterial color="#e9e1d2" roughness={0.7} /></mesh>
        <mesh position={[0, 0.121, 0]}><boxGeometry args={[0.4, 0.002, 0.28]} /><meshStandardMaterial color="#2a2622" roughness={0.9} /></mesh>
      </group>
      <Bag position={[-0.12, 0, 0.04]} rotation={[0, 0.3, 0]} />
      {/* a table lamp, warm, going down */}
      <mesh position={[-0.6, 0.42, -0.3]} visible={false}><sphereGeometry args={[0.03, 16, 16]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>
      <sprite position={[-0.5, 0.5, -0.35]} scale={[0.6, 0.6, 1]}><spriteMaterial map={tx.lamp} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <pointLight position={[-0.42, 0.4, -0.1]} intensity={1.5} distance={2.5} decay={2} color="#ffb870" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-1.5, 1.2, -2]} intensity={0.5} color="#7f98d8" />
      <ambientLight intensity={0.04} />
    </group>
  );
};

const Unsold: React.FC = () => {
  const tx = useMemo(() => ({ shutter: shutterTex(), ember: glowTex('rgba(255,160,60,1)', 'rgba(255,80,10,0)'), wall: plasterTex() }), []);
  const sparks = useMemo(() => { const n = 260, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const r = Math.sin(i * 12.9898) * 43758.5453, u = r - Math.floor(r), v = (Math.sin(i * 78.233) * 43758.5453) % 1; p.set([(u - 0.5) * 2.2, 0.05 + Math.abs(v) * 0.9 * u, -0.05 + Math.abs(v) * 0.4], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g; }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 4]} /><meshStandardMaterial color="#1a1918" roughness={0.6} metalness={0.2} /></mesh>
      <mesh position={[0, 1.6, -0.62]}><planeGeometry args={[6, 3.2]} /><meshStandardMaterial map={tx.wall} color="#6a6058" roughness={1} /></mesh>
      {/* the shutter, a third of the way up; fire light under it */}
      <mesh position={[0, 1.15, -0.6]} castShadow><planeGeometry args={[2.4, 1.7]} /><meshStandardMaterial map={tx.shutter} metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[0, 0.15, -0.9]}><planeGeometry args={[2.4, 0.3]} /><meshBasicMaterial color="#ff8a2a" toneMapped={false} /></mesh>
      <sprite position={[0, 0.1, -0.5]} scale={[2.4, 0.45, 1]}><spriteMaterial map={tx.ember} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      <pointLight position={[0, 0.15, -0.3]} intensity={2.2} distance={4} decay={2} color="#ff7a2a" castShadow />
      <points geometry={sparks}><pointsMaterial size={0.012} color="#ffb060" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></points>
      {/* the boxes waiting their turn */}
      {[[-0.9, 0.12, 0.2, 0.1], [-0.6, 0.12, 0.35, -0.2], [-0.75, 0.36, 0.28, 0.05], [0.8, 0.12, 0.3, 0.15], [1.05, 0.12, 0.1, -0.1]].map(([x, y, z, a], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, a, 0]} castShadow receiveShadow><boxGeometry args={[0.36, 0.24, 0.28]} /><meshStandardMaterial color="#e2d8c6" roughness={0.7} /></mesh>))}
      <Spot position={[-1.5, 3, 1.5]} target={[0, 1.1, -0.6]} angle={0.6} penumbra={1} intensity={30} color="#8fa4d6" castShadow />
      <ambientLight intensity={0.03} color="#6070a0" />
    </group>
  );
};

const Fakes: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4, 4]} /><meshStandardMaterial color="#0c0a12" roughness={0.3} /></mesh>
    <Bag position={[-0.22, 0, 0]} rotation={[0, 0.25, 0]} />
    <Bag position={[0.22, 0, 0]} rotation={[0, -0.25, 0]} uv={1} />
    {/* one UV lamp: violet, low, from the front */}
    <Spot position={[0, 0.9, 0.9]} angle={0.5} penumbra={0.7} intensity={9} color="#7b3cff" distance={4} decay={2} castShadow target={[0, 0.12, 0]} />
    <mesh position={[0, 0.9, 0.9]}><boxGeometry args={[0.3, 0.03, 0.05]} /><meshBasicMaterial color="#b28cff" toneMapped={false} /></mesh>
    <ambientLight intensity={0.02} color="#5a3cff" />
  </group>
);

const Breakdown: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#070708" roughness={0.2} /></mesh>
    <Bag position={[-0.05, 0, 0]} rotation={[0, -0.45, 0]} />
    <Spot position={[0, 2.6, 0.6]} angle={0.25} penumbra={0.6} intensity={22} color="#ffe2b8" distance={5} decay={2} castShadow target={[0, 0.2, 0]} />
    <Beam pos={[0, 2.6, 0.6]} h={2.4} r={0.6} o={0.05} />
    <ambientLight intensity={0.04} />
  </group>
);

/** the window display: a stepped travertine stand, every icon of luxury on it, the bag at the top */
const Display: React.FC = () => {
  const tx = useMemo(() => ({ trav: stoneTex('travertine'), marble: stoneTex('marble') }), []);
  const step = (w: number, h: number, d: number, z: number) => <group><mesh position={[0, h / 2, z]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshPhysicalMaterial color="#08080a" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} /></mesh><mesh position={[0, h - 0.002, z + d / 2 + 0.001]}><boxGeometry args={[w, 0.004, 0.003]} /><meshStandardMaterial color="#c79a52" metalness={0.7} roughness={0.25} emissive="#3a2608" emissiveIntensity={0.5} /></mesh></group>;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial map={tx.marble} roughness={0.12} metalness={0.1} /></mesh>
      <mesh position={[0, 1.2, -1.2]}><planeGeometry args={[6, 3]} /><meshStandardMaterial map={tx.trav} color="#3a3128" roughness={0.9} /></mesh>
      {step(1.1, 0.07, 0.22, 0.12)}{step(0.9, 0.16, 0.22, -0.1)}{step(0.56, 0.27, 0.26, -0.34)}
      <Bag position={[0, 0.27, -0.34]} rotation={[0, -0.18, 0]} />
      <group position={[-0.3, 0.16, -0.12]} scale={1.5}><Perfume rotation={[0, 0.5, 0]} /></group>
      <group position={[0.3, 0.16, -0.12]} scale={1.3}><GiftBox rotation={[0, -0.4, 0]} /></group>
      <group position={[0.0, 0.16, -0.08]}><Scarf /></group>
      <group position={[-0.25, 0.07, 0.12]} scale={1.7}><RingBox rotation={[0, 0.35, 0]} /></group>
      <group position={[0.25, 0.07, 0.12]} scale={1.7}><Watch rotation={[0, -0.3, 0]} t={0.07} /></group>
      <Spot position={[0.3, 2.2, 1.4]} target={[0, 0.15, -0.1]} angle={0.32} penumbra={0.6} intensity={17} color="#ffe2b8" castShadow />
      <Spot position={[-1.2, 1.4, -1.0]} target={[0, 0.3, -0.3]} angle={0.5} penumbra={0.8} intensity={10} color="#ffc98a" />
      <Spot position={[1.2, 1.4, -1.0]} target={[0, 0.3, -0.3]} angle={0.5} penumbra={0.8} intensity={8} color="#9fb4e0" />
      <Beam pos={[0.3, 2.2, 1.4]} h={2.0} r={0.5} o={0.03} />
      <ambientLight intensity={0.03} />
    </group>
  );
};

/** the hero bag in three colourways, to choose the film's one */
const Colorways: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#0a0a0b" roughness={0.18} /></mesh>
    {[['#0d0d0f', -0.42], ['#6a0f16', 0], ['#8a4a22', 0.42]].map(([col, x]) => (
      <group key={col as string}>
        <Bag position={[x as number, 0, 0]} rotation={[0, -0.2, 0]} color={col as string} />
        <Spot position={[(x as number) + 0.1, 1.6, 0.6]} target={[x as number, 0.12, 0]} angle={0.17} penumbra={0.6} intensity={12} color="#ffe6c4" castShadow />
      </group>))}
    <ambientLight intensity={0.04} />
  </group>
);

/* ------------------------------------------------------------------ key frames */
type K = { name: string; set: React.ReactNode; cam: Cam; sub?: string; bg?: string; overlay?: 'title' | 'breakdown' };
const c = (pos: [number, number, number], look: [number, number, number], fov: number, ap: number, bloom: number, exposure = 1, env = 0.4): Cam =>
  ({ pos, look, fov, focus: Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]), aperture: ap, bloom, exposure, env });

export const KEYS: K[] = [
  { name: '01 工坊 · 53 欧元', set: <Workshop />, cam: c([0.36, 0.3, 0.62], [0.02, 0.15, 0], 34, 0.006, 0.55, 1.05), sub: '这只包，从代工厂出来时，值53欧元。' },
  { name: '02 精品店 · 2600 欧元 + 标题', set: <Boutique price />, cam: c([0.32, 1.28, 1.45], [-0.3, 1.1, 0], 32, 0.003, 0.6), overlay: 'title' },
  { name: '03 门口 · 排队', set: <Door />, cam: c([0.4, 0.42, 1.7], [0, 0.75, -1], 38, 0.003, 0.5), sub: '我们想要的，往往是别人想要的。' },
  { name: '04 等待 · 买不到', set: <Boutique empty card />, cam: c([0.45, 1.32, 0.95], [0, 1.0, 0], 30, 0.006, 0.55), sub: '欲望最强的时候，是"快要得到"之前。' },
  { name: '05 价格 · 同一杯酒', set: <Wine />, cam: c([0.0, 0.3, 0.7], [0, 0.05, 0], 30, 0.01, 0.6), sub: '同一杯酒，标90美元，大脑觉得它更好喝。' },
  { name: '06 到手以后', set: <Home />, cam: c([0.5, 0.42, 0.95], [0, 0.15, -0.05], 34, 0.004, 0.5), sub: '拿到以后，那股劲，很快就退了。' },
  { name: '07 卖不掉的', set: <Unsold />, cam: c([0.6, 0.8, 2.7], [0, 0.75, -0.5], 36, 0.002, 0.55), sub: '2018年，一个品牌销毁了2860万英镑的存货。' },
  { name: '08 假的 · 紫外灯下', set: <Fakes />, cam: c([0.0, 0.28, 0.85], [0, 0.14, 0], 32, 0.006, 0.8, 1.1), sub: '全球假货贸易：4670亿美元。', bg: '#05030a' },
  { name: '09 揭晓 · 差价拆开', set: <Breakdown />, cam: c([0.55, 0.42, 1.0], [0.2, 0.18, 0], 34, 0.003, 0.6), overlay: 'breakdown' },
  { name: '10 橱窗 · 奢侈品全家福', set: <Display />, cam: c([0.14, 0.62, 1.32], [0, 0.24, -0.16], 34, 0.003, 0.6), sub: '包、表、钻戒、香水、丝巾——同一套欲望。' },
  { name: '11 主角特写 · 金色价签', set: <Boutique />, cam: c([0.3, 1.2, 0.66], [0.03, 1.1, 0], 30, 0.008, 0.6) },
  { name: '12 主角 · 三种配色', set: <Colorways />, cam: c([0, 0.42, 1.25], [0, 0.14, 0], 32, 0.002, 0.55) },
];

const Overlay: React.FC<{ k: K }> = ({ k }) => {
  const goldText: React.CSSProperties = { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 26px rgba(241,197,109,0.4))' };
  if (k.overlay === 'title') return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 120, top: 330, fontFamily: font.serif, fontWeight: 900, fontSize: 140, letterSpacing: '0.04em', ...goldText }}>你买的<br />不是包</div>
      <div style={{ position: 'absolute', left: 126, top: 690, fontFamily: font.sans, fontWeight: 700, fontSize: 42, color: INK }}>多出来的2547欧元，买的是什么？</div>
      <div style={{ position: 'absolute', left: 126, top: 760, fontFamily: 'JunoMono, monospace', fontSize: 22, letterSpacing: '0.4em', color: 'rgba(241,197,109,0.75)' }}>— {JUNO.series} —</div>
    </AbsoluteFill>);
  if (k.overlay === 'breakdown') {
    const rows: [string, string, boolean?][] = [['皮 · 五金 · 工时', '€ 53'], ['排队', '别人想要'], ['等待', '"快要得到"'], ['价格', '越贵越好'], ['logo', '给别人看'], ['差价', '€ 2,547', true]];
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', right: 130, top: 230, width: 560 }}>
          {rows.map(([a, b, g], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: `1px solid ${g ? GOLD : 'rgba(243,237,226,0.22)'}`, fontFamily: font.sans, fontWeight: 700, fontSize: g ? 48 : 38, color: g ? GOLD : INK }}>
              <span>{a}</span><span style={{ fontFamily: g ? font.latin : font.sans, fontVariantNumeric: 'lining-nums', color: g ? GOLD : 'rgba(243,237,226,0.7)' }}>{b}</span>
            </div>))}
        </div>
      </AbsoluteFill>);
  }
  return null;
};

export const Keys: React.FC = () => {
  const f = useCurrentFrame(), k = KEYS[Math.min(KEYS.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format("woff2"); font-weight: 600; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }`}</style>
      <ThreeCanvas width={1920} height={1080} camera={{ fov: 34, position: [0, 1, 2], near: 0.01, far: 60 }} gl={{ antialias: true }} shadows>
        <Stage cam={k.cam} bg={k.bg}>{k.set}</Stage>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <Overlay k={k} />
      {k.sub && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 86, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 68, color: INK, WebkitTextStroke: '2px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 4px 18px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}>{k.sub}</div>}
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: k.overlay === 'title' ? 0 : 0.55, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};
export const _bag = BAG;

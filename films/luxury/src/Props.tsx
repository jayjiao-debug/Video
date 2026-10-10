/* The other luxury icons, each a category archetype in our own design (no house's shape, print, colour or mark):
   a solitaire in a velvet box, a mechanical watch with an open heart, a crystal perfume bottle, a silk scarf,
   a lacquered gift box with a satin ribbon. All bottom-centred at the origin, in metres. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { canvasTex } from './tex';

const GOLD = { color: '#e0b468', metalness: 0.7, roughness: 0.26, emissive: '#3a2608', emissiveIntensity: 0.6 } as const;
const PLAT = { color: '#e6e8ec', metalness: 0.8, roughness: 0.15, emissive: '#22262c', emissiveIntensity: 0.6 } as const;
type G = JSX.IntrinsicElements['group'];

/** a round brilliant: crown and pavilion as a faceted lathe */
const diamondGeo = () => {
  const p = [[0, -0.0058], [0.0048, -0.0004], [0.005, 0], [0.0046, 0.0012], [0.0026, 0.0022], [0, 0.0022]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(p, 16); g.computeVertexNormals(); return g.toNonIndexed();
};
export const RingBox: React.FC<G> = (g) => {
  const geo = useMemo(() => ({ base: new RoundedBoxGeometry(0.07, 0.035, 0.07, 4, 0.008), lid: new RoundedBoxGeometry(0.07, 0.022, 0.07, 4, 0.008), gem: diamondGeo() }), []);
  const velvet = <meshPhysicalMaterial color="#13203f" roughness={0.9} sheen={1} sheenColor={new THREE.Color('#6b86d6')} sheenRoughness={0.5} />;
  return (
    <group {...g}>
      <mesh geometry={geo.base} position={[0, 0.0175, 0]} castShadow receiveShadow>{velvet}</mesh>
      {/* the lid, open, hinged at the back */}
      <group position={[0, 0.035, -0.035]} rotation={[-1.95, 0, 0]}>
        <mesh geometry={geo.lid} position={[0, 0.011, 0.035]} castShadow>{velvet}</mesh>
        <mesh position={[0, -0.0005, 0.035]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.062, 0.062]} /><meshStandardMaterial color="#b8ad98" roughness={0.8} side={THREE.DoubleSide} /></mesh>
      </group>
      <mesh position={[0, 0.0352, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.062, 0.062]} /><meshStandardMaterial color="#0d1630" roughness={0.95} /></mesh>
      {/* the ring standing in its slot */}
      <group position={[0, 0.047, 0.002]}>
        <mesh><torusGeometry args={[0.0095, 0.0013, 16, 64]} /><meshStandardMaterial {...PLAT} /></mesh>
        {[-0.003, 0.003].map((x) => <mesh key={x} position={[x, 0.0102, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}><cylinderGeometry args={[0.0005, 0.0005, 0.005, 6]} /><meshStandardMaterial {...PLAT} /></mesh>)}
        <mesh geometry={geo.gem} position={[0, 0.0145, 0]}>
          <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0} transmission={1} thickness={0.01} ior={2.42} dispersion={4} envMapIntensity={3} specularIntensity={1} flatShading />
        </mesh>
      </group>
    </group>
  );
};

/** a mechanical watch: polished case, sunburst dial, open window onto the balance wheel, leather strap, on a cushion */
export const Watch: React.FC<G & { t?: number }> = ({ t = 0, ...g }) => {
  const tx = useMemo(() => ({
    dial: canvasTex(512, 512, (c) => {
      const gr = c.createRadialGradient(256, 256, 10, 256, 256, 256); gr.addColorStop(0, '#2b3a5a'); gr.addColorStop(1, '#0e1526'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
      for (let a = 0; a < 360; a += 1.5) { c.strokeStyle = `rgba(255,255,255,${0.02 + 0.03 * Math.abs(Math.sin(a * 0.05))})`; c.beginPath(); c.moveTo(256, 256); c.lineTo(256 + Math.cos(a * Math.PI / 180) * 256, 256 + Math.sin(a * Math.PI / 180) * 256); c.stroke(); }
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.save(); c.translate(256 + Math.sin(a) * 200, 256 - Math.cos(a) * 200); c.rotate(a); c.fillStyle = '#e8d3a0'; c.fillRect(-6, -22, 12, 44); c.restore(); }
      c.fillStyle = '#000'; c.beginPath(); c.arc(256, 360, 70, 0, 7); c.fill(); // the window at six o'clock
    }),
  }), []);
  const balance = Math.sin(t * Math.PI * 2 * 4) * 1.6;
  return (
    <group {...g}>
      {/* cushion */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.6, 0.8]} castShadow receiveShadow><sphereGeometry args={[0.04, 32, 24]} /><meshPhysicalMaterial color="#9c9384" roughness={0.9} sheen={0.6} /></mesh>
      <group position={[0, 0.05, 0.004]} rotation={[-0.35, 0, 0]}>
        {/* strap over the cushion */}
        {[1, -1].map((s) => <mesh key={s} position={[0, s * 0.03, -0.012]} rotation={[s * 0.5, 0, 0]} castShadow><boxGeometry args={[0.02, 0.045, 0.003]} /><meshPhysicalMaterial color="#3a1d12" roughness={0.5} clearcoat={0.4} /></mesh>)}
        {/* case, bezel, crown */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.0205, 0.009, 64]} /><meshStandardMaterial {...GOLD} roughness={0.12} /></mesh>
        <mesh position={[0, 0, 0.0046]}><torusGeometry args={[0.0185, 0.0016, 16, 64]} /><meshStandardMaterial {...GOLD} roughness={0.08} /></mesh>
        <mesh position={[0.0215, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.0025, 0.0025, 0.004, 16]} /><meshStandardMaterial {...GOLD} /></mesh>
        <mesh position={[0, 0, 0.0047]}><circleGeometry args={[0.0172, 64]} /><meshStandardMaterial map={tx.dial} roughness={0.35} metalness={0.4} /></mesh>
        {/* the balance wheel through the window */}
        <group position={[0, -0.0071, 0.0046]} rotation={[0, 0, balance]}>
          <mesh><torusGeometry args={[0.0036, 0.0004, 8, 32]} /><meshStandardMaterial {...GOLD} /></mesh>
          <mesh><boxGeometry args={[0.0072, 0.0004, 0.0003]} /><meshStandardMaterial {...GOLD} /></mesh>
        </group>
        {/* hands */}
        <mesh position={[0, 0.004, 0.0052]} rotation={[0, 0, -0.5]}><boxGeometry args={[0.0012, 0.011, 0.0004]} /><meshStandardMaterial color="#efe0b8" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0.003, 0.0018, 0.0054]} rotation={[0, 0, -2.1]}><boxGeometry args={[0.0012, 0.008, 0.0004]} /><meshStandardMaterial color="#efe0b8" metalness={0.8} roughness={0.2} /></mesh>
        {/* sapphire crystal */}
        <mesh position={[0, 0, 0.0056]}><circleGeometry args={[0.0178, 64]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.08} roughness={0} clearcoat={1} /></mesh>
      </group>
    </group>
  );
};

/** a crystal flacon: a thick-walled block with bevelled edges, amber juice, a gold collar and a round stopper */
export const Perfume: React.FC<G> = (g) => {
  const geo = useMemo(() => ({ glass: new RoundedBoxGeometry(0.06, 0.075, 0.035, 6, 0.008), juice: new RoundedBoxGeometry(0.046, 0.05, 0.022, 4, 0.006) }), []);
  return (
    <group {...g}>
      <mesh geometry={geo.juice} position={[0, 0.032, 0]}><meshPhysicalMaterial color="#d99a32" roughness={0.1} clearcoat={1} emissive="#7a4508" emissiveIntensity={0.5} /></mesh>
      <mesh geometry={geo.glass} position={[0, 0.0375, 0]} castShadow>
        <meshPhysicalMaterial color="#f4f8ff" roughness={0.02} transparent opacity={0.22} clearcoat={1} envMapIntensity={3} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.079, 0]}><cylinderGeometry args={[0.009, 0.009, 0.008, 32]} /><meshStandardMaterial {...GOLD} /></mesh>
      <mesh position={[0, 0.094, 0]} castShadow><sphereGeometry args={[0.013, 32, 24]} /><meshStandardMaterial {...GOLD} roughness={0.15} /></mesh>
    </group>
  );
};

/** a silk square in our own print (gold links on deep navy), draped over the edge of a plinth */
export const Scarf: React.FC<G> = (g) => {
  const tx = useMemo(() => canvasTex(1024, 1024, (c) => {
    c.fillStyle = '#16244a'; c.fillRect(0, 0, 1024, 1024);
    c.strokeStyle = '#c99a4a'; c.lineWidth = 10; c.strokeRect(40, 40, 944, 944); c.lineWidth = 3; c.strokeRect(70, 70, 884, 884);
    for (let y = 160; y < 900; y += 110) for (let x = 160; x < 900; x += 110) { c.strokeStyle = (x + y) % 220 ? '#c99a4a' : '#8a2b2b'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, 34, 20, ((x + y) / 110) % 2 ? 0 : Math.PI / 2, 0, 7); c.stroke(); }
    c.fillStyle = '#c99a4a'; c.beginPath(); c.arc(512, 512, 90, 0, 7); c.fill(); c.fillStyle = '#16244a'; c.beginPath(); c.arc(512, 512, 70, 0, 7); c.fill();
  }), []);
  return (
    <group {...g}>
      <mesh position={[0, 0.004, 0]} rotation={[0, 0.35, 0]} castShadow receiveShadow><boxGeometry args={[0.17, 0.008, 0.17]} /><meshPhysicalMaterial color="#16244a" roughness={0.4} sheen={1} /></mesh>
      <mesh position={[0, 0.0085, 0]} rotation={[-Math.PI / 2, 0, 0.35]}><planeGeometry args={[0.17, 0.17]} /><meshPhysicalMaterial map={tx} roughness={0.35} sheen={1} sheenColor={new THREE.Color('#ffe6b0')} sheenRoughness={0.3} /></mesh>
    </group>
  );
};

/** a lacquered gift box with a satin ribbon and a bow */
export const GiftBox: React.FC<G> = (g) => {
  const geo = useMemo(() => ({ box: new RoundedBoxGeometry(0.12, 0.07, 0.12, 4, 0.004), lid: new RoundedBoxGeometry(0.124, 0.02, 0.124, 4, 0.004) }), []);
  const ribbon = <meshPhysicalMaterial color="#c9a05a" roughness={0.25} sheen={1} sheenColor={new THREE.Color('#fff0c8')} clearcoat={0.5} />;
  return (
    <group {...g}>
      <mesh geometry={geo.box} position={[0, 0.035, 0]} castShadow receiveShadow><meshPhysicalMaterial color="#0b0b0d" roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} /></mesh>
      <mesh geometry={geo.lid} position={[0, 0.072, 0]} castShadow><meshPhysicalMaterial color="#0b0b0d" roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} /></mesh>
      <mesh position={[0, 0.045, 0]}><boxGeometry args={[0.127, 0.0821, 0.014]} />{ribbon}</mesh>
      <mesh position={[0, 0.045, 0]}><boxGeometry args={[0.014, 0.0821, 0.127]} />{ribbon}</mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.016, 0.088, 0]} rotation={[Math.PI / 2, s * 0.5, 0]} scale={[1.4, 1, 0.6]} castShadow><torusGeometry args={[0.011, 0.004, 12, 32]} />{ribbon}</mesh>)}
    </group>
  );
};

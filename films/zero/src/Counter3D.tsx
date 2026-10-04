import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mulberry, type Key } from './lib';
import { CamRig, Env, canvasTex, useFontsReady } from './three-kit';

/* The night counter: the set for the cold open, the can stack and the ending. 1 unit = 10 cm.
   Cans are a standard 330 ml can (Ø 6.6 cm, 11.5 cm tall) built here with our own unbranded labels:
   red = the sugared cola, black = the sugar-free one. No real brand's design, logo or lettering. */
export const CAN_H = 1.15, CAN_R = 0.33, CUBE = 0.16;
export type CanKind = 'red' | 'black';
export type CanState = { kind: CanKind; p: number[]; ry?: number; o?: number; tilt?: number };
export type CubeState = { p: number[]; r: number[]; s?: number };

const SERIF_EN = '"Cormorant Garamond", Georgia, serif';
const SERIF_ZH = '"Noto Serif CJK SC", serif';

const labelTex = (kind: CanKind) => canvasTex(2048, 1024, (g) => {
  const red = kind === 'red';
  const base = g.createLinearGradient(0, 0, 0, 1024);
  if (red) { base.addColorStop(0, '#a8121a'); base.addColorStop(0.5, '#d42a2a'); base.addColorStop(1, '#9a1016'); }
  else { base.addColorStop(0, '#0c0c0e'); base.addColorStop(0.5, '#1b1b1f'); base.addColorStop(1, '#0a0a0c'); }
  g.fillStyle = base; g.fillRect(0, 0, 2048, 1024);
  // bands: gold hairlines top and bottom, a wide accent band
  const accent = red ? '#f3e2c0' : '#d42a2a';
  g.fillStyle = '#c8a25a'; g.fillRect(0, 70, 2048, 6); g.fillRect(0, 948, 2048, 6);
  g.fillStyle = accent; g.globalAlpha = 0.9; g.fillRect(0, 720, 2048, 46); g.globalAlpha = 1;
  // the word, centred at u = 0.5 (faces the camera) and once more on the back
  for (const cx of [1024, 0, 2048]) {
    g.save(); g.translate(cx, 0);
    g.textAlign = 'center'; g.fillStyle = red ? '#fff6ea' : '#f3ede2';
    g.font = `700 330px ${SERIF_EN}`; g.fillText('COLA', 0, 560);
    g.font = `900 120px ${SERIF_ZH}`; g.fillStyle = red ? '#fff6ea' : '#e8453c';
    g.fillText(red ? '经典' : '无糖', 0, 900);
    g.restore();
  }
  // a quiet nutrition panel on the side
  g.textAlign = 'left'; g.fillStyle = red ? 'rgba(255,240,225,0.85)' : 'rgba(243,237,226,0.75)';
  g.font = `500 44px "Noto Sans CJK SC", sans-serif`;
  const sx = 1500;
  g.fillText('330 毫升', sx, 300);
  g.fillText(red ? '糖  35 克' : '糖  0 克', sx, 370);
});

const metalTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#9a9ca2'; g.fillRect(0, 0, 512, 512);
  const r = mulberry(3);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.08})`; g.fillRect(r() * 512, r() * 512, 1 + r() * 40, 1); }
});

const stoneTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#1b1a1d'; g.fillRect(0, 0, 1024, 1024);
    const r = mulberry(11);
    for (let i = 0; i < 26000; i++) {
      const v = r(); g.fillStyle = v < 0.5 ? `rgba(0,0,0,${0.25 * r()})` : `rgba(210,200,190,${0.06 * r()})`;
      const s = 1 + r() * 3; g.fillRect(r() * 1024, r() * 1024, s, s);
    }
    for (let i = 0; i < 18; i++) { // faint veins
      g.strokeStyle = `rgba(200,190,180,${0.04 + 0.04 * r()})`; g.lineWidth = 1 + r() * 2; g.beginPath();
      let x = r() * 1024, y = r() * 1024; g.moveTo(x, y);
      for (let k = 0; k < 12; k++) { x += (r() - 0.3) * 120; y += (r() - 0.5) * 80; g.lineTo(x, y); }
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
};

const sugarBump = () => canvasTex(256, 256, (g) => {
  const r = mulberry(5); g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) { const v = Math.floor(r() * 255); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 256, r() * 256, 2 + r() * 4, 2 + r() * 4); }
}, false);

const Can: React.FC<{ s: CanState; label: THREE.Texture; metal: THREE.Texture }> = ({ s, label, metal }) => {
  const parts = useMemo(() => {
    const body = new THREE.CylinderGeometry(CAN_R, CAN_R, 0.86, 96, 1, true, -Math.PI, Math.PI * 2);
    body.translate(0, 0.14 + 0.43, 0);
    // bottom: a short taper and a domed base
    const bottom = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.06), new THREE.Vector2(0.18, 0.035), new THREE.Vector2(0.24, 0.0), new THREE.Vector2(0.27, 0.004),
      new THREE.Vector2(0.305, 0.05), new THREE.Vector2(0.325, 0.11), new THREE.Vector2(CAN_R, 0.14),
    ], 96);
    // shoulder and neck up to the rim
    const top = new THREE.LatheGeometry([
      new THREE.Vector2(CAN_R, 1.0), new THREE.Vector2(0.322, 1.05), new THREE.Vector2(0.295, 1.095), new THREE.Vector2(0.272, 1.12),
      new THREE.Vector2(0.268, 1.135), new THREE.Vector2(0.276, 1.148), new THREE.Vector2(0.27, 1.152), new THREE.Vector2(0.25, 1.14),
      new THREE.Vector2(0.245, 1.128), new THREE.Vector2(0.0, 1.128),
    ], 96);
    const tab = new RoundedBoxGeometry(0.16, 0.012, 0.1, 2, 0.02);
    return { body, bottom, top, tab };
  }, []);
  const red = s.kind === 'red';
  return (
    <group position={[s.p[0], s.p[1], s.p[2]]} rotation={[s.tilt ?? 0, s.ry ?? 0, 0]}>
      <mesh geometry={parts.body} castShadow receiveShadow>
        <meshPhysicalMaterial map={label} metalness={red ? 0.45 : 0.55} roughness={red ? 0.3 : 0.24} clearcoat={1} clearcoatRoughness={0.12} transparent={(s.o ?? 1) < 1} opacity={s.o ?? 1} />
      </mesh>
      <mesh geometry={parts.bottom} castShadow><meshStandardMaterial map={metal} metalness={1} roughness={0.32} side={THREE.DoubleSide} transparent={(s.o ?? 1) < 1} opacity={s.o ?? 1} /></mesh>
      <mesh geometry={parts.top} castShadow><meshStandardMaterial map={metal} metalness={1} roughness={0.26} side={THREE.DoubleSide} transparent={(s.o ?? 1) < 1} opacity={s.o ?? 1} /></mesh>
      <mesh geometry={parts.tab} position={[0.06, 1.138, 0]}><meshStandardMaterial color="#b9bbc0" metalness={1} roughness={0.25} /></mesh>
    </group>
  );
};

const Glass: React.FC<{ p: number[]; level: number }> = ({ p, level }) => {
  const geo = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0, 0.0), new THREE.Vector2(0.3, 0.0), new THREE.Vector2(0.31, 0.04), new THREE.Vector2(0.36, 1.05), new THREE.Vector2(0.34, 1.05), new THREE.Vector2(0.29, 0.06), new THREE.Vector2(0, 0.06),
  ], 96), []);
  const h = 0.06 + 0.82 * level;
  const rTop = 0.29 + (0.34 - 0.29) * ((h - 0.06) / 0.99);
  return (
    <group position={[p[0], p[1], p[2]]}>
      {level > 0.01 && (
        <mesh position={[0, 0.06 + (h - 0.06) / 2, 0]}>
          <cylinderGeometry args={[rTop - 0.004, 0.286, h - 0.06, 96]} />
          <meshPhysicalMaterial color="#5a2e06" roughness={0.06} metalness={0} transparent opacity={0.82} emissive="#3a1c02" emissiveIntensity={0.35} clearcoat={1} envMapIntensity={0.4} />
        </mesh>
      )}
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial color="#e8f0ff" roughness={0.04} metalness={0} transparent opacity={0.12} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

export const Counter3D: React.FC<{ T: number; keys: Key[]; cans: CanState[]; cubes?: CubeState[]; glass?: { p: number[]; level: number } | null; lamp?: number; fov?: number; lampPos?: number[] }> = ({ T, keys, cans, cubes = [], glass = null, lamp = 1, fov = 30, lampPos = [-0.6, 5.2, 1.8] }) => {
  const { width, height } = useVideoConfig();
  const ready = useFontsReady();
  const tex = useMemo(() => (ready ? { red: labelTex('red'), black: labelTex('black'), metal: metalTex(), stone: stoneTex(), sugar: sugarBump() } : null), [ready]);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(CUBE, CUBE, CUBE, 3, 0.018), []);
  if (!tex) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }} camera={{ fov, near: 0.05, far: 80 }}>
        <CamRig T={T} keys={keys} fov={fov} />
        <Env intensity={0.32} />
        <ambientLight intensity={0.06} color="#9fb2ff" />
        {/* the pendant lamp above the counter: warm, soft-edged pool */}
        <spotLight position={[lampPos[0], lampPos[1], lampPos[2]]} angle={lampPos[1] > 6 ? 0.42 : 0.55} penumbra={0.9} intensity={140 * lamp} decay={2} color="#ffd9a6" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
        {/* cool rim from the window behind */}
        <directionalLight position={[3, 2.5, -4]} intensity={1.4} color="#7fa2ff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 9]} />
          <meshStandardMaterial map={tex.stone} roughness={0.32} metalness={0.1} />
        </mesh>
        {cans.map((c, i) => <Can key={i} s={c} label={c.kind === 'red' ? tex.red : tex.black} metal={tex.metal} />)}
        {cubes.map((c, i) => (
          <mesh key={i} geometry={cubeGeo} position={[c.p[0], c.p[1], c.p[2]]} rotation={[c.r[0], c.r[1], c.r[2]]} scale={c.s ?? 1} castShadow receiveShadow>
            <meshStandardMaterial color="#fbf8f2" roughness={0.75} bumpMap={tex.sugar} bumpScale={0.6} emissive="#3a3020" emissiveIntensity={0.08} />
          </mesh>
        ))}
        {glass && <Glass p={glass.p} level={glass.level} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** soft out-of-focus city lights behind the counter (HTML, behind the transparent canvas) */
export const Bokeh: React.FC<{ o?: number; seed?: number }> = ({ o = 1, seed = 1 }) => {
  const dots = useMemo(() => {
    const r = mulberry(seed * 31);
    return Array.from({ length: 42 }, () => ({ x: r() * 1920, y: 80 + r() * 520, s: 30 + r() * 120, c: r() < 0.6 ? '255,190,120' : r() < 0.8 ? '120,160,255' : '255,110,90', a: 0.08 + r() * 0.18 }));
  }, [seed]);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070a14 0%, #0b0f1c 55%, #0d0d12 100%)', opacity: o }}>
      {dots.map((d, i) => <div key={i} style={{ position: 'absolute', left: d.x - d.s / 2, top: d.y - d.s / 2, width: d.s, height: d.s, borderRadius: '50%', background: `radial-gradient(circle, rgba(${d.c},${d.a}) 0%, rgba(${d.c},${d.a * 0.6}) 55%, rgba(${d.c},0) 72%)` }} />)}
    </AbsoluteFill>
  );
};

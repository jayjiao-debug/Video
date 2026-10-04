import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry, type Key } from './lib';
import { CamRig, Env, canvasTex, useFontsReady } from './three-kit';

/* The night counter: the set for the cold open, the can stack and the ending. 1 unit = 10 cm.
   Cans are a standard 330 ml can (Ø 6.6 cm, 11.5 cm tall) built here with our own unbranded labels:
   red = the sugared cola, black = the sugar-free one. No real brand's design, logo or lettering.
   Lighting: a warm pendant spot (pool and shadows) and a cool rim from the window; a narrow light strip sweeps the
   cans in the opening. The city bokeh is a plane in the scene so the glass and water can refract it. */
export const CAN_H = 1.15, CAN_R = 0.33, CUBE = 0.16;
export type CanKind = 'red' | 'black';
export type CanState = { kind: CanKind; p: number[]; ry?: number; o?: number; tilt?: number };
export type CubeState = { p: number[]; r: number[]; s?: number };
export type Grain = { p: number[]; o: number };

let RECT_INIT = false;
const SERIF_EN = '"Cormorant Garamond", Georgia, serif';
const SERIF_ZH = '"Noto Serif CJK SC", serif';
const SANS_ZH = '"Noto Sans CJK SC", sans-serif';

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
    (g as unknown as { letterSpacing: string }).letterSpacing = '6px';
    g.font = `700 210px ${SERIF_EN}`; g.fillText('COLA', 0, 520);
    (g as unknown as { letterSpacing: string }).letterSpacing = '0px';
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
    g.fillStyle = '#1a191c'; g.fillRect(0, 0, 1024, 1024);
    const r = mulberry(11);
    for (let i = 0; i < 26000; i++) {
      const v = r(); g.fillStyle = v < 0.5 ? `rgba(0,0,0,${0.25 * r()})` : `rgba(210,200,190,${0.05 * r()})`;
      const s = 1 + r() * 3; g.fillRect(r() * 1024, r() * 1024, s, s);
    }
    for (let i = 0; i < 18; i++) {
      g.strokeStyle = `rgba(200,190,180,${0.035 + 0.035 * r()})`; g.lineWidth = 1 + r() * 2; g.beginPath();
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

// city lights through a window, out of focus: a backdrop plane in the scene
const bokehTex = (seed: number) => canvasTex(2048, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#070a14'); gr.addColorStop(0.7, '#0b0f1c'); gr.addColorStop(1, '#0d0d12');
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 1024);
  const r = mulberry(seed * 31);
  for (let i = 0; i < 70; i++) {
    const x = r() * 2048, y = 80 + r() * 760, s = 30 + r() * 130, c = r() < 0.6 ? '255,190,120' : r() < 0.8 ? '120,160,255' : '255,110,90', a = 0.1 + r() * 0.22;
    const d = g.createRadialGradient(x, y, 0, x, y, s);
    d.addColorStop(0, `rgba(${c},${a})`); d.addColorStop(0.6, `rgba(${c},${a * 0.7})`); d.addColorStop(0.75, `rgba(${c},${a * 0.25})`); d.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = d; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
  }
});

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

// a heavy tumbler of still water. The glass is drawn back faces first, then front faces (fixed order: no sorting
// flicker); the water is a separate solid that never touches a glass surface; the foot stands 1 mm off the counter.
const Glass: React.FC<{ p: number[]; level: number }> = ({ p, level }) => {
  const RB = 0.29, RT = 0.33, H = 1.0, BASE = 0.11, WALL = 0.022;
  const rIn = (y: number) => RB - WALL + (RT - RB) * (y / H);
  const geo = useMemo(() => new THREE.LatheGeometry([
    new THREE.Vector2(0.0, BASE), new THREE.Vector2(rIn(BASE) - 0.02, BASE), new THREE.Vector2(rIn(BASE), BASE + 0.025),
    new THREE.Vector2(rIn(H), H - 0.004), new THREE.Vector2(rIn(H) + 0.004, H + 0.006), new THREE.Vector2(RT - 0.004, H + 0.006), new THREE.Vector2(RT, H - 0.004),
    new THREE.Vector2(RB + 0.004, 0.03), new THREE.Vector2(RB - 0.012, 0.004), new THREE.Vector2(RB - 0.03, 0.0), new THREE.Vector2(0.0, 0.0),
  ], 128), []);
  const top = BASE + 0.02 + (H - BASE - 0.12) * level;
  const water = useMemo(() => {
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, BASE + 0.008), new THREE.Vector2(rIn(BASE) - 0.026, BASE + 0.008), new THREE.Vector2(rIn(BASE + 0.03) - 0.008, BASE + 0.03)];
    // the meniscus: the surface climbs a little where it meets the glass
    pts.push(new THREE.Vector2(rIn(top) - 0.006, top + 0.006), new THREE.Vector2(rIn(top) - 0.016, top), new THREE.Vector2(rIn(top) - 0.05, top - 0.003), new THREE.Vector2(0, top - 0.003));
    return new THREE.LatheGeometry(pts, 128);
  }, [top]);
  // tiny bubbles resting on the inside of the wall and the bottom (still water)
  const bubbles = useMemo(() => {
    const r = mulberry(77), out: THREE.Matrix4[] = [];
    for (let i = 0; i < 70; i++) {
      const y = BASE + 0.05 + Math.pow(r(), 1.6) * (top - BASE - 0.1), a = r() * Math.PI * 2, s = 0.004 + Math.pow(r(), 3) * 0.01;
      const rad = rIn(y) - 0.008 - s;
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
    }
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * (rIn(BASE) - 0.05), s = 0.004 + r() * 0.006;
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rr, BASE + 0.012 + s, Math.sin(a) * rr), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
    }
    return mergeGeometries(out.map((m) => new THREE.SphereGeometry(1, 10, 8).applyMatrix4(m)));
  }, [top]);
  const glassMat = (side: THREE.Side) => <meshPhysicalMaterial depthWrite={false} color="#eef4ff" roughness={0.02} metalness={0} transparent opacity={0.06} clearcoat={1} clearcoatRoughness={0.02} specularIntensity={1} envMapIntensity={2.4} side={side} />;
  return (
    <group position={[p[0], p[1] + 0.01, p[2]]}>
      {level > 0.01 && (
        <mesh geometry={water} renderOrder={1}>
          <meshPhysicalMaterial color="#f4f9ff" roughness={0.0} metalness={0} transmission={1} thickness={0.6} ior={1.33} attenuationColor="#d6ebff" attenuationDistance={2.5} clearcoat={1} clearcoatRoughness={0.0} specularIntensity={1} envMapIntensity={1.4} />
        </mesh>
      )}
      {level > 0.01 && <mesh geometry={bubbles} renderOrder={5}><meshPhysicalMaterial color="#ffffff" roughness={0.05} transparent opacity={0.85} clearcoat={1} envMapIntensity={2.5} emissive="#9fb6d8" emissiveIntensity={0.35} depthWrite={false} /></mesh>}
      {/* a cool card light behind, so the water catches a bright edge */}
      <pointLight position={[0, 0.5, -0.8]} intensity={1.2} distance={1.8} decay={2} color="#cfe2ff" />
      <mesh geometry={geo} renderOrder={2}>{glassMat(THREE.BackSide)}</mesh>
      <mesh geometry={geo} renderOrder={4}>{glassMat(THREE.FrontSide)}</mesh>
    </group>
  );
};

/** sugar grains scattered when a cube lands */
const Grains: React.FC<{ g: Grain[] }> = ({ g }) => (
  <>{g.map((x, i) => <mesh key={i} position={[x.p[0], x.p[1], x.p[2]]}><sphereGeometry args={[0.009, 6, 5]} /><meshStandardMaterial color="#fffaf0" roughness={0.5} transparent opacity={x.o} /></mesh>)}</>
);

export const Counter3D: React.FC<{ T: number; keys: Key[]; cans: CanState[]; cubes?: CubeState[]; grains?: Grain[]; glass?: { p: number[]; level: number } | null; lamp?: number; fov?: number; lampPos?: number[]; sweep?: number; seed?: number }> = ({ T, keys, cans, cubes = [], grains = [], glass = null, lamp = 1, fov = 30, lampPos = [-0.6, 5.2, 1.8], sweep = -1, seed = 1 }) => {
  const { width, height } = useVideoConfig();
  const ready = useFontsReady();
  if (!RECT_INIT) { RectAreaLightUniformsLib.init(); RECT_INIT = true; }
  const tex = useMemo(() => (ready ? {
    red: labelTex('red'), black: labelTex('black'), metal: metalTex(), stone: stoneTex(), sugar: sugarBump(), bokeh: bokehTex(seed),
  } : null), [ready, seed]);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(CUBE, CUBE, CUBE, 4, 0.02), []);
  const rectRef = (l: THREE.RectAreaLight | null, at: number[]) => { if (l) l.lookAt(at[0], at[1], at[2]); };
  if (!tex) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ fov, near: 0.05, far: 80 }}>
        <CamRig T={T} keys={keys} fov={fov} />
        <Env intensity={0.32} />
        <ambientLight intensity={0.06} color="#9fb2ff" />
        {/* cool rim from the window behind */}
        <directionalLight position={[3, 2.5, -4]} intensity={1.4} color="#7fa2ff" />
        {/* the opening's light sweep: a narrow strip that travels across the cans */}
        {sweep > -1 && <rectAreaLight ref={(l) => rectRef(l, [sweep * 2, 0.6, 0])} position={[sweep * 2 + 0.6, 1.4, 2.4]} width={0.25} height={2.6} intensity={30} color="#fff4e6" />}
        <spotLight position={[lampPos[0], lampPos[1], lampPos[2]]} angle={lampPos[1] > 6 ? 0.42 : 0.55} penumbra={0.9} intensity={140 * lamp} decay={2} color="#ffd9a6" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
        <mesh position={[0, 4.2, -9]}><planeGeometry args={[36, 16]} /><meshBasicMaterial map={tex.bokeh} toneMapped={false} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} receiveShadow>
          <planeGeometry args={[18, 9]} />
          <meshStandardMaterial map={tex.stone} roughness={0.42} metalness={0.05} />
        </mesh>
        {cans.map((c, i) => <Can key={i} s={c} label={c.kind === 'red' ? tex.red : tex.black} metal={tex.metal} />)}
        {cubes.map((c, i) => (
          <mesh key={i} geometry={cubeGeo} position={[c.p[0], c.p[1], c.p[2]]} rotation={[c.r[0], c.r[1], c.r[2]]} scale={c.s ?? 1} castShadow receiveShadow>
            <meshStandardMaterial color="#fbf8f2" roughness={0.75} bumpMap={tex.sugar} bumpScale={0.6} emissive="#3a3020" emissiveIntensity={0.08} />
          </mesh>
        ))}
        <Grains g={grains} />
        {glass && <Glass p={glass.p} level={glass.level} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** kept for scenes that want the HTML version behind a transparent canvas */
export const Bokeh: React.FC<{ o?: number; seed?: number }> = ({ o = 1 }) => (
  <AbsoluteFill style={{ background: 'linear-gradient(180deg, #070a14 0%, #0b0f1c 55%, #0d0d12 100%)', opacity: o }} />
);

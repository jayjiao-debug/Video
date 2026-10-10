/* 《调到那个台》: the one world. A tube radio on a desk by a night window; everything the film says happens to this
   radio and this room. Units are metres; the desk top is y = 0, the radio's front face is z ≈ 0.12. */
import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { walnutTex, clothTex, dialTex, DIAL, eyeDraw, nightTex, wallTex, oakTex, glowTex, clockTex, canvasTex } from './tex';

export type RadioState = {
  power: number;   // dial backlight and tube warmth, 0..1
  needle: number;  // 0..1 along the dial
  gap: number;     // tuning-eye wedge half-angle (rad): 0.8 = lost, 0.02 = locked
  flicker: number; // 0..1 how unsteady the light is (static)
  flood: number;   // the room fills with warm light when the station locks, 0..1
  moon: number;    // cool window light
};
export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number; focus: number; aperture: number; bloom: number };

// key positions on the radio (world)
export const P = {
  eye: new THREE.Vector3(0.135, 0.327, 0.121),
  dial: new THREE.Vector3(0.135, 0.24, 0.121),
  knob: new THREE.Vector3(0.2, 0.1, 0.13),
  grille: new THREE.Vector3(-0.135, 0.19, 0.121),
};
const DIAL_W = 0.21, DIAL_H = 0.105;
export const needleX = (n: number) => P.dial.x - DIAL_W / 2 + (DIAL.x0 / DIAL.w + n * (DIAL.x1 - DIAL.x0) / DIAL.w) * DIAL_W;

const Radio: React.FC<{ s: RadioState; T: number }> = ({ s, T }) => {
  const tx = useMemo(() => ({ walnut: walnutTex(), cloth: clothTex(), dial: dialTex(), dialGlow: dialTex(true), glow: glowTex('rgba(255,190,110,1)', 'rgba(255,150,60,0)'), eyeGlow: glowTex('rgba(120,255,160,1)', 'rgba(40,200,90,0)') }), []);
  const geo = useMemo(() => ({ body: new RoundedBoxGeometry(0.58, 0.34, 0.24, 6, 0.032), bezel: new RoundedBoxGeometry(0.54, 0.3, 0.02, 4, 0.012) }), []);
  // the eye texture is redrawn from the state
  const eye = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 256; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, t }; }, []);
  const jitter = s.flicker * (Math.sin(T * 37) * 0.5 + Math.sin(T * 91 + 1) * 0.3 + Math.sin(T * 13) * 0.2);
  const gap = Math.max(0.015, s.gap + jitter * 0.18);
  const glowE = s.power * (0.85 + 0.15 * (1 - s.flicker)) * (1 - 0.25 * s.flicker * Math.abs(Math.sin(T * 53)));
  eyeDraw(eye.c.getContext('2d')!, gap, Math.min(1, glowE)); eye.t.needsUpdate = true;
  const lit = s.power * (1 - s.flicker * 0.45 * (0.5 + 0.5 * Math.sin(T * 47) * Math.sin(T * 29 + 2)));
  const nx = needleX(s.needle);
  const knobA = -s.needle * Math.PI * 3.2;
  const wood = <meshPhysicalMaterial map={tx.walnut} roughness={0.42} clearcoat={0.85} clearcoatRoughness={0.18} />;
  return (
    <group>
      {/* cabinet */}
      <mesh geometry={geo.body} position={[0, 0.19, 0]} castShadow receiveShadow>{wood}</mesh>
      {/* front bezel, a little darker */}
      <mesh geometry={geo.bezel} position={[0, 0.19, 0.111]}><meshPhysicalMaterial color="#2a170b" roughness={0.5} clearcoat={0.6} /></mesh>
      {/* grille: cloth behind brass bars, brass frame */}
      <mesh position={[P.grille.x, P.grille.y, 0.1222]}><planeGeometry args={[0.22, 0.25]} /><meshStandardMaterial map={tx.cloth} roughness={0.95} /></mesh>
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[P.grille.x + i * 0.024, P.grille.y, 0.1235]} castShadow><boxGeometry args={[0.004, 0.25, 0.004]} /><meshStandardMaterial color="#8a6630" metalness={0.9} roughness={0.5} /></mesh>))}
      {[[0, 0.126, 0.226, 0.006], [0, -0.126, 0.226, 0.006], [0.112, 0, 0.006, 0.258], [-0.112, 0, 0.006, 0.258]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[P.grille.x + x, P.grille.y + y, 0.124]}><boxGeometry args={[w, h, 0.006]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.25} /></mesh>))}
      {/* dial: printed glass, lit from behind */}
      <mesh position={[P.dial.x, P.dial.y, 0.1222]}><planeGeometry args={[DIAL_W, DIAL_H]} />
        <meshStandardMaterial map={tx.dial} emissiveMap={tx.dialGlow} emissive={new THREE.Color('#ffb25c')} emissiveIntensity={0.02 + 0.5 * lit - 0.12 * s.flood} roughness={0.6} /></mesh>
      <mesh position={[P.dial.x, P.dial.y, 0.1248]}><planeGeometry args={[DIAL_W, DIAL_H]} /><meshPhysicalMaterial color="#ffffff" transparent opacity={0.06} roughness={0.12} metalness={0} clearcoat={0.6} /></mesh>
      {[[0, DIAL_H / 2 + 0.004, DIAL_W + 0.016, 0.008], [0, -DIAL_H / 2 - 0.004, DIAL_W + 0.016, 0.008], [DIAL_W / 2 + 0.004, 0, 0.008, DIAL_H], [-DIAL_W / 2 - 0.004, 0, 0.008, DIAL_H]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[P.dial.x + x, P.dial.y + y, 0.1245]}><boxGeometry args={[w, h, 0.007]} /><meshStandardMaterial color="#c79a52" metalness={1} roughness={0.25} /></mesh>))}
      {/* needle */}
      <mesh position={[nx, P.dial.y, 0.1232]}><boxGeometry args={[0.0016, DIAL_H * 0.86, 0.0008]} /><meshBasicMaterial color={new THREE.Color('#d1281c').multiplyScalar(0.35 + 0.9 * lit)} toneMapped={false} /></mesh>
      {/* tuning eye: brass ring, the phosphor face, a halo */}
      <mesh position={[P.eye.x, P.eye.y, 0.1225]}><torusGeometry args={[0.0228, 0.0026, 12, 48]} /><meshStandardMaterial color="#a8803f" metalness={1} roughness={0.45} /></mesh>
      <mesh position={[P.eye.x, P.eye.y, 0.1224]}><circleGeometry args={[0.021, 48]} /><meshBasicMaterial map={eye.t} toneMapped={false} /></mesh>
      <sprite position={[P.eye.x, P.eye.y, 0.126]} scale={[0.06, 0.06, 1]}><spriteMaterial map={tx.eyeGlow} transparent opacity={0.12 * glowE} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
      {/* knobs: volume (left) and tuning (right) */}
      {[[0.07, 0], [P.knob.x, knobA]].map(([x, a], i) => (
        <group key={i} position={[x, P.knob.y, 0.122]} rotation={[0, 0, a]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]} castShadow><cylinderGeometry args={[0.027, 0.03, 0.024, 40]} /><meshPhysicalMaterial color="#2b1a10" roughness={0.3} clearcoat={0.9} /></mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0245]}><cylinderGeometry args={[0.02, 0.022, 0.003, 40]} /><meshStandardMaterial color="#b88a43" metalness={1} roughness={0.3} /></mesh>
          <mesh position={[0, 0.013, 0.0265]}><boxGeometry args={[0.003, 0.016, 0.001]} /><meshStandardMaterial color="#2a1a0c" /></mesh>
        </group>))}
      {/* feet */}
      {[[-0.24, -0.08], [0.24, -0.08], [-0.24, 0.08], [0.24, 0.08]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.01, z]} castShadow><cylinderGeometry args={[0.014, 0.016, 0.02, 20]} /><meshStandardMaterial color="#1a0f08" roughness={0.6} /></mesh>))}
      {/* tubes behind the back panel: a warm halo on the wall behind the set */}
      <pointLight position={[0, 0.3, -0.2]} intensity={1.1 * s.power} distance={1.2} decay={2} color="#ff9a44" />
      {/* the radio's own light: warm spill from the dial onto the desk and the grille */}
      <pointLight position={[P.dial.x, 0.04, 0.34]} intensity={0.35 * lit} distance={1.6} decay={2} color="#ffb060" />
    </group>
  );
};

const Room: React.FC<{ s: RadioState; T: number }> = ({ s, T }) => {
  const tx = useMemo(() => ({ night: nightTex(), wall: wallTex(), oak: oakTex(), clock: clockTex(), lamp: glowTex('rgba(255,214,150,1)', 'rgba(255,170,80,0)'),
    page: canvasTex(1024, 1400, (g) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 1024, 1400); g.strokeStyle = 'rgba(80,110,160,0.35)'; g.lineWidth = 2; for (let y = 160; y < 1400; y += 64) { g.beginPath(); g.moveTo(60, y); g.lineTo(964, y); g.stroke(); } }) }), []);
  const hh = (T / 3600) * Math.PI * 2 + 3.9, mm = (T / 60) * Math.PI * 2 * 0.2 + 0.4;
  return (
    <group>
      {/* desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.1]} receiveShadow><planeGeometry args={[3.2, 1.6]} /><meshStandardMaterial map={tx.oak} roughness={0.55} metalness={0.02} /></mesh>
      <mesh position={[0, -0.025, 0.9]}><boxGeometry args={[3.2, 0.05, 0.02]} /><meshStandardMaterial color="#3f2a17" roughness={0.5} /></mesh>
      {/* back wall with a window on the left */}
      <mesh position={[0.55, 0.9, -0.62]} receiveShadow><planeGeometry args={[2.4, 2.2]} /><meshStandardMaterial map={tx.wall} roughness={0.95} /></mesh>
      <mesh position={[-1.55, 0.9, -0.62]} receiveShadow><planeGeometry args={[1.0, 2.2]} /><meshStandardMaterial map={tx.wall} roughness={0.95} /></mesh>
      <mesh position={[-0.65, 0.12, -0.62]}><planeGeometry args={[0.8, 0.32]} /><meshStandardMaterial map={tx.wall} roughness={0.95} /></mesh>
      <mesh position={[-0.65, 1.75, -0.62]}><planeGeometry args={[0.8, 0.5]} /><meshStandardMaterial map={tx.wall} roughness={0.95} /></mesh>
      <mesh position={[-0.65, 0.92, -1.6]}><planeGeometry args={[2.2, 2.2]} /><meshBasicMaterial map={tx.night} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(0.55 + 0.45 * s.moon)} /></mesh>
      {/* window frame and cross bars */}
      {[[0, 0.28, 0.84, 0.04], [0, 1.5, 0.84, 0.04], [-0.4, 0.89, 0.04, 1.26], [0.4, 0.89, 0.04, 1.26], [0, 0.89, 0.025, 1.22], [0, 0.89, 0.8, 0.025]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[-0.65 + x, y, -0.6]} castShadow><boxGeometry args={[w, h, 0.05]} /><meshStandardMaterial color="#1c1814" roughness={0.7} /></mesh>))}
      {/* sill */}
      <mesh position={[-0.65, 0.27, -0.55]} castShadow receiveShadow><boxGeometry args={[0.92, 0.025, 0.12]} /><meshStandardMaterial color="#2a221c" roughness={0.6} /></mesh>
      {/* wall clock, right */}
      <group position={[0.78, 0.82, -0.6]}>
        <mesh><circleGeometry args={[0.13, 64]} /><meshStandardMaterial map={tx.clock} roughness={0.5} /></mesh>
        <mesh position={[0, 0, -0.005]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.132, 0.008, 12, 64]} /><meshStandardMaterial color="#2a1e12" roughness={0.4} metalness={0.4} /></mesh>
        <mesh position={[0, 0, 0.004]} rotation={[0, 0, -hh]}><boxGeometry args={[0.006, 0.07, 0.002]} /><meshStandardMaterial color="#1a120a" /></mesh>
        <mesh position={[0, 0, 0.006]} rotation={[0, 0, -mm]}><boxGeometry args={[0.004, 0.1, 0.002]} /><meshStandardMaterial color="#1a120a" /></mesh>
      </group>
      {/* books, left, behind the radio */}
      {[[-0.52, 0.06, '#5b1f1a', 0.12], [-0.52, 0.16, '#21354a', 0.08], [-0.53, 0.235, '#3e3a2c', 0.07]].map(([x, y, c, h], i) => (
        <mesh key={i} position={[x as number, y as number, -0.12]} rotation={[0, 0.08 * (i - 1), 0]} castShadow receiveShadow><boxGeometry args={[0.32, h as number, 0.23]} /><meshStandardMaterial color={c as string} roughness={0.7} /></mesh>))}
      {/* notebook open in front-left, pencil */}
      <mesh rotation={[-Math.PI / 2, 0, 0.12]} position={[-0.34, 0.004, 0.36]} receiveShadow><planeGeometry args={[0.3, 0.21]} /><meshStandardMaterial map={tx.page} roughness={0.9} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 1.1]} position={[-0.18, 0.006, 0.42]} castShadow><cylinderGeometry args={[0.004, 0.004, 0.17, 8]} /><meshStandardMaterial color="#d9a531" roughness={0.5} /></mesh>
      {/* a phone face down, right */}
      <mesh position={[0.48, 0.005, 0.3]} rotation={[0, -0.3, 0]} castShadow><boxGeometry args={[0.075, 0.009, 0.155]} /><meshStandardMaterial color="#121418" roughness={0.3} metalness={0.5} /></mesh>
      {/* mug with a handle, tea inside */}
      <group position={[0.42, 0, 0.05]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow><cylinderGeometry args={[0.04, 0.037, 0.1, 40, 1, true]} /><meshPhysicalMaterial color="#d8cfc0" roughness={0.25} clearcoat={0.8} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.037, 40]} /><meshStandardMaterial color="#d8cfc0" /></mesh>
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.038, 40]} /><meshPhysicalMaterial color="#5a2c0c" roughness={0.1} clearcoat={1} /></mesh>
        <mesh position={[0.045, 0.052, 0]}><torusGeometry args={[0.022, 0.006, 12, 32, Math.PI * 1.2]} /><meshPhysicalMaterial color="#d8cfc0" roughness={0.25} clearcoat={0.8} /></mesh>
      </group>
      {/* lights: moon through the window (cool, shadowed), a faint ambient, and the warm flood that comes with the station */}
      <directionalLight position={[-1.6, 1.5, -2.2]} intensity={1.7 * s.moon} color="#8aa8ff" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
        shadow-camera-left={-1.5} shadow-camera-right={1.5} shadow-camera-top={1.5} shadow-camera-bottom={-1.5} />
      <ambientLight intensity={0.1 + 0.05 * s.flood} color="#9aa6c8" />
      <pointLight position={[1.2, 0.8, 1.2]} intensity={0.9 * s.moon} distance={4} decay={2} color="#6f86c8" />
      <pointLight position={[0.1, 0.55, 0.55]} intensity={1.3 * s.flood} distance={3} decay={2} color="#ffb766" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0.6, 1.3, -0.3]} intensity={0.8 * s.flood} distance={3} decay={2} color="#ff9a4a" />
    </group>
  );
};

/** bloom + depth of field, rendered through three's EffectComposer (R3F's default render is replaced at priority 1) */
const Post: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio(), { samples: 4, type: THREE.HalfFloatType });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(gl.getPixelRatio()); composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.002, maxblur: 0.012 });
    composer.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bokeh, bloom };
  }, [gl, scene, camera, size.width, size.height]);
  const u = (fx.bokeh as unknown as { uniforms: Record<string, { value: number }> }).uniforms;
  u.focus.value = cam.focus; u.aperture.value = cam.aperture; u.maxblur.value = 0.014;
  fx.bloom.strength = cam.bloom;
  useFrame(() => fx.composer.render(), 1);
  return null;
};

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env; (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.12; return () => { env.dispose(); pm.dispose(); }; }, [gl, scene]);
  return null;
};

export const World: React.FC<{ s: RadioState; cam: Cam; T: number }> = ({ s, cam, T }) => {
  const { camera, gl } = useThree();
  gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.near = 0.005; c.far = 30; c.updateProjectionMatrix(); c.lookAt(new THREE.Vector3(...cam.look));
  return (
    <>
      <color attach="background" args={['#030407']} />
      <Env />
      <Room s={s} T={T} />
      <Radio s={s} T={T} />
      <Post cam={cam} />
    </>
  );
};

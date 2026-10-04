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
   Product-shot lighting: two soft boxes (rect area lights) draw long highlights down the cans, a warm pendant spot
   gives the pool and the shadows; the city bokeh is a plane in the scene so the glass can refract it. */
export const CAN_H = 1.15, CAN_R = 0.33, CUBE = 0.16;
export type CanKind = 'red' | 'black';
export type CanState = { kind: CanKind; p: number[]; ry?: number; o?: number; tilt?: number };
export type CubeState = { p: number[]; r: number[]; s?: number };
export type Grain = { p: number[]; o: number };

let RECT_INIT = false;
const SERIF_EN = '"Cormorant Garamond", Georgia, serif';
const SERIF_ZH = '"Noto Serif CJK SC", serif';
const SANS_ZH = '"Noto Sans CJK SC", sans-serif';

// one layout, drawn twice: the colour map, and a roughness/metalness map (G = roughness, B = metalness) so the
// printed ink reads as ink on metal and the white lettering as matte ink
const drawLabel = (g: CanvasRenderingContext2D, kind: CanKind, pbr: boolean) => {
  const red = kind === 'red';
  const W = 2048, H = 1024;
  if (pbr) { g.fillStyle = 'rgb(0,80,150)'; g.fillRect(0, 0, W, H); }
  else {
    const base = g.createLinearGradient(0, 0, 0, H);
    if (red) { base.addColorStop(0, '#9c0f17'); base.addColorStop(0.45, '#cf2027'); base.addColorStop(1, '#8e0d14'); }
    else { base.addColorStop(0, '#09090b'); base.addColorStop(0.5, '#17171b'); base.addColorStop(1, '#08080a'); }
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    // fine print-on-metal streaks
    const r = mulberry(red ? 2 : 3);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.02})`; g.fillRect(r() * W, 0, 1 + r() * 2, H); }
  }
  const ink = (c: string) => (pbr ? 'rgb(0,150,25)' : c);
  const gold = pbr ? 'rgb(0,60,230)' : '#cfa760';
  // gold hairlines and a band near the bottom
  g.fillStyle = gold; g.fillRect(0, 96, W, 5); g.fillRect(0, 930, W, 5);
  g.fillStyle = ink(red ? '#f4e6c8' : '#cf2027'); g.fillRect(0, 760, W, 28);
  for (const cx of [W / 2, 0, W]) {
    g.save(); g.translate(cx, 0); g.textAlign = 'center';
    g.fillStyle = gold; g.font = `600 64px ${SERIF_EN}`;
    (g as unknown as { letterSpacing: string }).letterSpacing = '18px';
    g.fillText(red ? 'CLASSIC' : 'ZERO SUGAR', 0, 250);
    (g as unknown as { letterSpacing: string }).letterSpacing = '10px';
    g.fillStyle = ink(red ? '#fff7ec' : '#f3ede2'); g.font = `700 200px ${SERIF_EN}`;
    g.fillText('COLA', 0, 500);
    (g as unknown as { letterSpacing: string }).letterSpacing = '0px';
    g.fillStyle = ink(red ? '#fff7ec' : '#e8453c'); g.font = `900 104px ${SERIF_ZH}`;
    g.fillText(red ? '经典' : '无糖', 0, 690);
    g.fillStyle = ink(red ? 'rgba(255,240,225,0.9)' : 'rgba(243,237,226,0.8)'); g.font = `500 40px ${SANS_ZH}`;
    g.fillText(red ? '可乐 · 330 毫升' : '可乐 · 330 毫升 · 糖 0 克', 0, 880);
    g.restore();
  }
  // nutrition panel on the side
  g.textAlign = 'left'; g.fillStyle = ink(red ? 'rgba(255,240,225,0.85)' : 'rgba(243,237,226,0.75)'); g.font = `500 34px ${SANS_ZH}`;
  ['营养成分表', '每 100 毫升', red ? '糖  10.6 克' : '糖  0 克'].forEach((t, i) => g.fillText(t, 1530, 360 + i * 52));
};
const labelTex = (kind: CanKind) => canvasTex(2048, 1024, (g) => drawLabel(g, kind, false));
const labelPbr = (kind: CanKind) => canvasTex(2048, 1024, (g) => drawLabel(g, kind, true), false);

// cold-can condensation: droplets and mist as a bump map
const dropsTex = () => canvasTex(1024, 1024, (g) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, 1024, 1024);
  const r = mulberry(19);
  for (let i = 0; i < 9000; i++) { const v = 128 + r() * 30; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 1024, r() * 1024, 1.5, 1.5); }
  for (let i = 0; i < 420; i++) {
    const x = r() * 1024, y = r() * 1024, s = 3 + Math.pow(r(), 3) * 16;
    const gr = g.createRadialGradient(x - s * 0.25, y - s * 0.3, 0, x, y, s);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#b0b0b0'); gr.addColorStop(1, '#808080');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, s * 0.85, s, 0, 0, 7); g.fill();
  }
}, false);

const metalTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#a4a6ac'; g.fillRect(0, 0, 512, 512);
  const r = mulberry(3);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.07})`; g.fillRect(r() * 512, r() * 512, 1 + r() * 40, 1); }
});

// the lid seen from above: the score line, the opening, the recessed panel (bump)
const lidBump = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#5a5a5a'; g.lineWidth = 6;
  g.beginPath(); g.arc(256, 256, 236, 0, 7); g.stroke();
  g.strokeStyle = '#a8a8a8'; g.lineWidth = 3; g.beginPath(); g.arc(256, 256, 222, 0, 7); g.stroke();
  g.strokeStyle = '#4a4a4a'; g.lineWidth = 4;
  g.beginPath(); g.ellipse(160, 256, 70, 95, 0, 0, 7); g.stroke(); // the opening to be
  g.beginPath(); g.arc(300, 256, 16, 0, 7); g.stroke(); // rivet seat
}, false);

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

type Tex = { red: THREE.Texture; black: THREE.Texture; redP: THREE.Texture; blackP: THREE.Texture; drops: THREE.Texture; metal: THREE.Texture; lid: THREE.Texture };

const Can: React.FC<{ s: CanState; tex: Tex }> = ({ s, tex }) => {
  const parts = useMemo(() => {
    const body = new THREE.CylinderGeometry(CAN_R, CAN_R, 0.86, 128, 1, true, -Math.PI, Math.PI * 2);
    body.translate(0, 0.14 + 0.43, 0);
    const bottom = new THREE.LatheGeometry([
      new THREE.Vector2(0.0, 0.07), new THREE.Vector2(0.17, 0.045), new THREE.Vector2(0.235, 0.012), new THREE.Vector2(0.25, 0.002),
      new THREE.Vector2(0.268, 0.004), new THREE.Vector2(0.29, 0.03), new THREE.Vector2(0.312, 0.075), new THREE.Vector2(0.326, 0.115), new THREE.Vector2(CAN_R, 0.14),
    ], 128);
    const top = new THREE.LatheGeometry([
      new THREE.Vector2(CAN_R, 1.0), new THREE.Vector2(0.324, 1.045), new THREE.Vector2(0.305, 1.08), new THREE.Vector2(0.282, 1.108),
      new THREE.Vector2(0.27, 1.125), new THREE.Vector2(0.272, 1.14), new THREE.Vector2(0.279, 1.149), new THREE.Vector2(0.274, 1.156),
      new THREE.Vector2(0.262, 1.152), new THREE.Vector2(0.252, 1.138), new THREE.Vector2(0.246, 1.124), new THREE.Vector2(0.238, 1.12),
    ], 128);
    const lid = new THREE.CircleGeometry(0.239, 96); lid.rotateX(-Math.PI / 2); lid.translate(0, 1.121, 0);
    // the ring-pull: a rounded plate with a finger hole, slightly lifted at its tail
    const sh = new THREE.Shape();
    sh.moveTo(-0.03, -0.04); sh.lineTo(0.09, -0.045); sh.quadraticCurveTo(0.13, -0.045, 0.13, 0); sh.quadraticCurveTo(0.13, 0.045, 0.09, 0.045);
    sh.lineTo(-0.03, 0.04); sh.quadraticCurveTo(-0.06, 0.035, -0.06, 0); sh.quadraticCurveTo(-0.06, -0.035, -0.03, -0.04);
    const hole = new THREE.Path(); hole.absellipse(0.07, 0, 0.034, 0.026, 0, Math.PI * 2, true); sh.holes.push(hole);
    const tab = new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.003, bevelSegments: 2, curveSegments: 24 });
    tab.rotateX(-Math.PI / 2); tab.translate(0.03, 1.126, 0);
    return { body, bottom, top, lid, tab };
  }, []);
  const red = s.kind === 'red';
  const o = s.o ?? 1, tr = o < 1;
  return (
    <group position={[s.p[0], s.p[1], s.p[2]]} rotation={[s.tilt ?? 0, s.ry ?? 0, 0]}>
      <mesh geometry={parts.body} castShadow={!tr} receiveShadow>
        <meshPhysicalMaterial map={red ? tex.red : tex.black} roughnessMap={red ? tex.redP : tex.blackP} metalnessMap={red ? tex.redP : tex.blackP}
          metalness={1} roughness={1} clearcoat={0.6} clearcoatRoughness={0.18} bumpMap={tex.drops} bumpScale={0.9} transparent={tr} opacity={o} />
      </mesh>
      <mesh geometry={parts.bottom} castShadow={!tr}><meshStandardMaterial map={tex.metal} metalness={1} roughness={0.3} side={THREE.DoubleSide} transparent={tr} opacity={o} /></mesh>
      <mesh geometry={parts.top} castShadow={!tr}><meshStandardMaterial map={tex.metal} metalness={1} roughness={0.22} side={THREE.DoubleSide} transparent={tr} opacity={o} /></mesh>
      <mesh geometry={parts.lid}><meshStandardMaterial map={tex.metal} bumpMap={tex.lid} bumpScale={2} metalness={1} roughness={0.28} transparent={tr} opacity={o} /></mesh>
      <mesh geometry={parts.tab}><meshStandardMaterial color="#c4c6cc" metalness={1} roughness={0.2} transparent={tr} opacity={o} /></mesh>
      <mesh position={[0.03 + 0.0, 1.127, 0]}><cylinderGeometry args={[0.014, 0.016, 0.01, 20]} /><meshStandardMaterial color="#b6b8be" metalness={1} roughness={0.25} transparent={tr} opacity={o} /></mesh>
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
    red: labelTex('red'), black: labelTex('black'), redP: labelPbr('red'), blackP: labelPbr('black'), drops: dropsTex(), metal: metalTex(), lid: lidBump(),
    stone: stoneTex(), sugar: sugarBump(), bokeh: bokehTex(seed),
  } : null), [ready, seed]);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(CUBE, CUBE, CUBE, 4, 0.02), []);
  const rectRef = (l: THREE.RectAreaLight | null, at: number[]) => { if (l) l.lookAt(at[0], at[1], at[2]); };
  if (!tex) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} camera={{ fov, near: 0.05, far: 80 }}>
        <CamRig T={T} keys={keys} fov={fov} />
        <Env intensity={0.28} />
        <ambientLight intensity={0.05} color="#9fb2ff" />
        {/* soft boxes: a warm key on the left, a cool strip behind on the right */}
        <rectAreaLight ref={(l) => rectRef(l, [0, 0.6, 0])} position={[-3.2, 2.6, 3.2]} width={2.2} height={3.2} intensity={5 * lamp} color="#ffe3c0" />
        <directionalLight position={[3, 2.5, -4]} intensity={1.2} color="#8fb0ff" />
        {/* the opening's light sweep: a narrow strip that travels across the cans */}
        {sweep > -1 && <rectAreaLight ref={(l) => rectRef(l, [sweep * 2, 0.6, 0])} position={[sweep * 2 + 0.6, 1.4, 2.4]} width={0.25} height={2.6} intensity={30} color="#fff4e6" />}
        <spotLight position={[lampPos[0], lampPos[1], lampPos[2]]} angle={lampPos[1] > 6 ? 0.42 : 0.55} penumbra={0.95} intensity={90 * lamp} decay={2} color="#ffd9a6" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0003} shadow-normalBias={0.02} />
        <mesh position={[0, 4.2, -9]}><planeGeometry args={[36, 16]} /><meshBasicMaterial map={tex.bokeh} toneMapped={false} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} receiveShadow>
          <planeGeometry args={[18, 9]} />
          <meshStandardMaterial map={tex.stone} roughness={0.42} metalness={0.05} />
        </mesh>
        {cans.map((c, i) => <Can key={i} s={c} tex={tex} />)}
        {cubes.map((c, i) => (
          <mesh key={i} geometry={cubeGeo} position={[c.p[0], c.p[1], c.p[2]]} rotation={[c.r[0], c.r[1], c.r[2]]} scale={c.s ?? 1} castShadow receiveShadow>
            <meshPhysicalMaterial color="#fbf8f2" roughness={0.7} bumpMap={tex.sugar} bumpScale={0.7} sheen={0.6} sheenColor="#ffffff" />
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

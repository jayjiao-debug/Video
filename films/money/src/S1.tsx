import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, camAt, EN, ZH, GOLD, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { Stage } from './stage';
import { CamRig, Env, canvasTex, project } from './three-kit';
import { useModels, useAsset } from './useModels';
import { Bill, Bokeh, EnvFor, Neon, Pendant, Spot, Steam, islands, fit, loadBillTex, softTex, BILL_W } from './kit';
import { loadModel, materials } from './models';

/* S1, cold open (b0–b31; the title card stamps on b32 = 16.61 s).
   A  b0–b8   a noodle shop at night. Macro along a $100 note lying by a steaming bowl, then pull back to the table.
   B  b8–b16  top-down on the note: what it costs to print (Fed: 8.6¢ in 2023).
   C  b16–b24 cut to dark earth: a gold bar half buried, a lamp beam slides over it and it still shines.
   D  b24–b31 back on the table, the note and the bar side by side, the camera rises to look straight down. */
export const S1_IN = 0, S1_OUT = b(31);

export const LINES_S1: Line[] = [
  [b(0) + 0.5, b(8) - 0.1, '一张纸，能换一顿饭。', 'A slip of paper buys a meal.'],
  [b(8) + 0.06, b(16) - 0.1, '印这张100美元，成本只要[几美分]。', 'This $100 note costs a few cents to print.'],
  [b(16) + 0.06, b(24) - 0.1, '一块黄金，埋三千年，挖出来照样值钱。', 'Bury gold for 3,000 years. Dig it up: still worth a fortune.'],
  [b(24) + 0.06, b(30) - 0.12, '钱，[凭什么]值钱？', 'So what makes money worth anything?'],
];

const TOP = 0.76; // table top
const BILL: [number, number, number] = [-0.08, TOP + 0.0012, 0.06];
const BILL_RY = 0.22;
const BOWL: [number, number, number] = [0.17, TOP, -0.03];
const BAR: [number, number, number] = [0.06, TOP, 0.12];

const KEYS_A: Key[] = [
  [0, [-0.19, TOP + 0.04, 0.1], [-0.07, TOP + 0.002, 0.05]],
  [b(5), [-0.07, TOP + 0.045, 0.125], [-0.035, TOP + 0.002, 0.045]],
  [b(8), [0.07, TOP + 0.3, 0.56], [0.05, TOP + 0.05, 0]],
];
const KEYS_B: Key[] = [
  [b(8), [-0.075, TOP + 0.3, 0.2], [-0.08, TOP, 0.065]],
  [b(16), [-0.08, TOP + 0.235, 0.155], [-0.08, TOP, 0.06]],
];
const KEYS_D: Key[] = [
  [b(24), [0.3, TOP + 0.3, 0.6], [0.0, TOP + 0.01, 0.06]],
  [b(30), [-0.012, TOP + 0.43, 0.105], [-0.012, TOP, 0.095]],
  [b(31), [-0.012, TOP + 0.41, 0.1], [-0.012, TOP, 0.095]],
];
const KEYS_C: Key[] = [
  [b(16), [0.3, 0.14, 0.42], [0.0, 0.0, 0.0]],
  [b(24), [0.13, 0.065, 0.2], [0.0, 0.006, 0.0]],
];

const dist = (keys: Key[], T: number, p: number[]) => {
  const { pos } = camAt(keys, T);
  return Math.hypot(pos[0] - p[0], pos[1] - p[1], pos[2] - p[2]);
};

/** one gold bar out of the three-bar model; gold that reads as gold (metal, warm, some env) */
export const loadBar = async () => {
  const g = await loadModel('goldbar');
  const bar = fit(islands(g)[0], 0.116);
  const m = (bar.material as THREE.MeshStandardMaterial).clone();
  m.color = new THREE.Color('#e9b85a'); m.metalness = 1; m.roughness = 0.4; 
  bar.material = m;
  return bar;
};

/** the city behind the shop: thousands of small lit windows that come on, one by one ("billions of people") */
const CITY_N = 6000;
const CITY = Array.from({ length: CITY_N }, (_, i) => [(rnd(i, 1) - 0.5) * 44, -1 + Math.pow(rnd(i, 2), 1.4) * 7, -6 - rnd(i, 3) * 30]);
const City: React.FC<{ T: number; k: number }> = ({ T, k }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(CITY.flat(), 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(CITY_N * 3).fill(0), 3));
    return g;
  }, []);
  const c = geo.attributes.color as THREE.BufferAttribute;
  for (let i = 0; i < CITY_N; i++) {
    const on = easeOut(prog(k, rnd(i, 4) * 0.9, rnd(i, 4) * 0.9 + 0.1)) * (0.6 + 0.4 * Math.sin(T * (0.5 + rnd(i, 5)) + i));
    const w = rnd(i, 6) > 0.15 ? [1, 0.75, 0.45] : [0.7, 0.8, 1];
    c.setXYZ(i, w[0] * on, w[1] * on, w[2] * on);
  }
  c.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.22} map={softTex()} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
    </points>
  );
};

export const TableSet: React.FC<{ T: number; keys: Key[]; bar: boolean; focus: number; aperture: number; noodle: THREE.Group; table: THREE.Group; barMesh: THREE.Mesh; tex: Awaited<ReturnType<typeof loadBillTex>>; crowd?: number }> = ({ T, keys, bar, focus, aperture, noodle, table, barMesh, tex, crowd = 0 }) => {
  const tablePlaced = useMemo(() => {
    const bb = new THREE.Box3().setFromObject(table);
    table.position.y += TOP - bb.max.y;
    table.rotation.y = Math.PI / 2;
    // the scanned planks are pale; stain them darker so the note and the food carry the light
    materials(table).forEach((m) => { m.color = new THREE.Color('#5d4a3a'); m.roughness = 0.8; });
    return table;
  }, [table]);
  const barObj = useMemo(() => barMesh.clone(), [barMesh]);
  const lampOn = 1;
  return (
    <Stage focus={focus} aperture={aperture} maxblur={0.012} bloom={0.35} threshold={0.92} exposure={1.0} seed={Math.floor(T * 30) % 97} fov={30}>
      <CamRig T={T} keys={keys} fov={30} />
      <Env intensity={0.12} />
      <ambientLight intensity={0.03} color="#8090b0" />
      <Spot position={[0.03, TOP + 0.55, 0.0]} target={[0.0, TOP, 0.03]} angle={0.85} penumbra={0.75} intensity={1.5 * lampOn} color="#ffbe7a" near={0.05} far={3} bias={-0.00015} />
      <pointLight position={[-0.9, TOP + 0.45, -1.1]} intensity={1.6} decay={2} color="#6f8cff" />
      <pointLight position={[0.9, TOP + 0.25, 0.7]} intensity={0.25} decay={2} color="#ffd9b0" />
      <Pendant position={[0.03, TOP + 0.6, 0.0]} on={lampOn} />
      <primitive object={tablePlaced} />
      <primitive object={noodle} position={BOWL} rotation={[0, 0.6, 0]} />
      <Steam T={T} at={[BOWL[0], TOP + 0.08, BOWL[2]]} r={0.08} />
      {/* chopsticks resting on the table by the bowl */}
      {[0, 1].map((k) => (
        <mesh key={k} position={[BOWL[0] + 0.02 + k * 0.012, TOP + 0.004, BOWL[2] + 0.16]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.0028, 0.0042, 0.24, 10]} />
          <meshStandardMaterial color="#3a2414" roughness={0.45} />
        </mesh>
      ))}
      <Bill tex={tex} position={BILL} rotation={[0, BILL_RY, 0]} curl={0.0035} />
      {bar && <primitive object={barObj} position={BAR} rotation={[0, -0.35, 0]} />}
      <EnvFor mats={[barMesh.material as THREE.Material]} intensity={0.55} />
      {/* the shop behind: a warm back wall far off, a neon sign and street lights through the window, all soft */}
      {crowd <= 0 && <mesh position={[0, 1.2, -4.5]}><planeGeometry args={[14, 6]} /><meshStandardMaterial color="#1a120c" roughness={1} /></mesh>}
      <Neon text="面" position={[-1.25, 1.55, -2.6]} h={0.55} />
      <Bokeh T={T} z={-3.0} spread={6} y={1.2} />
      {crowd > 0 && <Bokeh T={T} n={Math.floor(crowd)} z={-3.6} spread={10} y={1.25} seed={7} o={0.9} />}
      {crowd > 0 && <City T={T} k={crowd / 220} />}
    </Stage>
  );
};

/* ---- C: the bar in the earth ---- */
const soilTex = () => canvasTex(1024, 1024, (g) => {
  g.fillStyle = '#2a1c12'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26000; i++) {
    const r = rnd(i, 1);
    g.fillStyle = r < 0.5 ? `rgba(15,9,5,${0.25 + rnd(i, 2) * 0.4})` : r < 0.85 ? `rgba(70,48,30,${0.2 + rnd(i, 2) * 0.35})` : `rgba(120,96,70,${0.25 + rnd(i, 2) * 0.3})`;
    const s = 1 + rnd(i, 3) * (r > 0.85 ? 3 : 6);
    g.beginPath(); g.arc(rnd(i, 4) * 1024, rnd(i, 5) * 1024, s, 0, Math.PI * 2); g.fill();
  }
});
const soilGeo = () => {
  const g = new THREE.PlaneGeometry(2, 2, 220, 220);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    let h = 0.006 * Math.sin(x * 23 + 1.3) * Math.cos(z * 19) + 0.004 * Math.sin(x * 61 + z * 47) + 0.002 * Math.sin(x * 140 - z * 120);
    // the pit the bar lies in: a soft dip with a raised lip of dug earth
    const r = Math.hypot(x / 1.35, z) ;
    h += -0.02 * Math.exp(-((r / 0.075) ** 4)) + 0.012 * Math.exp(-(((r - 0.1) / 0.03) ** 2));
    p.setY(i, h);
  }
  g.computeVertexNormals();
  return g;
};

const SoilSet: React.FC<{ T: number; barMesh: THREE.Mesh }> = ({ T, barMesh }) => {
  const tex = useMemo(() => { const t = soilTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; }, []);
  const geo = useMemo(soilGeo, []);
  const bar = useMemo(() => barMesh.clone(), [barMesh]);
  const pebbles = useMemo(() => Array.from({ length: 70 }, (_, i) => {
    const a = rnd(i, 1) * Math.PI * 2, r = 0.09 + rnd(i, 2) * 0.5;
    return { p: [Math.cos(a) * r * 1.3, 0.0, Math.sin(a) * r] as [number, number, number], s: 0.004 + rnd(i, 3) * 0.012, ry: rnd(i, 4) * 6 };
  }), []);
  // a hand lamp's beam slides across from the left and settles on the bar
  const k = easeInOut(prog(T, b(16), b(20)));
  const beam: [number, number, number] = [lerp(-0.35, 0.0, k), 0, lerp(0.05, 0, k)];
  const shine = easeOut(prog(T, b(18), b(21)));
  return (
    <Stage focus={dist(KEYS_C, T, [0, 0.01, 0])} aperture={0.03} maxblur={0.012} bloom={0.45} threshold={0.9} exposure={1.0} seed={Math.floor(T * 30) % 97}>
      <CamRig T={T} keys={KEYS_C} fov={30} />
      <Env intensity={0.08} />
      <ambientLight intensity={0.02} color="#6070a0" />
      <Spot position={[-0.12, 0.7, 0.22]} target={beam} angle={0.3} penumbra={0.9} intensity={4} color="#ffd29a" near={0.1} far={2} bias={-0.0002} />
      <pointLight position={[0.4, 0.25, -0.6]} intensity={0.5} decay={2} color="#5d7cff" />
      <pointLight position={[0.1, 0.3, 0.5]} intensity={0.08} decay={2} color="#ffcf9a" />
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial map={tex} roughness={1} color="#9a8676" />
      </mesh>
      {pebbles.map((q, i) => (
        <mesh key={i} position={q.p} rotation={[0, q.ry, 0]} scale={[q.s * 1.4, q.s * 0.7, q.s]} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rnd(i, 5) > 0.5 ? '#3b3129' : '#54473b'} roughness={0.95} flatShading />
        </mesh>
      ))}
      <EnvFor mats={[barMesh.material as THREE.Material]} intensity={0.9} />
      <primitive object={bar} position={[0, -0.019, 0]} rotation={[0.04, 0.5, -0.06]} />
      {/* dust hanging in the beam */}
      {Array.from({ length: 50 }, (_, i) => {
        const y = 0.02 + rnd(i, 1) * 0.25 + 0.01 * Math.sin(T * 0.5 + i);
        const s = 0.0025 + rnd(i, 2) * 0.004;
        return (
          <sprite key={i} position={[beam[0] - 0.12 + rnd(i, 3) * 0.24 + 0.01 * Math.sin(T * 0.3 + i * 2), y, beam[2] - 0.1 + rnd(i, 4) * 0.2]} scale={[s, s, s]}>
            <spriteMaterial map={softTex()} color="#ffe2b0" transparent opacity={0.5 * (0.3 + 0.7 * shine) * rnd(i, 5)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        );
      })}
    </Stage>
  );
};

export const S1: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['noodles', 'table']);
  const tex = useAsset('billtex', loadBillTex);
  const barMesh = useAsset('goldbar1', loadBar);
  if (T > S1_OUT || !m || !tex || !barMesh) return null;
  const o = (0.45 + 0.55 * easeOut(prog(T, 0, 0.5))) * (1 - easeIn(prog(T, b(30), S1_OUT))); // no black lead-in: the first frame already shows the note
  const shot = T < b(8) ? 'A' : T < b(16) ? 'B' : T < b(24) ? 'C' : 'D';
  const keys = shot === 'A' ? KEYS_A : shot === 'B' ? KEYS_B : KEYS_D;
  // focus: on the note in A/B, then the note and bar in D
  const focus = shot === 'A' ? lerp(dist(KEYS_A, T, [-0.04, TOP, 0.05]), dist(KEYS_A, T, [0.05, TOP + 0.05, 0]), easeInOut(prog(T, b(5), b(8))))
    : shot === 'B' ? dist(KEYS_B, T, [-0.08, TOP, 0.06]) : dist(KEYS_D, T, [-0.01, TOP, 0.09]);
  const aperture = shot === 'A' ? lerp(0.035, 0.008, easeInOut(prog(T, b(5), b(8)))) : shot === 'B' ? 0.03 : 0.015;
  // B: the printing cost tag
  const tagO = shot === 'B' ? easeOut(prog(T, b(12), b(12) + 0.35)) * (1 - prog(T, b(16) - 0.3, b(16))) : 0;
  const anchor = project(KEYS_B, Math.min(Math.max(T, b(8)), b(16)), [BILL[0] + BILL_W * 0.32, TOP, BILL[2] - 0.02]);
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {shot === 'C'
        ? <SoilSet T={T} barMesh={barMesh} />
        : <TableSet T={T} keys={keys} bar={shot === 'D'} focus={focus} aperture={aperture} noodle={m.noodles} table={m.table} barMesh={barMesh} tex={tex} />}
      {tagO > 0.01 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: tagO }}>
          <line x1={anchor.x} y1={anchor.y} x2={anchor.x + 150} y2={anchor.y - 150 * easeOut(prog(T, b(12), b(13)))} stroke={GOLD} strokeWidth={2} />
          <circle cx={anchor.x} cy={anchor.y} r={6 * pop(T, b(12))} fill={GOLD} />
        </svg>
      )}
      {tagO > 0.01 && (
        <div style={{ position: 'absolute', left: anchor.x + 165, top: anchor.y - 230, opacity: tagO, transform: `translateY(${(1 - easeOut(prog(T, b(12), b(13)))) * 16}px)` }}>
          <div style={{ fontFamily: ZH, fontSize: 28, color: 'rgba(243,237,226,0.8)', letterSpacing: '0.12em' }}>印制成本</div>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 104, lineHeight: 1, color: GOLD, textShadow: '0 0 26px rgba(246,207,120,0.35), 0 4px 20px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}>
            8.6<span style={{ fontFamily: ZH, fontSize: 40 }}> 美分</span>
          </div>
          <div style={{ fontFamily: ZH, fontSize: 20, color: 'rgba(243,237,226,0.5)', marginTop: 6 }}>美联储 · 2023 年 · 每张 100 美元</div>
        </div>
      )}
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S1} />
    </AbsoluteFill>
  );
};

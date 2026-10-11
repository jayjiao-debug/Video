import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, ZH, EN, prog, easeOut, easeInOut, lerp } from '../lib';
import { Glow, Dust, Vignette, Grain, YearStamp } from '../ui';
import { v3, Sub, RedString3 } from '../t3/Open3D';
import { textPlane, haloTex } from '../t3/Reveal3D';
import { SQ, CELL, CELLS, HITS, HOT, HOT_SPOT, HOT_R, COLD_SPOT, OBSERVED, EXPECTED, TOP_HITS, thamesZ, mulberry } from './data';

export const V1_END = 130.5;

/* ---------- music anchors (original BGM, from 0 s) ---------- */
const DROP1 = 16.625, CUT = 20.689, BD = 49.041, BUILD = 63.205, GAP = 79.412, DROP2 = 81.432, TEX = 115.868, FIN = 121.951;
const Q_AT = 12.61;
const GRID_AT = 40.2;
const TINT_AT = BD + 0.2;
const FLY_AT = 64.0;
const BACK_AT = 85.6;
const PANEL_ANS = 102.6;
const SHUFFLE_AT = 110.4;

/* ---------- camera ---------- */
type Key = [number, number[], number[]];
const KEYS: Key[] = [
  [0.0, [8.6, 1.35, 8.6], [5.2, 0.05, 3.6]],
  [11.6, [-0.6, 1.5, 2.4], [-3.4, 0.0, -1.6]],
  [16.3, [0, 15, 10.5], [0, 0, 0.6]],
  [20.6, [0, 17.5, 13], [0, 0, 0]],
  [28.6, [0, 31, 21.5], [0, 0, -2.6]],
  [32.6, [HOT_SPOT.x + 1.6, 5.8, HOT_SPOT.z + 5.8], [HOT_SPOT.x, 0, HOT_SPOT.z]],
  [36.8, [COLD_SPOT.x + 1.6, 5.8, COLD_SPOT.z + 5.8], [COLD_SPOT.x, 0, COLD_SPOT.z]],
  [41.0, [0, 16.5, 13], [0, 0, 0.8]],
  [49.0, [0, 15.5, 12.2], [0, 0, 0.8]],
  [55.6, [0.6, 14.5, 11.2], [0.3, 0, 0.6]],
  [60.4, [HOT.x + 1.3, 4.3, HOT.z + 4.3], [HOT.x, 0.4, HOT.z]],
  [63.4, [HOT.x + 1.3, 4.3, HOT.z + 4.3], [HOT.x, 0.4, HOT.z]],
  [67.2, [0, 4.6, 15.2], [0, 2.2, 0.5]],
  [79.4, [0, 4.0, 13.0], [0, 2.05, 0.5]],
  [81.4, [0, 4.0, 13.0], [0, 2.05, 0.5]],
  [85.4, [0, 4.4, 14.2], [0, 2.05, 0.5]],
  [88.2, [0, 15.5, 12.6], [0, 0, -0.7]],
  [93.4, [0, 14.5, 11.6], [0, 0, -0.7]],
  [95.6, [0, 3.3, 11.6], [0, 2.3, 1.5]],
  [105.6, [0, 3.1, 10.8], [0, 2.3, 1.5]],
  [107.6, [0, 3.7, 9.8], [0, 3.1, 1.5]],
  [115.6, [0, 3.6, 9.2], [0, 3.1, 1.5]],
  [119.6, [0, 18, 13.5], [0, 0, 0]],
  [V1_END, [0, 21, 15.5], [0, 0, 0]],
];
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i];
  const [tb, pb, lb] = KEYS[i + 1];
  const raw = prog(T, ta, tb);
  const k = i === 0 ? raw * raw * (3 - 2 * raw) * 0.5 + raw * 0.5 : easeInOut(raw);
  return { pos: pa.map((x, j) => lerp(x, pb[j], k)), look: la.map((x, j) => lerp(x, lb[j], k)) };
};
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.copy(v3(pos));
  camera.lookAt(v3(look));
  camera.updateProjectionMatrix();
  return null;
};

/* ---------- labels that can lie flat or stand up ---------- */
const Lbl: React.FC<{ text: string; pos: number[]; w: number; h: number; o: number; color?: string; font?: string; flat?: boolean }> = ({
  text, pos, w, h, o, color = C.paper, font = `500 44px ${ZH}`, flat = false,
}) => {
  const tp = useMemo(() => textPlane(w, h), [w, h]);
  useMemo(() => {
    const { g, c, tx } = tp;
    g.clearRect(0, 0, c.width, c.height);
    g.font = font;
    g.textBaseline = 'middle';
    const parts = text.split('*');
    const widths = parts.map((p) => g.measureText(p).width);
    let x = (c.width - widths.reduce((a, b) => a + b, 0)) / 2;
    g.textAlign = 'left';
    g.shadowColor = 'rgba(0,0,0,0.85)';
    g.shadowBlur = 14;
    parts.forEach((p, i) => {
      g.fillStyle = i % 2 ? C.goldHi : color;
      g.fillText(p, x, c.height / 2);
      x += widths[i];
    });
    tx.needsUpdate = true;
  }, [text, color, font, tp]);
  if (o <= 0.001) return null;
  return (
    <mesh position={pos as any} rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tp.tx} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};

/* ---------- the city ---------- */
const City: React.FC = () => {
  const mesh = useMemo(() => {
    const r = mulberry(7);
    const pts: number[][] = [];
    for (let x = -19; x < 19; x += 0.34) {
      for (let z = -15; z < 12; z += 0.34) {
        if ((Math.round(x / 0.34) % 6) === 0 || (Math.round(z / 0.34) % 7) === 0) continue; // avenues
        const jx = x + (r() - 0.5) * 0.06, jz = z + (r() - 0.5) * 0.06;
        if (Math.abs(jz - thamesZ(jx)) < 0.55) continue;
        if (r() < 0.12) continue; // parks and gaps
        pts.push([jx, jz, r(), r(), r()]);
      }
    }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ color: '#4a4c58', roughness: 0.85 });
    const im = new THREE.InstancedMesh(geo, mat, pts.length);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    pts.forEach(([x, z, a, b, c2], i) => {
      const d = Math.hypot(x, z + 2);
      const hgt = 0.04 + Math.pow(a, 2.2) * (0.16 + 0.12 * Math.max(0, 1 - d / 14));
      o.position.set(x, 0, z);
      o.scale.set(0.2 + b * 0.09, hgt, 0.2 + c2 * 0.09);
      o.rotation.y = (b - 0.5) * 0.08;
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      col.setHSL(0.61 + a * 0.04, 0.12, 0.16 + b * 0.08);
      im.setColorAt(i, col);
    });
    im.castShadow = true;
    im.receiveShadow = true;
    return im;
  }, []);
  return <primitive object={mesh} />;
};

const Thames: React.FC = () => {
  const geo = useMemo(() => {
    const shape: number[] = [];
    const idx: number[] = [];
    let n = 0;
    for (let x = -22; x <= 22; x += 0.25) {
      const z = thamesZ(x), w = 0.42 + 0.08 * Math.sin(x * 0.4);
      shape.push(x, 0.012, z - w, x, 0.012, z + w);
      if (n > 0) idx.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n);
      n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(shape, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#0d1626" roughness={0.18} metalness={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
};

/* ---------- hits: glowing craters ---------- */
const EMBER = new THREE.Color('#ff9a3c');
const COOLED = new THREE.Color('#b0603a');
const Hits: React.FC<{ T: number; dim: number; warm: number }> = ({ T, dim, warm }) => {
  const { core, halo } = useMemo(() => {
    const cg = new THREE.SphereGeometry(0.035, 10, 8);
    const cm = new THREE.MeshStandardMaterial({ color: '#ffd7a0', emissive: '#ff8a2a', emissiveIntensity: 2.2, roughness: 0.4 });
    const ci = new THREE.InstancedMesh(cg, cm, HITS.length);
    const hg = new THREE.PlaneGeometry(1, 1);
    hg.rotateX(-Math.PI / 2);
    const hm = new THREE.MeshBasicMaterial({ map: haloTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const hi = new THREE.InstancedMesh(hg, hm, HITS.length);
    hi.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(HITS.length * 3), 3);
    return { core: ci, halo: hi };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  HITS.forEach((h, i) => {
    const age = T - h.t;
    const on = age >= 0 ? 1 : 0;
    const flash = age >= 0 ? Math.exp(-age * 2.2) : 0;
    const pop = age >= 0 ? easeOut(Math.min(1, age / 0.18)) : 0;
    o.position.set(h.x, 0.16, h.z);
    o.rotation.set(0, 0, 0);
    o.scale.setScalar(Math.max(0.0001, pop * on * (1 + flash * 0.8)));
    o.updateMatrix();
    core.setMatrixAt(i, o.matrix);
    o.position.set(h.x, 0.2, h.z);
    const s = (0.5 + flash * 1.8 + warm * 0.08) * pop * on;
    o.scale.set(Math.max(0.0001, s), 1, Math.max(0.0001, s));
    o.updateMatrix();
    halo.setMatrixAt(i, o.matrix);
    const glow = (0.35 + 0.65 * flash) * (1 - dim * 0.7) + warm * 0.18;
    col.copy(COOLED).lerp(EMBER, Math.min(1, flash + warm)).multiplyScalar(glow);
    halo.setColorAt(i, col);
  });
  core.instanceMatrix.needsUpdate = true;
  halo.instanceMatrix.needsUpdate = true;
  if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
  (core.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.2 * (1 - dim * 0.6) + warm * 0.5;
  return (
    <>
      <primitive object={core} />
      <primitive object={halo} />
    </>
  );
};

/* ---------- incoming flying bombs ---------- */
const STREAK_T = 1.1;
const DIR = new THREE.Vector3(7.5, 3.2, 6.5).normalize();
const Streaks: React.FC<{ T: number }> = ({ T }) => {
  const { head, tail } = useMemo(() => {
    const hg = new THREE.SphereGeometry(0.03, 10, 8);
    hg.scale(1, 1, 2.4);
    const hm = new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ff9a3c', emissiveIntensity: 3 });
    const tg = new THREE.CylinderGeometry(0.004, 0.022, 1, 6, 1, true);
    tg.rotateX(Math.PI / 2);
    tg.translate(0, 0, 0.5);
    const tm = new THREE.MeshBasicMaterial({ color: '#ffb066', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    return { head: new THREE.InstancedMesh(hg, hm, 80), tail: new THREE.InstancedMesh(tg, tm, 80) };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  let n = 0;
  for (const h of HITS) {
    const u = (T - (h.t - STREAK_T)) / STREAK_T;
    if (u < 0 || u > 1 || n >= 80) continue;
    const dist = 9 * (1 - u);
    const p = new THREE.Vector3(h.x, 0.16, h.z).addScaledVector(DIR, dist);
    o.position.copy(p);
    o.lookAt(p.clone().addScaledVector(DIR, -1));
    o.scale.setScalar(1);
    o.updateMatrix();
    head.setMatrixAt(n, o.matrix);
    o.lookAt(p.clone().addScaledVector(DIR, 1));
    o.scale.set(1, 1, Math.min(2.4, dist));
    o.updateMatrix();
    tail.setMatrixAt(n, o.matrix);
    n++;
  }
  head.count = n;
  tail.count = n;
  head.instanceMatrix.needsUpdate = true;
  tail.instanceMatrix.needsUpdate = true;
  return (
    <>
      <primitive object={head} />
      <primitive object={tail} />
    </>
  );
};

/* ---------- Clarke's grid ---------- */
const Grid: React.FC<{ T: number; o: number }> = ({ T, o }) => {
  if (o <= 0.001) return null;
  const items = [];
  const y = 0.34;
  const frame = easeOut(prog(T, GRID_AT - 1.4, GRID_AT - 0.2));
  const drop = 1 - frame;
  for (let k = 0; k <= SQ.n; k++) {
    const p = easeOut(prog(T, GRID_AT + k * 0.035, GRID_AT + k * 0.035 + 0.6));
    if (p <= 0) continue;
    const edge = k === 0 || k === SQ.n;
    const w = edge ? 0.04 : 0.012;
    const a = SQ.x0 + k * CELL;
    const len = SQ.size * p;
    items.push(
      <mesh key={`x${k}`} position={[a, y, SQ.z0 + len / 2]}>
        <boxGeometry args={[w, 0.01, len]} />
        <meshStandardMaterial color="#f0d59a" emissive="#c9a45c" emissiveIntensity={edge ? 1.6 : 0.9} transparent opacity={o * (edge ? 1 : 0.55)} depthWrite={false} />
      </mesh>,
      <mesh key={`z${k}`} position={[SQ.x0 + len / 2, y, SQ.z0 + k * CELL]}>
        <boxGeometry args={[len, 0.01, w]} />
        <meshStandardMaterial color="#f0d59a" emissive="#c9a45c" emissiveIntensity={edge ? 1.6 : 0.9} transparent opacity={o * (edge ? 1 : 0.55)} depthWrite={false} />
      </mesh>,
    );
  }
  // the gold frame drops in before the lines are drawn
  if (frame > 0) {
    const yy = y + drop * 3;
    const s = SQ.size;
    [[0, -s / 2, s, 0.05], [0, s / 2, s, 0.05], [-s / 2, 0, 0.05, s], [s / 2, 0, 0.05, s]].forEach(([dx, dz, w, d], i) =>
      items.push(
        <mesh key={`f${i}`} position={[dx, yy, dz]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshStandardMaterial color="#f0d59a" emissive="#c9a45c" emissiveIntensity={2} transparent opacity={o * frame} />
        </mesh>,
      ),
    );
  }
  return <>{items}</>;
};

/* ---------- 576 tiles: tint by hits, fly into columns, fly back ---------- */
const TILE_H = 0.013;
const COL_X = (k: number) => -5 + k * 2;
const COL_Z = 0.5;
const HEAT = ['#273247', '#7a4a22', '#b4672a', '#dc8a36', '#f2ab4a', '#ffd27a', '#ffd27a', '#ffe2a0'].map((c) => new THREE.Color(c));
const ICE = new THREE.Color('#9cc4ff');
/* colour of a square once it is sorted: empty squares ice-blue, the rest keep their heat colour */
const sortedColour = (count: number) => (count === 0 ? ICE : HEAT[Math.min(count, 7)]);
const Tiles: React.FC<{ T: number }> = ({ T }) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(CELL * 0.86, TILE_H * 0.8, CELL * 0.86);
    const m = new THREE.MeshBasicMaterial({ transparent: true });
    const im = new THREE.InstancedMesh(g, m, CELLS.length);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CELLS.length * 3), 3);
    return im;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const vis = easeOut(prog(T, TINT_AT, TINT_AT + 2.4)) * (1 - prog(T, 93.2, 94.2));
  const focus = easeInOut(prog(T, 88.2, 89.2)); // S09: empty squares stand out, the 7-hit square glows, the rest dim
  CELLS.forEach((cl, i) => {
    const lift = cl === HOT ? easeInOut(prog(T, 58.2, 59.4)) * (1 - easeInOut(prog(T, FLY_AT - 0.4, FLY_AT + 0.4))) : 0;
    const home = new THREE.Vector3(cl.x, 0.34 + lift * 0.9, cl.z);
    const colPos = new THREE.Vector3(COL_X(cl.bucket), 0.6 + cl.rank * TILE_H, COL_Z);
    const t0 = FLY_AT + cl.order * 6.6;
    const go = easeInOut(prog(T, t0, t0 + 1.2));
    const t1 = BACK_AT + cl.order * 1.8;
    const back = easeInOut(prog(T, t1, t1 + 0.9));
    const k = go * (1 - back);
    const p = home.clone().lerp(colPos, k);
    p.y += Math.sin(Math.PI * k) * 2.2 * (go < 1 ? 1 : 0.4);
    o.position.copy(p);
    o.rotation.set(0, Math.sin(Math.PI * k) * 0.8, 0);
    o.scale.setScalar(Math.max(0.0001, vis));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    // once a square has been sorted it keeps its sorted colour, on the way back too
    const sorted = Math.max(go, T > t1 ? 1 : 0);
    const c = HEAT[Math.min(cl.count, 7)].clone().lerp(sortedColour(cl.count), sorted);
    if (focus > 0 && cl.count !== 0) {
      if (cl === HOT) c.lerp(new THREE.Color('#ffe9b8'), focus);
      else c.multiplyScalar(1 - 0.6 * focus);
    }
    mesh.setColorAt(i, c);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  (mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * vis;
  mesh.visible = vis > 0.002;
  return <primitive object={mesh} />;
};

/* ---------- the prediction: gold ghost columns ---------- */
const Ghosts: React.FC<{ T: number }> = ({ T }) => {
  const o = 1 - prog(T, BACK_AT - 0.2, BACK_AT + 0.6);
  if (T < DROP2 - 0.05 || o <= 0.001) return null;
  return (
    <>
      {EXPECTED.map((e, k) => {
        const d = easeOut(prog(T, DROP2 + k * 0.06, DROP2 + k * 0.06 + 0.45));
        const h = e * TILE_H;
        return (
          <mesh key={k} position={[COL_X(k), 0.59 + h / 2 + (1 - d) * 4, COL_Z]}>
            <boxGeometry args={[CELL * 1.05, h, CELL * 1.05]} />
            <meshStandardMaterial color="#f0d59a" emissive="#c9a45c" emissiveIntensity={1.3} transparent opacity={0.3 * d * o} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};

/* ---------- two dot boards: which one is random? ---------- */
const BOARD = 3.4;
const boardDots = (() => {
  const r = mulberry(1946);
  const a: number[][] = [], b: number[][] = [];
  for (let i = 0; i < 150; i++) a.push([r() - 0.5, r() - 0.5]);
  const n = 12;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (b.length >= 150) break;
    b.push([(i + 0.5 + (r() - 0.5) * 0.55) / n - 0.5, (j + 0.5 + (r() - 0.5) * 0.55) / n - 0.5]);
  }
  return [a, b];
})();
const Boards: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, 94.6, 95.8)) * (1 - prog(T, 105.8, 106.6));
  if (o <= 0.001) return null;
  const ans = easeOut(prog(T, PANEL_ANS, PANEL_ANS + 0.5));
  return (
    <>
      {boardDots.map((dots, s) => {
        const cx = s === 0 ? -2.15 : 2.15;
        const cy = 2.6, cz = 1.5;
        const win = s === 0;
        return (
          <group key={s}>
            <mesh position={[cx, cy, cz - 0.03]}>
              <boxGeometry args={[BOARD + 0.16, BOARD + 0.16, 0.04]} />
              <meshStandardMaterial color={win ? new THREE.Color('#2b2a2e').lerp(new THREE.Color('#c9a45c'), ans * 0.6) : '#2b2a2e'}
                emissive={win ? '#c9a45c' : '#000000'} emissiveIntensity={win ? ans * 0.5 : 0} transparent opacity={o} />
            </mesh>
            <mesh position={[cx, cy, cz]}>
              <planeGeometry args={[BOARD, BOARD]} />
              <meshStandardMaterial color="#e9e0cb" roughness={0.9} transparent opacity={o} />
            </mesh>
            {dots.map(([x, y], i) => (
              <mesh key={i} position={[cx + x * (BOARD - 0.25), cy + y * (BOARD - 0.25), cz + 0.012]}>
                <circleGeometry args={[0.045, 12]} />
                <meshBasicMaterial color="#3a2a22" transparent opacity={o} />
              </mesh>
            ))}
            <Lbl text={s === 0 ? '左' : '右'} pos={[cx, cy + BOARD / 2 + 0.32, cz]} w={1} h={0.4} o={o * (1 - ans)} font={`600 52px ${ZH}`} />
            <Lbl text={win ? '左 · *真随机*' : '右 · 排匀的'} pos={[cx, cy + BOARD / 2 + 0.32, cz]} w={2.6} h={0.4} o={o * ans}
              color={win ? C.paper : C.dim} font={`600 52px ${ZH}`} />
          </group>
        );
      })}
    </>
  );
};

/* ---------- playlist on the red string ---------- */
const ARTIST = ['#c4574a', '#5f86b8', '#c9a45c', '#6f9a6a', '#8a6aa8'];
const ORDER_RANDOM = [0, 0, 2, 3, 3, 3, 1, 4, 2, 2, 1, 4]; // what shuffle produced: clumps of the same artist
const ORDER_SPREAD = [2, 3, 0, 2, 3, 1, 4, 2, 3, 0, 1, 4]; // after the fix: no artist twice in a row
const SPREAD_SLOT = (() => {
  const used = new Set<number>();
  return ORDER_RANDOM.map((a) => {
    const slot = ORDER_SPREAD.findIndex((b, j) => b === a && !used.has(j));
    used.add(slot);
    return slot;
  });
})();
const Playlist: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, 106.4, 107.6)) * (1 - prog(T, 116.2, 117.4));
  if (o <= 0.001) return null;
  const n = ORDER_RANDOM.length;
  const gap = 0.74;
  const sx = (slot: number) => (slot - (n - 1) / 2) * gap;
  return (
    <group position={[0, 3.55, 1.5]} scale={0.84}>
      <group position={[0, 0, 0]} scale={[0.5, 1, 1]}>
        <RedString3 t={99} />
      </group>
      {ORDER_RANDOM.map((a, i) => {
        const t0 = SHUFFLE_AT + SPREAD_SLOT[i] * 0.06;
        const k = easeInOut(prog(T, t0, t0 + 0.8));
        const x = lerp(sx(i), sx(SPREAD_SLOT[i]), k);
        const lift = Math.sin(Math.PI * k) * 0.55;
        const appear = easeOut(prog(T, 106.6 + i * 0.07, 107.2 + i * 0.07));
        return (
          <group key={i} position={[x, -0.06 + lift + (1 - appear) * 0.8, 0]} rotation={[0, 0, Math.sin(T * 0.9 + i) * 0.02]}>
            <mesh position={[0, -0.47, 0]}>
              <boxGeometry args={[0.7, 0.86, 0.012]} />
              <meshStandardMaterial color="#efe6d0" roughness={0.85} transparent opacity={o * appear} />
            </mesh>
            <mesh position={[0, -0.4, 0.008]}>
              <circleGeometry args={[0.2, 24]} />
              <meshStandardMaterial color={ARTIST[a]} roughness={0.7} transparent opacity={o * appear} />
            </mesh>
            <Lbl text={`歌手${'ABCDE'[a]}`} pos={[0, -0.75, 0.01]} w={0.66} h={0.16} o={o * appear} color="#5a4a3a" font={`500 40px ${ZH}`} />
            <mesh position={[0, 0.02, 0.02]}>
              <boxGeometry args={[0.05, 0.15, 0.04]} />
              <meshStandardMaterial color="#7a5a34" transparent opacity={o * appear} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ---------- lights ---------- */
const Lights: React.FC<{ T: number }> = ({ T }) => {
  const { look } = camAt(T);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(look[0], 0, look[2]);
  target.updateMatrixWorld();
  const up = easeOut(prog(T, 0, 2.0));
  const dark = 1 - 0.75 * easeInOut(prog(T, 77.6, GAP)) * (1 - easeOut(prog(T, DROP2, DROP2 + 0.6)));
  const preDrop = 1 - 0.6 * easeInOut(prog(T, 15.3, DROP1 - 0.05)) * (T < DROP1 ? 1 : 0);
  const flare = (T >= DROP1 ? 1.8 * Math.exp(-(T - DROP1) * 2.2) : 0) + (T >= DROP2 ? 1.8 * Math.exp(-(T - DROP2) * 2.2) : 0);
  const warm = easeInOut(prog(T, TEX, TEX + 3));
  const k = up * dark * preDrop * (1 + flare);
  return (
    <>
      <primitive object={target} />
      <ambientLight intensity={0.3 * k} color="#5a6a98" />
      <directionalLight position={[-10, 22, 6]} intensity={0.9 * k} color="#9fb2dc" />
      <spotLight position={[look[0] + 3, 16, look[2] + 9]} target={target} angle={0.55} penumbra={0.9} decay={0.9}
        intensity={lerp(70, 150, warm) * k} color={new THREE.Color('#c9d2f0').lerp(new THREE.Color('#ffc07a'), warm)}
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0008} shadow-radius={6} shadow-blurSamples={12} />
    </>
  );
};

/* ---------- the whole world ---------- */
const Scene: React.FC<{ T: number; hide?: string[] }> = ({ T, hide = [] }) => {
  const H = (n: string) => !hide.includes(n);
  const gridO = easeOut(prog(T, GRID_AT - 1.4, GRID_AT)) * (1 - prog(T, FLY_AT, FLY_AT + 1)) + easeOut(prog(T, BACK_AT + 1.5, BACK_AT + 2.5)) * (1 - prog(T, 96, 97));
  const hitDim = easeInOut(prog(T, TINT_AT, TINT_AT + 2)) * (1 - easeInOut(prog(T, TEX, TEX + 3)));
  const warm = easeInOut(prog(T, TEX, TEX + 3.5));
  const ringO = (at: number) => easeOut(prog(T, at, at + 0.6)) * (1 - prog(T, 37.6, 38.4));
  const hotO = ringO(31.0), coldO = ringO(35.0);
  const sevenO = easeOut(prog(T, 58.6, 59.4)) * (1 - prog(T, FLY_AT - 0.4, FLY_AT));
  const colLblO = easeOut(prog(T, 71.0, 72.0)) * (1 - prog(T, BACK_AT - 0.2, BACK_AT + 0.4));
  const ghostLblO = easeOut(prog(T, DROP2 + 0.5, DROP2 + 1.0)) * (1 - prog(T, BACK_AT - 0.2, BACK_AT + 0.4));
  const zeroO = easeOut(prog(T, 88.4, 89.2)) * (1 - prog(T, 93.0, 93.6));
  return (
    <>
      <CamRig T={T} />
      <fog attach="fog" args={['#0b0d14', 18, 60]} />
      <Lights T={T} />
      {H('ground') && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          {/* finely subdivided: one giant triangle gets mis-clipped by the software renderer at some camera angles */}
          <planeGeometry args={[80, 60, 80, 60]} />
          <meshStandardMaterial color="#1a1c25" roughness={1} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      )}
      {H('city') && <City />}
      {H('thames') && <Thames />}
      {H('hits') && <Hits T={T} dim={hitDim} warm={warm} />}
      {H('streaks') && <Streaks T={T} />}
      {H('grid') && <Grid T={T} o={gridO} />}
      {H('tiles') && <Tiles T={T} />}
      {H('ghosts') && <Ghosts T={T} />}
      {/* rumours: a crowded spot and an empty one */}
      {hotO > 0.001 && (
        <>
          <mesh position={[HOT_SPOT.x, 0.36, HOT_SPOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[HOT_R, 0.025, 8, 64]} />
            <meshStandardMaterial color="#ffb066" emissive="#ff8a2a" emissiveIntensity={1.8} transparent opacity={hotO} />
          </mesh>
          <Lbl text="这里挨得最多" pos={[HOT_SPOT.x, 0.9, HOT_SPOT.z - 1.0]} w={2.6} h={0.42} o={hotO} font={`600 54px ${ZH}`} />
        </>
      )}
      {coldO > 0.001 && (
        <>
          <mesh position={[COLD_SPOT.x, 0.36, COLD_SPOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[COLD_SPOT.r, 0.025, 8, 64]} />
            <meshStandardMaterial color="#9fc0ff" emissive="#5f86b8" emissiveIntensity={1.6} transparent opacity={coldO} />
          </mesh>
          <Lbl text="这里一颗没有？" pos={[COLD_SPOT.x, 0.9, COLD_SPOT.z - COLD_SPOT.r - 0.35]} w={2.8} h={0.42} o={coldO} font={`600 54px ${ZH}`} />
        </>
      )}
      <Lbl text={`*${TOP_HITS}* 颗`} pos={[HOT.x, 1.55, HOT.z]} w={1.4} h={0.5} o={sevenO} font={`600 72px ${ZH}`} />
      {/* column labels */}
      {OBSERVED.map((v, k) => (
        <React.Fragment key={k}>
          <Lbl text={k === 5 ? '5颗以上' : `${k}颗`} pos={[COL_X(k), 0.36, COL_Z + 0.6]} w={1.6} h={0.34} o={colLblO} color={C.dim} font={`500 46px ${ZH}`} />
          <Lbl text={`${v}`} pos={[COL_X(k), 0.86 + v * TILE_H, COL_Z]} w={1.3} h={0.4} o={colLblO * (1 - ghostLblO)} font={`600 60px ${EN}`} />
          <Lbl text={`${v} / *${EXPECTED[k].toFixed(1)}*`} pos={[COL_X(k), 0.86 + Math.max(v, EXPECTED[k]) * TILE_H, COL_Z]} w={2.0} h={0.4} o={ghostLblO} font={`600 54px ${EN}`} />
        </React.Fragment>
      ))}
      {H('boards') && <Boards T={T} />}
      {H('playlist') && <Playlist T={T} />}
    </>
  );
};

export const V1Film: React.FC<{ from?: number; hide?: string[] }> = ({ from = 0, hide = [] }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = from + frame / fps;
  const qO = Math.min(easeOut(prog(T, Q_AT, Q_AT + 0.9)), 1 - prog(T, 16.35, 16.6));
  const qBlur = (1 - easeOut(prog(T, Q_AT, Q_AT + 0.7))) * 8;
  const tp = easeOut(prog(T, DROP1, DROP1 + 0.7));
  const titleO = prog(T, DROP1, DROP1 + 0.2) * (1 - prog(T, CUT - 0.35, CUT));
  const sweep = lerp(-60, 160, easeInOut(prog(T, DROP1 + 0.05, DROP1 + 1.5)));
  const revO = prog(T, DROP2, DROP2 + 0.2) * (1 - prog(T, 85.1, 85.5));
  const rp = easeOut(prog(T, DROP2, DROP2 + 0.6));
  const endFade = 1 - prog(T, 129.0, V1_END);
  const finO = (at: number) => easeOut(prog(T, at, at + 0.9));
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill style={{ opacity: endFade }}>
        <ThreeCanvas width={width} height={height} shadows="variance" gl={{ antialias: true }}
          camera={{ fov: 34, near: 0.1, far: 140, position: [0, 10, 10] }} style={{ background: '#0b0d14' }}>
          <Scene T={T} hide={hide} />
        </ThreeCanvas>

        {/* a soft dark band under the subtitle line, so text reads over any picture */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(8,9,13,0) 0%, rgba(8,9,13,0.55) 45%, rgba(8,9,13,0.78) 100%)' }} />
        {/* S01 */}
        <Sub t={T} at={1.0} out={5.6} zh="你有没有觉得，倒霉的事总爱*扎堆*？" en="Ever feel like bad luck comes in clusters?" />
        <Sub t={T} at={6.5} out={10.45} zh="1944年的伦敦人，也这么觉得" en="So did London, in 1944." />
        {qO > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: qO, filter: `blur(${qBlur}px)` }}>
            <div style={{ fontFamily: ZH, fontSize: 76, fontWeight: 600, color: C.paper, letterSpacing: '0.12em', textShadow: '0 3px 18px rgba(0,0,0,0.9)' }}>
              炸弹，是在<span style={{ color: C.gold }}>瞄准</span>某些街区吗？
            </div>
            <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 34, color: C.dim, marginTop: 12 }}>Were the bombs aiming at certain streets?</div>
          </div>
        )}
        {/* S02 title */}
        {titleO > 0 && (
          <AbsoluteFill style={{ opacity: titleO }}>
            <Glow x={960} y={330} r={720} color="rgba(201,164,92,0.9)" opacity={lerp(0.4, 0.14, easeOut(prog(T, DROP1 + 0.25, DROP1 + 2.2)))} />
            <Dust t={T} at={DROP1} cx={960} cy={330} seed="v1title" />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 168, textAlign: 'center', opacity: easeOut(prog(T, DROP1 + 0.2, DROP1 + 0.8)) }}>
              <span style={{ fontFamily: ZH, fontSize: 26, color: C.gold, letterSpacing: '0.5em' }}>— VIBE知识大赏 —</span>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 222, textAlign: 'center', transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
              <span style={{ fontFamily: ZH, fontSize: 168, fontWeight: 900, letterSpacing: '0.12em',
                backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                《它在瞄准谁》
              </span>
            </div>
            <Sub t={T} at={DROP1 + 0.6} out={CUT + 1} zh="坏运气，会扎堆吗？" en="Does bad luck cluster?" y={905} size={50} enSize={32} />
          </AbsoluteFill>
        )}
        {/* S03 - S04 */}
        <YearStamp t={T} at={CUT + 0.2} out={28.6} year="1944" place="伦敦 · LONDON" />
        <Sub t={T} at={CUT + 0.1} out={24.6} zh="1944年夏天起，德国向英国发射了约*1万*枚V-1飞弹" en="From the summer of 1944, Germany fired about 10,000 V-1 flying bombs at Britain." />
        <Sub t={T} at={24.75} out={28.7} zh="其中*2419*枚，落在了伦敦" en="2,419 of them came down on London." />
        <Sub t={T} at={28.85} out={32.0} zh="它飞来时嗡嗡作响，声音一停，就要落地了" en="They buzzed as they came. When the buzzing stopped, they fell." />
        <Sub t={T} at={32.15} out={34.7} zh="街头传言：飞弹专挑某些街区" en="People said the bombs picked certain streets." />
        <Sub t={T} at={34.85} out={36.95} zh="有人怀疑，没挨炸的地方住着德国间谍" en="Some suspected German spies lived where none fell." />
        {/* S05 - S06 */}
        <YearStamp t={T} at={37.4} out={48.6} year="1946" place="伦敦南部 · SOUTH LONDON" />
        <Sub t={T} at={37.2} out={40.9} zh="战后，精算师*克拉克*决定算一算" en="After the war, an actuary named R. D. Clarke did the maths." />
        <Sub t={T} at={41.05} out={44.9} zh="他在伦敦南部圈出*144*平方公里" en="He took 144 square kilometres of south London," />
        <Sub t={T} at={45.05} out={48.9} zh="切成*576*个小格子" en="and cut it into 576 squares." />
        <Sub t={T} at={BD + 0.1} out={53.0} zh="格子里，一共落了*537*颗" en="537 bombs had landed inside." />
        <Sub t={T} at={53.15} out={57.9} zh="有的一颗没有，有的挨了*7*颗" en="Some squares had none. One had seven." />
        <Sub t={T} at={58.05} out={BUILD - 0.1} zh="看起来，真的像在瞄准" en="It really did look like aiming." />
        {/* S07 */}
        <Sub t={T} at={BUILD + 0.1} out={69.2} zh="按挨炸次数，把576个格子排成一排排" en="Sort the 576 squares by how many hits they took." />
        <Sub t={T} at={69.35} out={75.2} zh="如果飞弹完全随机，数学能算出每根柱子该多高" en="If the bombs fell at random, maths can predict every column." />
        <Sub t={T} at={75.37} out={GAP - 0.05} zh="那现实，和“随机”差多少？" en="So how far is reality from random?" />
        {/* S08 reveal */}
        {revO > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 62, textAlign: 'center', opacity: revO,
            transform: `scale(${lerp(1.12, 1, rp)})`, filter: `blur(${(1 - easeOut(prog(T, DROP2, DROP2 + 0.45))) * 12}px)` }}>
            <span style={{ fontFamily: ZH, fontSize: 104, fontWeight: 900, letterSpacing: '0.12em',
              backgroundImage: `linear-gradient(180deg, ${C.goldHi} 0%, ${C.gold} 60%, #9c7a3c 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              几乎一模一样
            </span>
          </div>
        )}
        <Sub t={T} at={DROP2 + 0.9} out={85.4} zh="现实，就是“完全随机”的样子" en="Reality looked exactly like pure chance." />
        {/* S09 */}
        {T > 88 && T < 94 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center',
            opacity: easeOut(prog(T, 88.4, 89.2)) * (1 - prog(T, 93.0, 93.6)) }}>
            <span style={{ fontFamily: ZH, fontSize: 72, fontWeight: 600, color: '#cfe0ff', letterSpacing: '0.1em', textShadow: '0 3px 18px rgba(0,0,0,0.9)' }}>
              <span style={{ fontFamily: EN, fontSize: 92 }}>229</span> 格，一颗没挨
            </span>
          </div>
        )}
        <Sub t={T} at={85.6} out={89.45} zh="就算完全随机，也有*4成*格子一颗不挨" en="Even at random, four in ten squares get nothing," />
        <Sub t={T} at={89.6} out={93.5} zh="也总有倒霉的格子，挨了*7*颗" en="and some unlucky square gets seven." />
        {/* S10 */}
        <Sub t={T} at={93.75} out={97.6} zh="我们的大脑，天生不相信随机" en="Our brains don't trust randomness." />
        <Sub t={T} at={97.75} out={PANEL_ANS - 0.1} zh="左边和右边，哪个是随机的？" en="Left or right: which one is random?" />
        <Sub t={T} at={PANEL_ANS} out={105.8} zh="答案是左边。右边，是我故意排匀的" en="The left. I spaced out the right one on purpose." />
        {/* S11 */}
        <Sub t={T} at={106.0} out={110.3} zh="2014年，Spotify被投诉：随机播放不随机" en="In 2014, Spotify users complained shuffle wasn't random." />
        <Sub t={T} at={110.45} out={115.7} zh="工程师只好把它改得*没那么随机*" en="So the engineers made it less random." />
        {/* S12 - S13 */}
        {T > TEX && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 430, height: 420, opacity: easeOut(prog(T, FIN - 0.5, FIN + 0.5)) * 0.8,
            background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(8,9,13,0.85) 0%, rgba(8,9,13,0) 100%)' }} />
        )}
        <Sub t={T} at={TEX + 0.1} out={118.9} zh="所以，坏事扎堆的时候" en="So when bad things pile up," />
        <Sub t={T} at={119.05} out={FIN - 0.1} zh="不一定是你做错了什么" en="it doesn't mean you did something wrong." />
        <Sub t={T} at={FIN + 0.15} out={V1_END + 1} zh="随机，本来就会扎堆" en="Randomness clusters. That's what it does." y={560} size={76} enSize={34} />
        <Sub t={T} at={125.2} out={V1_END + 1} zh="好运，也会" en="So does good luck." y={740} size={56} />
      </AbsoluteFill>
      <Vignette strength={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};

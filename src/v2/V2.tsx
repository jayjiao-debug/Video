import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, ZH, EN, prog, easeOut, easeInOut, lerp } from '../lib';
import { Vignette, Grain } from '../ui';
import { v3, RedString3 } from '../t3/Open3D';
import { textPlane, haloTex, Seg } from '../t3/Reveal3D';
import { SQ, CELL, CELLS, HITS, HOT, HOT_SPOT, HOT_R, COLD_SPOT, OBSERVED, EXPECTED, TOP_HITS, thamesZ, mulberry } from '../v1/data';
import { REAL_FLIPS, REAL_RUN, FAKE_FLIPS, BIRTHDAYS, BIRTHDAY_PAIR } from './cases';
import { JUNO } from '../brand/identity';
import { TitleCard, EndCard, type VideoCfg } from '../brand/Brand';
import { CornerMark } from '../brand/CornerMark';

export const V2_END = 130.5;
export const EPISODE: VideoCfg = {
  id: 'random-clusters',
  title: '它在瞄准谁',
  kicker: 'POISSON · R. D. CLARKE · MCMXLVI',
  tagline: '坏运气，会扎堆吗？',
  taglineEn: 'Does bad luck come in clusters?',
  motif: 'grid',
  question: '你们班，有同一天生日的吗？评论区见',
  sources: 'Clarke 1946 · Gelman & Nolan 2002 · Poláček 2014',
};

/* ---------- music anchors (original BGM, from 0 s) ---------- */
const DROP1 = 16.625, CUT = 20.689, BD = 49.041, BUILD = 63.205, GAP = 79.412, DROP2 = 81.432, TEX = 115.868, FIN = 121.951;
const CARD_IN = 4.481, CARD_OUT = 8.545; // gold title card on bar 2, ending on the phrase start
const BARS = [8.545, 10.565, 12.608, 14.629]; // the four teaser flashes, one bar each
const END_IN = 124.5;
const GRID_AT = 40.2;
const TINT_AT = BD + 0.2;
const FLY_AT = 64.0;
const BACK_AT = 85.6;
const SHUFFLE_AT = 112.2;
const SHELF_Y = 2.65, SHELF_Z = 8.6;
const COINS_X = -9, BDAY_X = 0, LIST_X = 9;
/** the three everyday cases: teaser windows after the title card, payoff windows after the reveal */
const WIN = {
  coins: [[8.3, 10.95], [93.3, 101.3]],
  bday: [[10.4, 12.95], [100.8, 108.7]],
  list: [[12.45, 15.0], [108.2, 116.2]],
} as const;
const winO = (T: number, w: readonly (readonly [number, number])[]) =>
  Math.max(...w.map(([a, b]) => Math.min(easeOut(prog(T, a, a + 0.3)), 1 - prog(T, b - 0.3, b))));

/* ---------- camera ---------- */
type Key = [number, number[], number[]];
const SV = (x: number, back = 5.7) => [[x, SHELF_Y + 0.35, SHELF_Z + back], [x, SHELF_Y - 0.05, SHELF_Z]];
const KEYS: Key[] = [
  [0.0, [8.6, 1.35, 8.6], [5.2, 0.05, 3.6]],
  [4.7, [5.2, 1.4, 6.6], [2.1, 0.04, 1.8]],
  [8.3, SV(COINS_X, 6.6)[0], SV(COINS_X, 6.6)[1]],
  [10.3, SV(COINS_X, 6.2)[0], SV(COINS_X, 6.2)[1]],
  [10.68, SV(BDAY_X, 6.6)[0], SV(BDAY_X, 6.6)[1]],
  [12.35, SV(BDAY_X, 6.2)[0], SV(BDAY_X, 6.2)[1]],
  [12.72, SV(LIST_X, 7.6)[0], SV(LIST_X, 7.6)[1]],
  [14.4, SV(LIST_X, 7.2)[0], SV(LIST_X, 7.2)[1]],
  [14.75, [6.4, 1.45, 6.9], [3.4, 0.04, 2.4]],
  [16.6, [4.2, 1.6, 4.6], [1.4, 0.0, 0.6]],
  [18.8, [0, 17.5, 13], [0, 0, 0]],
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
  [88.2, [0, 15.5, 12.6], [0, 0, -1.7]],
  [92.9, [0, 14.5, 11.6], [0, 0, -1.7]],
  [94.3, [COINS_X, SHELF_Y + 0.6, SHELF_Z + 7.4], [COINS_X, SHELF_Y + 0.2, SHELF_Z]],
  [100.6, [COINS_X, SHELF_Y + 0.6, SHELF_Z + 7.0], [COINS_X, SHELF_Y + 0.2, SHELF_Z]],
  [101.5, SV(BDAY_X, 6.8)[0], SV(BDAY_X, 6.8)[1]],
  [108.0, SV(BDAY_X, 6.4)[0], SV(BDAY_X, 6.4)[1]],
  [108.9, SV(LIST_X, 7.6)[0], SV(LIST_X, 7.6)[1]],
  [115.5, SV(LIST_X, 7.2)[0], SV(LIST_X, 7.2)[1]],
  [118.2, [0, 19, 13], [0, 0, 0]],
  [V2_END, [0, 21, 15.5], [0, 0, 0]],
];
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i];
  const [tb, pb, lb] = KEYS[i + 1];
  const raw = prog(T, ta, tb);
  // the cold-open glide and the whip-pans between teasers keep moving; everything else eases
  const k = i === 0 || i === 1 ? raw : easeInOut(raw);
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
        <meshStandardMaterial color="#e9dfc8" emissive="#b8ad96" emissiveIntensity={edge ? 0.9 : 0.5} transparent opacity={o * (edge ? 1 : 0.5)} depthWrite={false} />
      </mesh>,
      <mesh key={`z${k}`} position={[SQ.x0 + len / 2, y, SQ.z0 + k * CELL]}>
        <boxGeometry args={[len, 0.01, w]} />
        <meshStandardMaterial color="#e9dfc8" emissive="#b8ad96" emissiveIntensity={edge ? 0.9 : 0.5} transparent opacity={o * (edge ? 1 : 0.5)} depthWrite={false} />
      </mesh>,
    );
  }
  // the frame drops in before the lines are drawn
  if (frame > 0) {
    const yy = y + drop * 3;
    const s = SQ.size;
    [[0, -s / 2, s, 0.05], [0, s / 2, s, 0.05], [-s / 2, 0, 0.05, s], [s / 2, 0, 0.05, s]].forEach(([dx, dz, w, d], i) =>
      items.push(
        <mesh key={`f${i}`} position={[dx, yy, dz]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshStandardMaterial color="#e9dfc8" emissive="#b8ad96" emissiveIntensity={1.1} transparent opacity={o * frame} />
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

/* ---------- case 1: coins ---------- */
const coinFace = (() => {
  const cache: Record<string, THREE.CanvasTexture> = {};
  return (ch: string, bg: string, fg: string) => {
    const key = ch + bg;
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 64, 0, Math.PI * 2); g.fill();
    g.strokeStyle = fg; g.globalAlpha = 0.5; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1; g.fillStyle = fg; g.font = `700 64px ${ZH}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 68);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    return (cache[key] = tx);
  };
})();
const COIN_R = 0.105, COIN_GAP = 0.25, COIN_N = 20, COIN_FROM = 8; // shows flips 8..27, which contain the 7-heads run
const Coin: React.FC<{ x: number; y: number; head: boolean; flipAt: number; T: number; glow: number; o: number }> = ({ x, y, head, flipAt, T, glow, o }) => {
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#8d8f96', metalness: 0.8, roughness: 0.35, transparent: true });
    const h = new THREE.MeshStandardMaterial({ map: coinFace('正', '#d9dce2', '#3a3e48'), metalness: 0.5, roughness: 0.35, transparent: true });
    const t = new THREE.MeshStandardMaterial({ map: coinFace('反', '#6d7079', '#e4e6ea'), metalness: 0.5, roughness: 0.4, transparent: true });
    return [side, h, t];
  }, []);
  mats.forEach((m) => { m.opacity = o; m.emissive.set('#f1c56d'); m.emissiveIntensity = glow * 0.55; });
  const k = easeInOut(prog(T, flipAt, flipAt + 0.35));
  // start face-down-ish spinning, land on the drawn side facing the camera
  const final = head ? Math.PI / 2 : -Math.PI / 2;
  const rx = final + (1 - k) * Math.PI * 3;
  const hop = Math.sin(Math.PI * k) * 0.25;
  return (
    <mesh position={[x, y + hop, 0]} rotation={[rx, 0, 0]} material={mats}>
      <cylinderGeometry args={[COIN_R, COIN_R, 0.026, 32]} />
    </mesh>
  );
};
const CoinStrip: React.FC<{ T: number; seq: string; y: number; startAt: number; run?: readonly [number, number]; glowAt?: number; o: number }> = ({
  T, seq, y, startAt, run, glowAt = 1e9, o,
}) => (
  <>
    {Array.from({ length: COIN_N }, (_, j) => {
      const idx = COIN_FROM + j;
      const inRun = run ? idx >= run[0] && idx < run[0] + run[1] : false;
      const glow = inRun ? easeOut(prog(T, glowAt + (idx - (run?.[0] ?? 0)) * 0.06, glowAt + 0.4 + (idx - (run?.[0] ?? 0)) * 0.06)) : 0;
      return <Coin key={j} x={(j - (COIN_N - 1) / 2) * COIN_GAP} y={y} head={seq[idx] === 'H'} flipAt={startAt + j * 0.045} T={T} glow={glow} o={o} />;
    })}
  </>
);
const Coins: React.FC<{ T: number }> = ({ T }) => {
  const o = winO(T, WIN.coins);
  if (o <= 0.001) return null;
  const payoff = T > 90;
  return (
    <group position={[COINS_X, SHELF_Y + (T > 90 ? 0.3 : 0), SHELF_Z]}>
      {!payoff ? (
        <CoinStrip T={T} seq={REAL_FLIPS} y={0} startAt={8.62} run={REAL_RUN} glowAt={9.9} o={o} />
      ) : (
        <>
          <CoinStrip T={T} seq={REAL_FLIPS} y={0.42} startAt={93.9} run={REAL_RUN} glowAt={95.4} o={o} />
          <CoinStrip T={T} seq={FAKE_FLIPS} y={-0.42} startAt={94.3} o={o} />
          <Lbl text="真抛" pos={[-2.95, 0.42, 0]} w={0.8} h={0.3} o={o} color={C.paper} font={`600 48px ${ZH}`} />
          <Lbl text="编的" pos={[-2.95, -0.42, 0]} w={0.8} h={0.3} o={o} color={C.dim} font={`600 48px ${ZH}`} />
          <Lbl text="连续 *7* 次正面" pos={[(REAL_RUN[0] - COIN_FROM + 3 - (COIN_N - 1) / 2) * COIN_GAP, 0.86, 0]} w={2.4} h={0.3}
            o={o * easeOut(prog(T, 96.0, 96.6))} font={`600 46px ${ZH}`} />
          <Lbl text="最多连 3 次" pos={[0, -0.78, 0]} w={2.2} h={0.3} o={o * easeOut(prog(T, 97.6, 98.2))} color={C.dim} font={`600 46px ${ZH}`} />
        </>
      )}
    </group>
  );
};

/* ---------- case 2: birthdays ---------- */
const dateCard = (() => {
  const cache: Record<string, THREE.CanvasTexture> = {};
  return (d: string) => {
    if (cache[d]) return cache[d];
    const c = document.createElement('canvas');
    c.width = 220; c.height = 140;
    const g = c.getContext('2d')!;
    g.fillStyle = '#efe6d0'; g.fillRect(0, 0, 220, 140);
    g.strokeStyle = 'rgba(120,90,60,0.5)'; g.lineWidth = 3; g.strokeRect(8, 8, 204, 124);
    g.fillStyle = '#3a2f22'; g.font = `600 46px ${ZH}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d, 110, 74);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    return (cache[d] = tx);
  };
})();
const BD_COLS = 8;
const bdPos = (i: number) => {
  const r = Math.floor(i / BD_COLS), c = i % BD_COLS;
  const n = r < 2 ? BD_COLS : 23 - 2 * BD_COLS;
  return [(c - (n - 1) / 2) * 0.72, 0.56 - r * 0.56, 0];
};
const Birthdays: React.FC<{ T: number }> = ({ T }) => {
  const o = winO(T, WIN.bday);
  if (o <= 0.001) return null;
  const payoff = T > 90;
  const pop0 = payoff ? 101.2 : 10.6;
  const pair = payoff ? easeOut(prog(T, 103.2, 103.9)) : easeOut(prog(T, 11.7, 12.2)) * 0.6;
  const dim = payoff ? easeOut(prog(T, 103.2, 103.9)) : 0;
  const [a, b] = BIRTHDAY_PAIR.map(bdPos);
  return (
    <group position={[BDAY_X, SHELF_Y, SHELF_Z]}>
      {BIRTHDAYS.map((d, i) => {
        const p = bdPos(i);
        const isPair = BIRTHDAY_PAIR.includes(i);
        const pop = easeOut(prog(T, pop0 + i * 0.03, pop0 + 0.35 + i * 0.03));
        const lift = isPair ? pair * 0.12 : 0;
        return (
          <mesh key={i} position={[p[0], p[1] + lift + (1 - pop) * 0.4, isPair ? pair * 0.25 : 0]} scale={(0.4 + 0.6 * pop) * (isPair ? 1 + pair * 0.12 : 1)}>
            <boxGeometry args={[0.64, 0.41, 0.012]} />
            <meshStandardMaterial map={dateCard(d)} transparent opacity={o * pop * (isPair ? 1 : 1 - dim * 0.55)}
              emissive={isPair ? '#f1c56d' : '#000000'} emissiveIntensity={isPair ? pair * 0.45 : 0} />
          </mesh>
        );
      })}
      {payoff && pair > 0.01 && (
        <Seg a={[a[0], a[1] + 0.32, 0.3]} b={[lerp(a[0], b[0], easeInOut(prog(T, 103.5, 104.4))), lerp(a[1], b[1], easeInOut(prog(T, 103.5, 104.4))) + 0.32, 0.3]} r={0.012} o={o * pair} glow={1.6} />
      )}
      {payoff && <Lbl text="23 个人" pos={[0, 1.12, 0]} w={1.6} h={0.32} o={o * easeOut(prog(T, 101.6, 102.2))} color={C.dim} font={`600 48px ${ZH}`} />}
    </group>
  );
};

/* ---------- case 3: the playlist on the red string ---------- */
const ARTIST = ['#c4574a', '#5f86b8', '#c9a45c', '#6f9a6a', '#8a6aa8'];
const ORDER_RANDOM = [0, 0, 2, 3, 3, 3, 1, 4, 2, 2, 1, 4]; // what shuffle produced: clumps of the same artist
const ORDER_SPREAD = [2, 3, 0, 2, 3, 1, 4, 2, 3, 0, 1, 4]; // after the fix: no artist twice in a row
const TRIPLE = [3, 4, 5]; // three songs by the same artist in a row
const SPREAD_SLOT = (() => {
  const used = new Set<number>();
  return ORDER_RANDOM.map((a) => {
    const slot = ORDER_SPREAD.findIndex((b, j) => b === a && !used.has(j));
    used.add(slot);
    return slot;
  });
})();
const Playlist: React.FC<{ T: number }> = ({ T }) => {
  const o = winO(T, WIN.list);
  if (o <= 0.001) return null;
  const payoff = T > 90;
  const in0 = payoff ? 108.7 : 12.65;
  const tri = payoff ? easeOut(prog(T, 109.4, 109.9)) * (1 - prog(T, SHUFFLE_AT - 0.3, SHUFFLE_AT)) : easeOut(prog(T, 13.5, 13.9));
  const n = ORDER_RANDOM.length;
  const gap = 0.74;
  const sx = (slot: number) => (slot - (n - 1) / 2) * gap;
  return (
    <group position={[LIST_X, SHELF_Y + 0.75, SHELF_Z]} scale={0.84}>
      <group scale={[0.5, 1, 1]}>
        <RedString3 t={99} />
      </group>
      {ORDER_RANDOM.map((a, i) => {
        const t0 = SHUFFLE_AT + SPREAD_SLOT[i] * 0.06;
        const k = payoff ? easeInOut(prog(T, t0, t0 + 0.8)) : 0;
        const x = lerp(sx(i), sx(SPREAD_SLOT[i]), k);
        const lift = Math.sin(Math.PI * k) * 0.55;
        const appear = easeOut(prog(T, in0 + i * 0.05, in0 + 0.5 + i * 0.05));
        const hl = TRIPLE.includes(i) ? tri : 0;
        return (
          <group key={i} position={[x, -0.06 + lift + (1 - appear) * 0.8 + hl * 0.12, hl * 0.2]} rotation={[0, 0, Math.sin(T * 0.9 + i) * 0.02]}>
            <mesh position={[0, -0.47, 0]}>
              <boxGeometry args={[0.7, 0.86, 0.012]} />
              <meshStandardMaterial color="#efe6d0" roughness={0.85} transparent opacity={o * appear} emissive="#ff5a4e" emissiveIntensity={hl * 0.25} />
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

/* ---------- the finale: we draw constellations through random points ---------- */
const DIPPER = [[-6.2, -3.4], [-3.6, -2.4], [-1.3, -2.0], [0.9, -0.7], [1.5, 2.2], [4.6, 2.5], [5.0, -0.4]];
const STARS = DIPPER.map(([x, z]) => {
  let best = HITS[0], d = 1e9;
  for (const h of HITS) { const e = Math.hypot(h.x - x, h.z - z); if (e < d) { d = e; best = h; } }
  return [best.x, 0.22, best.z];
});
const STAR_EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
const Constellation: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, 116.0, 116.6)) * (1 - prog(T, END_IN - 0.4, END_IN + 0.4));
  if (o <= 0.001) return null;
  return (
    <>
      {STAR_EDGES.map(([i, j], k) => {
        const p = easeInOut(prog(T, 116.3 + k * 0.32, 116.3 + k * 0.32 + 0.45));
        if (p <= 0) return null;
        const a = STARS[i], b = STARS[j];
        return (
          <mesh key={k} position={[(a[0] + b[0]) / 2 + (b[0] - a[0]) * (p - 1) / 2, 0.26, (a[2] + b[2]) / 2 + (b[2] - a[2]) * (p - 1) / 2]}
            rotation={[0, -Math.atan2(b[2] - a[2], b[0] - a[0]), 0]}>
            <boxGeometry args={[Math.hypot(b[0] - a[0], b[2] - a[2]) * p, 0.02, 0.06]} />
            <meshBasicMaterial color="#fff6dd" transparent opacity={0.95 * o} />
          </mesh>
        );
      })}
      {STARS.map((s, i) => (
        <React.Fragment key={i}>
          <mesh position={s as any}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshBasicMaterial color="#fff6dd" transparent opacity={o * easeOut(prog(T, 116.2 + i * 0.3, 116.6 + i * 0.3))} />
          </mesh>
          <mesh position={[s[0], 0.3, s[2]]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 1.6]} />
            <meshBasicMaterial map={haloTex()} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={o * 0.8 * easeOut(prog(T, 116.2 + i * 0.3, 116.6 + i * 0.3))} />
          </mesh>
        </React.Fragment>
      ))}
    </>
  );
};

/* ---------- lights ---------- */
const Lights: React.FC<{ T: number }> = ({ T }) => {
  const { look } = camAt(T);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(look[0], look[1], look[2]);
  target.updateMatrixWorld();
  const up = easeOut(prog(T, 0, 0.6));
  const dark = 1 - 0.75 * easeInOut(prog(T, 77.6, GAP)) * (1 - easeOut(prog(T, DROP2, DROP2 + 0.6)));
  const preDrop = 1 - 0.5 * easeInOut(prog(T, 15.6, DROP1 - 0.05)) * (T < DROP1 ? 1 : 0);
  const flare = (T >= DROP1 ? 1.8 * Math.exp(-(T - DROP1) * 2.2) : 0) + (T >= DROP2 ? 1.8 * Math.exp(-(T - DROP2) * 2.2) : 0);
  const warm = easeInOut(prog(T, TEX, TEX + 3));
  const k = up * dark * preDrop * (1 + flare);
  return (
    <>
      <primitive object={target} />
      <ambientLight intensity={0.3 * k} color="#5a6a98" />
      <directionalLight position={[-10, 22, 6]} intensity={0.9 * k} color="#9fb2dc" />
      <spotLight position={[look[0] + 3, look[1] + 16, look[2] + 9]} target={target} angle={0.55} penumbra={0.9} decay={0.9}
        intensity={lerp(70, 150, warm) * k} color={new THREE.Color('#c9d2f0').lerp(new THREE.Color('#ffc07a'), warm)}
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0008} shadow-radius={6} shadow-blurSamples={12} />
    </>
  );
};

/* ---------- the whole world ---------- */
const Scene: React.FC<{ T: number }> = ({ T }) => {
  const gridO = easeOut(prog(T, GRID_AT - 1.4, GRID_AT)) * (1 - prog(T, FLY_AT, FLY_AT + 1)) + easeOut(prog(T, BACK_AT + 1.5, BACK_AT + 2.5)) * (1 - prog(T, 92.6, 93.4));
  const hitDim = Math.max(easeInOut(prog(T, TINT_AT, TINT_AT + 2)) * (1 - easeInOut(prog(T, TEX, TEX + 1))), easeInOut(prog(T, TEX, TEX + 1)) * (1 - easeInOut(prog(T, 119.3, 120.5))));
  const warm = easeInOut(prog(T, 119.3, 121.5));
  const ringO = (at: number) => easeOut(prog(T, at, at + 0.6)) * (1 - prog(T, 37.6, 38.4));
  const hotO = ringO(31.0), coldO = ringO(35.0);
  const sevenO = easeOut(prog(T, 58.6, 59.4)) * (1 - prog(T, FLY_AT - 0.4, FLY_AT));
  const colLblO = easeOut(prog(T, 71.0, 72.0)) * (1 - prog(T, BACK_AT - 0.2, BACK_AT + 0.4));
  const ghostLblO = easeOut(prog(T, DROP2 + 0.5, DROP2 + 1.0)) * (1 - prog(T, BACK_AT - 0.2, BACK_AT + 0.4));
  return (
    <>
      <CamRig T={T} />
      <fog attach="fog" args={['#0b0d14', 18, 60]} />
      <Lights T={T} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {/* finely subdivided: one giant triangle gets mis-clipped by the software renderer at some camera angles */}
        <planeGeometry args={[80, 60, 80, 60]} />
        <meshStandardMaterial color="#1a1c25" roughness={1} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <City />
      <Thames />
      <Hits T={T} dim={hitDim} warm={warm} />
      <Streaks T={T} />
      <Grid T={T} o={gridO} />
      <Tiles T={T} />
      <Ghosts T={T} />
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
          <Lbl text="这里一颗都没有" pos={[COLD_SPOT.x, 0.9, COLD_SPOT.z - COLD_SPOT.r - 0.35]} w={3.0} h={0.42} o={coldO} font={`600 54px ${ZH}`} />
        </>
      )}
      <Lbl text={`${TOP_HITS} 颗`} pos={[HOT.x, 1.55, HOT.z]} w={1.4} h={0.5} o={sevenO} font={`600 72px ${ZH}`} />
      {OBSERVED.map((v, k) => (
        <React.Fragment key={k}>
          <Lbl text={k === 5 ? '5颗以上' : `${k}颗`} pos={[COL_X(k), 0.36, COL_Z + 0.6]} w={1.6} h={0.34} o={colLblO} color={C.dim} font={`500 46px ${ZH}`} />
          <Lbl text={`${v}`} pos={[COL_X(k), 0.86 + v * TILE_H, COL_Z]} w={1.3} h={0.4} o={colLblO * (1 - ghostLblO)} font={`600 60px ${EN}`} />
          <Lbl text={`${v} / *${EXPECTED[k].toFixed(1)}*`} pos={[COL_X(k), 0.86 + Math.max(v, EXPECTED[k]) * TILE_H, COL_Z]} w={2.0} h={0.4} o={ghostLblO} font={`600 54px ${EN}`} />
        </React.Fragment>
      ))}
      <Coins T={T} />
      <Birthdays T={T} />
      <Playlist T={T} />
      <Constellation T={T} />
    </>
  );
};

/* ---------- subtitles: cream text, [gold] = the answer, {red} = the trap ---------- */
const RichJ: React.FC<{ s: string }> = ({ s }) => (
  <>
    {s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) =>
      seg.startsWith('[') ? <span key={i} style={{ color: JUNO.colors.gold }}>{seg.slice(1, -1)}</span>
        : seg.startsWith('{') ? <span key={i} style={{ color: '#ff5a4e' }}>{seg.slice(1, -1)}</span>
          : <span key={i}>{seg}</span>,
    )}
  </>
);
const Sub: React.FC<{ T: number; at: number; out: number; zh: string; en: string; y?: number; size?: number; enSize?: number }> = ({
  T, at, out, zh, en, y = 880, size = 56, enSize = 32,
}) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.4)), 1 - prog(T, out - 0.3, out));
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(T, at, at + 0.5))) * 14;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * 0.65, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: size, fontWeight: 500, color: JUNO.colors.ink, letterSpacing: '0.04em', lineHeight: 1.3,
        textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}><RichJ s={zh} /></div>
      <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: enSize, color: 'rgba(243,237,226,0.58)', marginTop: 10, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{en}</div>
    </div>
  );
};
/** year and place, top-right under the corner mark (the top-left belongs to Douyin's watermark) */
const YearMark: React.FC<{ T: number; at: number; out: number; year: string; place: string }> = ({ T, at, out, year, place }) => {
  const o = Math.min(easeOut(prog(T, at, at + 0.6)), 1 - prog(T, out - 0.4, out));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', top: 92, right: 58, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 88, lineHeight: 1, color: JUNO.colors.ink, letterSpacing: '0.04em' }}>{year}</div>
      <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.6)', marginTop: 10, letterSpacing: '0.16em' }}>{place}</div>
    </div>
  );
};

export const V2Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = frame / fps;
  const revO = prog(T, DROP2, DROP2 + 0.2) * (1 - prog(T, 85.1, 85.5));
  const rp = easeOut(prog(T, DROP2, DROP2 + 0.6));
  const cardF = Math.round(CARD_IN * fps), cardLen = Math.round((CARD_OUT - CARD_IN) * fps);
  const endF = Math.round(END_IN * fps), endLen = Math.round((V2_END - END_IN) * fps);
  // corner mark: on from the cold open, hidden under the title card, gone under the end card
  const markO = Math.min(easeOut(prog(T, 0.3, 1.0)), 1 - prog(T, CARD_IN, CARD_IN + 0.15) + prog(T, CARD_OUT - 0.1, CARD_OUT + 0.4), 1 - prog(T, END_IN - 0.2, END_IN + 0.5));
  return (
    <AbsoluteFill style={{ backgroundColor: JUNO.colors.night }}>
      <ThreeCanvas width={width} height={height} shadows="variance" gl={{ antialias: true }}
        camera={{ fov: 34, near: 0.1, far: 140, position: [0, 10, 10] }} style={{ background: '#0b0d14' }}>
        <Scene T={T} />
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(8,9,13,0) 0%, rgba(8,9,13,0.55) 45%, rgba(8,9,13,0.78) 100%)' }} />

      {/* 1 cold open */}
      <Sub T={T} at={0.45} out={4.35} zh="你有没有觉得，倒霉的事总爱{扎堆}？" en="Ever feel like bad luck comes in clusters?" />
      {/* teasers, one per bar */}
      <Sub T={T} at={BARS[0] + 0.1} out={BARS[1] - 0.08} zh="抛硬币，连续7次正面？" en="Seven heads in a row?" />
      <Sub T={T} at={BARS[1] + 0.06} out={BARS[2] - 0.08} zh="两个同学，同一天生日？" en="Two classmates, one birthday?" />
      <Sub T={T} at={BARS[2] + 0.06} out={BARS[3] - 0.08} zh="随机播放，连放三首同一个歌手？" en="Shuffle plays the same artist three times?" />
      <Sub T={T} at={BARS[3] + 0.06} out={DROP1 - 0.05} zh="炸弹，专挑我家这一片？" en="Bombs picking my street?" />
      {/* 2-3 London */}
      <YearMark T={T} at={DROP1 + 0.3} out={28.6} year="1944" place="伦敦 · LONDON" />
      <Sub T={T} at={DROP1 + 0.1} out={CUT - 0.05} zh="1944年的伦敦人，就是这么想的" en="That's what London thought in 1944." />
      <Sub T={T} at={CUT + 0.05} out={24.6} zh="那年夏天起，德国向英国发射了约1万枚V-1飞弹" en="From that summer, Germany fired about 10,000 V-1 flying bombs at Britain." />
      <Sub T={T} at={24.75} out={28.7} zh="其中2419枚，落在了伦敦" en="2,419 of them came down on London." />
      <Sub T={T} at={28.85} out={32.0} zh="它飞来时嗡嗡作响，声音一停，就要落地了" en="They buzzed as they came. When the buzzing stopped, they fell." />
      <Sub T={T} at={32.15} out={34.7} zh="街头传言：飞弹{专挑某些街区}" en="People said the bombs picked certain streets." />
      <Sub T={T} at={34.85} out={36.95} zh="有人怀疑，没挨炸的地方{住着德国间谍}" en="Some suspected German spies lived where none fell." />
      {/* 4-5 Clarke */}
      <YearMark T={T} at={37.4} out={48.6} year="1946" place="伦敦南部 · SOUTH LONDON" />
      <Sub T={T} at={37.2} out={40.9} zh="战后，精算师克拉克决定算一算" en="After the war, an actuary named R. D. Clarke did the maths." />
      <Sub T={T} at={41.05} out={44.9} zh="他在伦敦南部圈出144平方公里" en="He took 144 square kilometres of south London," />
      <Sub T={T} at={45.05} out={48.9} zh="切成576个小格子" en="and cut it into 576 squares." />
      <Sub T={T} at={BD + 0.1} out={53.0} zh="格子里，一共落了537颗" en="537 bombs had landed inside." />
      <Sub T={T} at={53.15} out={57.9} zh="有的一颗没有，有的挨了7颗" en="Some squares had none. One had seven." />
      <Sub T={T} at={58.05} out={BUILD - 0.1} zh="看起来，{真的像在瞄准}" en="It really did look like aiming." />
      <Sub T={T} at={BUILD + 0.1} out={69.2} zh="按挨炸次数，把576个格子排成一排排" en="Sort the 576 squares by how many hits they took." />
      <Sub T={T} at={69.35} out={75.2} zh="如果飞弹完全随机，数学能算出每根柱子该多高" en="If the bombs fell at random, maths can predict every column." />
      <Sub T={T} at={75.37} out={GAP - 0.05} zh="那现实，和“随机”差多少？" en="So how far is reality from random?" />
      {/* 6 reveal */}
      {revO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 62, textAlign: 'center', opacity: revO,
          transform: `scale(${lerp(1.12, 1, rp)})`, filter: `blur(${(1 - easeOut(prog(T, DROP2, DROP2 + 0.45))) * 12}px)` }}>
          <span style={{ fontFamily: ZH, fontSize: 104, fontWeight: 900, letterSpacing: '0.12em',
            backgroundImage: `linear-gradient(180deg, #fff3cf 0%, ${JUNO.colors.gold} 55%, ${JUNO.colors.goldDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            几乎一模一样
          </span>
        </div>
      )}
      <Sub T={T} at={DROP2 + 0.9} out={85.4} zh="现实，就是[完全随机]的样子" en="Reality looked exactly like pure chance." />
      {/* 7 name it */}
      {T > 88 && T < 93.6 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center',
          opacity: easeOut(prog(T, 88.4, 89.2)) * (1 - prog(T, 92.6, 93.3)) }}>
          <span style={{ fontFamily: ZH, fontSize: 72, fontWeight: 600, color: '#cfe0ff', letterSpacing: '0.1em', textShadow: '0 3px 18px rgba(0,0,0,0.9)' }}>
            <span style={{ fontFamily: EN, fontSize: 92 }}>229</span> 格，一颗没挨
          </span>
        </div>
      )}
      <Sub T={T} at={85.6} out={89.45} zh="就算完全随机，也有[4成]格子一颗不挨" en="Even at random, four in ten squares get nothing." />
      <Sub T={T} at={89.6} out={93.3} zh="这叫[聚集错觉]：随机，本来就会扎堆" en="It's called the clustering illusion: randomness clumps." />
      {/* 8 the same idea, three more times */}
      <Sub T={T} at={93.75} out={97.3} zh="真抛100次硬币，[81%]会出现连续6次同一面" en="Flip a real coin 100 times: 81% of the time you get a run of six." />
      <Sub T={T} at={97.45} out={100.9} zh="编出来的反而不敢连，老师一眼就能认出" en="People faking it avoid streaks, and teachers can tell." />
      <Sub T={T} at={101.15} out={104.6} zh="全班23个人，有两人同一天生日" en="In a class of 23, two share a birthday" />
      <Sub T={T} at={104.75} out={108.3} zh="这件事的概率，超过[一半]" en="more often than not." />
      <Sub T={T} at={108.55} out={112.0} zh="Spotify被投诉：随机播放{不随机}" en="Spotify users complained that shuffle wasn't random." />
      <Sub T={T} at={112.15} out={115.7} zh="工程师只好把它改得[没那么随机]" en="So the engineers made it less random." />
      {/* 9 callback */}
      <Sub T={T} at={TEX + 0.1} out={119.4} zh="就连星座，也是我们把随机的星星连起来的" en="Even constellations are lines we drew through random stars." />
      {T > 119 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 430, height: 420, opacity: easeOut(prog(T, 119.2, 120.0)) * 0.8 * (1 - prog(T, END_IN - 0.3, END_IN + 0.3)),
          background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(8,9,13,0.85) 0%, rgba(8,9,13,0) 100%)' }} />
      )}
      <Sub T={T} at={119.55} out={END_IN + 0.2} zh="随机，本来就会扎堆" en="Randomness clusters. That's what it does." y={560} size={76} enSize={34} />
      <Sub T={T} at={FIN + 0.05} out={END_IN + 0.2} zh="[好运]，也会" en="So does good luck." y={740} size={56} />

      <CornerMark o={markO} />
      <Sequence from={cardF} durationInFrames={cardLen}>
        <TitleCard v={EPISODE} dur={cardLen} land={23} />
      </Sequence>
      <Sequence from={endF} durationInFrames={endLen}>
        <EndCard v={EPISODE} dur={endLen} />
      </Sequence>
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

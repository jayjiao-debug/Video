import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Sequence, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, ZH, EN, prog, easeOut, easeIn, easeInOut, lerp } from '../lib';
import { Vignette, Grain } from '../ui';
import { v3 } from '../t3/Open3D';
import { textPlane, haloTex } from '../t3/Reveal3D';
import { SQ, CELL, CELLS, HOT, HOT_SPOT, HOT_R, COLD_SPOT, OBSERVED, mulberry } from '../v1/data';
import { City, Thames, Lbl, Sub, YearMark, dateCard } from '../v2/V2';
import { BIRTHDAYS, BIRTHDAY_PAIR } from '../v2/cases';
import { EVEN, SIM, SIM_HIST, GAMES, LOSS_RUN, RED_SORTED, RED_DRAW, RED_PAIR, BLUE, PERM, SELF } from './cases';
import {
  b, DROP1, CUT, CLARKE, BD, BUILD, GAP, DROP2, BACK, NAME, CASES, TEX, FIN, END_IN, V3_END, BOARD_Y, RB_X, HITS3, HERO, IN_SQ, FALL,
  COUNT_RUN, RUN_CENTER, countAt, TILE_H, PILE_Z, PILE_Y, PX, SIM_DX, flyAt, SIM_T, SIM_CELL_OF, SIM_CELLS, simFlyAt,
} from './data3';
import { JUNO } from '../brand/identity';
import { V1Model, Explosion, Spy, shake } from './fx';
import { TitleCard, EndCard, type VideoCfg } from '../brand/Brand';
import { CornerMark } from '../brand/CornerMark';

export { V3_END };
export const EPISODE3: VideoCfg = {
  id: 'random-clusters',
  title: '它在瞄准谁',
  kicker: 'POISSON · R. D. CLARKE · MCMXLVI',
  tagline: '坏运气，会扎堆吗？',
  taglineEn: 'Does bad luck come in clusters?',
  motif: 'grid',
  question: '开头两张图，你选的哪张？评论区扣“左”或“右”',
  sources: 'Clarke 1946 · Kahneman 2011 · 其余概率均为精确计算',
};

const GOLD = '#f1c56d';
const win = (T: number, a: number, z: number, fi = 0.35, fo = 0.35) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));

/* ---------- the case panels: four boards standing in a row south of the city ---------- */
const PZ = 9.6, PY = 3.4, PW = 9, PH = 4.6;
const PXS = [-16.5, -5.5, 5.5, 16.5];
const CASE_T = [CASES, b(196), b(208), b(220), TEX]; // 3 + 3 + 3 + 2 bars

/* ---------- camera ---------- */
type Key = [number, number[], number[]];
const HOOK_P = [7, 30.5, 13.6], HOOK_L = [7, 4.6, -0.5];
const SQUARE_P = [0, 16.5, 12.6], SQUARE_L = [0, 0, 0.7];
const PILE_P = [0.6, 6.6, 9.8], PILE_L = [0.6, 0.9, -4.6];
const runP = [RUN_CENTER.x + 0.2, 3.7, RUN_CENTER.z + 4.9], runL = [RUN_CENTER.x, 0.3, RUN_CENTER.z - 0.7];
const near = (x: number, z: number, d = 5.6, h = 5.6) => [[x + 1.4, h, z + d], [x, 0, z]];
const panelCam = (i: number, push = 0) => [[PXS[i], PY - 0.15, PZ + 10.9 - push], [PXS[i], PY - 0.5, PZ]];
const HC = [HERO.x, 0, HERO.z];
const CUTK = 0.001;
const CO_A = [9.0, 1.55, 7.4], CO_V = [1.75, 0, -0.22], CO_CUT = b(4), CO_HIT = b(7);
const CO_P1 = CO_A.map((x, j) => x + CO_V[j] * CO_CUT);
const CO_G = [CO_P1[0] + 2.3, 0.14, CO_P1[2] - 0.4];
const coldPos = (T: number) => {
  if (T <= CO_CUT) return CO_A.map((x, j) => x + CO_V[j] * T);
  const u = Math.pow(prog(T, CO_CUT, CO_HIT), 1.25);
  const c = CO_P1.map((x, j) => x + CO_V[j] * 0.8);
  return CO_P1.map((x, j) => (1 - u) * (1 - u) * x + 2 * (1 - u) * u * c[j] + u * u * CO_G[j]);
};
const CO_OFF = [0.12, 0.05, 1.65];
const coldCam = (T: number) => {
  const bp = coldPos(Math.min(T, CO_HIT));
  if (T <= CO_CUT) return { pos: bp.map((x, j) => x + CO_OFF[j]), look: bp.map((x, j) => x + [-0.06, 0.03, 0][j]) };
  const p1 = CO_P1.map((x, j) => x + CO_OFF[j]);
  const p2 = [CO_G[0] - 1.6, 1.05, CO_G[2] + 2.9];
  const k = easeInOut(prog(T, CO_CUT, CO_HIT - 0.2));
  const sh = shake(T - CO_HIT, 0.07);
  return {
    pos: p1.map((x, j) => lerp(x, p2[j], k) + sh[j]),
    look: bp.map((x, j) => lerp(x, CO_G[j] + (j === 1 ? 0.25 : 0), prog(T, CO_HIT - 0.4, CO_HIT)) + sh[j] * 0.5),
  };
};
const KEYS: Key[] = [
  [0.0, [1.5, 9.6, 10.5], [3.6, 5, 1.2]],
  [b(8) + 0.4, [10.8, 22, 14], [7, 4.6, 0]],
  [b(16), HOOK_P, HOOK_L],
  [DROP1, [7, 29.2, 13.0], HOOK_L],
  [b(36), [0, 17.5, 13.2], [0, 0, 0]],
  [CUT, [0, 18.6, 14.2], [0, 0, -0.4]],
  [b(48) - 0.25, [0, 31, 21.5], [0, 0, -2.6]],
  [b(48) - CUTK, [0, 31, 21.5], [0, 0, -2.6]],
  [b(48), [HC[0] + 1.5, 0.55, HC[2] + 3.8], [HC[0] - 2.6, 1.1, HC[2] - 1.2]],
  [b(56) - CUTK, [HC[0] + 1.6, 0.6, HC[2] + 4.3], [HC[0] - 1.8, 0.7, HC[2] - 0.8]],
  [b(56), SQUARE_P, SQUARE_L],
  [b(64) - 0.4, [0, 15.9, 12.0], SQUARE_L],
  [b(64) + 1.4, near(HOT_SPOT.x, HOT_SPOT.z)[0], near(HOT_SPOT.x, HOT_SPOT.z)[1]],
  [b(72) - 0.1, near(HOT_SPOT.x, HOT_SPOT.z, 5.2, 5.2)[0], near(HOT_SPOT.x, HOT_SPOT.z, 5.2, 5.2)[1]],
  [b(72) + 1.4, [COLD_SPOT.x + 1.0, 1.45, COLD_SPOT.z + 3.0], [COLD_SPOT.x - 0.1, 0.6, COLD_SPOT.z]],
  [CLARKE - 0.1, [COLD_SPOT.x + 0.8, 1.3, COLD_SPOT.z + 2.6], [COLD_SPOT.x - 0.1, 0.6, COLD_SPOT.z]],
  [CLARKE + 1.6, [0, 18.2, 14.2], [0, 0, 0.1]],
  [BD - 0.3, [0, 16.0, 12.2], SQUARE_L],
  [BD + 0.9, runP, runL],
  [b(104), [runP[0] - 0.4, runP[1] - 0.15, runP[2] - 0.3], runL],
  [b(104) + 2.2, [0, 15.6, 11.8], [0, 0, 0.5]],
  [b(116) - 0.3, [0, 15.2, 11.4], [0, 0, 0.5]],
  [b(116) + 1.3, [HOT.x + 1.5, 5.9, HOT.z + 6.0], [HOT.x, 0.8, HOT.z]],
  [BUILD, [HOT.x + 1.3, 5.6, HOT.z + 5.6], [HOT.x, 0.8, HOT.z]],
  [BUILD + 2.2, PILE_P, PILE_L],
  [b(132), [0.6, 7.4, 11.4], [0.6, 0.6, -3.4]],
  [b(140), [0.6, 7.6, 11.6], [0.6, 0.6, -3.6]],
  [b(148), [0.4, 3.7, 5.0], [0.4, 1.45, PILE_Z]],
  [GAP, [0.4, 3.5, 4.3], [0.4, 1.45, PILE_Z]],
  [DROP2, [0.4, 3.5, 4.3], [0.4, 1.45, PILE_Z]],
  [BACK, [0.4, 3.7, 4.8], [0.4, 1.45, PILE_Z]],
  [BACK + 1.6, HOOK_P, HOOK_L],
  [CASES - CUTK, [7, 29.6, 13.1], HOOK_L],
  [CASES, panelCam(0, -0.4)[0], panelCam(0, -0.4)[1]],
  [CASES + 1.2, panelCam(0)[0], panelCam(0)[1]],
  ...[1, 2, 3].flatMap((i): Key[] => [
    [CASE_T[i] - 0.35, panelCam(i - 1, 0.7)[0], panelCam(i - 1, 0.7)[1]],
    [CASE_T[i] + 0.35, panelCam(i)[0], panelCam(i)[1]],
  ]),
  [TEX - 0.05, panelCam(3, 0.6)[0], panelCam(3, 0.6)[1]],
  [TEX + 2.4, [0, 19, 13], [0, 0, 0]],
  [V3_END, [0, 21, 15.5], [0, 0, 0]],
];
/* the V-1 in the low shot: level flight with the engine running, engine cuts on beat 52, dives onto beat 54 */
const heroPos = (T: number) => {
  const H = [HERO.x, 0.16, HERO.z];
  const p0 = [H[0] - 10, 1.65, H[2] - 3.4], p1 = [H[0] - 1.5, 1.45, H[2] - 0.45];
  if (T <= b(52)) {
    const u = prog(T, b(48) + 0.1, b(52));
    return p0.map((x, j) => lerp(x, p1[j], u));
  }
  const u = prog(T, b(52), b(54));
  const glide = [lerp(p1[0], H[0], u), lerp(p1[1], H[1], easeIn(u)), lerp(p1[2], H[2], u)];
  return glide;
};
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i];
  const [tb, pb, lb] = KEYS[i + 1];
  const raw = prog(T, ta, tb);
  const k = i === 0 ? raw : easeInOut(raw);
  const pos = pa.map((x, j) => lerp(x, pb[j], k));
  let look = la.map((x, j) => lerp(x, lb[j], k));
  if (T < b(8) + 0.2) return coldCam(T);
  if (T >= b(48) && T < b(56)) {
    const hp = heroPos(Math.min(T, b(54)));
    const H = [HERO.x, 0.14, HERO.z];
    const ride = (t: number) => { const q = heroPos(t); return [q[0] + 0.9, Math.max(0.5, q[1] - 0.75), q[2] + 1.9]; };
    const hold = [H[0] + 1.7, 0.6, H[2] + 3.4];
    const k = easeInOut(prog(T, b(52) - 0.2, b(54) - 0.3));
    const p0 = ride(Math.min(T, b(52)));
    const sh = shake(T - b(54), 0.06);
    const lk = T < b(54) ? hp : [H[0], 0.45, H[2]];
    return { pos: p0.map((x, j) => lerp(x, hold[j], k) + sh[j]), look: lk.map((x, j) => x + sh[j] * 0.5) };
  }
  return { pos, look };
};
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.copy(v3(pos));
  camera.lookAt(v3(look));
  camera.updateProjectionMatrix();
  return null;
};

/* ---------- the two boards ---------- */
const BOARD_S = 12.8;
const boardO = (T: number) => (T > b(12) ? 1 : 0) * (1 - prog(T, DROP1, DROP1 + 0.45)) + win(T, BACK + 0.1, CASES + 0.2, 0.7, 0.6);
const rightO = (T: number) => (T > b(12) ? 1 : 0) * (1 - prog(T, DROP1, DROP1 + 0.5)) + win(T, BACK + 0.5, CASES + 0.2, 0.7, 0.6);
const appearAt = (rank: number) => b(16 + Math.floor(rank * 7)) + (rank * 7 % 1) * 0.16;
const Slab: React.FC<{ x: number; o: number }> = ({ x, o }) => {
  if (o <= 0.001) return null;
  const e = BOARD_S / 2;
  return (
    <group position={[x, BOARD_Y, 0]}>
      <mesh>
        <boxGeometry args={[BOARD_S, 0.08, BOARD_S, 8, 1, 8]} />
        <meshStandardMaterial color="#11131b" roughness={0.6} metalness={0.2} transparent opacity={0.96 * o} depthWrite={o > 0.95} />
      </mesh>
      {[[0, -e, BOARD_S + 0.06, 0.05], [0, e, BOARD_S + 0.06, 0.05], [-e, 0, 0.05, BOARD_S], [e, 0, 0.05, BOARD_S]].map(([dx, dz, w, d], i) => (
        <mesh key={i} position={[dx, 0.05, dz]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshBasicMaterial color="#e9dfc8" transparent opacity={0.75 * o} />
        </mesh>
      ))}
    </group>
  );
};
const DOT_CREAM = new THREE.Color('#f6eedc');
const DOT_EMBER = new THREE.Color('#ffb066');
const BoardDots: React.FC<{ T: number }> = ({ T }) => {
  const { left, right } = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 14);
    const mk = (n: number) => {
      const im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ transparent: true }), n);
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      return im;
    };
    return { left: mk(IN_SQ.length), right: mk(EVEN.length) };
  }, []);
  const ranksL = useMemo(() => { const r = mulberry(55); return IN_SQ.map(() => r()); }, []);
  const ranksR = useMemo(() => { const r = mulberry(56); return EVEN.map(() => r()); }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  IN_SQ.forEach((h, i) => {
    const pop = easeOut(prog(T, appearAt(ranksL[i]), appearAt(ranksL[i]) + 0.22));
    const f0 = h.t - FALL;
    const u = prog(T, f0, h.t);
    const back = T >= GAP ? onBoard(T, h) : 0;
    const gone = (T >= h.t || T >= GAP) && back <= 0; // between landing and the return, the ember is drawn instead
    o.position.set(h.x, T >= GAP ? BOARD_Y + 0.06 : lerp(BOARD_Y + 0.06, 0.16, easeIn(u)), h.z);
    const s = gone ? 0.0001 : Math.max(0.0001, T >= GAP ? back : pop);
    o.scale.set(s, u > 0 && T < GAP ? 1 + 8 * Math.sin(Math.PI * u) : s, s);
    o.rotation.set(u > 0 ? Math.PI / 2 * 0 : 0, 0, 0);
    o.updateMatrix();
    left.setMatrixAt(i, o.matrix);
    col.copy(DOT_CREAM).lerp(DOT_EMBER, T < GAP ? Math.min(1, u * 2) : 0);
    left.setColorAt(i, col);
  });
  const ro = rightO(T);
  EVEN.forEach(([x, z], i) => {
    const pop = easeOut(prog(T, appearAt(ranksR[i]), appearAt(ranksR[i]) + 0.22));
    const back = easeOut(prog(T, BACK + 0.6 + ranksR[i] * 0.7, BACK + 0.9 + ranksR[i] * 0.7));
    const s = T < GAP ? pop * (1 - prog(T, DROP1 + ranksR[i] * 0.3, DROP1 + 0.2 + ranksR[i] * 0.3)) : back * Math.min(1, ro + 0.001);
    o.position.set(x + RB_X, BOARD_Y + 0.06, z);
    o.scale.setScalar(Math.max(0.0001, s));
    o.rotation.set(0, 0, 0);
    o.updateMatrix();
    right.setMatrixAt(i, o.matrix);
    right.setColorAt(i, DOT_CREAM);
  });
  for (const im of [left, right]) {
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }
  return (
    <>
      <primitive object={left} />
      <primitive object={right} />
    </>
  );
};

/* ---------- embers: every V-1 that came down ---------- */
const EMBER = new THREE.Color('#ff9a3c');
const COOLED = new THREE.Color('#b0603a');
/** in-square embers: hidden while the computer scatters its own dots, lifted back onto the board for the answer */
const inSqLift = (T: number, d: number) => easeInOut(prog(T, BACK + 0.2 + d * 0.6, BACK + 1.1 + d * 0.6)) * (1 - easeInOut(prog(T, CASES - 0.2 + d * 0.5, CASES + 0.6 + d * 0.5)));
/** once an ember is back up on the board it turns into the same cream dot as at the start */
const onBoard = (T: number, h: { inSquare: boolean; delay: number }) => (h.inSquare ? prog(inSqLift(T, h.delay), 0.85, 1) : 0);
const inSqHide = (T: number) => easeInOut(prog(T, b(130), b(132))) * (1 - easeInOut(prog(T, BACK, BACK + 0.25)));
const Hits: React.FC<{ T: number; dim: number; warm: number; focus: number; fade: number }> = ({ T, dim, warm, focus, fade }) => {
  const { core, halo } = useMemo(() => {
    const cg = new THREE.SphereGeometry(0.035, 10, 8);
    const cm = new THREE.MeshStandardMaterial({ color: '#ffd7a0', emissive: '#ff8a2a', emissiveIntensity: 2.2, roughness: 0.4 });
    const ci = new THREE.InstancedMesh(cg, cm, HITS3.length);
    const hg = new THREE.PlaneGeometry(1, 1);
    hg.rotateX(-Math.PI / 2);
    const hm = new THREE.MeshBasicMaterial({ map: haloTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const hi = new THREE.InstancedMesh(hg, hm, HITS3.length);
    hi.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(HITS3.length * 3), 3);
    return { core: ci, halo: hi };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const hide = inSqHide(T);
  HITS3.forEach((h, i) => {
    const age = T - h.t;
    const on = age >= 0 ? 1 : 0;
    const flash = age >= 0 ? Math.exp(-age * 2.2) : 0;
    const pop = age >= 0 ? easeOut(Math.min(1, age / 0.18)) : 0;
    const lift = h.inSquare ? inSqLift(T, h.delay) : 0;
    const vis = (h.inSquare ? Math.max(1 - hide, lift) : 1 - 0.55 * focus) * (1 - 0.6 * fade);
    const y = lerp(0.16, BOARD_Y + 0.1, lift);
    o.position.set(h.x, y, h.z);
    o.rotation.set(0, 0, 0);
    o.scale.setScalar(Math.max(0.0001, pop * on * vis * (1 + flash * 0.8) * (1 - onBoard(T, h))));
    o.updateMatrix();
    core.setMatrixAt(i, o.matrix);
    o.position.set(h.x, y + 0.04, h.z);
    const s = (0.5 + flash * (h.inSquare ? 1.8 : 0.9) + warm * 0.08) * pop * on * vis * (1 - onBoard(T, h) * 0.85);
    o.scale.set(Math.max(0.0001, s), 1, Math.max(0.0001, s));
    o.updateMatrix();
    halo.setMatrixAt(i, o.matrix);
    const glow = ((0.35 + 0.65 * flash) * (1 - dim * 0.7 * (1 - lift)) + warm * 0.18) * (h.inSquare ? 1 : 1 - 0.7 * focus) * (1 - 0.85 * fade);
    col.copy(COOLED).lerp(EMBER, Math.min(1, flash + warm + lift)).multiplyScalar(glow);
    halo.setColorAt(i, col);
  });
  core.instanceMatrix.needsUpdate = true;
  halo.instanceMatrix.needsUpdate = true;
  if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
  (core.material as THREE.MeshStandardMaterial).emissiveIntensity = (2.2 * (1 - dim * 0.6) + warm * 0.5) * (1 - 0.8 * fade);
  return (
    <>
      <primitive object={core} />
      <primitive object={halo} />
    </>
  );
};

/* ---------- the rest of London: incoming streaks ---------- */
const STREAK_T = 1.0;
const DIR = new THREE.Vector3(7.5, 3.2, 6.5).normalize();
const MAXS = 160;
const Streaks: React.FC<{ T: number }> = ({ T }) => {
  const { head, tail } = useMemo(() => {
    const hg = new THREE.SphereGeometry(0.03, 10, 8);
    hg.scale(1, 1, 2.4);
    const hm = new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ff9a3c', emissiveIntensity: 3 });
    const tg = new THREE.CylinderGeometry(0.004, 0.022, 1, 6, 1, true);
    tg.rotateX(Math.PI / 2);
    tg.translate(0, 0, 0.5);
    const tm = new THREE.MeshBasicMaterial({ color: '#ffb066', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    return { head: new THREE.InstancedMesh(hg, hm, MAXS), tail: new THREE.InstancedMesh(tg, tm, MAXS) };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  let n = 0;
  if (T > CUT - 1.2 && T < CUT + 4.2) {
    for (const h of HITS3) {
      if (h.inSquare || h.hero) continue;
      const u = (T - (h.t - STREAK_T)) / STREAK_T;
      if (u < 0 || u > 1 || n >= MAXS) continue;
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

/* ---------- the V-1s: the cold-open chase and the low shot over the rooftops ---------- */
const orient = (p: number[], q: number[]) => {
  const m = new THREE.Object3D();
  m.position.set(p[0], p[1], p[2]);
  m.lookAt(q[0], q[1], q[2]);
  return m;
};
const FlyingBomb: React.FC<{ T: number; p: number[]; q: number[]; engine: number; scale: number }> = ({ T, p, q, engine, scale }) => {
  const m = orient(p, q);
  return (
    <>
      <group position={m.position} quaternion={m.quaternion} scale={scale}>
        <V1Model engine={engine} T={T} />
      </group>
      <pointLight position={[p[0] + 0.5, p[1] + 0.9, p[2] + 1.3]} color="#c9d6f5" intensity={3.2} distance={4} decay={1.6} />
    </>
  );
};
const ColdOpen: React.FC<{ T: number }> = ({ T }) => {
  if (T > b(8) + 0.3) return null;
  const engine = T < CO_CUT ? 1 : Math.max(0, 1 - (T - CO_CUT) / 0.15);
  return (
    <>
      {T < CO_HIT && <FlyingBomb T={T} p={coldPos(T)} q={coldPos(T + 0.02)} engine={engine} scale={0.75} />}
      <Explosion pos={CO_G} t0={CO_HIT} T={T} s={1.1} seed={3} />
    </>
  );
};
const HeroBomb: React.FC<{ T: number }> = ({ T }) => {
  if (T < b(48) || T >= b(56)) return null;
  const engine = T < b(52) ? 1 : Math.max(0, 1 - (T - b(52)) / 0.15);
  return (
    <>
      {T < HERO.t && <FlyingBomb T={T} p={heroPos(T)} q={heroPos(T + 0.02)} engine={engine} scale={0.75} />}
      <Explosion pos={[HERO.x, 0.14, HERO.z]} t0={HERO.t} T={T} s={0.9} seed={7} />
    </>
  );
};

/* ---------- searchlights over the rooftops, only in the low shot ---------- */
const BEAMS = [[-3.2, -5.5, 0.35, 0.9], [2.5, -7.5, -0.25, 0.6], [-7.5, -3.2, 0.15, 1.3]];
const Searchlights: React.FC<{ T: number }> = ({ T }) => {
  const cold = T < b(8) + 0.3;
  const o = cold ? 1 : win(T, b(48) - 0.05, b(56), 0.5, 0.01);
  if (o <= 0.001) return null;
  const cx = cold ? CO_G[0] - 1.5 : HERO.x, cz = cold ? CO_G[2] - 2.5 : HERO.z;
  return (
    <>
      {BEAMS.map(([dx, dz, tilt, ph], i) => {
        const sway = tilt + 0.18 * Math.sin(T * 0.45 + ph * 3);
        return (
          <group key={i} position={[cx + dx, 0.05, cz + dz]} rotation={[0.12 * Math.cos(T * 0.3 + ph), 0, sway]}>
            <mesh position={[0, 6, 0]}>
              <cylinderGeometry args={[0.55, 0.04, 12, 24, 1, true]} />
              <meshBasicMaterial color="#b9c8ef" transparent opacity={0.075 * o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

/* ---------- Clarke's grid: the frame drops on the bar, then three lines per beat ---------- */
const GRID_Y = 0.34;
const Grid: React.FC<{ T: number; o: number }> = ({ T, o }) => {
  if (o <= 0.001) return null;
  const items: React.ReactNode[] = [];
  const frame = easeOut(prog(T, CLARKE, CLARKE + 0.45));
  const mat = (a: number, glow: number) => (
    <meshStandardMaterial color="#e9dfc8" emissive="#b8ad96" emissiveIntensity={glow} transparent opacity={a} depthWrite={false} />
  );
  const s = SQ.size;
  [[0, -s / 2, s + 0.05, 0.05], [0, s / 2, s + 0.05, 0.05], [-s / 2, 0, 0.05, s], [s / 2, 0, 0.05, s]].forEach(([dx, dz, w, d], i) =>
    items.push(
      <mesh key={`f${i}`} position={[dx, GRID_Y + (1 - frame) * 2.5, dz]}>
        <boxGeometry args={[w, 0.03, d]} />
        {mat(o * frame, 1.1)}
      </mesh>,
    ),
  );
  for (let k = 1; k < SQ.n; k++) {
    const at = b(88 + Math.floor((k - 1) / 3)) + ((k - 1) % 3) * 0.06;
    const p = easeOut(prog(T, at, at + 0.22));
    if (p <= 0) continue;
    const a = SQ.x0 + k * CELL;
    const len = s * p;
    items.push(
      <mesh key={`x${k}`} position={[a, GRID_Y, SQ.z0 + len / 2]}>
        <boxGeometry args={[0.014, 0.01, len]} />
        {mat(o * 0.55, 0.5)}
      </mesh>,
      <mesh key={`z${k}`} position={[SQ.x0 + len / 2, GRID_Y, SQ.z0 + k * CELL]}>
        <boxGeometry args={[len, 0.01, 0.014]} />
        {mat(o * 0.55, 0.5)}
      </mesh>,
    );
  }
  return <>{items}</>;
};

/* ---------- numbers: Clarke counting, square by square ---------- */
const NUM_PX = 1536;
const Numbers: React.FC<{ T: number }> = ({ T }) => {
  const tp = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = NUM_PX;
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return { c, g: c.getContext('2d')!, tx };
  }, []);
  const o = easeOut(prog(T, BD + 0.3, BD + 0.6)) * (1 - prog(T, BUILD - 0.1, BUILD + 0.5));
  if (o <= 0.001) return null;
  const { g, c, tx } = tp;
  g.clearRect(0, 0, c.width, c.height);
  const px = NUM_PX / SQ.n;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  CELLS.forEach((cl, i) => {
    const p = easeOut(prog(T, countAt[i], countAt[i] + 0.25));
    if (p <= 0) return;
    const zero = cl.count === 0;
    const zf = zero ? easeInOut(prog(T, b(112), b(112) + 0.5)) : 0;
    g.font = `700 ${Math.round(px * 0.58 * (0.6 + 0.4 * p))}px ${ZH}`;
    g.fillStyle = zero ? `rgba(${Math.round(lerp(160, 190, zf))},${Math.round(lerp(170, 220, zf))},255,${0.55 + 0.4 * zf})` : cl === HOT ? GOLD : '#fff6e4';
    g.shadowColor = 'rgba(0,0,0,0.9)';
    g.shadowBlur = 8;
    g.globalAlpha = p;
    g.fillText(String(cl.count), (cl.c + 0.5) * px, (cl.r + 0.5) * px + 2);
  });
  g.globalAlpha = 1;
  tx.needsUpdate = true;
  return (
    <mesh position={[0, GRID_Y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[SQ.size, SQ.size]} />
      <meshBasicMaterial map={tx} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};

/* ---------- tiles: real squares (heat-coloured) and the computer's squares (pale gold) ---------- */
const HEAT = ['#2b3650', '#7a4a22', '#b4672a', '#dc8a36', '#f2ab4a', '#ffd27a', '#ffd27a', '#ffe2a0'].map((c) => new THREE.Color(c));
const ICE = new THREE.Color('#6f9be0');
const SIMC = new THREE.Color('#f2c560');
const Tiles: React.FC<{ T: number }> = ({ T }) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(CELL * 0.86, TILE_H * 0.8, CELL * 0.86);
    const im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ transparent: true }), CELLS.length);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CELLS.length * 3), 3);
    return im;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const out = 1 - prog(T, BACK - 0.1, BACK + 0.5);
  let any = false;
  CELLS.forEach((cl, i) => {
    const seen = easeOut(prog(T, countAt[i], countAt[i] + 0.3)) * out;
    const lift = cl === HOT ? easeInOut(prog(T, b(116), b(116) + 0.8)) * (1 - easeInOut(prog(T, BUILD - 0.2, BUILD + 0.5))) : 0;
    const home = new THREE.Vector3(cl.x, GRID_Y - 0.01 + lift * 0.9, cl.z);
    const t0 = flyAt(cl.bucket, cl.order);
    const go = easeInOut(prog(T, t0, t0 + 1.1));
    const pile = new THREE.Vector3(PX(cl.bucket), PILE_Y + cl.rank * TILE_H, PILE_Z);
    const p = home.clone().lerp(pile, go);
    p.y += Math.sin(Math.PI * go) * 2.0;
    o.position.copy(p);
    o.rotation.set(0, Math.sin(Math.PI * go) * 0.8, 0);
    o.scale.setScalar(Math.max(0.0001, seen));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    const zf = cl.count === 0 ? easeInOut(prog(T, b(112), b(112) + 0.5)) : 0;
    mesh.setColorAt(i, HEAT[Math.min(cl.count, 7)].clone().lerp(ICE, zf));
    if (seen > 0.001) any = true;
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  // see-through while counting (the embers stay visible), solid once sorted
  (mesh.material as THREE.MeshBasicMaterial).opacity = lerp(0.4, 0.95, easeInOut(prog(T, BUILD, BUILD + 0.8)));
  mesh.visible = any;
  return <primitive object={mesh} />;
};
const SimDots: React.FC<{ T: number }> = ({ T }) => {
  const { dots, halos } = useMemo(() => {
    const g = new THREE.SphereGeometry(0.04, 10, 8);
    const m = new THREE.MeshBasicMaterial({ color: '#fff3d6' });
    const hg = new THREE.PlaneGeometry(1, 1);
    hg.rotateX(-Math.PI / 2);
    const hm = new THREE.MeshBasicMaterial({ map: haloTex(), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    return { dots: new THREE.InstancedMesh(g, m, SIM.length), halos: new THREE.InstancedMesh(hg, hm, SIM.length) };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  if (T < b(132) - 0.2 || T > b(152)) return null;
  SIM.forEach(([x, z], i) => {
    const land = SIM_T[i];
    const u = prog(T, land - 0.35, land);
    const cell = SIM_CELLS[SIM_CELL_OF[i]];
    const leave = prog(T, simFlyAt(cell.bucket, cell.order), simFlyAt(cell.bucket, cell.order) + 0.2);
    const s = u > 0 ? 1 - leave : 0;
    o.position.set(x, lerp(3.4, GRID_Y + 0.05, easeIn(u)), z);
    o.scale.set(Math.max(0.0001, s), Math.max(0.0001, s * (u < 1 ? 3 : 1)), Math.max(0.0001, s));
    o.updateMatrix();
    dots.setMatrixAt(i, o.matrix);
    const fl = T >= land ? Math.exp(-(T - land) * 3) : 0;
    o.position.set(x, GRID_Y + 0.06, z);
    const hs = u >= 1 ? (0.35 + fl * 0.9) * (1 - leave) : 0;
    o.scale.set(Math.max(0.0001, hs), 1, Math.max(0.0001, hs));
    o.updateMatrix();
    halos.setMatrixAt(i, o.matrix);
  });
  dots.instanceMatrix.needsUpdate = true;
  halos.instanceMatrix.needsUpdate = true;
  return (
    <>
      <primitive object={dots} />
      <primitive object={halos} />
    </>
  );
};
const SimTiles: React.FC<{ T: number }> = ({ T }) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(CELL * 0.86, TILE_H * 0.8, CELL * 0.86);
    const im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: SIMC, transparent: true, opacity: 0.55, depthWrite: false }), SIM_CELLS.length);
    return im;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  if (T < b(140) - 0.1 || T > DROP2 + 0.05) return null;
  SIM_CELLS.forEach((cl, i) => {
    const appear = easeOut(prog(T, b(140), b(140) + 0.3));
    const t0 = simFlyAt(cl.bucket, cl.order);
    const go = easeInOut(prog(T, t0, t0 + 1.0));
    const home = new THREE.Vector3(cl.x, GRID_Y + 0.01, cl.z);
    const pile = new THREE.Vector3(PX(cl.bucket) + SIM_DX, PILE_Y + cl.rank * TILE_H, PILE_Z);
    const p = home.clone().lerp(pile, go);
    p.y += Math.sin(Math.PI * go) * 2.2;
    o.position.copy(p);
    o.rotation.set(0, -Math.sin(Math.PI * go) * 0.8, 0);
    o.scale.setScalar(Math.max(0.0001, appear));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
/* at the second drop the computer's piles become ghost columns and slide onto London's */
const GhostCols: React.FC<{ T: number }> = ({ T }) => {
  const o = 1 - prog(T, BACK - 0.1, BACK + 0.5);
  if (T < DROP2 || o <= 0.001) return null;
  return (
    <>
      {SIM_HIST.map((n, k) => {
        const slide = easeInOut(prog(T, DROP2 + 0.05 + k * 0.07, DROP2 + 0.55 + k * 0.07));
        const h = Math.max(0.01, n * TILE_H);
        return (
          <mesh key={k} position={[PX(k) + SIM_DX * (1 - slide), PILE_Y - 0.004 + h / 2 - TILE_H * 0.4, PILE_Z]}>
            <boxGeometry args={[CELL * 1.08, h, CELL * 1.08]} />
            <meshBasicMaterial color={SIMC} transparent opacity={lerp(0.55, 0.38, slide) * o} depthWrite={false} />
          </mesh>
        );
      })}
    </>
  );
};
const PileLabels: React.FC<{ T: number }> = ({ T }) => {
  const out = 1 - prog(T, BACK - 0.1, BACK + 0.4);
  const base = easeOut(prog(T, BUILD + 0.8, BUILD + 1.4)) * out;
  const real = easeOut(prog(T, b(132) - 0.6, b(132))) * out;
  const sim = easeOut(prog(T, b(147), b(148))) * out;
  const merged = easeOut(prog(T, DROP2 + 0.6, DROP2 + 1.0));
  if (base <= 0.001) return null;
  return (
    <>
      {OBSERVED.map((v, k) => {
        const top = PILE_Y + Math.max(v, SIM_HIST[k]) * TILE_H;
        return (
          <React.Fragment key={k}>
            <Lbl text={k === 5 ? '5颗+' : `${k}颗`} pos={[PX(k) + SIM_DX / 2, 0.16, PILE_Z + 0.75]} w={1.6} h={0.36} o={base} color={C.dim} font={`600 50px ${ZH}`} />
            <Lbl text={`${v}`} pos={[PX(k), top + 0.32, PILE_Z]} w={1.0} h={0.36} o={real * (1 - merged)} font={`700 52px ${ZH}`} />
            <Lbl text={`*${SIM_HIST[k]}*`} pos={[PX(k) + SIM_DX, top + 0.32, PILE_Z]} w={1.0} h={0.36} o={sim * (1 - merged)} font={`700 52px ${ZH}`} />
            <Lbl text={`${v} / *${SIM_HIST[k]}*`} pos={[PX(k), top + 0.32, PILE_Z]} w={1.8} h={0.36} o={merged * out} font={`700 50px ${ZH}`} />
          </React.Fragment>
        );
      })}
      <Lbl text="真实伦敦" pos={[PX(5) + 0.3, PILE_Y + 2.75, PILE_Z]} w={1.6} h={0.34} o={real} font={`600 46px ${ZH}`} />
      <Lbl text="*电脑随机撒*" pos={[PX(5) + 0.3, PILE_Y + 2.3, PILE_Z]} w={1.9} h={0.34} o={sim} font={`600 46px ${ZH}`} />
    </>
  );
};

/* ---------- labels and rings on the boards (opening question, and the answer) ---------- */
const Ring: React.FC<{ x: number; y: number; z: number; r: number; o: number; hot: boolean }> = ({ x, y, z, r, o, hot }) =>
  o <= 0.001 ? null : (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, 0.03, 8, 64]} />
      <meshStandardMaterial color={hot ? '#ffb066' : '#9fc0ff'} emissive={hot ? '#ff8a2a' : '#5f86b8'} emissiveIntensity={1.8} transparent opacity={o} />
    </mesh>
  );

/* ---------- panel helpers ---------- */
const Panel: React.FC<{ i: number; o: number; head: string; children?: React.ReactNode }> = ({ i, o, head, children }) => {
  if (o <= 0.001) return null;
  const e = [PW / 2, PH / 2];
  return (
    <group position={[PXS[i], PY, PZ]}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[PW, PH, 0.08]} />
        <meshStandardMaterial color="#11131b" roughness={0.6} metalness={0.2} transparent opacity={0.97 * o} />
      </mesh>
      {[[0, -e[1], PW + 0.05, 0.04], [0, e[1], PW + 0.05, 0.04], [-e[0], 0, 0.04, PH], [e[0], 0, 0.04, PH]].map(([dx, dy, w, h], k) => (
        <mesh key={k} position={[dx, dy, -0.01]}>
          <boxGeometry args={[w, h, 0.03]} />
          <meshBasicMaterial color="#e9dfc8" transparent opacity={0.7 * o} />
        </mesh>
      ))}
      <Lbl text={head} pos={[-1.6, e[1] - 0.42, 0.01]} w={5.2} h={0.4} o={o * 0.85} color={C.dim} font={`600 50px ${ZH}`} />
      {children}
    </group>
  );
};
const BigNum: React.FC<{ text: string; cap: string; o: number; capO: number }> = ({ text, cap, o, capO }) => (
  <>
    <Lbl text={`*${text}*`} pos={[2.9, 0.25, 0.02]} w={3.0} h={1.25} o={o} font={`700 150px ${ZH}`} />
    <Lbl text={cap} pos={[2.9, -0.75, 0.02]} w={3.0} h={0.4} o={capO} font={`500 50px ${ZH}`} />
  </>
);
const Line2: React.FC<{ a: number[]; b: number[]; w: number; color: string; o: number; z?: number }> = ({ a, b: bb, w, color, o, z = 0.02 }) => {
  const dx = bb[0] - a[0], dy = bb[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-4 || o <= 0.001) return null;
  return (
    <mesh position={[(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2, z]} rotation={[0, 0, Math.atan2(dy, dx)]}>
      <boxGeometry args={[len, w, 0.01]} />
      <meshBasicMaterial color={color} transparent opacity={o} />
    </mesh>
  );
};
const panelO = (T: number, i: number) => win(T, CASE_T[i] - 0.5, CASE_T[i + 1] + 0.5, 0.4, 0.4) * (i === 3 ? 1 - prog(T, TEX, TEX + 0.6) : 1);

/* case 1: 100 fair ranked games */
const GamesPanel: React.FC<{ T: number }> = ({ T }) => {
  const o = panelO(T, 0);
  const t0 = CASE_T[0] + 0.2;
  const streak = easeOut(prog(T, b(187), b(187) + 0.4));
  return (
    <Panel i={0} o={o} head="排位 · 100 局，每局五五开">
      {GAMES.split('').map((g, i) => {
        const r = Math.floor(i / 10), c = i % 10;
        const pop = easeOut(prog(T, t0 + i * 0.014, t0 + i * 0.014 + 0.2));
        const inRun = i >= LOSS_RUN[0] && i < LOSS_RUN[0] + LOSS_RUN[1];
        const hl = inRun ? streak : 0;
        const dimOthers = 1 - 0.5 * streak * (inRun ? 0 : 1);
        return (
          <mesh key={i} position={[-1.75 + (c - 4.5) * 0.31, -0.25 + (4.5 - r) * 0.31, 0.02 + hl * 0.08]} scale={Math.max(0.0001, pop * (1 + hl * 0.12))}>
            <boxGeometry args={[0.26, 0.26, 0.03]} />
            <meshBasicMaterial color={g === 'W' ? '#4a5f86' : hl > 0 ? new THREE.Color('#b8473e').lerp(new THREE.Color('#ff6a5c'), hl) : '#b8473e'} transparent opacity={o * dimOthers} />
          </mesh>
        );
      })}
      <Lbl text="■ 胜" pos={[-3.6, -2.0, 0.02]} w={1.0} h={0.3} o={o * 0.9} color="#7f97c4" font={`500 40px ${ZH}`} />
      <Lbl text="■ 负" pos={[-2.7, -2.0, 0.02]} w={1.0} h={0.3} o={o * 0.9} color="#d0695e" font={`500 40px ${ZH}`} />
      <Lbl text="5连败" pos={[-1.75 + (2 - 4.5) * 0.31, -0.25 + (4.5 - 7) * 0.31 - 0.32, 0.12]} w={1.4} h={0.32} o={o * streak} color="#ff8a7e" font={`700 46px ${ZH}`} />
      <BigNum text="81%" cap="会遇到一次5连败" o={o * easeOut(prog(T, b(190), b(190) + 0.4))} capO={o * easeOut(prog(T, b(191), b(191) + 0.4))} />
    </Panel>
  );
};
/* case 2: 23 classmates */
const bdPos = (i: number) => {
  const r = Math.floor(i / 6), c = i % 6;
  const n = r < 3 ? 6 : 5;
  return [-1.75 + (c - (n - 1) / 2) * 0.86, 0.75 - r * 0.64];
};
const BdayPanel: React.FC<{ T: number }> = ({ T }) => {
  const o = panelO(T, 1);
  const t0 = CASE_T[1] + 0.2;
  const pair = easeOut(prog(T, b(198), b(198) + 0.45));
  const link = easeInOut(prog(T, b(199), b(199) + 0.6));
  const [a, c] = BIRTHDAY_PAIR.map(bdPos);
  return (
    <Panel i={1} o={o} head="全班 · 23 人">
      {BIRTHDAYS.map((d, i) => {
        const p = bdPos(i);
        const isPair = BIRTHDAY_PAIR.includes(i);
        const pop = easeOut(prog(T, t0 + i * 0.04, t0 + 0.3 + i * 0.04));
        return (
          <mesh key={i} position={[p[0], p[1], 0.03 + (isPair ? pair * 0.1 : 0)]} scale={Math.max(0.0001, pop * (isPair ? 1 + pair * 0.1 : 1))}>
            <boxGeometry args={[0.78, 0.5, 0.012]} />
            <meshBasicMaterial map={dateCard(d)} transparent opacity={o * (isPair ? 1 : 1 - pair * 0.55)} />
          </mesh>
        );
      })}
      {BIRTHDAY_PAIR.map((k) => {
        const p = bdPos(k);
        return pair > 0.01 ? (
          <mesh key={k} position={[p[0], p[1], 0.02]}>
            <boxGeometry args={[0.88, 0.6, 0.005]} />
            <meshBasicMaterial color={GOLD} transparent opacity={o * pair * 0.9} />
          </mesh>
        ) : null;
      })}
      {link > 0 && (
        <>
          <Line2 a={a} b={[lerp(a[0], c[0], link), lerp(a[1], c[1], link)]} w={0.045} color={GOLD} o={o * link} z={0.16} />
        </>
      )}
      <BigNum text="50.7%" cap="有两人同一天生日" o={o * easeOut(prog(T, b(202), b(202) + 0.4))} capO={o * easeOut(prog(T, b(203), b(203) + 0.4))} />
    </Panel>
  );
};
/* case 3: a 双色球 draw */
const ballTex = (() => {
  const cache: Record<string, THREE.CanvasTexture> = {};
  return (n: number, blue: boolean) => {
    const key = `${n}${blue}`;
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(96, 84, 10, 128, 128, 128);
    gr.addColorStop(0, blue ? '#7ea6f0' : '#ff8a8a');
    gr.addColorStop(0.55, blue ? '#2f5fb8' : '#c8323a');
    gr.addColorStop(1, blue ? '#1a3570' : '#7a1820');
    g.fillStyle = gr;
    g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 132, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = blue ? '#1a3570' : '#8a1a22';
    g.font = `700 96px "Noto Sans CJK SC", "Noto Sans SC", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(n).padStart(2, '0'), 128, 138);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return (cache[key] = tx);
  };
})();
const LottoPanel: React.FC<{ T: number }> = ({ T }) => {
  const o = panelO(T, 2);
  const sort = easeInOut(prog(T, b(211), b(211) + 0.7));
  const pair = easeOut(prog(T, b(212) + 0.2, b(212) + 0.6));
  const slot = (k: number) => -4.0 + 0.78 * k;
  const R = 0.33;
  const balls = RED_DRAW.map((n, k) => ({ n, k, s: RED_SORTED.indexOf(n) }));
  return (
    <Panel i={2} o={o} head="双色球 · 6 个红球 + 1 个蓝球">
      {balls.map(({ n, k, s }) => {
        const at = CASE_T[2] + 0.1 + k * 0.25;
        const drop = easeOut(prog(T, at, at + 0.35));
        const x = lerp(slot(k), slot(s), sort);
        const y = 0.0 + (1 - drop) * 2.2 + Math.sin(Math.PI * sort) * 0.35 * (k % 2 ? 1 : -1);
        const inPair = s === RED_PAIR || s === RED_PAIR + 1;
        return drop > 0 ? (
          <group key={n} position={[x, y, 0.4]}>
            <mesh scale={1 + (inPair ? pair * 0.08 : 0)}>
              <circleGeometry args={[R, 40]} />
              <meshBasicMaterial map={ballTex(n, false)} transparent opacity={o * drop * (inPair ? 1 : 1 - pair * 0.4)} />
            </mesh>
          </group>
        ) : null;
      })}
      {(() => {
        const at = CASE_T[2] + 0.1 + 6 * 0.25;
        const drop = easeOut(prog(T, at, at + 0.35));
        return drop > 0 ? (
          <mesh position={[slot(6) + 0.2, (1 - drop) * 2.2, 0.4]}>
            <circleGeometry args={[R, 40]} />
            <meshBasicMaterial map={ballTex(BLUE, true)} transparent opacity={o * drop * (1 - pair * 0.4)} />
          </mesh>
        ) : null;
      })()}
      {pair > 0.01 && (
        <>
          <mesh position={[(slot(RED_PAIR) + slot(RED_PAIR + 1)) / 2, 0, 0.35]}>
            <planeGeometry args={[0.78 + 2 * R + 0.18, 2 * R + 0.18]} />
            <meshBasicMaterial color={GOLD} transparent opacity={o * pair * 0.85} />
          </mesh>
          <mesh position={[(slot(RED_PAIR) + slot(RED_PAIR + 1)) / 2, 0, 0.36]}>
            <planeGeometry args={[0.78 + 2 * R + 0.1, 2 * R + 0.1]} />
            <meshBasicMaterial color="#11131b" transparent opacity={o * pair} />
          </mesh>
          <Lbl text="连号" pos={[(slot(RED_PAIR) + slot(RED_PAIR + 1)) / 2, -0.78, 0.4]} w={1.2} h={0.36} o={o * pair} color={GOLD} font={`700 52px ${ZH}`} />
        </>
      )}
      <BigNum text="66%" cap="会出现连号" o={o * easeOut(prog(T, b(214), b(214) + 0.4))} capO={o * easeOut(prog(T, b(215), b(215) + 0.4))} />
    </Panel>
  );
};
/* case 4: six roommates draw names */
const NAMES = ['老大', '老二', '老三', '老四', '老五', '老六'];
const DrawPanel: React.FC<{ T: number }> = ({ T }) => {
  const o = panelO(T, 3);
  const nx = (i: number) => -1.75 + (i - 2.5) * 0.92;
  const top = 0.75, bot = -1.15;
  const selfO = easeOut(prog(T, b(224), b(224) + 0.4));
  return (
    <Panel i={3} o={o} head="寝室 · 6 人抽签送礼物">
      {NAMES.map((n, i) => {
        const pop = easeOut(prog(T, CASE_T[3] + 0.1 + i * 0.05, CASE_T[3] + 0.4 + i * 0.05));
        return (
          <React.Fragment key={i}>
            <mesh position={[nx(i), top + 0.18, 0.02]} scale={Math.max(0.0001, pop)}>
              <circleGeometry args={[0.32, 40]} />
              <meshBasicMaterial color={i === SELF ? new THREE.Color('#33384a').lerp(new THREE.Color(GOLD), selfO * 0.35) : '#33384a'} transparent opacity={o} />
            </mesh>
            <Lbl text={n} pos={[nx(i), top + 0.18, 0.04]} w={0.8} h={0.3} o={o * pop} font={`600 44px ${ZH}`} />
            <mesh position={[nx(i), bot - 0.12, 0.02]} scale={Math.max(0.0001, pop)}>
              <boxGeometry args={[0.7, 0.4, 0.01]} />
              <meshBasicMaterial color="#efe6d0" transparent opacity={o} />
            </mesh>
            <Lbl text={n} pos={[nx(i), bot - 0.12, 0.04]} w={0.7} h={0.3} o={o * pop} color="#3a2f22" font={`600 42px ${ZH}`} />
          </React.Fragment>
        );
      })}
      {PERM.map((j, i) => {
        const at = b(220) + 0.6 + Math.floor(i / 2) * 0.51 + (i % 2) * 0.12;
        const p = easeInOut(prog(T, at, at + 0.35));
        const self = i === SELF;
        const a = [nx(i), top - 0.16], c = [nx(j), bot + 0.1];
        return (
          <Line2 key={i} a={a} b={[lerp(a[0], c[0], p), lerp(a[1], c[1], p)]} w={self ? 0.05 : 0.025}
            color={self ? GOLD : '#c9c0ae'} o={o * (p > 0 ? 1 : 0) * (self ? 1 : 1 - selfO * 0.6)} />
        );
      })}
      <Lbl text="抽到自己" pos={[nx(SELF) + 0.95, (top + bot) / 2 - 0.05, 0.05]} w={1.6} h={0.36} o={o * selfO} color={GOLD} font={`700 48px ${ZH}`} />
      <BigNum text="63%" cap="有人抽到自己" o={o * easeOut(prog(T, b(224), b(224) + 0.4))} capO={o * easeOut(prog(T, b(225), b(225) + 0.4))} />
    </Panel>
  );
};

/* ---------- the finale: Orion, drawn through the nearest real bomb sites ---------- */
// sky picture (x right, y up), magnitude-ish size, tint
const ORION: [string, number, number, number, string][] = [
  ['Meissa', 0.0, 3.3, 0.8, '#fff6dd'], ['Betelgeuse', -1.9, 2.4, 1.35, '#ffb27a'], ['Bellatrix', 1.5, 2.1, 1.0, '#e6eeff'],
  ['Mintaka', 0.5, 0.25, 0.9, '#eef3ff'], ['Alnilam', 0.0, 0.0, 0.95, '#eef3ff'], ['Alnitak', -0.5, -0.25, 0.9, '#eef3ff'],
  ['Saiph', -1.5, -2.6, 0.95, '#e6eeff'], ['Rigel', 1.8, -2.3, 1.35, '#cfe0ff'],
];
const OR_S = 1.75, OR_Z = -3.9, OR_X = 0.9;
const STARS = ORION.map(([, X, Y]) => {
  const x = OR_X + X * OR_S, z = OR_Z - Y * OR_S;
  let best = HITS3[0], d = 1e9;
  for (const h of HITS3) { const e = Math.hypot(h.x - x, h.z - z); if (e < d) { d = e; best = h; } }
  return [best.x, 0.24, best.z];
});
const STAR_EDGES = [[0, 1], [0, 2], [1, 5], [2, 3], [5, 4], [4, 3], [5, 6], [3, 7]];
const C0 = TEX + 0.9;
/* a gas street lamp: the spy waits in its pool of light */
const StreetLamp: React.FC<{ x: number; z: number; o: number }> = ({ x, z, o }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(x + 0.38, 0, z + 0.12);
  target.updateMatrixWorld();
  if (o <= 0.001) return null;
  return (
    <group>
      <primitive object={target} />
      <mesh position={[x, 0.42, z]}>
        <cylinderGeometry args={[0.012, 0.018, 0.84, 10]} />
        <meshStandardMaterial color="#1f2125" metalness={0.6} roughness={0.5} transparent opacity={o} />
      </mesh>
      <mesh position={[x, 0.87, z]}>
        <cylinderGeometry args={[0.03, 0.045, 0.07, 6]} />
        <meshBasicMaterial color="#ffd89a" transparent opacity={o} />
      </mesh>
      <sprite position={[x, 0.87, z]} scale={[0.5, 0.5, 1]}>
        <spriteMaterial map={haloTex()} color="#ffcf8a" transparent opacity={0.9 * o} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <spotLight position={[x, 0.86, z]} target={target} angle={0.75} penumbra={0.6} decay={1.5} distance={3} intensity={9 * o} color="#ffd29a" castShadow
        shadow-mapSize-width={512} shadow-mapSize-height={512} shadow-bias={-0.001} />
    </group>
  );
};
const RING_BOOMS = HITS3.filter((h) => h.inSquare && Math.hypot(h.x - HOT_SPOT.x, h.z - HOT_SPOT.z) < HOT_R * 0.8).slice(0, 3);
const Constellation: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, C0, C0 + 0.6)) * (1 - prog(T, END_IN - 0.4, END_IN + 0.4));
  if (o <= 0.001) return null;
  const starAt = (i: number) => C0 + i * 0.22;
  return (
    <>
      {STAR_EDGES.map(([i, j], k) => {
        const t0 = C0 + 1.9 + k * 0.26;
        const p = easeInOut(prog(T, t0, t0 + 0.4));
        if (p <= 0) return null;
        const a = STARS[i], bb = STARS[j];
        return (
          <mesh key={k} position={[(a[0] + bb[0]) / 2 + (bb[0] - a[0]) * (p - 1) / 2, 0.27, (a[2] + bb[2]) / 2 + (bb[2] - a[2]) * (p - 1) / 2]}
            rotation={[0, -Math.atan2(bb[2] - a[2], bb[0] - a[0]), 0]}>
            <boxGeometry args={[Math.hypot(bb[0] - a[0], bb[2] - a[2]) * p, 0.02, 0.05]} />
            <meshBasicMaterial color="#e9e2cf" transparent opacity={0.85 * o} />
          </mesh>
        );
      })}
      {STARS.map((s, i) => {
        const so = o * easeOut(prog(T, starAt(i), starAt(i) + 0.35));
        const [, , , mag, tint] = ORION[i];
        return (
          <React.Fragment key={i}>
            <mesh position={s as any}>
              <sphereGeometry args={[0.1 * mag, 16, 12]} />
              <meshBasicMaterial color={tint} transparent opacity={so} />
            </mesh>
            <mesh position={[s[0], 0.3, s[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.5 * mag, 1.5 * mag]} />
              <meshBasicMaterial map={haloTex()} color={tint} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={so * 0.9} />
            </mesh>
          </React.Fragment>
        );
      })}
      <Lbl text="猎户座 · ORION" pos={[STARS[2][0] + 2.9, 0.3, STARS[2][2] - 0.4]} w={5.4} h={0.8} flat
        o={o * easeOut(prog(T, C0 + 4.0, C0 + 4.6))} color="#e9e2cf" font={`600 110px ${ZH}`} />
    </>
  );
};

/* ---------- Clarke measures the square before cutting it ---------- */
const Measure: React.FC<{ T: number }> = ({ T }) => {
  const o = win(T, CLARKE + 0.3, b(88) + 0.2, 0.3, 0.5);
  if (o <= 0.001) return null;
  const top = easeInOut(prog(T, b(82), b(83) + 0.3));
  const side = easeInOut(prog(T, b(84), b(85) + 0.3));
  const area = easeOut(prog(T, b(86), b(86) + 0.4));
  const z0 = SQ.z0 - 0.5, x1 = SQ.x0 + SQ.size + 0.5, y = GRID_Y + 0.02;
  const mat = <meshBasicMaterial color={GOLD} transparent opacity={0.9 * o} />;
  return (
    <>
      {top > 0 && (
        <>
          <mesh position={[SQ.x0 + SQ.size * top / 2, y, z0]}><boxGeometry args={[SQ.size * top, 0.01, 0.035]} />{mat}</mesh>
          {[SQ.x0, SQ.x0 + SQ.size * top].map((x, i) => <mesh key={i} position={[x, y, z0]}><boxGeometry args={[0.035, 0.01, 0.35]} />{mat}</mesh>)}
          <Lbl text="12 公里" pos={[0, y, z0 - 0.6]} w={4} h={0.8} flat o={o * prog(T, b(83), b(83) + 0.3)} color={GOLD} font={`700 110px ${ZH}`} />
        </>
      )}
      {side > 0 && (
        <>
          <mesh position={[x1, y, SQ.z0 + SQ.size * side / 2]}><boxGeometry args={[0.035, 0.01, SQ.size * side]} />{mat}</mesh>
          {[SQ.z0, SQ.z0 + SQ.size * side].map((z, i) => <mesh key={i} position={[x1, y, z]}><boxGeometry args={[0.35, 0.01, 0.035]} />{mat}</mesh>)}
          <Lbl text="12 公里" pos={[x1 + 1.9, y, 0]} w={4} h={0.8} flat o={o * prog(T, b(85), b(85) + 0.3)} color={GOLD} font={`700 110px ${ZH}`} />
        </>
      )}
      <Lbl text="*144* 平方公里" pos={[0, y + 0.05, 0]} w={6} h={1.1} flat o={o * area} font={`700 150px ${ZH}`} />
    </>
  );
};

/* ---------- lights ---------- */
const Lights: React.FC<{ T: number }> = ({ T }) => {
  const { look } = camAt(T);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(look[0], look[1], look[2]);
  target.updateMatrixWorld();
  const up = 1;
  const dark = 1 - 0.75 * easeInOut(prog(T, GAP - 1.8, GAP)) * (1 - easeOut(prog(T, DROP2, DROP2 + 0.6)));
  const preDrop = 1 - 0.5 * easeInOut(prog(T, b(30), DROP1 - 0.05)) * (T < DROP1 ? 1 : 0);
  const flare = (T >= DROP1 + 0.5 ? 1.6 * Math.exp(-(T - DROP1 - 0.5) * 2.2) : 0) + (T >= DROP2 ? 1.6 * Math.exp(-(T - DROP2) * 2.2) : 0);
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
  // the grid steps aside while the camera looks at the piles, so nothing hides their feet
  const gridO = easeOut(prog(T, CLARKE - 0.05, CLARKE + 0.3)) * (1 - prog(T, BACK - 0.1, BACK + 0.5)) * (1 - easeInOut(prog(T, b(148) - 0.6, b(148) + 0.3)));
  const hitDim = Math.max(
    easeInOut(prog(T, BD, BD + 1.5)) * 0.5 * (1 - easeInOut(prog(T, BACK, BACK + 0.6))),
    easeInOut(prog(T, CASES, CASES + 1)) * (1 - easeInOut(prog(T, b(236) - 1.2, b(236)))),
  );
  const warm = 0;
  const focus = easeInOut(prog(T, CLARKE + 0.2, CLARKE + 1.2)) * (1 - easeInOut(prog(T, BACK, BACK + 0.6)));
  const fade = easeInOut(prog(T, TEX + 0.4, C0 + 0.6));
  const ringO = (at: number, out: number) => easeOut(prog(T, at, at + 0.5)) * (1 - prog(T, out - 0.4, out));
  const hotO = ringO(b(56) + 0.3, CLARKE), coldO = ringO(b(60), CLARKE);
  const sevenO = easeOut(prog(T, b(116) + 0.4, b(116) + 1.0)) * (1 - prog(T, BUILD - 0.2, BUILD + 0.3));
  const bo = boardO(T), ro = rightO(T);
  const ansO = win(T, BACK + 1.2, CASES - 0.1, 0.5, 0.4);
  const clusterO = win(T, NAME + 0.1, CASES - 0.1, 0.5, 0.4);
  return (
    <>
      <CamRig T={T} />
      <fog attach="fog" args={['#0b0d14', 18, 64]} />
      <Lights T={T} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 60, 80, 60]} />
        <meshStandardMaterial color="#1a1c25" roughness={1} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <City />
      <Thames />
      <Slab x={0} o={bo} />
      <Slab x={RB_X} o={ro} />
      <BoardDots T={T} />
      <Hits T={T} dim={hitDim} warm={warm} focus={focus} fade={fade} />
      <Measure T={T} />
      <Streaks T={T} />
      <ColdOpen T={T} />
      <HeroBomb T={T} />
      <Searchlights T={T} />
      <Grid T={T} o={gridO} />
      <Numbers T={T} />
      <Tiles T={T} />
      <SimDots T={T} />
      <SimTiles T={T} />
      <GhostCols T={T} />
      <PileLabels T={T} />
      <Ring x={HOT_SPOT.x} y={0.36} z={HOT_SPOT.z} r={HOT_R} o={hotO} hot />
      <Ring x={COLD_SPOT.x} y={0.36} z={COLD_SPOT.z} r={COLD_SPOT.r} o={coldO} hot={false} />
      {T > b(64) && T < CLARKE && RING_BOOMS.map((h, i) => <Explosion key={i} pos={[h.x, 0.14, h.z]} t0={b(65 + 2 * i)} T={T} s={0.45} seed={11 + i} />)}
      {T > b(72) && T < CLARKE + 0.1 && (
        <>
          <group position={[COLD_SPOT.x, 0.02, COLD_SPOT.z]} rotation={[0, 0.45, 0]} scale={[2.4, 2.4 * easeOut(prog(T, b(72) + 0.2, b(72) + 0.8)), 2.4]}>
            <Spy T={T} o={win(T, b(72) + 0.2, CLARKE, 0.3, 0.4)} />
          </group>
          <StreetLamp x={COLD_SPOT.x - 0.38} z={COLD_SPOT.z - 0.12} o={win(T, b(72), CLARKE, 0.4, 0.4)} />
        </>
      )}
      <Lbl text="这里挨得最多" pos={[HOT_SPOT.x, 0.9, HOT_SPOT.z - 1.0]} w={2.6} h={0.42} o={hotO * (T > b(64) && T < b(72) ? 1 : 0.0)} font={`600 54px ${ZH}`} />
      <Lbl text="这里一颗都没有" pos={[COLD_SPOT.x - 0.1, 1.12, COLD_SPOT.z - COLD_SPOT.r - 0.6]} w={1.5} h={0.21} o={0} font={`600 54px ${ZH}`} />
      <Lbl text="7颗" pos={[HOT.x, 2.15, HOT.z - 0.2]} w={1.4} h={0.5} o={sevenO} font={`600 72px ${ZH}`} />
      {/* the answer, back on the boards */}
      <Lbl text="伦敦 1944 · 真实落点" pos={[0, BOARD_Y + 0.08, -7.5]} w={10} h={1.1} o={ansO} flat font={`600 140px ${ZH}`} />
      <Lbl text="人摆的 · 太均匀" pos={[RB_X, BOARD_Y + 0.08, -7.5]} w={10} h={1.1} o={ansO} color={C.dim} flat font={`600 140px ${ZH}`} />
      <Ring x={HOT_SPOT.x} y={BOARD_Y + 0.14} z={HOT_SPOT.z} r={HOT_R + 0.1} o={clusterO} hot />
      <Ring x={COLD_SPOT.x} y={BOARD_Y + 0.14} z={COLD_SPOT.z} r={COLD_SPOT.r + 0.1} o={clusterO} hot={false} />
      <GamesPanel T={T} />
      <BdayPanel T={T} />
      <LottoPanel T={T} />
      <DrawPanel T={T} />
      <Constellation T={T} />
    </>
  );
};

/* ---------- 2D overlays ---------- */
const Counter: React.FC<{ T: number }> = ({ T }) => {
  const o = win(T, CUT + 0.1, b(48) - 0.1, 0.4, 0.3);
  if (o <= 0) return null;
  const n = Math.round(lerp(537, 2419, easeInOut(prog(T, CUT + 0.2, CUT + 3.8))));
  return (
    <div style={{ position: 'absolute', top: 260, right: 58, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 76, lineHeight: 1, color: JUNO.colors.ink, fontVariantNumeric: 'tabular-nums' }}>{n.toLocaleString('en-US')}</div>
      <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.6)', marginTop: 8, letterSpacing: '0.14em' }}>枚 V-1 落在伦敦</div>
    </div>
  );
};

type Line = [number, number, string, string];
/* every line starts on a beat and leaves just before the next one starts */
const LINES: Line[] = [
  [0.45, b(8) - 0.12, '你有没有觉得，倒霉的事总爱{扎堆}？', 'Ever feel like bad luck comes in clusters?'],
  [b(16) + 0.06, b(24) - 0.08, '两张图：一张是随机撒的点，一张是人摆的', 'Two boards: one scattered at random, one arranged by hand.'],
  [b(24) + 0.06, DROP1 - 0.08, '哪张才是随机的？先记住你的答案', 'Which one is random? Lock in your answer.'],
  [DROP1 + 0.12, CUT - 0.08, '左边这些点，是1944年落在伦敦的飞弹', 'The left board: where flying bombs hit London in 1944.'],
  [CUT + 0.06, b(48) - 0.08, '那年夏天起，一共2419枚V-1落在伦敦', 'From that summer, 2,419 V-1s fell on London.'],
  [b(48) + 0.06, b(56) - 0.08, '它飞来时嗡嗡响，声音一停，就要落地了', 'They buzzed in. When the buzzing stopped, they fell.'],
  [b(56) + 0.06, b(64) - 0.08, '落点有的地方{特别密}，有的{一颗没有}', 'Some places were hit again and again. Some, never.'],
  [b(64) + 0.06, b(72) - 0.08, '人们开始传：飞弹{专挑某些街区}', 'People said the bombs picked certain streets.'],
  [b(72) + 0.06, CLARKE - 0.08, '还有人怀疑，没挨炸的地方{住着德国间谍}', 'Some suspected German spies lived where none fell.'],
  [CLARKE + 0.06, b(88) - 0.08, '1946年，精算师克拉克决定算一算', 'In 1946, an actuary named R. D. Clarke did the maths.'],
  [b(88) + 0.06, BD - 0.08, '他把伦敦南部切成576个一样大的格子', 'He cut south London into 576 equal squares.'],
  [BD + 0.06, b(104) - 0.08, '然后一格一格地数：每格落了几颗', 'Then he counted the hits in every square.'],
  [b(104) + 0.06, b(112) - 0.08, '576个格子，全部数完', 'All 576 squares, counted.'],
  [b(112) + 0.06, b(120) - 0.08, '229格一颗没挨，有1格挨了7颗', '229 squares took none. One took seven.'],
  [b(120) + 0.06, BUILD - 0.08, '看起来，{真像在瞄准}', 'It really did look like aiming.'],
  [BUILD + 0.06, b(132) - 0.08, '按挨了几颗，把格子分成6堆', 'Sort the squares into six piles by hits.'],
  [b(132) + 0.06, b(140) - 0.08, '现在，让电脑把537颗完全随机地撒一遍', 'Now let a computer scatter 537 hits completely at random.'],
  [b(140) + 0.06, b(148) - 0.08, '随机撒出来的，也分成6堆', 'Sort those into six piles too.'],
  [b(148) + 0.06, GAP - 0.08, '真实的伦敦，和随机撒的，差多少？', 'How far is London from pure chance?'],
  [DROP2 + 0.9, BACK - 0.08, '伦敦的落点，就是[完全随机]的样子', "London's hits looked exactly like pure chance."],
  [BACK + 0.06, NAME - 0.08, '所以开头那题：[左边]才是随机的', 'So the answer: the left board is the random one.'],
  [NAME + 0.06, CASES - 0.08, '这叫[聚集错觉]：随机，本来就会扎堆', 'The clustering illusion: randomness clumps.'],
  [CASES + 0.06, b(190) - 0.08, '排位连跪5把，{系统在针对我}？', 'Five ranked losses in a row. Is the system out to get me?'],
  [b(190) + 0.06, b(196) - 0.08, '就算每局五五开，100局里[81%]会遇到5连败', 'Even at 50-50, 81% of 100-game runs have a 5-loss streak.'],
  [b(196) + 0.06, b(202) - 0.08, '班里有两人同一天生日，{这么巧}？', 'Two classmates share a birthday. What are the odds?'],
  [b(202) + 0.06, b(208) - 0.08, '23个人里，这件事的概率超过[一半]', 'With 23 people, better than even.'],
  [b(208) + 0.06, b(214) - 0.08, '双色球开出连号，{肯定有内幕}？', 'Consecutive lottery numbers. Must be rigged?'],
  [b(214) + 0.06, b(220) - 0.08, '随机摇6个红球，[66%]会出现连号', 'Six random red balls: 66% of draws have a consecutive pair.'],
  [b(220) + 0.06, TEX - 0.08, '寝室6人抽签送礼，[63%]有人抽到自己', 'Six roommates draw names: 63% of the time, someone gets their own.'],
  [TEX + 0.1, b(236) - 0.1, '就连星座，也是我们把随机的星星连起来的', 'Even constellations are lines we drew through random stars.'],
];

export const V3Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = frame / fps;
  const revO = prog(T, DROP2 + 0.5, DROP2 + 0.7) * (1 - prog(T, BACK - 0.4, BACK));
  const rp = easeOut(prog(T, DROP2 + 0.5, DROP2 + 1.1));
  const CARD_IN = b(8), CARD_OUT = b(16);
  const cardF = Math.round(CARD_IN * fps), cardLen = Math.round((CARD_OUT - CARD_IN) * fps);
  const endF = Math.round(END_IN * fps), endLen = Math.round((V3_END - END_IN) * fps);
  // fonts first: canvas labels are drawn once, so every render chunk must see the same fonts
  const [fontsReady, setFontsReady] = useState(false);
  const [fontHandle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = ['600 40px "Cormorant Garamond"', '500 40px "Cormorant Garamond"', 'italic 400 40px "Cormorant Garamond"',
      '500 40px "Noto Serif CJK SC"', '600 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '700 40px "Noto Sans CJK SC"'];
    Promise.all(faces.map((f) => document.fonts.load(f, '0123456789%公里').catch(() => null))).then(() => setFontsReady(true));
  }, []);
  useEffect(() => { if (fontsReady) continueRender(fontHandle); }, [fontsReady, fontHandle]);
  // impact flashes: the cold-open explosion whites out into the title card; the rooftop one cuts to the overview
  const coldFlash = T >= CO_HIT && T < CARD_IN + 0.3 ? Math.min(1, easeOut(prog(T, CO_HIT, CO_HIT + 0.1)) * 0.8 + 0.2 * prog(T, CO_HIT + 0.1, CARD_IN)) : 0;
  const heroFlash = T >= HERO.t && T < HERO.t + 1 ? 0.75 * easeOut(prog(T, HERO.t, HERO.t + 0.05)) * Math.exp(-(T - HERO.t) * 4.5) : 0;
  const flashO = Math.max(coldFlash, heroFlash);
  const markO = Math.min(easeOut(prog(T, 0.3, 1.0)), 1 - prog(T, CARD_IN, CARD_IN + 0.15) + prog(T, CARD_OUT - 0.1, CARD_OUT + 0.4), 1 - prog(T, END_IN - 0.2, END_IN + 0.5));
  return (
    <AbsoluteFill style={{ backgroundColor: JUNO.colors.night }}>
      {fontsReady && (
        <ThreeCanvas width={width} height={height} shadows="variance" gl={{ antialias: true }}
          camera={{ fov: 34, near: 0.1, far: 140, position: [0, 10, 10] }} style={{ background: '#0b0d14' }}>
          <Scene T={T} />
        </ThreeCanvas>
      )}
      {flashO > 0.001 && <AbsoluteFill style={{ opacity: flashO, background: 'radial-gradient(ellipse at 55% 60%, #fff6e2 0%, #ffd49a 45%, #ff9a50 100%)' }} />}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(8,9,13,0) 0%, rgba(8,9,13,0.55) 45%, rgba(8,9,13,0.78) 100%)' }} />
      <YearMark T={T} at={DROP1 + 0.3} out={CUT - 0.1} year="1944" place="伦敦 · LONDON" />
      <Counter T={T} />
      <YearMark T={T} at={CLARKE + 0.2} out={BD - 0.2} year="1946" place="伦敦南部 · SOUTH LONDON" />
      {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
      {revO > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 62, textAlign: 'center', opacity: revO,
          transform: `scale(${lerp(1.12, 1, rp)})`, filter: `blur(${(1 - easeOut(prog(T, DROP2 + 0.5, DROP2 + 0.95))) * 12}px)` }}>
          <span style={{ fontFamily: ZH, fontSize: 104, fontWeight: 900, letterSpacing: '0.12em',
            backgroundImage: `linear-gradient(180deg, #fff3cf 0%, ${JUNO.colors.gold} 55%, ${JUNO.colors.goldDeep} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            几乎一模一样
          </span>
        </div>
      )}
      {T > b(236) - 0.5 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 690, height: 360, opacity: easeOut(prog(T, b(236) - 0.4, b(236) + 0.4)) * 0.8 * (1 - prog(T, END_IN - 0.3, END_IN + 0.3)),
          background: 'radial-gradient(ellipse 45% 50% at 50% 50%, rgba(8,9,13,0.85) 0%, rgba(8,9,13,0) 100%)' }} />
      )}
      <Sub T={T} at={b(236)} out={END_IN + 0.2} zh="随机，本来就会扎堆" en="Randomness clusters. That's what it does." y={790} size={72} enSize={32} />
      <Sub T={T} at={FIN + 0.05} out={END_IN + 0.2} zh="[好运]，也会" en="So does good luck." y={935} size={52} enSize={28} />
      <CornerMark o={markO} />
      <Sequence from={cardF} durationInFrames={cardLen}>
        <TitleCard v={EPISODE3} dur={cardLen} land={23} />
      </Sequence>
      <Sequence from={endF} durationInFrames={endLen}>
        <EndCard v={EPISODE3} dur={endLen} />
      </Sequence>
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

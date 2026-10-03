import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, pStop } from '../lib';
import { Glow, Dust, Vignette, Grain } from '../ui';
import { cx, strY, CARD_W, CARD_H, v3, mix, frontTex, backTex, RedString3, Dust3, Sub } from './Open3D';

/* ---------- timing: music time, identical to Ep1 ---------- */
export const RV_START = 63.2;
export const RV_END = 93.6;
const G = 65.248;
const MOR = 71.308;
const Z = 75.372;
const GAP = 79.412;
const R = 81.432;
const RS = 85.496;
const KS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => ({ k, at: beatAfter(G, k - 1), p: pStop(10, k) }));
const FLIPS = [1, 2, 3, 5, 6, 7, 11].map((n) => beatAfter(RS, n));
const STD = beatAfter(RS, 4);
const SEAL = beatAfter(RS, 12);
const RULE2 = beatAfter(RS, 8);
const SCORES = [6, 8, 5, 7, 4, 6, 9, 5, 7, 3];

/* ---------- chart + field layout (world units) ---------- */
const XC = (f: number) => -5.75 + 11.5 * f;
const YC = (p: number) => 5.5 + 9 * p;
const ZCH = 0.4;
const PEAK = [XC(1 / Math.E), YC(1 / Math.E), ZCH];
const DIV_X = (cx(2) + cx(3)) / 2;
const F_N = 100;
const F_PITCH = 0.07;
const F_CX = -10.7;
const F_CY = 7.9;

const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/* ---------- camera ---------- */
const camAt = (T: number) => {
  const K0p = [0, 0.25, 11.6], K0l = [0, -0.45, 0];
  const d1 = easeInOut(prog(T, 65.3, 71.3));
  const K1p = [-4.3, 7.0, lerp(20.5, 19.6, d1)], K1l = [-4.3, 6.9, 0];
  const d2 = easeInOut(prog(T, 72.8, Z));
  const K2p = [0, 7.1, lerp(14.0, 13.3, d2)], K2l = [0, 7.0, 0];
  const gd = easeInOut(prog(T, 79.2, R));
  const pb = easeOut(prog(T, R, 85.0));
  const K3p = [PEAK[0], PEAK[1], PEAK[2] + 4.0 - 0.5 * gd + 2.6 * pb], K3l = [PEAK[0], PEAK[1], PEAK[2]];
  const d4 = easeInOut(prog(T, 86.7, 91.3));
  const K4p = [0, 0.1, lerp(11.8, 11.2, d4)], K4l = [0, -0.75, 0];
  const K5p = [0.45, -0.15, 9.7], K5l = [0.6, -0.8, 0];
  let pos = K0p, look = K0l;
  const steps: [number, number[], number[]][] = [
    [easeInOut(prog(T, 63.7, 65.3)), K1p, K1l],
    [easeInOut(prog(T, MOR, 72.8)), K2p, K2l],
    [easeInOut(prog(T, Z, 79.2)), K3p, K3l],
    [easeInOut(prog(T, 85.0, 86.7)), K4p, K4l],
    [easeInOut(prog(T, 91.3, RV_END)), K5p, K5l],
  ];
  for (const [k, p, l] of steps) {
    pos = mix(pos, p, k);
    look = mix(look, l, k);
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

/* ---------- helpers ---------- */
const textPlane = (w: number, h: number, ppu = 160) => {
  const c = document.createElement('canvas');
  c.width = Math.round(w * ppu);
  c.height = Math.round(h * ppu);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return { c, g: c.getContext('2d')!, tx, ppu };
};

const Label: React.FC<{ text: string; pos: number[]; w: number; h: number; o: number; color?: string; font?: string; align?: CanvasTextAlign }> = ({
  text, pos, w, h, o, color = C.dim, font = `500 34px ${ZH}`, align = 'center',
}) => {
  const tp = useMemo(() => textPlane(w, h), [w, h]);
  const key = text + color + font;
  useMemo(() => {
    const { g, c, tx } = tp;
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = color;
    g.font = font;
    g.textAlign = align;
    g.textBaseline = 'middle';
    // allow inline gold segments with *...*
    const parts = text.split('*');
    if (parts.length === 1) {
      g.fillText(text, align === 'center' ? c.width / 2 : align === 'right' ? c.width : 0, c.height / 2);
    } else {
      g.textAlign = 'left';
      const widths = parts.map((p) => g.measureText(p).width);
      let x = align === 'center' ? (c.width - widths.reduce((a, b) => a + b, 0)) / 2 : 0;
      parts.forEach((p, i) => {
        g.fillStyle = i % 2 ? C.gold : color;
        g.fillText(p, x, c.height / 2);
        x += widths[i];
      });
    }
    tx.needsUpdate = true;
  }, [key, tp]);
  if (o <= 0.001) return null;
  return (
    <mesh position={pos as any}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tp.tx} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};

/* ---------- 10,000 lives ---------- */
const SLATE = new THREE.Color('#3e4656');
const GOLD = new THREE.Color('#e2b866');
const Field: React.FC<{ T: number; cur: number; o: number }> = ({ T, cur, o }) => {
  const { mesh, mat } = useMemo(() => {
    const geo = new THREE.BoxGeometry(F_PITCH * 0.8, F_PITCH * 0.8, 0.008);
    const m = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.2, transparent: true });
    const im = new THREE.InstancedMesh(geo, m, F_N * F_N);
    im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(F_N * F_N * 3), 3);
    return { mesh: im, mat: m };
  }, []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const appear = easeOut(prog(T, 64.2, 65.4));
  for (let r = 0; r < F_N; r++) {
    for (let c2 = 0; c2 < F_N; c2++) {
      const i = r * F_N + c2;
      const h = hash(i);
      const g = Math.min(1, Math.max(0, (cur - h) / 0.006 + 0.5));
      // tiles ripple in from the centre
      const dc = Math.hypot(r - 49.5, c2 - 49.5) / 70;
      const a = Math.min(1, Math.max(0, (appear - dc * 0.6) / 0.4));
      tmp.position.set(F_CX + (c2 - 49.5) * F_PITCH, F_CY + (49.5 - r) * F_PITCH, -0.5 * (1 - a));
      tmp.rotation.set(Math.sin(Math.PI * g) * 1.4, 0, 0);
      tmp.scale.setScalar(Math.max(0.001, a));
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      col.copy(SLATE).lerp(GOLD, g);
      mesh.setColorAt(i, col);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mat.opacity = o;
  mesh.visible = o > 0.002;
  return <primitive object={mesh} />;
};

/* ---------- chart board (grid + labels on a canvas) ---------- */
const BX0 = -7.4, BX1 = 6.6, BY0 = 3.9, BY1 = 11.3;
const boardCanvas = (variant: 'k' | 'f') => {
  const tp = textPlane(BX1 - BX0, BY1 - BY0, 150);
  const { g, ppu } = tp;
  const px = (x: number) => (x - BX0) * ppu;
  const py = (y: number) => (BY1 - y) * ppu;
  if (variant === 'k') {
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((v) => {
      g.strokeStyle = v === 0 ? 'rgba(235,228,210,0.45)' : 'rgba(235,228,210,0.09)';
      g.lineWidth = v === 0 ? 3 : 2;
      g.beginPath(); g.moveTo(px(XC(0)), py(YC(v))); g.lineTo(px(XC(1)), py(YC(v))); g.stroke();
      g.fillStyle = C.dim; g.font = `500 40px ${EN}`; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.fillText(`${Math.round(v * 100)}%`, px(XC(0) - 0.18), py(YC(v)));
    });
    g.textAlign = 'left'; g.font = `500 36px ${ZH}`; g.fillStyle = C.dim;
    g.fillText('成 功 率', px(XC(0)), py(YC(0.5) + 0.4));
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = C.dim;
  if (variant === 'k') {
    g.font = `500 42px ${EN}`;
    for (let k = 1; k <= 9; k++) g.fillText(String(k), px(XC(k / 10)), py(YC(0) - 0.32));
    g.font = `500 36px ${ZH}`;
    g.fillText('只看不选的人数 k（共10人）', px(XC(0.5)), py(YC(0) - 0.75));
  } else {
    g.font = `500 42px ${EN}`;
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => g.fillText(`${f * 100}%`, px(XC(f)), py(YC(0) - 0.32)));
    g.font = `500 36px ${ZH}`;
    g.fillText('只看不选的比例（人数很多时）', px(XC(0.5)), py(YC(0) - 0.75));
  }
  tp.tx.needsUpdate = true;
  return tp.tx;
};

const Board: React.FC<{ o: number; swap: number }> = ({ o, swap }) => {
  const [grid, kTx, fTx] = useMemo(() => {
    // grid & y-labels live on the 'k' canvas; draw the x-labels separately so they can cross-fade
    const gTx = boardCanvas('k');
    return [gTx, null, boardCanvas('f')];
  }, []);
  void kTx;
  if (o <= 0.001) return null;
  const w = BX1 - BX0, h = BY1 - BY0;
  const p: [number, number, number] = [(BX0 + BX1) / 2, (BY0 + BY1) / 2, ZCH - 0.02];
  return (
    <>
      <mesh position={p}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={grid} transparent opacity={o * (1 - swap * 0.999)} depthWrite={false} />
      </mesh>
      {swap > 0 && (
        <>
          {/* keep the grid while swapping only the x-axis */}
          <GridOnly o={o * swap} />
          <mesh position={[p[0], p[1], p[2] + 0.001]}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={fTx} transparent opacity={o * swap} depthWrite={false} />
          </mesh>
        </>
      )}
    </>
  );
};

const GridOnly: React.FC<{ o: number }> = ({ o }) => {
  const tx = useMemo(() => {
    const tp = textPlane(BX1 - BX0, BY1 - BY0, 150);
    const { g, ppu } = tp;
    const px = (x: number) => (x - BX0) * ppu;
    const py = (y: number) => (BY1 - y) * ppu;
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach((v) => {
      g.strokeStyle = v === 0 ? 'rgba(235,228,210,0.45)' : 'rgba(235,228,210,0.09)';
      g.lineWidth = v === 0 ? 3 : 2;
      g.beginPath(); g.moveTo(px(XC(0)), py(YC(v))); g.lineTo(px(XC(1)), py(YC(v))); g.stroke();
      g.fillStyle = C.dim; g.font = `500 40px ${EN}`; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.fillText(`${Math.round(v * 100)}%`, px(XC(0) - 0.18), py(YC(v)));
    });
    g.textAlign = 'left'; g.font = `500 36px ${ZH}`; g.fillStyle = C.dim; g.textBaseline = 'middle';
    g.fillText('成 功 率', px(XC(0)), py(YC(0.5) + 0.4));
    tp.tx.needsUpdate = true;
    return tp.tx;
  }, []);
  return (
    <mesh position={[(BX0 + BX1) / 2, (BY0 + BY1) / 2, ZCH - 0.019]}>
      <planeGeometry args={[BX1 - BX0, BY1 - BY0]} />
      <meshBasicMaterial map={tx} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};

/* ---------- gold geometry ---------- */
const goldMat = (o: number, glow = 1.2) => (
  <meshStandardMaterial color="#f0d59a" emissive="#c9a45c" emissiveIntensity={glow} roughness={0.35} metalness={0.3} transparent opacity={o} depthWrite={o > 0.98} />
);

const Seg: React.FC<{ a: number[]; b: number[]; r: number; o: number; glow?: number }> = ({ a, b, r, o, glow }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-4 || o <= 0.001) return null;
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2]]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
      <cylinderGeometry args={[r, r, len, 10]} />
      {goldMat(o, glow)}
    </mesh>
  );
};

const CURVE_SEG = 260;
const Curve: React.FC<{ p: number; o: number }> = ({ p, o }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 1; i <= 200; i++) {
      const f = Math.pow(i / 200, 1.15);
      pts.push(new THREE.Vector3(XC(f), YC(-f * Math.log(f)), ZCH));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), CURVE_SEG, 0.03, 8, false);
  }, []);
  geo.setDrawRange(0, Math.floor(p * CURVE_SEG) * 8 * 6);
  if (o <= 0.001 || p <= 0) return null;
  return <mesh geometry={geo}>{goldMat(o, 1.4)}</mesh>;
};

const Dashes: React.FC<{ a: number[]; b: number[]; o: number }> = ({ a, b, o }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.floor(len / 0.22));
  const items = [];
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = f0 + 0.5 / n;
    items.push(
      <Seg key={i} a={[lerp(a[0], b[0], f0), lerp(a[1], b[1], f0), a[2]]} b={[lerp(a[0], b[0], f1), lerp(a[1], b[1], f1), a[2]]} r={0.008} o={o * 0.45} glow={0.3} />,
    );
  }
  return <>{items}</>;
};

/* glowing halo sprite */
const haloTex = (() => {
  let tx: THREE.CanvasTexture | null = null;
  return () => {
    if (tx) return tx;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,230,170,1)');
    gr.addColorStop(0.25, 'rgba(233,190,110,0.55)');
    gr.addColorStop(1, 'rgba(201,164,92,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    tx = new THREE.CanvasTexture(c);
    return tx;
  };
})();
const Halo: React.FC<{ pos: number[]; size: number; o: number }> = ({ pos, size, o }) => {
  const tx = useMemo(() => haloTex(), []);
  if (o <= 0.001) return null;
  return (
    <mesh position={pos as any}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tx} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

/* ---------- the rule on the string ---------- */
const DIMC = new THREE.Color('#4a4438');
const WHITE = new THREE.Color('#ffffff');
const RuleCard: React.FC<{ i: number; T: number }> = ({ i, T }) => {
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#d9cbab', roughness: 0.9 });
    const front = new THREE.MeshStandardMaterial({ map: frontTex(i + 1), roughness: 0.88 });
    const back = new THREE.MeshStandardMaterial({ map: backTex(i + 1, SCORES[i]), roughness: 0.88 });
    return [side, side, side, side, front, back];
  }, [i]);
  const x = cx(i);
  const y0 = strY(x);
  const flip = i < 7 ? easeInOut(prog(T, FLIPS[i], FLIPS[i] + 0.35)) : 0;
  let dim = 0, warm = 0, gold = 0;
  if (i >= 3 && i <= 5) dim = 0.6 * prog(T, FLIPS[i] + 0.35, FLIPS[i] + 0.7);
  const std = easeOut(prog(T, STD, STD + 0.5));
  if (i === 1) warm = std * (1 - prog(T, SEAL, SEAL + 0.5)) * 0.35;
  if (i === 6) gold = easeOut(prog(T, SEAL - 0.1, SEAL + 0.3));
  if (i >= 7) dim = 0.65 * prog(T, SEAL + 0.3, SEAL + 0.9);
  const col = WHITE.clone().lerp(DIMC, dim);
  mats.forEach((m, k) => {
    m.color.copy(k >= 4 ? col : col.clone().multiply(new THREE.Color('#d9cbab')));
    m.emissive.set(gold > 0 ? '#c9a45c' : '#ffcf8a');
    m.emissiveIntensity = gold > 0 ? gold * 0.55 : warm;
  });
  const rz = Math.sin(T * 0.9 + i * 1.7) * 0.012 + Math.sin(Math.max(0, T - (FLIPS[i] ?? 999)) * 7) * Math.exp(-Math.max(0, T - (FLIPS[i] ?? 999)) * 3) * 0.05;
  const rx = Math.sin(T * 0.7 + i * 2.3) * 0.02;
  return (
    <>
      <mesh position={[x, y0, 0.02]} castShadow>
        <boxGeometry args={[0.07, 0.2, 0.06]} />
        <meshStandardMaterial color="#7a5a34" roughness={0.7} />
      </mesh>
      <group position={[x, y0, gold * 0.35]} rotation={[rx, Math.PI * flip, rz]} scale={1 + gold * 0.06}>
        <mesh position={[0, -CARD_H / 2 - 0.04, 0]} castShadow material={mats}>
          <boxGeometry args={[CARD_W, CARD_H, 0.012]} />
        </mesh>
      </group>
    </>
  );
};

const Bar: React.FC<{ x0: number; x1: number; y: number; p: number; color: string; o: number }> = ({ x0, x1, y, p, color, o }) => {
  const w = (x1 - x0) * p;
  if (w <= 0.001 || o <= 0.001) return null;
  return (
    <mesh position={[x0 + w / 2, y, 0.05]}>
      <boxGeometry args={[w, 0.035, 0.01]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={o} />
    </mesh>
  );
};

/* ---------- lights ---------- */
const Lights: React.FC<{ T: number }> = ({ T }) => {
  const { look } = camAt(T);
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(look[0], look[1], 0);
  target.updateMatrixWorld();
  const flick = 1 + 0.04 * Math.sin(T * 13.1) * Math.sin(T * 7.3 + 1);
  // darken the room while we sit on the lone dot
  const dark = 1 - 0.85 * easeInOut(prog(T, Z + 1.5, GAP)) * (1 - easeInOut(prog(T, R + 2.0, 86.2)));
  const flare = T >= R ? 1 + 1.8 * Math.exp(-(T - R) * 2.0) : 1;
  return (
    <>
      <primitive object={target} />
      <ambientLight intensity={0.12 * dark} color="#8a98c0" />
      <spotLight position={[look[0] + 1.8, look[1] + 3.6, 6.5]} target={target} angle={0.95} penumbra={0.85} decay={1.0}
        intensity={70 * dark * flick * flare} color="#ffc98a" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-bias={-0.0006} shadow-radius={14} shadow-blurSamples={20} />
      <pointLight position={[look[0] - 6, look[1] + 2.5, 3]} intensity={5 * dark} color="#6f7d91" decay={1.2} />
    </>
  );
};

/* ---------- scene ---------- */
const Scene: React.FC<{ T: number }> = ({ T }) => {
  // current success rate shown by the field
  let cur = 0, curK = 0;
  KS.forEach((q, i) => {
    if (T >= q.at) {
      const prev = i === 0 ? 0 : KS[i - 1].p;
      cur = lerp(prev, q.p, easeOut(prog(T, q.at, q.at + 0.3)));
      curK = q.k;
    }
  });
  const fieldO = easeOut(prog(T, 64.2, 65.2)) * (1 - easeInOut(prog(T, MOR, MOR + 0.9)));
  const fadeRest = 1 - prog(T, GAP, GAP + 0.55);
  const introO = easeOut(prog(T, G, G + 0.6));
  const swap = easeInOut(prog(T, MOR + 0.2, MOR + 0.9));
  const curveP = easeInOut(prog(T, MOR + 0.5, MOR + 2.5));
  const polyO = lerp(1, 0.3, prog(T, MOR + 0.5, MOR + 1.5)) * fadeRest * introO;
  const mx = lerp(0.08, 1 / Math.E, easeInOut(prog(T, MOR + 2.0, Z)));
  const my = -mx * Math.log(mx);
  const markO = easeOut(prog(T, MOR + 2.0, MOR + 2.4)) * (1 - prog(T, GAP - 0.4, GAP));
  const M = [XC(mx), YC(my), ZCH + 0.01];
  // the lone dot
  const breathe = 1 + 0.25 * Math.sin((T - GAP) * Math.PI * 1.1);
  const bloom = prog(T, R, R + 0.5);
  const dotO = prog(T, GAP - 0.4, GAP) * (1 - bloom) + easeOut(prog(T, 85.3, 85.6)) * (1 - prog(T, 86.5, 86.8));
  const fallK = easeInOut(prog(T, 85.35, 86.55));
  const dotPos = [lerp(PEAK[0], DIV_X, fallK), lerp(PEAK[1], strY(DIV_X) - 0.1, fallK), lerp(PEAK[2] + 0.02, 0.15, fallK)];
  const divP = easeOut(prog(T, 86.25, 86.9));
  const band = easeOut(prog(T, 86.45, 87.3));
  const chipO = easeOut(prog(T, STD, STD + 0.5)) * (1 - prog(T, SEAL + 0.8, SEAL + 1.2));
  const divTop = strY(DIV_X) - 0.06;
  const divBot = -1.45;
  return (
    <>
      <CamRig T={T} />
      <fog attach="fog" args={['#0f1016', 14, 48]} />
      <Lights T={T} />
      <mesh position={[0, 4, -1.7]} receiveShadow>
        <planeGeometry args={[90, 50]} />
        <meshStandardMaterial color="#262836" roughness={1} />
      </mesh>
      {/* the string world */}
      <RedString3 t={99} />
      {SCORES.map((_, i) => <RuleCard key={i} i={i} T={T} />)}
      <Dust3 t={T} />
      {/* ten thousand lives */}
      <Field T={T} cur={cur} o={fieldO} />
      <Label text="一万次人生　*●* 选中了最好的那位" pos={[F_CX, F_CY + 3.8, 0]} w={7} h={0.4} o={fieldO * introO} font={`500 40px ${ZH}`} />
      <Label text={curK ? `先看 *${curK}* 位　成功率 *${(cur * 100).toFixed(1)}%*` : ''} pos={[F_CX, F_CY - 3.85, 0]} w={7} h={0.5} o={fieldO * (curK ? 1 : 0)}
        color={C.paper} font={`500 52px ${ZH}`} />
      {/* chart */}
      <Board o={introO * fadeRest * (1 - easeOut(prog(T, Z, Z + 2.5)) * 0.65)} swap={swap} />
      {KS.map((q, i) => {
        const pp = prog(T, q.at, q.at + 0.25);
        if (pp <= 0 || polyO <= 0.001) return null;
        const pt = [XC(q.k / 10), YC(q.p), ZCH];
        const prevPt = i ? [XC(KS[i - 1].k / 10), YC(KS[i - 1].p), ZCH] : null;
        const lp = easeOut(prog(T, q.at, q.at + 0.25));
        return (
          <React.Fragment key={q.k}>
            <mesh position={pt as any} scale={lerp(2.2, 1, easeOut(pp))}>
              <sphereGeometry args={[0.07, 20, 14]} />
              {goldMat(polyO, 1.6)}
            </mesh>
            {prevPt && <Seg a={prevPt} b={[lerp(prevPt[0], pt[0], lp), lerp(prevPt[1], pt[1], lp), ZCH]} r={0.018} o={polyO} />}
          </React.Fragment>
        );
      })}
      <Curve p={curveP} o={fadeRest} />
      {markO > 0.001 && (
        <>
          <mesh position={M as any}>
            <torusGeometry args={[0.15, 0.014, 10, 40]} />
            {goldMat(markO, 1.6)}
          </mesh>
          <mesh position={M as any}>
            <sphereGeometry args={[0.055, 16, 12]} />
            {goldMat(markO, 2)}
          </mesh>
          <Dashes a={M} b={[M[0], YC(0), ZCH]} o={markO} />
          <Dashes a={M} b={[XC(0), M[1], ZCH]} o={markO} />
        </>
      )}
      {/* the lone dot, then it falls onto the string */}
      {dotO > 0.001 && (
        <>
          <mesh position={dotPos as any} scale={T < R + 0.6 ? Math.max(0.001, breathe * (1 - bloom)) : 1}>
            <sphereGeometry args={[0.07, 24, 16]} />
            {goldMat(dotO, 3)}
          </mesh>
          <Halo pos={[dotPos[0], dotPos[1], dotPos[2] - 0.01]} size={T < R + 0.6 ? 1.3 * breathe * (1 + bloom * 9) : 0.9} o={T < R + 0.6 ? 0.8 * (1 - bloom * bloom) * prog(T, GAP - 0.4, GAP) : 0.75 * dotO} />
          <pointLight position={[dotPos[0], dotPos[1], dotPos[2] + 0.6]} intensity={4 * dotO} color="#f0c878" distance={6} />
        </>
      )}
      {/* divider + phase bands */}
      {divP > 0 && <Seg a={[DIV_X, divTop, 0.12]} b={[DIV_X, lerp(divTop, divBot, divP), 0.12]} r={0.011} o={1} glow={1.6} />}
      <Bar x0={cx(0) - 0.5} x1={DIV_X - 0.1} y={-1.62} p={band} color="#6f7d91" o={1} />
      <Bar x0={DIV_X + 0.1} x1={cx(9) + 0.5} y={-1.62} p={band} color="#c9a45c" o={1} />
      <Label text="探索期 · 只看不选" pos={[(cx(0) - 0.5 + DIV_X) / 2, -1.92, 0.05]} w={3.6} h={0.36} o={band} color="#9aa8bd" font={`500 46px ${ZH}`} />
      <Label text="决定期 · 遇到更好的，就选" pos={[(DIV_X + cx(9) + 0.5) / 2, -1.92, 0.05]} w={6} h={0.36} o={band} color={C.gold} font={`500 46px ${ZH}`} />
      <Label text="标准：8分" pos={[cx(1), strY(cx(1)) + 0.42, 0.05]} w={1.6} h={0.34} o={chipO} color={C.goldHi} font={`600 48px ${ZH}`} />
    </>
  );
};

export const Reveal3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const T = RV_START + frame / fps;
  const qO = Math.min(easeOut(prog(T, RV_START + 0.05, RV_START + 0.8)), 1 - prog(T, G - 0.35, G + 0.05));
  const rO = 1 - prog(T, RS - 0.3, RS + 0.05);
  const tp = easeOut(prog(T, R, R + 0.7));
  const glow = T < R ? 0 : Math.min(prog(T, R, R + 0.2), 1) * lerp(0.5, 0.16, easeOut(prog(T, R + 0.2, R + 2.4)));
  const vig = 0.55 + 0.25 * easeInOut(prog(T, Z, GAP)) * (1 - prog(T, R, R + 1));
  const fadeIn = prog(T, RV_START, RV_START + 0.4);
  const fadeOut = 1 - prog(T, RV_END - 0.5, RV_END);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
        <ThreeCanvas width={width} height={height} shadows="variance" gl={{ antialias: true }}
          camera={{ fov: 34, near: 0.1, far: 120, position: [0, 0, 10] }} style={{ background: C.ink }}>
          <Scene T={T} />
        </ThreeCanvas>
        {qO > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', opacity: qO }}>
            <div style={{ fontFamily: ZH, fontSize: 76, fontWeight: 600, color: C.paper, letterSpacing: '0.12em', textShadow: '0 3px 18px rgba(0,0,0,0.9)' }}>
              如果人生可以<span style={{ color: C.gold }}>重来一万次</span>？
            </div>
            <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 36, color: C.dim, marginTop: 12 }}>What if you could live it ten thousand times?</div>
          </div>
        )}
        <Sub t={T} at={G + 0.35} out={MOR - 0.1} zh="先只看不选前 k 位，再选第一个更好的" en="Skip the first k. Then take the first one better than all of them." />
        <Sub t={T} at={Z} out={GAP - 0.05} zh="成功率最高的那个点，在——" en="The best strategy stops at…" />
        {T >= R - 0.05 && rO > 0 && (
          <AbsoluteFill style={{ opacity: rO }}>
            <Glow x={960} y={470} r={760} color="rgba(201,164,92,0.9)" opacity={glow} />
            <Dust t={T} at={R} cx={960} cy={470} seed="reveal3d" n={110} spread={620} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: prog(T, R, R + 0.18),
              transform: `scale(${lerp(1.14, 1, tp)})`, filter: `blur(${(1 - easeOut(prog(T, R, R + 0.45))) * 14}px)` }}>
              <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 380, lineHeight: 1, letterSpacing: '0.02em',
                backgroundImage: `linear-gradient(180deg, ${C.goldHi} 0%, ${C.gold} 55%, #9c7a3c 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text',
                color: 'transparent' }}>
                37%
              </span>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 648, textAlign: 'center', opacity: easeOut(prog(T, R + 1.5, R + 2.2)),
              fontFamily: EN, fontStyle: 'italic', fontSize: 34, color: C.dim, letterSpacing: '0.06em' }}>
              1 / e ≈ 36.8%
            </div>
          </AbsoluteFill>
        )}
        <Sub t={T} at={R + 0.95} out={RS - 0.1} zh="先看*37%*，再出手" en="Look at the first 37%. Then leap." y={860} size={60} />
        <Sub t={T} at={RS + 0.1} out={RULE2 - 0.1} zh="前*37%*：只看不选，建立你的标准" en="First 37%: just look. Learn what good means." />
        <Sub t={T} at={RULE2} out={RV_END + 1} zh="之后：遇到第一个比前面都好的，*就是Ta*" en="After that: the first one better than everyone before. That's them." />
      </AbsoluteFill>
      <Vignette strength={vig} />
      <Grain />
    </AbsoluteFill>
  );
};

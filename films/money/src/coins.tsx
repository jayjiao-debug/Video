import React, { useMemo } from 'react';
import * as THREE from 'three';
import { rnd } from './lib';
import { canvasTex } from './three-kit';

/* Square-holed cash coins (方孔圆钱), built here so the inscriptions are right for each era.
   Reading order: 半兩 and 五銖 read right then left; the 通寶 coins read top, bottom, right, left (直读).
   Sizes are typical diameters. */
export type CoinKind = 'banliang' | 'wuzhu' | 'kaiyuan' | 'huangsong' | 'yongle' | 'guangxu' | 'iron';
export const COINS: Record<CoinKind, { d: number; chars: [string, string, string, string]; rim: boolean; era: string; year: string }> = {
  banliang: { d: 0.032, chars: ['', '', '半', '兩'], rim: false, era: '秦 · 半两', year: '前221年' },
  wuzhu: { d: 0.025, chars: ['', '', '五', '銖'], rim: true, era: '汉 · 五铢', year: '前118年' },
  kaiyuan: { d: 0.025, chars: ['開', '元', '通', '寶'], rim: true, era: '唐 · 开元通宝', year: '621年' },
  huangsong: { d: 0.025, chars: ['皇', '宋', '通', '寶'], rim: true, era: '北宋 · 皇宋通宝', year: '1039年' },
  yongle: { d: 0.025, chars: ['永', '樂', '通', '寶'], rim: true, era: '明 · 永乐通宝', year: '1408年' },
  guangxu: { d: 0.023, chars: ['光', '緒', '通', '寶'], rim: true, era: '清 · 光绪通宝', year: '1875年' },
  iron: { d: 0.025, chars: ['', '', '', ''], rim: true, era: '北宋 · 铁钱', year: '' },
};

const GEO = new Map<CoinKind, THREE.ExtrudeGeometry>();
export const coinGeometry = (kind: CoinKind) => {
  if (GEO.has(kind)) return GEO.get(kind)!;
  const { d } = COINS[kind];
  const r = d / 2, h = d * 0.13;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, r, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.moveTo(-h, -h); hole.lineTo(-h, h); hole.lineTo(h, h); hole.lineTo(h, -h); hole.lineTo(-h, -h);
  shape.holes.push(hole);
  const t = d * 0.05;
  const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: t * 0.18, bevelSize: t * 0.18, bevelSegments: 2, curveSegments: 64 });
  g.translate(0, 0, -t / 2);
  g.rotateX(-Math.PI / 2); // lie flat, face up (+y); the top of the inscription points to -z
  g.computeVertexNormals();
  GEO.set(kind, g);
  return g;
};

type Tex = { map: THREE.Texture; bump: THREE.Texture };
const TEX = new Map<string, Tex>();
/** colour + bump for one face: raised rims and characters, worn high points, patina in the recesses */
export const coinTextures = (kind: CoinKind, metal: 'bronze' | 'iron' | 'gold') => {
  const key = `${kind}-${metal}`;
  if (TEX.has(key)) return TEX.get(key)!;
  const { chars, rim } = COINS[kind];
  const S = 1024, c = S / 2, R = S / 2;
  const glyphs = (g: CanvasRenderingContext2D, fill: string) => {
    g.fillStyle = fill; g.strokeStyle = fill;
    if (rim) {
      g.lineWidth = S * 0.035; g.beginPath(); g.arc(c, c, R * 0.93, 0, Math.PI * 2); g.stroke();
      const q = S * 0.155; g.lineWidth = S * 0.028; g.strokeRect(c - q, c - q, 2 * q, 2 * q);
    }
    g.font = `700 ${S * 0.2}px "Noto Serif CJK SC", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const off = S * 0.31;
    const [top, bottom, right, left] = chars;
    if (top) g.fillText(top, c, c - off);
    if (bottom) g.fillText(bottom, c, c + off);
    if (right) g.fillText(right, c + off, c + S * 0.01);
    if (left) g.fillText(left, c - off, c + S * 0.01);
  };
  const base = metal === 'gold' ? ['#b8862f', '#e2b45a', '#7a5418'] : metal === 'iron' ? ['#2b2522', '#4a3a30', '#5a3520'] : ['#5f4326', '#9a7244', '#3f5a44'];
  const map = canvasTex(S, S, (g) => {
    g.fillStyle = base[0]; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 9000; i++) {
      const k = rnd(i, 7);
      g.fillStyle = k < 0.55 ? `rgba(0,0,0,${0.05 + rnd(i, 8) * 0.12})` : k < 0.85 ? `${base[1]}${Math.floor(20 + rnd(i, 9) * 40).toString(16)}` : `${base[2]}${Math.floor(30 + rnd(i, 9) * 60).toString(16)}`;
      g.beginPath(); g.arc(rnd(i, 1) * S, rnd(i, 2) * S, 2 + rnd(i, 3) * (k > 0.85 ? 26 : 9), 0, Math.PI * 2); g.fill();
    }
    g.filter = 'blur(1.5px)';
    glyphs(g, base[1]);
    g.filter = 'none';
  });
  const bump = canvasTex(S, S, (g) => {
    g.fillStyle = '#5a5a5a'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${rnd(i, 4) > 0.5 ? '255,255,255' : '0,0,0'},${0.05 + rnd(i, 5) * 0.08})`; g.beginPath(); g.arc(rnd(i, 1) * S, rnd(i, 2) * S, 1 + rnd(i, 3) * 6, 0, Math.PI * 2); g.fill(); }
    g.filter = 'blur(3px)';
    glyphs(g, '#e8e8e8');
    g.filter = 'none';
  }, false);
  for (const t of [map, bump]) {
    const d = COINS[kind].d;
    t.repeat.set(1 / d, 1 / d); t.offset.set(0.5, 0.5);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  }
  const out = { map, bump };
  TEX.set(key, out);
  return out;
};

const MAT = new Map<string, THREE.MeshStandardMaterial>();
export const coinMaterial = (kind: CoinKind, metal: 'bronze' | 'iron' | 'gold' = 'bronze') => {
  const key = `${kind}-${metal}`;
  if (MAT.has(key)) return MAT.get(key)!;
  const { map, bump } = coinTextures(kind, metal);
  const m = new THREE.MeshStandardMaterial({
    map, bumpMap: bump, bumpScale: metal === 'iron' ? 3 : 4,
    metalness: metal === 'iron' ? 0.45 : 0.85, roughness: metal === 'gold' ? 0.3 : metal === 'iron' ? 0.85 : 0.5,
  });
  MAT.set(key, m);
  return m;
};

export const Coin: React.FC<{ kind: CoinKind; metal?: 'bronze' | 'iron' | 'gold'; position?: number[]; rotation?: number[]; scale?: number; env?: THREE.Texture | null; envI?: number }> = ({ kind, metal = 'bronze', position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const geo = useMemo(() => coinGeometry(kind), [kind]);
  const mat = useMemo(() => coinMaterial(kind, metal), [kind, metal]);
  return <mesh geometry={geo} material={mat} position={position as [number, number, number]} rotation={rotation as [number, number, number]} scale={scale} castShadow receiveShadow />;
};

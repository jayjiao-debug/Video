import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, camAt, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { Stage } from './stage';
import { CamRig } from './three-kit';
import { useAsset } from './useModels';
import { loadModel, materials } from './models';
import { Spot, softTex } from './kit';
import MAP from './map_eastasia.json';

/* S3, shells (b39–b64). Shang China, more than 3,000 years ago: cowries were money.
   A  b40–b49  cowries drop one by one onto a dark lacquered board under firelight and heap up (their own clock).
   B  b49–b57  the map: the shells came from the southern sea, ~1,450 km from the Shang capital at Anyang (straight line).
   C  b57–b64  財 貨 貴 賤: the four characters light up and the 贝 in each turns gold.
   Facts: cowries as Shang money, large finds at Yinxu (UNESCO, Yin Xu); distance Anyang–Guangzhou coast computed (估算). */
export const S3_IN = b(39), S3_OUT = b(64) + 0.35;

export const LINES_S3: Line[] = [
  [b(41) + 0.1, b(49) - 0.1, '三千多年前，商朝人用海贝当钱。', 'Over 3,000 years ago, the Shang used seashells as money.'],
  [b(49) + 0.06, b(57) - 0.1, '海贝来自遥远的南海，内陆很难得到。', 'Cowries came from the distant southern sea; inland, they were hard to get.'],
  [b(57) + 0.06, b(64) - 0.05, '所以「财、货、贵、贱」，都带一个[「贝」]。', 'That is why the words for wealth, goods, dear and cheap all contain 贝, "shell".'],
];

const N = 46;
const BOARD_Y = 0;
/** heap: rings of shells on a low mound, each with its own rest pose */
const HEAP = Array.from({ length: N }, (_, i) => {
  const ring = Math.floor(Math.sqrt(i * 1.6));
  const a = i * 2.39996 + rnd(i, 1) * 0.4;
  const r = 0.004 + 0.0058 * Math.sqrt(i) + rnd(i, 2) * 0.002;
  const h = Math.max(0, 0.022 - r * 0.45) + 0.003;
  return { p: [Math.cos(a) * r, BOARD_Y + h, Math.sin(a) * r * 0.85], ry: rnd(i, 3) * 6.28, rx: (rnd(i, 4) - 0.5) * 0.5 + (rnd(i, 5) > 0.75 ? Math.PI : 0), rz: (rnd(i, 6) - 0.5) * 0.4, ring };
});
// the order they fall in: centre first, so the heap grows outward and up; slow, then quicker (own clock)
const T0 = b(40) + 0.25, SPAN = b(48) - T0;
const DROP_AT = HEAP.map((_, i) => T0 + SPAN * Math.pow((i + 0.5) / N, 0.62));
const FALL = Math.sqrt((2 * 0.22) / 9.8);

const KEYS_A: Key[] = [
  [b(39), [0.07, 0.06, 0.2], [0, 0.01, 0]],
  [b(45), [0.02, 0.09, 0.2], [0, 0.008, 0]],
  [b(49), [-0.04, 0.13, 0.18], [0, 0.004, 0]],
];
const KEYS_C: Key[] = [
  [b(56), [0.0, 0.26, 0.16], [0, 0, 0]],
  [b(64) + 0.4, [0.0, 0.24, 0.14], [0, 0, 0]],
];

/** the scanned cowrie carries a museum number inked on its back; paint it out and warm the shell to ivory */
const loadShell = async () => {
  const g = await loadModel('cowrie');
  const mats = materials(g);
  for (const m of mats) {
    const img = m.map?.image as (ImageBitmap | HTMLImageElement) | undefined;
    if (img) {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d')!;
      x.drawImage(img, 0, 0);
      const w = img.width, h = img.height;
      // the label sits in the upper left of the atlas; cover it with the shell's own nearby colour, softly
      x.filter = 'blur(18px)';
      x.drawImage(c, w * 0.36, h * 0.3, w * 0.22, h * 0.12, w * 0.12, h * 0.06, w * 0.3, h * 0.16);
      x.filter = 'none';
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.flipY = m.map!.flipY; t.anisotropy = 8;
      m.map = t;
    }
    m.color = new THREE.Color('#fff1d6');
    m.roughness = 0.32;
    m.metalness = 0;
    m.needsUpdate = true;
  }
  return g;
};

const Shells: React.FC<{ T: number; shell: THREE.Group; still?: boolean }> = ({ T, shell }) => {
  const clones = useMemo(() => HEAP.map(() => shell.clone(true)), [shell]);
  return (
    <>
      {HEAP.map((s, i) => {
        const t = T - DROP_AT[i];
        if (t < 0) return null;
        let y = s.p[1], spin = 0;
        if (t < FALL) { y = s.p[1] + 0.22 - 0.5 * 9.8 * t * t; spin = 1 - t / FALL; }
        else { const tb = t - FALL; y = s.p[1] + 0.006 * Math.exp(-tb * 14) * Math.abs(Math.sin(tb * 30)); }
        return <primitive key={i} object={clones[i]} position={[s.p[0], y, s.p[2]]} rotation={[s.rx + spin * 2.5, s.ry + spin * 1.5, s.rz]} />;
      })}
    </>
  );
};

const Board: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
    const g = c.getContext('2d')!;
    g.fillStyle = '#1d0b06'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${rnd(i, 1) > 0.5 ? '60,20,10' : '8,3,2'},${0.15 + rnd(i, 2) * 0.25})`; g.lineWidth = 1 + rnd(i, 3) * 3; g.beginPath(); const y = rnd(i, 4) * 1024; g.moveTo(0, y); g.bezierCurveTo(300, y + (rnd(i, 5) - 0.5) * 40, 700, y + (rnd(i, 6) - 0.5) * 40, 1024, y + (rnd(i, 7) - 0.5) * 30); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
    return t;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial map={tex} roughness={0.6} metalness={0.05} color="#b08a72" />
    </mesh>
  );
};

const ShellSet: React.FC<{ T: number; keys: Key[]; shell: THREE.Group; dim?: number; focus: number; aperture: number }> = ({ T, keys, shell, dim = 1, focus, aperture }) => {
  // firelight: two layered flickers, never periodic
  const fl = 0.85 + 0.1 * Math.sin(T * 13.1) * Math.sin(T * 7.3 + 1) + 0.05 * Math.sin(T * 23.7);
  return (
    <Stage focus={focus} aperture={aperture} maxblur={0.012} bloom={0.35} threshold={0.9} seed={Math.floor(T * 30) % 97}>
      <CamRig T={T} keys={keys} fov={30} />
      <ambientLight intensity={0.02} color="#8090b0" />
      <Spot position={[-0.25, 0.32, 0.12]} target={[0, 0, 0]} angle={0.6} penumbra={0.9} intensity={1.0 * fl * dim} color="#ff9c50" near={0.05} far={2} />
      <pointLight position={[0.3, 0.25, -0.35]} intensity={0.02 * dim} decay={2} color="#6f8cff" />
      <Board />
      <Shells T={T} shell={shell} />
      {/* embers drifting up from the fire off screen left */}
      {Array.from({ length: 22 }, (_, i) => {
        const life = 3 + rnd(i, 1) * 2, ph = ((T + rnd(i, 2) * life) % life) / life;
        const s = 0.002 + rnd(i, 3) * 0.002;
        return (
          <sprite key={i} position={[-0.22 + rnd(i, 4) * 0.12 + ph * 0.05, 0.01 + ph * 0.25, -0.05 - rnd(i, 5) * 0.2]} scale={[s, s, s]}>
            <spriteMaterial map={softTex()} color="#ffa04a" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={dim * 0.9 * Math.sin(Math.PI * ph)} toneMapped={false} />
          </sprite>
        );
      })}
    </Stage>
  );
};

const dist = (keys: Key[], T: number, p: number[]) => {
  const { pos } = camAt(keys, T);
  return Math.hypot(pos[0] - p[0], pos[1] - p[1], pos[2] - p[2]);
};

/** B: the map, ink on dark paper, the route from the southern sea up to Anyang */
const MapB: React.FC<{ T: number }> = ({ T }) => {
  const t0 = b(49);
  const zoom = lerp(1.08, 1.0, easeOut(prog(T, t0 - 0.4, b(57))));
  const [ax, ay] = MAP.anyang as number[];
  const [cx, cy] = MAP.coast as number[];
  const [sx, sy] = MAP.sea as number[];
  // route: from the open sea, along the coast, inland and north to Anyang
  const route = `M${sx + 60},${sy + 10} C${sx + 20},${sy - 90} ${cx + 40},${cy + 40} ${cx},${cy} S${ax + 80},${ay + 260} ${ax},${ay}`;
  const draw = easeInOut(prog(T, t0 + 0.4, t0 + 2.6));
  const o = (a: number, d = 0.4) => easeOut(prog(T, a, a + d));
  const RL = 1400;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0907' }}>
      <svg width={1920} height={1080} style={{ transform: `scale(${zoom})`, transformOrigin: `${ax}px ${(ay + sy) / 2}px` }}>
        <defs>
          <radialGradient id="map-sea" cx="0.5" cy="0.6" r="0.75"><stop offset="0" stopColor="#14202a" /><stop offset="1" stopColor="#06090d" /></radialGradient>
          <radialGradient id="map-pool" cx={ax / 1920} cy={0.5} r="0.55"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.1" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" /></radialGradient>
          <filter id="map-soft"><feGaussianBlur stdDeviation="2" /></filter>
        </defs>
        <rect width={1920} height={1080} fill="url(#map-sea)" />
        <g fill="#2a2119" stroke="#6b5640" strokeWidth={1.2} strokeOpacity={0.55}>
          {(MAP.land as string[]).map((d, i) => <path key={i} d={d} />)}
        </g>
        <g fill="none" stroke="#5f7d8f" strokeWidth={1.6} strokeOpacity={0.45}>
          {(MAP.rivers as string[]).map((d, i) => <path key={i} d={d} />)}
        </g>
        <rect width={1920} height={1080} fill="url(#map-pool)" />
        {/* the route, drawn on, with shells travelling it */}
        <path d={route} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray={`${RL * draw} ${RL}`} strokeLinecap="round" opacity={0.9} />
        <path d={route} fill="none" stroke={GOLD} strokeWidth={10} strokeDasharray={`${RL * draw} ${RL}`} opacity={0.15} filter="url(#map-soft)" />
        {Array.from({ length: 5 }, (_, k) => {
          const p = (T - t0 - 1.0 - k * 0.5) / 3.2;
          if (p < 0 || p > 1) return null;
          return <ShellDot key={k} d={route} p={easeInOut(p)} o={Math.sin(Math.PI * p)} />;
        })}
        <circle cx={ax} cy={ay} r={9 * pop(T, t0 + 2.6)} fill={GOLD} />
        <circle cx={ax} cy={ay} r={9 + 30 * prog(T, t0 + 2.6, t0 + 3.6)} fill="none" stroke={GOLD} strokeOpacity={1 - prog(T, t0 + 2.6, t0 + 3.6)} />
        <g opacity={o(t0 + 0.2)} style={{ fontFamily: ZH }}>
          <text x={ax + 22} y={ay - 16} fontSize={40} fontWeight={700} fill={INK}>殷墟</text>
          <text x={ax + 22} y={ay + 22} fontSize={22} fill="rgba(243,237,226,0.6)">商朝都城 · 今河南安阳</text>
        </g>
        <g opacity={o(t0 + 0.5)} style={{ fontFamily: ZH }}>
          <text x={sx + 140} y={sy - 40} fontSize={40} fontWeight={700} fill="#9fc3d6" letterSpacing="0.3em">南 海</text>
        </g>
        <g opacity={o(t0 + 3.0)} style={{ fontFamily: ZH }}>
          <text x={cx - 290} y={(ay + cy) / 2 + 40} fontSize={30} fill={GOLD} fontWeight={700}>直线约 1400 公里</text>
          <text x={cx - 290} y={(ay + cy) / 2 + 74} fontSize={20} fill="rgba(243,237,226,0.5)">安阳 → 南海海岸（估算）</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** a small cowrie icon riding along an SVG path (position from getPointAtLength-like sampling of a cubic chain) */
const ShellDot: React.FC<{ d: string; p: number; o: number }> = ({ d, p, o }) => {
  const pt = useMemo(() => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d);
    return el;
  }, [d]);
  const L = pt.getTotalLength();
  const q = pt.getPointAtLength(L * p), q2 = pt.getPointAtLength(Math.min(L, L * p + 2));
  const ang = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${q.x},${q.y}) rotate(${ang})`} opacity={o}>
      <ellipse rx={13} ry={9} fill="#f3e6c8" />
      <path d="M-9,0 L9,0" stroke="#5a4630" strokeWidth={2} />
      {[-6, -2, 2, 6].map((x) => <path key={x} d={`M${x},-2 L${x},2`} stroke="#5a4630" strokeWidth={1.2} />)}
    </g>
  );
};

/** C: 財 貨 貴 賤, the 贝 part of each turning gold. The region of the radical: left part (財 賤) or bottom part (貨 貴). */
const CHARS: [string, 'left' | 'bottom', string][] = [['财', 'left', '财富'], ['货', 'bottom', '货物'], ['贵', 'bottom', '昂贵'], ['贱', 'left', '低贱']];
const Radicals: React.FC<{ T: number }> = ({ T }) => {
  const t0 = b(57);
  const size = 210, gap = 330, y0 = 470;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        {CHARS.map(([, part], i) => {
          const x = 960 + (i - 1.5) * gap;
          return (
            <clipPath key={i} id={`rad-${i}`}>
              {part === 'left' ? <rect x={x - size * 0.52} y={y0 - size} width={size * 0.4} height={size * 1.3} /> : <rect x={x - size * 0.6} y={y0 - size * 0.42} width={size * 1.2} height={size * 0.7} />}
            </clipPath>
          );
        })}
      </defs>
      {CHARS.map(([ch, , gloss], i) => {
        const x = 960 + (i - 1.5) * gap;
        const at = t0 + 0.15 + i * 0.32; // one after another, quick (own clock)
        const o = easeOut(prog(T, at, at + 0.35));
        const gold = easeInOut(prog(T, b(61), b(61) + 0.6));
        return (
          <g key={i} opacity={o} transform={`translate(0,${(1 - o) * 18})`}>
            <text x={x} y={y0} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size }} fill="rgba(243,237,226,0.9)">{ch}</text>
            <g clipPath={`url(#rad-${i})`} opacity={gold}>
              <text x={x} y={y0} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, filter: 'drop-shadow(0 0 18px rgba(246,207,120,0.6))' }} fill={GOLD}>{ch}</text>
            </g>
            <text x={x} y={y0 + 90} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 30, letterSpacing: '0.2em' }} fill="rgba(243,237,226,0.55)" opacity={easeOut(prog(T, at + 0.3, at + 0.7))}>{gloss}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const S3: React.FC<{ T: number }> = ({ T }) => {
  const shell = useAsset('shell', loadShell);
  if (T < S3_IN || T > S3_OUT || !shell) return null;
  const o = easeOut(prog(T, S3_IN, S3_IN + 0.5)) * (1 - easeIn(prog(T, S3_OUT - 0.35, S3_OUT)));
  const shot = T < b(49) ? 'A' : T < b(57) ? 'B' : 'C';
  const mapIn = easeInOut(prog(T, b(49) - 0.3, b(49) + 0.15));
  const cIn = easeInOut(prog(T, b(57) - 0.3, b(57) + 0.15));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      {shot === 'A' && <ShellSet T={T} keys={KEYS_A} shell={shell} focus={dist(KEYS_A, T, [0, 0.01, 0])} aperture={0.05} />}
      {shot === 'A' && mapIn > 0 && <AbsoluteFill style={{ opacity: mapIn }}><MapB T={T} /></AbsoluteFill>}
      {shot === 'B' && <MapB T={T} />}
      {shot === 'B' && cIn > 0 && <AbsoluteFill style={{ opacity: cIn, backgroundColor: '#05060b' }} />}
      {shot === 'C' && <ShellSet T={T} keys={KEYS_C} shell={shell} dim={0.55} focus={0.05} aperture={0.08} />}
      {shot === 'C' && <AbsoluteFill style={{ backgroundColor: 'rgba(5,6,11,0.55)' }} />}
      {shot === 'C' && <Radicals T={T} />}
      <Chapter T={T} at={b(40) + 0.3} out={b(49)} text="约公元前1300年 · 商" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S3} />
    </AbsoluteFill>
  );
};

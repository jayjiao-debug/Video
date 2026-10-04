import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill } from 'remotion';
import { useThree } from '@react-three/fiber';
import { b, bf, prog, easeOut, easeInOut, lerp, EN, ZH, beats } from './lib';
import { Stage } from './stage';
import { Bill, EnvFor, Spot, loadBillTex } from './kit';
import { Coin, coinMaterial } from './coins';
import { useAsset } from './useModels';

/* Title card (b30–b40; stamped on the full-strength hit b32 = 16.61 s, out on the hit b40 = 20.68 s).
   The cold open ends looking straight down on the note. The card keeps that note, alone under one lamp,
   and a gold 半两 coin drops onto it on b32 while the title is stamped above, one character per half beat. */
export const T_IN = b(30), T_OUT = b(40);
const half = (beats[33] - beats[32]) / 2;

export const GoldTitle: React.FC<{ text: string; T: number; at: number; size: number; y: number; x?: number; id?: string }> = ({ text, T, at, size, y, x = 960, id = 'gt' }) => {
  const chars = [...`《${text}》`];
  const width = chars.length * size * 0.98;
  const sweep = lerp(-760, 760, easeInOut(prog(T, at + chars.length * half + 0.4, at + chars.length * half + 1.4)));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
        </linearGradient>
        <linearGradient id={`${id}-sweep`} x1={x + sweep - 120} y1="0" x2={x + sweep + 120} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {([`${id}-metal`, `${id}-sweep`] as const).map((fill) => (
        <text key={fill} y={y} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, letterSpacing: '0.04em' }}>
          {chars.map((ch, i) => {
            const at_i = at + i * half;
            const p = easeOut(prog(T, at_i, at_i + 0.22));
            return <tspan key={i} x={x - width / 2 + (i + 0.5) * (width / chars.length)} fill={`url(#${fill})`} opacity={p}>{ch}</tspan>;
          })}
        </text>
      ))}
    </g>
  );
};

const TopCam: React.FC<{ h: number; look: number; x?: number }> = ({ h, look, x = 0 }) => {
  const { camera } = useThree();
  camera.position.set(x, h, look + 0.0005);
  camera.up.set(0, 0, -1);
  camera.lookAt(x, 0, look);
  (camera as THREE.PerspectiveCamera).near = 0.01;
  camera.updateProjectionMatrix();
  return null;
};

const G = 9.8;
/** the coin: dropped from `h0` so that it lands exactly at `land`, one small bounce, then still */
const coinY = (T: number, land: number, h0 = 0.12) => {
  const tf = Math.sqrt((2 * h0) / G);
  const t = T - (land - tf);
  if (t < 0) return h0;
  if (t < tf) return h0 - 0.5 * G * t * t;
  const tb = t - tf, up = 0.9; // bounce: 9 mm, 2 × 43 ms
  const tu = 2 * Math.sqrt((2 * up * 0.01) / G);
  return tb < tu ? Math.max(0, Math.sqrt(2 * G * up * 0.01) * tb - 0.5 * G * tb * tb) : 0;
};

/** the episode motif in 3D: a $100 note under a lamp with a gold 半两 lying on it */
export const CoinOnBill: React.FC<{ T: number; land: number; h: number; look: number; light?: number; seed?: number }> = ({ T, land, h, look, light = 1 }) => {
  const tex = useAsset('billtex', loadBillTex);
  if (!tex) return null;
  const y = coinY(T, land);
  const tilt = T < land ? 0.35 * (1 - prog(T, land - 0.3, land)) : 0;
  return (
    <Stage bloom={0.3} threshold={0.95} exposure={1} seed={Math.floor(T * 30) % 97} fov={30} bg="#05060b">
      <TopCam h={h} look={look} />
      <ambientLight intensity={0.02} />
      <Spot position={[-0.05, 0.6, 0.08]} target={[0.01, 0, 0]} angle={0.32} penumbra={0.85} intensity={0.8 * light} color="#ffc98c" near={0.1} far={2} />
      <pointLight position={[0.3, 0.12, -0.3]} intensity={0.08 * light} decay={2} color="#7f9cff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0006, 0]} receiveShadow>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#120d0a" roughness={0.95} />
      </mesh>
      <Bill tex={tex} position={[0, 0.0004, 0]} rotation={[0, 0.06, 0]} curl={0.003} />
      <Coin kind="banliang" metal="gold" position={[0.042, 0.0026 + y, 0.008]} rotation={[tilt, 0.3, tilt * 0.6]} />
      <EnvFor mats={[coinMaterial('banliang', 'gold')]} intensity={0.45} />
    </Stage>
  );
};

export const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < T_IN || T > T_OUT) return null;
  const inO = easeOut(prog(T, T_IN, T_IN + 0.5));
  const out = easeInOut(prog(T, b(39), T_OUT));
  const o = (a: number, d = 0.5) => easeOut(prog(T, a, a + d));
  // the lamp comes up under the fade-in; a slow push after the hit
  const light = easeOut(prog(T, T_IN + 0.2, bf(31.5)));
  const h = lerp(0.4, 0.365, easeInOut(prog(T, b(32), T_OUT)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b', opacity: inO * (1 - out) }}>
      <CoinOnBill T={T} land={b(32)} h={h} look={-0.024} light={light} />
      {/* keep the type clear of the set: dark at the top, dark under the tagline */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,6,11,0.92) 0%, rgba(5,6,11,0.55) 30%, rgba(5,6,11,0) 44%, rgba(5,6,11,0) 74%, rgba(5,6,11,0.8) 88%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <text x={960} y={150} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(b(32) + 0.2)}>MONEY · FROM SHELLS TO CODE</text>
        <GoldTitle text="钱凭什么" T={T} at={b(32)} size={150} y={330} />
        <text x={960} y={940} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 48, fill: '#f3ede2', letterSpacing: '0.06em' }} opacity={o(b(35))}>一张纸，凭什么能换一顿饭？</text>
        <text x={960} y={990} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 28, fill: 'rgba(243,237,226,0.55)' }} opacity={o(b(35) + 0.3)}>A slip of paper buys a meal. Why?</text>
      </svg>
    </AbsoluteFill>
  );
};

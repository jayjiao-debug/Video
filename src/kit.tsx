/* 镭射纸雕 · the shared kit: foil text, the mirror floor, the velvet backdrop, light beams, confetti, curtains. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { Cut, holoMat, mat, rect, rays } from './foil';

/* ------------------------------------------------------------------ text as foil / paper / ink */
const textCache = new Map<string, { tex: THREE.CanvasTexture; w: number; h: number }>();
/** draws text on a transparent canvas; returns the texture and its aspect */
export const textTex = (text: string, font: string, px: number, color = '#ffffff', pad = 0.2) => {
  const key = `${text}|${font}|${px}|${color}`; const hit = textCache.get(key); if (hit) return hit;
  const lines = text.split('\n'); const c = document.createElement('canvas'); const g = c.getContext('2d')!;
  g.font = `${font} ${px}px "Noto Serif CJK SC", "Noto Sans CJK SC", serif`;
  const w = Math.max(...lines.map((l) => g.measureText(l).width)) + px * pad * 2, h = px * 1.25 * lines.length + px * pad * 2;
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  g.font = `${font} ${px}px "Noto Serif CJK SC", "Noto Sans CJK SC", serif`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, px * pad + px * 1.25 * (i + 0.5)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const r = { tex, w, h }; textCache.set(key, r); return r;
};
/** a word in space. kind: holo (rainbow foil), gold (metal), ink (dark on nothing), cream (paper white), glow */
export const Word: React.FC<{ text: string; size: number; kind?: 'holo' | 'gold' | 'cream' | 'glow' | 'ink'; weight?: string; color?: string; glow?: number } & JSX.IntrinsicElements['group']> =
  ({ text, size, kind = 'holo', weight = '900', color, glow = 1, ...g }) => {
    const t = useMemo(() => textTex(text, weight, 160), [text, weight]);
    const m = useMemo(() => {
      if (kind === 'holo') return holoMat(color ?? '#ffffff', 1.1, t.tex);
      if (kind === 'gold') return new THREE.MeshPhysicalMaterial({ color: color ?? '#f0c46a', metalness: 1, roughness: 0.22, alphaMap: t.tex, transparent: true, iridescence: 0.4, iridescenceIOR: 1.4, emissive: new THREE.Color('#3a2408'), emissiveIntensity: 0.5, side: THREE.DoubleSide, depthWrite: false });
      if (kind === 'glow') return new THREE.MeshBasicMaterial({ color: new THREE.Color(color ?? '#ffffff').multiplyScalar(glow), alphaMap: t.tex, transparent: true, toneMapped: false, depthWrite: false });
      return new THREE.MeshBasicMaterial({ color: color ?? (kind === 'ink' ? '#1d1a16' : '#f3ede2'), alphaMap: t.tex, transparent: true, depthWrite: false });
    }, [t, kind, color, glow]);
    const rim = useMemo(() => (kind === 'gold' ? holoMat('#ffffff', 1.3, textTex(text, weight, 160).tex) : null), [kind, text, weight]);
    const h = size, w = (size * t.w) / t.h;
    return <group {...g}>
      {rim && <mesh material={rim} position={[0.004 * size * 10, -0.004 * size * 10, -0.004]} scale={1.015}><planeGeometry args={[w, h]} /></mesh>}
      <mesh material={m}><planeGeometry args={[w, h]} /></mesh>
    </group>;
  };
/** a paper card with printed lines (price tag, notice, court file) */
export const PaperCard: React.FC<{ w: number; h: number; lines: [string, number, string?, string?][]; paper?: string } & JSX.IntrinsicElements['group']> = ({ w, h, lines, paper = '#efe6d2', ...g }) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); const S = 1024 / Math.max(w, h); c.width = Math.round(w * S); c.height = Math.round(h * S); const x = c.getContext('2d')!;
    x.fillStyle = paper; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
    x.strokeStyle = 'rgba(160,120,50,0.9)'; x.lineWidth = c.width * 0.012; x.strokeRect(c.width * 0.04, c.height * 0.04, c.width * 0.92, c.height * 0.92);
    let y = 0; const total = lines.reduce((s, l) => s + l[1] * 1.3, 0) * c.height; y = (c.height - total) / 2;
    lines.forEach(([t, k, font, col]) => { const px = k * c.height; y += px * 1.0; x.font = `${font ?? '900'} ${px}px "Noto Serif CJK SC", serif`; x.fillStyle = col ?? '#1d1a16'; x.textAlign = 'center'; x.fillText(t, c.width / 2, y); y += px * 0.3; });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }, [w, h, paper]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group {...g}><mesh castShadow receiveShadow><boxGeometry args={[w, h, 0.003]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh></group>;
};

/* ------------------------------------------------------------------ the stage */
/** a black mirror floor: real reflections of the foil above it */
export const MirrorFloor: React.FC<{ size?: number; tint?: string } & JSX.IntrinsicElements['group']> = ({ size = 14, tint = '#2a2a33', ...g }) => {
  const r = useMemo(() => { const m = new Reflector(new THREE.PlaneGeometry(size, size), { textureWidth: 1024, textureHeight: 1024, color: new THREE.Color(tint), clipBias: 0.003 }); m.rotation.x = -Math.PI / 2; return m; }, [size, tint]);
  return (
    <group {...g}>
      <primitive object={r} />
      {/* a faint velvet sheen over the mirror so it reads as a lacquered floor, not a hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0015, 0]}><planeGeometry args={[size, size]} /><meshBasicMaterial color="#030208" transparent opacity={0.62} depthWrite={false} /></mesh>
    </group>
  );
};
/** the velvet wall behind a set, with an optional foil sunburst */
export const Backdrop: React.FC<{ z?: number; burst?: 'holo' | 'gold' | 'none'; burstY?: number; n?: number; glow?: number } & JSX.IntrinsicElements['group']> = ({ z = -1.6, burst = 'holo', burstY = 0.3, n = 44, glow = 0.4, ...g }) => (
  <group {...g}>
    <Cut d={rect(-6000, -3000, 12000, 3200)} kind="black" position={[0, -0.2, z]} shadow={false} />
    {burst !== 'none' && <Cut d={rays(n, 260, 3200, Math.PI * 1.08, Math.PI * 1.92, 0.0045)} kind={burst} glow={burst === 'holo' ? glow - 1 : 0} position={[0, burstY, z + 0.04]} shadow={false} />}
  </group>
);
/** a visible beam of light (additive cone) */
const coneTex = (() => { let t: THREE.Texture | null = null; return () => t ?? (t = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); const x = new THREE.CanvasTexture(c); return x; })()); })();
export const Beam: React.FC<{ from: [number, number, number]; len: number; r: number; o?: number; color?: string; tilt?: [number, number] }> = ({ from, len, r, o = 0.08, color = '#ffe6bf', tilt = [0, 0] }) => (
  <group position={from} rotation={[tilt[0], 0, tilt[1]]}>
    <mesh position={[0, -len / 2, 0]}><cylinderGeometry args={[0.015, r, len, 48, 1, true]} /><meshBasicMaterial map={coneTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
  </group>
);
/** foil confetti / glints drifting in a volume (deterministic) */
export const Confetti: React.FC<{ n?: number; box: [number, number, number]; center?: [number, number, number]; T: number; fall?: number; seed?: number }> = ({ n = 40, box, center = [0, 0.5, 0], T, fall = 0.03, seed = 1 }) => (
  <group position={center}>
    {Array.from({ length: n }, (_, i) => {
      const h = (k: number) => { const s = Math.sin((i + 1) * (k + seed) * 12.9898) * 43758.5453; return s - Math.floor(s); };
      const y = ((h(2) * box[1] - T * fall * (0.5 + h(5))) % box[1] + box[1]) % box[1] - box[1] / 2;
      return <Cut key={i} d={i % 3 ? 'M 0 -9 L 7 0 L 0 9 L -7 0 Z' : 'M -6 -6 L 6 -6 L 6 6 L -6 6 Z'} kind={i % 4 ? 'holo' : 'gold'} depth={0.0006} bevel={0} shadow={false}
        position={[(h(1) - 0.5) * box[0], y, (h(3) - 0.5) * box[2]]} rotation={[T * (0.4 + h(6)) + h(7) * 6, T * 0.7 * h(8) + h(9) * 6, h(4) * 6]} scale={0.8 + h(10) * 1.2} />;
    })}
  </group>
);
/** theatre curtains framing a set: black velvet cut-outs with a gold trim, in front of everything */
export const Curtains: React.FC<{ w?: number; h?: number; z?: number } & JSX.IntrinsicElements['group']> = ({ w = 2.6, h = 2.2, z = 0.6, ...g }) => {
  const side = (s: number) => `M ${s * w * 500} ${-h * 1000} L ${s * (w * 500 + 900)} ${-h * 1000} L ${s * (w * 500 + 900)} 0 L ${s * w * 500 + s * 60} 0 Q ${s * w * 500 - s * 120} ${-h * 500} ${s * w * 500} ${-h * 1000} Z`;
  return (
    <group {...g} position={[g.position ? (g.position as number[])[0] : 0, 0, z]}>
      <Cut d={side(-1)} kind="black" />
      <Cut d={side(1)} kind="black" />
      <Cut d={rect(-w * 500 - 900, -h * 1000 - 160, w * 1000 + 1800, 200)} kind="black" />
      <Cut d={rect(-w * 500 - 900, -h * 1000 + 30, w * 1000 + 1800, 14)} kind="gold" position={[0, 0, 0.008]} />
    </group>
  );
};
export const _m = mat;

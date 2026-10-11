import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Note, Line, CAST, Avatar, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';

/* S4, b96 -> b124 (the quiet section): why so close? Each layer of friends multiplies. Illustrative numbers. */
export const S4_IN = b(96), S4_OUT = b(124.2);
const W1 = b(104.3), W2 = b(111.3), W3 = b(118.2), W4 = b(119.4), FOV = 40;
const LINES: Line[] = [
  [S4_IN + 0.3, b(104) - 0.08, '为什么会这么近？', 'Why so close?'],
  [b(104) + 0.06, b(111) - 0.08, '假设每人认识[100]个人', 'Say everyone knows 100 people.'],
  [b(111) + 0.06, b(118) - 0.08, '隔一个人，就是[1万]人', 'One person away: 10,000 people.'],
  [b(118) + 0.06, S4_OUT - 0.15, '隔三个人，就是[1亿]人', 'Three people away: 100 million.'],
];
const SH = [
  { n: 100, r: 4.2, at: W1, size: 0.55, c: [1.0, 0.85, 0.5] },
  { n: 2400, r: 10, at: W2, size: 0.38, c: [0.95, 0.9, 0.78] },
  { n: 14000, r: 19, at: W3, size: 0.32, c: [0.75, 0.82, 1.0] },
  { n: 42000, r: 31, at: W4, size: 0.3, c: [0.55, 0.68, 0.98] },
];
const VERT = `attribute float size; attribute vec3 color; attribute float born; varying vec3 vC; varying float vA; uniform float uScale; uniform float uT;
void main(){ vC = color; float k = clamp((uT - born) / 0.45, 0.0, 1.0); vA = k; vec3 p = position * (0.55 + 0.45 * k);
 vec4 mv = modelViewMatrix * vec4(p,1.0); gl_PointSize = clamp(size * uScale / -mv.z, 1.0, 30.0) * k; gl_Position = projectionMatrix * mv; }`;
const FRAG = `varying vec3 vC; varying float vA; void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p); if (r > 0.5) discard;
 gl_FragColor = vec4(vC, vA * smoothstep(0.5, 0.1, r)); }`;

const camDist = (T: number) => {
  let d = 9;
  d = zlerp(d, 22, easeInOut(prog(T, W1 - 0.2, W1 + 1.6)));
  d = zlerp(d, 40, easeInOut(prog(T, W2 - 0.2, W2 + 1.6)));
  d = zlerp(d, 110, easeInOut(prog(T, W3 - 0.2, W4 + 2.2)));
  return d;
};
const Field: React.FC<{ T: number }> = ({ T }) => {
  const { camera, size } = useThree();
  const geo = useMemo(() => {
    const r = mulberry(100);
    const total = SH.reduce((s, x) => s + x.n, 0);
    const pos = new Float32Array(total * 3), col = new Float32Array(total * 3), sz = new Float32Array(total), born = new Float32Array(total);
    let i = 0;
    SH.forEach((sh) => {
      for (let k = 0; k < sh.n; k++, i++) {
        const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(sh.r * (0.82 + 0.36 * r()));
        pos.set([v.x, v.y, v.z], i * 3); col.set(sh.c, i * 3); sz[i] = sh.size * (0.7 + 0.6 * r());
        born[i] = sh.at + (v.length() / sh.r) * 0.5 + r() * 0.6;
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sz, 1)); g.setAttribute('born', new THREE.BufferAttribute(born, 1));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 1 }, uT: { value: 0 } } }), []);
  // links: you -> first ring; first ring -> some of the second ring
  const links = useMemo(() => {
    const p = geo.getAttribute('position') as THREE.BufferAttribute;
    const a: number[] = [], c: number[] = [];
    for (let k = 0; k < 100; k++) { a.push(0, 0, 0, p.getX(k), p.getY(k), p.getZ(k)); c.push(1, 0.85, 0.5, 1, 0.85, 0.5); }
    const g1 = new THREE.BufferGeometry(); g1.setAttribute('position', new THREE.Float32BufferAttribute(a, 3));
    const b2: number[] = [];
    for (let k = 0; k < 900; k++) { const j = 100 + k; const f = Math.floor((k * 37) % 100); b2.push(p.getX(f), p.getY(f), p.getZ(f), p.getX(j), p.getY(j), p.getZ(j)); }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(b2, 3));
    return [g1, g2];
  }, [geo]);
  const lm1 = useMemo(() => new THREE.LineBasicMaterial({ color: '#f6cf78', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const lm2 = useMemo(() => new THREE.LineBasicMaterial({ color: '#c9d6f5', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  mat.uniforms.uScale.value = size.height / (2 * Math.tan((FOV * Math.PI) / 360));
  mat.uniforms.uT.value = T;
  lm1.opacity = 0.4 * easeOut(prog(T, W1, W1 + 0.8)) * (1 - 0.6 * prog(T, W3, W4));
  lm2.opacity = 0.14 * easeOut(prog(T, W2, W2 + 0.8)) * (1 - 0.6 * prog(T, W3, W4));
  const d = camDist(T), ang = 0.05 * (T - S4_IN) + 0.4;
  camera.position.set(d * Math.sin(ang), d * 0.28, d * Math.cos(ang)); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  return (
    <>
      <lineSegments geometry={links[0]} material={lm1} />
      <lineSegments geometry={links[1]} material={lm2} />
      <points geometry={geo} material={mat} />
    </>
  );
};

export const ShellsScene: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  if (T < S4_IN - 0.05 || T > S4_OUT + 0.05) return null;
  const o = Math.min(easeOut(prog(T, S4_IN - 0.05, S4_IN + 0.6)), 1 - prog(T, S4_OUT - 0.4, S4_OUT));
  const d = camDist(T);
  const avR = clamp(46 * (9 / d), 6, 46);
  const tiers: [number, string, string][] = [[W1, '100', '你认识的人'], [W2, '1 万', '隔一个人'], [W3, '100 万', '隔两个人'], [W4, '1 亿', '隔三个人']];
  const cur = tiers.filter(([a]) => T >= a + 0.1).pop();
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 48%, #121a33 0%, #070a14 72%)' }} />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: FOV, near: 0.1, far: 2000, position: [0, 0, 20] }}>
        <Field T={T} />
      </ThreeCanvas>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform="translate(960 540)">
          <circle r={avR * 1.4} fill={GOLD} opacity={0.15} />
          <Avatar who={CAST[0]} mood="calm" r={avR} ring={GOLD} ringW={3} id="s4zh" bg="#2a3348" />
          {avR > 30 && <text y={avR + 40} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: GOLD }}>你</text>}
        </g>
      </svg>
      {cur && (
        <div style={{ position: 'absolute', right: 80, top: 110, textAlign: 'right' }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 96, lineHeight: 1, ...GOLD_TEXT }}>{cur[1]}<span style={{ fontFamily: ZH, fontSize: 40, color: 'rgba(243,237,226,0.8)', textShadow: 'none' }}> 人</span></div>
          <div style={{ fontFamily: ZH, fontSize: 26, color: 'rgba(243,237,226,0.7)', marginTop: 10, letterSpacing: '0.1em' }}>{cur[2]}</div>
        </div>
      )}
      <Chapter T={T} at={S4_IN + 0.4} out={S4_OUT - 0.3} text="为 什 么 这 么 近" />
      <Note T={T} at={W1 + 0.5} out={S4_OUT - 0.2} text="示意：假设每人认识 100 人。现实中朋友圈互相重叠，人数会少得多，但增长同样惊人" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

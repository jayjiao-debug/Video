import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { b, D, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Stat, Note, Line, CAST, Avatar, GOLD, NIGHT, ZH, EN } from './ui6';
import { GoldTitle } from '../brand/Brand';
import { Vignette, Grain } from '../ui';

/* S2, b32 -> b57: out of 小张's avatar into a 3D social network (illustrative), Facebook 2011 numbers, title card. */
export const S2_IN = b(32), S2_OUT = b(57.4);
const RECOLOR = b(40) + 0.15, TITLE = b(50), FOV = 40;
const LINES: Line[] = [
  [S2_IN + 0.12, b(40) - 0.08, '2011年，7.21亿人的关系网', '2011: a network of 721 million people.'],
  [b(40) + 0.06, TITLE - 0.1, '[92.7%]的人，朋友的平均好友数比自己多', 'For 92.7% of them, their friends average more friends than they have.'],
];
const G = D.galaxy;
const N: number = G.d.length;
const ZH_I: number = G.zh;
const ZP = new THREE.Vector3(G.p[ZH_I * 3], G.p[ZH_I * 3 + 1], G.p[ZH_I * 3 + 2]);
const OUTDIR = ZP.clone().normalize().add(new THREE.Vector3(0.15, 0.32, 0)).normalize();
const MAXD = (() => { let m = 0; for (let i = 0; i < N; i++) m = Math.max(m, Math.hypot(G.p[i * 3] - ZP.x, G.p[i * 3 + 1] - ZP.y, G.p[i * 3 + 2] - ZP.z)); return m; })();

export const camAt = (T: number) => {
  const k = easeInOut(prog(T, S2_IN, b(40)));
  const dist = zlerp(0.9, 118, k) * (1 - 0.22 * easeInOut(prog(T, b(55.2), S2_OUT)));
  const target = new THREE.Vector3().lerpVectors(ZP, new THREE.Vector3(0, 0, 0), easeInOut(prog(T, S2_IN + 0.4, b(42))));
  const ang = 0.045 * (T - S2_IN); // slow orbit on its own clock
  const dir = OUTDIR.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
  return { pos: target.clone().add(dir.multiplyScalar(dist)), target };
};

const VERT = `
attribute float size; attribute vec3 color; varying vec3 vC; uniform float uScale;
void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(size * uScale / -mv.z, 1.6, 46.0); gl_Position = projectionMatrix * mv; }`;
const FRAG = `
varying vec3 vC; uniform float uOpacity;
void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p); if (r > 0.5) discard;
 float core = smoothstep(0.5, 0.18, r); float halo = smoothstep(0.5, 0.0, r);
 gl_FragColor = vec4(vC * (0.55 * halo + 0.9 * core), uOpacity * (0.35 * halo + 0.75 * core)); }`;

const BASE = new THREE.Color('#e8dcc4'), BL = new THREE.Color('#5f82c8'), GD = new THREE.Color('#ffc964');
const Net: React.FC<{ T: number; fade: number }> = ({ T, fade }) => {
  const { camera, size } = useThree();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(G.p), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(N), 1));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uScale: { value: 1 }, uOpacity: { value: 1 } } }), []);
  const lines = useMemo(() => {
    const e: number[] = G.e, pos = new Float32Array(e.length * 3);
    for (let i = 0; i < e.length; i++) { pos[i * 3] = G.p[e[i] * 3]; pos[i * 3 + 1] = G.p[e[i] * 3 + 1]; pos[i * 3 + 2] = G.p[e[i] * 3 + 2]; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g;
  }, []);
  const lmat = useMemo(() => new THREE.LineBasicMaterial({ color: '#c9d6f5', transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const mine = useMemo(() => {
    const pts: number[] = [];
    const e: number[] = G.e;
    for (let i = 0; i < e.length; i += 2) if (e[i] === ZH_I || e[i + 1] === ZH_I) pts.push(...[e[i], e[i + 1]].flatMap((n) => [G.p[n * 3], G.p[n * 3 + 1], G.p[n * 3 + 2]]));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3)); return g;
  }, []);
  const mmat = useMemo(() => new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.9 }), []);

  // per-frame colours and sizes: a recolour sweep travels out from 小张
  const col = geo.getAttribute('color') as THREE.BufferAttribute, sz = geo.getAttribute('size') as THREE.BufferAttribute;
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const dd = Math.hypot(G.p[i * 3] - ZP.x, G.p[i * 3 + 1] - ZP.y, G.p[i * 3 + 2] - ZP.z) / MAXD;
    const k = easeOut(prog(T, RECOLOR + dd * 0.9, RECOLOR + dd * 0.9 + 0.35));
    const deg: number = G.d[i];
    const fewer = G.f[i] === 1;
    c.copy(BASE).multiplyScalar(0.75).lerp(fewer ? BL : GD, k);
    if (fewer) c.multiplyScalar(1 - 0.25 * k); else c.multiplyScalar(1 + 0.5 * k);
    col.setXYZ(i, c.r, c.g, c.b);
    sz.setX(i, (0.42 + 0.2 * Math.sqrt(deg)) * (fewer ? 1 - 0.15 * k : 1 + 0.45 * k));
  }
  col.needsUpdate = true; sz.needsUpdate = true;
  mat.uniforms.uScale.value = size.height / (2 * Math.tan((FOV * Math.PI) / 360));
  mat.uniforms.uOpacity.value = fade;
  lmat.opacity = 0.06 * fade;
  mmat.opacity = 0.9 * fade * (1 - 0.6 * prog(T, b(38), b(40)));

  const { pos, target } = camAt(T);
  camera.position.copy(pos); camera.lookAt(target); (camera as THREE.PerspectiveCamera).near = 0.05; camera.updateProjectionMatrix();
  return (
    <>
      <lineSegments geometry={lines} material={lmat} />
      <lineSegments geometry={mine} material={mmat} />
      <points geometry={geo} material={mat} />
    </>
  );
};
/** project 小张's node to the screen (for the HTML avatar) */
const project = (T: number, w: number, h: number) => {
  const { pos, target } = camAt(T);
  const cam = new THREE.PerspectiveCamera(FOV, w / h, 0.05, 2000);
  cam.position.copy(pos); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const v = ZP.clone().project(cam);
  const dist = pos.distanceTo(ZP);
  return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, r: (0.5 * h) / (2 * Math.tan((FOV * Math.PI) / 360)) / dist };
};

export const S2Galaxy: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  if (T < S2_IN - 0.02 || T > S2_OUT + 0.05) return null;
  const fadeOut = 1 - prog(T, b(56.2), S2_OUT);
  const dim = 1 - 0.62 * easeInOut(prog(T, TITLE - 0.1, TITLE + 0.6));
  const av = project(T, width, height);
  const avR = Math.min(av.r, 900);
  const avO = clamp((avR - 9) / 14);
  const tf = (T - TITLE) * 30;
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: fadeOut }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #121a33 0%, #070a14 70%)' }} />
      <AbsoluteFill style={{ opacity: dim }}>
        <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: FOV, near: 0.05, far: 2000, position: [0, 0, 300] }}>
          <Net T={T} fade={1} />
        </ThreeCanvas>
      </AbsoluteFill>
      {avO > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: avO * dim }}>
          <g transform={`translate(${av.x} ${av.y})`}>
            <circle r={avR * 1.25} fill={GOLD} opacity={0.12} />
            <Avatar who={CAST[0]} mood="worry" r={avR} ring={GOLD} ringW={Math.max(2, avR * 0.05)} id="s2zh" bg="#2a3348" />
          </g>
          {avR < 160 && avR > 12 && <text x={av.x} y={av.y - avR - 16} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, fill: GOLD }} opacity={clamp((160 - avR) / 40)}>小张</text>}
        </svg>
      )}
      <Chapter T={T} at={S2_IN + 0.4} out={TITLE} text="FACEBOOK · 2011" />
      <Stat T={T} at={b(34)} out={TITLE} top={110} value={7.21} decimals={2} unit="亿" label="个用户" />
      <Stat T={T} at={RECOLOR} out={TITLE} top={260} value={92.7} decimals={1} suffix="%" label="朋友数少于朋友们的平均" gold />
      <Note T={T} at={b(34)} out={TITLE} text="示意图：点越大，朋友越多　金色 = 比朋友们多　蓝色 = 比朋友们少" />
      <Note T={T} at={b(34)} out={TITLE} x={64} y={1060} text="数据：Ugander 等，《The Anatomy of the Facebook Social Graph》，2011" />
      {T >= TITLE - 0.05 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - prog(T, b(56.2), S2_OUT) }}>
          <text x={960} y={392} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={easeOut(prog(T, TITLE, TITLE + 0.5))}>THE FRIENDSHIP PARADOX · 朋友悖论</text>
          <GoldTitle text="朋友圈里，好像只有我过得不好" f={tf} at={4} size={78} y={530} />
        </svg>
      )}
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

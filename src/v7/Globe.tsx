import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, Subs, SubBand, Chapter, Stat, Note, Line, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { GoldTitle } from '../brand/Brand';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';
import geo from './geo.json';

/* The globe (3D). S2, b32 -> b57.4: 1.59 billion people, 3.57 people apart, the title.
   S5, b124 -> b159.6: the world keeps shrinking (1967: 5.2, 2011: 3.74, 2016: 3.57). */
export const S2_IN = b(32), S2_OUT = b(57.4), S5_IN = b(124), S5_OUT = b(159.6);
const TITLE = b(50), FOV = 36, R = 10;
const Y67 = b(131), Y11 = b(139), Y16 = b(147), GAP = b(155), PUSH0 = b(156.2);
const LINES: Line[] = [
  [S2_IN + 0.15, b(40) - 0.08, '2016年，Facebook算了15.9亿人', '2016: Facebook measured 1.59 billion people.'],
  [b(40) + 0.06, TITLE - 0.1, '任意两个人，平均只隔[3.57]个人', 'Any two of them: on average, just 3.57 people apart.'],
  [S5_IN + 0.06, Y67 - 0.08, '而且，世界还在[变小]', 'And the world keeps getting smaller.'],
  [Y67 + 0.06, Y11 - 0.08, '1967年，一封信：5.2个人', '1967, by letter: 5.2 people.'],
  [Y11 + 0.06, Y16 - 0.08, '2011年，Facebook：3.74个人', '2011, on Facebook: 3.74 people.'],
  [Y16 + 0.06, GAP + 0.6, '2016年：[3.57]个人', '2016: 3.57 people.'],
];
const dots: number[][] = (geo as any).dots;
const toV = (lon: number, lat: number, r = R) => {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};
/* arcs between random land points; `born` = when it appears (scene-relative weight) */
const ARCS = (() => {
  const r = mulberry(357);
  const pick = () => dots[Math.floor(r() * dots.length)];
  const out: { a: THREE.Vector3; c: THREE.Vector3; z: THREE.Vector3; era: number; ph: number }[] = [];
  for (let i = 0; i < 260; i++) {
    const p = pick(), q = pick();
    const a = toV(p[0], p[1], R + 0.03), z = toV(q[0], q[1], R + 0.03);
    const d = a.distanceTo(z);
    const c = a.clone().add(z).multiplyScalar(0.5).normalize().multiplyScalar(R + 0.6 + d * 0.32);
    out.push({ a, c, z, era: i < 40 ? 0 : i < 130 ? 1 : 2, ph: r() });
  }
  return out;
})();
/* one highlighted chain: you -> 3 people -> someone on the other side of the world */
const CHAIN = [[116.4, 39.9], [77.2, 28.6], [55.3, 25.2], [31.2, 30.0], [-0.1, 51.5]].map(([lo, la]) => toV(lo, la, R + 0.05));
const curve = (a: THREE.Vector3, z: THREE.Vector3, lift = 0.32) => {
  const d = a.distanceTo(z);
  const c = a.clone().add(z).multiplyScalar(0.5).normalize().multiplyScalar(R + 0.5 + d * lift);
  return new THREE.QuadraticBezierCurve3(a, c, z);
};

const VERT = `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uScale;
void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = clamp(size * uScale / -mv.z, 1.2, 40.0); gl_Position = projectionMatrix * mv; }`;
const FRAG = `varying vec3 vC; uniform float uOpacity;
void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p); if (r > 0.5) discard; float a = smoothstep(0.5, 0.15, r);
 gl_FragColor = vec4(vC, uOpacity * a); }`;

/* globe rotation on its own clock; it stops in the musical gap (time warp) */
const spin = (T: number) => {
  const free = Math.min(T, GAP) + Math.max(0, Math.min(T, GAP + 0.8) - GAP) * 0.35;
  return free * 0.07;
};
export const Globe: React.FC<{ T: number; distOverride?: number }> = ({ T, distOverride }) => {
  const { camera, size } = useThree();
  const land = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(dots.length * 3), col = new Float32Array(dots.length * 3), sz = new Float32Array(dots.length);
    dots.forEach(([lo, la], i) => { const v = toV(lo, la, R + 0.02); pos.set([v.x, v.y, v.z], i * 3); col.set([0.86, 0.8, 0.68], i * 3); sz[i] = 0.16; });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(sz, 1));
    return g;
  }, []);
  const stars = useMemo(() => {
    const r = mulberry(11); const n = 1400; const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    for (let i = 0; i < n; i++) { const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(260 + r() * 80); pos.set([v.x, v.y, v.z], i * 3); const k = 0.4 + 0.5 * r(); col.set([k, k, k * 1.1], i * 3); sz[i] = 0.8 + r() * 1.4; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('size', new THREE.BufferAttribute(sz, 1)); return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, uniforms: { uScale: { value: 1 }, uOpacity: { value: 1 } } }), []);
  const smat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, uniforms: { uScale: { value: 1 }, uOpacity: { value: 0.8 } } }), []);
  const arcGeo = useMemo(() => ARCS.map(({ a, c, z }) => new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, c, z).getPoints(40))), []);
  const arcMat = useMemo(() => ARCS.map(() => new THREE.LineBasicMaterial({ color: '#f1c56d', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })), []);
  const chainGeo = useMemo(() => CHAIN.slice(1).map((z, i) => new THREE.BufferGeometry().setFromPoints(curve(CHAIN[i], z).getPoints(48))), []);
  const chainMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#ffd98a', transparent: true, opacity: 1 }), []);
  const arcLines = useMemo(() => arcGeo.map((g, i) => new THREE.Line(g, arcMat[i])), [arcGeo, arcMat]);
  const chainLines = useMemo(() => chainGeo.map((g) => new THREE.Line(g, chainMat)), [chainGeo, chainMat]);
  const scale = size.height / (2 * Math.tan((FOV * Math.PI) / 360));
  mat.uniforms.uScale.value = scale; smat.uniforms.uScale.value = scale;

  // camera
  const s2 = T < S5_IN - 1;
  let dist = 34, el = 0.25;
  if (s2) { const k = easeOut(prog(T, S2_IN, b(37))); dist = lerp(95, 40, k); el = lerp(0.6, 0.26, k); }
  else { dist = 38 + 2 * easeInOut(prog(T, S5_IN, Y67)); }
  if (distOverride) dist = distOverride;
  const ang = 0.35;
  // shrink the world by year (S5)
  const shrink = s2 ? 1 : 1 - 0.12 * easeInOut(prog(T, Y11, Y11 + 0.9)) - 0.08 * easeInOut(prog(T, Y16, Y16 + 0.9));
  // in the musical gap: dive into the gold dot that is "you", towards the glow of a phone screen
  const push = Math.pow(prog(T, PUSH0, S5_OUT), 2.2);
  if (push > 0) dist = zlerp(dist, R * shrink + 0.12, push);
  const cd = new THREE.Vector3(Math.sin(ang) * Math.cos(el), Math.sin(el), Math.cos(ang) * Math.cos(el));
  camera.position.copy(cd.clone().multiplyScalar(dist));
  camera.lookAt(0, 0, 0); (camera as THREE.PerspectiveCamera).near = 0.02; camera.updateProjectionMatrix();
  const youK = s2 ? 0 : easeOut(prog(T, GAP + 0.3, GAP + 0.9));
  const dim = s2 ? 1 - 0.55 * easeInOut(prog(T, TITLE - 0.1, TITLE + 0.6)) : 1 - 0.55 * easeInOut(prog(T, GAP + 0.2, GAP + 1.4));
  mat.uniforms.uOpacity.value = 0.9 * dim;
  // arcs: S2 all eras flicker in; S5 era by year
  ARCS.forEach((a, i) => {
    let o = 0;
    if (s2) o = easeOut(prog(T, S2_IN + 0.8 + a.ph * 3.5, S2_IN + 1.3 + a.ph * 3.5)) * (0.35 + 0.25 * Math.sin(T * 2 + i)) * (1 - 0.7 * prog(T, b(40), b(41)));
    else {
      const at = a.era === 0 ? Y67 : a.era === 1 ? Y11 : Y16;
      o = easeOut(prog(T, at + a.ph * 1.2, at + a.ph * 1.2 + 0.4)) * (0.55 + 0.25 * Math.sin(T * 2 + i));
    }
    arcMat[i].opacity = o * dim;
    arcMat[i].visible = o > 0.01;
  });
  const chainK = s2 ? prog(T, b(40.2), b(43.5)) : 0;
  chainMat.opacity = (s2 ? 1 - prog(T, TITLE - 0.3, TITLE + 0.3) : 0);
  return (
    <>
      <points geometry={stars} material={smat} />
      {youK > 0 && <group position={cd.clone().multiplyScalar(R * shrink + 0.05)}>
        <mesh scale={youK}><sphereGeometry args={[0.16, 16, 12]} /><meshBasicMaterial color="#ffe7a8" /></mesh>
        <mesh scale={youK}><sphereGeometry args={[0.42, 16, 12]} /><meshBasicMaterial color="#f1c56d" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      </group>}
      <group rotation={[0, -spin(T) + 0.28, 0]} scale={shrink}>
        <mesh><sphereGeometry args={[R, 64, 48]} /><meshBasicMaterial color="#0a1326" /></mesh>
        <mesh scale={1.06}><sphereGeometry args={[R, 48, 32]} /><meshBasicMaterial color="#5f86d8" transparent opacity={0.07 * dim} side={THREE.BackSide} /></mesh>
        <points geometry={land} material={mat} />
        {arcLines.map((l, i) => <primitive key={i} object={l} />)}
        {chainK > 0 && chainGeo.map((g, i) => {
          const k = clamp(chainK * 4 - i);
          g.setDrawRange(0, Math.max(2, Math.floor(49 * k)));
          return k > 0 ? <primitive key={`c${i}`} object={chainLines[i]} /> : null;
        })}
        {chainK > 0 && CHAIN.map((v, i) => {
          const k = clamp(chainK * 4 - i + 1);
          const end = i === 0 || i === CHAIN.length - 1;
          return k > 0 ? <mesh key={`p${i}`} position={v} scale={k * chainMat.opacity}><sphereGeometry args={[end ? 0.32 : 0.22, 16, 12]} /><meshBasicMaterial color={end ? '#ffd98a' : '#f3ede2'} /></mesh> : null;
        })}
      </group>
    </>
  );
};

export const GlobeScene: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  const inS2 = T >= S2_IN - 0.02 && T <= S2_OUT + 0.05, inS5 = T >= S5_IN - 0.4 && T <= S5_OUT + 0.05;
  if (!inS2 && !inS5) return null;
  const o = inS2 ? Math.min(easeOut(prog(T, S2_IN - 0.02, S2_IN + 0.5)), 1 - prog(T, b(56.4), S2_OUT)) : easeOut(prog(T, S5_IN - 0.4, S5_IN + 0.3));
  const tf = (T - TITLE) * 30;
  const ladder = (at: number, y: number, year: string, v: string, gold: boolean) => {
    const k = easeOut(prog(T, at + 0.1, at + 0.5));
    if (k <= 0) return null;
    return (
      <div style={{ position: 'absolute', right: 80, top: y, opacity: k * (1 - 0.5 * prog(T, GAP + 0.2, GAP + 1)) * (1 - prog(T, PUSH0, PUSH0 + 0.5)), textAlign: 'right', transform: `translateX(${(1 - k) * 30}px)` }}>
        <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 34, color: 'rgba(243,237,226,0.6)', marginRight: 18 }}>{year}</span>
        <span style={{ fontFamily: EN, fontWeight: 700, fontSize: 92, color: gold ? GOLD : CREAM, ...(gold ? GOLD_TEXT : {}) }}>{v}</span>
        <span style={{ fontFamily: ZH, fontSize: 30, color: 'rgba(243,237,226,0.7)', marginLeft: 8 }}>人</span>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: FOV, near: 0.1, far: 1000, position: [0, 0, 40] }}>
        <Globe T={T} />
      </ThreeCanvas>
      {inS2 && <>
        <Chapter T={T} at={S2_IN + 0.5} out={TITLE} text="FACEBOOK · 2016" />
        <Stat T={T} at={b(34)} out={TITLE} top={110} value={15.9} decimals={1} unit="亿" label="个用户" />
        <Stat T={T} at={b(40.4)} out={TITLE} top={260} value={3.57} decimals={2} unit="人" label="任意两人之间，平均隔着" gold count={1.2} />
        <Note T={T} at={b(34)} out={TITLE} text="示意：一条从北京到伦敦的朋友链　数据：Bhagat 等，Facebook Research，2016" />
        {T >= TITLE - 0.05 && (
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - prog(T, b(56.4), S2_OUT) }}>
            <text x={960} y={400} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={easeOut(prog(T, TITLE, TITLE + 0.5))}>SMALL WORLD · 小 世 界</text>
            <GoldTitle text="隔着几个人" f={tf} at={4} size={112} y={545} />
          </svg>
        )}
      </>}
      {inS5 && <>
        <Chapter T={T} at={S5_IN + 0.3} out={GAP} text="世 界 在 变 小" />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: ZH, fontWeight: 700, fontSize: 30, color: GOLD,
          opacity: easeOut(prog(T, GAP + 0.5, GAP + 1.0)) * (1 - prog(T, PUSH0 + 0.5, PUSH0 + 1.0)) }}>你</div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, #eef3ff 0%, #b9ccf5 35%, rgba(120,150,220,0) 70%)',
          opacity: Math.pow(prog(T, S5_OUT - 0.55, S5_OUT), 1.5), transform: `scale(${0.4 + 2.2 * prog(T, S5_OUT - 0.55, S5_OUT)})` }} />
        {ladder(Y67, 200, '1967', '5.2', false)}
        {ladder(Y11, 330, '2011', '3.74', false)}
        {ladder(Y16, 460, '2016', '3.57', true)}
        <Note T={T} at={Y67 + 0.3} out={GAP + 0.5} text="三项研究方法不同（寄信 / Facebook 全网计算），数字仅作对照" />
      </>}
      <SubBand o={0.8} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

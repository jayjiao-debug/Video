import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { camAt, type Key } from './lib';
import COUNTRIES from './countries.json';

/* A smooth, lit Earth built here instead of a downloaded model (the model's sphere looked faceted and its textures
   were over-compressed). 192×128 segments; textures from the three.js examples (MIT): day colour, city lights,
   ocean specular mask, clouds. One shader does the terminator, the night lights, the sun glint and the
   atmosphere rim; a second shell carries the clouds; a back-face shell gives the halo. */
export type Country = { code: string; name: string; zh: string; pop: number; lat: number; lon: number; d: number };
export const C: Country[] = COUNTRIES as Country[];
export const R = 5;

type Tex = { day: THREE.Texture; night: THREE.Texture; spec: THREE.Texture; clouds: THREE.Texture };
let TEX: Tex | null = null;
const loadTex = async () => {
  if (TEX) return TEX;
  const L = new THREE.TextureLoader();
  const [day, night, spec, clouds] = await Promise.all(
    ['earth_atmos_2048.jpg', 'earth_lights_2048.png', 'earth_specular_2048.jpg', 'earth_clouds_1024.png'].map((f) => L.loadAsync(staticFile(`tex/${f}`))),
  );
  for (const t of [day, night, spec, clouds]) { t.anisotropy = 8; t.colorSpace = THREE.NoColorSpace; }
  TEX = { day, night, spec, clouds };
  return TEX;
};

/** direction for lat/lon on the unrotated sphere, matching the equirectangular texture on THREE.SphereGeometry
    (Greenwich at +x, east toward −z) */
export const llToVec = (lat: number, lon: number, r = R) => {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));
};
/** the spin (degrees about +y) that turns longitude `lon` to face a camera on +z */
export const spinFor = (lon: number) => -90 - lon;
export const worldOf = (lat: number, lon: number, spin: number, r = R) => llToVec(lat, lon, r).applyAxisAngle(new THREE.Vector3(0, 1, 0), (spin * Math.PI) / 180);

const PROJ = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.1, 500);
/** project a world point to screen pixels for HTML labels; `facing` > 0 when the point faces the camera */
export const project = (keys: Key[], T: number, v: THREE.Vector3) => {
  const { pos, look } = camAt(keys, T);
  PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const p = v.clone().project(PROJ);
  const toCam = new THREE.Vector3(pos[0], pos[1], pos[2]).sub(v).normalize();
  return { x: ((p.x + 1) / 2) * 1920, y: ((1 - p.y) / 2) * 1080, facing: v.clone().normalize().dot(toCam) };
};

const SUN = new THREE.Vector3(1.0, 0.35, 0.55).normalize();

const EARTH_VS = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const EARTH_FS = /* glsl */ `
uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D specMap;
uniform vec3 sun; uniform float lights; uniform float dim;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  float ndl = dot(N, sun);
  float dayAmt = smoothstep(-0.12, 0.28, ndl);
  vec3 day = texture2D(dayMap, vUv).rgb;
  vec3 night = texture2D(nightMap, vUv).rgb;
  float sea = texture2D(specMap, vUv).r;
  vec3 col = day * (0.05 + 1.05 * max(ndl, 0.0)) * dayAmt;
  // city lights, warm, only on the night side
  col += night * vec3(1.0, 0.78, 0.48) * 1.9 * (1.0 - smoothstep(-0.30, 0.08, ndl)) * lights;
  // sun glint on the oceans
  vec3 H = normalize(sun + V);
  col += vec3(1.0, 0.93, 0.8) * sea * pow(max(dot(N, H), 0.0), 60.0) * 0.55 * dayAmt;
  // atmosphere rim: blue on the day side, faint on the night side
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += vec3(0.35, 0.6, 1.0) * rim * (0.12 + 0.75 * smoothstep(-0.2, 0.5, ndl));
  gl_FragColor = vec4(col * dim, 1.0);
}`;
const CLOUD_FS = /* glsl */ `
uniform sampler2D cloudMap; uniform vec3 sun; uniform float dim;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 N = normalize(vN);
  float a = texture2D(cloudMap, vUv).a;
  float ndl = dot(N, sun);
  float lit = 0.04 + 0.9 * smoothstep(-0.1, 0.5, ndl);
  gl_FragColor = vec4(vec3(lit) * dim, a * 0.85 * smoothstep(-0.35, 0.2, ndl) * dim);
}`;
const HALO_FS = /* glsl */ `
uniform vec3 sun; uniform float dim;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vP);
  float edge = pow(clamp(1.0 + dot(N, V) * 1.0, 0.0, 1.0), 4.0);
  float day = 0.25 + 0.75 * smoothstep(-0.3, 0.6, dot(N, sun));
  gl_FragColor = vec4(vec3(0.3, 0.55, 1.0) * edge * day * dim, edge * day * 0.8 * dim);
}`;

const CamRig: React.FC<{ T: number; keys: Key[] }> = ({ T, keys }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(keys, T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};

const Earth: React.FC<{ tex: Tex; spin: number; dim: number; lights: number }> = ({ tex, spin, dim, lights }) => {
  const geo = useMemo(() => new THREE.SphereGeometry(R, 192, 128), []);
  const earthMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: EARTH_VS, fragmentShader: EARTH_FS, uniforms: { dayMap: { value: tex.day }, nightMap: { value: tex.night }, specMap: { value: tex.spec }, sun: { value: SUN }, lights: { value: 1 }, dim: { value: 1 } } }), [tex]);
  const cloudMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: EARTH_VS, fragmentShader: CLOUD_FS, transparent: true, depthWrite: false, uniforms: { cloudMap: { value: tex.clouds }, sun: { value: SUN }, dim: { value: 1 } } }), [tex]);
  const haloMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: EARTH_VS, fragmentShader: HALO_FS, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, uniforms: { sun: { value: SUN }, dim: { value: 1 } } }), []);
  earthMat.uniforms.dim.value = dim; earthMat.uniforms.lights.value = lights;
  cloudMat.uniforms.dim.value = dim; haloMat.uniforms.dim.value = dim;
  const rot = (spin * Math.PI) / 180;
  return (
    <group rotation={[0, rot, 0]}>
      <mesh geometry={geo} material={earthMat} />
      <mesh geometry={geo} material={cloudMat} scale={1.008} rotation={[0, 0.3, 0]} />
      <mesh geometry={geo} material={haloMat} scale={1.06} />
    </group>
  );
};

export const Globe: React.FC<{ T: number; keys: Key[]; spin: number; dim?: number; lights?: number }> = ({ T, keys, spin, dim = 1, lights = 1 }) => {
  const { width, height } = useVideoConfig();
  const [tex, setTex] = useState<Tex | null>(TEX);
  const [handle] = useState(() => (TEX ? null : delayRender('earth textures', { timeoutInMilliseconds: 120000 })));
  useEffect(() => { loadTex().then((t) => { setTex(t); if (handle !== null) continueRender(handle); }); }, [handle]);
  if (!tex) return null;
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ fov: 30, near: 0.1, far: 500 }}>
        <CamRig T={T} keys={keys} />
        <Earth tex={tex} spin={spin} dim={dim} lights={lights} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

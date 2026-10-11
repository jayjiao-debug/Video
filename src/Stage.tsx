/* 镭射纸雕剧场 · the stage: a black velvet theatre lit by coloured strips, so foil throws rainbows.
   Post: depth of field, bloom, chromatic split on hits, a flash, ACES. */
import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { HOLO_T } from './foil';

export type Cam = {
  pos: [number, number, number]; look: [number, number, number]; fov: number; focus: number; aperture: number; bloom: number;
  exposure?: number; env?: number; roll?: number;
  /** chromatic split 0..1 (hits), flash 0..1 (white-gold add), hue of the club light 0..1 */
  ca?: number; flash?: number;
  /** motion blur: screen-space vector (uv units per frame) */
  mb?: [number, number];
};

/** chromatic split + flash + vignette, one pass */
const FinishShader = {
  uniforms: { tDiffuse: { value: null }, ca: { value: 0 }, flash: { value: 0 }, vig: { value: 0.35 }, mb: { value: new THREE.Vector2(0, 0) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float ca; uniform float flash; uniform float vig; uniform vec2 mb; varying vec2 vUv;
    vec3 samp(vec2 uv){ vec3 acc = vec3(0.0); for (int i = 0; i < 12; i++) { float k = float(i) / 11.0 - 0.5; acc += texture2D(tDiffuse, uv + mb * k).rgb; } return acc / 12.0; }
    void main(){
      vec2 d = (vUv - 0.5); float r = length(d);
      vec2 off = d * ca * 0.018 * (0.3 + r * 2.0);
      vec4 c = vec4(samp(vUv), 1.0);
      c.r = samp(vUv + off).r; c.b = samp(vUv - off).b;
      c.rgb += flash * vec3(1.0, 0.92, 0.78);
      c.rgb *= 1.0 - vig * smoothstep(0.35, 0.95, r * 1.25);
      gl_FragColor = c;
    }`,
};

const Post: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio(), { samples: 4, type: THREE.HalfFloatType });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(gl.getPixelRatio()); composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.002, maxblur: 0.01 });
    composer.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.6, 0.6, 0.78);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const fin = new ShaderPass(FinishShader); composer.addPass(fin);
    return { composer, bokeh, bloom, fin };
  }, [gl, scene, camera, size.width, size.height]);
  const u = (fx.bokeh as unknown as { uniforms: Record<string, { value: number }> }).uniforms;
  u.focus.value = cam.focus; u.aperture.value = cam.aperture; u.maxblur.value = 0.01;
  fx.bloom.strength = cam.bloom;
  fx.fin.uniforms.ca.value = cam.ca ?? 0.12; fx.fin.uniforms.flash.value = cam.flash ?? 0; (fx.fin.uniforms.mb.value as THREE.Vector2).set(...(cam.mb ?? [0, 0]));
  useFrame(() => fx.composer.render(), 1);
  return null;
};

/** the club: coloured light strips around a black room. Foil and chrome reflect these as rainbows. */
const club = () => {
  const sc = new THREE.Scene(); sc.background = new THREE.Color('#000');
  const strip = (w: number, h: number, pos: [number, number, number], rot: [number, number, number], col: string, k: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); sc.add(m);
  };
  strip(6, 1.2, [0, 4, 0], [Math.PI / 2, 0, 0], '#fff2dc', 2.2);           // soft top
  strip(0.5, 4, [-3.2, 1.6, 0.8], [0, Math.PI / 2.3, 0], '#ff3ec8', 3.2);  // magenta left
  strip(0.5, 4, [3.2, 1.6, 0.8], [0, -Math.PI / 2.3, 0], '#29e6ff', 3.2);  // cyan right
  strip(4, 0.5, [0, 0.4, 3.6], [0, Math.PI, 0], '#ffc860', 2.6);          // gold front low
  strip(3, 0.6, [0, 2.4, -3.6], [0, 0, 0], '#8a5cff', 2.4);               // violet back
  strip(0.4, 3, [-1.6, 2.2, -3], [0, 0.4, 0.3], '#ffffff', 4);            // a hard white kicker
  strip(10, 10, [0, -3, 0], [Math.PI / 2, 0, 0], '#1a1020', 1);           // floor bounce
  return sc;
};

const Env: React.FC<{ k: number }> = ({ k }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const t = pm.fromScene(club(), 0.015).texture; pm.dispose(); return t; }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  scene.environment = env;
  (scene as unknown as { environmentIntensity: number }).environmentIntensity = k;
  return null;
};

export const Stage: React.FC<{ cam: Cam; bg?: string; T?: number; children: React.ReactNode }> = ({ cam, bg = '#04030a', T = 0, children }) => {
  HOLO_T.value = T;
  const { camera, gl } = useThree();
  gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = cam.exposure ?? 1;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.near = 0.01; c.far = 80; c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0); c.updateProjectionMatrix(); c.lookAt(new THREE.Vector3(...cam.look));
  return (
    <>
      <color attach="background" args={[bg]} />
      <Env k={cam.env ?? 1} />
      {children}
      <Post cam={cam} />
    </>
  );
};

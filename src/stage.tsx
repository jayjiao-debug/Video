import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { W, H } from './lib';

/* The 3D stage for 《钱凭什么》: ACES, a synchronous post chain (built in useMemo so the very first frame already
   goes through it; @react-three/postprocessing initialises late and leaves blank frames in renders):
   render -> NaN guard -> optional DOF -> bloom -> tone map -> FXAA -> grade (warm/cool split, grain, shake). */

const GRADE = {
  uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uGrain: { value: 0.045 }, uLift: { value: 0 }, uShake: { value: new THREE.Vector2() } },
  vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uSeed, uGrain, uLift; uniform vec2 uShake; varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uSeed)*43758.5453);}
void main(){
  vec2 uv=vUv+uShake;
  vec2 d=uv-.5; vec2 o=d*.004*dot(d,d)*4.;
  vec3 c=vec3(texture2D(tDiffuse,uv+o).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-o).b);
  float l=dot(c,vec3(.299,.587,.114));
  c=mix(c*vec3(.92,.97,1.08),c*vec3(1.06,1.,.9),smoothstep(.05,.6,l)); // cool shadows, warm highlights
  c+=uLift;
  c+=(h(vUv*vec2(1920.,1080.))-.5)*uGrain*(1.-l*.6);
  gl_FragColor=vec4(c,1.);
}`,
};

export type Fx = { bloom?: number; threshold?: number; radius?: number; focus?: number; aperture?: number; maxblur?: number; grain?: number; shake?: [number, number]; seed?: number };

const Post: React.FC<Required<Omit<Fx, 'focus'>> & { focus?: number }> = (p) => {
  const { gl, scene, camera, size } = useThree();
  const chain = useMemo(() => {
    const dpr = gl.getPixelRatio();
    const rw = Math.round(size.width * dpr), rh = Math.round(size.height * dpr);
    const composer = new EffectComposer(gl, new THREE.WebGLRenderTarget(rw, rh, { type: THREE.HalfFloatType }));
    composer.setPixelRatio(1); composer.setSize(rw, rh);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: GRADE.vertexShader,
      fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c=texture2D(tDiffuse,vUv); if(!(c.r==c.r)||!(c.g==c.g)||!(c.b==c.b)) c=vec4(0.,0.,0.,1.); gl_FragColor=vec4(min(c.rgb,vec3(64.)),1.); }',
    }));
    const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.002, maxblur: 0.01 });
    composer.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(rw, rh), 0.8, 0.5, 0.8);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const fxaa = new ShaderPass(FXAAShader);
    fxaa.uniforms.resolution.value.set(1 / rw, 1 / rh);
    composer.addPass(fxaa);
    const grade = new ShaderPass(GRADE);
    composer.addPass(grade);
    return { composer, bokeh, bloom, grade };
  }, [gl, scene, camera, size]);
  chain.bokeh.enabled = p.focus !== undefined;
  if (p.focus !== undefined) {
    const u = chain.bokeh.uniforms as Record<string, { value: number }>;
    u.focus.value = p.focus; u.aperture.value = p.aperture; u.maxblur.value = p.maxblur;
  }
  chain.bloom.strength = p.bloom; chain.bloom.threshold = p.threshold; chain.bloom.radius = p.radius;
  chain.grade.uniforms.uSeed.value = p.seed;
  chain.grade.uniforms.uGrain.value = p.grain;
  chain.grade.uniforms.uShake.value.set(p.shake[0], p.shake[1]);
  useFrame(() => chain.composer.render(), 1);
  return null;
};

export const Stage: React.FC<Fx & { bg?: string; exposure?: number; fov?: number; children: React.ReactNode }> = ({
  bg = '#06070c', exposure = 1, fov = 30, bloom = 0.7, threshold = 0.82, radius = 0.5, focus, aperture = 0.0015, maxblur = 0.008, grain = 0.045, shake = [0, 0], seed = 0, children,
}) => (
  <ThreeCanvas width={W} height={H} style={{ position: 'absolute', inset: 0 }} shadows
    gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true }}
    camera={{ fov, near: 0.005, far: 200 }}>
    <color attach="background" args={[bg]} />
    {children}
    <Post bloom={bloom} threshold={threshold} radius={radius} focus={focus} aperture={aperture} maxblur={maxblur} grain={grain} shake={shake} seed={seed} />
  </ThreeCanvas>
);

/* Shared 3D stage for 《你买的不是包》: camera, environment light, bloom + depth of field. */
import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number; focus: number; aperture: number; bloom: number; exposure?: number; env?: number };

const Post: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(size.width * gl.getPixelRatio(), size.height * gl.getPixelRatio(), { samples: 4, type: THREE.HalfFloatType });
    const composer = new EffectComposer(gl, rt);
    composer.setPixelRatio(gl.getPixelRatio()); composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.002, maxblur: 0.012 });
    composer.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.5, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bokeh, bloom };
  }, [gl, scene, camera, size.width, size.height]);
  const u = (fx.bokeh as unknown as { uniforms: Record<string, { value: number }> }).uniforms;
  u.focus.value = cam.focus; u.aperture.value = cam.aperture; u.maxblur.value = 0.012;
  fx.bloom.strength = cam.bloom;
  useFrame(() => fx.composer.render(), 1);
  return null;
};

const Env: React.FC<{ k: number }> = ({ k }) => {
  const { gl, scene } = useThree();
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env; return () => { env.dispose(); pm.dispose(); }; }, [gl, scene]);
  (scene as unknown as { environmentIntensity: number }).environmentIntensity = k;
  return null;
};

export const Stage: React.FC<{ cam: Cam; bg?: string; children: React.ReactNode }> = ({ cam, bg = '#030304', children }) => {
  const { camera, gl } = useThree();
  gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = cam.exposure ?? 1;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos); c.fov = cam.fov; c.near = 0.01; c.far = 60; c.updateProjectionMatrix(); c.lookAt(new THREE.Vector3(...cam.look));
  return (
    <>
      <color attach="background" args={[bg]} />
      <Env k={cam.env ?? 0.15} />
      {children}
      <Post cam={cam} />
    </>
  );
};

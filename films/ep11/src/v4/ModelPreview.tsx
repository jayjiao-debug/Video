import React, { useEffect, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

/* Turntable preview of a downloaded model, auto-framed, lit by an HDRI. */
const Fit: React.FC<{ obj: THREE.Object3D; env: THREE.Texture; angle: number; done: () => void }> = ({ obj, env, angle, done }) => {
  const { camera, scene, gl, invalidate } = useThree();
  useLayoutEffect(() => { invalidate(); requestAnimationFrame(() => requestAnimationFrame(() => { gl.render(scene, camera); done(); })); }, [obj]);
  scene.environment = env;
  scene.background = new THREE.Color('#1a1d24');
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const r = size.length() * 0.62;
  camera.position.set(c.x + Math.cos(angle) * r, c.y + r * 0.35, c.z + Math.sin(angle) * r);
  camera.lookAt(c);
  (camera as THREE.PerspectiveCamera).near = r / 100; (camera as THREE.PerspectiveCamera).far = r * 10;
  camera.updateProjectionMatrix();
  return <primitive object={obj} />;
};
export const ModelPreview: React.FC<{ file: string; angle?: number }> = ({ file, angle = 0.7 }) => {
  const { width, height } = useVideoConfig();
  const [h] = useState(() => delayRender('model ' + file));
  const [obj, setObj] = useState<THREE.Object3D | null>(null);
  const [env, setEnv] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    Promise.all([
      new GLTFLoader().loadAsync(staticFile(`models/${file}`)),
      new RGBELoader().loadAsync(staticFile('hdri/kloppenheim_02_2k.hdr')),
    ]).then(([g, e]) => { e.mapping = THREE.EquirectangularReflectionMapping; setEnv(e); setObj(g.scene); })
      .catch((err) => { console.error(err); continueRender(h); });
  }, [file, h]);
  return (
    <AbsoluteFill style={{ background: '#1a1d24' }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 35 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 2.2 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={2} />
        {obj && env && <Fit obj={obj} env={env} angle={angle} done={() => continueRender(h)} />}
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: 20, top: 14, color: '#f1c56d', font: '600 28px sans-serif' }}>{file}</div>
    </AbsoluteFill>
  );
};

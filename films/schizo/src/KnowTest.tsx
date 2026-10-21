/* stills of the v3 explanation scenes for approval */
import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildGears, buildCrowd, buildGlobe } from './Know3D';
import { W, H, SANS, SERIF, FONT_CHARS } from './lib';
export const KT_FRAMES = 25 * 30;
const World: React.FC<{ t: number }> = ({ t }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo(() => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.background = new THREE.Color('#000');
    const gears = buildGears({ t0: 0, drift: 3, t1: 6 }), crowd = buildCrowd({ t0: 6, age: 9, t1: 12 }), globe = buildGlobe({ t0: 12, at: [13.5, 16.5, 19.5], why: 22.5, t1: 25 });
    scene.add(gears.g, crowd.g, globe.g); return { gears, crowd, globe }; }, [scene, gl]);
  const cam = camera as THREE.PerspectiveCamera; const seg = t < 6 ? 'gears' : t < 12 ? 'crowd' : 'globe';
  S.gears.g.visible = seg === 'gears'; S.crowd.g.visible = seg === 'crowd'; S.globe.g.visible = seg === 'globe';
  scene.fog = seg === 'globe' ? null : new THREE.FogExp2('#0a0908', seg === 'crowd' ? 0.03 : 0.08);
  const p = seg === 'gears' ? S.gears.update(t) : seg === 'crowd' ? S.crowd.update(t) : S.globe.update(t, cam);
  cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = 0.02; cam.far = 80; cam.updateProjectionMatrix();
  return null;
};
export const KnowTest: React.FC = () => {
  const f = useCurrentFrame(); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '看见听见思考感受1/300最常发病岁加州美国金奈印度阿克拉加纳声音大多刺耳带着威胁像家里长辈在叮嘱是好的以正面为主听到人斯坦福座城市位患者';
    Promise.all([`900 92px ${SANS}`, `900 110px ${SANS}`, `700 64px ${SANS}`, `700 300px ${SERIF}`, `700 96px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.02, far: 80 }}><World t={f / 30} /></ThreeCanvas>
    <AbsoluteFill style={{ background: 'linear-gradient(#000 0 100px, transparent 100px calc(100% - 100px), #000 calc(100% - 100px))' }} />
  </AbsoluteFill>;
};

/* one still per new metaphor scene (frame i = scene i) */
import React, { useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { KEY_SCENES } from './Know2';
import { W, H, SANS, FONT_CHARS } from './lib';
const World: React.FC<{ i: number }> = ({ i }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo(() => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.background = new THREE.Color('#000');
    return KEY_SCENES.map((b, k) => { const s = b(600 + k * 60); scene.add(s.g); return s; }); }, [scene, gl]);
  S.forEach((s, k) => { s.g.visible = k === i; });
  scene.fog = new THREE.FogExp2('#0a0908', 0.06);
  const p = S[i].cam; const cam = camera as THREE.PerspectiveCamera; cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = 0.02; cam.far = 80; cam.updateProjectionMatrix();
  return null;
};
export const KeyTest: React.FC = () => {
  const f = useCurrentFrame(); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '多重人格好几个账号轮流登录分离性身份障碍精神分裂症一个账号功能不同步≠选择账号ABC只有相机麦克风备忘录音乐看见听见思考感受各自卡顿本该一起播放的四条轨道各播各的画面声音字幕配乐第场条啪自己挠自己不痒别人挠你痒因为大脑提前知道这是我在动心里的念头本来贴着标签掉了听起来就像说话同一段听不清加州金奈阿克拉人听成要伤害你记得按时吃饭会好起来分裂碎修失调像内分泌可以调回所以日本韩国台湾把名字改成“”！：，（）·';
    Promise.all([`900 120px ${SANS}`, `700 66px ${SANS}`, `900 100px ${SANS}`, `700 52px ${SANS}`, `600 36px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.02, far: 80 }}><World i={Math.min(5, f)} /></ThreeCanvas>
    <AbsoluteFill style={{ background: 'linear-gradient(#000 0 100px, transparent 100px calc(100% - 100px), #000 calc(100% - 100px))' }} />
  </AbsoluteFill>;
};

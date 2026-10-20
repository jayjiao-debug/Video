/* 木偶定妆照: front, side, seated, and a close-up of the elbow and wrist, on a dark melancholic ground. */
import React, { useEffect, useMemo, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildPuppet, applyRec, TK, woodTex } from './Puppet';
import { chair, seatUnder } from './Set';
import { W, H, grain, vignette } from './lib';

type Kind = 'front' | 'side' | 'sit' | 'joint';
const PW = 440, PH = 800;

const Panel: React.FC<{ kind: Kind }> = ({ kind }) => {
  const { scene, camera, gl } = useThree();
  useMemo(() => {
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.background = new THREE.Color('#141b22'); scene.fog = new THREE.Fog('#141b22', 3.5, 9);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#232a31', roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    scene.add(new THREE.HemisphereLight('#7f97ad', '#151a1f', 0.55));
    const key = new THREE.SpotLight('#ffcf98', 55, 0, 0.55, 0.7, 2); key.position.set(-1.6, 2.7, 2.3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 4;
    key.target.position.set(0, 0.7, 0); scene.add(key, key.target);
    const rim = new THREE.DirectionalLight('#9cc0e0', 2.2); rim.position.set(2.5, 2.4, -2.5); scene.add(rim);
    const rig = buildPuppet(); const holder = new THREE.Group(); holder.add(rig.root); scene.add(holder);
    const pose = kind === 'sit' ? TK.poses.sit : kind === 'joint' ? TK.poses.ear : TK.poses.stand;
    applyRec(rig, pose);
    const cam = camera as THREE.PerspectiveCamera;
    if (kind === 'front' || kind === 'side') {
      holder.rotation.y = kind === 'side' ? Math.PI / 2 : 0.0;
      cam.fov = 31; cam.position.set(0, 0.92, 3.7); cam.lookAt(0, 0.86, 0);
    } else if (kind === 'sit') {
      holder.rotation.y = 0.3;
      holder.updateMatrixWorld(true); const { seatTop, hips } = seatUnder(rig);
      const c = chair(seatTop); c.position.set(hips.x, 0, hips.z + 0.07); holder.add(c);
      cam.fov = 31; cam.position.set(-0.9, 0.95, 3.3); cam.lookAt(0.12, 0.6, 0.15);
    } else {
      holder.rotation.y = 0; holder.updateMatrixWorld(true);
      const e = new THREE.Vector3(), w = new THREE.Vector3(); rig.bones.LeftForeArm.getWorldPosition(e); rig.bones.LeftHand.getWorldPosition(w);
      const t = e.clone().lerp(w, 0.35);
      cam.fov = 30; cam.position.copy(t).add(new THREE.Vector3(0.62, -0.12, 0.5)); cam.lookAt(t);
      key.position.set(1.2, 2.2, 2.0); key.target.position.copy(t); rim.position.set(-1.5, 2.5, -2.5);
    }
    cam.near = 0.02; cam.far = 40; cam.updateProjectionMatrix();
  }, [scene, camera, gl, kind]);
  return null;
};

const LABEL: Record<Kind, [string, string]> = { front: ['正面', 'FRONT'], side: ['侧面', 'SIDE'], sit: ['坐姿', 'SEATED'], joint: ['肘 · 腕', 'ELBOW · WRIST'] };
const SWATCH: [string, string][] = [['#d2ad84', '浅木'], ['#5b3a24', '关节 胡桃木'], ['#3c4a56', '灰蓝'], ['#2e4a4c', '雾青'], ['#ffb765', '台灯 暖光']];

const Overlay: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H); grain(g, 7, 0.045); vignette(g, 0.5); }, []);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};

export const PuppetSheet: React.FC = () => {
  const kinds: Kind[] = ['front', 'side', 'sit', 'joint'];
  const x0 = (W - kinds.length * PW - (kinds.length - 1) * 20) / 2, y0 = 120;
  const font = '"Noto Sans CJK SC", sans-serif';
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0e1318,#0a0d11)' }}>
      {kinds.map((k, i) => (
        <div key={k} style={{ position: 'absolute', left: x0 + i * (PW + 20), top: y0, width: PW, height: PH, borderRadius: 6, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,.06)' }}>
          <ThreeCanvas width={PW} height={PH} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, preserveDrawingBuffer: true }} camera={{ fov: 30, near: 0.02, far: 40 }}>
            <Panel kind={k} />
          </ThreeCanvas>
          <div style={{ position: 'absolute', left: 18, bottom: 14, fontFamily: font, color: 'rgba(243,237,226,.78)', fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            {LABEL[k][0]} <span style={{ fontWeight: 400, fontSize: 15, opacity: 0.6, letterSpacing: 3, marginLeft: 6 }}>{LABEL[k][1]}</span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: x0, top: 44, fontFamily: font, color: 'rgba(243,237,226,.85)', fontSize: 30, fontWeight: 700, letterSpacing: 3 }}>
        木偶定妆照 <span style={{ fontSize: 18, fontWeight: 400, opacity: 0.55, marginLeft: 14, letterSpacing: 2 }}>《身体里的两个人》 · 关节木偶 · 姿势来自 CMU 动作捕捉</span>
      </div>
      <div style={{ position: 'absolute', left: x0, top: y0 + PH + 34, display: 'flex', gap: 28, fontFamily: font, fontSize: 15, color: 'rgba(243,237,226,.6)' }}>
        {SWATCH.map(([c, n]) => (<div key={n} style={{ display: 'flex', alignItems: 'center', gap: 9 }}><div style={{ width: 26, height: 26, borderRadius: 13, background: c, boxShadow: '0 0 0 1px rgba(255,255,255,.12)' }} />{n}</div>))}
        <div style={{ marginLeft: 30, opacity: 0.75 }}>站姿 CMU 80_25 · 坐姿 14_30 · 手到耳边 80_25 · 转头 77_04 · 身高 1.72 m</div>
      </div>
      <Overlay />
    </AbsoluteFill>
  );
};
export const _woodPreload = woodTex;

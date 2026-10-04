import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender } from 'remotion';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { camAt, type Key } from './lib';

/* Shared 3D helpers for 《零糖》: camera rig from keyframes, a studio reflection map (RoomEnvironment, no download),
   and a fonts gate so canvas textures that carry text are drawn after the web fonts load. */

export const CamRig: React.FC<{ T: number; keys: Key[]; fov?: number }> = ({ T, keys, fov }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(keys, T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  if (fov && (camera as THREE.PerspectiveCamera).fov !== fov) (camera as THREE.PerspectiveCamera).fov = fov;
  camera.updateProjectionMatrix();
  return null;
};

export const Env: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = intensity;
    pm.dispose();
  }, [gl, scene, intensity]);
  return null;
};

let FONTS_READY = false;
const FONT_SPECS = ['700 80px "Noto Serif CJK SC"', '900 80px "Noto Serif CJK SC"', '700 80px "Cormorant Garamond"', '600 80px "Cormorant Garamond"', '500 80px "Noto Sans CJK SC"'];
/** true once the fonts used inside canvas textures are loaded; holds the frame until then */
export const useFontsReady = () => {
  const [ready, setReady] = useState(FONTS_READY);
  const [handle] = useState(() => (FONTS_READY ? null : delayRender('canvas fonts', { timeoutInMilliseconds: 60000 })));
  useEffect(() => {
    if (FONTS_READY) return;
    Promise.all(FONT_SPECS.map((f) => document.fonts.load(f, '可乐无糖0COLA').catch(() => null))).then(() => {
      FONTS_READY = true; setReady(true); if (handle !== null) continueRender(handle);
    });
  }, [handle]);
  return ready;
};

export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** project a world point to 1920×1080 pixels for the camera keys at T (HTML labels that follow 3D things) */
const PROJ = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.01, 200);
export const project = (keys: Key[], T: number, p: number[], fov = 30) => {
  const { pos, look } = camAt(keys, T);
  PROJ.fov = fov; PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]);
  PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(PROJ);
  return { x: ((v.x + 1) / 2) * 1920, y: ((1 - v.y) / 2) * 1080 };
};

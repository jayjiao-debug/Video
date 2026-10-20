/* Props for the puppet's room: an old wooden chair, a side table with a fabric-shade lamp. All code-drawn. */
import * as THREE from 'three';
import { woodMat, Rig } from './Puppet';

const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, g: THREE.Group) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
};

/** a plain wooden chair; local origin on the floor under the seat centre, facing +Z (the sitter's forward) */
export const chair = (seatTop: number) => {
  const g = new THREE.Group(); const m = woodMat('chair', 0.7);
  const W = 0.46, D = 0.43, T = 0.032, L = 0.034;
  box(W, T, D, m, 0, seatTop - T / 2, 0, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(L, seatTop - T, L, m, sx * (W / 2 - L / 2 - 0.01), (seatTop - T) / 2, sz * (D / 2 - L / 2 - 0.01), g);
  for (const sx of [-1, 1]) box(L, 0.5, L * 0.9, m, sx * (W / 2 - L / 2 - 0.01), seatTop + 0.25, -D / 2 + L / 2 + 0.01, g); // back posts
  box(W - 0.03, 0.07, 0.022, m, 0, seatTop + 0.44, -D / 2 + 0.022, g);
  box(W - 0.03, 0.05, 0.02, m, 0, seatTop + 0.26, -D / 2 + 0.022, g);
  for (const sz of [-1, 1]) box(W - 0.06, 0.022, 0.018, m, 0, 0.16, sz * (D / 2 - 0.03), g); // stretchers
  return g;
};

/** seat the puppet: the chair top touches the lowest point of pelvis and thighs at the current pose */
export const seatUnder = (rig: Rig) => {
  rig.root.updateMatrixWorld(true);
  const parent = rig.root.parent; const inv = parent ? parent.matrixWorld.clone().invert() : new THREE.Matrix4();
  let minY = Infinity; const hips = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (const name of ['Hips', 'LeftUpLeg', 'RightUpLeg']) {
    rig.bones[name].children.forEach((c) => {
      const mesh = c as THREE.Mesh; if (!mesh.isMesh) return; const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 3) { v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(inv); minY = Math.min(minY, v.y); }
    });
  }
  rig.bones.Hips.getWorldPosition(hips).applyMatrix4(inv);
  return { seatTop: minY, hips };
};

/** side table + lamp with a fabric shade; origin on the floor; returns the bulb position (local) */
export const lamp = () => {
  const g = new THREE.Group(); const m = woodMat('chair', 0.65);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 40), m); top.position.y = 0.6; top.castShadow = top.receiveShadow = true; g.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.58, 16), m); leg.position.y = 0.29; leg.castShadow = true; g.add(leg);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 32), m); foot.position.y = 0.015; foot.castShadow = foot.receiveShadow = true; g.add(foot);
  const brass = new THREE.MeshStandardMaterial({ color: '#7d6440', roughness: 0.35, metalness: 0.7 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.03, 32), brass); base.position.y = 0.63; base.castShadow = true; g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.3, 12), brass); stem.position.y = 0.78; stem.castShadow = true; g.add(stem);
  const shadeMat = new THREE.MeshStandardMaterial({ color: '#e8cfa0', emissive: '#ffb765', emissiveIntensity: 0.9, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.93 });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.19, 40, 1, true), shadeMat); shade.position.y = 0.95; g.add(shade);
  const bulbPos = new THREE.Vector3(0, 0.93, 0);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff1d0' })); bulb.position.copy(bulbPos); g.add(bulb);
  return { g, bulbPos };
};

/** radial glow sprite texture (additive) */
let GLOW: THREE.CanvasTexture | null = null;
export const glowTex = () => {
  if (GLOW) return GLOW; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,255,255,.45)'); gr.addColorStop(0.45, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); GLOW = new THREE.CanvasTexture(c); return GLOW;
};
export const glowSprite = (col: string, size: number, opacity: number) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: col, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); return s;
};

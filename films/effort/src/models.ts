import * as THREE from 'three';
import { staticFile } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Downloaded Sketchfab models (asset farm request effort-models-01, table from money-models-01; credits in public/models/credits.json).
   One module cache per bundle; each model is centred on x/z, its base set on y = 0, and scaled so that its
   longest side (or its height) matches the real object in metres. Scenes clone what they need. */
export type ModelName = 'shell' | 'metronome' | 'piano' | 'bambooset' | 'bamboo' | 'lamp' | 'wallclock' | 'table';

/** real size in metres and which measure it sets: 'max' = longest side, 'h' = height */
export const SIZES: Record<ModelName, [number, 'max' | 'h']> = {
  shell: [0.45, 'max'], // an 18-pounder round is about 0.5 m long
  metronome: [0.23, 'h'],
  piano: [1.9, 'max'], // a parlour grand
  bambooset: [16, 'h'], // a stand of moso bamboo
  bamboo: [9, 'h'],
  lamp: [0.42, 'max'],
  wallclock: [0.34, 'max'],
  table: [0.76, 'h'],
};

const CACHE = new Map<ModelName, Promise<THREE.Group>>();

export const normalize = (obj: THREE.Object3D, size: number, by: 'max' | 'h') => {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  obj.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  const g = new THREE.Group();
  g.add(obj);
  g.scale.setScalar(size / (by === 'h' ? s.y : Math.max(s.x, s.y, s.z)));
  return g;
};

export const loadModel = (name: ModelName) => {
  if (!CACHE.has(name)) {
    CACHE.set(name, new GLTFLoader().loadAsync(staticFile(`models/${name}.glb`)).then((g) => {
      g.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
      });
      const [size, by] = SIZES[name];
      return normalize(g.scene, size, by);
    }));
  }
  return CACHE.get(name)!;
};

/** every material in a model, e.g. to tune roughness or env intensity */
export const materials = (obj: THREE.Object3D) => {
  const out = new Set<THREE.MeshStandardMaterial>();
  obj.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((x) => out.add(x as THREE.MeshStandardMaterial));
  });
  return [...out];
};

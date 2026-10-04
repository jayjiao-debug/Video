import * as THREE from 'three';
import { staticFile } from 'remotion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Downloaded Sketchfab models (asset farm request money-models-01; credits in public/models/credits.json).
   One module cache per bundle; each model is centred on x/z, its base set on y = 0, and scaled so that its
   longest side (or its height) matches the real object in metres. Scenes clone what they need. */
export type ModelName = 'bill100' | 'noodles' | 'table' | 'cowrie' | 'lioncoins' | 'cashcoin' | 'goldbar' | 'stonewheel' | 'canoe';

/** real size in metres and which measure it sets: 'max' = longest side, 'h' = height */
export const SIZES: Record<ModelName, [number, 'max' | 'h']> = {
  bill100: [0.156, 'max'], // US banknote 156 × 66 mm
  noodles: [0.2, 'max'], // a noodle bowl ≈ 20 cm across
  table: [0.76, 'h'],
  cowrie: [0.025, 'max'], // money cowry ≈ 2.5 cm
  lioncoins: [0.045, 'max'], // three small coins side by side
  cashcoin: [0.032, 'max'], // 半两 ≈ 3.2 cm
  goldbar: [0.116, 'max'], // a 1 kg bar
  stonewheel: [2.0, 'max'], // a mid-sized Yap stone
  canoe: [6.0, 'max'],
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

// BLOCK-OUT HELPERS for the WP1 place stubs (sets/corridor.ts ... sets/museum.ts): plain shapes in a colour, built with
// the props kit's flat toon paint (lit by the place's fill). The sets lane (WP2) replaces the stubs with the real
// places and may drop this file's use; nothing else depends on it.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";

export type Blk = ReturnType<typeof blockKit>;
/** shapes into `group`: each is a Mesh that casts and receives shadows, named `name` */
export const blockKit = (K: Kit, group: THREE.Group) => {
  const add = (name: string, geo: THREE.BufferGeometry, col: string | THREE.Material, o: { cast?: boolean; rough?: number; into?: THREE.Object3D } = {}) => {
    const m = new THREE.Mesh(geo, typeof col === "string" ? K.flat(col, { rough: o.rough ?? 0.85 }) : col);
    m.name = name; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.into ?? group).add(m);
    return m;
  };
  return {
    add,
    /** a box by its extents */
    box: (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, o: { cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), col, o),
    /** an upright cylinder standing on (x, y0, z) */
    cyl: (name: string, col: string, x: number, z: number, r: number, y0: number, y1: number, o: { seg?: number; r1?: number; cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.CylinderGeometry(o.r1 ?? r, r, y1 - y0, o.seg ?? 24).translate(x, (y0 + y1) / 2, z), col, o),
    /** a level floor quad (y) by its extents: one quad, no seams */
    floor: (name: string, col: string, x0: number, x1: number, z0: number, z1: number, y = 0, o: { into?: THREE.Object3D } = {}) =>
      add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2), col, { cast: false, ...o }),
    /** an unlit glowing shape (lantern paper, the moon): not in the ink pass's way (MeshBasicMaterial) */
    glow: (name: string, col: string, geo: THREE.BufferGeometry, o: { into?: THREE.Object3D } = {}) => {
      const m = new THREE.Mesh(geo, K.glow(col)); m.name = name; m.castShadow = false; (o.into ?? group).add(m); return m;
    },
  };
};
/** a fixed pseudo-random sequence 0..1 (never Math.random) */
export const seq = (seed: number) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

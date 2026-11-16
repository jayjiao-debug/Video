// THE PROPS of the Napoleon film behind the day engine's Props interface: every prop is hidden at the start of every
// frame (begin()); a shot puts the ones it shows.
//   flag   the tricolour of Arcole on its staff (2.3 m, a gilt spearhead): origin = the staff's foot; put(at, { yaw, tilt, t })
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit } from "../../kit/props/kit";

export type PropName = "flag";
export type PutO = { /** radians about y */ yaw?: number; /** radians: the staff leans toward its +x */ tilt?: number; /** seconds: the cloth moves */ t?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3, o?: PutO): void };

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const flag = (): Prop => {
    const g = new THREE.Group(); g.name = "flag";
    const add = (geo: THREE.BufferGeometry, col: string, rough = 0.8) => { const m = new THREE.Mesh(geo, K.flat(col, { rough })); m.castShadow = true; g.add(m); return m; };
    add(new THREE.CylinderGeometry(0.018, 0.02, 2.3, 10).translate(0, 1.15, 0), "#6b4a2c");
    add(new THREE.ConeGeometry(0.035, 0.16, 8).translate(0, 2.38, 0), "#dcae4a", 0.4);
    // the cloth: three bands (blue at the staff, white, red), heavy and wet, hanging with a slow fold
    const cloth: THREE.Mesh[] = [];
    ["#33466e", "#f1ede2", "#b23a36"].forEach((c, i) => {
      const geo = new THREE.PlaneGeometry(0.3, 0.72, 6, 8).translate(0.15 + i * 0.3, 1.86, 0);
      const m = add(geo, c, 0.95); (m.material as THREE.Material).side = THREE.DoubleSide; m.userData.x0 = (geo.attributes.position.array as Float32Array).slice(); cloth.push(m);
    });
    return {
      group: g,
      put(at, o = {}) {
        g.visible = true; g.position.copy(at); g.rotation.set(0, o.yaw ?? 0, -(o.tilt ?? 0), "YXZ");
        const t = o.t ?? 0;
        for (const m of cloth) {
          const p = m.geometry.attributes.position as THREE.BufferAttribute, a0 = m.userData.x0 as Float32Array;
          for (let i = 0; i < p.count; i++) { const x = a0[i * 3], y = a0[i * 3 + 1]; p.setXYZ(i, x, y - 0.22 * x * x + 0.012 * Math.sin(t * 1.6 + x * 5), 0.06 * Math.sin(x * 7 + y * 3 + t * 1.3) * x); }
          p.needsUpdate = true; m.geometry.computeVertexNormals();
        }
      },
    };
  };
  return {
    group,
    prop(name: PropName, key = ""): Prop {
      const id = `${name}|${key}`; let p = made.get(id);
      if (!p) { p = flag(); p.group.visible = false; group.add(p.group); made.set(id, p); }
      return p;
    },
    begin() { for (const p of made.values()) p.group.visible = false; },
  };
};
export type Props = ReturnType<typeof buildProps>;

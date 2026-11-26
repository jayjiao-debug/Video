// THE PROPS of 采访月老的一天: loose things a shot puts somewhere for a frame (every prop is hidden at the start of
// every frame; a shot puts the ones it shows). Built once with the props kit (src/kit/props/kit.ts): NOINK parts with
// their own hull outline.
//   spool       a spool of red thread
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit, Part, box, ball, limb, V, paint } from "../../kit/props/kit";

export type PropName = "spool";
export type PutO = { yaw?: number; pitch?: number; roll?: number; scale?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3 | [number, number, number], o?: PutO): Prop };

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const flat = (c: string, rough = 0.85) => K.flat(c, { rough });
  const BUILD: Record<PropName, () => THREE.Group> = {
    spool: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.006, 0), 0.004);
      P.add(flat("#d23a2a", 0.8), new THREE.CylinderGeometry(0.036, 0.036, 0.07, 16).translate(0, 0.047, 0), 0.004);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.088, 0), 0.004);
      return P.into(g, "spool");
    },
  };
  const prop = (name: PropName, key = ""): Prop => {
    const k = `${name}|${key}`;
    let p = made.get(k);
    if (!p) {
      const g = BUILD[name](); g.name = `prop.${k}`; g.visible = false; group.add(g);
      p = { group: g, put(at, o = {}) {
        const v = Array.isArray(at) ? new THREE.Vector3(...at) : at;
        g.position.copy(v); g.rotation.set(o.pitch ?? 0, o.yaw ?? 0, o.roll ?? 0, "YXZ"); g.scale.setScalar(o.scale ?? 1); g.visible = true; return p!;
      } };
      made.set(k, p);
    }
    return p;
  };
  return { group, prop, begin() { for (const p of made.values()) p.group.visible = false; } };
};
export type Props = ReturnType<typeof buildProps>;

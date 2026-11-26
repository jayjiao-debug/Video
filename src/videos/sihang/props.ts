// THE PROPS of 采访八百壮士的一天: loose things a shot puts somewhere for a frame (every prop is hidden at the start of
// every frame; a shot puts the ones it shows). Built once with the props kit (src/kit/props/kit.ts): NOINK parts with
// their own hull outline.
//   sack        a full grain sack (lying)            tin        a ration tin
//   paper       a folded newspaper                    cloth      a roll of cloth (the flag, rolled: never unrolled)
//   stretcher   two poles and canvas                  rifles     a pile of rifles on the ground (scene H)
//   lampHand    a kerosene lamp                       phone      a field telephone
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit, Part, box, ball, limb, V, paint } from "../../kit/props/kit";

export type PropName = "sack" | "tin" | "paper" | "cloth" | "stretcher" | "rifles" | "phone" | "mg" | "bayonet";
export type PutO = { yaw?: number; pitch?: number; roll?: number; scale?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3 | [number, number, number], o?: PutO): Prop };

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const flat = (c: string, rough = 0.85) => K.flat(c, { rough });
  const BUILD: Record<PropName, () => THREE.Group> = {
    sack: () => {
      const g = new THREE.Group(), P = new Part(K);
      const t = paint(128, 64, (cg, w, h) => { cg.fillStyle = "#cdbd97"; cg.fillRect(0, 0, w, h); cg.strokeStyle = "rgba(90,70,40,0.3)"; cg.lineWidth = 2; for (let x = 4; x < w; x += 8) { cg.beginPath(); cg.moveTo(x, 0); cg.lineTo(x, h); cg.stroke(); } cg.fillStyle = "rgba(150,60,40,0.55)"; cg.fillRect(44, 24, 30, 5); cg.fillRect(44, 34, 20, 5); });
      P.add(K.flat("#ffffff", { map: t, rough: 0.95 }), ball(V(0, 0.13, 0), 1, [0.36, 0.13, 0.22], 16), 0.008);
      return P.into(g, "sack");
    },
    tin: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#b9bcc0", 0.35), new THREE.CylinderGeometry(0.04, 0.04, 0.055, 16).translate(0, 0.0275, 0), 0.005);
      P.add(flat("#c9a24a", 0.6), new THREE.CylinderGeometry(0.0405, 0.0405, 0.03, 16).translate(0, 0.026, 0), 0);
      return P.into(g, "tin");
    },
    paper: () => {
      const g = new THREE.Group(), P = new Part(K);
      const t = paint(256, 320, (cg, w, h) => {
        cg.fillStyle = "#e6dcc2"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#2b2622";
        cg.fillRect(w * 0.08, h * 0.05, w * 0.84, h * 0.012); cg.font = `900 ${h * 0.12}px sans-serif`; cg.textAlign = "center";
        cg.fillRect(w * 0.1, h * 0.09, w * 0.8, h * 0.11);
        for (let k = 0; k < 16; k++) cg.fillRect(w * 0.08, h * (0.26 + k * 0.042), w * (0.5 + 0.34 * Math.abs(Math.sin(k * 1.7))), h * 0.012);
      });
      P.add(K.flat("#ffffff", { map: t, rough: 0.95 }), box(0.3, 0.012, 0.38, 0, 0.006, 0), 0.005);
      return P.into(g, "paper");
    },
    cloth: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#d9d3c2", 0.9), new THREE.CylinderGeometry(0.06, 0.06, 0.5, 14).rotateZ(Math.PI / 2).translate(0, 0.06, 0), 0.007);
      P.add(flat("#8a6a44", 0.8), new THREE.CylinderGeometry(0.063, 0.063, 0.03, 14).rotateZ(Math.PI / 2).translate(-0.12, 0.06, 0), 0);
      P.add(flat("#8a6a44", 0.8), new THREE.CylinderGeometry(0.063, 0.063, 0.03, 14).rotateZ(Math.PI / 2).translate(0.12, 0.06, 0), 0);
      return P.into(g, "cloth");
    },
    stretcher: () => {
      const g = new THREE.Group(), P = new Part(K);
      for (const s of [-1, 1]) P.add(flat("#6e4c30"), limb(V(-1.1, 0, s * 0.27), V(1.1, 0, s * 0.27), 0.022), 0.006);
      P.add(flat("#b9ad8a", 0.95), box(1.8, 0.02, 0.54, 0, -0.005, 0), 0.006);
      P.add(flat("#8f8a78", 0.95), box(1.1, 0.09, 0.5, -0.2, 0.06, 0), 0.006);       // a grey blanket over him
      return P.into(g, "stretcher");
    },
    rifles: () => {
      const g = new THREE.Group(), P = new Part(K);
      for (let i = 0; i < 14; i++) {
        const a = (i * 2.399) % (Math.PI * 2), r = 0.12 + 0.22 * ((i * 0.618) % 1), y = 0.03 + 0.035 * (i % 5), yaw = a + 0.6 * Math.sin(i * 1.3);
        const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(Math.cos(a) * r, y, Math.sin(a) * r);
        P.add(flat("#6e4c30"), box(0.8, 0.045, 0.06, -0.1, 0, 0), 0.006, m);
        P.add(flat("#3b3d42", 0.5), box(0.6, 0.02, 0.02, 0.5, 0.01, 0), 0.004, m);
      }
      return P.into(g, "rifles");
    },
    phone: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#5a4a34"), box(0.26, 0.16, 0.18, 0, 0.08, 0), 0.007);
      P.add(flat("#2e2c2e", 0.5), limb(V(-0.1, 0.19, 0), V(0.1, 0.19, 0), 0.022), 0.006);
      for (const s of [-1, 1]) P.add(flat("#2e2c2e", 0.5), ball(V(s * 0.1, 0.19, 0), 0.036), 0.005);
      return P.into(g, "phone");
    },
    mg: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#3b3d42", 0.5), limb(V(0, 0.28, -0.1), V(0, 0.3, 0.75), 0.03, 0.022), 0.006);
      P.add(flat("#3b3d42", 0.5), box(0.07, 0.11, 0.3, 0, 0.27, -0.2), 0.006);
      P.add(flat("#6e4c30"), box(0.05, 0.1, 0.24, 0, 0.24, -0.46), 0.006);
      for (const s of [-1, 1]) P.add(flat("#3b3d42", 0.5), limb(V(0, 0.27, 0.45), V(s * 0.2, 0, 0.6), 0.012), 0.005);
      return P.into(g, "mg");
    },
    bayonet: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#c9ccd0", 0.3), box(0.02, 0.004, 0.28, 0, 0, 0.14), 0.004);
      P.add(flat("#3b3d42", 0.5), box(0.03, 0.02, 0.09, 0, 0, -0.045), 0.004);
      return P.into(g, "bayonet");
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

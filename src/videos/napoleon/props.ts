// THE PROPS of the Napoleon film behind the day engine's Props interface: every prop is hidden at the start of every
// frame (begin()); a shot puts the ones it shows. put(at, o): `at` = the prop's origin; o.yaw = radians about y (0 = the
// prop's front toward +x for the animals, the cannon and the musket); o.t = seconds (what moves by itself).
//   mule / horse   origin = between the feet; { walk } 0..1 swings the legs with t; { rear } radians (the horse rears);
//                  the rider's hip sits at seatOf(at, yaw)
//   cannon         a barrel lashed in a hollowed tree trunk, dragged on the snow; origin = under its middle
//   crown          the gold crown, origin = the middle of its rim
//   plate          a plate with dinner: { full } 1 .. 0
//   card           one playing card (face up unless { back }): origin = its middle; { tilt } lifts its far edge
//   print          the London caricature on a sheet lying flat (0.3 x 0.4): origin = its middle
//   torch          a straw torch with a flame: origin = the grip; { lit } 0..1
//   musket         1.5 m, origin = the grip at its middle, pointing along +x at yaw 0; { tilt } raises the muzzle (rad)
//   can            a watering can, origin = its handle
//   flag           the tricolour on its staff
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit, type Kit } from "../../kit/props/kit";

export type PropName = "mule" | "horse" | "cannon" | "crown" | "plate" | "card" | "print" | "torch" | "musket" | "can" | "flag";
export type PutO = { yaw?: number; tilt?: number; t?: number; walk?: number; rear?: number; full?: number; back?: boolean; lit?: number; scale?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3, o?: PutO): void };

/** the saddle of a mule / horse standing at `at` with yaw: where the rider's hip sits, and its facing for the rig */
export const SADDLE_Y = 1.38;
export const seatOf = (at: THREE.Vector3, yaw: number) => ({ top: new THREE.Vector3(at.x, at.y + SADDLE_Y, at.z), floor: at.y + 0.5, back: 0, facing: yaw + Math.PI / 2 });

const glow = (r: number, g: number, b: number) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) }); m.toneMapped = false; return m; };

const animal = (K: Kit, o: { coat: string; dark: string; ears: number; blanket?: string }) => {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const add = (geo: THREE.BufferGeometry, col: string, to: THREE.Object3D = body) => { const m = new THREE.Mesh(geo, K.flat(col, { rough: 0.9 })); m.castShadow = true; to.add(m); return m; };
  add(new THREE.SphereGeometry(1, 22, 16).scale(0.74, 0.37, 0.3).translate(0, 0.98, 0), o.coat);
  add(new THREE.CylinderGeometry(0.13, 0.19, 0.72, 12).rotateZ(-0.75).translate(0.72, 1.3, 0), o.coat);
  add(new THREE.SphereGeometry(1, 16, 12).scale(0.25, 0.14, 0.13).rotateZ(-0.5).translate(1.06, 1.56, 0), o.coat);
  add(new THREE.SphereGeometry(1, 12, 10).scale(0.1, 0.085, 0.1).translate(1.24, 1.47, 0), o.dark);
  for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.045, o.ears, 8).rotateZ(0.25).rotateX(s * 0.3).translate(0.88, 1.7 + o.ears / 2, s * 0.08), o.coat);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.028, 8, 8).translate(1.08, 1.62, s * 0.12), "#141418");
  add(new THREE.BoxGeometry(0.5, 0.1, 0.05).rotateZ(-0.75).translate(0.64, 1.42, 0), o.dark);                    // the mane
  add(new THREE.CylinderGeometry(0.03, 0.05, 0.6, 8).rotateZ(0.45).translate(-0.82, 0.86, 0), o.dark);            // the tail
  if (o.blanket) { add(new THREE.BoxGeometry(0.62, 0.05, 0.64).translate(-0.02, 1.34, 0), o.blanket); add(new THREE.BoxGeometry(0.44, 0.09, 0.4).translate(-0.02, 1.38, 0), "#5a3a24"); }
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[0.48, 0.15], [0.48, -0.15], [-0.5, 0.15], [-0.5, -0.15]]) {
    const leg = new THREE.Group(); leg.position.set(lx, 0.86, lz); body.add(leg); legs.push(leg);
    add(new THREE.CylinderGeometry(0.06, 0.045, 0.82, 10).translate(0, -0.41, 0), o.coat, leg);
    add(new THREE.CylinderGeometry(0.055, 0.06, 0.08, 10).translate(0, -0.82, 0), "#2a2420", leg);
  }
  const put = (at: THREE.Vector3, p: PutO = {}) => {
    g.visible = true; g.position.copy(at); g.rotation.set(0, p.yaw ?? 0, 0); g.scale.setScalar(p.scale ?? 1);
    const t = p.t ?? 0, w = p.walk ?? 0, rear = p.rear ?? 0;
    body.rotation.z = rear; body.position.set(-0.5 * (1 - Math.cos(rear)) * 0.9, 0.9 * Math.sin(rear) * 0.55 + 0.02 * w * Math.sin(t * 9), 0);
    legs.forEach((l, i) => { l.rotation.z = w * 0.42 * Math.sin(t * 4.5 + [0, Math.PI, Math.PI, 0][i]) + (i < 2 ? -rear * 1.3 : -rear * 0.75); });
  };
  return { group: g, put } as Prop;
};

const things = (K: Kit): Record<Exclude<PropName, "mule" | "horse">, () => Prop> => {
  const mk = (name: string) => {
    const g = new THREE.Group(); g.name = name;
    const add = (geo: THREE.BufferGeometry, col: string, rough = 0.85) => { const m = new THREE.Mesh(geo, K.flat(col, { rough })); m.castShadow = true; g.add(m); return m; };
    return { g, add };
  };
  const basic = (g: THREE.Group, extra?: (p: PutO) => void): Prop => ({
    group: g,
    put(at, p = {}) { g.visible = true; g.position.copy(at); g.rotation.set(0, p.yaw ?? 0, p.tilt ?? 0, "YXZ"); g.scale.setScalar(p.scale ?? 1); extra?.(p); },
  });
  const tex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const sheet = (w: number, d: number, map: THREE.Texture) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide })); return m; };
  return {
    cannon: () => {
      const { g, add } = mk("cannon");
      add(new THREE.CylinderGeometry(0.3, 0.34, 2.4, 14).rotateZ(Math.PI / 2).translate(0, 0.3, 0), "#6a4a30");
      add(new THREE.CylinderGeometry(0.1, 0.14, 2.0, 14).rotateZ(Math.PI / 2).translate(0.1, 0.52, 0), "#3c4a44", 0.5);
      add(new THREE.TorusGeometry(0.15, 0.03, 8, 16).rotateY(Math.PI / 2).translate(1.1, 0.52, 0), "#3c4a44", 0.5);
      for (const x of [-0.7, 0.2, 0.9]) add(new THREE.TorusGeometry(0.33, 0.025, 6, 16).rotateY(Math.PI / 2).translate(x, 0.32, 0), "#b8a070");
      return basic(g);
    },
    crown: () => {
      const { g, add } = mk("crown");
      add(new THREE.CylinderGeometry(0.2, 0.18, 0.1, 20, 1, true).translate(0, 0.05, 0), "#dcae4a", 0.35).material.side = THREE.DoubleSide;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; add(new THREE.TorusGeometry(0.2, 0.014, 6, 12, Math.PI).rotateY(a).translate(0, 0.1, 0), "#dcae4a", 0.35); }
      add(new THREE.SphereGeometry(0.035, 10, 8).translate(0, 0.32, 0), "#a02c3a");
      add(new THREE.SphereGeometry(0.17, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.1, 0), "#8a2030");
      return basic(g);
    },
    plate: () => {
      const { g, add } = mk("plate");
      add(new THREE.CylinderGeometry(0.15, 0.1, 0.025, 20).translate(0, 0.0125, 0), "#f1ead8", 0.4);
      const food = [add(new THREE.SphereGeometry(0.06, 12, 10).scale(1.2, 0.6, 1).translate(-0.03, 0.05, 0), "#a8623a"), add(new THREE.SphereGeometry(0.035, 10, 8).translate(0.06, 0.045, 0.03), "#d8b05a"), add(new THREE.SphereGeometry(0.03, 10, 8).translate(0.05, 0.045, -0.04), "#6f9a48")];
      return basic(g, (p) => { const k = p.full ?? 1; food.forEach((m, i) => { m.visible = k > i / 3 + 0.01; }); });
    },
    card: () => {
      const g = new THREE.Group(); g.name = "card";
      const face = sheet(0.07, 0.1, tex(70, 100, (c) => { c.fillStyle = "#fbf6e8"; c.fillRect(0, 0, 70, 100); c.strokeStyle = "#2a2420"; c.lineWidth = 3; c.strokeRect(2, 2, 66, 96); c.fillStyle = "#a02c3a"; c.font = "bold 44px serif"; c.textAlign = "center"; c.fillText("A", 35, 52); c.beginPath(); c.moveTo(35, 62); c.lineTo(46, 76); c.lineTo(35, 90); c.lineTo(24, 76); c.fill(); }));
      const back = sheet(0.07, 0.1, tex(70, 100, (c) => { c.fillStyle = "#2f5a40"; c.fillRect(0, 0, 70, 100); c.strokeStyle = "#dcae4a"; c.lineWidth = 4; c.strokeRect(6, 6, 58, 88); c.fillStyle = "#dcae4a"; c.font = "bold 40px serif"; c.textAlign = "center"; c.fillText("N", 35, 64); }));
      face.position.y = 0.001; g.add(face, back);
      return basic(g, (p) => { face.visible = !p.back; back.visible = !!p.back; });
    },
    print: () => {
      const g = new THREE.Group(); g.name = "print";
      g.add(sheet(0.3, 0.4, tex(300, 400, (c) => {
        c.fillStyle = "#f3e8cc"; c.fillRect(0, 0, 300, 400); c.strokeStyle = "#3a2c22"; c.lineWidth = 4; c.strokeRect(8, 8, 284, 384); c.lineCap = "round";
        c.fillStyle = "rgba(58,44,34,0.85)"; c.beginPath(); c.moveTo(60, 190); c.bezierCurveTo(90, 110, 210, 108, 242, 192); c.bezierCurveTo(200, 172, 104, 172, 60, 190); c.fill();
        c.fillStyle = "#a8283a"; c.fillRect(142, 96, 14, 40);
        c.lineWidth = 5; c.beginPath(); c.arc(150, 222, 30, 0, 7); c.stroke(); c.fillStyle = "rgba(47,106,71,0.5)"; c.fillRect(128, 254, 44, 56); c.strokeRect(128, 254, 44, 56);
        c.beginPath(); c.moveTo(136, 310); c.lineTo(126, 352); c.moveTo(164, 310); c.lineTo(176, 352); c.moveTo(128, 266); c.lineTo(96, 292); c.moveTo(172, 266); c.lineTo(214, 236); c.lineTo(220, 196); c.stroke();
        c.fillStyle = "#3a2c22"; c.font = "bold 26px serif"; c.textAlign = "center"; c.fillText("LITTLE BONEY", 150, 52);
      })));
      return basic(g);
    },
    torch: () => {
      const { g, add } = mk("torch");
      add(new THREE.CylinderGeometry(0.02, 0.016, 0.8, 8).translate(0, 0.3, 0), "#6a4a2c");
      add(new THREE.CylinderGeometry(0.05, 0.03, 0.2, 8).translate(0, 0.74, 0), "#c8a85a");
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 8).translate(0, 0.94, 0), glow(2.6, 1.4, 0.4)); g.add(fl);
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8).translate(0, 0.9, 0), glow(2.8, 2.4, 1.4)); g.add(core);
      return basic(g, (p) => { const k = p.lit ?? 1, w = 1 + 0.12 * Math.sin((p.t ?? 0) * 17); fl.visible = core.visible = k > 0.02; fl.scale.set(k, k * w, k); core.scale.set(k, k * w, k); });
    },
    musket: () => {
      const { g, add } = mk("musket");
      add(new THREE.CylinderGeometry(0.013, 0.013, 1.1, 8).rotateZ(Math.PI / 2).translate(0.35, 0.02, 0), "#4a4c52", 0.5);
      add(new THREE.BoxGeometry(1.0, 0.05, 0.04).translate(-0.05, -0.01, 0), "#6a4428");
      add(new THREE.BoxGeometry(0.34, 0.11, 0.045).rotateZ(0.18).translate(-0.62, -0.05, 0), "#6a4428");
      add(new THREE.ConeGeometry(0.012, 0.36, 6).rotateZ(-Math.PI / 2).translate(1.07, 0.02, 0), "#c8ccd2", 0.3);
      return basic(g);
    },
    can: () => {
      const { g, add } = mk("can");
      add(new THREE.CylinderGeometry(0.1, 0.11, 0.2, 14).translate(0, -0.18, 0), "#7a8a8e", 0.5);
      add(new THREE.CylinderGeometry(0.018, 0.024, 0.3, 8).rotateZ(-0.9).translate(0.2, -0.1, 0), "#7a8a8e", 0.5);
      add(new THREE.TorusGeometry(0.09, 0.012, 6, 14, Math.PI).translate(0, -0.08, 0), "#6a7a7e", 0.5);
      return basic(g);
    },
    flag: () => {
      const { g, add } = mk("flag");
      add(new THREE.CylinderGeometry(0.018, 0.02, 2.3, 10).translate(0, 1.15, 0), "#6b4a2c");
      add(new THREE.ConeGeometry(0.035, 0.16, 8).translate(0, 2.38, 0), "#dcae4a", 0.4);
      ["#33466e", "#f1ede2", "#b23a36"].forEach((c, i) => { const m = add(new THREE.PlaneGeometry(0.3, 0.72, 2, 2).translate(0.15 + i * 0.3, 1.86, 0), c, 0.95); (m.material as THREE.Material).side = THREE.DoubleSide; });
      return basic(g);
    },
  };
};

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const T = things(K);
  const make = (name: PropName): Prop =>
    name === "mule" ? animal(K, { coat: "#7a5c44", dark: "#3a2a22", ears: 0.3, blanket: "#a02c3a" })
    : name === "horse" ? animal(K, { coat: "#e8e4dc", dark: "#b8b2a8", ears: 0.12, blanket: "#2f5a40" })
    : T[name]();
  return {
    group,
    prop(name: PropName, key = ""): Prop {
      const id = `${name}|${key}`; let p = made.get(id);
      if (!p) { p = make(name); p.group.visible = false; group.add(p.group); made.set(id, p); }
      return p;
    },
    begin() { for (const p of made.values()) p.group.visible = false; },
  };
};
export type Props = ReturnType<typeof buildProps>;

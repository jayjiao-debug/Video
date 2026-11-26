// THE PROPS of 采访月老的一天: loose things a shot puts somewhere for a frame (every prop is hidden at the start of
// every frame; a shot puts the ones it shows). Built once with the props kit (src/kit/props/kit.ts): NOINK parts with
// their own hull outline.
//   spool       a spool of red thread
import * as THREE from "three";
import type { Mats } from "../bt/pbr";
import { makeKit, Part, box, ball, V, paint, FONT, NOINK } from "../../kit/props/kit";

export const RED = "#d8362a";

export type PropName = "spool" | "book" | "bookShut" | "phone" | "laptop" | "bag" | "file" | "slip" | "bowl" | "moon";
export type PutO = { yaw?: number; pitch?: number; roll?: number; scale?: number };
export type Prop = { group: THREE.Group; put(at: THREE.Vector3 | [number, number, number], o?: PutO): Prop };

export const buildProps = (M: Mats) => {
  const K = makeKit(M);
  const group = new THREE.Group(); group.name = "props";
  const made = new Map<string, Prop>();
  const flat = (c: string, rough = 0.85) => K.flat(c, { rough });
  const tex = (w: number, h: number, fn: (g: CanvasRenderingContext2D, w: number, h: number) => void) => K.flat("#ffffff", { map: paint(w, h, fn), rough: 0.95 });
  const BUILD: Record<PropName, () => THREE.Group> = {
    spool: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.006, 0), 0.004);
      P.add(flat(RED, 0.8), new THREE.CylinderGeometry(0.036, 0.036, 0.07, 16).translate(0, 0.047, 0), 0.004);
      P.add(flat("#c9a063", 0.7), new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16).translate(0, 0.088, 0), 0.004);
      return P.into(g, "spool");
    },
    // 姻缘簿, open: two cream pages on a blue cloth cover, held flat (pages up, spine along z)
    book: () => {
      const g = new THREE.Group(), P = new Part(K);
      const page = tex(256, 320, (cg, w, h) => {
        cg.fillStyle = "#f4ead0"; cg.fillRect(0, 0, w, h); cg.strokeStyle = "rgba(170,50,40,0.55)"; cg.lineWidth = 2;
        for (let x = 0.14; x < 0.95; x += 0.145) { cg.beginPath(); cg.moveTo(w * x, h * 0.06); cg.lineTo(w * x, h * 0.94); cg.stroke(); }
        cg.fillStyle = "rgba(40,34,30,0.8)"; for (let c = 0; c < 6; c++) for (let r = 0; r < 9; r++) if ((c * 7 + r * 3) % 5) cg.fillRect(w * (0.165 + c * 0.145), h * (0.09 + r * 0.094), w * 0.085, h * 0.06);
        cg.fillStyle = "rgba(200,40,30,0.85)"; cg.beginPath(); cg.arc(w * 0.78, h * 0.86, w * 0.07, 0, 7); cg.fill();
      });
      P.add(flat("#3d5a8a", 0.9), box(0.36, 0.012, 0.25, 0, 0.006, 0), 0.005);
      for (const sx of [-1, 1]) P.add(page, box(0.165, 0.014, 0.23, sx * 0.086, 0.019, 0), 0.003);
      return P.into(g, "book");
    },
    // the same book shut (carried under his arm, on the step)
    bookShut: () => {
      const g = new THREE.Group(), P = new Part(K);
      const cover = tex(128, 180, (cg, w, h) => {
        cg.fillStyle = "#3d5a8a"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#f4ead0"; cg.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.6);
        cg.fillStyle = "#2a2622"; cg.font = `900 ${h * 0.16}px ${FONT}`; cg.textAlign = "center"; cg.textBaseline = "middle";
        [..."姻缘簿"].forEach((c, i) => cg.fillText(c, w * 0.5, h * (0.22 + i * 0.19)));
        cg.strokeStyle = "#f0c04a"; cg.lineWidth = 3; for (const y of [0.2, 0.4, 0.6, 0.8]) { cg.beginPath(); cg.moveTo(0, h * y); cg.lineTo(w * 0.08, h * y); cg.stroke(); }
      });
      P.add(cover, box(0.19, 0.034, 0.26, 0, 0.017, 0), 0.005);
      P.add(flat("#f4ead0", 0.95), box(0.184, 0.024, 0.254, 0.004, 0.017, 0), 0);
      return P.into(g, "bookShut");
    },
    // a phone lying screen up (lit): a dating app card
    phone: () => {
      const g = new THREE.Group(), P = new Part(K);
      const scr = new THREE.MeshBasicMaterial({ map: paint(128, 256, (cg, w, h) => {
        cg.fillStyle = "#fdf4f6"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#ff6f91"; cg.fillRect(0, 0, w, h * 0.1);
        cg.fillStyle = "#cfd8e6"; cg.fillRect(w * 0.1, h * 0.16, w * 0.8, h * 0.52); cg.fillStyle = "#8fa3bf"; cg.beginPath(); cg.arc(w * 0.5, h * 0.36, w * 0.17, 0, 7); cg.fill(); cg.fillRect(w * 0.24, h * 0.5, w * 0.52, h * 0.18);
        cg.fillStyle = "#ff5a6e"; cg.beginPath(); cg.arc(w * 0.7, h * 0.84, w * 0.11, 0, 7); cg.fill(); cg.fillStyle = "#b9c2cf"; cg.beginPath(); cg.arc(w * 0.3, h * 0.84, w * 0.11, 0, 7); cg.fill();
      }) });
      P.add(flat("#22242c", 0.4), box(0.075, 0.009, 0.15, 0, 0.0045, 0), 0.004);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138).rotateX(-Math.PI / 2).translate(0, 0.0096, 0), scr); m.layers.set(NOINK); m.name = "phone.screen";
      P.into(g, "phone"); g.add(m); return g;
    },
    // a laptop, open (lid toward +z leaning back): put with yaw so the lid's back faces the camera or the screen faces its user
    laptop: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#b9bec8", 0.4), box(0.3, 0.014, 0.2, 0, 0.007, 0), 0.005);
      const lid = new THREE.Matrix4().makeRotationX(-0.3).setPosition(0, 0.012, 0.1);
      P.add(flat("#aeb4c0", 0.4), box(0.3, 0.2, 0.01, 0, 0.1, 0), 0.005, lid);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17).rotateY(Math.PI).translate(0, 0.1, -0.006).applyMatrix4(lid), new THREE.MeshBasicMaterial({ color: "#bfe0ff" })); scr.layers.set(NOINK); scr.name = "laptop.screen";
      P.into(g, "laptop"); g.add(scr); return g;
    },
    // a takeaway bag: brown paper, twisted handles, a receipt stapled on
    bag: () => {
      const g = new THREE.Group(), P = new Part(K);
      const paper = tex(128, 128, (cg, w, h) => { cg.fillStyle = "#c79a62"; cg.fillRect(0, 0, w, h); cg.fillStyle = "#f6f2e6"; cg.fillRect(w * 0.3, h * 0.22, w * 0.4, h * 0.5); cg.fillStyle = "#3a3632"; for (let i = 0; i < 6; i++) cg.fillRect(w * 0.35, h * (0.28 + i * 0.07), w * (0.18 + 0.1 * ((i * 3) % 2)), h * 0.025); cg.fillStyle = "#e0453a"; cg.fillRect(w * 0.3, h * 0.78, w * 0.4, h * 0.08); });
      P.add(paper, box(0.2, 0.22, 0.12, 0, 0.11, 0), 0.006);
      for (const sz of [-1, 1]) P.add(flat("#a67c48", 0.9), new THREE.TorusGeometry(0.045, 0.006, 6, 14, Math.PI).translate(0, 0.22, sz * 0.035), 0.003);
      return P.into(g, "bag");
    },
    // a case file: a cream paper folder tied with red thread, a label strip (the name is drawn by the HUD, not here)
    file: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#e9dcb8", 0.95), box(0.2, 0.26, 0.022, 0, 0.13, 0), 0.005);
      P.add(flat("#f8f1dc", 0.95), box(0.06, 0.18, 0.004, -0.05, 0.14, 0.013), 0);
      P.add(flat(RED, 0.8), box(0.204, 0.012, 0.026, 0, 0.09, 0), 0); P.add(flat(RED, 0.8), box(0.012, 0.264, 0.026, 0.04, 0.13, 0), 0);
      return P.into(g, "file");
    },
    // an incense prayer slip: a red paper strip with gold characters (求姻缘)
    slip: () => {
      const g = new THREE.Group(), P = new Part(K);
      const t = tex(96, 256, (cg, w, h) => { cg.fillStyle = "#c8281e"; cg.fillRect(0, 0, w, h); cg.strokeStyle = "#f0c04a"; cg.lineWidth = 4; cg.strokeRect(6, 6, w - 12, h - 12); cg.fillStyle = "#f6d46a"; cg.font = `900 ${h * 0.2}px ${FONT}`; cg.textAlign = "center"; cg.textBaseline = "middle"; [..."求姻缘"].forEach((c, i) => cg.fillText(c, w / 2, h * (0.22 + i * 0.28))); });
      P.add(t, box(0.11, 0.3, 0.004, 0, 0.15, 0), 0.004);
      return P.into(g, "slip");
    },
    // the full moon that rises behind him on his card: a pale gold disc with soft craters and a ring of red thread
    // (unlit, facing +z; radius 0.62 m)
    moon: () => {
      const g = new THREE.Group();
      const t = paint(512, 512, (cg, w, h) => {
        cg.clearRect(0, 0, w, h);
        const gr = cg.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.5); gr.addColorStop(0, "rgba(246,208,110,0.55)"); gr.addColorStop(1, "rgba(246,208,110,0)");
        cg.fillStyle = gr; cg.fillRect(0, 0, w, h);
        cg.fillStyle = "#fbeab4"; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.36, 0, 7); cg.fill();
        cg.fillStyle = "rgba(226,178,84,0.32)"; for (const [x, y, r] of [[0.38, 0.38, 0.07], [0.6, 0.52, 0.09], [0.46, 0.66, 0.05], [0.64, 0.34, 0.04], [0.33, 0.56, 0.035]]) { cg.beginPath(); cg.arc(w * x, h * y, w * r, 0, 7); cg.fill(); }
        cg.strokeStyle = "#e8b84e"; cg.lineWidth = 7; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.36, 0, 7); cg.stroke();
        cg.strokeStyle = "#9a1c14"; cg.lineWidth = 11; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.415, 0, 7); cg.stroke();
        cg.strokeStyle = "#e2463a"; cg.lineWidth = 6; cg.beginPath(); cg.arc(w / 2, h / 2, w * 0.415, 0, 7); cg.stroke();
        cg.fillStyle = "#e2463a"; cg.strokeStyle = "#9a1c14"; cg.lineWidth = 3; cg.beginPath(); cg.arc(w / 2, h * 0.085, w * 0.022, 0, 7); cg.fill(); cg.stroke();
      });
      const cg0 = new THREE.CircleGeometry(0.735, 56), uv = cg0.attributes.uv, ps = cg0.attributes.position;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / 1.72 + 0.5, ps.getY(i) / 1.72 + 0.5);
      const m = new THREE.Mesh(cg0, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
      m.layers.set(NOINK); m.name = "moon.card"; m.renderOrder = 2; g.add(m); return g;
    },
    // a bowl of noodles with an egg on top
    bowl: () => {
      const g = new THREE.Group(), P = new Part(K);
      P.add(flat("#f2efe8", 0.5), new THREE.CylinderGeometry(0.075, 0.045, 0.06, 18).translate(0, 0.03, 0), 0.005);
      P.add(flat("#e0b062", 0.8), new THREE.CylinderGeometry(0.068, 0.068, 0.006, 18).translate(0, 0.058, 0), 0);
      P.add(flat("#fff8e8", 0.6), ball(V(0.02, 0.064, 0.01), 0.028, [1, 0.35, 1]), 0); P.add(flat("#f2a93b", 0.6), ball(V(0.02, 0.072, 0.01), 0.013, [1, 0.6, 1]), 0);
      return P.into(g, "bowl");
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
  // ---- THE RED THREADS: tubes through a few points, rebuilt each frame they are shown. Only her lens sees them, so
  // they glow a little: an unlit red core and a soft additive sleeve.
  type Th = { core: THREE.Mesh; glow: THREE.Mesh };
  const threads = new Map<string, Th>();
  const coreMat = (col: string) => new THREE.MeshBasicMaterial({ color: col });
  const glowMat = new THREE.MeshBasicMaterial({ color: "#ff5a3c", transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
  const CORE: Record<string, THREE.MeshBasicMaterial> = {};
  /** a thread through `pts` (world): r = radius (default 0.007), glow 0..1, col (default the film's red), tension 0..1 (0.5), cut 0..1 = draw only that share from the start */
  const thread = (key: string, pts: THREE.Vector3[], o: { r?: number; glow?: number; col?: string; cut?: number; closed?: boolean } = {}) => {
    let t = threads.get(key);
    if (!t) {
      const core = new THREE.Mesh(new THREE.BufferGeometry(), coreMat(RED)), glow = new THREE.Mesh(new THREE.BufferGeometry(), glowMat.clone());
      for (const m of [core, glow]) { m.layers.set(NOINK); m.frustumCulled = false; m.castShadow = m.receiveShadow = false; group.add(m); }
      core.name = `thread.${key}`; glow.name = `thread.${key}.glow`; glow.renderOrder = 4;
      t = { core, glow }; threads.set(key, t);
    }
    if (pts.length < 2) return;
    const col = o.col ?? RED; t.core.material = (CORE[col] ??= coreMat(col));
    const curve = new THREE.CatmullRomCurve3(pts, !!o.closed, "catmullrom", 0.5), n = Math.max(12, Math.min(160, pts.length * 10)), r = o.r ?? 0.007;
    t.core.geometry.dispose(); t.glow.geometry.dispose();
    t.core.geometry = new THREE.TubeGeometry(curve, n, r, 6, !!o.closed); t.glow.geometry = new THREE.TubeGeometry(curve, n, r * 3.2, 6, !!o.closed);
    if (o.cut !== undefined && o.cut < 1) { const c = Math.max(0, Math.floor(n * o.cut)) * 6 * 6; t.core.geometry.setDrawRange(0, c); t.glow.geometry.setDrawRange(0, c); }
    t.core.visible = true; t.glow.visible = (o.glow ?? 0) > 0.01; (t.glow.material as THREE.MeshBasicMaterial).opacity = 0.34 * (o.glow ?? 0);
  };
  /** points of a thread hanging from a to b with `sag` metres of droop in the middle, n inner points; wob = a small sway */
  const hang = (a: THREE.Vector3, b: THREE.Vector3, sag = 0.15, n = 5, wob = 0) => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= n + 1; i++) { const u = i / (n + 1), p = a.clone().lerp(b, u); p.y -= sag * 4 * u * (1 - u); if (wob) p.x += wob * Math.sin(u * Math.PI) ; out.push(p); }
    return out;
  };
  return { group, prop, thread, hang, begin() { for (const p of made.values()) p.group.visible = false; for (const t of threads.values()) { t.core.visible = false; t.glow.visible = false; } } };
};
export type Props = ReturnType<typeof buildProps>;

import * as THREE from "three";
import type { Acc } from "../rig3d";

/** a flat slab with rounded corners, w x h x t round its centre, its two faces toward +z and -z. uv: the +z face
 *  takes the left half of a map, the -z face the right half (turned so that it reads right when seen from behind),
 *  the rim one point of the right half's edge. Hard edges: PartKit.solid closes the ink hull over them. */
const slab = (w: number, h: number, t: number, r: number, seg = 6) => {
  const ring: [number, number, number, number][] = [];                       // x, y and the outline's normal
  for (const [cx, cy, a0] of [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]] as [number, number, number][]) {
    for (let k = 0; k <= seg; k++) {
      const a = ((a0 + (90 * k) / seg) * Math.PI) / 180;
      ring.push([cx * (w / 2 - r) + r * Math.cos(a), cy * (h / 2 - r) + r * Math.sin(a), Math.cos(a), Math.sin(a)]);
    }
  }
  const n = ring.length, pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const f of [1, -1]) {                                                 // the two faces: a fan round the centre
    const base = pos.length / 3, u = (x: number) => (f > 0 ? (x / w + 0.5) * 0.5 : 0.5 + (0.5 - x / w) * 0.5);
    pos.push(0, 0, (f * t) / 2); nor.push(0, 0, f); uv.push(u(0), 0.5);
    for (const [x, y] of ring) { pos.push(x, y, (f * t) / 2); nor.push(0, 0, f); uv.push(u(x), y / h + 0.5); }
    for (let k = 0; k < n; k++) { const a = base + 1 + k, b = base + 1 + ((k + 1) % n); if (f > 0) idx.push(base, a, b); else idx.push(base, b, a); }
  }
  const side = pos.length / 3;                                               // the rim
  for (const [x, y, nx, ny] of ring) for (const f of [1, -1]) { pos.push(x, y, (f * t) / 2); nor.push(nx, ny, 0); uv.push(0.985, 0.5); }
  for (let k = 0; k < n; k++) { const a = side + 2 * k, b = side + 2 * ((k + 1) % n); idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};

/** A phone in one hand (hand 1 = the person's left, the default): a small rounded slab, a lighter screen on the face
 *  that looks at its holder, a coloured case with a camera on the back (col = the case; saturated, so it never reads
 *  as a badge against the clothes). The poses know it (PartKit.held, `posed`): "phone" turns the screen to the face
 *  (amount 0) and lays it against the side of the head (amount 1); a resting hand lays it face down under itself; in
 *  any other pose it hangs from the hand beside the leg. state.hide = ["phone"] leaves it in the pocket. */
export const phone = (o: { col?: string; hand?: 0 | 1; screen?: string } = {}): Acc => {
  const col = o.col ?? "#d9467f", hand = o.hand ?? 1, screen = o.screen ?? "#bfe3ff", W = 0.08, H = 0.15, T = 0.013;
  return {
    name: "phone", slots: [hand ? "hand1" : "hand0"], key: `${col}|${hand}|${screen}`,
    build(b) {
      // unposed: upside down below the hand, flat beside the leg, its face a little outward. Posed: the group's
      // origin is the hand: the hand lies on the lower back of the phone (the phone is on +z of it).
      const g = b.held(hand, { posed: true, rot: [0, (hand ? 1 : -1) * 1.25, Math.PI] });
      const map = b.tex(256, 256, (c) => {
        const rr = (x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
        c.fillStyle = col; c.fillRect(0, 0, 256, 256);
        // the face (left half): a dark bezel, the lit screen, two pale lines of something to read
        c.fillStyle = "#20232b"; c.fillRect(0, 0, 128, 256);
        c.fillStyle = screen; rr(9, 12, 110, 232, 13);
        c.fillStyle = "#ffffff"; rr(22, 40, 84, 50, 9); rr(22, 104, 58, 30, 9);
        // the back (right half): the case, a lighter line near the bottom, the camera at the top corner
        c.strokeStyle = "rgba(255,255,255,0.4)"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(160, 226); c.lineTo(224, 226); c.stroke();
        c.fillStyle = "#2c2f3a"; rr(142, 16, 50, 50, 13);
        c.fillStyle = "#11131a"; for (const [x, y] of [[157, 31], [157, 51], [177, 41]]) { c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill(); }
      }, `phone|${col}|${screen}`);
      b.solid(g, slab(W, H, T, 0.014), { map, ink: 0.0034 }).position.set(0, 0.03, 0.011 + T / 2);
    },
  };
};

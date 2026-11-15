// THE NIGHT HOOD of the Qin film (PLAN 2 EMPEROR_HOOD; segment F, 兰池): the emperor's disguise, and its gag.
//   hood(o)   a plain dark cloth hood: one soft shell from the crown down over the ears to the nape, the face open (it
//             is the kit helmet's neck guard shape, kit acc/headwear.ts wrapGeo, copied here because it is private
//             there), a rolled hem round the face opening, a soft point at the back of the crown, a short cape over the
//             shoulders painted on the clothes; and the gag: five strings of the crown's gold beads (冕旒) still poking
//             out from under its front edge over the brow (as Wanbi's acc/crown.ts mianCrown hangs them: they end
//             above the brows, never in the face zone): hoodBeads(), their own accessory, so a shot tucks them in with
//             hide: ["hoodBeads"] (F05: he shoves them in).
// Slots hat + crown + neck (the cape). hide: ["qinHood"] (the shell and the point; the painted cape stays).
// The kit's rules hold (group/kit/RIG3D.md): nothing 3D in front of the face (62 deg each side of the front, below
// FACE_ZONE.top): the front edge sits 46 deg from the crown and the beads end 0.33 head radii above the head's middle; the
// shell's lower edge tucks in to the skin; nothing random, nothing that changes from frame to frame.
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { rad, shade } from "../../group/kit/rigacc/shapes";
import { leafGeo, weld } from "../../wanbi/acc/envoy";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** a wrap round the head that leaves the face open (copy of the kit headwear.ts WrapO / wrapEdge / wrapGeo): from the
 *  crown it reaches down to `front` degrees over the face, and from a0 to a1 degrees round from the face side its edge
 *  drops to `low` (plus `back` more at the very back); arch = how much lower the edge is at a0 than in the middle */
type WrapO = { r: number; front: number; low: number; a0: number; a1: number; back?: number; tuck?: number; arch?: number };
const wrapEdge = (o: WrapO, az: number) => o.front + (o.arch ?? 0) * Math.min(1, Math.abs(az) / o.a0) ** 2 + (o.low - o.front - (o.arch ?? 0)) * smooth((Math.abs(az) - o.a0) / (o.a1 - o.a0)) + (o.back ?? 0) * ((1 - Math.cos(rad(az))) / 2) ** 2;
const wrapGeo = (o: WrapO) => {
  const half = [0];
  for (let a = 0; a < 180 - 1e-6; ) { a = Math.min(180, a + (a > o.a0 - 5 && a < o.a1 + 5 ? 1.5 : 2.5)); half.push(a); }
  const azs = [...half.slice(1).reverse().map((a) => -a), ...half], NT = 36, tuck = o.tuck ?? 9;
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (const az of azs) {
    const e = wrapEdge(o, az), sn = Math.sin(rad(az)), cs = Math.cos(rad(az)), tk = 1 - smooth((Math.abs(az) - 86) / 12);
    for (let j = 0; j <= NT; j++) {
      const th = e * (1 - (1 - j / NT) ** 1.5), rho = lerp(o.r, 0.995, tk * smooth((th - (e - tuck)) / tuck)), st = Math.sin(rad(th)), ct = Math.cos(rad(th));
      pos.push(rho * st * sn, rho * ct, rho * st * cs); nor.push(st * sn, ct, st * cs); uv.push((az + 180) / 360, 1 - th / 180);
    }
  }
  for (let c = 0; c < azs.length - 1; c++) for (let j = 0; j < NT; j++) { const A = c * (NT + 1) + j, B = A + 1, C = A + NT + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};
/** one string of beads draped over the forehead (after Wanbi acc/crown.ts beadString): beads of radius r (head units)
 *  centred on `pts` (metres, round the solid's origin: the head's shape already applied, b.toM) on a cord through
 *  them, merged into one welded solid */
const drapeString = (R: number, pts: THREE.Vector3[], r: number) => {
  const parts: THREE.BufferGeometry[] = [];
  for (const p of pts) { const s = new THREE.SphereGeometry(r * R, 12, 9); s.translate(p.x, p.y, p.z); parts.push(s); }
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], d = b.clone().sub(a), len = d.length();
    const cord = new THREE.CylinderGeometry(r * R * 0.42, r * R * 0.42, len, 8, 2);
    cord.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); cord.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    parts.push(cord);
  }
  const pos: number[] = [], idx: number[] = [];
  let base = 0;
  for (const g of parts) {
    const P = g.attributes.position;
    for (let i = 0; i < P.count; i++) pos.push(P.getX(i), P.getY(i), P.getZ(i));
    const I = g.index!; for (let i = 0; i < I.count; i++) idx.push(base + I.getX(i));
    base += P.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  return weld(g);
};

/** the hood's shape: its front edge over the brow (50 deg from the crown: higher than a helmet's 58, so the brows and
 *  the lids stay clear), down past the ears to the jaw at the sides and to the nape at the back */
const HOOD: WrapO = { r: 1.1, front: 46, arch: 7, low: 122, a0: 62, a1: 84, back: 20, tuck: 9 };
const GOLD = "#e2b03a";
export type HoodO = { col?: string; hem?: string; cape?: boolean };
/** the night hood; see the head of this file. col = the cloth (default a dark grey-violet, never black), hem = the
 *  rolled edge, cape = the short cape painted over the shoulders. The beads are hoodBeads() (their own accessory) */
export const hood = (o: HoodO = {}): Acc => {
  const col = o.col ?? "#3b3644", hem = o.hem ?? shade(col, 1.35), cape = o.cape ?? true;
  return {
    name: "qinHood", slots: ["hat", "crown", "neck"], noHairProps: true, hat: { rim: 50 },
    key: ["qinHood", col, hem, cape].join("|"),
    outfit: cape ? (c) => {
      // the short cape: the hood's cloth round the shoulders from under the chin down a third of the body, its hem
      // dipping a little at the front and the back; folds down from the neck
      const lo = (az: number) => c.chin - 0.27 - 0.03 * Math.cos(rad(az * 2)), pts: [number, number][] = [];
      for (let az = -180; az <= 180; az += 6) pts.push(c.P(az, lo(az)));
      for (let az = 180; az >= -180; az -= 6) pts.push(c.P(az, 1));
      c.poly(pts, col, shade(col, 0.45), c.LW * 1.4);
      for (const az of [-150, -110, -70, -35, 35, 70, 110, 150]) c.line([c.P(az, c.chin - 0.02), c.P(az + 3, lo(az) + 0.03)], shade(col, 0.78), c.LW);
      c.line(pts.slice(0, 61), hem, c.LW * 1.6);
    } : undefined,
    build(b) {
      // the shell: the cloth, a rolled hem along the face opening and the lower edge, faint folds from the crown
      const map = b.tex(1024, 512, (g) => {
        const X = (az: number) => ((az + 180) / 360) * 1024, Y = (th: number) => (th / 180) * 512;
        g.fillStyle = col; g.fillRect(0, 0, 1024, 512);
        g.strokeStyle = shade(col, 0.8); g.lineWidth = 6; g.lineCap = "round";
        for (const az of [-150, -118, -86, 86, 118, 150, 180]) { g.beginPath(); g.moveTo(X(az), Y(24)); g.quadraticCurveTo(X(az + 6), Y(70), X(az + 2), Y(wrapEdge(HOOD, az) - 8)); g.stroke(); }
        const edge = (deg: number, cc: string) => {
          g.beginPath(); for (let az = -180; az <= 180; az += 0.5) { const x = X(az), y = Y(wrapEdge(HOOD, az)); if (az === -180) g.moveTo(x, y); else g.lineTo(x, y); }
          g.strokeStyle = cc; g.lineWidth = 2 * deg * (512 / 180); g.lineJoin = "round"; g.stroke();
        };
        edge(7, hem); edge(1.6, shade(col, 0.42));
      }, `qinHood|${col}|${hem}`);
      b.shell({ geo: wrapGeo(HOOD), paint: "cloth", map, col: "#ffffff" });
      // the soft point at the back of the crown: a short leaf that leans back and droops (rooted inside the shell)
      b.solid("head", leafGeo(b.toM, V(0, 0.82, -0.42), V(0, 1.2, -0.72), V(0, 1.02, -1.14), 0.42, 0.3, 0.38), { col, paint: "cloth", ink: 0.008 });
    },
  };
};

/** THE GAG: five strings of the crown's gold beads (2, 2, 3, 2, 2 beads) poking out from under the hood's front edge
 *  and lying on the forehead (they follow its curve, just off the skin: a string hung plumb from the edge would go
 *  into the forehead), ending well above the brows (the lowest bead's middle 0.45 head radii above the head's middle,
 *  its bottom 0.39: outside the face zone). Worn WITH hood() (its own accessory so a shot can tuck them in:
 *  hide: ["hoodBeads"], F05 on). No slot. */
export const hoodBeads = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? GOLD, r = 0.062, rho = 1 + r + 0.012, step = (2 * r + 0.03) / rho, th0 = rad(HOOD.front + 2.5);
  return {
    name: "hoodBeads", slots: [], key: `hoodBeads|${col}`,
    build(b) {
      for (let i = 0; i < 5; i++) {
        const az = rad(-26 + i * 13), n = i === 2 ? 3 : 2, pts: THREE.Vector3[] = [];
        const o0 = b.toM(V(0, 0, 0));
        for (let k = 0; k < n; k++) { const th = th0 + k * step; pts.push(b.toM(V(rho * Math.sin(th) * Math.sin(az), rho * Math.cos(th), rho * Math.sin(th) * Math.cos(az))).sub(o0)); }
        b.put(b.solid("head", drapeString(b.R, pts, r), { col, ink: 0.0042 }), 0, 0, 0);
      }
    },
  };
};

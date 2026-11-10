import * as THREE from "three";
import { sunkHull, type Acc } from "../rig3d";

const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;

/** What westernHat needs, in head units (the head's radius = 1; heights from the head's centre):
 *  the crown: an oval tub, a / b its half width / half depth where it would stand on y = foot (inside the head), h
 *    tall from there, narrowing to `top` of that at a rounded shoulder; its top sinks into a crease from front to back
 *    (`dent` deep, about 2 x dentW wide) and the ridges beside the crease sag in the middle (`sag`, a part of h);
 *  the brim: its middle line leaves the circle of radius rIn at height y and reaches the radius out(az) (az = degrees
 *    from the face side, + = the person's left); lift(az, t) = how far above y it is at the part t (0 = rIn .. 1 = the
 *    edge) of the way; `thick` near the crown, thick x taper at the rounded edge, measured square to the brim;
 *  fillet: the rounding where the brim meets the crown. */
type WesternO = {
  a: number; b: number; foot: number; h: number; top: number; dent: number; dentW: number; sag: number;
  rIn: number; y: number; out: (az: number) => number; lift: (az: number, t: number) => number; thick: number; taper: number; fillet: number; seg?: number;
};
/** A western hat as ONE smooth surface: the underside of the brim from where it comes out of the skin, the rounded
 *  edge, the top of the brim, up the crown and over its creased top. PartKit.brim cannot make this brim (its slope is
 *  the same all round the head) and a lathe cannot make this crown (it is not round), so the shape is built here.
 *  Why one surface that starts at the skin: a crown that stands in the head on a hidden foot (the way a lathe-turned
 *  crown is put on) and a brim with a hidden root both lie just under the skin, and where such a hidden wall is edge
 *  on to the camera the renderer's depth error lets one pixel of it show through the hair. So nothing of this hat is
 *  inside the head: its only open edge runs just under the skin (the ball of radius 1 in head units).
 *  toM = PartKit.toM: every point goes through the head's own shape and the hat's tilt, so the hat sits on any head
 *  the way it sits on a round one. uv.y = 0 on the brim, then the height above the brim / h (for a band painted round
 *  the crown). One vertex per position. Use it with PartKit.solid("head", ...), left at the head's origin. */
const westernHat = (toM: (v: THREE.Vector3) => THREE.Vector3, o: WesternO) => {
  const NA = o.seg ?? 72, NU = 7, NE = 6, NB = 7, NC = 4, NW = 4, NF = 6, NT = 9, SKIN = 0.985, tau = o.top;
  const pos: number[] = [], uv: number[] = [], up: number[] = [], idx: number[] = [], v = new THREE.Vector3();
  // the crown's profile above the brim, in units of (its foot radius, h): the wall leans in to P0, the shoulder turns
  // over to P1, the top runs in to the middle
  const P0 = [tau + (1 - tau) * 0.3, 0.7], C = [tau, 1], P1 = [tau * 0.62, 1];
  let NP = 0;
  for (let i = 0; i < NA; i++) {
    const a = -Math.PI + (2 * Math.PI * i) / NA, az = (a * 180) / Math.PI, sn = Math.sin(a), cs = Math.cos(a);
    const rc = 1 / Math.hypot(sn / o.a, cs / o.b), rE = o.out(az);                       // toward a: the crown's foot radius, the brim's edge radius
    const put = (r: number, y: number, tv: number, out = 1) => { toM(v.set(r * sn, y, r * cs)); pos.push(v.x, v.y, v.z); uv.push(i / NA, tv); up.push(out); };   // out: see sunkHull
    // the brim: its middle line, the direction it runs in (it leans as the brim rolls up), its two faces
    const mid = (t: number) => [o.rIn + (rE - o.rIn) * t, o.y + o.lift(az, t)], tAt = (r: number) => (r - o.rIn) / (rE - o.rIn);
    const dir = (t: number) => { const p = mid(Math.max(0, t - 1e-3)), q = mid(Math.min(1, t + 1e-3)), l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; return [(q[0] - p[0]) / l, (q[1] - p[1]) / l]; };
    const half = (t: number) => (o.thick * (1 + (o.taper - 1) * t)) / 2;
    const face = (t: number, s: number) => { const [r, y] = mid(t), [dr, dy] = dir(t), h = s * half(t); return [r - dy * h, y + dr * h]; };   // s = 1: the top, -1: the underside
    let t0 = 0;                                                                          // where the underside comes out of the skin
    if (Math.hypot(...face(0, -1)) < SKIN) { let hi = 1; for (let k = 0; k < 24; k++) { const m = (t0 + hi) / 2; if (Math.hypot(...face(m, -1)) < SKIN) t0 = m; else hi = m; } }
    // the crown: its wall's radius at a height (below the shoulder), and a point of it by profile place (rho, eta)
    const wallR = (y: number) => rc * (1 - (1 - tau) * Math.min(1, Math.max(0, (y - o.foot) / o.h)));
    const crown = (rho: number, eta: number) => {
      const r = rc * rho, x = r * sn, z = r * cs, w = smooth((eta - 0.4) / 0.6), s = Math.min(1, Math.abs(z) / (o.b * tau));
      return [r, o.foot + o.h * eta * (1 - w * o.sag * (1 - s * s)) - w * o.dent * Math.exp(-((x / o.dentW) ** 2))];
    };
    // the corner K where the top of the brim meets the wall, rounded from A (on the brim) to B (on the wall)
    let K = face(tAt(rc), 1); K = face(tAt(wallR(K[1])), 1);
    const tA = tAt(wallR(K[1]) + o.fillet), A = face(tA, 1), B = [wallR(K[1] + o.fillet), K[1] + o.fillet], etaB = (B[1] - o.foot) / o.h, band = (y: number) => Math.max(0, (y - K[1]) / o.h);
    const n0 = pos.length / 3;
    for (let k = 0; k <= NU; k++) { const p = face(t0 + ((1 - t0) * k) / NU, -1); put(p[0], p[1], 0, k === NU ? 1 : 0); }                                    // underside, skin -> edge
    for (let j = 1; j < NE; j++) { const an = -Math.PI / 2 + (Math.PI * j) / NE, c = Math.cos(an), s = Math.sin(an), [r, y] = mid(1), [dr, dy] = dir(1), h = half(1); put(r + (dr * c - dy * s) * h, y + (dy * c + dr * s) * h, 0); }
    for (let k = 0; k <= NB; k++) { const p = face(1 - ((1 - tA) * k) / NB, 1); put(p[0], p[1], 0, k === 0 ? 1 : 0); }                                      // top of the brim, edge -> A
    for (let k = 1; k <= NC; k++) { const t = k / NC, s = 1 - t, y = s * s * A[1] + 2 * s * t * K[1] + t * t * B[1]; put(s * s * A[0] + 2 * s * t * K[0] + t * t * B[0], y, band(y), t); }
    for (let k = 1; k <= NW; k++) { const eta = etaB + ((P0[1] - etaB) * k) / NW, p = crown(1 - (1 - tau) * eta, eta); put(p[0], p[1], band(p[1])); }   // the wall, B -> P0
    for (let k = 1; k <= NF; k++) { const t = k / NF, s = 1 - t, p = crown(s * s * P0[0] + 2 * s * t * C[0] + t * t * P1[0], s * s * P0[1] + 2 * s * t * C[1] + t * t * P1[1]); put(p[0], p[1], band(p[1])); }
    for (let k = 1; k < NT; k++) { const p = crown(P1[0] * (1 - k / NT), 1); put(p[0], p[1], 1); }                                         // the top, toward the middle
    NP = pos.length / 3 - n0;
  }
  const apex = NA * NP, top = o.foot + o.h * (1 - o.sag) - o.dent;
  toM(v.set(0, top, 0)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1); up.push(1);
  for (let i = 0; i < NA; i++) {
    const i1 = (i + 1) % NA;
    for (let j = 0; j < NP - 1; j++) { const a = i * NP + j, b = i1 * NP + j, c = a + 1, d = b + 1; idx.push(a, b, c, b, d, c); }
    idx.push(i * NP + NP - 1, i1 * NP + NP - 1, apex);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  // the ink hull: the brim's two flat faces lie inside the brim; the outline comes out at the rim of the free edge
  // and, over the rounding at the crown's foot, for the crown
  return sunkHull(g, up);
};

/** A cowboy hat, perched on the crown and tipped a little (the cowboy, the adventurer, the sheriff): a tall crown with
 *  a crease along its top from front to back, a wide brim that rolls up at both sides, a darker band. The look's own
 *  hair stays as drawn. tilt = degrees toward the person's left. */
export const cowboyHat = (o: { col?: string; band?: string; tilt?: number } = {}): Acc => {
  const col = o.col ?? "#a9773f", band = o.band ?? "#5a3620", tilt = o.tilt ?? 5;
  return {
    name: "cowboyHat", slots: ["hat", "crown"], key: `${col}|${band}|${tilt}`,
    hat: { rim: 36, hair: "keep", shade: false },
    build(b) {
      b.tilt(tilt, 0);
      // the band is painted on: the lowest quarter of the crown (v = 0 on the brim, see westernHat)
      const map = b.tex(8, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 256); g.fillStyle = band; g.fillRect(0, 256 * (1 - 0.285), 8, 256 * 0.27); }, `cowboyHat|${col}|${band}`);
      // the brim: rolled up at both sides; longest over the face, where it dips; turned up a little over the neck (it
      // stays clear of a ponytail)
      const side = (az: number) => Math.sin(rad(az)) ** 2, front = (az: number) => Math.cos(rad(az));
      // (the brim's shadow on the head: its edge over the face; at the sides the brim is rolled up and shades nothing)
      b.shadow({ y: 0.77, r: 1.08, rSide: 0.9 });
      b.solid("head", westernHat(b.toM, {
        a: 0.58, b: 0.64, foot: 0.74, h: 1.08, top: 0.84, dent: 0.24, dentW: 0.23, sag: 0.1,
        rIn: 0.46, y: 0.84, thick: 0.1, taper: 0.85, fillet: 0.05,
        out: (az) => 1.05 + 0.03 * front(az) - 0.03 * side(az),
        lift: (az, t) => 0.26 * side(az) * t * t + (1 - side(az)) * (front(az) > 0 ? -0.07 * front(az) * t : -0.08 * front(az) * t * t),
      }), { map });
    },
  };
};

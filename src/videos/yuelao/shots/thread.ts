// THE RED THREADS AS THINGS WITH WEIGHT. A thread in this film is never a line drawn through the air from A to B: it
// lies on what is under it, hangs with its slack between the two things that hold it, is drawn straight only when
// someone pulls it, sits snug round what it is tied to, and when it breaks its two halves spring back and fall.
// Every function returns the points of one thread for this frame (world), for w.props.thread(key, pts, opts).
//   lay      lying on the ground along a path (it follows the ground: over a step's edge and down its riser)
//   droop    held at both ends with slack: sags; where the sag would go under the ground it lies on it
//   taut     pulled straight; a pluck makes it sing for a second
//   recoil   one half of a thread that has just snapped: springs toward its anchor, falls, hangs or lies there
//   anklet   a loop tied snug round an ankle;  bowKnot  the bow of that tie
//   join     several pieces as one run of points
import * as THREE from "three";
import { ISLAND, STREET } from "../places";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
/** the ground's height under a world point */
export type Floor = (x: number, z: number) => number;
export const FLAT: Floor = () => 0;
/** the street: the pavement, the three steps up to the landing, the two cheek walls beside them (world x) */
export const STREET_FLOOR: Floor = (x, z) => {
  const lx = x - ISLAND.street, s = STREET.steps;
  if (z > s.front) return 0;
  if (lx < s.x0 || lx > s.x1) return lx >= s.x0 - 0.24 && lx <= s.x1 + 0.24 ? s.landingY + 0.1 : 0;
  return Math.min(s.n, Math.floor((s.front - z) / s.run + 1e-6) + 1) * s.rise;
};
export const R = 0.007;

/** A THREAD LYING ON THE GROUND along a path of points (their heights are ignored: the ground decides). It wanders a
 *  little off the straight line (wander m, seeded; none at its two ends), and where the ground steps up or down it goes
 *  over the edge and down the riser. */
export const lay = (path: THREE.Vector3[], floor: Floor = FLAT, o: { r?: number; step?: number; wander?: number; seed?: number } = {}): THREE.Vector3[] => {
  const r = o.r ?? R, step = o.step ?? 0.07, amp = o.wander ?? 0.018, seed = o.seed ?? 1;
  if (path.length < 2) return path.map((p) => p.clone());
  const curve = new THREE.CatmullRomCurve3(path.map((p) => V(p.x, 0, p.z)), false, "centripetal");
  const L = curve.getLength(), n = Math.max(2, Math.ceil(L / step)), pts: THREE.Vector3[] = [];
  let prev: THREE.Vector3 | null = null, prevY = 0;
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = curve.getPointAt(u), tg = curve.getTangentAt(u), e = Math.sin(Math.PI * u);
    const m = amp * e * (0.6 * Math.sin(u * L * 5.1 + seed * 1.7) + 0.4 * Math.sin(u * L * 11.3 + seed * 4.1));
    const x = p.x + tg.z * m, z = p.z - tg.x * m, y = floor(x, z) + r;
    if (prev && Math.abs(y - prevY) > 0.03) {
      // an edge between the last point and this one: find it, then hang the thread down the riser
      const here = V(x, 0, z);
      let a = 0, b = 1;
      for (let k = 0; k < 14; k++) { const mid = (a + b) / 2, q = prev.clone().lerp(here, mid); if (Math.abs(floor(q.x, q.z) + r - prevY) > 0.015) b = mid; else a = mid; }
      const dir = here.clone().sub(prev).normalize(), down = y < prevY, hi = Math.max(y, prevY), lo = Math.min(y, prevY);
      const edge = prev.clone().lerp(here, (a + b) / 2), out = down ? 0.014 : -0.014;
      const top = edge.clone().addScaledVector(dir, -out * 0.3).setY(hi), foot = edge.clone().addScaledVector(dir, out).setY(lo), mid = edge.clone().addScaledVector(dir, out).setY((hi + lo) / 2);
      if (down) pts.push(top, mid, foot); else pts.push(foot, mid, top);
    }
    pts.push(V(x, y, z)); prev = V(x, 0, z); prevY = y;
  }
  return pts;
};
/** A THREAD HELD AT BOTH ENDS WITH SLACK (extra length as a share of the span): it sags like a hanging chain, and where
 *  the sag would go under the ground it lies on the ground instead. sway = a slow swing sideways (m). */
export const droop = (a: THREE.Vector3, b: THREE.Vector3, slack = 0.08, floor: Floor = FLAT, o: { r?: number; n?: number; sway?: number } = {}): THREE.Vector3[] => {
  const r = o.r ?? R, n = o.n ?? 14, d = a.distanceTo(b), sag = d * Math.sqrt(0.375 * Math.max(0, slack)), pts: THREE.Vector3[] = [];
  const side = V(b.z - a.z, 0, a.x - b.x).normalize();
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = a.clone().lerp(b, u), bell = 4 * u * (1 - u);
    p.y -= sag * bell;
    if (o.sway) p.addScaledVector(side, o.sway * bell);
    const g = floor(p.x, p.z) + r;
    if (p.y < g) p.y = g;
    pts.push(p);
  }
  return pts;
};
/** A THREAD PULLED STRAIGHT between two points. plucks = frames at which it is plucked or jerked: it then swings a few
 *  centimetres across (amp) and dies down within a second. sag = a little weight left in it (m). */
export const taut = (a: THREE.Vector3, b: THREE.Vector3, f = 0, plucks: number[] = [], o: { amp?: number; sag?: number; n?: number } = {}): THREE.Vector3[] => {
  const n = o.n ?? 8, amp = o.amp ?? 0.025, pts: THREE.Vector3[] = [];
  let w = 0;
  for (const on of plucks) { const d = f - on; if (d >= 0 && d < 36) w += amp * Math.exp(-d / 8) * Math.cos(d * 2.2); }
  for (let i = 0; i <= n; i++) { const u = i / n, p = a.clone().lerp(b, u), bell = Math.sin(Math.PI * u); p.y += w * bell - (o.sag ?? 0) * 4 * u * (1 - u); pts.push(p); }
  return pts;
};
/** ONE HALF OF A THREAD THAT HAS JUST SNAPPED: it ran from `anchor` to `tip` (the break); d = frames since the break.
 *  The free end springs back toward the anchor, then falls: at rest the thread hangs straight down from its anchor and
 *  whatever does not fit lies on the ground toward where it came from. */
export const recoil = (anchor: THREE.Vector3, tip: THREE.Vector3, d: number, floor: Floor = FLAT, o: { r?: number; n?: number; whip?: number } = {}): THREE.Vector3[] => {
  const r = o.r ?? R, n = o.n ?? 12, L = anchor.distanceTo(tip);
  const g = floor(anchor.x, anchor.z) + r, dropH = Math.max(0, anchor.y - g);
  const flat = V(tip.x - anchor.x, 0, tip.z - anchor.z), fl = flat.length() || 1; flat.multiplyScalar(1 / fl);
  const rest = dropH >= L ? anchor.clone().add(V(flat.x * 0.02, -L, flat.z * 0.02)) : V(anchor.x + flat.x * (L - dropH) * 0.6, g, anchor.z + flat.z * (L - dropH) * 0.6);
  if (d <= 0) return taut(anchor, tip, 0, [], { n });
  const e = smooth(d / 13), side = V(-flat.z, 0, flat.x), whip = (o.whip ?? 0.12) * L * Math.exp(-d / 6) * Math.sin(d * 0.95);
  const end = tip.clone().lerp(rest, e).addScaledVector(side, whip * 0.6);
  // the fall is quicker than the swing in: gravity
  end.y = tip.y + (rest.y - tip.y) * Math.min(1, (d / 11) ** 2);
  const slackNow = Math.max(0, L - anchor.distanceTo(end)), ctrl = anchor.clone().lerp(end, 0.5).add(V(0, -0.7 * slackNow, 0)).addScaledVector(side, whip);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = anchor.clone().multiplyScalar((1 - u) * (1 - u)).addScaledVector(ctrl, 2 * u * (1 - u)).addScaledVector(end, u * u), gg = floor(p.x, p.z) + r;
    if (p.y < gg) p.y = gg;
    pts.push(p);
  }
  return pts;
};
/** A LOOP TIED SNUG ROUND AN ANKLE (c = the ankle's centre; the rig's leg is a thin stick, so r is about 2 cm): a closed
 *  ring, a touch tilted. Draw with { closed: true }. */
export const anklet = (c: THREE.Vector3, r = 0.02, tilt = 0.22, yaw = 0): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pts.push(c.clone().add(V(Math.cos(a) * r, Math.sin(a + yaw) * r * tilt, Math.sin(a) * r))); }
  return pts;
};
/** the point on an anklet where its knot sits: on the side `dir` (a flat direction) */
export const knotAt = (c: THREE.Vector3, dir: THREE.Vector3, r = 0.02) => c.clone().addScaledVector(V(dir.x, 0, dir.z).normalize(), r + 0.004);
/** THE BOW of a tie at point k (knotAt): two small loops lying across `dir`, as one closed figure of eight. Draw with
 *  { closed: true }. size = one loop's length (m). */
export const bowKnot = (k: THREE.Vector3, dir: THREE.Vector3, size = 0.03): THREE.Vector3[] => {
  const d = V(dir.x, 0, dir.z).normalize(), t = V(-d.z, 0, d.x), pts: THREE.Vector3[] = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; pts.push(k.clone().addScaledVector(t, size * Math.sin(a)).add(V(0, size * 0.42 * Math.sin(2 * a) - 0.004 * Math.abs(Math.sin(a)), 0)).addScaledVector(d, 0.004)); }
  return pts;
};
/** several runs of points as one (a point that repeats the last one is dropped) */
export const join = (...runs: THREE.Vector3[][]): THREE.Vector3[] => {
  const out: THREE.Vector3[] = [];
  for (const run of runs) for (const p of run) if (!out.length || out[out.length - 1].distanceTo(p) > 0.004) out.push(p);
  return out;
};
/** the first `k` (0..1) of a run by length: a thread being paid out or reeled in */
export const part = (pts: THREE.Vector3[], k: number): THREE.Vector3[] => {
  if (k >= 1 || pts.length < 2) return pts;
  const ds: number[] = [0];
  for (let i = 1; i < pts.length; i++) ds.push(ds[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const want = Math.max(0.001, k) * ds[ds.length - 1], out: THREE.Vector3[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (ds[i] <= want) { out.push(pts[i]); continue; }
    out.push(pts[i - 1].clone().lerp(pts[i], (want - ds[i - 1]) / (ds[i] - ds[i - 1]))); break;
  }
  return out;
};
